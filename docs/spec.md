# NEETHIVAAN 6-Phase Project Specification (Revised for InsForge BaaS)

══════════════════════════════════════════
PHASE 1 — FOUNDATION & SETUP (Weeks 1–2)
══════════════════════════════════════════
STEP 1.1 — Repository & Project Structure
  - Create GitHub monorepo: /frontend, /backend (Edge Functions/Scripts), /ai, /infra, /docs
  - Set up branch strategy: main / develop / feature/*
  - Add .env.example with all required InsForge environment variables (URL + Anon Key)
STEP 1.2 — Backend Service / Local Stack (InsForge native)
  Services to define:
  - InsForge Auth, PostgreSQL Database, Storage, and Edge Functions via InsForge cloud natively.
  - /ai service (Optional custom wrapper for Ollama on Oracle Free VM if local Mistral-7B is strictly required, else InsForge AI native APIs).
  - Redis:7 / ChromaDB (Required ONLY if integrating custom heavy Vector retrieval in the /ai folder instead of using pgvector in InsForge DB).
STEP 1.3 — Database Schema (InsForge PostgreSQL)
  Define tables directly in InsForge or via InsForge raw SQL / migrations.
  1. users (Managed by InsForge Auth, extended via public profiles table containing language_pref)
  2. lawyers — bar_number, specializations, etc.
  3. admins — department, permissions
  4. complaints — case_id, title, issue_type, fir_csrtype, etc.
  5. attachments — complaint_id, storage_path, file_type
  6. case_analysis — complaint_id, analysis_json, selected_suggestions_json
  7. legal_reports — pdf_path, share_token
  8. audit_logs
  9. notifications
  10. laws — act_name, section, embedding (using pgvector extension in InsForge DB)
  11. chat_sessions
  * All access control transitions from FastAPI RBAC to PostgreSQL Row Level Security (RLS) policies.
STEP 1.4 — Authentication System (InsForge Auth)
  - Utilize native InsForge Auth endpoints for email/password and OTP login.
  - Rate limiting and session management automatically handled by the BaaS.
  - RBAC handled by JWT custom claims or InsForge RLS policies ("user", "lawyer", "admin").
STEP 1.5 — CI/CD Pipeline (GitHub Actions)
  Workflow: on push to develop:
  1. Lint (ESLint + flake8 for /ai)
  2. Frontend deployment via `insforge create-deployment`
  3. Edge functions deployment via `insforge update-function`
  4. Custom AI processing service deployed to Oracle Cloud VM natively.

══════════════════════════════════════════
PHASE 2 — USER PORTAL & COMPLAINT ENGINE (Weeks 3–4)
══════════════════════════════════════════
STEP 2.1 — Frontend Setup (Next.js 14)
  - Configure via InsForge `download-template` (Next.js version).
  - Include Tailwind CSS, shadcn/ui.
STEP 2.2 — Direct Database Mutatons (InsForge Auto API)
  - Create/Update complaints by calling InsForge PostgREST APIs natively from the Next.js client.
  - `const { data, error } = await supabase.from('complaints').insert([...])`
STEP 2.3 — Storage (InsForge Storage)
  - Direct secure uploads from frontend browser to InsForge Storage Buckets without bouncing through a custom backend server.

══════════════════════════════════════════
PHASE 3 — AI CORE: RAG + CASE ANALYSIS
══════════════════════════════════════════
STEP 3.1 — Legal Knowledge Base
  - Instead of ChromaDB, use native pgvector in InsForge PostgreSQL.
STEP 3.2 — LLM Integration
  - InsForge AI chat completions for basic conversational elements.
  - Heavy document extraction & RAG orchestration can be delegated to an InsForge Edge Function or an external Python endpoint running on the Oracle Free tier VM.

══════════════════════════════════════════
TECH STACK SUMMARY (REVISED)
══════════════════════════════════════════
Frontend:     Next.js 14 + Tailwind CSS + shadcn/ui + InsForge SDK
Backend:      InsForge Edge Functions (JavaScript) + PostgREST Auto Routes
Database:     InsForge Serverless PostgreSQL 15 + pgvector
File Storage: InsForge Storage
Auth:         InsForge Auth
AI:           InsForge AI / Self-hosted Ollama on Oracle Cloud (if heavy model needed)
Hosting:      InsForge Deployment (Frontend apps and Edge Functions) + Oracle Free Tier (/ai processing)
