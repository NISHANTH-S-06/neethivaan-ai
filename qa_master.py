"""
Neethivaan AI - Master QA Test Suite v3 (ASCII-safe for Windows)
Sections: Health, Auth, Complaints, Admin, Lawyer, Chat/RAG, FIR, Security, Routes
"""
import urllib.request, urllib.error, urllib.parse, json, os, sys

BASE = "http://127.0.0.1:8000"
RESULTS = []
TOKEN_ADMIN = TOKEN_USER = TOKEN_LAWYER = None
CASE_ID = None

def req(method, path, payload=None, token=None):
    url = BASE + path
    data = json.dumps(payload).encode() if payload else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    rq = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(rq, timeout=12) as r:
            body = json.loads(r.read())
            return r.status, body
    except urllib.error.HTTPError as e:
        try:    body = json.loads(e.read())
        except: body = {"raw": "parse_error"}
        return e.code, body
    except Exception as e:
        return 0, {"error": str(e)}

def check(name, status, body, expect=200, keys=None):
    ok = (status == expect)
    if ok and keys:
        ok = all(k in body for k in keys)
    tag = "[PASS]" if ok else "[FAIL]"
    RESULTS.append((name, ok, status))
    snippet = json.dumps(body, default=str)[:90]
    # ASCII-safe name
    safe_name = name.encode("ascii", "replace").decode("ascii")
    print("  %s %-52s HTTP %d  %s" % (tag, safe_name, status, snippet))
    return ok, body

def sep(title):
    safe = title.encode("ascii", "replace").decode("ascii")
    print("\n" + "="*70)
    print("  " + safe)
    print("="*70)

# S1 — Health
sep("S1 - HEALTH CHECK")
s,b = req("GET","/api/health"); check("GET /api/health",s,b,200,["status","db"])

# S2 — Auth
sep("S2 - AUTH: REGISTER + LOGIN + RBAC")
s,b = req("POST","/api/auth/register",{"email":"qa_admin@nv.com","password":"Admin@9999","role":"admin","full_name":"QA Admin"})
check("Register admin",s,b,200,["msg","id"])
s,b = req("POST","/api/auth/register",{"email":"qa_lawyer@nv.com","password":"Lawyer@9999","role":"lawyer","full_name":"Adv QA"})
check("Register lawyer",s,b,200,["msg","id"])
s,b = req("POST","/api/auth/register",{"email":"qa_citizen@nv.com","password":"Citizen@9999","role":"user","full_name":"QA Citizen"})
check("Register citizen",s,b,200,["msg","id"])
s,b = req("POST","/api/auth/register",{"email":"qa_citizen@nv.com","password":"x","role":"user"})
check("Register duplicate (expect 400)",s,b,400)
s,b = req("POST","/api/auth/login",{"email":"qa_admin@nv.com","password":"Admin@9999"})
ok,b = check("Login admin",s,b,200,["access_token","role"])
TOKEN_ADMIN = b.get("access_token")
s,b = req("POST","/api/auth/login",{"email":"qa_lawyer@nv.com","password":"Lawyer@9999"})
ok,b = check("Login lawyer",s,b,200,["access_token"])
TOKEN_LAWYER = b.get("access_token")
s,b = req("POST","/api/auth/login",{"email":"qa_citizen@nv.com","password":"Citizen@9999"})
ok,b = check("Login citizen",s,b,200,["access_token"])
TOKEN_USER = b.get("access_token")
s,b = req("POST","/api/auth/login",{"email":"qa_citizen@nv.com","password":"WRONG"})
check("Login wrong password (expect 401)",s,b,401)
s,b = req("GET","/api/complaints/")
check("No token on protected route (expect 401)",s,b,401)

# S3 — Complaints
sep("S3 - COMPLAINTS CRUD + RBAC")
s,b = req("POST","/api/complaints/",{
    "title":"Bribe demanded by inspector",
    "description":"Police inspector demanded Rs 10000 to close a property dispute.",
    "issue_type":"Corruption","complainant_name":"QA Citizen",
    "email":"qa_citizen@nv.com","phone":"9876540000","location_text":"Chennai, TN"
}, token=TOKEN_USER)
ok,b = check("Create complaint (citizen)",s,b,200,["case_id","status"])
CASE_ID = b.get("case_id","NEETH-FALLBACK")
print("  [INFO] Created case: " + CASE_ID)

