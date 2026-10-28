# Phase 5 — RAG Chat Module Documentation

## Endpoint

**POST** `/api/rag-chat`

## Input

```json
{
  "query": "What are the penalties for cyber fraud?"
}
```

| Field   | Type   | Required | Notes                    |
|---------|--------|----------|--------------------------|
| `query` | string | Yes      | Must not be empty/blank  |

## Output

```json
{
  "query": "What are the penalties for cyber fraud?",
  "context": "Section 66A of IT Act: Punishment for...",
  "answer": "You are a legal assistant specializing in Tamil Nadu laws.\n\nUse the following legal context...\n\nAnswer:"
}
```

| Field     | Type   | Description                                   |
|-----------|--------|-----------------------------------------------|
| `query`   | string | The original user query                       |
| `context` | string | Retrieved law text from ChromaDB              |
| `answer`  | string | Constructed prompt with context + question    |

## Error Responses

| Status | Condition               | Detail                              |
|--------|-------------------------|-------------------------------------|
| 400    | Empty or blank query    | `"Query must not be empty or blank."`|
| 422    | Missing `query` field   | Pydantic validation error           |
| 500    | Pipeline failure        | `"RAG pipeline error: ..."`         |

## How to Test

### 1. Start Services

```bash
docker-compose up --build
```

### 2. Check Health

```bash
curl http://localhost:8000/api/health
# Expected: {"status": "ok"}
```

### 3. Send a Query

```bash
curl -X POST http://localhost:8000/api/rag-chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is cyber fraud?"}'
```

### 4. Run Automated Tests

```bash
python -m pytest backend/tests/test_rag_chat.py -v
```

### 5. Run Manual Test Script

```bash
python scripts/test_rag_manual.py
```

## Debugging

### Check Backend Logs

```bash
docker-compose logs -f backend
```

Look for log lines prefixed with `neethivaan.rag`:

- `INFO  - RAG query received: ...`
- `INFO  - Vector search returned N results`
- `WARNING - No results found for query: ...`
- `ERROR - Vector search failed for query '...': ...`

### Debug Task Endpoint

```bash
curl http://localhost:8000/api/debug-task
```

### Common Issues

| Problem                     | Solution                                      |
|-----------------------------|-----------------------------------------------|
| No results returned         | Verify laws are ingested: check ChromaDB data |
| Embedding model not found   | Check `EMBEDDING_MODEL` env or network access |
| ChromaDB connection error   | Verify `CHROMA_PATH` env and volume mounts    |
| Slow first query            | Model is loading on first call, subsequent queries will be faster |

## Validation Checklist

- [ ] Backend starts without errors
- [ ] `GET /api/health` returns `{"status": "ok"}`
- [ ] `POST /api/rag-chat` with valid query returns 200
- [ ] Response contains `query`, `context`, `answer` keys
- [ ] Empty query returns 400
- [ ] Missing query field returns 422
- [ ] Logs show RAG pipeline activity
- [ ] Existing routers (`/api/chat/*`, complaints, reports, lawyer) still work
- [ ] No existing data deleted from ChromaDB
