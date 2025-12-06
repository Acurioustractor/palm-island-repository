# PICC AI Scraper & RAG System Implementation Plan

## Overview

Build an automated web scraping and RAG (Retrieval Augmented Generation) system that:
1. Scrapes PICC-related content from the web monthly
2. Chunks and embeds content for semantic search
3. Prevents duplication with smart deduplication
4. Powers annual reports and a community chatbot

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PICC Knowledge System                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Scraper    │────▶│   Chunker    │────▶│  Embedder    │    │
│  │  (Firecrawl) │     │ (256 tokens) │     │ (Voyage AI)  │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│         │                                          │            │
│         ▼                                          ▼            │
│  ┌──────────────┐                         ┌──────────────┐     │
│  │ Deduplicator │                         │ Vector Store │     │
│  │  (MinHash)   │                         │  (Supabase)  │     │
│  └──────────────┘                         └──────────────┘     │
│                                                    │            │
│                                                    ▼            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    RAG Query Engine                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │ Report Gen  │  │  Chatbot    │  │ Knowledge Search │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Schema for Scraped Content

### New Tables Required

```sql
-- Scrape sources configuration
CREATE TABLE scrape_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN (
    'website', 'news_site', 'government', 'social_media', 'pdf_repository'
  )),
  scrape_frequency TEXT DEFAULT 'monthly' CHECK (scrape_frequency IN (
    'daily', 'weekly', 'monthly', 'quarterly', 'manual'
  )),
  css_selectors JSONB,  -- Custom selectors for content extraction
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scrape jobs tracking
CREATE TABLE scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES scrape_sources(id),
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  pages_scraped INTEGER DEFAULT 0,
  chunks_created INTEGER DEFAULT 0,
  duplicates_found INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraped content (raw)
CREATE TABLE scraped_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES scrape_sources(id),
  job_id UUID REFERENCES scrape_jobs(id),
  url TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,  -- For deduplication
  metadata JSONB,  -- Author, date, etc.
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_hash)
);

-- Content chunks with embeddings
CREATE TABLE content_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES scraped_content(id) ON DELETE CASCADE,
  knowledge_entry_id UUID REFERENCES knowledge_entries(id),
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_hash TEXT NOT NULL,  -- For chunk-level dedup
  token_count INTEGER,
  embedding vector(1024),  -- Voyage AI dimension
  metadata JSONB,  -- Position info, headers, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chunk_hash)
);

-- Index for vector similarity search
CREATE INDEX ON content_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

## Phase 2: Scraper Integration (Firecrawl + Jina)

### Why This Combo?
- **Firecrawl**: Deep crawling, JavaScript rendering, structured extraction
- **Jina Reader**: Free backup, simple single-page extraction

### Scraper Service

```typescript
// lib/scraper/firecrawl-client.ts
import FirecrawlApp from '@mendable/firecrawl-js'

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })

export async function scrapeUrl(url: string) {
  return firecrawl.scrapeUrl(url, {
    formats: ['markdown', 'html'],
    onlyMainContent: true,
  })
}

export async function crawlSite(url: string, maxPages: number = 50) {
  return firecrawl.crawlUrl(url, {
    limit: maxPages,
    scrapeOptions: { formats: ['markdown'] }
  })
}
```

### Jina Fallback

```typescript
// lib/scraper/jina-client.ts
export async function jinaFetch(url: string) {
  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers: { 'Authorization': `Bearer ${process.env.JINA_API_KEY}` }
  })
  return response.text()
}
```

---

## Phase 3: Content Chunking

### Strategy: Semantic Chunking with Overlap

```typescript
// lib/chunker/semantic-chunker.ts

interface Chunk {
  text: string
  index: number
  tokenCount: number
  metadata: {
    startChar: number
    endChar: number
    headers: string[]
  }
}

