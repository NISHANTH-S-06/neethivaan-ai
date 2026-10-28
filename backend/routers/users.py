from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.auth import get_current_user
from backend.database import get_db
from backend.models import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "onboarding_completed": current_user.onboarding_completed,
        "onboarding_step": current_user.onboarding_step,
    }


@router.put("/me")
def update_me(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if "full_name" in payload:
        current_user.full_name = payload["full_name"]
    if "email" in payload:
        current_user.email = payload["email"]
    db.commit()
    db.refresh(current_user)
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "onboarding_completed": current_user.onboarding_completed,
        "onboarding_step": current_user.onboarding_step,
    }


@router.put("/onboarding")
async def update_onboarding(
    data: dict,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    step = data.get("step", 0)
    completed = data.get("completed", False)
    
    if hasattr(user, 'onboarding_step'):
        user.onboarding_step = step
    if hasattr(user, 'onboarding_completed'):
        user.onboarding_completed = completed
    
    db.commit()
    db.refresh(user)
    return {"success": True, "step": step, "completed": completed}

@router.get("/onboarding/status")
async def get_onboarding_status(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    completed = getattr(user, 'onboarding_completed', True)
    step = getattr(user, 'onboarding_step', 4)
    return {"completed": completed, "step": step}
