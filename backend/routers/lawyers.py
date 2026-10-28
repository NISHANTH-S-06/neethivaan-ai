from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.auth import RoleChecker, get_current_user
from backend.database import get_db
from backend.models import Lawyer, User

router = APIRouter(prefix="/lawyers", tags=["Lawyers"])


@router.get("")
def list_lawyers(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = (
        db.query(Lawyer, User)
        .join(User, Lawyer.user_id == User.id)
        .filter(User.is_active.is_(True))
        .all()
    )
    return [
        {
            "id": str(l.id),
            "user_id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "specialization": l.specialization,
            "bio": l.bio,
            "is_available": l.is_available,
        }
        for l, u in rows
    ]


@router.get("/{id}")
def get_lawyer(id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    row = db.query(Lawyer, User).join(User, Lawyer.user_id == User.id).filter(Lawyer.id == id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    lawyer, user = row
    return {
        "id": str(lawyer.id),
        "user_id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "specialization": lawyer.specialization,
        "bio": lawyer.bio,
        "is_available": lawyer.is_available,
    }


@router.put("/{id}")
def update_lawyer(
    id: str,
    payload: dict,
    db: Session = Depends(get_db),
    _: User = Depends(RoleChecker(["admin", "lawyer"])),
):
    lawyer = db.query(Lawyer).filter(Lawyer.id == id).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    if "specialization" in payload:
        lawyer.specialization = payload["specialization"]
    if "bio" in payload:
        lawyer.bio = payload["bio"]
    if "is_available" in payload:
        lawyer.is_available = bool(payload["is_available"])
    db.commit()
    db.refresh(lawyer)
    return {
        "id": str(lawyer.id),
        "user_id": str(lawyer.user_id),
        "specialization": lawyer.specialization,
        "bio": lawyer.bio,
        "is_available": lawyer.is_available,
    }
