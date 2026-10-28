"""
Lazy-loads SentenceTransformer on first call to avoid slow startup
and crashes if the package is not installed.
"""
import logging

logger = logging.getLogger("neethivaan.ai.embeddings")

_model = None

def _get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("SentenceTransformer model loaded.")
        except Exception as e:
            logger.warning(f"SentenceTransformer unavailable ({e}). Using zero-vector fallback.")
            _model = "unavailable"
    return _model


def get_embedding(text: str):
    """Generates embeddings using sentence-transformers (lazy-loaded)."""
    if not text:
        return []
    model = _get_model()
    if model == "unavailable":
        # Return a fixed-length zero vector as fallback (dim=384 for MiniLM)
        return [0.0] * 384
    try:
        embedding = model.encode(text)
        return embedding.tolist()
    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        return [0.0] * 384
