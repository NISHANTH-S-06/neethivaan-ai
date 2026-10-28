import logging
import requests
from sqlalchemy.orm import Session
from backend.models import Complaint

logger = logging.getLogger("neethivaan.fir")

def generate_fir_text(case_id: str, db: Session) -> str:
    """
    Generates a formal FIR text for a given case_id using Ollama.
    """
    complaint = db.query(Complaint).filter(Complaint.case_id == case_id).first()
    if not complaint:
        raise ValueError(f"Complaint with case_id {case_id} not found")

    context = complaint.ai_context or ""
    description = complaint.description or ""
    
    prompt = (
        f"You are a senior police officer in India. Write a formal First Information Report (FIR) based on the following details.\n\n"
        f"Case ID: {case_id}\n"
        f"Complainant: {complaint.complainant_name}\n"
        f"Incident Description: {description}\n\n"
        f"Legal Context/Reference:\n{context}\n\n"
        f"The FIR should be professional, structured, and use appropriate legal terminology. "
        f"Include sections for Date/Time, Location, Details of Offence, and a formal statement.\n\n"
        f"FIR Text:"
    )

    try:
        logger.info("Generating FIR for case %s", case_id)
        import os
        ollama_url = os.getenv("OLLAMA_URL", "http://ollama:11434")
        response = requests.post(
            f"{ollama_url}/api/generate",
            json={
                "model": "mistral",
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )
        response.raise_for_status()
        fir_text = response.json().get("response", "")
        
        # Save to database
        complaint.fir_text = fir_text
        db.commit()
        db.refresh(complaint)
        
        return fir_text

    except Exception as e:
        logger.error("Failed to generate FIR for %s: %s", case_id, e)
        raise RuntimeError(f"FIR generation failed: {e}")
