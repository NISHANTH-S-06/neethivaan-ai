from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    # "degraded" is expected when MinIO/Redis are not running (CI / local without docker)
    assert response.json()["status"] in ("ok", "degraded")

def test_create_complaint_requires_auth():
    payload = {
        "title": "Test Title",
        "description": "Test cyber fraud description",
        "issue_type": "Cyber Crime",
    }
    response = client.post("/api/complaints/", json=payload)
    assert response.status_code in (401, 403)


def test_generate_case_id_format():
    from unittest.mock import MagicMock
    from backend.routers.complaints import generate_case_id

    db = MagicMock()
    db.query.return_value.filter.return_value.count.return_value = 0
    case_id = generate_case_id(db)
    assert case_id.startswith("NEETH-")
    assert case_id.endswith("-00001")
