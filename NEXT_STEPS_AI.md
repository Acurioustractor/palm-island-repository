# 🚀 Next Steps - AI Platform Development

**Current Status:** ✅ Semantic search working (Phase 1 complete!)
**Next:** Frontend integration + Auto-embedding + Advanced AI features

---

## 📋 Phase 2: Frontend Integration (Week 1-2)

### Goal: Add semantic search to the Next.js app

### Tasks:

#### 1. Create Next.js API Route
**File:** `web-platform/app/api/ai/search/route.ts`
```typescript
// Proxy to Python backend
export async function POST(request: Request) {
  const { query, limit } = await request.json();

  const response = await fetch('http://localhost:8001/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit })
  });

  return Response.json(await response.json());
}
```

#### 2. Create Search Component
**File:** `web-platform/components/SemanticSearch.tsx`
- Search input field
- Real-time results
- Loading states
- Result cards with relevance scores

#### 3. Update Stories Page
**File:** `web-platform/app/stories/page.tsx`
- Add semantic search option
- Toggle between keyword and semantic search
- Display relevance scores
- "Search by meaning" indicator

#### 4. Add Search to Homepage
**File:** `web-platform/app/page.tsx`
- Hero section with search
- "Try: traditional fishing" example queries
- Prominent call-to-action

**Estimated Time:** 4-6 hours

---

## 🔄 Phase 3: Auto-Embedding Pipeline (Week 2)

### Goal: Automatically embed new stories when created

### Option A: Supabase Webhook (Recommended)
```sql
-- Create database function
CREATE OR REPLACE FUNCTION notify_new_story()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('new_story', NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER story_created
  AFTER INSERT ON stories
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_story();
```

**Python listener:**
```python
# Listen for new stories and auto-embed
import asyncpg

async def listen_for_new_stories():
    conn = await asyncpg.connect(DATABASE_URL)
    await conn.add_listener('new_story', handle_new_story)

async def handle_new_story(connection, pid, channel, payload):
    story_id = payload
    # Fetch story, generate embedding, upload
```

### Option B: Supabase Edge Function
```typescript
// Edge function triggered on INSERT
Deno.serve(async (req) => {
  const { record } = await req.json();

  // Call Python backend to generate embedding
  await fetch('http://your-server:8001/api/story-embedding', {
    method: 'POST',
    body: JSON.stringify({
      title: record.title,
      content: record.content
    })
  });
});
```

### Option C: Cron Job (Simplest)
```bash
# Run every hour
0 * * * * cd /path/to/ai-services && python scripts/embed_existing_stories.py
```

**Estimated Time:** 2-3 hours

---

## 🎨 Phase 4: Face Detection (Week 3-4)

### Goal: Auto-tag people in photos

### Implementation:

#### 1. Create Face Detection Service
**File:** `ai-services/services/face_detection.py`
```python
import face_recognition

def detect_faces(image_path):
    image = face_recognition.load_image_file(image_path)
    face_locations = face_recognition.face_locations(image)
    face_encodings = face_recognition.face_encodings(image, face_locations)
    return face_locations, face_encodings

def match_to_profiles(face_encoding, known_faces):
    matches = face_recognition.compare_faces(known_faces, face_encoding)
    face_distances = face_recognition.face_distance(known_faces, face_encoding)
    best_match_index = np.argmin(face_distances)
    return best_match_index if matches[best_match_index] else None
```

#### 2. Build Profile Face Database
- Extract faces from profile photos
- Store encodings in database
- Index by storyteller_id

#### 3. Create Photo Upload Handler
- Detect faces on upload
- Suggest storyteller tags
- Let user confirm/correct

#### 4. Add UI Components
- Face bounding boxes
- Tag suggestions
- Confidence scores

**Estimated Time:** 1 week

---

## 🏺 Phase 5: Cultural Artifact Detection (Week 5-8)

### Goal: Detect traditional items in photos

### Steps:

#### 1. Collect Training Data
- Gather 100-200 photos per category:
  - Fishing tools (spears, nets)
  - Musical instruments (didgeridoos, clapsticks)
  - Artwork (paintings, carvings)
  - Traditional clothing
  - Ceremonial items
- **Requires Elder involvement for labeling**

#### 2. Train YOLO Model
```python
from ultralytics import YOLO

# Train custom model
model = YOLO('yolov8n.pt')  # Start with pretrained
model.train(
    data='palm_island_artifacts.yaml',
    epochs=100,
    imgsz=640
)
```

#### 3. Create Detection Service
```python
def detect_artifacts(image_path):
    model = YOLO('models/cultural_artifacts/palm_island.pt')
    results = model(image_path)

    artifacts = []
    for box in results[0].boxes:
        artifacts.append({
            'type': box.cls,
            'confidence': box.conf,
            'location': box.xyxy
        })
    return artifacts
```

#### 4. Integration
- Auto-tag photos with detected artifacts
- Link to cultural knowledge base
- Generate artifact inventory

**Estimated Time:** 4 weeks (includes Elder collaboration)

---

## 📊 Phase 6: Story Analytics (Week 9-10)

### Goal: Understand story content and themes

### Features:

#### 1. Theme Classification
```python
from transformers import pipeline

classifier = pipeline('text-classification',
                     model='distilbert-base-uncased')

def classify_themes(story_text):
    # Classify into:
    # - Dreamtime
    # - Traditional knowledge
    # - Family history
    # - Language preservation
    # - Land & sea country
    # - Contemporary issues
    return classifier(story_text)
```

#### 2. Traditional Language Detection
- Identify Palm Island language words
- Highlight for preservation
- Build language database

#### 3. Story Recommendations
- "Similar stories" based on embeddings
- "Related storytellers"
- "Explore this theme"

#### 4. Analytics Dashboard
- Most common themes
- Language word frequency
- Story interconnections
- Timeline visualizations

**Estimated Time:** 2 weeks

---

## 🚀 Phase 7: Deployment (Week 11-12)

### Goal: Production-ready deployment

### Architecture:

```
┌─────────────────────────────────────────────┐
│         Vercel (Next.js Frontend)           │
│         https://palmisland.app              │
└──────────────┬──────────────────────────────┘
               │
               │ HTTPS
               ▼
┌──────────────────────────────────────────────┐
│    Python AI Backend                         │
│    - Railway / Render / DigitalOcean         │
│    - FastAPI on port 443 (HTTPS)            │
│    - Auto-restart on crash                   │
└──────────────┬──────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌─────────────┐  ┌─────────────┐
│   Qdrant    │  │  Supabase   │
│   Cloud     │  │   Hosted    │
│             │  │             │
│ $25/month   │  │ Free tier   │
└─────────────┘  └─────────────┘
```

### Deployment Options:

#### Option 1: Railway (Easiest)
```yaml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "python main.py"
healthcheckPath = "/health"
```

**Cost:** $5/month

#### Option 2: Render
```yaml
# render.yaml
services:
  - type: web
    name: palm-island-ai
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "python main.py"
```

**Cost:** $7/month

#### Option 3: DigitalOcean App Platform
**Cost:** $12/month
**Pros:** More control, better performance

### SSL/HTTPS Setup
- Let's Encrypt (free)
- CloudFlare proxy (free + DDoS protection)

### Monitoring
- Sentry for error tracking
- DataDog for performance
- Uptime Robot for availability

**Estimated Time:** 1 week

---

## 💰 Cost Summary

### Current (Development):
- ✅ Everything free (running locally)

### Production (Recommended):
- Next.js (Vercel): **$0** (hobby tier)
- Python Backend (Railway): **$5/month**
- Qdrant Cloud: **$25/month**
- Supabase: **$0** (free tier, upgradable to $25/month)
- **Total: $30/month**

### Enterprise (High Scale):
- Next.js (Vercel Pro): **$20/month**
- Python Backend (dedicated): **$50/month**
- Qdrant Cloud: **$95/month** (4GB)
- Supabase Pro: **$25/month**
- Monitoring: **$15/month**
- **Total: $205/month**

---

## 📈 Success Metrics

### Phase 2 (Frontend):
- [ ] Search accessible from stories page
- [ ] <1 second response time
- [ ] Relevance feedback from users

### Phase 3 (Auto-embed):
- [ ] New stories embedded within 5 minutes
- [ ] Zero manual intervention needed
- [ ] 100% success rate

### Phase 4 (Face Detection):
- [ ] 80%+ face detection accuracy
- [ ] 70%+ correct person suggestions
- [ ] Elder validation positive

### Phase 5 (Artifacts):
- [ ] 5+ artifact types detected
- [ ] 80%+ accuracy (validated by Elders)
- [ ] Cultural knowledge base created

### Phase 6 (Analytics):
- [ ] Theme classification 85%+ accurate
- [ ] Traditional words catalogued
- [ ] Story network visualized

### Phase 7 (Deployment):
- [ ] 99.9% uptime
- [ ] <100ms search latency
- [ ] HTTPS + security headers

---

## 🎯 Recommended Priority

### Do First (Next 2 Weeks):
1. ✅ **Frontend Integration** - Make it usable
2. ✅ **Auto-embedding** - Remove manual work

### Do Second (Month 2):
3. **Face Detection** - High value, medium effort
4. **Deploy to Production** - Get it live

### Do Third (Month 3+):
5. **Cultural Artifacts** - High value, needs Elder input
6. **Story Analytics** - Adds insight

---

## 🤝 What You Need

### Technical:
- [ ] React/TypeScript skills (frontend)
- [ ] Docker for deployment
- [ ] Domain name (optional but recommended)

### Non-Technical:
- [ ] Elder involvement for artifact training
- [ ] Photo dataset for face detection
- [ ] Content guidelines approval

### Resources:
- [ ] ~$30/month for production hosting
- [ ] 2-3 hours/week for maintenance
- [ ] Community feedback sessions

---

## 📞 Next Session Plan

**Immediate (Today/Tomorrow):**
1. Create Next.js search component
2. Test frontend → backend connection
3. Deploy search UI to stories page

**This Week:**
4. Set up auto-embedding
5. Test with new story creation

**Next Week:**
6. Start face detection prototype
7. Gather training photos

---

**Questions?**
- Want to start with frontend integration?
- Need help with deployment?
- Ready to tackle face detection?

**Tell me what you want to build next!** 🚀
