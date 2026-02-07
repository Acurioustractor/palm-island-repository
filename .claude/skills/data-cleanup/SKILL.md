# Data Cleanup Skill

Run data enrichment, cleanup, and migration pipelines with built-in validation.

## When to Use

- "Clean up the data"
- "Run the enrichment pipeline"
- "Fix media tags" / "Update story embeddings"
- Any bulk data operation on Supabase
- Headless automation of data pipelines

## Workflow

### 1. Pre-Flight Assessment

Before running any data operation:

```bash
# Check what scripts are available
ls web-platform/scripts/*.ts

# Check database state via Supabase MCP
# Use mcp__supabase__execute_sql to query current counts
```

Understand what you're working with:
- How many records will be affected?
- Is this reversible? (If not, confirm with user)
- Are there dependent tables that will be affected?

### 2. Snapshot Before Changes

Always capture the "before" state:
```sql
-- Example: count records before cleanup
SELECT count(*) as total,
       count(CASE WHEN tags IS NOT NULL THEN 1 END) as tagged,
       count(CASE WHEN embeddings IS NOT NULL THEN 1 END) as embedded
FROM stories;
```

### 3. Execute Pipeline

Run the appropriate script. Available pipelines:

| Script | Purpose |
|--------|---------|
| `scripts/auto-assign-stories.ts` | Auto-assign stories to services |
| `scripts/check-embeddings.ts` | Verify embedding coverage |
| `scripts/check-knowledge-entries.ts` | Validate knowledge base |
| `scripts/enrich-media-tags.ts` | AI-powered media tagging |
| `scripts/fix-image-urls.ts` | Fix broken image URLs |
| `scripts/fix-event-tags.ts` | Clean up event tags |
| `scripts/add-content-type-tags.ts` | Add content type classifications |
| `scripts/generate-stories-from-interviews.ts` | Generate stories from interview transcripts |
| `scripts/link-stories-and-quotes.ts` | Link stories with their quotes |
| `scripts/import-picc-website-gallery.ts` | Import gallery from PICC website |
| `scripts/import-board-photos.ts` | Import board member photos |

### 4. Validate Results

After running a pipeline, verify changes took effect:

```sql
-- Example: compare after cleanup
SELECT count(*) as total,
       count(CASE WHEN tags IS NOT NULL THEN 1 END) as tagged,
       count(CASE WHEN embeddings IS NOT NULL THEN 1 END) as embedded
FROM stories;
```

Compare with the "before" snapshot. Report:
- Records processed
- Records changed
- Records skipped (and why)
- Any errors encountered

### 5. Self-Correcting Loop

If the pipeline produces errors:
1. Read the error output carefully
2. Identify the root cause (missing column? wrong data type? API rate limit?)
3. Fix the underlying issue
4. Re-run ONLY the failed portion
5. Validate again

Do NOT re-run the entire pipeline if only a subset failed.

## Headless Automation

For unattended data operations, use Claude Code headless mode:

```bash
# Run all pending data enrichment
claude -p "Run data-cleanup skill: check embeddings, fix image URLs, and enrich media tags. Report results." \
  --allowedTools "Bash,Read,Write,Grep,Glob,mcp__supabase__execute_sql"

# Pre-report data validation
claude -p "Run data-validate skill for year 2025, then run data-cleanup for any gaps found." \
  --allowedTools "Bash,Read,Grep,Glob,mcp__supabase__execute_sql"
```

## Safety Rules

- NEVER delete data without explicit user confirmation
- ALWAYS snapshot before bulk operations
- For operations affecting > 100 records, show a sample of 5 before proceeding
- Rate limit external API calls (AI tagging, image processing) to avoid hitting limits
- If a script fails partway through, note which records were processed so you can resume
