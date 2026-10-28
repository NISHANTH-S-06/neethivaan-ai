import requests
import json
import time
from datetime import datetime
import os

BASE_URL = "http://127.0.0.1:8000/api"

def test_ai():
    email = f"test_ai_{int(datetime.now().timestamp())}@example.com"
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
    
    # 3. Ask AI
    print("Sending query to AI...")
    session_id = f"test-session-{int(datetime.now().timestamp())}"
    chat_payload = {"message": "What are my rights as a consumer in India?", "session_id": session_id}
    response = requests.post(f"{BASE_URL}/ai/chat", headers=headers, json=chat_payload)
    print(f"AI Response Status: {response.status_code}")
    print(f"AI Response: {response.text}")

    # 4. Check Database
    try:
        from backend.database import SessionLocal
        from backend.models import ChatSession
        db = SessionLocal()
        session_record = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
        if session_record:
            print(f"DB Record Found: ID={session_record.id}, Message={session_record.message}, Response preview={session_record.response[:50]}...")
        else:
            print("DB Record NOT found!")
    except ImportError:
        pass


if __name__ == "__main__":
    test_ai()
