import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.ai.rag_pipeline import run_rag_pipeline

logger = logging.getLogger("neethivaan.rag.api")

router = APIRouter()


class ChatRequest(BaseModel):
    query: str


@router.post("/rag-chat")
async def rag_chat(request: ChatRequest):
    """
    POST /rag-chat

    Accepts a JSON body with a 'query' field and returns
    the RAG pipeline result: query, context, and answer prompt.
    """
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query must not be empty or blank.")

    try:
        result = run_rag_pipeline(request.query.strip())
        return result
    except Exception as e:
        logger.exception("RAG chat endpoint failed for query: %s", request.query)
        raise HTTPException(status_code=500, detail=f"RAG pipeline error: {str(e)}")
