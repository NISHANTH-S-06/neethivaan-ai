import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parent


@lru_cache(maxsize=1)
def load_environment() -> str:
    """
    Load environment variables based on APP_ENV.
    In production, variables should be set in the system/platform environment.
    """
    app_env = os.getenv("APP_ENV", "development").lower()
    
    # Only load from .env file if it exists and we're not explicitly told it's production
    # (though .env files can still be useful in prod for some configs)
    env_file = ".env.production" if app_env == "production" else ".env"
    env_path = BACKEND_DIR / env_file
    
    if env_path.exists():
        print(f"[INFO] Loading environment from {env_path}")
        load_dotenv(env_path, override=False)
    else:
        print(f"[INFO] No {env_file} found, using system environment variables.")
        
    return app_env
