from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.auth import RoleChecker, get_current_user
from backend.database import get_db
from backend.models import Attachment, Complaint, User
from backend.services.minio_client import get_presigned_upload_url

router = APIRouter(prefix="/cases", tags=["Cases"])


def _case_to_dict(case: Complaint) -> dict:
    return {
        "id": case.case_id,
        "case_id": case.case_id,
        "title": case.title,
        "description": case.description,
        "status": case.status,
        "issue_type": case.issue_type,
        "complainant_name": case.complainant_name,
        "email": case.email,
        "phone": case.phone,
        "location_text": case.location_text,
        "created_at": case.created_at.isoformat() if case.created_at else None,
        "updated_at": case.updated_at.isoformat() if case.updated_at else None,
        "ai_answer": case.ai_answer,
        "ai_context": case.ai_context,
    }


@router.get("")
def list_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Complaint)
    if current_user.role not in ["admin", "lawyer"]:
        query = query.filter(Complaint.user_id == current_user.id)
    return [_case_to_dict(c) for c in query.order_by(Complaint.created_at.desc()).all()]


@router.post("")
def create_case(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    title = payload.get("title") or "Untitled case"
    description = payload.get("description") or ""
    latest_count = db.query(Complaint).count() + 1
    case_id = f"CASE-{latest_count:06d}"
    case = Complaint(
        case_id=case_id,
        title=title,
        description=description,
        status="SUBMITTED",
        user_id=current_user.id,
        complainant_name=current_user.full_name or current_user.email,
        email=current_user.email,
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return _case_to_dict(case)


@router.get("/{id}")
def get_case(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = db.query(Complaint).filter(Complaint.case_id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role not in ["admin", "lawyer"] and case.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    data = _case_to_dict(case)
    attachments = db.query(Attachment).filter(Attachment.case_id == id).all()
    data["documents"] = [
        {
            "id": str(a.id),
            "filename": a.filename,
            "storage_path": a.storage_path,
            "file_type": a.file_type,
            "is_safe": a.is_safe,
        }
        for a in attachments
    ]
    return data


@router.put("/{id}")
def update_case(
    id: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = db.query(Complaint).filter(Complaint.case_id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role not in ["admin", "lawyer"] and case.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if "title" in payload:
        case.title = payload["title"]
    if "description" in payload:
        case.description = payload["description"]
    if "status" in payload:
        case.status = payload["status"]
    db.commit()
    db.refresh(case)
    return _case_to_dict(case)


@router.delete("/{id}")
def delete_case(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "lawyer", "user"])),
):
    case = db.query(Complaint).filter(Complaint.case_id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role not in ["admin", "lawyer"] and case.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(case)
    db.commit()
    return {"status": "deleted", "id": id}


@router.post("/{id}/documents")
def create_case_document_upload(
    id: str,
    file_name: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = db.query(Complaint).filter(Complaint.case_id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role not in ["admin", "lawyer"] and case.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    storage_path = f"{id}/{file_name}"
    attachment = Attachment(
        case_id=id,
        filename=file_name,
        storage_path=storage_path,
        file_type=file_name.rsplit(".", 1)[-1] if "." in file_name else "",
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    upload_url = get_presigned_upload_url("attachments", storage_path, expiration=300)
    if not upload_url:
        raise HTTPException(status_code=503, detail="Storage unavailable")
    return {
        "attachment_id": str(attachment.id),
        "upload_url": upload_url,
        "storage_path": storage_path,
    }


@router.post("/{id}/analyze")
def analyze_case(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = db.query(Complaint).filter(Complaint.case_id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role not in ["admin", "lawyer"] and case.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        from backend.ai.rag_pipeline import run_rag_pipeline

        result = run_rag_pipeline(case.description or case.title or "")
        case.ai_context = result.get("retrieved_context", "")
        case.ai_answer = result.get("answer", "")
        db.commit()
        return {
            "status": "completed",
            "case_id": id,
            "summary": case.ai_answer,
            "context": case.ai_context,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}")
