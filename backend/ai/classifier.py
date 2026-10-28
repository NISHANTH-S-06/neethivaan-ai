# Neethivaan AI Module - Classifier
# Phase 3: AI Backend Implementation
from .llm_client import _call_ollama
from .prompts import CLASSIFICATION_PROMPT, NER_PROMPT
import json
import logging

logger = logging.getLogger("neethivaan.ai.classifier")

def _get_json_completion(prompt: str):
    try:
        content = _call_ollama(prompt)
        
        # Clean up JSON from markdown if necessary
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        return json.loads(content)
    except Exception as e:
        logger.error(f"Classification parse error: {e}")
        return {"error": str(e)}

def classify_complaint(description: str):
    """Classify complaint category and severity."""
    prompt = CLASSIFICATION_PROMPT.format(text=description)
    return _get_json_completion(prompt)

def extract_entities(description: str):
    """Named Entity Recognition (NER) on complaint text."""
    prompt = NER_PROMPT.format(text=description)
    return _get_json_completion(prompt)
