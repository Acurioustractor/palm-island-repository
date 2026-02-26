# Chat AI Pipeline Audit: PICC Web Platform
Created: 2026-02-24
Author: architect-agent

## Executive Summary

The PICC chat has a well-designed tool layer that can query most database tables, but the **RAG context layer is fundamentally broken** and several critical data sources are invisible to the chat. The core issue: the vector search pipeline references database tables and functions that **do not exist**, so RAG silently fails and falls back to keyword-only search on a `knowledge_entries` table that may be empty. Meanwhile, the context builder searches many tables but **omits stories entirely** from its text search, despite stories being the largest content source. The query expansion module exists but is **never called**.

---

## 1. Architecture Diagram

```
User Question
     |
     v
/api/chat/route.ts
     |
     +---> getExpandedContext()  [context-builder.ts]
     |         |
     |         +---> getRAGContext()  [rag-search.ts]
     |         |         |
     |         |         +---> vectorSearch() --> hybrid_search_chunks RPC  ** BROKEN: RPC & tables don't exist **
     |         |         |         |
     |         |         |         +---> FALLBACK: textSearch() --> search_chunks RPC  ** BROKEN: RPC doesn't exist **
     |         |         |
     |         |         +---> searchKnowledgeBaseVector() --> match_knowledge_entries RPC  (EXISTS but likely empty)
     |         |                   |
     |         |                   +---> FALLBACK: text search on knowledge_entries  (EXISTS but likely empty/sparse)
     |         |
     |         +---> getOrgIdentityContext()      [hardcoded KB]  -- WORKS, always included
     |         +---> getServicesContext()          [organization_services]  -- WORKS
     |         +---> getPeopleContext()            [board_members, leadership, staff_statistics]  -- WORKS
     |         +---> searchElderQuotes()           [elder_quotes]  -- WORKS (keyword match)
     |         +---> searchInterviews()            [interviews, interview_segments]  -- WORKS (keyword match)
     |         +---> getHistoryContext()           [governance_achievements]  -- WORKS (keyword match)
     |         +---> getFinancialContext()         [annual_financials]  -- WORKS (no keyword, always returns)
     |         +---> getPartnersContext()          [partners]  -- WORKS
     |         +---> getCommunityVisionsContext()  [community_visions]  -- WORKS
     |         +---> *** MISSING: stories search ***
     |         +---> *** MISSING: projects search ***
     |         +---> *** MISSING: story_quotes search ***
     |         +---> *** MISSING: media_files search ***
     |         +---> *** MISSING: service_metrics search ***
     |
     +---> SYSTEM PROMPT  (static, ~54 lines)
     |
     +---> streamText() with Claude claude-sonnet-4-5-20250929
              |
              +---> 15 TOOLS (can call up to 5 steps):
                    searchStories         [stories, story_media, profiles]         -- WORKS
                    getServiceInfo        [organization_services, service_metrics, governance_achievements, media_files]  -- WORKS
                    getInnovationProjects [projects, project_notes, stories, media_files]  -- WORKS
                    exploreTimeline       [governance_achievements + hardcoded milestones]  -- WORKS
                    findQuotes            [story_quotes, stories, profiles]        -- WORKS
                    getPhotoGallery       [media_files, story_media, stories]      -- WORKS
                    exploreKnowledgeGraph [stories, profiles, knowledge_entries]   -- WORKS
                    submitCommunityVision [community_visions]                      -- WORKS (write)
                    getCommunityVisions   [community_visions, elder_quotes]        -- WORKS
                    getServiceMetrics     [organization_services, service_metrics, service_activity_logs]  -- WORKS
                    getFinancialSummary   [annual_financials]                      -- WORKS
                    submitServiceUpdate   [organization_services, service_notes]   -- WORKS (write)
                    submitMeetingNote     [meeting_notes]                          -- WORKS (write)
                    getContentReadiness   [many tables via check-completeness]     -- WORKS
                    suggestDataEnrichment [many tables via check-completeness]     -- WORKS
```

**Key insight**: The tools are comprehensive, but the LLM must _decide_ to call them. The RAG context that precedes tool calls is supposed to give the LLM enough information to know what tools to call and what to search for. When RAG returns nothing useful, the LLM is flying blind.

---

## 2. Every Data Source — Connected or Not

### Database Tables

