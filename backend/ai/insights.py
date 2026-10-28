# Neethivaan AI Module - Admin Insights
from .llm_client import _call_ollama
import logging

logger = logging.getLogger("neethivaan.ai.insights")

def get_admin_insights(data_summary: str):
    """Generates strategic insights from aggregated data strings."""
    prompt = (
        "You are a strategic analyst for Neethivaan AI. "
        "Review the following system statistics and complaint trends. "
        "Provide exactly 3 concise, actionable strategic insights to help administrators "
        "optimize the platform and better serve citizens.\n\n"
        f"Data Summary:\n{data_summary}\n\n"
        "Strategic Insights:"
    )
    try:
        return _call_ollama(prompt)
    except Exception as e:
        logger.error(f"Insight generation failed: {e}")
        return "Automatic insights temporarily unavailable."
