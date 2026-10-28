from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.services.fir_service import generate_fir_text
from backend.auth import RoleChecker
from backend.models import User

router = APIRouter(prefix="/fir", tags=["FIR"])

class FIRRequest(BaseModel):
    case_id: str

@router.get("/")
def list_firs(db: Session = Depends(get_db)):
    return []

@router.post("/generate")
def generate_fir(
    data: FIRRequest, 
    db: Session = Depends(get_db),
    lawyer: User = Depends(RoleChecker(["admin", "lawyer"]))
):
    try:
        fir_text = generate_fir_text(data.case_id, db)
        return {"fir_text": fir_text}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
