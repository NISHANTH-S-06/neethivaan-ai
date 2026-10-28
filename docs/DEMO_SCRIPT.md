# NEETHIVAAN AI — DEMO VIDEO SCRIPT

**Duration:** 10-15 minutes
**Objective:** Complete presentation covering all stages and features of the Neethivaan Legal Platform.

---

## INTRO (0:00 - 1:00)

### Scene 1: Title card
- **Show:** Black screen with Neethivaan AI logo
- **Actions:** None
- **Narration:** "Welcome to Neethivaan AI — An intelligent legal assistance platform built for citizens of Tamil Nadu and India. This platform helps common people access legal help, file complaints, track cases, and get AI-powered legal guidance — completely free of cost."
- **Duration:** 30 seconds

### Scene 2: Architecture overview
- **Show:** Docker containers running (Terminal: `docker ps --format "table {{.Names}}\t{{.Status}}"`)
- **Actions:** Run the command in terminal
- **Narration:** "Neethivaan runs on a full production stack — 11 services working together: NextJS frontend, FastAPI backend, PostgreSQL database, Redis, Celery workers, ChromaDB vector database, Ollama AI, MinIO storage, MeiliSearch, ClamAV antivirus, and Nginx."
- **Duration:** 30 seconds

---

## STAGE 1 — HOMEPAGE AND NAVIGATION (1:00 - 2:00)

### Scene 3: Homepage
- **Show:** http://localhost:3000
- **Actions:** Scroll through homepage slowly
- **Narration:** "The homepage introduces users to the platform. Clean, responsive design with clear navigation to all features."
- **Duration:** 30 seconds

### Scene 4: About and Contact pages
- **Show:** /about then /contact
- **Actions:** Click through navigation menu
- **Narration:** "Public pages like About and Contact are accessible without login, making the platform welcoming to all citizens."
- **Duration:** 30 seconds

---

## STAGE 2 — USER REGISTRATION AND LOGIN (2:00 - 3:30)

### Scene 5: Registration page
- **Show:** /register
- **Actions:** Fill in name, email, password (Use: `demo@neethivaan.com` / `Demo@1234`)
- **Narration:** "New users can register in seconds. The system validates inputs and securely stores passwords using bcrypt hashing."
- **Duration:** 45 seconds

### Scene 6: Login and JWT
- **Show:** /login
- **Actions:** Login with registered credentials. Open browser DevTools → Application → LocalStorage → show JWT token
- **Narration:** "Authentication uses JWT tokens — industry standard security. The token identifies the user across all API calls."
- **Duration:** 45 seconds

---

## STAGE 3 — USER DASHBOARD (3:30 - 4:30)

### Scene 7: Dashboard
- **Show:** /dashboard
- **Actions:** Show all dashboard widgets
- **Narration:** "The dashboard gives users a complete overview — their complaints, case status, quick links to all features, and personalized legal suggestions."
- **Duration:** 60 seconds

---

## STAGE 4 — COMPLAINT FILING (4:30 - 6:00)

### Scene 8: Complaints list
- **Show:** /complaints
- **Actions:** Show existing complaints list
- **Narration:** "Citizens can view all their complaints in one place with current status — pending, in progress, or resolved."
- **Duration:** 30 seconds

### Scene 9: File new complaint
- **Show:** /complaints/new
- **Actions:** 
  - Fill title: "Police refusing to file FIR"
  - Fill description: "I went to the police station on March 25 2026. The officer refused to file my complaint without reason."
  - Select category: Police Misconduct
  - Click Submit
- **Narration:** "Filing a complaint is simple and guided. The AI system automatically analyzes the complaint and assigns it to the right department. ClamAV scans any attached files for viruses before upload."
- **Duration:** 60 seconds

### Scene 10: Celery background task
- **Show:** Terminal (Command: `docker logs neethivaan-worker-1 --tail 10`)
- **Actions:** Show the logs processing
- **Narration:** "In the background, Celery workers process the complaint — running AI analysis, generating case summaries, and sending notifications automatically."
- **Duration:** 30 seconds

---

## STAGE 5 — COMPLAINT TRACKING (6:00 - 6:45)

### Scene 11: Tracking page
- **Show:** /tracking
- **Actions:** Enter complaint ID and search
- **Narration:** "The tracking page lets citizens monitor their complaint status in real time. No login required — just enter your complaint reference number."
- **Duration:** 45 seconds

---

## STAGE 6 — AI LEGAL CHATBOT (6:45 - 8:30)

### Scene 12: Chat interface
- **Show:** /chat
- **Actions:** Type question: "What is IPC Section 420 and what is the punishment for it?" Wait for response. Show AI reply.
- **Narration:** "The AI chatbot is powered by Ollama running the Mistral model — completely local, completely free, completely private. No data leaves your server."
- **Duration:** 45 seconds

### Scene 13: RAG pipeline demo
- **Show:** /chat
- **Actions:** Type question: "What legal action can I take if police refuse to file my FIR in Tamil Nadu?" Wait for response. Show AI reply with legal context retrieved from ChromaDB.
- **Narration:** "The system uses RAG — Retrieval Augmented Generation. It searches our ChromaDB vector database for relevant laws and feeds them to the AI model. This gives accurate, context-aware legal answers."
- **Duration:** 60 seconds

