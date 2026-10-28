from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.database import get_db
import os
import httpx
import asyncio
from fastapi.responses import StreamingResponse

router = APIRouter()

async def _sse_from_text(text: str, delay_s: float = 0.0):
    # Minimal SSE helper for local streaming compatibility.
    for token in (text or "").split(" "):
        yield f"data: {token} \n\n"
        if delay_s:
            await asyncio.sleep(delay_s)
    yield "data: [DONE]\n\n"

@router.post("/chat")
async def ai_chat(request: Request, data: dict, db: Session = Depends(get_db)):
    message = (data.get("message") or "").strip()
    session_id = (data.get("session_id") or "default").strip()
    stream = bool(data.get("stream")) or "text/event-stream" in (request.headers.get("accept", "").lower())

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    api_key = os.getenv("ANTHROPIC_API_KEY", "")

    if api_key and api_key != "your_key_here":
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": "claude-3-haiku-20240307",
                        "max_tokens": 500,
                        "system": "You are a legal AI assistant specialized in Indian law. Help citizens understand their legal rights and procedures. Be clear, simple, and helpful. Always mention consulting a lawyer for serious matters.",
                        "messages": [{"role": "user", "content": message}],
                    },
                )
                if response.status_code != 200:
                    # Don't leak upstream details; fall back to local canned responses.
                    raise RuntimeError(f"Anthropic upstream error: {response.status_code}")

                result = response.json()
                content = result.get("content") or []
                ai_text = ""
                if isinstance(content, list) and content:
                    ai_text = (content[0] or {}).get("text") or ""
                if not ai_text:
                    ai_text = "I received your message but could not generate a response."

                if stream:
                    return StreamingResponse(_sse_from_text(ai_text), media_type="text/event-stream")
                return {"response": ai_text, "session_id": session_id}
        except Exception as e:
            # Non-fatal: we fall back to keyword-based responses below.
            print(f"[WARN] Claude chat failed: {e}")

    legal_responses = {
        "fir": "To file an FIR: Visit your nearest police station, describe the incident to the officer on duty, ensure you get a copy of the FIR with a number. If police refuse, you can approach the Superintendent of Police or file a complaint with the magistrate under Section 156(3) CrPC.",
        "arrest": "If arrested: You have the right to know the reason for arrest, right to inform a family member, right to a lawyer, right to be produced before a magistrate within 24 hours. You cannot be detained beyond 24 hours without magistrate approval.",
        "rti": "To file RTI: Write an application to the Public Information Officer of the concerned department, pay Rs.10 fee (BPL applicants exempt), submit by post or in person. You will receive response within 30 days.",
        "salary": "If employer is not paying salary: Send a legal notice, file complaint with Labour Commissioner, approach Labour Court under Payment of Wages Act. You can also file complaint with Inspector under Shops and Establishments Act.",
        "consumer": "For consumer complaints: File complaint at District Consumer Forum for claims up to Rs.1 crore, State Commission up to Rs.10 crore, National Commission above Rs.10 crore. Attach purchase proof and details of defect.",
    }

    message_lower = message.lower()
    for keyword, response_text in legal_responses.items():
        if keyword in message_lower:
            if stream:
                return StreamingResponse(_sse_from_text(response_text), media_type="text/event-stream")
            return {"response": response_text, "session_id": session_id}

    fallback = {
        "response": f"Thank you for your question about: '{message}'. Under Indian law, citizens have various rights and remedies available. For specific legal advice on your situation, I recommend: 1) Consulting a registered advocate, 2) Visiting your nearest Legal Services Authority (DLSA) for free legal aid, 3) Calling the National Legal Services helpline at 15100. Would you like information about a specific area of law?",
        "session_id": session_id,
    }
    if stream:
        return StreamingResponse(_sse_from_text(fallback["response"]), media_type="text/event-stream")
    return fallback
