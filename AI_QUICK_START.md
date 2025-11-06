# AI Features Quick Start Guide
## Get Started with Palm Island AI Research Tools in 5 Minutes

### Prerequisites
- OpenAI API key
- Supabase project with pgvector extension
- Node.js and npm installed

---

## 1. Configure Environment

Add to your `.env.local`:
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

---

## 2. Run Database Migration

**Option A: Supabase Dashboard**
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Open `database-migrations/004_ai_features.sql`
4. Copy all contents and paste into SQL Editor
5. Click "Run"

**Option B: Command Line**
```bash
psql $DATABASE_URL < database-migrations/004_ai_features.sql
```

---

## 3. Verify Installation

Run this SQL query in Supabase:
```sql
-- Check if pgvector is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('story_embeddings', 'document_embeddings', 'themes');
```

You should see:
- ✅ pgvector extension present
- ✅ Three tables listed

---

## 4. Generate Initial Embeddings

### For All Published Stories:

Create a script `scripts/generate-embeddings.ts`:
```typescript
import { createClient } from '@/lib/supabase/client';
import { batchGenerateStoryEmbeddings } from '@/lib/openai/embeddings';

async function main() {
  const supabase = createClient();

  // Get all published stories without embeddings
  const { data: stories } = await supabase
    .from('stories')
    .select('id')
    .eq('is_published', true)
    .not('id', 'in', supabase.from('story_embeddings').select('story_id'));

  if (!stories || stories.length === 0) {
    console.log('No stories to process');
    return;
  }

  console.log(`Generating embeddings for ${stories.length} stories...`);
  const storyIds = stories.map(s => s.id);

  const result = await batchGenerateStoryEmbeddings(storyIds);
  console.log(`✅ Success: ${result.successful.length}`);
  console.log(`❌ Failed: ${result.failed.length}`);
}

main();
```

Run it:
```bash
npx ts-node scripts/generate-embeddings.ts
```

---

## 5. Test Semantic Search

### Via UI:
1. Navigate to `http://localhost:3000/research`
2. Click "Try Semantic Search"
3. Enter a query like "traditional fishing"
4. View results!

### Via API:
```bash
curl -X POST http://localhost:3000/api/ai/search/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "query": "traditional fishing practices",
    "searchType": "all",
    "limit": 10
  }'
```

### Via Code:
```typescript
import { searchStories } from '@/lib/openai/embeddings';

const results = await searchStories("traditional fishing", 10);
console.log(`Found ${results.length} stories`);
```

---

## 6. Automatic Embeddings for New Content

### Add to Story Creation Hook:

```typescript
// In your story creation API route
import { generateStoryEmbedding } from '@/lib/openai/embeddings';

// After story is created
const { data: story, error } = await supabase
  .from('stories')
  .insert({ ... })
  .select()
  .single();

if (story) {
  // Generate embedding asynchronously
  generateStoryEmbedding(story.id).catch(console.error);
}
```

---

## 7. Usage Examples

### Basic Search:
```typescript
import { searchStories } from '@/lib/openai/embeddings';

// Search for stories about fishing
const fishingStories = await searchStories("fishing", 10);

// Search for stories about cyclones
const cycloneStories = await searchStories("cyclone experiences", 10);

// Search for stories about elders
const elderStories = await searchStories("elder wisdom", 10);
```

### Check Embedding Status:
```sql
-- Count stories with embeddings
SELECT COUNT(*) as stories_with_embeddings FROM story_embeddings;

-- Count stories without embeddings
SELECT COUNT(*) as stories_without_embeddings
FROM stories s
LEFT JOIN story_embeddings se ON s.id = se.story_id
WHERE s.is_published = true AND se.id IS NULL;

-- Coverage percentage
SELECT
  ROUND(
    (SELECT COUNT(*)::float FROM story_embeddings) /
    NULLIF((SELECT COUNT(*) FROM stories WHERE is_published = true), 0) * 100,
    2
  ) as coverage_percentage;
```

