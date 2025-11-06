# Palm Island Platform - Implementation Plan
**Created:** 2025-01-06
**Status:** Active Development

## Executive Summary

This plan addresses the complete redesign rollout, layout fixes, consistent branding, content enhancement, and AI-powered research tools for the Palm Island Story Server platform.

---

## Phase 1: Layout & Design Consistency (Priority: CRITICAL)

### 1.1 Fix Sidebar Layout Issues ⚠️
**Problem:** Sidebar covers page content, especially top bars and hero sections.

**Solution:**
- Add proper `margin-left` to main content (280px for desktop)
- Ensure AppLayout applies `.main-content` class correctly
- Fix mobile responsiveness (sidebar should collapse on mobile)
- Add proper z-index layering
- Test on all screen sizes

**Files to Update:**
- `components/AppLayout.tsx` - Fix main content padding
- `app/globals.css` - Update `.main-content` class
- `components/Sidebar.tsx` - Fix z-index and mobile behavior

**Acceptance Criteria:**
- [ ] No content hidden behind sidebar on desktop
- [ ] Mobile menu works smoothly
- [ ] All page headers align correctly
- [ ] Responsive on tablet/mobile

---

### 1.2 Apply Design System to ALL Pages ⚠️
**Problem:** Some pages still have old purple/blue gradients and inconsistent styling.

**Pages Needing Update:**

#### High Priority (User-Facing):
- [ ] `/storytellers` - Storytellers listing page
- [ ] `/storytellers/[id]` - Individual storyteller profile
- [ ] `/stories/[id]` - Individual story reading page
- [ ] `/stories/submit` - Story submission form
- [ ] `/dashboard` - User dashboard
- [ ] `/search` - Search results page
- [ ] `/history` - Timeline page
- [ ] `/picc` - PICC services page
- [ ] `/about` - About page
- [ ] `/upload` - Upload interface

#### Medium Priority (Admin):
- [ ] `/admin/manage-profiles` - Profile management
- [ ] `/admin/import-stories` - Story import
- [ ] `/admin/import-repos` - Repo import
- [ ] `/admin/upload-documents` - Document upload
- [ ] `/admin/upload-photos` - Photo upload
- [ ] `/reports/generate` - Report generator
- [ ] `/reports/annual/[year]` - Annual reports

#### Special Cases:
- [ ] `/stories/cyclone-2019` - Feature story (keep fullscreen, no sidebar)
- [ ] `/login` & `/signup` - Auth pages (minimal layout, no sidebar?)

**Design Checklist per Page:**
- [ ] Replace all `bg-purple-*`, `bg-blue-*` with ocean/coral palette
- [ ] Wrap in `<AppLayout>` (unless fullscreen experience)
- [ ] Use `card-modern`, `btn-primary`, `input-field` classes
- [ ] Update hero sections to ocean gradient
- [ ] Change accent colors to coral-warm
- [ ] Update text colors to earth-* palette
- [ ] Replace old stat cards with `.stat-card` class

---

### 1.3 Page Layout Logic & Sidebar Strategy
**Decision Matrix:** Which pages get sidebar?

| Page Type | Sidebar? | Reasoning |
|-----------|----------|-----------|
| Homepage | ✅ Yes | Main navigation hub |
| Admin pages | ✅ Yes | Need quick access to tools |
| Stories listing | ✅ Yes | Browse and navigate |
| Story reading | ❌ No | Immersive fullscreen experience |
| Feature stories | ❌ No | Cinematic storytelling (cyclone-2019) |
| Storytellers listing | ✅ Yes | Browse profiles |
| Storyteller profile | ✅ Yes | Navigate between profiles |
| Dashboard | ✅ Yes | User control center |
| Search | ✅ Yes | Need navigation during search |
| Auth (login/signup) | ❌ No | Focused, distraction-free |
| Upload | ✅ Yes | Part of workflow |

**Implementation:**
```typescript
// Create layout wrapper logic
// app/stories/[id]/layout.tsx - No sidebar for reading
export default function StoryLayout({ children }) {
  return <>{children}</> // No AppLayout
}

// Most other pages
export default function Page() {
  return <AppLayout>{content}</AppLayout>
}
```

---

## Phase 2: Content Enhancement

### 2.1 Enhanced Profile Experience
**Goal:** Make storyteller profiles beautiful and comprehensive.

