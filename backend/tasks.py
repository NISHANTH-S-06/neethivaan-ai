from celery import Celery
import os
from backend.services.minio_client import get_object_stream
from backend.services.clamav_client import scan_file_stream
from backend.database import SessionLocal
from backend.models import Complaint, Attachment

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "memory://")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "cache+memory://")
CLAMAV_HOST = os.getenv("CLAMAV_HOST", "localhost")
CLAMAV_PORT = int(os.getenv("CLAMAV_PORT", "3310"))

app = Celery("neethivaan_tasks", broker=CELERY_BROKER_URL, backend=CELERY_RESULT_BACKEND)

@app.task(bind=True, max_retries=3, default_retry_delay=30)
def analyze_complaint_task(self, complaint_id: str):
    print(f"[TASK] NER & Classification for complaint: {complaint_id}")
    db = SessionLocal()
    try:
        complaint = db.query(Complaint).filter(Complaint.case_id == complaint_id).first()
        if not complaint:
            return {"status": "error", "message": "Complaint not found"}

        from backend.ai.classifier import classify_complaint, extract_entities
        from backend.ai.rag_pipeline import run_rag_pipeline

        desc = complaint.description or "No description provided."
        classification = classify_complaint(desc)
        entities = extract_entities(desc)
        analysis = run_rag_pipeline(
            "What are the legal implications of this complaint? " + desc
        )
        return {
            "status": "success",
            "complaint_id": complaint_id,
            "analysis": {
                "classification": classification,
                "entities": entities,
                "legal_analysis": analysis,
            },
        }
    except Exception as e:
        print(f"[TASK] Analysis error: {e}")
        try:
            self.retry(exc=e)
        except Exception:
            return {"status": "error", "message": str(e)}
    finally:
        db.close()


@app.task(bind=True, max_retries=3, default_retry_delay=30)
def scan_file_task(self, bucket_name: str, object_name: str, case_id: str):
    """Scans a file with ClamAV and updates its safety status."""
    print(f"[TASK] Scanning {object_name} in {bucket_name} for case {case_id}")

    stream = get_object_stream(bucket_name, object_name)
    if not stream:
        print(f"[TASK] Failed to get stream for {object_name}")
        return {"status": "error", "message": "Failed to fetch file stream"}

    try:
        is_safe = scan_file_stream(stream, host=CLAMAV_HOST, port=CLAMAV_PORT)

        db = SessionLocal()
        try:
            attachment = db.query(Attachment).filter(
                Attachment.storage_path == object_name
            ).first()
            if attachment:
                attachment.is_safe = is_safe
                db.commit()
            status_str = "success" if is_safe else "infected"
            print(f"[TASK] Scan result for {object_name}: {status_str}")
            return {"status": status_str, "is_safe": is_safe}
        finally:
            db.close()

    except Exception as e:
        print(f"[TASK] Error during scan: {e}")
        try:
            self.retry(exc=e)
        except Exception:
            return {"status": "error", "message": str(e)}
