"""Regression tests for access control (registration roles, ownership, suspended users)."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app
from backend.database import Base, get_db
from backend.models import Complaint, User


@pytest.fixture()
def env():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, autoflush=False)
    db = Session()

    def override():
        yield db

    app.dependency_overrides[get_db] = override
    yield TestClient(app), db
    app.dependency_overrides.pop(get_db, None)
    db.close()


def _register_and_login(client, email, role=None):
    payload = {"email": email, "password": "Passw0rd!x", "full_name": email.split("@")[0]}
    if role:
        payload["role"] = role
    r = client.post("/api/auth/register", json=payload)
    assert r.status_code == 200, r.text
    login = client.post("/api/auth/login", json={"email": email, "password": "Passw0rd!x"})
    assert login.status_code == 200, login.text
    return r.json(), {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_register_cannot_self_assign_lawyer_or_admin(env):
    client, _ = env
    for wanted in ("lawyer", "admin"):
        body, _headers = _register_and_login(client, f"{wanted}@example.com", role=wanted)
        assert body["role"] == "user"


def _make_case(db, owner_email, case_id):
    owner = db.query(User).filter(User.email == owner_email).first()
    db.add(Complaint(case_id=case_id, user_id=owner.id, title="t", description="d", issue_type="Other"))
    db.commit()


def test_only_owner_or_admin_can_update_complaint(env):
    client, db = env
    _, owner_h = _register_and_login(client, "owner@example.com")
    _, other_h = _register_and_login(client, "other@example.com")
    _make_case(db, "owner@example.com", "NEETH-TEST-00001")

    denied = client.put("/api/complaints/NEETH-TEST-00001", json={"title": "hijacked"}, headers=other_h)
    assert denied.status_code == 403

    ok = client.put("/api/complaints/NEETH-TEST-00001", json={"title": "mine"}, headers=owner_h)
    assert ok.status_code == 200
    assert db.query(Complaint).filter_by(case_id="NEETH-TEST-00001").one().title == "mine"


def test_non_owner_cannot_add_attachment(env):
    client, db = env
    _register_and_login(client, "owner2@example.com")
    _, other_h = _register_and_login(client, "other2@example.com")
    _make_case(db, "owner2@example.com", "NEETH-TEST-00002")
    r = client.post("/api/complaints/NEETH-TEST-00002/attachments?file_name=a.pdf", headers=other_h)
    assert r.status_code == 403


def test_suspended_user_is_rejected(env):
    client, db = env
    _, headers = _register_and_login(client, "sus@example.com")
    user = db.query(User).filter(User.email == "sus@example.com").first()
    user.is_active = False
    db.commit()
    assert client.get("/api/auth/me", headers=headers).status_code in (401, 403)
    login = client.post("/api/auth/login", json={"email": "sus@example.com", "password": "Passw0rd!x"})
    assert login.status_code == 403
