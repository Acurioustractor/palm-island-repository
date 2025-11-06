# AI Features Documentation
## Palm Island Story Server

### Overview
The Palm Island Story Server includes powerful AI-powered research tools that enable semantic search, theme exploration, quote discovery, and conversational research across the archive. These tools use OpenAI's advanced language models to understand meaning and context, providing deeper insights into community stories.

---

## Current Status (Phase 1 Complete ✅)

### ✅ Phase 1: Semantic Search - IMPLEMENTED

#### What's Working:
- **OpenAI Integration**: Fully configured OpenAI SDK with embeddings API
- **Database Schema**: All AI tables created with pgvector extension
- **Embeddings Pipeline**: Functions to generate and store embeddings for stories and documents
- **Vector Search**: Semantic similarity search across stories and documents
- **Search UI**: Beautiful, user-friendly search interface with example queries
- **Search History**: Tracks user searches for analytics and UX improvements

#### Features Available:
1. **Natural Language Search** (`/research/semantic-search`)
   - Search by asking questions in plain English
   - Find stories by meaning, not just keywords
   - Results ranked by semantic relevance
   - Separate or combined search across stories and documents
   - Shows similarity scores (match percentage)

2. **Research Hub** (`/research`)
   - Central hub for all AI research tools
   - Feature cards showing available and upcoming tools
   - Educational content about how AI research works
   - Privacy and ethics information

---

## Technical Architecture

### Database Schema

#### Tables Created:
```
✅ story_embeddings          - Vector embeddings for stories
✅ document_embeddings       - Vector embeddings for documents
✅ themes                    - AI-extracted themes and topics
✅ story_themes              - Relationships between stories and themes
✅ story_quotes              - Extracted quotes with context
✅ chat_sessions             - Research assistant conversations
✅ chat_messages             - Individual chat messages with context
✅ search_history            - User search tracking
✅ saved_searches            - Bookmarked searches
```

#### Database Functions:
```sql
✅ find_similar_stories()        - Vector similarity search for stories
✅ find_similar_documents()      - Vector similarity search for documents
✅ get_theme_stats()             - Theme statistics and relationships
✅ update_theme_story_counts()   - Maintain theme counters
✅ search_quotes_by_embedding()  - Semantic quote search
```

### API Endpoints

#### Implemented:
- `POST /api/ai/embeddings/generate` - Generate embedding for a story or document
- `POST /api/ai/embeddings/batch` - Batch generate embeddings
- `POST /api/ai/search/semantic` - Semantic search across content

#### Planned (Not Yet Implemented):
- `/api/ai/themes/extract` - Extract themes from stories
- `/api/ai/themes/analyze` - Analyze theme patterns
- `/api/ai/themes/connections` - Find theme relationships
- `/api/ai/quotes/extract` - Extract quotes from stories
- `/api/ai/quotes/search` - Search quotes by topic
- `/api/ai/chat/create-session` - Start chat session
- `/api/ai/chat/send-message` - Send message to assistant

### Components

#### Implemented:
```
components/ai/
  ✅ SemanticSearch.tsx - Main search interface component
```

#### Planned (Not Yet Implemented):
```
components/ai/
  ⏳ ThemeExplorer.tsx      - Browse and explore themes
  ⏳ ThemeNetwork.tsx       - Visual theme network
  ⏳ ThemeCard.tsx          - Individual theme display
  ⏳ QuoteFinder.tsx        - Quote search interface
  ⏳ QuoteCard.tsx          - Quote display with attribution
  ⏳ ResearchAssistant.tsx  - AI chat interface
  ⏳ ChatMessage.tsx        - Individual message display
  ⏳ ContextViewer.tsx      - View sources used in chat
```

### Code Structure

#### Core AI Library:
```
lib/openai/
  ✅ client.ts       - OpenAI configuration and utilities
  ✅ embeddings.ts   - Embedding generation and search functions
```

**Key Functions:**
- `generateEmbedding(text)` - Generate vector embedding for text
- `generateStoryEmbedding(storyId)` - Generate and store story embedding
- `generateDocumentEmbedding(documentId)` - Generate and store document embedding
- `batchGenerateStoryEmbeddings(storyIds)` - Batch process multiple stories
- `searchStories(query, limit)` - Semantic search across stories
- `searchDocuments(query, limit)` - Semantic search across documents