**Features to Add:**
- [ ] Photo gallery for storyteller
- [ ] List of all their stories
- [ ] Biography with rich text formatting
- [ ] Elder badge (already exists, ensure consistent)
- [ ] Location on map (future: integrate Palm Island map)
- [ ] Story count statistics
- [ ] "Share Profile" functionality
- [ ] Print-friendly view

**Files to Create/Update:**
- `app/storytellers/[id]/page.tsx` - Complete redesign
- `components/ProfileCard.tsx` - Reusable profile component
- `components/StoryCard.tsx` - Reusable story card

---

### 2.2 Document Management System
**Goal:** Support uploading, organizing, and displaying various document types.

**Document Types to Support:**
- PDF documents (annual reports, policies)
- Word documents (.docx)
- Images (photos, scans)
- Audio files (recordings, oral histories)
- Video files (interviews, events)

**Features:**
- [ ] Document upload interface (drag & drop)
- [ ] Document categorization (tags, categories)
- [ ] Document viewer (PDF in-browser)
- [ ] Document search (full-text)
- [ ] Download functionality
- [ ] Access control (public/private)
- [ ] Document metadata (title, date, author, description)

**Technical Stack:**
- Supabase Storage for file hosting
- PDF.js for PDF viewing
- Audio/Video players with custom controls
- Document processing pipeline

---

## Phase 3: AI-Powered Research & Analysis Tools

### 3.1 Research Requirements Analysis

**User Needs:**
1. **Transcript Analysis** - Analyze story transcripts for themes
2. **Quote Discovery** - Find relevant quotes across all stories
3. **Thematic Analysis** - Identify recurring themes and patterns
4. **Sentiment Analysis** - Understand emotional tones
5. **Entity Recognition** - Extract people, places, events mentioned
6. **Story Clustering** - Group similar stories together
7. **Timeline Generation** - Create timelines from story data
8. **Report Generation** - Auto-generate summary reports

---

### 3.2 AI/ML Tool Stack Recommendations

#### Option A: OpenAI API (Recommended for MVP)
**Pros:**
- Easy integration
- Powerful GPT-4 for analysis
- Embeddings for semantic search
- Good documentation

**Use Cases:**
- Thematic analysis via GPT-4
- Quote extraction with prompt engineering
- Sentiment analysis
- Summary generation

**Cost:** ~$0.03 per 1K tokens (affordable for your scale)

**Implementation:**
```typescript
// Example: Analyze transcript themes
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [{
    role: "system",
    content: "You are an expert in Indigenous storytelling and thematic analysis."
  }, {
    role: "user",
    content: `Analyze this transcript and identify key themes: ${transcript}`
  }]
});
```

---

#### Option B: Anthropic Claude API (Alternative)
**Pros:**
- 200K context window (can analyze VERY long transcripts)
- Strong at nuanced analysis
- Good at following complex instructions

**Use Cases:**
- Long document analysis
- Multi-story comparison
- Complex thematic research

**Cost:** Similar to OpenAI

---

#### Option C: Local/Open-Source Models (Budget Option)
**Tools:**
- Hugging Face Transformers
- spaCy for NER (Named Entity Recognition)
- BERT for embeddings

**Pros:**
- Free after setup
- Data stays private
- Full control

**Cons:**
- Requires more technical setup
- Slower than API solutions
- Less powerful than GPT-4

---

### 3.3 Specific AI Features to Build

#### 3.3.1 Semantic Search
**What:** Search stories by meaning, not just keywords
**How:**
- Generate embeddings for all transcripts using OpenAI embeddings
- Store in vector database (Supabase pgvector)
- User searches → convert to embedding → find similar stories

**Example:**
- User searches: "community resilience after storms"
- Finds stories about recovery, helping neighbors, rebuilding
- Even if they don't use those exact words

**Tech Stack:**
- OpenAI `text-embedding-3-small` ($0.00002 / 1K tokens)
- Supabase pgvector extension
- Similarity search with cosine distance

---

#### 3.3.2 Automated Thematic Tagging
**What:** Automatically identify themes in new stories
**How:**
- When story uploaded → send to GPT-4
- Extract: themes, emotions, key events, people mentioned
- Store as structured metadata
- Enable filtering/browsing by theme

**Themes to Extract:**
- Emotional themes (hope, resilience, pride, etc.)
- Topic themes (health, education, culture, etc.)
- Event themes (cyclone, celebration, ceremony, etc.)
- Historical periods (pre-1980, 1980-2000, 2000-present)

