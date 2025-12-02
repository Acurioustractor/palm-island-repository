# AI Assistant & Reporting Strategy for PICC
## Leveraging Your Data Ecosystem for Community Intelligence

**Date:** December 2, 2025
**Status:** Strategic Planning Document

---

## 🎯 Vision

Create an **AI-powered intelligence system** that allows:

### For PICC Staff & Leaders:
- Ask questions about community data ("What projects did we run in 2024?")
- Generate reports automatically (annual reports, funding applications)
- Understand trends and patterns in stories/photos
- See real-time status of initiatives

### For External Partners & Supporters:
- Discover partnership opportunities ("Show me healthy eating programs")
- Understand community context and needs
- See impact data and success stories
- Identify gaps where they can help

---

## 📊 Your Data Ecosystem (What You Already Have)

### 1. **Stories Database** (Supabase `stories` table)
**What it contains:**
- Community narratives
- Elder stories with cultural knowledge
- Project documentation
- Service impact stories

**Fields:**
- Title, content, storyteller
- Tags, location, date
- Cultural sensitivity flags
- Approval status

**Access:**
- Public: Published stories with appropriate permissions
- Private: Drafts, culturally sensitive content

### 2. **Media Library** (1,214+ photos)
**What it contains:**
- Event photos (Daycare Opening, Storm Recovery)
- Project documentation (Photo Studio trips)
- Cultural heritage imagery
- Community gatherings

**Metadata:**
- Tags (manual + AI-generated)
- Descriptions, titles
- Location data
- Face detection data
- AI analysis (mood, people count)

**Access:**
- Public: `is_public: true` photos
- Private: Culturally sensitive, requires elder approval

### 3. **Wiki Knowledge Base**
**Sections:**
- History (Palm Island heritage, connection to Hull River)
- Culture (language, traditions, protocols)
- Services (PICC programs and offerings)
- Innovation (technology projects, sovereignty initiatives)
- People (storytellers, community leaders)

**Access:**
- Public: General knowledge, published articles
- Private: Sensitive cultural protocols, internal documentation

### 4. **Innovation Projects**
**Active Projects:**
- Photo Studio (on-country photography)
- The Station (community hub)
- Elders Trips (cultural connection)
- On-Country Server (data sovereignty)
- Annual Report Automation

**Data per project:**
- Goals, status, timeline
- Stories and photos
- Impact metrics
- Funding sources

**Access:**
- Public: Project descriptions, public outcomes
- Private: Internal planning, budget details

### 5. **Profiles & Storytellers**
**Data:**
- Community members
- Storytellers (200+ profiles)
- Elders (with special permissions)
- Staff and team members

**Access:**
- Public: Published storyteller profiles
- Private: Contact info, internal notes

### 6. **Collections & Smart Folders**
**Organization:**
- Themed collections (events, people, years)
- Auto-organized by tags
- Curated sets for reports/presentations

**Access:**
- Public/Private per collection

### 7. **Annual Reports** (Historical Data)
**Contains:**
- Year-over-year progress
- Financial summaries
- Service statistics
- Community impact stories

**Access:**
- Public: Published annual reports
- Private: Draft reports, detailed financials

---

## 🤖 AI Infrastructure (Already Configured!)

Looking at your `.env.local`, you already have:

### 1. **LLM Providers**
```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

ANTHROPIC_API_KEY=sk-ant-api03-[configured]
OPENAI_API_KEY=sk-proj-[configured]
```

✅ You can use **local Ollama** (free, private) or **cloud APIs** (more powerful)

### 2. **Vector Database (pgvector in Supabase)**
```env
VECTOR_DB_TYPE=supabase
VECTOR_DIMENSION=768  # Text embeddings
IMAGE_VECTOR_DIMENSION=512  # Image embeddings (CLIP)
```

✅ Ready for **semantic search** and **RAG (Retrieval Augmented Generation)**

### 3. **Embeddings**
```env
EMBEDDINGS_MODEL=sentence-transformers/all-mpnet-base-v2
EMBEDDINGS_PROVIDER=local
VOYAGE_API_KEY=pa-[configured]  # Best embeddings
```

✅ Can generate embeddings for all content

### 4. **Feature Flags**
```env
ENABLE_AI_CHAT=true
ENABLE_SEMANTIC_SEARCH=true
ENABLE_PHOTO_ML=true
ENABLE_PATTERN_RECOGNITION=true
ENABLE_IMPACT_TRACKING=true
```

