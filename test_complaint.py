import requests
import json

base_url = "http://localhost:8001/api"
auth_data = {
    "email": "test@example.com",
    "password": "password123"
}

# Login
response = requests.post(f"{base_url}/auth/login", json=auth_data)
token = response.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# Create Complaint
complaint_data = {
    "title": "Test Complaint",
    "description": "This is a test complaint about someone stealing my cycle.",
    "issue_type": "Theft",
    "complainant_name": "Test User",
    "location_text": "Chennai"
}

print("Creating complaint...")
response = requests.post(f"{base_url}/complaints/", json=complaint_data, headers=headers)
print(f"Create Status: {response.status_code}")
print(f"Create Response: {response.text}")

if response.status_code == 200:
    case_id = response.json().get("case_id")
    
    # List My Complaints
    print("\nListing my complaints...")
    response = requests.get(f"{base_url}/complaints/my", headers=headers)
    print(f"List Status: {response.status_code}")
    print(f"List Response: {response.text}")
    
    # Get Specific Complaint
    print(f"\nGetting complaint {case_id}...")
    response = requests.get(f"{base_url}/complaints/{case_id}", headers=headers)
    print(f"Get Status: {response.status_code}")
    print(f"Get Response: {response.text}")
