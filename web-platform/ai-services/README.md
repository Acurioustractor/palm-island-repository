# 🤖 AI Services - Semantic Search

Python backend for AI-powered semantic search on Palm Island stories.

---

## 🚀 Quick Start (5 Steps)

### Step 1: Install Dependencies

```bash
cd web-platform/ai-services

# Make sure you're in the venv
source ../venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### Step 2: Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit with your actual credentials
nano .env
```

Required variables:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
QDRANT_URL=http://localhost:6333
```

### Step 3: Start Qdrant Vector Database

**Option A: Using Docker (Recommended)**
```bash
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

**Option B: Download Binary**
- Visit https://qdrant.tech/documentation/quick-start/
- Download for macOS
- Run locally

### Step 4: Generate Embeddings for Existing Stories

```bash
# Make the script executable
chmod +x scripts/embed_existing_stories.py

# Run the embedding script
python scripts/embed_existing_stories.py
```

This will:
- ✅ Fetch all stories from Supabase
- ✅ Generate embeddings using sentence-transformers
- ✅ Upload embeddings to Qdrant
- ✅ Save embeddings back to Supabase

### Step 5: Start the API Server

```bash
python main.py
```

Server runs at: `http://localhost:8000`

---

## 🧪 Test Semantic Search

### Using curl:

```bash
# Test health endpoint
curl http://localhost:8000/health

# Search for stories
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "fishing with grandfather", "limit": 5}'
```

### Using Python:

```python
import requests

response = requests.post(
    "http://localhost:8000/api/search",
    json={"query": "traditional fishing methods", "limit": 10}
)

results = response.json()
for result in results:
    print(f"{result['title']} - Score: {result['score']:.3f}")
```

---

## 📁 Project Structure

```
ai-services/
├── main.py                          # FastAPI server
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment template
├── .env                            # Your credentials (gitignored)
├── services/
│   ├── embeddings.py               # Embedding generation
│   └── semantic_search.py          # Search logic
├── utils/
│   ├── supabase_client.py          # Supabase helpers
│   └── qdrant_client.py            # Vector DB helpers
└── scripts/
    └── embed_existing_stories.py   # Initial embedding script
```

---

## 🔌 API Endpoints

### `GET /` - Health Check
```bash
curl http://localhost:8000/
```

### `GET /health` - Detailed Health
```bash
curl http://localhost:8000/health
```

### `POST /api/search` - Semantic Search
Search for stories by meaning

Request:
```json
{
  "query": "fishing with elders",
  "limit": 10
}
```

Response:
```json
[
  {
    "id": "uuid-here",
    "score": 0.87,
    "title": "Traditional Fishing Methods",
    "content_preview": "My grandfather taught me...",
    "story_type": "oral_history",
    "created_at": "2024-01-01"
  }
]
```

### `POST /api/embedding` - Generate Embedding
Get embedding for any text

Request:
```json
{
  "text": "Traditional fishing"
}
```

Response:
```json
{
  "embedding": [0.123, -0.456, ...],
  "dimension": 384
}
```

---

## 🎯 How It Works

1. **Sentence Transformers** converts text to 384-dimensional vectors
2. **Qdrant** stores these vectors for fast similarity search
3. **Cosine similarity** finds the most semantically similar stories
4. **FastAPI** provides REST API for the frontend

### Example Search Flow:

```
User searches: "fishing with grandfather"
    ↓
Convert query to embedding: [0.12, -0.34, ...]
    ↓
Search Qdrant for similar vectors
    ↓
Return top 10 most similar stories
    ↓
Display results sorted by relevance
```

---

## 🐛 Troubleshooting

### "Connection refused" error
**Problem:** Qdrant isn't running
**Solution:** Start Qdrant with Docker (see Step 3)

### "Missing Supabase credentials"
**Problem:** .env file not configured
**Solution:** Copy .env.example to .env and add your credentials

### "Model not found"
**Problem:** First time downloading the model
**Solution:** Wait ~30 seconds for model download (happens once)

### "No stories found"
**Problem:** Database is empty
**Solution:** Add some stories to Supabase first

---

## 🔄 Updating Embeddings

When you add new stories, run:

```bash
python scripts/embed_existing_stories.py
```

Or create a webhook in Supabase to auto-generate embeddings on story creation.

---

## 🚀 Next Steps

- [ ] Set up Qdrant (Step 3)
- [ ] Configure .env file (Step 2)
- [ ] Generate embeddings (Step 4)
- [ ] Test the API (Step 5)
- [ ] Integrate with Next.js frontend

---

## 📚 Resources

- **Sentence Transformers**: https://www.sbert.net/
- **Qdrant Docs**: https://qdrant.tech/documentation/
- **FastAPI Docs**: https://fastapi.tiangolo.com/

---

**Questions?** Check the main AI_ML_BUILD_PLAN.md in the repo root!
