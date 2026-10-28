import urllib.request
import urllib.error
import json
import sys

BASE = "http://127.0.0.1:8000"

def req(method, path, payload=None):
    url = BASE + path
    data = json.dumps(payload).encode() if payload else None
    headers = {"Content-Type": "application/json"}
    rq = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(rq, timeout=10) as r:
            body = json.loads(r.read())
            print(f"[{r.status}] {method} {path}")
            print(json.dumps(body, indent=2, default=str))
            return r.status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"[{e.code}] {method} {path}")
        try: print(json.dumps(json.loads(body), indent=2))
        except: print(body)
        return e.code, body
    except Exception as e:
        print(f"[ERR] {method} {path} => {e}")
        return 0, str(e)

print("=" * 60)
print("STEP 4: GET /api/health")
print("=" * 60)
status, body = req("GET", "/api/health")

print()
print("=" * 60)
print("STEP 5: POST /api/auth/register")
print("=" * 60)
status, body = req("POST", "/api/auth/register", {
    "email": "test@example.com",
    "password": "Test@1234",
    "role": "user"
})

print()
print("=" * 60)
print("STEP 5b: POST /api/auth/register (duplicate - should 400)")
print("=" * 60)
req("POST", "/api/auth/register", {
    "email": "test@example.com",
    "password": "Test@1234",
    "role": "user"
})

print()
print("=" * 60)
print("STEP 5c: POST /api/auth/login")
print("=" * 60)
login_status, login_body = req("POST", "/api/auth/login", {
    "email": "test@example.com",
    "password": "Test@1234"
})

print()
print("=" * 60)
print("STEP 6: Verify DB file exists")
print("=" * 60)
import os
db_path = r"D:\Neethivaan\backend\neethivaan_dev.db"
if os.path.exists(db_path):
    size = os.path.getsize(db_path)
    print(f"[OK] SQLite DB found: {db_path}")
    print(f"     Size: {size} bytes")
else:
    print(f"[MISSING] {db_path}")

print()
print("All steps complete.")
