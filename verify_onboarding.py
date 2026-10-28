import requests
import json
from datetime import datetime
import time

BASE_URL = "http://127.0.0.1:8000/api"

def test_onboarding():
    email = f"test_{int(datetime.now().timestamp())}@example.com"
    password = "password123"
    
    # 1. Register
    print(f"Registering user {email}...")
    reg_data = {"email": email, "password": password, "full_name": "Test User", "role": "citizen"}
    response = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    if response.status_code != 200:
        print(f"Registration failed: {response.text}")
        return

    time.sleep(1)

    # 2. Login
    print("Logging in...")
    login_data = {"username": email, "password": password}
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    
    token = response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Get current state
    print("Checking current onboarding state...")
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    user = response.json()
    print(f"Initial: onboarding_completed={user.get('onboarding_completed')}, onboarding_step={user.get('onboarding_step')}")
    
    # 4. Update step 1
    print("Updating step to 1...")
    response = requests.put(f"{BASE_URL}/users/onboarding", headers=headers, json={"step": 1})
    print(f"Step 1 update: {response.json()}")
    
    # 5. Complete onboarding
    print("Completing onboarding...")
    response = requests.put(f"{BASE_URL}/users/onboarding", headers=headers, json={"step": 4, "completed": True})
    print(f"Final update: {response.json()}")
    
    # 6. Verify
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    user = response.json()
    print(f"Final state: onboarding_completed={user.get('onboarding_completed')}, onboarding_step={user.get('onboarding_step')}")

if __name__ == "__main__":
    test_onboarding()