✅ AI features are **enabled and ready**

---

## 🏗️ Proposed Architecture

### Phase 1: Data Indexing & Embeddings (Foundation)

#### 1.1 Create Vector Embeddings
**What:** Convert all text content into searchable vectors

**Tables to index:**
- `stories.content` → Store embeddings in new `story_embeddings` table
- `profiles.bio` → `profile_embeddings`
- `wiki_articles.content` → `wiki_embeddings`
- `projects.description` → `project_embeddings`
- `media_files.description` + `tags` → `media_embeddings`

**Implementation:**
```sql
-- Example: Story embeddings table
CREATE TABLE story_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  embedding vector(768),  -- pgvector type
  content_chunk TEXT,  -- Chunk of text this embedding represents
  chunk_index INTEGER,  -- For long content split into chunks
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON story_embeddings USING ivfflat (embedding vector_cosine_ops);
```

**Why:** Enables semantic search ("find stories about healthy eating" even if they don't use that exact phrase)

#### 1.2 Create Knowledge Graph
**What:** Map relationships between entities

**Relationships:**
- Stories ↔ Projects ↔ Photos ↔ People
- Topics ↔ Tags ↔ Themes
- Time-based patterns (what happened when)

**Implementation:**
```sql
CREATE TABLE knowledge_relationships (
  id UUID PRIMARY KEY,
  entity_type_a TEXT,  -- 'story', 'project', 'person', 'photo'
  entity_id_a UUID,
  relationship_type TEXT,  -- 'related_to', 'part_of', 'created_by'
  entity_type_b TEXT,
  entity_id_b UUID,
  confidence FLOAT,  -- AI-generated confidence score
  metadata JSONB
);
```

**Why:** Helps AI understand context ("Show me everything related to Palm Island Daycare")

---

### Phase 2: AI Assistant (Chatbot)

#### 2.1 RAG Pipeline
**How it works:**

1. **User asks question:** "What healthy eating programs does PICC run?"

2. **Query embedding:** Convert question to vector using embeddings model

3. **Semantic search:** Find relevant content using vector similarity
   ```sql
   SELECT
     s.title, s.content, s.tags,
     1 - (e.embedding <=> $query_embedding) as similarity
   FROM stories s
   JOIN story_embeddings e ON e.story_id = s.id
   WHERE 1 - (e.embedding <=> $query_embedding) > 0.7
   ORDER BY similarity DESC
   LIMIT 10;
   ```

4. **Context injection:** Bundle relevant stories/data as context

5. **LLM generation:** Send to Anthropic Claude with context:
   ```
   System: You are a PICC community assistant. Answer based on this context:
   [Top 10 relevant stories about food/health programs]

   User: What healthy eating programs does PICC run?

   Assistant: Based on PICC's records, here are the healthy eating initiatives...
   ```

6. **Return answer:** With sources cited

#### 2.2 Public vs Private Chatbot

**Public Chatbot (Website)**
- Accessible at: `/chat` or `/ask-picc`
- **Only searches public data:**
  - `WHERE is_public = true`
  - Published stories, approved profiles
  - Non-sensitive cultural content
- **Use case:** External partners discovering opportunities

**Private Chatbot (PICC Dashboard)**
- Accessible at: `/picc/assistant`
- **Full access to authenticated user's permitted data**
- **Use cases:**
  - Staff finding information quickly
  - Leaders checking project status
  - Report writing assistance

#### 2.3 Sample Queries It Could Answer

**For PICC Staff:**
- "What stories mention 'healthy eating' from 2024?"
- "Show me all photos from Elder trips tagged with 'cultural'"
- "Generate a summary of our youth programs"
- "What projects need funding applications this quarter?"
- "Find stories about Uncle Joe"

**For External Partners:**
- "What are PICC's priorities around nutrition?"
- "Show me community initiatives related to children's health"
- "What gaps exist in current programs?"
- "What partnerships does PICC have with health organizations?"

---

### Phase 3: Automated Reporting

#### 3.1 Report Types

**A. State of PICC Report**
**Generated monthly/quarterly**

**Sections:**
```markdown
# PICC Status Report - December 2025

## Overview
- Active Projects: 5
- Stories Published: 243 (↑15 this month)
- Photos Archived: 1,214
- Community Engagement: 89 storytellers active

## Project Status
### Photo Studio
- Status: Active
- Recent Activity: 3 trips completed
- Photos Collected: 456
- Next Steps: Plan 2026 calendar

### The Station
- Status: Planning Phase
- Partnerships: 2 confirmed
- Funding: 60% secured
- Timeline: Q1 2026 launch

## Community Impact
- Elder Stories: 34 new stories this year
- Cultural Knowledge: 127 articles in wiki
- Youth Engagement: 45 young people involved

## Opportunities
- Nutrition Programs: Gap identified
- Health Partnerships: 2 potential partners
- Funding: 3 applications pending
```

**Data sources:**
- Count of active projects from `innovation_projects`
- Story metrics from `stories`
- Photo counts from `media_files`
- Tag analysis for themes/trends

**B. Partnership Opportunity Report**
**For specific funders/partners**

**Example: "Healthy Eating Partnership Opportunities"**

**Sections:**
1. **Context:** Palm Island community profile
2. **Current Initiatives:** Existing food/health programs
3. **Gaps:** Where support is needed
4. **Success Stories:** Past wins in this area
5. **Proposed Activities:** Concrete partnership ideas
6. **Impact Potential:** Expected outcomes

**Generated using:**
- Semantic search for related stories/projects
- Gap analysis (topics mentioned rarely)
- Success pattern recognition
- AI-generated recommendations

**C. Historical Analysis Report**
**"Palm Island Story: 2020-2025"**

**Sections:**
1. **Timeline:** Major events and milestones
2. **Themes:** Most common story topics over time
3. **Community Voice:** Quotes from storytellers
4. **Photo Essay:** Visual journey
5. **Impact Metrics:** Quantified outcomes

**D. Issue & Opportunity Scanner**
**Real-time monitoring**

**Categories:**
```typescript
interface CommunityIntelligence {
  issues: {
    emerging: string[];  // Topics appearing more frequently
    persistent: string[];  // Long-term challenges
    urgent: string[];  // Flagged by staff/AI
  };
  opportunities: {
    strengths: string[];  // Areas PICC excels
    partnerships: string[];  // Potential collaborations
    funding: string[];  // Grant opportunities
    innovations: string[];  // New ideas from community
  };
  trends: {
    upward: string[];  // Growing areas
    declining: string[];  // Decreasing focus
    seasonal: string[];  // Time-based patterns
  };
}
```

**How it works:**
- Weekly AI scan of all new content
- Pattern recognition on tags/topics
- Comparison to historical baselines
- Generates alerts for staff

---

### Phase 4: Implementation Roadmap

#### Quick Wins (1-2 weeks)

**1. Simple Dashboard Stats**
- Count active projects, stories, photos
- Show trends (new this month)
- Display top tags/themes
- **Pages:** `/picc/analytics`, `/picc/insights/patterns`

**2. Basic Search Enhancement**
- Improve existing search with filters
- Add "related content" suggestions
- **Page:** `/search` (already exists)

**3. Manual Report Templates**
- Create `.md` templates for common reports
- Pre-fill with database queries
- **Tool:** Simple script that generates markdown

#### Medium Term (1-2 months)

**4. Vector Embeddings Setup**
- Run embedding generation on all stories
- Create `story_embeddings` table
- Build semantic search API endpoint

**5. Simple AI Chat (Private)**
- Create `/picc/assistant` page
- Connect to Anthropic API
- Implement basic RAG with story context
- **Access:** PICC staff only

**6. Automated Weekly Report**
- Generate "Week in Review" automatically
- Email to staff every Monday
- Shows new content, trends, needs attention

#### Long Term (3-6 months)

**7. Public AI Assistant**
- Create `/chat` public page
- Filter to public data only
- Marketing tool for partners/funders

**8. Advanced Reporting Engine**
- Build report generator with templates
- Custom date ranges, filters
- Export to PDF/Word
- **Page:** `/picc/report-generator` (already in nav!)

**9. Opportunity Matching System**
- AI scans for funding opportunities online
- Matches to PICC projects/needs
- Generates draft applications

**10. Community Intelligence Dashboard**
- Real-time issue/opportunity scanner
- Predictive analytics (what's coming?)
- Recommendation engine (what should we do?)

---

## 🔐 Access Control Strategy

### Public API Endpoints
```typescript
// Anyone can access
GET /api/public/stories?is_public=true
GET /api/public/projects?status=active
GET /api/public/chat  // AI assistant with public data only
GET /api/public/reports/annual/:year  // Published annual reports
```

### Authenticated API Endpoints
```typescript
// PICC staff only
GET /api/protected/stories  // All stories including drafts
GET /api/protected/chat  // AI assistant with full access
GET /api/protected/reports/generate  // Generate custom reports
GET /api/protected/analytics/intelligence  // AI insights
```

### Row Level Security (RLS) Policies
Already partially implemented in Supabase:

```sql
-- Public can only see published, non-sensitive content
CREATE POLICY "public_stories" ON stories
  FOR SELECT USING (is_public = true AND deleted_at IS NULL);

-- Authenticated users see more based on role
CREATE POLICY "staff_stories" ON stories
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND (is_public = true OR created_by = auth.uid())
  );
```

---

## 💡 Example Use Cases

### Use Case 1: Partner Discovery
**Persona:** Sarah, Health Program Director at Queensland Health

**Journey:**
1. Visits https://palmisland.community/chat
2. Asks: *"What nutrition programs exist on Palm Island?"*
3. AI responds with:
   - Current programs (from stories/projects)
   - Photos of healthy eating initiatives
   - Gaps identified (e.g., "No school garden program")
   - Contact link to PICC partnership team
4. Sarah downloads partnership opportunity report
5. Contacts PICC with proposal

**Technical:**
- Public chatbot
- Searches only `is_public: true` data
- Cites sources (story links, project pages)
- Generates PDF report on request

### Use Case 2: Staff Research
**Persona:** James, PICC Program Manager

**Journey:**
1. Logs into `/picc/assistant`
2. Asks: *"Find all content about Uncle Joe's stories from 2024"*
3. AI responds with:
   - 5 stories featuring Uncle Joe
   - 23 photos from his interview sessions
   - Related wiki articles about topics he discussed
   - Audio recordings (if any)
4. James uses this to prepare anniversary tribute
5. Generates summary report for newsletter

**Technical:**
- Private chatbot
- Full database access based on permissions
- Includes drafts, unpublished content
- Can access culturally sensitive material (if approved)

### Use Case 3: Automated Annual Report
**Persona:** PICC Board

**Journey:**
1. In December, system auto-generates draft annual report
2. Pulls data:
   - All 2025 projects and outcomes
   - Story highlights (most read, most impactful)
   - Photo selections (best from each project)
   - Financial summary (from budgets)
   - Community quotes (from storytellers)
3. AI writes narrative sections using storytelling
4. Staff review and approve
5. Published to website and printed

**Technical:**
- Scheduled job (cron)
- Queries all relevant tables
- Uses Claude to write narrative
- Generates designed PDF using templates
- **Already planned:** `/picc/projects/annual-report` in nav!

### Use Case 4: Opportunity Alert
**Persona:** PICC Executive Team

**Journey:**
1. Every Monday morning, email arrives:
   ```
   Subject: Weekly Intelligence Brief - Dec 2, 2025

   🟢 New Opportunities
   - Commonwealth grant for Indigenous youth programs (Deadline: Jan 15)
   - Queensland Health RFP for community nutrition (Matches: Healthy Eating gap)

   🔴 Issues Requiring Attention
   - Elder Stories: Uncle Tom hasn't been recorded yet (flagged 3 times in community)
   - Photo Studio: Equipment maintenance needed (mentioned in 2 staff notes)

   📊 Trends This Week
   - "Youth engagement" mentioned 15 times (up from avg 6)
   - "Health" most common tag in new stories
   - Daycare opening photos most viewed content
   ```

2. Team clicks links to see details
3. Assigns actions in dashboard

**Technical:**
- AI scans all new content weekly
- Pattern recognition on topics/tags
- External grant database integration
- Automated email generation

---

## 🛠️ Technical Implementation Guide

### Step 1: Create Embeddings Infrastructure

**File:** `lib/ai/embeddings.ts`

```typescript
import { createClient } from '@/lib/supabase/client';

export async function generateEmbedding(text: string): Promise<number[]> {
  // Option 1: Local (free, private)
  const response = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    body: JSON.stringify({
      model: 'all-mpnet-base-v2',
      prompt: text,
    }),
  });

  // Option 2: Cloud (better quality)
  // Use Voyage AI (already configured)
  const voyageResponse = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'voyage-2',
    }),
  });

  const data = await voyageResponse.json();
  return data.embeddings[0];
}

export async function indexStory(storyId: string) {
  const supabase = createClient();

  // Get story content
  const { data: story } = await supabase
    .from('stories')
    .select('title, content')
    .eq('id', storyId)
    .single();

  if (!story) return;

  // Generate embedding
  const fullText = `${story.title}\n\n${story.content}`;
  const embedding = await generateEmbedding(fullText);

  // Store in embeddings table
  await supabase
    .from('story_embeddings')
    .insert({
      story_id: storyId,
      embedding,
      content_chunk: fullText,
    });
}
```

### Step 2: Create RAG Search Function

**File:** `lib/ai/search.ts`

```typescript
export async function semanticSearch(
  query: string,
  options: {
    limit?: number;
    isPublic?: boolean;
  } = {}
) {
  const supabase = createClient();

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Search using vector similarity
  const { data } = await supabase.rpc('search_stories', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: options.limit || 10,
    is_public_filter: options.isPublic,
  });

  return data;
}

// Supabase function (run in SQL editor)
/*
CREATE FUNCTION search_stories(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  is_public_filter boolean
)
RETURNS TABLE (
  story_id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.content,
    1 - (e.embedding <=> query_embedding) as similarity
  FROM stories s
  JOIN story_embeddings e ON e.story_id = s.id
  WHERE
    (is_public_filter IS NULL OR s.is_public = is_public_filter)
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
*/
```

### Step 3: Create AI Chat API

**File:** `app/api/chat/route.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { semanticSearch } from '@/lib/ai/search';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { message, isPublic = false } = await request.json();

  // Find relevant context using RAG
  const relevantStories = await semanticSearch(message, {
    limit: 5,
    isPublic,
  });

  // Build context for Claude
  const context = relevantStories
    .map(s => `Story: "${s.title}"\n${s.content}`)
    .join('\n\n---\n\n');

  // Generate response
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: `You are a helpful assistant for the Palm Island Community Company (PICC).
    Answer questions based on the following community stories and information.
    Always cite your sources by mentioning story titles.

    Context:
    ${context}`,
    messages: [{
      role: 'user',
      content: message,
    }],
  });

  return Response.json({
    answer: response.content[0].text,
    sources: relevantStories.map(s => ({
      title: s.title,
      similarity: s.similarity,
    })),
  });
}
```

### Step 4: Create Chat UI

**File:** `app/chat/page.tsx` (public)
**File:** `app/picc/assistant/page.tsx` (private)

```typescript
'use client';

import { useState } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: 'user', content: input }]);
    setLoading(true);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input,
        isPublic: true  // false for /picc/assistant
      }),
    });

    const data = await response.json();

    setMessages([
      ...messages,
      { role: 'user', content: input },
      { role: 'assistant', content: data.answer },
    ]);
    setInput('');
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Ask PICC</h1>

      <div className="space-y-4 mb-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-50 ml-12'
                : 'bg-gray-50 mr-12'
            }`}
          >
            <p className="text-sm font-medium text-gray-600 mb-1">
              {msg.role === 'user' ? 'You' : 'PICC Assistant'}
            </p>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about PICC programs, stories, or opportunities..."
          className="flex-1 px-4 py-3 border rounded-lg"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Example questions:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>"What healthy eating programs does PICC run?"</li>
          <li>"Tell me about Elder stories from 2024"</li>
          <li>"What partnership opportunities exist?"</li>
        </ul>
      </div>
    </div>
  );
}
```

### Step 5: Create Report Generator

**File:** `app/picc/report-generator/page.tsx`

```typescript
'use client';