export function chunkContent(content: string, options = {
  maxTokens: 256,
  overlap: 50,
  preserveHeaders: true
}): Chunk[] {
  // 1. Split by headers/paragraphs
  // 2. Merge small sections
  // 3. Split large sections
  // 4. Add overlap between chunks
  // 5. Return with metadata
}
```

### Optimal Chunk Size: 256 tokens
- Good for fact retrieval
- Fits well in context windows
- Balances precision vs context

---

## Phase 4: Embedding Generation

### Primary: Voyage AI (Best Performance)

```typescript
// lib/embeddings/voyage-client.ts

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'voyage-3-lite',  // $0.02/1M tokens - best value
      input: texts,
      input_type: 'document'
    })
  })

  const data = await response.json()
  return data.data.map((d: any) => d.embedding)
}
```

### Fallback: OpenAI (Already in codebase)

```typescript
import OpenAI from 'openai'
const openai = new OpenAI()

export async function openaiEmbeddings(texts: string[]) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts
  })
  return response.data.map(d => d.embedding)
}
```

---

## Phase 5: Deduplication System

### Multi-Level Deduplication

```typescript
// lib/deduplication/dedup-service.ts
import { createHash } from 'crypto'

// Level 1: Exact content hash
export function contentHash(content: string): string {
  return createHash('sha256')
    .update(content.toLowerCase().trim())
    .digest('hex')
}

// Level 2: MinHash for near-duplicates
export function minHashSignature(content: string, numPerm: number = 128): number[] {
  const shingles = getShingles(content, 3)  // 3-word shingles
  const signature: number[] = []

  for (let i = 0; i < numPerm; i++) {
    let minHash = Infinity
    for (const shingle of shingles) {
      const hash = hashWithSeed(shingle, i)
      if (hash < minHash) minHash = hash
    }
    signature.push(minHash)
  }
  return signature
}

// Level 3: Semantic similarity check
export async function semanticDuplicate(
  embedding: number[],
  existingEmbeddings: number[][],
  threshold: number = 0.92
): Promise<boolean> {
  for (const existing of existingEmbeddings) {
    if (cosineSimilarity(embedding, existing) > threshold) {
      return true
    }
  }
  return false
}
```

---

## Phase 6: Scheduled Scraping

### Cron Job Configuration

```typescript
// app/api/cron/scrape/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get sources due for scraping
  const sources = await getSourcesDueForScraping()

  for (const source of sources) {
    await queueScrapeJob(source.id)
  }

  return NextResponse.json({ queued: sources.length })
}
```

### Vercel Cron Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/scrape",
      "schedule": "0 0 1 * *"  // Monthly on 1st
    }
  ]
}
```

---

## Phase 7: RAG Query Engine

### Semantic Search Function

```typescript
// lib/rag/search.ts

export async function semanticSearch(
  query: string,
  options: {
    limit?: number
    filters?: Record<string, any>
    includeMetadata?: boolean
  } = {}
) {
  const { limit = 10 } = options

  // 1. Generate query embedding
  const queryEmbedding = await generateEmbeddings([query])

  // 2. Vector similarity search
  const { data: chunks } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding[0],
    match_threshold: 0.7,
    match_count: limit
  })

  // 3. Return with context
  return chunks.map(chunk => ({
    text: chunk.chunk_text,
    score: chunk.similarity,
    source: chunk.source_url,
    metadata: chunk.metadata
  }))
}
```

### Supabase RPC Function

```sql
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1024),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  chunk_text text,
  similarity float,
  source_url text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.chunk_text,
    1 - (cc.embedding <=> query_embedding) as similarity,
    sc.url as source_url,
    cc.metadata
  FROM content_chunks cc
  JOIN scraped_content sc ON cc.content_id = sc.id
  WHERE 1 - (cc.embedding <=> query_embedding) > match_threshold
  ORDER BY cc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## Phase 8: Chatbot Interface

### Chat API Endpoint

```typescript
// app/api/chat/route.ts