| Table | In RAG Context Builder? | In Tools? | Gap? |
|-------|------------------------|-----------|------|
| `stories` | **NO** | Yes (searchStories, findQuotes, getPhotoGallery, getInnovationProjects) | **CRITICAL GAP** — stories are the largest content source but invisible to RAG pre-context |
| `story_media` | No | Yes (searchStories, getPhotoGallery) | Tool-only |
| `story_quotes` | No | Yes (findQuotes) | Tool-only; not in RAG context |
| `elder_quotes` | Yes (keyword) | Yes (getCommunityVisions) | OK but keyword-only matching |
| `extracted_quotes` | **NO** | **NO** | **GAP** — table exists, never queried by chat |
| `community_visions` | Yes | Yes | OK |
| `community_feedback` | **NO** | **NO** | **GAP** — "What You Said What We Did" data invisible |
| `projects` | **NO** | Yes (getInnovationProjects) | Tool-only; not in RAG context |
| `project_notes` | No | Yes (getInnovationProjects single) | Tool-only |
| `organization_services` | Yes | Yes | OK |
| `service_metrics` | **NO** (in context builder) | Yes (getServiceMetrics, getServiceInfo) | **GAP** — metrics not in pre-context |
| `service_activity_logs` | No | Yes (getServiceMetrics) | Tool-only |
| `service_notes` | No | Yes (submitServiceUpdate) | Write-only, never read |
| `service_grants` | **NO** | **NO** | **GAP** — grant/funding data invisible |
| `media_files` | **NO** | Yes (getPhotoGallery, getServiceInfo, getInnovationProjects) | Tool-only |
| `interviews` | Yes (keyword) | No dedicated tool | Only in RAG context, keyword match on title only |
| `interview_segments` | Yes (keyword) | No | Searched via context builder but keyword match on segment_text |
| `governance_achievements` | Yes (keyword) | Yes (exploreTimeline, getServiceInfo) | OK but keyword matching limits recall |
| `annual_financials` | Yes (always) | Yes (getFinancialSummary) | OK |
| `board_members` | Yes | No dedicated tool | OK via context |
| `leadership` | Yes | No dedicated tool | OK via context |
| `staff_statistics` | Yes | No dedicated tool | OK via context |
| `partners` | Yes | No dedicated tool | OK via context |
| `knowledge_entries` | Attempted (via vector/text) | Via knowledge graph | **LIKELY EMPTY** — no scraper pipeline populating it |
| `content_embeddings` | Attempted (via RPC) | No | **LIKELY EMPTY** — no batch job evidence of population |
| `profiles` | No (in context builder) | Yes (searchStories, findQuotes, knowledge graph) | Tool-only |
| `meeting_notes` | **NO** | Write-only (submitMeetingNote) | **GAP** — meeting notes never read back |
| `organization_goals` | **NO** | **NO** | **GAP** — goals data invisible |
| `publications` | **NO** | **NO** | **GAP** — publications invisible |
| `newsletter_subscribers` | No | No | Not relevant to chat |
| `report_planner_configs` | No | No | Admin only |

### Non-Database Sources

| Source | Connected? | Notes |
|--------|-----------|-------|
| `picc-knowledge-base.ts` (hardcoded) | Yes (always in context) | **STALE** — hardcoded to 2023-24 data, never auto-updated |
| Query expansion module | **NO — never called** | `lib/ai/query-expansion.ts` exists but no import in chat route or context builder |
| Scraped web content (`content_chunks`, `scraped_content`) | **BROKEN** — tables don't exist | `rag-search.ts` references `search_chunks` and `hybrid_search_chunks` RPCs that were never created |

---

## 3. The Gaps — Why the Chat Misses Obvious Content

### GAP 1: RAG Vector Search Is Completely Broken (CRITICAL)

**The problem**: `rag-search.ts` calls three database functions that do not exist:
- `search_chunks` — no migration creates this
- `hybrid_search_chunks` — no migration creates this
- Tables `content_chunks`, `scraped_content`, `scrape_sources` — no migration creates these

**What happens**: `vectorSearch()` fails, falls back to `textSearch()`, which also fails (same missing RPC). The `catch` returns an empty array. Then `searchKnowledgeBaseVector()` tries `match_knowledge_entries` (which DOES exist) but the `content_embeddings` table is likely empty because no batch embedding job has been run.

**Net effect**: The entire RAG section of `getExpandedContext()` contributes nothing. The `Knowledge Base` section in the context is always empty.

### GAP 2: Stories Not in Pre-Context (CRITICAL)

**The problem**: `context-builder.ts` searches 8 tables in parallel but **stories is not one of them**. The `stories` table — the richest content source — is only accessible via the `searchStories` tool. But the LLM needs stories context to know what to search for.

