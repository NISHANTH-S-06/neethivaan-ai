import sys
import traceback

print("Starting import...", flush=True)
try:
    from backend.ai.chroma_client import init_collections
    print("Import successful. Initializing collections...", flush=True)
    laws, comp = init_collections()
    print("Laws count:", laws.count())
    print("Complaints count:", comp.count())
except Exception as e:
    print("Exception occurred:")
    traceback.print_exc()
