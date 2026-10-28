import json
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.auth import RoleChecker
from backend.models import AuditLog, User, Complaint, Lawyer
from backend.ai.insights import get_admin_insights

router = APIRouter(prefix="/admin", tags=["Admin"])

require_admin = RoleChecker(["admin"])


@router.get("/audit-logs")
def get_audit_logs(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Returns the latest audit log entries, paginated.
    Admin-only endpoint. Requires role=admin.
    """

    offset = (page - 1) * limit

    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    result = []
    for log in logs:
        # Deserialize JSON metadata string back to dict if present
        meta = None
        if log.extra_metadata:
            try:
                meta = json.loads(log.extra_metadata)
            except (json.JSONDecodeError, TypeError):
                meta = {"raw": log.extra_metadata}

        result.append(
            {
                "id": str(log.id),
                "action": log.action,
                "target_type": log.target_type or "",
                "target_id": log.target_id or "",
                "actor_id": str(log.actor_id) if log.actor_id else "",
                "actor_name": log.actor_name or "",
                "actor_role": log.actor_role or "",
                "timestamp": log.timestamp.isoformat() if log.timestamp else "",
                "metadata": meta,
            }
        )

    return result


@router.get("/users")
def get_users(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Returns all registered users with pagination.
    Admin-only endpoint.
    """
    offset = (page - 1) * limit
    users = db.query(User).offset(offset).limit(limit).all()
    
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.put("/users/{user_id}/approve")
def approve_user(
    user_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    if user.role == "user":
        user.role = "lawyer"
    db.commit()
    db.refresh(user)
    return {
        "status": "approved",
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
    }


@router.patch("/users/{user_id}/suspend")
def suspend_user(
    user_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Suspends a user account.
    Admin-only. Cannot suspend self or other admins.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if str(user.id) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot suspend yourself")
    
    if user.role == "admin":
         raise HTTPException(status_code=400, detail="Cannot suspend another admin")

    user.is_active = False
    
    audit = AuditLog(
        action="SUSPEND_USER",
        target_type="user",
        target_id=str(user.id),
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        extra_metadata=json.dumps({"reason": "Manual suspension by admin"})
    )
    db.add(audit)
    
    db.commit()
    db.refresh(user)
    return {"status": "success", "user_id": str(user.id), "is_active": user.is_active}


@router.patch("/users/{user_id}/activate")
def activate_user(
    user_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Activates a suspended user account.
    Admin-only.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    
    audit = AuditLog(
        action="ACTIVATE_USER",
        target_type="user",
        target_id=str(user.id),
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        extra_metadata=json.dumps({"reason": "Manual activation by admin"})
    )
    db.add(audit)
    
    db.commit()
    db.refresh(user)
    return {"status": "success", "user_id": str(user.id), "is_active": user.is_active}


@router.get("/lawyers")
def get_lawyers(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Returns all registered lawyers with their profiles.
    Admin-only endpoint.
    """
    results = (
        db.query(User, Lawyer)
        .join(Lawyer, User.id == Lawyer.user_id)
        .all()
    )
    
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "specialization": l.specialization,
            "bio": l.bio,
            "is_available": l.is_available,
        }
        for u, l in results
    ]


@router.get("/complaints/coordinates")
def get_complaint_coordinates(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Returns an array of complaint coordinates for mapping.
    Admin-only.
    """
    results = db.query(Complaint.lat, Complaint.lng).filter(
        Complaint.lat.isnot(None), 
        Complaint.lng.isnot(None)
    ).all()
    
    coords_map = {}
    for lat, lng in results:
        # Round to ~11m precision to group nearby points slightly
        key = f"{lat:.4f},{lng:.4f}"
        if key not in coords_map:
            coords_map[key] = {"lat": lat, "lng": lng, "count": 0}
        coords_map[key]["count"] += 1
        
    return list(coords_map.values())


@router.get("/stats")
def get_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Returns system-wide statistics.
    Admin-only endpoint.
    """
    total_users = db.query(User).count()
    total_complaints = db.query(Complaint).count()
    pending_complaints = db.query(Complaint).filter(Complaint.status == "SUBMITTED").count()
    processed_complaints = db.query(Complaint).filter(Complaint.status == "PROCESSED").count()
    total_lawyers = db.query(User).filter(User.role == "lawyer").count()
    
    return {
        "total_users": total_users,
        "total_complaints": total_complaints,
        "pending_complaints": pending_complaints,
        "processed_complaints": processed_complaints,
        "total_lawyers": total_lawyers,
    }

@router.get("/insights")
def get_strategic_insights(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Generates AI-driven strategic insights based on platform data.
    Admin-only endpoint.
    """
    total_complaints = db.query(Complaint).count()
    active_lawyers = db.query(User).filter(User.role == "lawyer", User.is_active == True).count()
    pending = db.query(Complaint).filter(Complaint.status == "SUBMITTED").count()
    
    data_summary = (
        f"Platform has {total_complaints} total complaints. "
        f"{pending} are currently pending review. "
        f"There are {active_lawyers} active lawyers on the roster."
    )
    
    insights = get_admin_insights(data_summary)
    return {"insights": insights}

from pydantic import BaseModel

class StatusUpdate(BaseModel):
    status: str

@router.put("/complaints/{id}/status")
def update_complaint_status(
    id: str,
    status_update: StatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Updates the status of a specific complaint.
    Admin-only endpoint.
    """
    complaint = db.query(Complaint).filter(Complaint.case_id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    old_status = complaint.status
    complaint.status = status_update.status

    audit = AuditLog(
        action="UPDATE_COMPLAINT_STATUS",
        target_type="complaint",
        target_id=id,
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        extra_metadata=json.dumps({"old_status": old_status, "new_status": status_update.status})
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "new_status": complaint.status}
