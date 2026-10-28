import os
import sys
import glob

# Add current and parent directories to path to find ai modules
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.join(parent_dir, "backend"))

try:
    from backend.ai.embeddings import get_embedding
    from backend.ai.chroma_client import get_chroma_client
except ImportError:
    try:
        from backend.ai.embeddings import get_embedding
        from backend.ai.chroma_client import get_chroma_client
    except ImportError:
        # Fallback for direct import if already in path
        import backend.ai.embeddings as embeddings
        import backend.ai.chroma_client as chroma_client
        get_embedding = embeddings.get_embedding
        get_chroma_client = chroma_client.get_chroma_client

# Detect data directory
if os.path.exists(os.path.join(current_dir, "data", "laws")):
    DATA_DIR = os.path.join(current_dir, "data", "laws")
else:
    DATA_DIR = os.path.join(parent_dir, "data", "laws")

import time

def ingest(force=False, retries=5, delay=5):
    client = None
    for i in range(retries):
        try:
            client = get_chroma_client()
            break
        except Exception as e:
            if i < retries - 1:
                print(f"ChromaDB not ready (attempt {i+1}/{retries}). Retrying in {delay}s...")
                time.sleep(delay)
            else:
                raise e

    collection = client.get_or_create_collection(name="laws")
    
    # Check if empty
    if not force:
        count = collection.count()
        if count > 0:
            print(f"Collection 'laws' already contains {count} documents. Skipping ingestion.")
            return

    print(f"Searching for law files in {DATA_DIR}...")
    law_files = glob.glob(os.path.join(DATA_DIR, "*.txt"))
    
    if not law_files:
        print("No law files found in data/laws/")
        return

    print(f"Found {len(law_files)} law files. Starting ingestion...")
    
    for file_path in law_files:
        file_name = os.path.basename(file_path)
        law_id = os.path.splitext(file_name)[0]
        
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        print(f"Ingesting {file_name}...")
        
        # In a real scenario, we might want to split large laws into chunks.
        # For now, we'll treat each file as one document or split by line.
        # Let's assume one document per file for simplicity in this phase.
        
        embedding = get_embedding(content)
        
        collection.add(
            embeddings=[embedding],
            documents=[content],
            metadatas=[{"source": file_name, "type": "law"}],
            ids=[law_id]
        )
        
    print("Ingestion complete!")

if __name__ == "__main__":
    ingest()

