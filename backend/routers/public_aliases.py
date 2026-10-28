from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.auth import get_current_user
from backend.models import Attachment, Complaint, User, Law
from backend.services.minio_client import get_presigned_upload_url


router = APIRouter(tags=["Public Aliases"])

@router.get("/awareness/articles")
def get_awareness_articles(db: Session = Depends(get_db)):
    laws = db.query(Law).all()
    return [{"title": law.title, "slug": law.code, "type": "Law"} for law in laws]




@router.api_route("/login", methods=["GET", "POST"])
def login_alias():
    # Keep /login working while real API remains under /api/auth/login
    return RedirectResponse(url="/api/auth/login", status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@router.api_route("/signup", methods=["GET", "POST"])
def signup_alias():
    return RedirectResponse(url="/api/auth/register", status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@router.api_route("/cases", methods=["GET", "POST"])
def cases_alias():
    return RedirectResponse(url="/api/cases", status_code=status.HTTP_307_TEMPORARY_REDIRECT)


class UploadRequest(BaseModel):
    case_id: str
    file_name: str


@router.post("/upload")
def upload_alias(
    payload: UploadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Convenience endpoint expected by some clients.

    Creates an Attachment row for a Complaint (case_id) and returns a presigned upload URL.
    Under the hood this maps to the existing complaint/case attachment flow.
    """
    case_id = payload.case_id.strip().upper()
    file_name = payload.file_name.strip()
    if not case_id or not file_name:
        raise HTTPException(status_code=400, detail="case_id and file_name are required")

    case = db.query(Complaint).filter(Complaint.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if current_user.role not in ["admin", "lawyer"] and case.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    storage_path = f"{case_id}/{file_name}"
    attachment = Attachment(
        case_id=case_id,
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

