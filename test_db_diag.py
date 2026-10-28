import uuid
from sqlalchemy import create_engine, Column, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID

class GUID(TypeDecorator):
    """Platform-independent GUID type."""
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
                return uuid.UUID(value).hex
            else:
                return value.hex

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if not isinstance(value, uuid.UUID):
            value = uuid.UUID(value)
        return value

Base = declarative_base()

class User(Base):
    __tablename__ = "test_users"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String)

engine = create_engine("sqlite:///./test.db")
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()

u = User(name="test")
session.add(u)
session.commit()
print(f"Created user with ID: {u.id}")
fetched = session.query(User).first()
print(f"Fetched user with ID: {fetched.id}")
