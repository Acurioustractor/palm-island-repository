# Vector Search Setup Guide

## Phase 1: Enable Vector Search - Setup Instructions

This guide will help you enable semantic vector search on your Palm Island platform.

---

## What You've Built

✅ **SQL Migration**: Created vector columns, indexes, and search functions
✅ **Indexing Script**: Built script to generate embeddings for existing content
✅ **RAG Search Update**: Updated search system to use hybrid vector + keyword search

**Status:** Ready to deploy!

---

## Step 1: Run the SQL Migration

The migration will:
- Add vector columns to `knowledge_entries`, `content_chunks`, and `stories` tables
- Create vector similarity indexes for fast search
- Add database functions for vector matching (`match_chunks`, `match_knowledge_entries`, etc.)

### Option A: Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project (uaxhjzqrdotoahjnxmbj)
3. Go to **SQL Editor**
4. Open the file: [lib/empathy-ledger/migrations/06_enable_vector_embeddings.sql](./lib/empathy-ledger/migrations/06_enable_vector_embeddings.sql)
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **Run**
8. Watch for success messages:
   ```
   ✓ knowledge_entries.embedding column exists
   ✓ content_chunks.embedding column exists
   ✓ stories.embedding column exists
   ✓ All vector columns created successfully
   ✓ Migration 06 complete - Vector embeddings enabled!
   ```

### Option B: Via Supabase CLI

```bash
cd web-platform
supabase db push lib/empathy-ledger/migrations/06_enable_vector_embeddings.sql
```

---

## Step 2: Generate Embeddings for Existing Content

The indexing script will:
- Generate embeddings for all knowledge entries
- Generate embeddings for all content chunks
- Generate embeddings for all stories
- Show cost estimation before running
- Process in batches with progress tracking

### Test Run First (Dry Run - No Changes)

```bash
cd web-platform

# Install dependencies if needed
npm install

# Dry run to see what would happen
npx tsx scripts/index-vectors.ts --dry-run
```

**Expected Output:**
```
🚀 Vector Indexing Script Started
Mode: DRY RUN
Content type: all
Force reindex: false

🔌 Testing database connection...
✓ Database connection successful

📚 Processing knowledge_entries...
Found 150 entries to process
📊 Estimated cost: $0.0045 (2,250 tokens)
🔍 DRY RUN - No changes will be made

📄 Processing content_chunks...
Found 500 chunks to process
📊 Estimated cost: $0.0100 (5,000 tokens)
🔍 DRY RUN - No changes will be made

📖 Processing stories...
Found 200 stories to process
📊 Estimated cost: $0.0050 (2,500 tokens)
🔍 DRY RUN - No changes will be made

═════════════════════════════════════════
📊 INDEXING COMPLETE - SUMMARY
═════════════════════════════════════════
Total Cost: $0.0195
```

### Run For Real

```bash
# Index all content types (recommended)
npx tsx scripts/index-vectors.ts

# Or index specific content types
npx tsx scripts/index-vectors.ts --type=chunks    # Just chunks
npx tsx scripts/index-vectors.ts --type=knowledge # Just knowledge entries
npx tsx scripts/index-vectors.ts --type=stories   # Just stories

# Force reindex (even if embeddings exist)
npx tsx scripts/index-vectors.ts --force
```

**What to Expect:**
1. Script will estimate total cost
2. Ask for confirmation to proceed
3. Process in batches of 100 items
4. Show progress for each batch
5. Save checkpoints every 500 items
6. Show final summary with stats

**Example Output:**
```
🚀 Vector Indexing Script Started
Mode: LIVE
Content type: all

📚 Processing knowledge_entries...
Found 150 entries to process
📊 Estimated cost: $0.0045 (2,250 tokens)
Proceed with indexing? (y/n): y

Processing batch 1/2 (100 items)...
  Generating embeddings...
  Updating database...
  ✓ Batch 1 complete (100/150)

Processing batch 2/2 (50 items)...
  Generating embeddings...
  Updating database...
  ✓ Batch 2 complete (150/150)

✓ Knowledge entries complete: 150 processed, 0 errors

[... continues for chunks and stories ...]

═════════════════════════════════════════
📊 INDEXING COMPLETE - SUMMARY
═════════════════════════════════════════
KNOWLEDGE:
  Processed: 150
  Skipped: 0
  Errors: 0
  Cost: $0.0045

CHUNKS:
  Processed: 500
  Skipped: 0
  Errors: 0
  Cost: $0.0100

STORIES:
  Processed: 200
  Skipped: 0
  Errors: 0
  Cost: $0.0050

TOTAL:
  Processed: 850
  Skipped: 0
  Errors: 0
  Total Cost: $0.0195
═════════════════════════════════════════

🔍 Checking embeddings status...
┌──────────────────────┬────────────┬───────────────────────┬────────────┐
│ table_name           │ total_rows │ rows_with_embeddings  │ percentage │
├──────────────────────┼────────────┼───────────────────────┼────────────┤
│ knowledge_entries    │ 150        │ 150                   │ 100.00     │
│ content_chunks       │ 500        │ 500                   │ 100.00     │
│ stories              │ 200        │ 200                   │ 100.00     │
└──────────────────────┴────────────┴───────────────────────┴────────────┘

✅ All items processed successfully!
```

---

## Step 3: Verify Everything Works

