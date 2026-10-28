/**
 * NEETHIVAAN AI — Frontend Integration Example
 * 
 * Connect your chat UI to the RAG endpoint: POST /api/rag-chat
 * 
 * Payload:  { "query": "user question here" }
 * Response: { "query": "...", "context": "...", "answer": "..." }
 */

// --- 1. Basic fetch example ---

async function askLegalQuestion(query) {
  const response = await fetch('/api/rag-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'RAG request failed');
  }

  return response.json();
}

// Usage:
// const result = await askLegalQuestion("What is the punishment for cyber fraud?");
// console.log(result.answer);


// --- 2. React component example ---

/*
import { useState } from 'react';

function RagChat() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await askLegalQuestion(query);
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rag-chat">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a legal question..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : 'Ask'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {response && (
        <div className="response">
          <h3>Answer</h3>
          <pre>{response.answer}</pre>
          <h4>Sources</h4>
          <pre>{response.context}</pre>
        </div>
      )}
    </div>
  );
}

export default RagChat;
*/
