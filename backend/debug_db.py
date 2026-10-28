from backend.database import engine, Base
from backend.models import User, Complaint, Attachment
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def debug():
    print("Tables in metadata:", Base.metadata.tables.keys())
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")

if __name__ == "__main__":
    debug()
