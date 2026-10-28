"""
Root entrypoint shim.

This repo's FastAPI app lives in `backend/main.py`, but many local commands (and tutorials)
assume `uvicorn main:app`. Keeping this thin wrapper avoids import errors when running from
the repo root.
"""

from backend.main import app  # noqa: F401

