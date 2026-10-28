from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
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
