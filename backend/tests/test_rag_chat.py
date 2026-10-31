"""
Automated tests for the RAG chat endpoint POST /api/rag-chat.
Uses FastAPI TestClient with mocked RAG dependencies.
"""
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


# --- Mock helpers ---

def _mock_rag_answer(query: str):
    """Simulated RAG answer for testing."""
    return {
        "query": query,
        "context": "Section 66A of IT Act: Punishment for sending offensive messages.",
        "answer": (
            "You are a legal assistant specializing in Tamil Nadu laws.\n\n"
            "Use the following legal context to answer the question below.\n\n"
            "Context:\nSection 66A of IT Act: Punishment for sending offensive messages.\n\n"
            f"Question: {query}\n\n"
            "Answer:"
        ),
    }


# --- Tests ---


@patch("backend.app.api.chat.run_rag_pipeline", side_effect=_mock_rag_answer)
def test_rag_chat_valid_query(mock_rag):
    """Valid query returns 200 with expected keys."""
    response = client.post("/api/rag-chat", json={"query": "What is cyber fraud?"})
    assert response.status_code == 200
    data = response.json()
    assert "query" in data
    assert "context" in data
    assert "answer" in data
    assert data["query"] == "What is cyber fraud?"


@patch("backend.app.api.chat.run_rag_pipeline", side_effect=_mock_rag_answer)
def test_rag_chat_response_has_context(mock_rag):
    """Context should contain law text."""
    response = client.post("/api/rag-chat", json={"query": "IT Act penalties"})
    data = response.json()
    assert len(data["context"]) > 0


def test_rag_chat_empty_query():
    """Empty query string should return 400."""
    response = client.post("/api/rag-chat", json={"query": ""})
    assert response.status_code == 400


def test_rag_chat_blank_query():
    """Whitespace-only query should return 400."""
    response = client.post("/api/rag-chat", json={"query": "   "})
    assert response.status_code == 400


def test_rag_chat_missing_query():
    """Missing query field should return 422 validation error."""
    response = client.post("/api/rag-chat", json={})
    assert response.status_code == 422


@patch("backend.app.api.chat.run_rag_pipeline", side_effect=RuntimeError("ChromaDB unavailable"))
def test_rag_chat_pipeline_error(mock_rag):
    """When RAG pipeline throws, endpoint should return 500."""
    response = client.post("/api/rag-chat", json={"query": "test query"})
    assert response.status_code == 500
    assert "RAG pipeline error" in response.json()["detail"]
