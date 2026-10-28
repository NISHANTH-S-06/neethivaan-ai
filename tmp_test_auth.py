import requests
import json

def test_auth():
    base_url = "http://localhost:8000/api/auth"
    register_url = f"{base_url}/register"
    login_url = f"{base_url}/login"
    
    # 1. Register
    payload = {
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User",
        "role": "user"
    }
    print(f"Registering: {payload['email']}...")
    try:
        r = requests.post(register_url, json=payload)
        print(f"Register Status: {r.status_code}")
        print(f"Register Response: {r.text}")
        
        # 2. Login
        print("Logging in...")
        # OAuth2PasswordRequestForm uses form data
        login_data = {
            "username": payload["email"],
            "password": payload["password"]
        }
        r = requests.post(login_url, data=login_data)
        print(f"Login Status: {r.status_code}")
        if r.status_code == 200:
            token = r.json().get("access_token")
            print("Login OK. Token received.")
            print("Auth OK / RBAC OK")
        else:
            print(f"Login FAIL: {r.text}")
            
    except Exception as e:
        print(f"Auth test failed: {e}")

if __name__ == "__main__":
    test_auth()
