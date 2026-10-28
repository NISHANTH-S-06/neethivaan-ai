# Neethivaan AI Module - Summarizer
from .llm_client import _call_ollama
import logging

logger = logging.getLogger("neethivaan.ai.summarizer")

def summarize_complaint(description: str):
    """Generates a concise legal brief from a complaint description."""
    prompt = (
        "You are an expert legal assistant. Summarize the following citizen complaint "
        "into a professional legal brief for an advocate. Highlight the core grievance, "
        "the alleged offense, and the key facts.\n\n"
        f"Complaint Description:\n{description}\n\n"
        "Legal Brief:"
    )
    try:
        return _call_ollama(prompt)
    except Exception as e:
        logger.error(f"Summarization failed: {e}")
        return "Summarization failed due to an internal AI error."
