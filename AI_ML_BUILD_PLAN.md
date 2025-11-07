# 🤖 AI/ML Build Plan - Palm Island Storytelling Platform

**Created:** 2025-11-08
**Python Stack:** PyTorch, Transformers, Sentence-Transformers, YOLO, Face Recognition, Qdrant

---

## 🎯 What You Can Build With Your AI/ML Stack

### 1. **Semantic Search for Stories** ⭐ START HERE
Find stories by meaning, not just keywords
- **Example:** Search "fishing with grandfather" finds stories about traditional fishing even if they don't use those exact words
- **Tech:** Sentence-transformers + Qdrant vector DB
- **Impact:** HIGH - Makes stories discoverable by cultural themes

### 2. **Automatic Face Detection & Tagging**
Identify people in photos automatically
- **Example:** Upload photo → AI suggests which Elders/storytellers are in it
- **Tech:** Face-recognition library
- **Impact:** MEDIUM - Helps connect photos to profiles

### 3. **Cultural Artifact Detection**
Recognize traditional items in photos
- **Example:** Detect didgeridoos, boomerangs, traditional clothing, fishing tools
- **Tech:** YOLO (ultralytics) with custom training
- **Impact:** HIGH - Preserves cultural knowledge

### 4. **Story Content Analysis**
Automatically categorize and tag stories
- **Example:** Detect themes like "Dreamtime", "Fishing", "Language", "Ceremony"
- **Tech:** Transformers (BERT/RoBERTa)
- **Impact:** HIGH - Improves organization

### 5. **Language Detection & Preservation**
Identify traditional language words in stories
- **Example:** Highlight Palm Island language words for preservation
- **Tech:** Custom NLP models
- **Impact:** VERY HIGH - Language preservation

### 6. **Similar Story Recommendations**
"You might also like..." based on content
- **Example:** Reading about traditional fishing → See other fishing stories
- **Tech:** Vector similarity search
- **Impact:** MEDIUM - Engagement

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                        │
│         (TypeScript - web-platform/app/)                    │
│  - Story upload interface                                   │
│  - Semantic search UI                                       │
│  - Photo tagging interface                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTP/API
                 │
┌────────────────▼────────────────────────────────────────────┐
│              Python AI/ML Backend                           │
│           (NEW - web-platform/ai-services/)                 │
│  - FastAPI server                                           │
│  - Embedding generation                                     │
│  - Image analysis                                           │
│  - Face detection                                           │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   Qdrant     │  │  Supabase    │
│  (Vectors)   │  │ (Metadata)   │
└──────────────┘  └──────────────┘
```

---

## 📁 Folder Structure (We'll Create This)

```
web-platform/
├── ai-services/                    ← NEW Python backend
│   ├── requirements.txt            ← Your installed packages
│   ├── .env                        ← API keys
│   ├── main.py                     ← FastAPI server
│   ├── services/
│   │   ├── embeddings.py          ← Generate embeddings
│   │   ├── semantic_search.py     ← Search stories
│   │   ├── face_detection.py      ← Detect faces
│   │   ├── image_analysis.py      ← YOLO object detection
│   │   └── content_analysis.py    ← Story categorization
│   ├── models/
│   │   ├── cultural_artifacts/    ← Custom YOLO weights
│   │   └── story_classifier/      ← Custom text models
│   └── utils/
│       ├── qdrant_client.py       ← Vector DB helper
│       └── supabase_client.py     ← Database helper
└── app/
    └── api/
        └── ai/                     ← Next.js API routes
            ├── search/route.ts     ← Semantic search endpoint
            ├── analyze-image/route.ts
            └── tag-story/route.ts
```

---

## 🚀 Phase 1: Semantic Search (Week 1-2)

### Why Start Here?
- **Immediate value** - Better search = better story discovery
- **Foundation** - Sets up embedding pipeline for everything else
- **Proven tech** - Sentence-transformers works out of the box

### What We'll Build:
1. **Embedding Service** - Convert stories to vectors
2. **Qdrant Setup** - Store vectors for fast search
3. **Search API** - Semantic search endpoint
4. **Frontend UI** - Search box with semantic results

### Steps:
```python
# 1. Generate embeddings for existing stories
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embedding = model.encode("Story about traditional fishing...")

# 2. Store in Qdrant
from qdrant_client import QdrantClient

client = QdrantClient(url="http://localhost:6333")
client.upsert(
    collection_name="stories",
    points=[{
        "id": story_id,
        "vector": embedding,
        "payload": {"title": "...", "content": "..."}
    }]
)

# 3. Search
results = client.search(
    collection_name="stories",
    query_vector=search_embedding,
    limit=10
)
```

### Database Changes Needed:
✅ Already done! The `content_embedding` field exists in your schema.

---

## 🚀 Phase 2: Face Detection (Week 3-4)

### What We'll Build:
1. **Upload Handler** - Process photos on upload
2. **Face Detection** - Find faces in photos
3. **Face Matching** - Match to known storytellers
4. **Tagging UI** - Confirm/correct AI suggestions

### Example Flow:
```python
import face_recognition

