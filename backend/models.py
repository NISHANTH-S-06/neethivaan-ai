from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID
import uuid

class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise CHAR(32).
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(32))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return "%.32x" % uuid.UUID(str(value)).int
            return "%.32x" % value.int

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if not isinstance(value, uuid.UUID):
            value = uuid.UUID(value)
        return value

from sqlalchemy import Column, String, Float, DateTime, Date, Boolean, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), index=True, nullable=True)
    case_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String)
    description = Column(String)
    issue_type = Column(String)
    incident_date = Column(Date)
    location_text = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    complainant_name = Column(String)
    email = Column(String)
    phone = Column(String)
    id_type = Column(String)
    id_number = Column(String)
    witness_name = Column(String)
    witness_contact = Column(String)
    status = Column(String, default="SUBMITTED", index=True)
    fir_csrtype = Column(String)
    ai_context = Column(String)
    ai_answer = Column(String)
    fir_text = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    case_id = Column(String, index=True, nullable=False)
    filename = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    file_type = Column(String)
    is_safe = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="user", nullable=False)
    is_active = Column(Boolean, default=True)
    onboarding_completed = Column(Boolean, default=False)
    onboarding_step = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    complaints = relationship("Complaint", backref="owner")

class Lawyer(Base):
    __tablename__ = "lawyers"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"))
    specialization = Column(String)
    bio = Column(String)
    is_available = Column(Boolean, default=True)

class FIR(Base):
    __tablename__ = "firs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    case_id = Column(String, ForeignKey("complaints.case_id"))
    fir_number = Column(String, unique=True)
    status = Column(String, default="FILED")
    generated_text = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    action = Column(String, nullable=False, index=True)
    target_type = Column(String, nullable=True)
    target_id = Column(String, nullable=True, index=True)
    actor_id = Column(GUID(), ForeignKey("users.id"), nullable=True)
    actor_name = Column(String, nullable=True)
    actor_role = Column(String, nullable=True)
    extra_metadata = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class Admin(Base):
    __tablename__ = "admins"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Case(Base):
    __tablename__ = "cases"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    owner_user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="draft", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Document(Base):
    __tablename__ = "documents"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    case_id = Column(GUID(), ForeignKey("cases.id"), nullable=False)
    file_name = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LegalReport(Base):
    __tablename__ = "legal_reports"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    case_id = Column(GUID(), ForeignKey("cases.id"), nullable=False)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Law(Base):
    __tablename__ = "laws"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    session_id = Column(String, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    message = Column(Text)
    response = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CaseAnalysis(Base):
    __tablename__ = "case_analysis"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    case_id = Column(GUID(), ForeignKey("cases.id"), nullable=False)
    risk_level = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    laws_referenced = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