import { useState } from 'react';

export default function ReportGenerator() {
  const [reportType, setReportType] = useState('picc-status');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    setGenerating(true);

    const response = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: reportType,
        dateRange,
      }),
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `picc-report-${reportType}-${Date.now()}.pdf`;
    a.click();

    setGenerating(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Report Generator</h1>

      <div className="bg-white rounded-xl border p-6 mb-6">
        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700">Report Type</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border rounded-lg"
          >
            <option value="picc-status">State of PICC</option>
            <option value="palm-island-overview">Palm Island Overview</option>
            <option value="partnership-opportunities">Partnership Opportunities</option>
            <option value="historical-analysis">Historical Analysis</option>
            <option value="annual-report">Annual Report</option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <label>
            <span className="text-sm font-medium text-gray-700">Start Date</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="mt-1 block w-full px-4 py-2 border rounded-lg"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-gray-700">End Date</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="mt-1 block w-full px-4 py-2 border rounded-lg"
            />
          </label>
        </div>

        <button
          onClick={generateReport}
          disabled={generating}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {generating ? 'Generating Report...' : 'Generate Report (PDF)'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="font-bold text-blue-900 mb-2">What's in this report?</h2>
        <ReportPreview type={reportType} />
      </div>
    </div>
  );
}

function ReportPreview({ type }: { type: string }) {
  const previews = {
    'picc-status': (
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• Active projects and their status</li>
        <li>• Community engagement metrics</li>
        <li>• Recent stories and highlights</li>
        <li>• Upcoming opportunities</li>
      </ul>
    ),
    'partnership-opportunities': (
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• Community context and needs</li>
        <li>• Existing programs in target area</li>
        <li>• Identified gaps and opportunities</li>
        <li>• Success stories and case studies</li>
        <li>• Proposed partnership activities</li>
      </ul>
    ),
    // ... other types
  };

  return previews[type] || null;
}
```

---

## 📈 Success Metrics

### For PICC Staff
- **Time saved:** 50% reduction in research time
- **Report generation:** 80% faster annual reports
- **Knowledge access:** 10x more searchable content

### For External Partners
- **Discovery:** 3x more partnership inquiries
- **Quality:** Better-matched funding applications
- **Engagement:** 5x more page views on opportunity pages

### For Community
- **Preservation:** All stories searchable and connected
- **Visibility:** More people finding and reading stories
- **Impact:** Data-driven decision making

---

## 🚀 Next Steps

### Immediate (This Week)
1. **Review this document** with PICC leadership
2. **Prioritize features** (which reports/tools are most urgent?)
3. **Test AI infrastructure** (verify Ollama/Anthropic access)

### Short Term (Next Month)
4. **Create vector embeddings** for all existing stories
5. **Build simple search API** with semantic capabilities
6. **Deploy private AI assistant** for PICC staff to test

### Medium Term (3 Months)
7. **Launch public chatbot** for partner discovery
8. **Automate weekly intelligence brief**
9. **Build report generator** for common reports

### Long Term (6+ Months)
10. **Full intelligence dashboard** with predictive analytics
11. **External API** for partners to access public data
12. **Mobile app** with voice-powered AI assistant

---

## 💰 Cost Considerations

### Free/Low Cost Options
- **Ollama** (local LLM): Free, runs on your server
- **pgvector**: Built into Supabase, no extra cost
- **Open source embeddings**: Free sentence transformers

### Paid Options (Better Quality)
- **Anthropic Claude API:**
  - Sonnet: $3 per million input tokens, $15 per million output
  - For 100 queries/day: ~$50/month

- **Voyage AI Embeddings:**
  - $0.12 per million tokens
  - One-time embedding of 1000 stories: ~$5

### Recommended Hybrid Approach
- **Development/Testing:** Use free Ollama locally
- **Production Public Chatbot:** Use Claude (better quality, worth the cost)
- **Embeddings:** Use Voyage (one-time cost, very affordable)
- **Total estimated cost:** $50-100/month for unlimited queries

---

## 🎓 Learning Resources

### For PICC Team
- **Prompt Engineering:** How to ask AI better questions
- **Report Templates:** Pre-built templates for common needs
- **Dashboard Training:** How to read AI insights

### Documentation to Create
1. **AI Assistant User Guide** (how to ask good questions)
2. **Report Generator Manual** (which report for which purpose)
3. **Data Privacy Policy** (what's public vs private)

---

## 📞 Support & Maintenance

### Who Maintains This?
- **Data quality:** PICC staff (continue adding good stories/photos)
- **AI tuning:** Developer (initial setup, then monthly check-ins)
- **Report templates:** PICC leadership (define what reports are needed)

### Ongoing Tasks
- **Monthly:** Review AI responses for quality
- **Quarterly:** Update report templates
- **Yearly:** Re-index all embeddings (content has grown)

---

## ✨ Vision Summary

**You're building an "AI Memory" for Palm Island that:**
1. **Never forgets** any story, photo, or piece of knowledge
2. **Connects the dots** between people, projects, and events
3. **Speaks clearly** to both community and external partners
4. **Generates insights** that humans might miss
5. **Saves time** so staff can focus on community, not paperwork

**This isn't just a chatbot - it's a community intelligence system that makes PICC's incredible work visible, searchable, and impactful.**

---

**Ready to build this?** Let me know which phase you want to start with!