### Search with Filters:
```typescript
import { createClient } from '@/lib/supabase/client';
import { searchStories } from '@/lib/openai/embeddings';

async function searchWithFilters(query: string, storytellerId?: string) {
  const results = await searchStories(query, 50);

  if (storytellerId) {
    const supabase = createClient();
    const { data: stories } = await supabase
      .from('stories')
      .select('*')
      .in('id', results.map(r => r.story_id))
      .eq('storyteller_id', storytellerId);

    return stories;
  }

  return results;
}
```

---

## 8. Monitoring & Maintenance

### Check API Usage:
Go to [OpenAI Usage Dashboard](https://platform.openai.com/usage)

### Monitor Search Performance:
```sql
-- Recent searches
SELECT query, results_count, created_at
FROM search_history
ORDER BY created_at DESC
LIMIT 20;

-- Most common searches
SELECT query, COUNT(*) as count
FROM search_history
GROUP BY query
ORDER BY count DESC
LIMIT 10;

-- Average search response time (if tracking)
SELECT AVG(response_time_ms) as avg_response_time
FROM search_history
WHERE created_at > NOW() - INTERVAL '7 days';
```

### Regenerate Embeddings:
```typescript
// Only regenerate if content changed significantly
import { generateStoryEmbedding } from '@/lib/openai/embeddings';

async function regenerateIfNeeded(storyId: string) {
  const supabase = createClient();

  const { data: story } = await supabase
    .from('stories')
    .select('updated_at')
    .eq('id', storyId)
    .single();

  const { data: embedding } = await supabase
    .from('story_embeddings')
    .select('updated_at')
    .eq('story_id', storyId)
    .single();

  if (!embedding || story.updated_at > embedding.updated_at) {
    await generateStoryEmbedding(storyId);
    console.log(`Regenerated embedding for story ${storyId}`);
  }
}
```

---

## 9. Troubleshooting

### "Error generating embedding"
**Check:**
```bash
# Verify API key
echo $OPENAI_API_KEY

# Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### "No search results"
**Check:**
```sql
-- Do embeddings exist?
SELECT COUNT(*) FROM story_embeddings;

-- Are stories published?
SELECT COUNT(*) FROM stories WHERE is_published = true;
```

### "Search is slow"
**Optimize:**
```sql
-- Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('story_embeddings', 'document_embeddings');

-- Rebuild if needed
REINDEX INDEX idx_story_embeddings_vector;
```

---

## 10. Cost Estimation

### For Your Use Case:

**Initial Setup:**
- 100 stories × 500 tokens × $0.00002/1K = $0.001 (0.1 cents)
- 500 stories × 500 tokens × $0.00002/1K = $0.005 (0.5 cents)
- 1000 stories × 500 tokens × $0.00002/1K = $0.01 (1 cent)

**Monthly Usage:**
- 50 searches/day × 30 days × 100 tokens × $0.00002/1K = $0.003/month
- 10 new stories/day × 30 days × 500 tokens × $0.00002/1K = $0.003/month

**Total Monthly: ~$0.01/month (1 cent per month)**

This is incredibly affordable! 🎉

---

## Next Features to Build

Once semantic search is working well:

### Phase 2: Theme Analysis
- Extract themes from stories using GPT-4
- Build theme explorer interface
- Create visual theme network

### Phase 3: Quote Finder
- Extract powerful quotes from stories
- Build quote search interface
- Add shareable quote cards

### Phase 4: Research Assistant
- Build conversational AI chat
- Implement RAG (Retrieval Augmented Generation)
- Add export functionality

---

## Resources

- **Full Documentation**: See `AI_FEATURES_DOCUMENTATION.md`
- **Implementation Plan**: See `AI_FEATURES_PLAN.md`
- **Database Schema**: See `database-migrations/004_ai_features.sql`

---

## Quick Commands Cheatsheet

```bash
# Generate embeddings for a story
curl -X POST /api/ai/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{"type": "story", "id": "story-uuid"}'

# Semantic search
curl -X POST /api/ai/search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query": "fishing", "searchType": "stories", "limit": 10}'

# Check embedding coverage
SELECT COUNT(*) FROM story_embeddings;

# Recent searches
SELECT * FROM search_history ORDER BY created_at DESC LIMIT 10;

# Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

**Questions?** Check the full documentation or review the code in `lib/openai/embeddings.ts`

**Ready to explore?** Navigate to `/research` in your app!

🚀 **You're all set!** Start searching with AI-powered semantic search.
