# Headless Automation Scripts

Run Claude Code non-interactively for repetitive tasks.

## Data Cleanup

```bash
# Run all data enrichment pipelines
claude -p "Run the /data-cleanup skill: check embeddings coverage, fix broken image URLs, and enrich media tags. Report a summary of records processed and any errors." \
  --allowedTools "Bash,Read,Write,Grep,Glob,mcp__supabase__execute_sql"
```

## Pre-Deployment Check

```bash
# Verify build, types, and env vars before deploying
claude -p "Run pre-deployment checks: 1) Run npm run build in web-platform/ and report any errors. 2) Check that all environment variables referenced in the code exist in .env.local. 3) Run npx tsc --noEmit and report type errors. Return a pass/fail summary." \
  --allowedTools "Bash,Read,Grep,Glob"
```

## Annual Report Generation

```bash
# Full pipeline: validate → assemble → generate → validate PDF
claude -p "Generate the 2025 annual report end-to-end using the /report skill: 1) Run validate_data.py for year 2025. 2) Run assemble_content.py to create the JSON. 3) Run generate_pdf.py to create the PDF. 4) Run validate_pdf.py on the output. Report all results including page count, file size, and any validation failures." \
  --allowedTools "Bash,Read,Write,Grep,Glob"
```

## Data Validation

```bash
# Check database readiness for annual report
claude -p "Run the /data-validate skill for year 2025. Report which tables have data, which are empty, and what needs to be populated before the annual report can be generated." \
  --allowedTools "Bash,Read,Grep,Glob,mcp__supabase__execute_sql"
```

## Batch Image Processing

```bash
# Process and tag untagged media
claude -p "Find all media records in Supabase that don't have tags. For each, generate appropriate tags based on the file name and any associated story. Update the records. Report how many were processed." \
  --allowedTools "Bash,Read,Grep,Glob,mcp__supabase__execute_sql"
```

## Story Embeddings Refresh

```bash
# Regenerate embeddings for stories missing them
claude -p "Run web-platform/scripts/check-embeddings.ts to find stories without embeddings. For any found, run the embedding generation. Report counts before and after." \
  --allowedTools "Bash,Read,Grep,Glob"
```

## Usage Tips

- Add `--output-format json` for machine-readable output
- Add `--max-turns 50` for longer-running pipelines
- Chain multiple headless commands in a shell script for daily automation
- Use cron to schedule regular data maintenance:

```cron
# Daily data validation at 6am
0 6 * * * claude -p "Run /data-validate for year 2025" --allowedTools "Bash,Read,Grep,Glob,mcp__supabase__execute_sql" >> /var/log/picc-data-check.log 2>&1

# Weekly media tag enrichment
0 2 * * 1 claude -p "Run /data-cleanup for media tags" --allowedTools "Bash,Read,Grep,Glob,mcp__supabase__execute_sql" >> /var/log/picc-media-tags.log 2>&1
```
