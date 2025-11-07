# 🔍 Semantic Search - Setup Guide

**Get semantic search working in 15 minutes!**

---

## ✅ What You Just Got

I've created a complete Python AI backend for semantic search:

- 🧠 **Sentence Transformers** - Converts text to vectors
- 📊 **Qdrant Vector DB** - Fast similarity search
- 🚀 **FastAPI Server** - REST API for search
- 🔄 **Batch Script** - Embed all existing stories

---

## 🎯 Setup Steps (Run These in Order)

### Step 1: Pull the Code

```bash
palmpull
```

### Step 2: Install Python Dependencies

```bash
palm
cd web-platform/ai-services

# Activate your virtual environment
source ../venv/bin/activate

# Install requirements (takes ~2 minutes)
pip install -r requirements.txt
```

### Step 3: Start Qdrant (Vector Database)

**Option A: Using Docker (Easiest)**

```bash
docker run -d -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    --name qdrant \
    qdrant/qdrant
```

**Option B: Install Qdrant Desktop App**
- Download from: https://qdrant.tech/documentation/quick-start/
- Install and run on macOS

**Verify Qdrant is running:**
```bash
curl http://localhost:6333/
# Should return: {"title":"qdrant - vector search engine",...}
```

### Step 4: Configure Environment Variables

```bash
cd web-platform/ai-services

# Copy the example
cp .env.example .env

# Edit with your credentials
nano .env
```

**Add your Supabase credentials:**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
QDRANT_URL=http://localhost:6333
```

### Step 5: Generate Embeddings for Existing Stories

```bash
# Run the embedding script
python scripts/embed_existing_stories.py
```

This will:
1. ✅ Fetch all stories from Supabase
2. ✅ Generate vector embeddings
3. ✅ Upload to Qdrant
4. ✅ Save back to Supabase

**Expected output:**
```
🚀 Starting story embedding process...
📦 Step 1: Setting up Qdrant collection...
✅ Created collection: palm_island_stories
📚 Step 2: Fetching stories from Supabase...
   Found 25 stories
🧠 Step 3: Generating embeddings for 25 stories...
   [1/25] Processing: Fishing with Grandfather...
   [2/25] Processing: Traditional Hunting Methods...
   ...
✅ Embedding process complete!
   Successful: 25
   Errors: 0
```

### Step 6: Start the API Server

```bash
python main.py
```

Server starts at: **http://localhost:8000**

**Expected output:**
```
🚀 Starting Palm Island AI Services...
✅ Qdrant collection ready
INFO:     Started server process [12345]
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 7: Test Semantic Search!

**Open a new terminal and run:**

```bash
# Test health
curl http://localhost:8000/health

# Search for stories
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "fishing with grandfather", "limit": 5}'
```

---

## 🧪 Test Queries to Try

```bash
# Traditional knowledge
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "traditional fishing methods"}'

# Family stories
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "stories from elders"}'

# Cultural practices
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "hunting and gathering"}'
```

---

## 📂 File Locations

```
web-platform/ai-services/
├── README.md                    ← Full documentation
├── main.py                      ← FastAPI server (run this)
├── requirements.txt             ← Python packages
├── .env                        ← Your credentials
├── services/
│   ├── embeddings.py           ← Embedding generation
│   └── semantic_search.py      ← Search logic
├── utils/
│   ├── supabase_client.py      ← Database access
│   └── qdrant_client.py        ← Vector DB
└── scripts/
    └── embed_existing_stories.py  ← Batch embedding
```

---

## 🐛 Troubleshooting

### Docker not found
```bash
# Install Docker Desktop for Mac
# Download from: https://www.docker.com/products/docker-desktop
```

### "Connection refused" (Port 6333)
**Problem:** Qdrant not running
```bash
# Start Qdrant
docker start qdrant

# Or if first time:
docker run -d -p 6333:6333 --name qdrant qdrant/qdrant
```

### "Missing Supabase credentials"
**Problem:** .env file not configured
```bash
cd web-platform/ai-services
cp .env.example .env
nano .env  # Add your Supabase keys
```

### "No stories found"
**Problem:** Database is empty
**Solution:** Add some stories to Supabase first, then run the embedding script

### Model download slow
**Problem:** First-time model download
**Solution:** Wait ~1 minute, it only happens once

---

## ✅ Success Checklist

- [ ] Pulled latest code (`palmpull`)
- [ ] Installed Python dependencies
- [ ] Qdrant running on port 6333
- [ ] Created `.env` with Supabase credentials
- [ ] Ran embedding script successfully
- [ ] API server running on port 8000
- [ ] Test query returns results

---

## 🎉 You're Done!

Once all steps are complete, you have:

✅ **Semantic search working** - Search by meaning, not keywords
✅ **Vector database** - Fast similarity search
✅ **REST API** - Ready for frontend integration
✅ **All stories embedded** - Searchable by semantic similarity

---

## 🚀 Next Steps

1. **Test the API** - Try different search queries
2. **Integrate with frontend** - Add search UI to Next.js
3. **Add more stories** - The more content, the better search works
4. **Monitor performance** - Check Qdrant dashboard at http://localhost:6333/dashboard

---

## 📞 Need Help?

1. Check `web-platform/ai-services/README.md` for detailed docs
2. Review `AI_ML_BUILD_PLAN.md` for architecture overview
3. Make sure all environment variables are set correctly
4. Verify Qdrant is running: `curl http://localhost:6333/`

---

**Ready to test?** Run through the steps above and let me know if you hit any issues!
