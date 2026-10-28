import requests
import sys
import os

print("--- Testing RAG Chat ---")
try:
    resp = requests.post("http://localhost:8000/api/rag-chat", json={"query": "What is IPC 420?"}, timeout=60)
    print("Status:", resp.status_code)
    print("Response:", resp.json())
except Exception as e:
    print("RAG Error:", e)

print("\n--- Testing MinIO Presigned URL ---")
try:
    # we must ensure path is set to import backend
    sys.path.insert(0, "/app")
    from backend.services.minio_client import get_presigned_upload_url
    url = get_presigned_upload_url("attachments", "test_case/test_image.jpg")
    print("Upload URL Generated:")
    if url and url.startswith("http"):
        print(url[:100] + "...")
        print("MinIO OK!")
    else:
        print("Failed to generate complete url:", url)
except Exception as e:
    print("MinIO Error:", e)
