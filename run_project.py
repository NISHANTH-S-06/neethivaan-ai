import os
import subprocess
import time
import sys

def run():
    backend_dir = os.path.join(os.getcwd(), "backend")
    frontend_dir = os.path.join(os.getcwd(), "frontend")

    print("🚀 Starting Neethivaan AI...")
    
    # Start Backend
    print("📦 Starting Backend (FastAPI)...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"],
        cwd=backend_dir
    )

    # Start Frontend
    print("🎨 Starting Frontend (Next.js)...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_dir,
        shell=True
    )

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping Neethivaan AI...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("✅ Shutdown complete.")

if __name__ == "__main__":
    run()