# 1. Detect faces in uploaded photo
image = face_recognition.load_image_file("photo.jpg")
face_locations = face_recognition.face_locations(image)
face_encodings = face_recognition.face_encodings(image, face_locations)

# 2. Compare to known faces (from profile photos)
for face_encoding in face_encodings:
    matches = face_recognition.compare_faces(known_faces, face_encoding)
    # Suggest which storyteller this might be
```

---

## 🚀 Phase 3: Cultural Artifact Detection (Week 5-8)

### What We'll Build:
1. **Custom YOLO Model** - Train on cultural items
2. **Image Analysis API** - Detect artifacts in photos
3. **Metadata Tagging** - Auto-tag photos with artifacts found
4. **Cultural Knowledge Base** - Link artifacts to stories

### Training Data Needed:
- 📸 Photos of didgeridoos, boomerangs, fishing tools, etc.
- 🏷️ Labeled examples (100-200 images per category)
- 🎓 Elder validation of categories

### Example:
```python
from ultralytics import YOLO

# Load custom trained model
model = YOLO('models/cultural_artifacts/palm_island.pt')

# Detect artifacts
results = model('photo.jpg')

# Results: "fishing_spear: 0.92, traditional_basket: 0.87"
```

---

## 🚀 Phase 4: Story Content Analysis (Week 9-12)

### What We'll Build:
1. **Theme Classifier** - Detect story themes automatically
2. **Language Extractor** - Find traditional language words
3. **Auto-tagging** - Suggest tags based on content
4. **Cultural Sensitivity** - Flag content needing Elder review

### Example Themes:
- Dreamtime stories
- Fishing & hunting
- Traditional knowledge
- Language & songs
- Family history
- Land & sea country
- Ceremony & culture

---

## 🔑 Environment Variables Needed

Create `web-platform/ai-services/.env`:

```bash
# Supabase (to read/write story data)
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_key  # If using cloud

# Optional: OpenAI (for advanced features)
OPENAI_API_KEY=your_key

# Optional: Hugging Face (for model downloads)
HF_TOKEN=your_token
```

---

## 💰 Cost Estimates

### Free Tier:
- ✅ **Sentence Transformers**: Free (run locally)
- ✅ **YOLO**: Free (run locally)
- ✅ **Face Recognition**: Free (run locally)
- ✅ **Qdrant**: Free (self-hosted or 1GB cloud free tier)

### Paid (Optional):
- 💵 **OpenAI API**: ~$0.0001 per 1K tokens (very cheap)
- 💵 **Qdrant Cloud**: $25/month for 4GB (if needed)
- 💵 **GPU Server**: $0.50/hour on cloud (for training only)

**Recommendation:** Start 100% free with local models!

---

## 🎯 Success Metrics

### Phase 1 (Semantic Search):
- [ ] Can search stories by meaning, not just keywords
- [ ] Search results feel more relevant than keyword search
- [ ] Works with 10+ test queries

### Phase 2 (Face Detection):
- [ ] Correctly identifies faces in 80%+ of photos
- [ ] Suggests correct storyteller 70%+ of the time
- [ ] Elders validate tagging is helpful

### Phase 3 (Artifact Detection):
- [ ] Detects 5+ types of cultural artifacts
- [ ] 80%+ accuracy validated by Elders
- [ ] Auto-tags 50%+ of photos correctly

### Phase 4 (Content Analysis):
- [ ] Categorizes stories into themes accurately
- [ ] Finds traditional language words
- [ ] Reduces manual tagging work by 50%+

---

## 🚦 Next Steps - DO THIS NOW

### Step 1: Set Up Python Backend Structure
```bash
cd web-platform
mkdir -p ai-services/services
mkdir -p ai-services/models
mkdir -p ai-services/utils
```

### Step 2: Create Requirements File
```bash
cd ai-services
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
torch==2.1.0
torchvision==0.16.0
transformers==4.35.0
sentence-transformers==2.2.2
qdrant-client==1.7.0
supabase==2.0.0
python-dotenv==1.0.0
pillow==10.1.0
opencv-python==4.8.1.78
face-recognition==1.3.0
ultralytics==8.0.200
EOF
```

### Step 3: Create Basic FastAPI Server
I'll create this for you in the next step!

---

## ❓ Questions to Answer Before Building

1. **What's your priority?**
   - A) Better search (semantic search) ⭐ RECOMMENDED START
   - B) Photo tagging (face detection)
   - C) Cultural preservation (artifact detection)

2. **Do you have labeled training data?**
   - Photos of cultural artifacts with labels?
   - Examples of story themes/categories?

3. **Elder involvement?**
   - Can Elders validate AI suggestions?
   - Can they help label training data?

4. **Hosting?**
   - Run AI locally on your Mac?
   - Deploy to cloud server?

---

## 📚 Learning Resources

- **Sentence Transformers**: https://www.sbert.net/
- **YOLO Tutorial**: https://docs.ultralytics.com/
- **Qdrant Docs**: https://qdrant.tech/documentation/
- **Face Recognition**: https://github.com/ageitgey/face_recognition

---

**Ready to start?** Tell me which phase you want to build first, and I'll create all the code for you!

My recommendation: **Start with Phase 1 (Semantic Search)** - it's the quickest win and foundation for everything else.
