import os
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User
from backend.config import load_environment

APP_ENV = load_environment()

# Configuration
# For local dev we allow a deterministic fallback secret to keep the app runnable.
# In production you MUST set SECRET_KEY.
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if APP_ENV == "production":
        raise RuntimeError("SECRET_KEY environment variable is not set. Set it before starting the server.")
    SECRET_KEY = "dev-secret-change-me"
    print("[WARN] SECRET_KEY not set; using insecure dev fallback. Set SECRET_KEY for real deployments.")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Fix for passlib/bcrypt on newer Python versions
try:
    import bcrypt
    # Direct monkeypatch of bcrypt for passlib 1.7.4 compatibility with bcrypt 4.0+
    _orig_hashpw = bcrypt.hashpw
    def _patched_hashpw(password, salt):
        if isinstance(password, str):
            password = password.encode('utf-8')
        if isinstance(salt, str):
            salt = salt.encode('utf-8')
        # bcrypt has a 72-byte limit for the password
        if len(password) > 72:
            password = password[:72]
        return _orig_hashpw(password, salt)
    bcrypt.hashpw = _patched_hashpw
except ImportError:
    pass
# Allow missing Authorization header so we can fall back to cookie-based auth
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Frontend compatibility: accept either Authorization: Bearer <token>
    # or an HttpOnly cookie named "token".
    if not token:
        token = request.cookies.get("token")
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role: {user.role}. Required: {self.allowed_roles}"
            )
        return user
