import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from passlib.context import CryptContext
from sqlalchemy.orm import Session
from backend.database import engine, SessionLocal
from backend.models import User
import uuid
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_users():
    db = SessionLocal()
    try:
        password_hash = pwd_context.hash("password123")
        print(f"Generated hash: {password_hash}")
        print(f"Hash length: {len(password_hash)}")

        # Admin User
        admin_email = "admin@neethivaan.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if admin:
            print(f"Updating existing admin: {admin_email}")
            admin.hashed_password = password_hash
            admin.role = "admin"
            admin.onboarding_completed = True
            admin.onboarding_step = 4
        else:
            print(f"Creating new admin: {admin_email}")
            admin = User(
                id=str(uuid.uuid4()),
                email=admin_email,
                hashed_password=password_hash,
                full_name="Admin User",
                role="admin",
                is_active=True,
                onboarding_completed=True,
                onboarding_step=4,
                created_at=datetime.utcnow()
            )
            db.add(admin)

        # Lawyer User
        lawyer_email = "lawyer@neethivaan.com"
        lawyer = db.query(User).filter(User.email == lawyer_email).first()
        if lawyer:
            print(f"Updating existing lawyer: {lawyer_email}")
            lawyer.hashed_password = password_hash
            lawyer.role = "lawyer"
            lawyer.onboarding_completed = True
            lawyer.onboarding_step = 4
        else:
            print(f"Creating new lawyer: {lawyer_email}")
            lawyer = User(
                id=str(uuid.uuid4()),
                email=lawyer_email,
                hashed_password=password_hash,
                full_name="Test Lawyer",
                role="lawyer",
                is_active=True,
                onboarding_completed=True,
                onboarding_step=4,
                created_at=datetime.utcnow()
            )
            db.add(lawyer)

        # Citizen User (test@example.com)
        citizen_email = "test@example.com"
        citizen = db.query(User).filter(User.email == citizen_email).first()
        if citizen:
            print(f"Updating existing citizen: {citizen_email}")
            citizen.hashed_password = password_hash
            citizen.role = "user"
            citizen.onboarding_completed = True
            citizen.onboarding_step = 4
        else:
            print(f"Creating new citizen: {citizen_email}")
            citizen = User(
                id=str(uuid.uuid4()),
                email=citizen_email,
                hashed_password=password_hash,
                full_name="Test Citizen",
                role="user",
                is_active=True,
                onboarding_completed=True,
                onboarding_step=4,
                created_at=datetime.utcnow()
            )
            db.add(citizen)

        db.commit()
        print("SUCCESS: Admin and Lawyer users synchronized")
        print("Email: admin@neethivaan.com / Password: password123")
        print("Email: lawyer@neethivaan.com / Password: password123")

    except Exception as e:
        print(f"ERROR: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_users()
