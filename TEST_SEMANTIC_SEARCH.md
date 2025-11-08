# 🧪 Test Semantic Search - End-to-End Guide

**Status:** Ready to test!
**What:** AI-powered semantic search integrated into Next.js frontend

---

## 🚀 Setup (Do This First)

### 1. Pull Latest Code
```bash
palmpull
```

### 2. Add Environment Variable
```bash
cd web-platform

# If you don't have .env.local yet
cp .env.local.example .env.local

# Edit .env.local and add this line:
nano .env.local
```

Add:
```bash
AI_BACKEND_URL=http://localhost:8001
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## 🎯 Testing Steps

### Step 1: Start the AI Backend (Terminal 1)

```bash
cd web-platform/ai-services
source ../venv/bin/activate
API_PORT=8001 python main.py
```

**Expected output:**
```
🚀 Starting Palm Island AI Services...
✅ Qdrant collection ready
INFO:     Uvicorn running on http://0.0.0.0:8001
```

**Leave this running!**

---

### Step 2: Start Next.js Dev Server (Terminal 2)

Open a **NEW terminal** window:

```bash
cd /Users/benknight/Code/Palm\ Island\ Reposistory/web-platform
npm run dev
```

**Expected output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

---

### Step 3: Open in Browser

Visit: **http://localhost:3000/stories**

You should see:
1. ✅ Stories page loads
2. ✅ Two tabs at the top of search section:
   - "Keyword Search"
   - "AI Semantic Search" (with NEW badge)

---

### Step 4: Test Keyword Search (Baseline)

1. Click "**Keyword Search**" tab (default)
2. Type: "storm"
3. See results filtered by keyword

**This should work as before** - good baseline to compare!

---

### Step 5: Test Semantic Search (THE NEW FEATURE!)

1. Click "**AI Semantic Search**" tab
2. You should see:
   - New search box with AI icon
   - "AI-powered semantic search" info text
   - Example query buttons at bottom
3. Type: **"storm and community"**
4. Click **"Search"** button

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Results appear in ~1 second
- ✅ Each result shows:
  - Story title
  - Story type badge
  - Date
  - **Relevance badge** (Highly Relevant / Relevant / Somewhat Relevant)
  - **Match percentage** (e.g., "42.0% match")
  - Content preview
  - "Read full story" link

---

## 🧪 Test Cases

### Test 1: Basic Search
**Query:** "traditional fishing"

**Expected:**
- Stories about fishing methods
- Stories mentioning elders and fishing
- High relevance scores (>30%)

---

### Test 2: Semantic Understanding
**Query:** "community resilience after disaster"

**Expected:**
- Storm recovery stories
- Community strength stories
- Even if they don't use exact words "resilience" or "disaster"
- This proves it understands MEANING not just keywords!

---

### Test 3: Cultural Topics
**Query:** "preserving culture and language"

**Expected:**
- Stories about traditional knowledge
- Language preservation stories
- Cultural practices

---

### Test 4: Elder Stories
**Query:** "wisdom from elders"

**Expected:**
- Stories featuring elders
- Traditional knowledge
- Intergenerational learning

---

### Test 5: Empty Query
**Query:** (leave empty)

**Expected:**
- ❌ Search button disabled
- Can't search with empty query

---

### Test 6: No Results
**Query:** "purple elephants dancing"

**Expected:**
- "No stories found" message
- Helpful suggestion to try different words

---

### Test 7: Example Queries
**Action:** Click an example query button (e.g., "healing and recovery")

**Expected:**
- Query auto-fills in search box
- Can click Search to run it

---

## ✅ Success Checklist

- [ ] AI backend starts without errors
- [ ] Next.js dev server starts
- [ ] Stories page loads
- [ ] Can see both search tabs
- [ ] Can switch between Keyword and AI Semantic tabs
- [ ] AI search shows loading state
- [ ] AI search returns results with relevance scores
- [ ] Results are semantically relevant (not just keyword matches)
- [ ] Can click result to view full story
- [ ] Relevance badges color-coded correctly
- [ ] Example queries work
- [ ] No console errors in browser

---

## 🐛 Troubleshooting

### Issue: "Failed to search stories"

**Cause:** AI backend not running

**Fix:**
```bash
# Terminal 1: Start AI backend
cd web-platform/ai-services
source ../venv/bin/activate
API_PORT=8001 python main.py
```

---

### Issue: Tab doesn't appear

**Cause:** Need to pull latest code or clear cache

**Fix:**
```bash
# Pull latest
palmpull

# Hard refresh browser
# Mac: Cmd+Shift+R
# Windows: Ctrl+Shift+R
```

---

### Issue: "Cannot connect to AI backend"

**Cause:** AI_BACKEND_URL not set

**Fix:**
```bash
cd web-platform
nano .env.local

# Add this line:
AI_BACKEND_URL=http://localhost:8001

# Restart Next.js dev server
```

---

### Issue: No results returned

**Cause:** Qdrant not running

**Fix:**
```bash
# Check Qdrant is running
docker ps | grep qdrant

# If not, start it:
docker start qdrant

# Or run embedding script again:
cd web-platform/ai-services
python scripts/embed_existing_stories.py
```

---

### Issue: Port 8001 already in use

**Fix:**
```bash
# Use different port
API_PORT=8002 python main.py

# Update .env.local:
AI_BACKEND_URL=http://localhost:8002
```

---

## 📊 Compare: Keyword vs Semantic

### Query: "community strength"

**Keyword Search Results:**
- Only stories with exact words "community" or "strength"
- Misses related stories

**Semantic Search Results:**
- Stories about community resilience
- Stories about people coming together
- Stories about recovery and healing
- **Understands the CONCEPT** even with different words!

---

## 🎥 Demo Script

**Show someone the difference:**

1. **Keyword search:**
   - Search: "fishing"
   - Get: Only stories with word "fishing"

2. **Semantic search:**
   - Search: "traditional fishing methods with family"
   - Get: Stories about fishing, elders teaching, cultural practices
   - Even stories that describe fishing without using "fishing"!

**This proves AI understands meaning!**

---

## 📸 Screenshots to Take

1. Stories page showing both tabs
2. AI Semantic Search tab with results
3. Relevance score badges
4. Example queries section
5. A search result showing high relevance (>40%)

---

## ✨ Cool Features to Notice

### 1. Relevance Scoring
- **Green badge:** Highly Relevant (>=40% match)
- **Orange badge:** Relevant (30-39% match)
- **Gray badge:** Somewhat Relevant (<30% match)

### 2. Match Percentage
- Shows exact confidence: "42.0% match"
- Helps users understand why result appeared

### 3. Smart Search
- Finds stories by MEANING not just keywords
- "storm recovery" finds "healing after disaster"
- "elder wisdom" finds "traditional knowledge from grandmother"

### 4. Beautiful UI
- Palm brand colors
- Smooth transitions
- Mobile responsive
- Loading states
- Error handling

---

## 🚀 Next Steps After Testing

Once everything works:

1. **Share with Community**
   - Get feedback from users
   - See what queries they try
   - Learn what they're looking for

2. **Collect Analytics**
   - Track popular search terms
   - Monitor relevance scores
   - Improve based on usage

3. **Deploy to Production**
   - See NEXT_STEPS_AI.md Phase 7
   - Host on Railway/Render
   - Get it live!

---

## ❓ Questions to Answer

- Does semantic search feel more useful than keyword?
- Are relevance scores helpful?
- What queries do people try?
- Any confusing results?
- UI improvements needed?

---

**Ready to test? Follow the steps above and let me know what you find!** 🎉