---

#### 3.3.3 Quote Finder
**What:** "Find all quotes about resilience"
**How:**
- Index all transcripts with sentence-level embeddings
- User query → find semantically similar sentences
- Present quotes with context and source

**UI:**
```
Search: "stories about elder wisdom"

Results:
📖 "Uncle Frank taught us to always respect the land..."
   - From: Uncle Frank Daniel Landers Story
   - Theme: Cultural Knowledge
   - Date: 2023-04-15

📖 "The old people knew how to read the weather..."
   - From: Cyclone 2019 Story
   - Theme: Traditional Knowledge
   - Date: 2019-03-10
```

---

#### 3.3.4 Research Assistant
**What:** Chat interface to ask questions about story collection
**How:**
- RAG (Retrieval Augmented Generation)
- User asks question → retrieve relevant stories → GPT-4 synthesizes answer
- Cite sources

**Example Questions:**
- "What do elders say about traditional fishing practices?"
- "How has the community changed since the 1980s?"
- "What are the main health challenges mentioned?"

---

#### 3.3.5 Annual Report Generator
**What:** Auto-generate summary reports from story data
**How:**
- Aggregate story metadata (themes, dates, stats)
- GPT-4 writes narrative summary
- Include statistics, quotes, highlights
- Export as PDF

**Report Sections:**
- Executive summary
- Story statistics (count, themes, storytellers)
- Key themes with supporting quotes
- Community insights
- Recommendations

---

### 3.4 Privacy & Ethics Considerations

**Critical Requirements:**
- [ ] All AI analysis happens on stories marked "public" only
- [ ] User consent for AI processing (terms of service)
- [ ] No sharing of data with third-party AI providers beyond processing
- [ ] Option to exclude stories from AI analysis
- [ ] Transparent about AI usage
- [ ] Community control over AI features

**Data Sovereignty:**
- AI analysis results stored in YOUR database
- Source transcripts remain in YOUR control
- Can switch AI providers without losing data
- Audit trail of AI processing

---

## Phase 4: Technical Architecture

### 4.1 Database Schema Extensions

**New Tables Needed:**