export async function POST(request: NextRequest) {
  const { messages } = await request.json()
  const lastMessage = messages[messages.length - 1].content

  // 1. Retrieve relevant context
  const context = await semanticSearch(lastMessage, { limit: 5 })

  // 2. Build prompt with context
  const systemPrompt = `You are a helpful assistant for Palm Island Community Company (PICC).

Use the following context to answer questions:
${context.map(c => c.text).join('\n\n')}

Guidelines:
- Be respectful and culturally sensitive
- Use information from the context provided
- If unsure, say so - don't make things up
- Cite sources when possible`

  // 3. Generate response with Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    system: systemPrompt,
    messages: messages,
    max_tokens: 1024
  })

  return NextResponse.json({
    response: response.content[0].text,
    sources: context.map(c => c.source)
  })
}
```

---

## Phase 9: Default Scrape Sources

### Initial Configuration

```typescript
const DEFAULT_SOURCES = [
  {
    name: 'PICC Website',
    url: 'https://www.picc.com.au',
    source_type: 'website',
    scrape_frequency: 'monthly'
  },
  {
    name: 'Queensland Government - Palm Island',
    url: 'https://www.qld.gov.au/search?query=palm+island',
    source_type: 'government',
    scrape_frequency: 'monthly'
  },
  {
    name: 'ABC News - Palm Island',
    url: 'https://www.abc.net.au/news/topic/palm-island',
    source_type: 'news_site',
    scrape_frequency: 'weekly'
  },
  {
    name: 'NIAA - Palm Island',
    url: 'https://www.niaa.gov.au/search?query=palm+island',
    source_type: 'government',
    scrape_frequency: 'monthly'
  },
  {
    name: 'SNAICC News',
    url: 'https://www.snaicc.org.au/news/',
    source_type: 'news_site',
    scrape_frequency: 'monthly'
  }
]
```

---

## Implementation Order

### Week 1-2: Foundation
1. [ ] Add pgvector extension to Supabase
2. [ ] Create database tables (scrape_sources, scrape_jobs, scraped_content, content_chunks)
3. [ ] Install dependencies (firecrawl, voyage AI SDK)
4. [ ] Build chunking service

### Week 3-4: Scraping Pipeline
5. [ ] Implement Firecrawl integration
6. [ ] Implement Jina fallback
7. [ ] Build deduplication service
8. [ ] Create scrape job queue

### Week 5-6: Embeddings & Search
9. [ ] Integrate Voyage AI embeddings
10. [ ] Build vector search function
11. [ ] Create RAG query engine
12. [ ] Add semantic search API

### Week 7-8: Automation & UI
13. [ ] Set up cron jobs for monthly scraping
14. [ ] Build scrape management UI
15. [ ] Create chatbot interface
16. [ ] Integration with annual reports

---

## Cost Estimates (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| Firecrawl | ~5,000 pages | ~$40 |
| Voyage AI Embeddings | ~2M tokens | ~$4 |
| Supabase (pgvector) | Included | $0 |
| Vercel Cron | Included | $0 |
| **Total** | | **~$44/month** |

---

## Environment Variables Required

```env
# Scraping
FIRECRAWL_API_KEY=
JINA_API_KEY=

# Embeddings
VOYAGE_API_KEY=

# Cron
CRON_SECRET=

# Existing (already configured)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

---

## Security Considerations

1. **Rate Limiting**: Implement rate limits on scraping to avoid IP blocks
2. **Content Filtering**: Filter out irrelevant/harmful content before storage
3. **Source Verification**: Only scrape from verified, trusted sources
4. **Data Retention**: Set up retention policies for old content
5. **Access Control**: Chatbot should only surface appropriate content

---

## Success Metrics

- [ ] Monthly scraping completes without errors
- [ ] <5% duplicate content stored
- [ ] Semantic search returns relevant results (>80% relevance)
- [ ] Chatbot responses cite accurate sources
- [ ] Annual report generation uses scraped content effectively
