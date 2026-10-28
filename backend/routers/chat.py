from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import asyncio

from backend.database import get_db
from backend.ai.rag_pipeline import run_rag_pipeline

router = APIRouter(prefix="/chat", tags=["Chatbot"])

class ChatMessage(BaseModel):
    session_id: str
    message: str

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_endpoint(data: ChatRequest, db: Session = Depends(get_db)):
    message = data.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Empty message")

    # Claude API Integration
    import os
    import httpx
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
                        "max_tokens": 800,
                        "system": "You are Neethivaan Legal AI, a specialized assistant for Indian law. Provide clear, accurate, and concise legal guidance to citizens. Always include a disclaimer that this is not professional legal advice.",
                        "messages": [{"role": "user", "content": message}],
                    },
                )
                if response.status_code == 200:
                    result = response.json()
                    content = result.get("content") or []
                    reply = content[0].get("text") if content else "I could not process your request."
                    return {"reply": reply}
        except Exception as e:
            print(f"[ERROR] Claude chat failed: {e}")

    # Fallback to RAG or canned response
    try:
        from backend.ai.rag_pipeline import run_rag_pipeline
        rag_result = run_rag_pipeline(message)
        if isinstance(rag_result, dict) and rag_result.get("answer"):
            return {"reply": rag_result["answer"]}
    except Exception:
        pass

    return {
        "reply": "I am currently having trouble connecting to my legal database. Please consult a registered advocate for your query."
    }




@router.post("/session")
def create_session(case_id: Optional[str] = None, db: Session = Depends(get_db)):
    return {"session_id": "session_uuid_1234"}

async def mock_stream_response(user_msg: str):
    # Mock SSE token stream for Chat UI
    response = "I am Neethivaan Legal AI. "
    if "lawyer" in user_msg.lower() or "help" in user_msg.lower():
        response += "[TRIGGER:LAWYER_HANDOVER]"
    else:
        response += "Please let me know how I can assist you with your legal query."
        
    for token in response.split(" "):
        yield f"data: {token} \n\n"
        await asyncio.sleep(0.1)

@router.post("/message")
def send_message(msg: ChatMessage, db: Session = Depends(get_db)):
    return StreamingResponse(mock_stream_response(msg.message), media_type="text/event-stream")

@router.get("/history")
def get_history(session_id: str, db: Session = Depends(get_db)):
    return {"history": []}
