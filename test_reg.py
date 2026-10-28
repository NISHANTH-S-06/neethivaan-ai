import requests
import json

url = "http://localhost:8000/api/auth/register"
data = {
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "role": "user"
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
