import os
import sys

# Mocking environment variables as they would be in Docker
os.environ["DATABASE_URL"] = "postgresql://neethivaan:password@localhost:5432/neethivaan"
os.environ["CHROMA_HOST"] = "localhost"
os.environ["CHROMA_PORT"] = "8001"
os.environ["OLLAMA_URL"] = "http://localhost:11434"

# Set PYTHONPATH to include backend
sys.path.append(os.path.abspath("backend"))
sys.path.append(os.path.abspath("backend/app"))

print("Testing backend imports...")
try:
    from backend import main
    print("Backend main imported successfully.")
except Exception as e:
    import traceback
    traceback.print_exc()
