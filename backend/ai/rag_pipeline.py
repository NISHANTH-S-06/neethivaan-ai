# Neethivaan AI Module - RAG Pipeline
# Phase 3: AI Backend Implementation
from .embeddings import get_embedding
from .chroma_client import query_collection
from .llm_client import _call_ollama
from .prompts import RAG_PROMPT
import logging

logger = logging.getLogger("neethivaan.ai.rag")

def run_rag_pipeline(query: str):
    """Retrieval-Augmented Generation pipeline."""
    # 1. Embed query
    query_emb = get_embedding(query)
    
    # 2. Retrieve context from laws collection
    try:
        results = query_collection("laws", [query_emb], n_results=3)
        if results and results.get('documents') and results['documents'][0]:
            context = "\n\n".join(results['documents'][0])
        else:
            context = "No relevant laws found in the context of your query."
    except Exception as e:
        logger.error(f"Context retrieval failed: {e}")
        context = f"Context retrieval failed."
        
    # 3. Generate response
    prompt = RAG_PROMPT.format(context=context, query=query)
    try:
        answer = _call_ollama(prompt)
    except Exception as e:
        answer = f"Generation failed: {e}"
        
    return {
        "query": query,
        "retrieved_context": context,
        "answer": answer
    }
