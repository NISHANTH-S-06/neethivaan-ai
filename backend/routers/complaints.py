import os
import threading
import logging

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from fastapi.responses import RedirectResponse
import shutil
from backend.database import get_db
from backend.services.minio_client import get_presigned_upload_url, get_presigned_download_url
from backend.ai.rag_pipeline import run_rag_pipeline as rag_answer
from backend.auth import get_current_user, RoleChecker
from backend.models import Complaint, Attachment, User

router = APIRouter(prefix="/complaints", tags=["Complaints"])
logger = logging.getLogger("neethivaan.complaints")
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}


def _complaint_to_dict(c: Complaint) -> dict:
    timeline = [
        {"status": "Submitted", "date": c.created_at.isoformat() if getattr(c, "created_at", None) else "", "description": "Case originated securely and encrypted in the vault."}
    ]
    if c.status and c.status.upper() != "SUBMITTED":
        timeline.append({"status": c.status, "date": c.updated_at.isoformat() if getattr(c, "updated_at", None) else "", "description": "Case has advanced in the automated pipeline."})
        
    return {
        "id": str(getattr(c, "id", "")) if getattr(c, "id", None) is not None else None,
        "user_id": str(getattr(c, "user_id", "")) if getattr(c, "user_id", None) is not None else None,
        "case_id": c.case_id,
        "title": c.title,
        "description": c.description,
        "issue_type": c.issue_type,
        "incident_date": c.incident_date.isoformat() if getattr(c, "incident_date", None) else None,
        "location_text": c.location_text,
        "lat": c.lat,
        "lng": c.lng,
        "complainant_name": c.complainant_name,
        "email": c.email,
        "phone": c.phone,
        "id_type": c.id_type,
        "id_number": c.id_number,
        "witness_name": c.witness_name,
        "witness_contact": c.witness_contact,
        "status": c.status,
        "fir_csrtype": c.fir_csrtype,
        "ai_context": c.ai_context,
        "ai_answer": c.ai_answer,
        "fir_text": c.fir_text,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        "timeline": timeline
    }

class ComplaintCreate(BaseModel):
    text: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    issue_type: Optional[str] = None
    complainant_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    id_type: Optional[str] = None
    id_number: Optional[str] = None
    location_text: Optional[str] = None
    witness_name: Optional[str] = None
    witness_contact: Optional[str] = None

def generate_case_id(db: Session) -> str:
    date_str = datetime.now().strftime("%Y%m%d")
    count = db.query(Complaint).filter(Complaint.case_id.startswith(f"NEETH-{date_str}")).count()
    return f"NEETH-{date_str}-{(count + 1):05d}"

def _run_with_timeout(fn, args=(), kwargs=None, timeout_s: float = 3.0):
    """
    Run a potentially slow AI call with a hard timeout so core CRUD stays responsive.
    Returns (ok, result_or_exc).
    """
    if kwargs is None:
        kwargs = {}
    box = {"done": False, "value": None, "exc": None}

    def _target():
        try:
            box["value"] = fn(*args, **kwargs)
        except Exception as e:
            box["exc"] = e
        finally:
            box["done"] = True

    t = threading.Thread(target=_target, daemon=True)
    t.start()
    t.join(timeout_s)
    if not box["done"]:
        return False, TimeoutError(f"operation timed out after {timeout_s}s")
    if box["exc"] is not None:
        return False, box["exc"]
    return True, box["value"]

