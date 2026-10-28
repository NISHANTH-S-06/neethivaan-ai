from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_generate_complaint_id():
    payload = {
        "title": "Test Title",
        "description": "Test cyber fraud description",
        "issue_type": "Cyber Crime"
    }
    response = client.post("/complaints/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "case_id" in data
    assert data["case_id"].startswith("NEETH-")
    assert data["status"] == "SUBMITTED"
