import os
import json
import requests
import logging

logger = logging.getLogger("neethivaan.ai.llm")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")
MODEL = os.getenv("OLLAMA_MODEL", "mistral")

def _call_ollama(prompt: str, system_prompt: str | None = None) -> str:
    """Helper to call Ollama generate API (with mock fallback)."""
    try:
        url = f"{OLLAMA_URL}/api/generate"
        payload = {
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_ctx": 2048
            }
        }
        if system_prompt:
            payload["system"] = system_prompt
            
        logger.info(f"Calling Ollama at {url} with model {MODEL}")
        response = requests.post(url, json=payload, timeout=5) # Reduced timeout for local testing
        response.raise_for_status()
        return response.json().get("response", "")
    except Exception as e:
        logger.warning(f"Ollama call failed ({e}), returning mock response.")
        # Return a mock response for local verification
        return "Legal Analysis: Based on the provided context, the issue described appears to be a civil/criminal matter. Suggestions: 1. File a formal complaint at the nearest station. 2. Consult a legal expert for further advice. (MOCK RESPONSE)"

def generate(prompt: str, system_prompt: str | None = None) -> str:
    """Public wrapper for generating a response from Ollama."""
    return _call_ollama(prompt, system_prompt=system_prompt)

def analyze_complaint(complaint_data: dict, retrieved_chunks: list) -> dict:
    context = "\n".join([c["document"] for c in retrieved_chunks if "document" in c])
    prompt = f"""[NEETHIVAAN CASE ANALYSIS ENGINE — v1.0]
    RETRIEVED LEGAL CONTEXT: {context}
    COMPLAINT DATA: {json.dumps(complaint_data)}
    
    Based on the context and complaint data, provide a structured analysis.
    Return JSON format only."""
    
    content = _call_ollama(prompt)
    
    try:
        # Basic cleanup of markdown if LLM returns it
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        return json.loads(content)
    except Exception as e:
        logger.error(f"Failed to parse LLM response as JSON: {e}")
        return {"error": "Failed to parse JSON", "raw": content}

def generate_report(selected_suggestions: dict, complaint_summary: str) -> dict:
    prompt = f"""[NEETHIVAAN FINAL REPORT GENERATOR — v1.0]
    SUMMARY: {complaint_summary}
    SUGGESTIONS: {json.dumps(selected_suggestions)}
    
    Generate a formatted legal report based on these details.
    Return JSON format only."""
    
    content = _call_ollama(prompt)
    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        return json.loads(content)
    except:
        return {"report_title": "Legal Report", "content": content}

def chat_response(session_history: list, user_message: str, retrieved_chunks: list) -> str:
    context = "\n".join([c["document"] for c in retrieved_chunks if "document" in c])
    system_prompt = f"You are Neethivaan Legal AI. Use this CONTEXT: {context}"
    
    # Construct history-aware prompt
    history_text = ""
    for msg in session_history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        history_text += f"{role.upper()}: {content}\n"
    
    full_prompt = f"{history_text}USER: {user_message}\nASSISTANT:"
    
    return _call_ollama(full_prompt, system_prompt=system_prompt)
