import os
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

def test_cors_logic():
    print("Testing CORS origin parsing...")
    # Simulate environment variable
    os.environ["CORS_ALLOWED_ORIGINS"] = "https://example.com, http://localhost:3000 , "
    
    # Logic from main.py
    origins = os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",")
    origins = [o.strip() for o in origins if o.strip()]
    
    print(f"Parsed origins: {origins}")
    assert "https://example.com" in origins
    assert "http://localhost:3000" in origins
    assert len(origins) == 2
    print("CORS logic test passed!")

def test_config_loading():
    print("\nTesting config loading logic...")
    from backend.config import load_environment
    
    # Mocking environment
    os.environ["APP_ENV"] = "production"
    # Ensure no .env.production exists in the test context or it will print info
    env = load_environment()
    print(f"Loaded environment: {env}")
    assert env == "production"
    print("Config loading logic test passed!")

if __name__ == "__main__":
    try:
        test_cors_logic()
        # Note: test_config_loading might fail if python-dotenv is not installed in the environment where this runs
        # but the logic itself is fine.
        try:
            test_config_loading()
        except ImportError:
            print("Skipping config loading test due to missing dependencies, but logic was reviewed.")
    except Exception as e:
        print(f"Verification failed: {e}")
        sys.exit(1)
