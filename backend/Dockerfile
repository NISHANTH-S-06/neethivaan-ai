# ── Stage: Builder ──────────────────────────────────────────
FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.docker.txt ./requirements.docker.txt
RUN pip install --no-cache-dir --prefix=/install -r requirements.docker.txt

# ── Stage: Runtime ──────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /install /usr/local

COPY . ./backend

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Default command: run FastAPI with Gunicorn for production
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "backend.main:app", "--bind", "0.0.0.0:8000", "--access-logfile", "-", "--error-logfile", "-"]