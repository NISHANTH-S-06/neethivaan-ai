import os
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import load_environment

load_environment()

_pg_url = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/neethivaan"
)

# ── Try PostgreSQL first; fall back to SQLite for local dev ──────────────────
def _make_engine():
    # Try PostgreSQL
    try:
        eng = create_engine(_pg_url, pool_pre_ping=True, connect_args={})
        with eng.connect() as c:
            c.execute(text("SELECT 1"))
        print("[DB] Connected to PostgreSQL.")
        return eng, _pg_url
    except Exception as pg_err:
        print(f"[DB] PostgreSQL unavailable ({pg_err.__class__.__name__}). "
              f"Falling back to SQLite.")

    # SQLite fallback
    _db_dir = os.path.dirname(os.path.abspath(__file__))
    _sqlite_path = os.path.join(_db_dir, "neethivaan_dev.db")
    _sqlite_url = f"sqlite:///{_sqlite_path}"
    eng = create_engine(
        _sqlite_url,
        connect_args={"check_same_thread": False},
    )
    # Enable WAL mode and FK enforcement for SQLite
    @event.listens_for(eng, "connect")
    def _set_sqlite_pragma(dbapi_conn, _):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA journal_mode=WAL")
        cur.execute("PRAGMA foreign_keys=ON")
        cur.close()

    print(f"[DB] Using SQLite at {_sqlite_path}")
    return eng, _sqlite_url

engine, _active_db_url = _make_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
