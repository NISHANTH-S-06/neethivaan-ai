import requests
import sys

BASE_URL = "http://localhost/api"

def run_test():
    print("Testing User Registration...")
    reg_response = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "email": "testuser_v3@example.com",
            "password": "testpassword",
            "full_name": "Test User",
            "role": "user"
        }
    )
    if reg_response.status_code not in (200, 400):
        print(f"Registration failed: {reg_response.text}")
        sys.exit(1)
        
    print("Testing User Login...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": "testuser_v3@example.com",
            "password": "testpassword"
        }
    )
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.text}")
        sys.exit(1)
        
    token = login_response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing RAG Chat endpoint...")
    chat_response = requests.post(
        f"{BASE_URL}/rag-chat",
        json={"query": "What are my rights if I am arrested in India?"},
        headers=headers
    )
    
    if chat_response.status_code != 200:
        print(f"Chat failed: {chat_response.text}")
        sys.exit(1)
        
    print("Chat Successful. Answer received:")
    print(chat_response.json().get("answer", chat_response.json()))
    
    print("\nAll integration tests passed.")

if __name__ == "__main__":
    run_test()
