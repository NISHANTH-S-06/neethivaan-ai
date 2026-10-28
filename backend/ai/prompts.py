# Neethivaan AI Module - Prompts
# Phase 3: AI Backend Implementation

CLASSIFICATION_PROMPT = """
Analyze this complaint description and provide strict categorization.
Return only JSON format WITHOUT ANY markdown formatting or code blocks: {{"category": "Civil/Criminal/Other", "severity": "Low/Medium/High"}}

Description: {text}
"""

NER_PROMPT = """
Extract key entities from this complaint description: Names, Locations, and Dates.
Return only JSON format WITHOUT ANY markdown formatting or code blocks: {{"entities": ["entity1", "entity2"]}}

Description: {text}
"""

RAG_PROMPT = """
[NEETHIVAAN EXPERT LEGAL RAG ENGINE]
Answer the user's query based strictly on this extracted legal context:
{context}

Query: {query}
"""
