from pydantic import BaseModel
from datetime import datetime
import uuid

class NotificationBase(BaseModel):
    message: str

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