**Example failure**: User asks "tell me about the elders trip to Hull River." The RAG context contains no mention of this story. The LLM has to guess that `searchStories` with the right keywords will find it. If the LLM doesn't call the tool, or calls it with wrong keywords, the user gets nothing.

### GAP 3: Query Expansion Never Used

**The problem**: `lib/ai/query-expansion.ts` is a complete implementation (uses Claude to expand queries, fix typos, add synonyms) but is never imported by the chat route or context builder. This means:
- Typos in user queries fail silently
- Synonym mismatches (e.g., "doctors" vs "health services") reduce recall
- Single-keyword queries get no expansion

### GAP 4: Keyword-Only Matching in Context Builder

**The problem**: All text searches in `context-builder.ts` use `ilike.%query%` which:
- Only matches exact substrings
- Fails on synonyms ("doctors" won't match "health services")
- Fails on partial matches ("safe house" won't match "Safe Haven Service")
- Fails when the query is a question ("what health services do you offer?") because `ilike` matches the whole phrase

### GAP 5: Critical Tables Never Queried

These tables have useful data but the chat cannot see them:
- **`extracted_quotes`** — community quotes extracted from stories (separate from `story_quotes`)
- **`community_feedback`** — "What You Said, What We Did" feedback loop data
- **`service_grants`** — funding/grant information per service
- **`organization_goals`** — organizational goals and aspirations
- **`publications`** — reports, documents, publications
- **`meeting_notes`** — can be written but never read back

### GAP 6: Hardcoded Knowledge Base Is Stale

**The problem**: `picc-knowledge-base.ts` is hardcoded with 2023-24 data:
- Staff count: 197 (was this updated for 2024-25?)
- Revenue: $23.4M (2023-24 figure)
- Board members: hardcoded list (may have changed)
- Services: lists 20 services but database may have more

This data is ALWAYS injected into every chat context, so if it contradicts the database, the LLM gets confused.

### GAP 7: Token Budget Truncation

**The problem**: `getExpandedContext()` is called with `maxContextTokens: 3000` (from route.ts line 43). But the context builder internally uses `maxContextTokens = 12000` as default. The 3000 token limit means ~12,000 characters. With 8+ data sections all fetched, the context is likely truncated mid-sentence, losing the later sections (financials, partners, visions).

### GAP 8: Interview Search Is Title-Only

**The problem**: `searchInterviews()` only matches on `interview_title.ilike.%${query}%`. If the user asks about a topic discussed IN an interview but not in the title, it won't be found. Segment text IS searched but only for interviews already matched by title.

---

## 4. Data Freshness Assessment

| Data Source | Freshness | Update Mechanism | Last Known Update |
|-------------|-----------|-----------------|-------------------|
| `picc-knowledge-base.ts` | **STALE** (2023-24) | Manual code edit | Unknown — hardcoded |
| `stories` | Live | Supabase direct | Continuously updated |
| `elder_quotes` | Live | Supabase direct | Continuously updated |
| `story_quotes` | Live | Extracted from stories | Updated when stories processed |
| `organization_services` | Live | Supabase direct | Continuously updated |
| `service_metrics` | Live | Manual entry | Per fiscal year |
| `annual_financials` | Live | Manual entry | Per fiscal year |
| `governance_achievements` | Live | Manual entry | Per fiscal year |
| `content_embeddings` | **LIKELY EMPTY** | `updateAllEmbeddings()` batch job | No evidence of ever running |
| `knowledge_entries` | **LIKELY EMPTY/SPARSE** | Manual or scraper | No scraper pipeline exists |
| `content_chunks` | **DOES NOT EXIST** | N/A | Never created |
| `projects` | Live | Supabase direct | Continuously updated |
| `interviews` / `interview_segments` | Live | Supabase direct | Continuously updated |
| System prompt | Static | Code deployment | Last deploy |
| HISTORICAL_MILESTONES | Static | Hardcoded in tools.ts | Code deployment |

---

## 5. Priority Fixes

### P0: Fix RAG or Remove It (Immediate)

The broken RAG pipeline adds latency (failed API calls to non-existent RPCs) and returns nothing. Two options:

**Option A (Quick)**: Remove the broken RAG call entirely. The context builder's direct table searches are more reliable. Remove lines 402-409 in `context-builder.ts` that call `getRAGContext()`.

**Option B (Better)**: Populate `content_embeddings` by running `updateAllEmbeddings()` for all content types (story, knowledge, service, person). This enables the `match_content_by_embedding` RPC which DOES exist. Then modify `getRAGContext()` to use `match_content_by_embedding` instead of the non-existent chunk-based RPCs.

### P1: Add Stories to Context Builder (Immediate)

Add a `searchStoriesContext()` function to `context-builder.ts` that:
1. Searches `stories` table by `title.ilike` and `content.ilike`
2. Returns top 3-5 story titles, excerpts, and IDs
3. This gives the LLM awareness of what stories exist, enabling better tool calls

```typescript
async function searchStoriesContext(supabase: SupabaseClient, query: string, limit = 5) {
  const { data } = await supabase
    .from('stories')
    .select('id, title, category, tags, story_date')
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (!data?.length) return { text: '', sources: [] }
  const text = data.map(s => `- "${s.title}" (${s.category || 'general'}, ${s.story_date || 'undated'})`).join('\n')
  return {
    text: `Matching stories:\n${text}`,
    sources: data.map(s => ({ title: s.title, url: `/stories/${s.id}`, type: 'story' }))
  }
}
```

### P2: Increase Token Budget (Immediate)

Change line 43 in `route.ts` from:
```typescript
const expanded = await getExpandedContext(userText, { limit: 5, maxContextTokens: 3000 })
```
to:
```typescript
const expanded = await getExpandedContext(userText, { limit: 8, maxContextTokens: 8000 })
```

Claude claude-sonnet-4-5-20250929 has a 200K context window. 8000 tokens (~32KB) of context is a negligible fraction and prevents truncation of valuable data sections.

### P3: Wire Up Query Expansion (High)

In `context-builder.ts`, import and use `expandQuery()` before running searches:
```typescript
import { expandQuery } from './query-expansion'

// In getExpandedContext:
const expanded = await expandQuery(query)
const searchTerms = [expanded.expanded, ...expanded.alternativeQueries]
// Use searchTerms for all ilike queries
```

This fixes typo sensitivity and synonym mismatches at the cost of one additional Claude API call (~500 tokens, ~50ms).

### P4: Add Missing Tables to Context Builder (Medium)

Add search functions for:
- `community_feedback` — when user asks "what did the community say" or "what feedback"
- `service_grants` — when user asks about funding
- `organization_goals` — when user asks about goals, strategy, direction
- `projects` — summary of all active projects (currently tool-only)

### P5: Populate Vector Embeddings (Medium)

Create a cron job or admin API endpoint that runs `updateAllEmbeddings()` nightly for:
- Stories (content type 'story')
- Services (content type 'service')
- Knowledge entries (content type 'knowledge')
- People/profiles (content type 'person')

Then fix `rag-search.ts` to use `match_content_by_embedding` (the RPC that actually exists) instead of the phantom `hybrid_search_chunks`.

### P6: Fix Interview Search (Low)

Change `searchInterviews()` to also search segment_text directly:
```typescript
// Search segments first, then get parent interviews
const { data: segments } = await supabase
  .from('interview_segments')
  .select('interview_id, segment_text')
  .ilike('segment_text', `%${query}%`)
  .limit(10)
```

### P7: Auto-Update Knowledge Base (Low)

Replace hardcoded stats in `picc-knowledge-base.ts` with a function that queries live data from `staff_statistics`, `annual_financials`, `board_members`, etc. at startup or on first chat request, with caching.

### P8: Add Full-Text Search Indexes (Low)

Add PostgreSQL GIN indexes with `to_tsvector` on key content columns to replace `ilike` with proper full-text search. This dramatically improves search quality for natural language queries.

---

## 6. Root Cause Analysis

The chat pipeline was built in layers over time:
1. **First**: RAG pipeline with scraper → chunks → embeddings (never completed; tables never created)
2. **Second**: Direct table queries in context-builder.ts (working but incomplete)
3. **Third**: Rich tool layer in tools.ts (comprehensive and working)

The problem is that Layer 1 was never finished, Layer 2 was bolted on as a workaround but omitted stories, and Layer 3 only works when the LLM knows to call the right tools. Without good pre-context (Layers 1+2), the LLM makes poor tool-calling decisions.

---

## 7. Success Criteria

After fixes, the chat should be able to:
1. Find any published story by topic, person, or keyword within 1 tool call
2. Answer "what services does PICC offer?" with a complete list including metrics
3. Answer "tell me about the elders trip" by combining story content + photos + quotes
4. Handle typos ("helth servises") gracefully
5. Surface interview content when relevant to the question
6. Never return an empty answer when relevant data exists in the database
7. Include financial data, staff stats, and governance info for broad questions