@router.post("/")
def create_complaint(
    data: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case_id = generate_case_id(db)
    query_text = data.text or data.description or ""

    ai_context = ""
    ai_answer_text = ""
    if query_text:
        try:
            timeout_s = float(os.getenv("RAG_TIMEOUT_SECONDS", "3.0"))
            ok, rag_result = _run_with_timeout(rag_answer, args=(query_text,), timeout_s=timeout_s)
            if ok and isinstance(rag_result, dict):
                ai_context = rag_result.get("retrieved_context", "")
                ai_answer_text = rag_result.get("answer", "")
            elif not ok:
                logger.warning(f"[RAG] Skipped (non-fatal): {rag_result}")
        except Exception as e:
            logger.error(f"[RAG] Non-fatal error: {e}")


    new_complaint = Complaint(
        case_id=case_id,
        title=data.title or query_text[:100],
        description=data.description or query_text,
        issue_type=data.issue_type,
        complainant_name=data.complainant_name,
        email=data.email,
        phone=data.phone,
        id_type=data.id_type,
        id_number=data.id_number,
        location_text=data.location_text,
        witness_name=data.witness_name,
        witness_contact=data.witness_contact,
        status="SUBMITTED",
        user_id=current_user.id,
        ai_context=ai_context,
        ai_answer=ai_answer_text,
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    # FIX B-03: Celery .delay() wrapped — non-fatal if broker unavailable
    try:
        from backend.tasks import analyze_complaint_task
        analyze_complaint_task.delay(case_id)
    except Exception as e:
        logger.warning(f"[CELERY] Task dispatch skipped (broker unavailable): {e}")


    return {
        "case_id": case_id,
        "status": "SUBMITTED",
        "text": query_text,
        "ai_context": ai_context,
        "ai_answer": ai_answer_text,
    }

@router.get("/")
def list_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role in ["admin", "lawyer"]:
        items = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    else:
        items = (
            db.query(Complaint)
            .filter(Complaint.user_id == current_user.id)
            .order_by(Complaint.created_at.desc())
            .all()
        )
    return [_complaint_to_dict(c) for c in items]

@router.get("/my")
def list_my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = (
        db.query(Complaint)
        .filter(Complaint.user_id == current_user.id)
        .order_by(Complaint.created_at.desc())
        .all()
    )
    return [_complaint_to_dict(c) for c in items]

@router.get("/{case_id}/status")
def get_complaint_status(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Complaint).filter(Complaint.case_id == case_id.strip().upper()).first()
    if not case:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {
        "case_id": case.case_id,
        "status": case.status,
        "created_at": case.created_at,
        "analysis_status": "COMPLETED" if case.fir_csrtype else "PENDING"
    }

@router.get("/{case_id}")
def get_complaint(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Complaint).filter(Complaint.case_id == case_id.strip().upper()).first()
    if not case:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if current_user.role not in ["admin", "lawyer"] and case.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this case")
    return _complaint_to_dict(case)

@router.put("/{case_id}")
def update_complaint(
    case_id: str,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Complaint).filter(Complaint.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if "description" in data:
        case.description = data["description"]
    if "title" in data:
        case.title = data["title"]
    db.commit()
    return {"status": "success", "case_id": case.case_id}

@router.post("/{case_id}/attachments")
def create_attachment_url(
    case_id: str,
    file_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ext = os.path.splitext(file_name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")
    case = db.query(Complaint).filter(Complaint.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Complaint not found")
    safe_name = f"{case_id}/{file_name}"
    new_attachment = Attachment(
        case_id=case_id, filename=file_name,
        storage_path=safe_name, file_type=ext
    )
    db.add(new_attachment)
    db.commit()
    db.refresh(new_attachment)
    url = get_presigned_upload_url("attachments", safe_name, expiration=300)
    if not url:
        raise HTTPException(status_code=503, detail="Storage unavailable — cannot generate upload URL")
    return {"attachment_id": str(new_attachment.id), "upload_url": url, "storage_path": safe_name}

@router.post("/{case_id}/attachments/confirm")
def confirm_attachment(
    case_id: str,
    storage_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Complaint).filter(Complaint.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Complaint not found")
    try:
        from backend.tasks import scan_file_task
        scan_file_task.delay("attachments", storage_path, case_id)
    except Exception as e:
        logger.warning(f"[CELERY] Scan task skipped: {e}")

    return {"status": "scan_initiated", "storage_path": storage_path}

@router.post("/{case_id}/upload")
def upload_file(
    case_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Complaint).filter(Complaint.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")
        
    upload_dir = os.path.join(os.getcwd(), "data", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, f"{case_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    new_attachment = Attachment(
        case_id=case_id, filename=file.filename,
        storage_path=file_path, file_type=ext
    )
    db.add(new_attachment)
    db.commit()
    db.refresh(new_attachment)
    
    return {"status": "success", "filename": file.filename}

@router.get("/files/{token:path}")
def get_file(token: str):
    url = get_presigned_download_url("attachments", token, expiration=3600)
    if not url:
        raise HTTPException(status_code=404, detail="File not found")
    return RedirectResponse(url)
