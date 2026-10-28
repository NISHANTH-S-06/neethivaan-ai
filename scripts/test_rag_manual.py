"""
Manual test script for the RAG chat endpoint.
Run with: python scripts/test_rag_manual.py

Requires the backend to be running (docker-compose up).
"""
import httpx
import json
import sys

BASE_URL = "http://localhost:8000/api"

SAMPLE_QUERIES = [
    "What are the penalties for cyber fraud?",
    "Consumer protection rights in Tamil Nadu",
    "What is the punishment for domestic violence?",
    "Right to Information Act provisions",
    "What are the labor laws in India?",
]


def test_health():
    """Check if backend is reachable."""
    try:
        r = httpx.get(f"{BASE_URL}/health", timeout=5)
        if r.status_code == 200:
            print("✅ Backend health check passed\n")
            return True
        else:
            print(f"❌ Health check failed: {r.status_code}")
            return False
    except httpx.ConnectError:
        print("❌ Cannot connect to backend. Is docker-compose running?")
        return False


def test_rag_chat(query: str):
    """Send a query to POST /api/rag-chat and print result."""
    print(f"📝 Query: {query}")
    print("-" * 60)

    try:
        r = httpx.post(
            f"{BASE_URL}/rag-chat",
            json={"query": query},
            timeout=30,
        )

        if r.status_code == 200:
            data = r.json()
            print(f"✅ Status: {r.status_code}")
            print(f"📄 Context preview: {data.get('context', '')[:200]}...")
            print(f"🤖 Answer prompt preview: {data.get('answer', '')[:200]}...")
        else:
            print(f"❌ Status: {r.status_code}")
            print(f"   Detail: {r.text}")

    except Exception as e:
        print(f"❌ Request failed: {e}")

    print()


def test_edge_cases():
    """Test empty and blank queries."""
    print("=" * 60)
    print("EDGE CASES")
    print("=" * 60)

    # Empty query
    r = httpx.post(f"{BASE_URL}/rag-chat", json={"query": ""}, timeout=10)
    status = "✅" if r.status_code == 400 else "❌"
    print(f"{status} Empty query → {r.status_code} (expected 400)")

    # Blank query
    r = httpx.post(f"{BASE_URL}/rag-chat", json={"query": "   "}, timeout=10)
    status = "✅" if r.status_code == 400 else "❌"
    print(f"{status} Blank query → {r.status_code} (expected 400)")

    # Missing field
    r = httpx.post(f"{BASE_URL}/rag-chat", json={}, timeout=10)
    status = "✅" if r.status_code == 422 else "❌"
    print(f"{status} Missing query → {r.status_code} (expected 422)")

    print()


def main():
    print("=" * 60)
    print("  NEETHIVAAN AI — RAG Chat Manual Test")
    print("=" * 60)
    print()

    if not test_health():
        sys.exit(1)

    print("=" * 60)
    print("SAMPLE QUERIES")
    print("=" * 60)
    print()

    for query in SAMPLE_QUERIES:
        test_rag_chat(query)

    test_edge_cases()

    print("=" * 60)
    print("  Test run complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
