import sys
import os
import traceback

sys.path.append(os.getcwd())

try:
    print("Attempting to import backend.main...")
    from backend.main import app
    print("SUCCESS: backend.main imported correctly.")
except Exception:
    print("FAILURE: backend.main import failed.")
    traceback.print_exc()
