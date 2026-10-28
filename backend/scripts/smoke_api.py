import argparse
import json
import uuid

import requests


def run(base_url: str, email: str, password: str) -> None:
    api = f"{base_url.rstrip('/')}/api"

    register_payload = {
        "email": email,
        "password": password,
        "full_name": "Smoke User",
        "role": "user",
    }
    reg = requests.post(f"{api}/auth/register", json=register_payload, timeout=20)
    if reg.status_code not in (200, 400):
        raise RuntimeError(f"register failed: {reg.status_code} {reg.text}")

    login = requests.post(f"{api}/auth/login", json={"email": email, "password": password}, timeout=20)
    if login.status_code != 200:
        raise RuntimeError(f"login failed: {login.status_code} {login.text}")
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me = requests.get(f"{api}/auth/me", headers=headers, timeout=20)
    if me.status_code != 200:
        raise RuntimeError(f"auth/me failed: {me.status_code} {me.text}")

    case = requests.post(
        f"{api}/cases",
        json={"title": "Smoke Case", "description": "Created by smoke test"},
        headers=headers,
        timeout=20,
    )
    if case.status_code != 200:
        raise RuntimeError(f"create case failed: {case.status_code} {case.text}")
    case_id = case.json().get("id")

    cases = requests.get(f"{api}/cases", headers=headers, timeout=20)
    if cases.status_code != 200:
        raise RuntimeError(f"fetch cases failed: {cases.status_code} {cases.text}")

    print(
        json.dumps(
            {
                "status": "ok",
                "email": email,
                "me": me.json(),
                "case_id": case_id,
                "case_count": len(cases.json()) if isinstance(cases.json(), list) else None,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Basic API smoke test.")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    parser.add_argument("--email", default=f"smoke_{uuid.uuid4().hex[:8]}@neethivaan.com")
    parser.add_argument("--password", default="Smoke@123")
    args = parser.parse_args()
    run(args.base_url, args.email, args.password)
