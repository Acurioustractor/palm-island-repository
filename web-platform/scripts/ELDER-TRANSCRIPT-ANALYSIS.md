# Elder Transcript Analysis (Profiles, Quotes, Trip Story Drafts)

This repo already has the analysis pipeline wired up (Next.js API routes + Supabase tables). The flow is:

1. **Elder has a `profiles` row** (`profiles.is_elder = true`)
2. **Their transcripts live in `interviews`** (`interviews.raw_transcript` or `interviews.edited_transcript`)
3. **Run analysis** → writes grounded quotes + optional segment/citation provenance
4. **Generate a “trip report” draft** in the Project Story Builder using Elders’ interviews/quotes

---

## 0) Supabase schema pieces (what must exist)

Minimum tables used by the pipeline:
- `profiles`
- `interviews`
- `extracted_quotes`

Optional (but recommended) tables for citation/provenance + saved review snapshots:
- `interview_segments`
- `extracted_quote_citations`
- `interview_review_artifacts`

Those optional tables are created by `web-platform/supabase/migrations/20251218100000_interview_deep_review.sql`.

---

## 1) Get Elder transcripts into `interviews`

Use the admin UI:
- Go to ` /picc/storytellers`
- Open an Elder
- Go to `Interviews` (`/picc/storytellers/:id/interviews`)
- Click **Add Interview** and paste the transcript into **Raw Transcript**

Important flags (used to protect culturally sensitive content):
- If `interviews.can_be_quoted = false` → analysis is blocked/skipped
- If `interviews.requires_elder_approval = true` and `approved_at` is missing → blocked/skipped
- If `interviews.privacy_level = 'restricted'` → blocked/skipped

---

## 2) Run the transcript analysis (summary + quote library)

### Option A — In the UI (single interview)
On the storyteller page (`/picc/storytellers/:id`) use **Analyze** on an interview. It calls:
- `POST /api/interviews/analyze`

### Option B — Call the API directly
Example payload:
```json
{ "interview_id": "uuid-here" }
```

### Option C — Batch analyze all Elders
This runs through all `profiles.is_elder = true` and analyzes each interview that has a transcript:
```bash
cd web-platform
node scripts/analyze-elder-interviews.js
node scripts/analyze-elder-interviews.js --force
node scripts/analyze-elder-interviews.js --limit 3
```

Required env vars (in `web-platform/.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

Output report JSON is written to `web-platform/scripts/reports/`.

---

## 3) What gets written (where to look in Supabase)

### Quotes
`extracted_quotes` rows are inserted (per interview), including:
- `profile_id` (the Elder)
- `interview_id` (preferred) and also `metadata.interview_id` (legacy/back-compat)
- `quote_text`, `context`, `theme`, `sentiment`, `impact_area`
- `suggested_for_report`, `is_validated` (defaults false)

### Grounded citations (optional, if deep review tables exist)
- `interview_segments`: cleaned/chunked transcript segments with a `segment_index`
- `extracted_quote_citations`: links each inserted quote to one or more segments (by index + excerpt)
- `interview_review_artifacts`: a `quote_library` snapshot containing summary, themes, recommendations, and the extracted quotes

### Interview summary + themes
The analyzed `interviews` row is updated with:
- `key_themes`
- `interview_notes` (short summary)
- `metadata.ai_analysis` (machine-readable summary + counts)

---

## 4) Generate a “Trip Report” / immersive story draft from Elders’ interviews

In the Project Story Builder:
- Go to `/picc/projects/:slug/story-builder`
- Click **Generate**
- Choose **Generate from Elders’ transcripts/quotes**

This calls:
- `POST /api/story-builder/generate-from-interviews`

It composes a draft using:
- The project description + updates timeline
- Project-tagged images (prefers images with selected Elders tagged)
- Best quotes from `extracted_quotes` (falls back to sentence extraction from interview transcripts if quotes don’t exist yet)

---

## 5) Quick sanity checks

- An interview has text in `raw_transcript` or `edited_transcript`
- Analysis creates new rows in `extracted_quotes`
- If `web-platform/supabase/migrations/20251218100000_interview_deep_review.sql` is applied, citations appear in `extracted_quote_citations`
- Story Builder “Generate from Elders” produces quote sections with Elder names/photos

