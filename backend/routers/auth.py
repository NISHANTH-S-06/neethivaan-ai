import os
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from pydantic import BaseModel, Field
from typing import Optional
from backend.database import get_db
from backend.models import User, Notification
from backend.auth import (
    get_password_hash, 
    verify_password, 
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
)
from backend.config import load_environment

router = APIRouter(prefix="/auth", tags=["Authentication"])
APP_ENV = load_environment()

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    name: Optional[str] = None
    role: str = "user" # user, lawyer, admin

@router.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    ALLOWED_ROLES = {"user", "lawyer"}
    provided_role = data.role if data.role in ALLOWED_ROLES else "user"
    
    new_user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name or data.name or data.email.split('@')[0],
        role=provided_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"msg": "VERIFIED_CODE_SYNC_SUCCESS", "role": new_user.role, "id": str(new_user.id)}

@router.post("/login")
async def login(request: Request, response: Response, db: Session = Depends(get_db)):
    # Dual support for JSON (User tests) and Form/Multipart (Frontend)
    email = None
    password = None
    
    content_type = request.headers.get("Content-Type", "")
    if "application/json" in content_type:
        data = await request.json()
        email = data.get("email") or data.get("username")
        password = data.get("password")
    else:
        # Check for form data
        try:
            form_data = await request.form()
            email = form_data.get("username") or form_data.get("email")
            password = form_data.get("password")
        except Exception:
            pass

    if not email or not password:
        # Fallback to OAuth2 form if possible
        try:
            from fastapi.security import OAuth2PasswordRequestForm
            # This is hard to call manually, so we just check the form again
            pass 
        except: pass

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, 
        expires_delta=access_token_expires
    )
    is_production = APP_ENV == "production"
    cookie_secure = os.getenv("COOKIE_SECURE", "true" if is_production else "false").lower() == "true"
    cookie_samesite = os.getenv("COOKIE_SAMESITE", "none" if is_production else "lax").lower()
    # Phase 6: Auto create notification on login
    try:
        new_notification = Notification(
            user_id=user.id,
            message="Login successful"
        )
        db.add(new_notification)
        db.commit()
    except Exception as e:
        print(f"[WARN] Failed to create login notification: {e}")
        db.rollback()

    response.set_cookie(
        key="token",
        value=access_token,
        httponly=True,
        secure=cookie_secure,
        samesite=cookie_samesite,
        path="/",
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user": {

            "id": str(user.id),
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name,
            "onboarding_completed": user.onboarding_completed,
            "onboarding_step": user.onboarding_step,
        },
    }


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "role": current_user.role,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "onboarding_completed": current_user.onboarding_completed,
        "onboarding_step": current_user.onboarding_step,
    }
