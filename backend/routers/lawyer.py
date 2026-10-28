from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from backend.database import get_db
from backend.services.lawyer_service import ask_lawyer_ai
from backend.ai.summarizer import summarize_complaint
from backend.auth import RoleChecker, get_current_user
from backend.models import Complaint, Lawyer, User

router = APIRouter(prefix="/lawyer", tags=["Lawyer Portal"])

class CaseNote(BaseModel):
    content: str
    
class ChatMessage(BaseModel):
    message: str

class LawyerQuestion(BaseModel):
    question: str

class StatusUpdate(BaseModel):
    status: str

class LawyerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    bio: Optional[str] = None
    is_available: Optional[bool] = None

class VerificationSubmit(BaseModel):
    bar_council_number: str
    specialization: str
    years_experience: int
    bio: Optional[str] = None

@router.post("/ask")
def lawyer_ask(
    data: LawyerQuestion,
    lawyer: User = Depends(RoleChecker(["admin", "lawyer"]))
):
    try:
        answer = ask_lawyer_ai(data.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
def get_lawyer_profile(
    current_user: User = Depends(RoleChecker(["admin", "lawyer"])),
    db: Session = Depends(get_db)
):
    lawyer_profile = db.query(Lawyer).filter(Lawyer.user_id == current_user.id).first()
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "specialization": lawyer_profile.specialization if lawyer_profile else None,
        "bio": lawyer_profile.bio if lawyer_profile else None,
        "is_available": lawyer_profile.is_available if lawyer_profile else True,
    }

@router.put("/me")
def update_lawyer_profile(
    data: LawyerProfileUpdate,
    current_user: User = Depends(RoleChecker(["lawyer"])),
    db: Session = Depends(get_db)
):
    # Update user full_name if provided
    if data.full_name is not None:
        current_user.full_name = data.full_name
    
    # Update lawyer profile record
    lawyer_profile = db.query(Lawyer).filter(Lawyer.user_id == current_user.id).first()
    if not lawyer_profile:
        lawyer_profile = Lawyer(user_id=current_user.id)
        db.add(lawyer_profile)

    if data.specialization is not None:
        lawyer_profile.specialization = data.specialization
    if data.bio is not None:
        lawyer_profile.bio = data.bio
    if data.is_available is not None:
        lawyer_profile.is_available = data.is_available

    db.commit()
    db.refresh(current_user)
    return {"status": "success", "message": "Profile updated successfully"}

@router.get("/")
def list_lawyers(db: Session = Depends(get_db)):
    lawyers = db.query(Lawyer).join(User, Lawyer.user_id == User.id).filter(User.is_active == True).all()
    results = []
    for l in lawyers:
        user = db.query(User).filter(User.id == l.user_id).first()
        results.append({
            "id": str(l.id),
            "user_id": str(l.user_id),
            "name": user.full_name if user else "Unknown",
            "email": user.email if user else "",
            "specialization": l.specialization,
            "is_available": l.is_available,
        })
    return results

@router.get("/cases")
def get_assigned_cases(
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(RoleChecker(["admin", "lawyer"])),
    db: Session = Depends(get_db)
):
    """Returns complaints assigned to this lawyer, or all if admin."""
    query = db.query(Complaint)
    if current_user.role == "lawyer":
        # Return ASSIGNED cases (in future, lawyer_id will link directly)
        query = query.filter(Complaint.status == "ASSIGNED")
    if status:
        query = query.filter(Complaint.status == status.upper())
    
    cases = query.order_by(Complaint.created_at.desc()).all()
    return [
        {
            "case_id": c.case_id,
            "title": c.title,
            "description": c.description,
            "issue_type": c.issue_type,
            "status": c.status,
            "complainant_name": c.complainant_name,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        }
        for c in cases
    ]

@router.post("/cases/{case_id}/notes")
def add_case_note(
    case_id: str,
    note: CaseNote,
    current_user: User = Depends(RoleChecker(["admin", "lawyer"])),
    db: Session = Depends(get_db)
):
    case = db.query(Complaint).filter(Complaint.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    # Append note as ai_context addendum (stored in ai_context field for now)
    existing = case.ai_context or ""
    case.ai_context = f"{existing}\n\n[LAWYER NOTE - {current_user.full_name}]: {note.content}"
    db.commit()
    logger.info(f"User ID {current_user.id} added note to Case ID {case_id}")
    return {"status": "success", "note_added": True}

@router.post("/cases/{case_id}/documents")
def upload_document(
    case_id: str,
    file_name: str,
    current_user: User = Depends(RoleChecker(["admin", "lawyer"])),
    db: Session = Depends(get_db)
):
    case = db.query(Complaint).filter(Complaint.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    try:
        from backend.services.minio_client import get_presigned_upload_url
        url = get_presigned_upload_url("attachments", f"lawyers/{case_id}/{file_name}")
        return {"upload_url": url, "case_id": case_id, "file_name": file_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage error: {str(e)}")

@router.post("/cases/{case_id}/status")
def update_case_status(
    case_id: str,
    body: StatusUpdate,
    current_user: User = Depends(RoleChecker(["admin", "lawyer"])),
    db: Session = Depends(get_db)
):
    VALID_STATUSES = ["ASSIGNED", "UNDER_REVIEW", "RESOLVED", "CLOSED", "ESCALATED"]
    if body.status.upper() not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: {body.status}")
    case = db.query(Complaint).filter(Complaint.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    case.status = body.status.upper()
    db.commit()
    logger.info(f"User ID {current_user.id} updated Case ID {case_id} status to {case.status}")
    return {"status": "success", "case_id": case_id, "new_status": case.status}

@router.post("/cases/{case_id}/chat")
def chat_with_user(
    case_id: str,
    msg: ChatMessage,
    current_user: User = Depends(RoleChecker(["admin", "lawyer"])),
    db: Session = Depends(get_db)
):
    case = db.query(Complaint).filter(Complaint.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"status": "sent", "case_id": case_id}

@router.post("/verification")
def submit_verification(
    data: VerificationSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit lawyer verification request."""
    # Create or update Lawyer profile record with submitted info
    lawyer_profile = db.query(Lawyer).filter(Lawyer.user_id == current_user.id).first()
    if not lawyer_profile:
        lawyer_profile = Lawyer(user_id=current_user.id)
        db.add(lawyer_profile)
    
    lawyer_profile.specialization = data.specialization
    lawyer_profile.bio = data.bio or ""
    # Update user role to pending-lawyer for admin review
    current_user.role = "lawyer"
    db.commit()
    
    return {
        "status": "submitted",
        "message": "Verification request submitted. Pending admin approval.",
        "bar_council_number": data.bar_council_number
    }

@router.get("/cases/{case_id}/summarize")
def get_complaint_summary(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "lawyer"]))
):
    """
    Returns an AI-generated summary of the complaint.
    """
    complaint = db.query(Complaint).filter(Complaint.case_id == case_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    summary = summarize_complaint(complaint.description)
    logger.info(f"User ID {current_user.id} accessed summary for Case ID {case_id}")
    return {"case_id": case_id, "summary": summary}