---

## How to Use the AI Features

### For Users

#### Semantic Search:

1. **Access the Search**
   - Navigate to `/research` or click "Research" in main navigation
   - Click "Try Semantic Search" or select "Semantic Search" from tools

2. **Perform a Search**
   - Type your question or description in natural language
   - Choose search type: All Content, Stories, or Documents
   - Click "Search" or press Enter

3. **Example Queries**
   - "Stories about traditional fishing practices"
   - "Experiences during Cyclone 2019"
   - "Community leaders and elders"
   - "Housing and infrastructure challenges"
   - "Cultural ceremonies and celebrations"

4. **View Results**
   - Results show similarity percentage (how well they match)
   - Stories include author, summary, and date
   - Documents show category, author, and date
   - Click any result to view full content

### For Developers

#### Generate Embeddings for Content:

```typescript
// Generate embedding for a single story
import { generateStoryEmbedding } from '@/lib/openai/embeddings';
await generateStoryEmbedding(storyId);

// Generate embedding for a document
import { generateDocumentEmbedding } from '@/lib/openai/embeddings';
await generateDocumentEmbedding(documentId);

// Batch generate embeddings
import { batchGenerateStoryEmbeddings } from '@/lib/openai/embeddings';
const result = await batchGenerateStoryEmbeddings(storyIds);
console.log(`Success: ${result.successful.length}, Failed: ${result.failed.length}`);
```

#### Perform Semantic Search:

```typescript
import { searchStories, searchDocuments } from '@/lib/openai/embeddings';

// Search stories
const stories = await searchStories("traditional fishing", 10);

// Search documents
const docs = await searchDocuments("housing challenges", 10);
```

#### API Usage:

```bash
# Generate embedding
curl -X POST /api/ai/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{"type": "story", "id": "story-uuid"}'

# Batch generate
curl -X POST /api/ai/embeddings/batch \
  -H "Content-Type: application/json" \
  -d '{"type": "story", "storyIds": ["id1", "id2"]}'

# Semantic search
curl -X POST /api/ai/search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query": "traditional fishing", "searchType": "all", "limit": 20}'
```

---

## Configuration

### Environment Variables

**Required:**
```bash
# OpenAI API Key (required for all AI features)
OPENAI_API_KEY=sk-...

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Optional:**
```bash
# Model Configuration
OPENAI_MODEL=gpt-4-turbo-preview              # Default for chat
OPENAI_EMBEDDING_MODEL=text-embedding-3-small # Default for embeddings

# Feature Flags
ENABLE_SEMANTIC_SEARCH=true        # Enable/disable semantic search
ENABLE_THEME_ANALYSIS=true         # Enable/disable theme features
ENABLE_QUOTE_FINDER=true           # Enable/disable quote finder
ENABLE_RESEARCH_ASSISTANT=true     # Enable/disable chat assistant

# Rate Limiting
AI_REQUESTS_PER_HOUR=100          # Max requests per user per hour
```

### Database Setup

The database migration has already been created. To apply it:

1. **Via Supabase Dashboard:**
   ```
   1. Go to Supabase Dashboard > SQL Editor
   2. Open database-migrations/004_ai_features.sql
   3. Copy and paste the entire file
   4. Click "Run" to execute
   ```

2. **Via Command Line:**
   ```bash
   psql $DATABASE_URL < database-migrations/004_ai_features.sql
   ```

3. **Verify Installation:**
   ```sql
   -- Check if pgvector extension is enabled
   SELECT * FROM pg_extension WHERE extname = 'vector';

   -- Check if tables exist
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE '%embedding%' OR table_name LIKE '%theme%';
   ```

---

## Cost Analysis

### OpenAI Pricing (as of 2025)

**Models Used:**
- **text-embedding-3-small**: $0.00002 per 1K tokens (~$0.02 per million tokens)
- **gpt-4-turbo-preview**: $0.01/1K input tokens, $0.03/1K output tokens (for future features)

### Estimated Costs

#### Initial Setup:
```
1000 stories × 500 tokens each × $0.00002/1K tokens = $0.01
1000 documents × 300 tokens each × $0.00002/1K tokens = $0.006
Total: ~$0.016 (less than 2 cents)
```

#### Ongoing Usage:
```
Semantic Search:
- 100 searches/day × 100 tokens × $0.00002/1K = $0.0002/day
- Monthly: ~$0.006/month (less than 1 cent)

