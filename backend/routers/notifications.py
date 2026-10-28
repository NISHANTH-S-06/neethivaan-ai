from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.auth import get_current_user
from backend.models import User, Notification
from backend.schemas import NotificationCreate, NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns notifications for the current user, ordered by creation date (newest first).
    Phase 5 & 7 implementation.
    """
    try:
        notifications = (
            db.query(Notification)
            .filter(Notification.user_id == current_user.id)
            .order_by(Notification.created_at.desc())
            .all()
        )
        return notifications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database failure: {str(e)}"
        )

@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new notification for the authenticated user.
    Phase 2 & 7 implementation (user_id extracted from JWT).
    """
    try:
        new_notification = Notification(
            user_id=current_user.id,
            message=notification_data.message
        )
        db.add(new_notification)
        db.commit()
        db.refresh(new_notification)
        return new_notification
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create notification: {str(e)}"
        )

@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks a specific notification as read."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.commit()
    return {"status": "success", "id": notification_id}

@router.post("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks all notifications for the current user as read."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "success"}