s,b = req("GET","/api/complaints/"+CASE_ID,token=TOKEN_USER)
check("Get complaint by case_id (owner)",s,b,200,["case_id"])
s,b = req("GET","/api/complaints/",token=TOKEN_USER)
check("List complaints as citizen (own only)",s,b,200)
s,b = req("GET","/api/complaints/",token=TOKEN_ADMIN)
check("List complaints as admin (all)",s,b,200)
s,b = req("GET","/api/complaints/"+CASE_ID+"/status",token=TOKEN_USER)
check("Get complaint status",s,b,200,["case_id","status","analysis_status"])
s,b = req("GET","/api/complaints/NEETH-FAKE-99999",token=TOKEN_USER)
check("Get non-existent case (expect 404)",s,b,404)

# Register second citizen and check 403
s,b = req("POST","/api/auth/register",{"email":"other_qa@nv.com","password":"Other@1234","role":"user"})
s2,b2= req("POST","/api/auth/login",{"email":"other_qa@nv.com","password":"Other@1234"})
other_tok = b2.get("access_token")
s,b = req("GET","/api/complaints/"+CASE_ID,token=other_tok)
check("Other citizen cannot view case (expect 403)",s,b,403)
s,b = req("GET","/api/complaints/"+CASE_ID,token=TOKEN_LAWYER)
check("Lawyer can view any complaint",s,b,200)
s,b = req("GET","/api/complaints/"+CASE_ID,token=TOKEN_ADMIN)
check("Admin can view any complaint",s,b,200)

# S4 — Admin
sep("S4 - ADMIN ENDPOINTS")
s,b = req("GET","/api/admin/stats",token=TOKEN_ADMIN)
check("GET /admin/stats",s,b,200,["total_users","total_complaints","total_lawyers"])
s,b = req("GET","/api/admin/users",token=TOKEN_ADMIN)
check("GET /admin/users",s,b,200)
s,b = req("GET","/api/admin/lawyers",token=TOKEN_ADMIN)
check("GET /admin/lawyers",s,b,200)
s,b = req("GET","/api/admin/audit-logs",token=TOKEN_ADMIN)
check("GET /admin/audit-logs",s,b,200)
s,b = req("GET","/api/admin/complaints/coordinates",token=TOKEN_ADMIN)
check("GET /admin/complaints/coordinates",s,b,200)
s,b = req("GET","/api/admin/insights",token=TOKEN_ADMIN)
check("GET /admin/insights (AI)",s,b,200,["insights"])

# RBAC enforcement
s,b = req("GET","/api/admin/stats",token=TOKEN_USER)
check("Citizen cannot access admin stats (expect 403)",s,b,403)
s,b = req("GET","/api/admin/stats",token=TOKEN_LAWYER)
check("Lawyer cannot access admin stats (expect 403)",s,b,403)

# Suspend/Activate
_,users = req("GET","/api/admin/users",token=TOKEN_ADMIN)
citizen_id = next((u["id"] for u in users if u.get("email")=="qa_citizen@nv.com"),None)
if citizen_id:
    s,b = req("PATCH","/api/admin/users/"+citizen_id+"/suspend",token=TOKEN_ADMIN)
    ok,b = check("Suspend citizen",s,b,200,["is_active"])
    assert b.get("is_active")==False, "Expected is_active=False after suspend"
    s,b = req("PATCH","/api/admin/users/"+citizen_id+"/activate",token=TOKEN_ADMIN)
    ok,b = check("Activate citizen",s,b,200,["is_active"])
    assert b.get("is_active")==True, "Expected is_active=True after activate"
else:
    print("  [SKIP] citizen_id not found for suspend/activate test")

s,b = req("PATCH","/api/admin/users/00000000-0000-0000-0000-000000000000/suspend",token=TOKEN_ADMIN)
check("Suspend non-existent user (expect 404)",s,b,404)