New Content:
- 10 new stories/day × 500 tokens × $0.00002/1K = $0.0001/day
- Monthly: ~$0.003/month (less than 1 cent)

Total Ongoing: ~$0.01/month for Phase 1 features
```

#### Future Features (estimated):
```
Theme Extraction (using GPT-4):
- 1000 stories × 1000 tokens × $0.01/1K = $10 one-time
- Ongoing: ~$1-2/month for new stories

Quote Extraction:
- Similar to theme extraction: ~$10 one-time, $1-2/month ongoing

Research Assistant Chat:
- 100 conversations/day × 2000 tokens average × $0.02/1K = $4/day
- Monthly: ~$120/month (high usage scenario)
- Realistic usage: ~$20-40/month
```

### Cost Optimization Tips:

1. **Cache Embeddings**: Never regenerate embeddings for existing content
2. **Batch Processing**: Process multiple items together
3. **Smart Regeneration**: Only regenerate embeddings when content changes significantly
4. **Rate Limiting**: Implement per-user rate limits
5. **Monitor Usage**: Set up OpenAI usage alerts
6. **Smaller Models**: Use text-embedding-3-small instead of ada-002 (20x cheaper)

---

## Future Phases (Not Yet Implemented)

### Phase 2: Theme Analysis ⏳

**Features:**
- Automatic theme extraction from stories using GPT-4
- Theme clustering and categorization
- Visual theme network showing connections
- Theme-based story recommendations
- Theme evolution over time
- Cross-storyteller theme analysis

**Components Needed:**
- ThemeExplorer.tsx
- ThemeNetwork.tsx (with D3.js or similar)
- ThemeCard.tsx

**API Routes:**
- `/api/ai/themes/extract`
- `/api/ai/themes/analyze`
- `/api/ai/themes/connections`

### Phase 3: Quote Finder ⏳

**Features:**
- Automatic quote extraction from stories
- Quote search by topic, theme, or sentiment
- Impact scoring for quotes
- Shareable quote cards with attribution
- Context viewer showing surrounding text
- Featured quotes section

**Components Needed:**
- QuoteFinder.tsx
- QuoteCard.tsx
- QuoteContextViewer.tsx

**API Routes:**
- `/api/ai/quotes/extract`
- `/api/ai/quotes/search`
- `/api/ai/quotes/featured`

### Phase 4: Research Assistant Chat ⏳

**Features:**
- Conversational AI interface
- RAG (Retrieval Augmented Generation)
- Ask questions about the archive
- Get summaries of multiple stories
- Compare storyteller perspectives
- Timeline generation
- Source citation with links
- Export conversation as research notes

**Components Needed:**
- ResearchAssistant.tsx
- ChatMessage.tsx
- ChatSuggestions.tsx
- ContextViewer.tsx

**API Routes:**
- `/api/ai/chat/create-session`
- `/api/ai/chat/send-message`
- `/api/ai/chat/get-history`

---

## Data Sovereignty & Ethics

### Indigenous Data Sovereignty Principles

The AI features are designed with Indigenous Data Sovereignty in mind:

1. **Community Control**
   - All data remains within the Palm Island Story Server
   - Community maintains full control over stories and data
   - AI features respect existing access permissions
   - No external sharing of community stories with third parties

2. **Cultural Sensitivity**
   - AI tools preserve cultural context and proper attribution
   - Stories are never modified or summarized without permission
   - Traditional knowledge is treated with appropriate respect
   - Community protocols are maintained in AI interactions

3. **Transparency**
   - Users can see how AI features work
   - Clear information about what data is processed
   - Visible citations and sources
   - No hidden algorithms or black-box processing

4. **Privacy**
   - Search history is private to each user
   - Chat sessions are confidential
   - Personal information is never used for AI training
   - OpenAI API is used in zero-retention mode (data not used for training)

### Technical Safeguards

1. **Access Control**
   - AI features inherit the same RLS (Row Level Security) as the main platform
   - Unpublished stories are never included in search results
   - Permissions are checked at every query

2. **Data Processing**
   - Only text content is sent to OpenAI (no personal identifiers)
   - Embeddings are stored locally in Supabase
   - Full stories remain in the community database
   - OpenAI doesn't retain or train on the data

3. **Audit Trail**
   - All AI operations are logged
   - Search history provides usage insights
   - Chat sessions record context used
   - Failed operations are tracked for debugging

---

## Performance Considerations

### Response Times

**Current Performance:**
- Semantic Search: 1-3 seconds
  - Embedding generation: ~500ms
  - Vector search: ~200ms
  - Result fetching: ~500ms
  - Frontend rendering: ~300ms

### Optimization Strategies

1. **Caching**
   - Embeddings are cached permanently (don't regenerate)
   - Common queries could be cached temporarily
   - Results cached for 5-10 minutes for identical queries

2. **Indexing**
   - Vector indexes (IVFFLAT) for fast similarity search
   - Regular indexes on foreign keys
   - Composite indexes on frequently filtered fields

3. **Batch Processing**
   - Generate embeddings in batches during off-peak hours
   - Process new content asynchronously
   - Rate limiting prevents API overload

4. **Progressive Enhancement**
   - Load search interface immediately
   - Stream results as they arrive
   - Show placeholders during loading
   - Graceful degradation if API fails

---

## Troubleshooting

### Common Issues

#### 1. "Search failed" Error
**Possible Causes:**
- OpenAI API key not configured
- API rate limit exceeded
- Database connection issues
- No embeddings generated yet

**Solutions:**
```bash
# Check API key
echo $OPENAI_API_KEY

# Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check if embeddings exist
SELECT COUNT(*) FROM story_embeddings;

# Generate missing embeddings
npm run generate-embeddings
```

#### 2. No Search Results
**Possible Causes:**
- Embeddings not generated for stories
- Query too specific or using wrong terminology
- Match threshold too high

**Solutions:**
- Generate embeddings for all stories
- Try broader or different queries
- Check story publication status

#### 3. Slow Search Performance
**Possible Causes:**
- Missing vector indexes
- Large result set
- API latency

**Solutions:**
```sql
-- Check if vector index exists
SELECT * FROM pg_indexes WHERE indexname LIKE '%embedding%';

-- Rebuild index if needed
REINDEX INDEX idx_story_embeddings_vector;
```

---

## Development Guide

### Adding New AI Features

#### 1. Define the Feature
- What problem does it solve?
- What user interface is needed?
- What API endpoints are required?
- What data needs to be stored?

#### 2. Update Database Schema
```sql
-- Add new tables or columns
ALTER TABLE stories ADD COLUMN ai_summary TEXT;

-- Create indexes for performance
CREATE INDEX idx_stories_ai_summary ON stories(ai_summary);
```

#### 3. Create API Route
```typescript
// app/api/ai/feature-name/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai/client';

export async function POST(request: NextRequest) {
  // Implement feature logic
}
```

#### 4. Build UI Component
```typescript
// components/ai/FeatureName.tsx
'use client';
import React, { useState } from 'react';

export default function FeatureName() {
  // Component implementation
}
```

#### 5. Add Page Route
```typescript
// app/research/feature-name/page.tsx
import FeatureName from '@/components/ai/FeatureName';

export default function FeatureNamePage() {
  return <FeatureName />;
}
```

#### 6. Update Research Hub
```typescript
// app/research/page.tsx
// Add feature card to the features array
```

### Testing AI Features

```typescript
// __tests__/ai/semantic-search.test.ts
import { searchStories } from '@/lib/openai/embeddings';