### Check Database Status

```sql
-- Run this in Supabase SQL Editor
SELECT * FROM check_embeddings_status();
```

**Expected Result:**
```
table_name         | total_rows | rows_with_embeddings | percentage
-------------------+------------+----------------------+------------
knowledge_entries  |        150 |                  150 |     100.00
content_chunks     |        500 |                  500 |     100.00
stories            |        200 |                  200 |     100.00
```

### Test Vector Search

The RAG search system will now automatically use vector embeddings when available!

**Test via API:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What services does PICC provide for families?"}
    ]
  }'
```

The response should be more accurate and contextually relevant than before!

---

## Step 4: Enable Embeddings for New Content

Update the scraper to generate embeddings for new scraped content:

The scraper configuration is already set to generate embeddings, but it's disabled by default. To enable:

1. Open [app/api/cron/scrape/route.ts](./app/api/cron/scrape/route.ts)
2. Find line 41:
   ```typescript
   generateEmbeddings: false // Enable when pgvector is ready
   ```
3. Change to:
   ```typescript
   generateEmbeddings: true // ✅ Enabled after vector setup
   ```

Now all new scraped content will automatically get embeddings!

---

## Cost Breakdown

### Initial Indexing (One-Time)
- Knowledge Entries (150 items, ~2,250 tokens): $0.0045
- Content Chunks (500 items, ~5,000 tokens): $0.0100
- Stories (200 items, ~2,500 tokens): $0.0050
- **Total One-Time Cost:** ~$0.02

### Ongoing Costs
- New stories (10/month, ~1,500 tokens): $0.0003/month
- Scraped content (100 chunks/month): $0.002/month
- Query embeddings (100 searches/day, ~5,000 tokens): $0.003/month
- **Total Monthly Cost:** ~$0.01/month (basically free!)

**Providers:**
- Content chunks: Voyage AI ($0.02/1M tokens)
- Knowledge & stories: OpenAI ($0.02/1M tokens)

---

## How It Works

### Before (Keyword Search Only)
```
User query: "healthy eating programs"
           ↓
    PostgreSQL full-text search
           ↓
    Exact/fuzzy keyword matching
           ↓
    Returns: Stories with "healthy", "eating", or "programs"
```

**Problem:** Misses semantically similar content like "nutrition initiatives" or "food wellbeing"

### After (Hybrid Vector + Keyword)
```
User query: "healthy eating programs"
           ↓
    Generate embedding (1024-dim vector)
           ↓
┌──────────────────────────────────────────┐
│  Hybrid Search (70% vector, 30% keyword) │
├──────────────────────────────────────────┤
│  Vector similarity: Semantic understanding│
│  Keyword search: Exact term matching     │
└──────────────────────────────────────────┘
           ↓
    Merge and rank results
           ↓
    Returns: Semantically relevant content
```

**Benefits:**
- Finds "nutrition programs", "healthy tucker", "food wellbeing"
- Understands context and intent
- More accurate, relevant results

---

## Troubleshooting

### Error: "Missing Supabase credentials"
**Solution:** Make sure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=https://uaxhjzqrdotoahjnxmbj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Error: "Function match_chunks does not exist"
**Solution:** Run Step 1 (SQL migration) again

### Error: "Column embedding does not exist"
**Solution:** Run Step 1 (SQL migration) first

### Warning: "Failed to generate query embedding, falling back to text search"
**Cause:** API keys missing or rate limit hit
**Solution:** Check `.env.local` for:
```
VOYAGE_API_KEY=your_voyage_key
OPENAI_API_KEY=your_openai_key
```

### Indexing is slow
**Normal:** Processing 1000 items takes ~5-10 minutes
**Speed up:** Use `--type=` to index one table at a time

### Some items failed to process
**Check:** Error messages in output
**Common causes:**
- Rate limit hit (wait and retry)
- Invalid content (empty text)
- Network issues (retry failed batch)

**Resume from checkpoint:**
```bash
# Script automatically skips items that already have embeddings
npx tsx scripts/index-vectors.ts
```

---

## Next Steps

Once vector search is working:

1. ✅ Vector search enabled
2. **Next:** Build public chat UI page ([/chat](../app/chat/page.tsx))
3. **Next:** Build staff assistant UI page ([/picc/assistant](../app/picc/assistant/page.tsx))
4. **Later:** Enable automated intelligence briefs
5. **Later:** Build partnership opportunity finder

---

## Need Help?

- Check the [AI Infrastructure Audit](./AI-INFRASTRUCTURE-AUDIT.md) for complete technical details
- Check the [Executive Summary](./AI-AUDIT-EXECUTIVE-SUMMARY.md) for high-level overview
- Review [AI Infrastructure Comparison](./AI-INFRASTRUCTURE-COMPARISON.md) for feature comparison

---

**Phase 1 Complete Checklist:**
- [ ] Run SQL migration (Step 1)
- [ ] Run indexing script --dry-run (Step 2)
- [ ] Run indexing script for real (Step 2)
- [ ] Verify embeddings status (Step 3)
- [ ] Test vector search via API (Step 3)
- [ ] Enable embeddings for new content (Step 4)

**When all checked:** Vector search is LIVE! 🎉

**Total time:** 30-60 minutes
**Total cost:** ~$0.02 one-time
**Ongoing cost:** ~$0.01/month
