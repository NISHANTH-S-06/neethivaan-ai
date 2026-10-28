import logging
from backend.ai.rag_pipeline import run_rag_pipeline as rag_answer

logger = logging.getLogger("neethivaan.lawyer")

def ask_lawyer_ai(question: str) -> str:
    """
    Lawyer AI assistant that provides legal advice using RAG and Ollama.
    """
    try:
        logger.info("Lawyer AI query received: %s", question)
        
        # We reuse the existing RAG pipeline to get a grounded answer
        # In the future, we can customize the prompt here for a "lawyer" persona.
        result = rag_answer(question)
        
        return result.get("answer", "I'm sorry, I couldn't generate a legal answer at this time.")

    except Exception as e:
        logger.error("Lawyer AI failed for query '%s': %s", question, e)
        raise RuntimeError(f"Lawyer AI service error: {e}")