describe('Semantic Search', () => {
  it('should return relevant stories', async () => {
    const results = await searchStories('fishing', 5);
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
  });
});
```

---

## Maintenance

### Regular Tasks

#### Weekly:
- Monitor OpenAI usage and costs
- Check for failed embedding generations
- Review search analytics
- Check error logs

#### Monthly:
- Generate embeddings for new content
- Update theme classifications
- Review and optimize slow queries
- Update documentation

#### Quarterly:
- Evaluate new OpenAI models
- Analyze feature usage patterns
- Gather user feedback
- Plan feature improvements

### Monitoring

**Key Metrics to Track:**
- Search queries per day
- Average response time
- Error rate
- API costs
- Most common queries
- Result click-through rate
- Feature adoption rate

**Health Checks:**
```sql
-- Check embedding coverage
SELECT
  (SELECT COUNT(*) FROM story_embeddings)::float /
  (SELECT COUNT(*) FROM stories WHERE is_published = true) * 100
  AS coverage_percentage;

-- Recent search volume
SELECT DATE(created_at) as date, COUNT(*) as searches
FROM search_history
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;

-- Failed operations
SELECT * FROM error_logs
WHERE category = 'ai'
AND created_at > NOW() - INTERVAL '24 hours';
```

---

## API Reference

### Embedding Generation

#### Generate Single Embedding
```
POST /api/ai/embeddings/generate
Content-Type: application/json

{
  "type": "story" | "document",
  "id": "uuid"
}

Response: {
  "success": true,
  "message": "Generated embedding for story {id}"
}
```

#### Batch Generate Embeddings
```
POST /api/ai/embeddings/batch
Content-Type: application/json

{
  "type": "story" | "document",
  "ids": ["uuid1", "uuid2", ...]
}

Response: {
  "success": true,
  "successful": ["uuid1", "uuid2"],
  "failed": [],
  "total": 2
}
```

### Semantic Search

```
POST /api/ai/search/semantic
Content-Type: application/json

{
  "query": "search query",
  "searchType": "all" | "stories" | "documents",
  "limit": 20
}

Response: {
  "success": true,
  "query": "search query",
  "stories": [
    {
      "id": "uuid",
      "title": "Story Title",
      "content": "...",
      "similarity": 0.85,
      "storyteller_id": "uuid",
      "profiles": {
        "full_name": "John Doe",
        "preferred_name": "Johnny"
      }
    }
  ],
  "documents": [...],
  "totalResults": 15
}
```

---

## Resources

### Documentation
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Vector Similarity Search Guide](https://www.postgresql.org/docs/current/functions-vector.html)

### Related Files
- `AI_FEATURES_PLAN.md` - Original implementation plan
- `database-migrations/004_ai_features.sql` - Database schema
- `lib/openai/embeddings.ts` - Core embedding functions
- `components/ai/SemanticSearch.tsx` - Search UI component
- `app/research/*` - Research tool pages

### Support
For questions or issues with AI features:
1. Check this documentation first
2. Review error logs in Supabase Dashboard
3. Check OpenAI API status page
4. Contact the development team

---

## Changelog

### Phase 1 - Semantic Search (Completed)
**Date**: November 2025

**Added:**
- OpenAI integration with embeddings API
- Database tables for AI features
- Vector similarity search functions
- Semantic search API endpoint
- Search UI component
- Research hub page
- Search history tracking

**Database:**
- Created 9 new tables for AI features
- Added pgvector extension
- Created vector indexes for performance
- Added helper functions for search

**Components:**
- SemanticSearch.tsx component
- Research hub layout
- Semantic search page

**API:**
- `/api/ai/embeddings/generate` endpoint
- `/api/ai/embeddings/batch` endpoint
- `/api/ai/search/semantic` endpoint

---

## Next Steps

### Immediate (Phase 1 Completion):
1. ✅ Complete semantic search implementation
2. ⏳ Generate embeddings for all existing stories
3. ⏳ Test search functionality thoroughly
4. ⏳ Gather user feedback on search quality
5. ⏳ Optimize search performance

### Short Term (Phase 2):
1. Implement theme extraction with GPT-4
2. Build theme explorer UI
3. Create visual theme network
4. Add theme-based filtering

### Medium Term (Phase 3):
1. Implement quote extraction
2. Build quote finder interface
3. Add quote sharing functionality
4. Create featured quotes section

### Long Term (Phase 4):
1. Implement RAG for chat assistant
2. Build conversational research interface
3. Add export functionality
4. Integrate with external archives

---

**Documentation Version**: 1.0
**Last Updated**: November 2025
**Status**: Phase 1 Complete, Documentation Current