```sql
-- Store AI-generated embeddings
CREATE TABLE story_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id),
  embedding VECTOR(1536), -- OpenAI embedding size
  content_chunk TEXT, -- The text chunk this embedding represents
  chunk_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Store AI analysis results
CREATE TABLE story_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id),
  analysis_type TEXT, -- 'themes', 'sentiment', 'entities', etc.
  analysis_result JSONB, -- Flexible storage for different analysis types
  confidence_score FLOAT,
  analyzed_at TIMESTAMP DEFAULT NOW(),
  ai_model TEXT -- 'gpt-4-turbo', 'claude-3', etc.
);

-- Store documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT, -- 'pdf', 'docx', 'image', 'audio', 'video'
  file_path TEXT,
  supabase_bucket TEXT,
  category TEXT[],
  tags TEXT[],
  uploaded_by UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 4.2 API Architecture

**New API Routes:**

```
/api/ai/analyze-story          - Analyze single story
/api/ai/search-semantic        - Semantic search
/api/ai/find-quotes            - Quote discovery
/api/ai/generate-report        - Report generation
/api/ai/chat                   - Research assistant chat
/api/documents/upload          - Document upload
/api/documents/process         - Process uploaded document
/api/transcripts/extract       - Extract text from audio/video
```

---

## Task List & Timeline

### Week 1: Layout Fixes & Design Consistency
- [ ] **Day 1-2:** Fix sidebar layout issues
  - [ ] Update AppLayout with proper margins
  - [ ] Fix mobile responsiveness
  - [ ] Test on all screen sizes

- [ ] **Day 3-5:** Apply design to high-priority pages
  - [ ] Storytellers listing & profile pages
  - [ ] Individual story reading page
  - [ ] Dashboard page
  - [ ] Search page

- [ ] **Day 6-7:** Apply design to remaining pages
  - [ ] Auth pages (login/signup)
  - [ ] Upload pages
  - [ ] About/History/PICC pages
  - [ ] Admin pages (remaining)

---

### Week 2: Enhanced Profiles & Documents
- [ ] **Day 1-3:** Enhanced storyteller profiles
  - [ ] Redesign profile page layout
  - [ ] Add story gallery
  - [ ] Add statistics
  - [ ] Add sharing functionality

- [ ] **Day 4-7:** Document management system
  - [ ] Create document upload interface
  - [ ] Build document viewer
  - [ ] Implement categorization
  - [ ] Add search functionality

---

### Week 3: AI Foundation
- [ ] **Day 1-2:** Setup & Planning
  - [ ] Choose AI provider (OpenAI recommended)
  - [ ] Set up API keys and billing
  - [ ] Create privacy policy updates
  - [ ] Design AI feature UIs

- [ ] **Day 3-4:** Embeddings & Semantic Search
  - [ ] Generate embeddings for existing stories
  - [ ] Set up vector database (pgvector)
  - [ ] Build semantic search API
  - [ ] Create search UI

- [ ] **Day 5-7:** Thematic Analysis
  - [ ] Build analysis pipeline
  - [ ] Process existing stories
  - [ ] Create theme browsing UI
  - [ ] Add analysis to story pages

---

### Week 4: Advanced AI Features
- [ ] **Day 1-3:** Quote Finder
  - [ ] Sentence-level embeddings
  - [ ] Quote search API
  - [ ] Quote discovery UI
  - [ ] Citation system

- [ ] **Day 4-5:** Research Assistant
  - [ ] RAG implementation
  - [ ] Chat interface
  - [ ] Source citations
  - [ ] Export functionality

- [ ] **Day 6-7:** Report Generator
  - [ ] Report template system
  - [ ] Auto-generation pipeline
  - [ ] PDF export
  - [ ] Admin interface

---

## Success Metrics

### Design Consistency
- [ ] 100% of pages use ocean + coral palette
- [ ] Zero purple/blue gradients remain
- [ ] Sidebar works on all pages (except fullscreen)
- [ ] Mobile responsive on all pages

### Content
- [ ] 10+ enhanced storyteller profiles
- [ ] Document upload system live
- [ ] 5+ documents uploaded and viewable

### AI Features
- [ ] Semantic search returns relevant results
- [ ] 90%+ of stories have AI-generated themes
- [ ] Quote finder locates quotes in <2 seconds
- [ ] Research assistant answers 80%+ of queries accurately
- [ ] Report generator creates publication-ready PDFs

---

## Budget Estimates

### AI Costs (Monthly)
- OpenAI API: ~$50-200/month (depending on usage)
  - Embeddings: ~$5/month (one-time for existing, minimal ongoing)
  - GPT-4 analysis: ~$20-100/month
  - Semantic search: ~$10-50/month

### Development Time
- Week 1 (Design): ~40 hours
- Week 2 (Content): ~40 hours
- Week 3 (AI Foundation): ~40 hours
- Week 4 (Advanced AI): ~40 hours
- **Total:** ~160 hours (~1 month full-time)

---

## Risk Mitigation

### Technical Risks
- **AI costs exceed budget** → Start with embeddings only, add GPT-4 features gradually
- **API rate limits** → Implement caching, batch processing
- **Slow performance** → Use background jobs for analysis

### User Adoption Risks
- **AI features too complex** → Simple, guided UI with tooltips
- **Community concerns about AI** → Transparent communication, opt-in features
- **Data privacy issues** → Strong data governance, community control

---

## Next Steps - Immediate Actions

### Action 1: Fix Layout Issues (TODAY)
```bash
# Priority: Fix sidebar covering content
1. Update AppLayout.tsx
2. Fix main-content margins
3. Test on all pages
```

### Action 2: Page-by-Page Redesign (THIS WEEK)
```bash
# Start with most-visited pages
1. /storytellers
2. /storytellers/[id]
3. /stories/[id]
4. /dashboard
```

### Action 3: Plan AI Integration (THIS WEEK)
```bash
# Research and decide
1. Choose AI provider (OpenAI vs Anthropic vs local)
2. Set up development API keys
3. Create proof-of-concept for semantic search
```

---

## Questions for Decision

1. **AI Provider:** OpenAI (easy, powerful) vs Anthropic (better for long docs) vs Local (free, private)?
2. **Budget:** What's monthly budget for AI API costs?
3. **Priority:** Fix design first, or start AI features in parallel?
4. **Fullscreen Stories:** Which stories should be fullscreen? Just cyclone-2019 or all feature stories?
5. **Document Focus:** What types of documents are most important to support first?

---

**Ready to start?** Let me know which phase to begin with!