---

## STAGE 7 — FIR FILING (8:30 - 9:15)

### Scene 14: FIR page
- **Show:** /fir
- **Actions:** Fill FIR form with sample data:
  - Complainant: Demo User
  - Incident: Theft of mobile phone
  - Location: Chennai, Tamil Nadu
  - Date: March 25 2026
  - Click Submit
- **Narration:** "Citizens can draft and submit FIR applications directly through the platform. The system generates a properly formatted FIR document ready for submission to the police station."
- **Duration:** 45 seconds

---

## STAGE 8 — LAWYER DIRECTORY (9:15 - 9:45)

### Scene 15: Lawyers page
- **Show:** /lawyers
- **Actions:** Browse lawyer listings, show search/filter functionality
- **Narration:** "The lawyer directory helps citizens find qualified legal professionals by specialization, location, and availability. All verified and categorized for easy access."
- **Duration:** 30 seconds

---

## STAGE 9 — REPORTS (9:45 - 10:15)

### Scene 16: Reports page
- **Show:** /reports
- **Actions:** View generated reports, show PDF download if available
- **Narration:** "Legal reports and case summaries are auto-generated and stored securely in MinIO object storage with presigned download URLs for secure access."
- **Duration:** 30 seconds

---

## STAGE 10 — ADMIN PANEL (10:15 - 11:00)

### Scene 17: Admin dashboard
- **Show:** /admin (login as admin user)
- **Actions:** Show complaint management, user management, and system statistics
- **Narration:** "Administrators have full oversight — managing complaints, users, lawyers, and system health from one secure panel. Role-based access ensures only admins can access this section."
- **Duration:** 45 seconds

---

## STAGE 11 — BACKEND API (11:00 - 11:45)

### Scene 18: Swagger documentation
- **Show:** http://localhost:8000/docs
- **Actions:** Expand each endpoint group. Show: `/api/auth`, `/api/chat`, `/api/complaints`, `/api/fir`, `/api/lawyers`, `/api/reports`
- **Narration:** "The FastAPI backend provides a fully documented REST API. Every endpoint is tested and production ready."
- **Duration:** 45 seconds

---

## STAGE 12 — INFRASTRUCTURE (11:45 - 12:30)

### Scene 19: All services running
- **Show:** Terminal (Command: `docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`)
- **Actions:** Show terminal output clearly
- **Narration:** "The entire platform runs on Docker — 11 microservices, each isolated and healthy. Redis caching, PostgreSQL persistence, ChromaDB vectors, MinIO storage — all running locally with zero cloud cost."
- **Duration:** 30 seconds

### Scene 20: MeiliSearch demo
- **Show:** Terminal or API (Command: `curl http://localhost:7700/health`)
- **Actions:** Execute and show response
- **Narration:** "MeiliSearch powers instant search across complaints and legal documents with typo tolerance and millisecond response."
- **Duration:** 15 seconds

### Scene 21: ClamAV protection
- **Show:** Terminal (Command: `docker logs neethivaan-clamav-1 --tail 5`)
- **Actions:** Show antivirus logs
- **Narration:** "Every uploaded file is automatically scanned by ClamAV antivirus before storage, protecting the platform from malicious files."
- **Duration:** 15 seconds

---

## STAGE 13 — GITHUB AND VERSION CONTROL (12:30 - 13:00)

### Scene 22: GitHub repository
- **Show:** https://github.com/nishanthjd27/neethivaan
- **Actions:** Browse repository structure, show commit history, show README
- **Narration:** "The complete source code is on GitHub — fully open, version controlled, and documented for collaboration."
- **Duration:** 30 seconds

---

## CLOSING (13:00 - 14:00)

### Scene 23: Tech stack summary
- **Show:** Slide or terminal with Tech Stack text:
  ```text
  NEETHIVAAN AI — TECH STACK
  ===========================
  Frontend  : NextJS 14 + TypeScript
  Backend   : FastAPI + Python
  Database  : PostgreSQL 15
  Cache     : Redis 7
  AI Model  : Ollama + Mistral (local)
  Vectors   : ChromaDB v2
  Storage   : MinIO (S3 compatible)
  Search    : MeiliSearch
  Security  : ClamAV + JWT + bcrypt
  Queue     : Celery
  Proxy     : Nginx
  Deploy    : Docker Compose
  Cost      : 100% FREE
  ```
- **Narration:** "Neethivaan AI is built entirely on open source technology. No cloud bills. No vendor lock-in. No data privacy concerns. Everything runs locally and securely."
- **Duration:** 30 seconds

### Scene 24: Closing
- **Show:** Homepage
- **Actions:** Smooth pan over the hero section
- **Narration:** "Neethivaan AI — empowering citizens with intelligent legal assistance. Built with passion for justice. Available to everyone, forever free. Thank you."
- **Duration:** 30 seconds
