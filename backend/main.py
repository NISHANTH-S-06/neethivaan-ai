from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import threading
import time
from datetime import datetime

# Ensure repository root is importable when running `uvicorn main:app` from backend/.
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
_REPO_ROOT = os.path.dirname(_BACKEND_DIR)
if _REPO_ROOT not in sys.path:
    sys.path.append(_REPO_ROOT)

from backend.config import load_environment
load_environment()

# Now safe to import DB / models
from backend.database import engine
from backend.routers import complaints, reports, chat, lawyer, fir, auth, notifications, admin, cases, users, lawyers, ai
import backend.models
from backend.app.api.chat import router as rag_chat_router
from backend.services.minio_client import health_check_minio, verify_upload_fetch
from backend.routers.public_aliases import router as public_aliases_router


def run_background_ingestion():
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if BASE_DIR not in sys.path:
        sys.path.append(BASE_DIR)
    SCRIPTS_DIR = os.path.join(BASE_DIR, "scripts")
    if SCRIPTS_DIR not in sys.path:
        sys.path.append(SCRIPTS_DIR)

    try:
        from backend.ai.chroma_client import get_chroma_client
        client = None
        for _ in range(15):
            try:
                client = get_chroma_client()
                break
            except Exception:
                time.sleep(2)

        if not client:
            print("[WARN] ChromaDB not ready, aborting background ingestion.")
            return

        print("[INFO] Checking laws collection")
        collection = client.get_or_create_collection(name="laws")
        if collection.count() > 0:
            print("[INFO] Skipping ingestion")
            return
        print("[INFO] Ingesting laws")
        from scripts.ingest_laws import ingest
        ingest(force=True)

    except ImportError as e:
        print(f"[WARN] ingest_laws module not found ({e})")
    except Exception as e:
        print(f"[ERROR] Startup ingestion failed: {e}")


from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # threading.Thread(target=run_background_ingestion, daemon=True).start()
    yield

# Ensure tables are created
backend.models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Neethivaan AI Backend", lifespan=lifespan)

# Global error logger
@app.middleware("http")
async def log_errors(request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        import traceback
        with open("error_log.txt", "a") as f:
            f.write(f"\n--- {datetime.now()} ---\n")
            f.write(traceback.format_exc())
        raise e

# CORS Configuration
origins = os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",")
# Clean up whitespace
origins = [o.strip() for o in origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Set to True for production with cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(lawyer.router, prefix="/api")
app.include_router(fir.router, prefix="/api")
app.include_router(rag_chat_router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(cases.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(lawyers.router, prefix="/api")
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(public_aliases_router)


@app.get("/api/health")
def health_check():
    db_status = "unknown"
    try:
        with engine.connect() as conn:
            db_status = "connected"
    except Exception as e:
        db_status = f"unavailable: {str(e)[:80]}"
    minio_check = health_check_minio()
    status = "ok" if db_status == "connected" and minio_check["status"] == "connected" else "degraded"
    return {"status": status, "db": db_status, "minio": minio_check}


@app.get("/api/health/db")
def health_check_db():
    try:
        with engine.connect():
            return {"status": "connected"}
    except Exception as exc:
        return {"status": "unavailable", "detail": str(exc)[:200]}


@app.get("/api/health/minio")
def health_check_storage():
    return health_check_minio()


@app.post("/api/health/minio/verify")
def health_check_storage_verify():
    try:
        return verify_upload_fetch()
    except Exception as exc:
        return {"status": "failed", "detail": str(exc)[:200]}
