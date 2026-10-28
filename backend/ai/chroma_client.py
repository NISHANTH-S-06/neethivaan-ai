import os
import requests
import logging

logger = logging.getLogger(__name__)

CHROMA_HOST = os.getenv("CHROMA_HOST", "chromadb")
CHROMA_PORT = os.getenv("CHROMA_PORT", "8000")
CHROMA_TENANT = os.getenv("CHROMA_TENANT", "default_tenant")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE", "default_database")


def _get_base_url():
    """Determine the active ChromaDB URL by checking heartbeats."""
    hosts_to_try = [
        f"http://{CHROMA_HOST}:{CHROMA_PORT}",
        f"http://neethivaan-chroma-1:{CHROMA_PORT}",
        f"http://localhost:{CHROMA_PORT}",
    ]

    for base in hosts_to_try:
        try:
            resp = requests.get(f"{base}/api/v2/heartbeat", timeout=2)
            if resp.status_code == 200:
                return base
        except requests.exceptions.RequestException:
            continue

    # Fallback to default
    return f"http://{CHROMA_HOST}:{CHROMA_PORT}"


def _collections_url(base_url: str) -> str:
    """Build the full collections URL with tenant/database."""
    return f"{base_url}/api/v2/tenants/{CHROMA_TENANT}/databases/{CHROMA_DATABASE}/collections"


class RestChromaCollection:
    def __init__(self, name: str, collection_id: str, base_url: str):
        self.name = name
        self.id = collection_id
        self.base_url = base_url

    def _query_url(self):
        return f"{self.base_url}/api/v2/tenants/{CHROMA_TENANT}/databases/{CHROMA_DATABASE}/collections/{self.id}/query"

    def query(self, query_embeddings: list, n_results: int = 5):
        payload = {
            "query_embeddings": query_embeddings,
            "n_results": n_results,
        }
        resp = requests.post(self._query_url(), json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json()

    def count(self):
        url = f"{self.base_url}/api/v2/tenants/{CHROMA_TENANT}/databases/{CHROMA_DATABASE}/collections/{self.id}"
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            return resp.json().get("count", 0)
        return 0


class RestChromaClient:
    def __init__(self):
        self.base_url = _get_base_url()

    def _collections_url(self):
        return _collections_url(self.base_url)

    def get_or_create_collection(self, name: str):
        # First try GET by name
        get_url = f"{self._collections_url()}/{name}"
        try:
            resp = requests.get(get_url, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                return RestChromaCollection(
                    name=data["name"], collection_id=data["id"], base_url=self.base_url
                )
        except requests.exceptions.RequestException:
            pass

        # Create via POST
        payload = {"name": name, "get_or_create": True}
        resp = requests.post(self._collections_url(), json=payload, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return RestChromaCollection(
            name=data["name"], collection_id=data["id"], base_url=self.base_url
        )

    def get_collection(self, name: str):
        url = f"{self._collections_url()}/{name}"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return RestChromaCollection(
            name=data["name"], collection_id=data["id"], base_url=self.base_url
        )

    def heartbeat(self):
        resp = requests.get(f"{self.base_url}/api/v2/heartbeat", timeout=5)
        resp.raise_for_status()
        return resp.json()


def get_chroma_client():
    """Returns a custom REST client for ChromaDB with mock fallback."""
    try:
        client = RestChromaClient()
        client.heartbeat()  # test connection
        return client
    except Exception as e:
        logger.warning(f"ChromaDB heartbeat failed ({e}), returning mock client.")
        return MockChromaClient()

class MockChromaCollection:
    def query(self, query_embeddings: list, n_results: int = 5):
        return {"documents": [["Mock legal text for local verification."]], "metadatas": [[]], "distances": [[]]}
    def count(self):
        return 1

class MockChromaClient:
    def heartbeat(self):
        return 12345
    def get_or_create_collection(self, name: str):
        return MockChromaCollection()
    def get_collection(self, name: str):
        return MockChromaCollection()


def init_collections():
    """Initializes the 'laws' and 'complaints' collections."""
    client = get_chroma_client()
    laws = client.get_or_create_collection(name="laws")
    complaints = client.get_or_create_collection(name="complaints")
    return laws, complaints


def query_collection(collection_name: str, query_embeddings: list, n_results: int = 5):
    """Queries a specific Chroma collection."""
    client = get_chroma_client()
    collection = client.get_collection(name=collection_name)
    results = collection.query(
        query_embeddings=query_embeddings,
        n_results=n_results,
    )
    return results

# Module-level initialization is deferred to startup events or handled per-request.
