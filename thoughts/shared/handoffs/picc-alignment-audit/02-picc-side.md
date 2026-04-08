# PICC Side Audit

**Audit Date:** 2026-04-08  
**Scope:** PICC Supabase schema + web-platform data source mapping  
**Status:** Completed via schema probe + codebase analysis

---

## 1. PICC Supabase Schema (What Exists)

### Tables Found (16 total)

| Table | Count | Key Columns | Status |
|-------|-------|------------|--------|
| **projects** | 8 | id, name, slug, status, hero_image_url, project_type, impact_areas, funding_sources | Active |
| **stories** | 92 | id, storyteller_id, title, content, status, report_worthy, featured_image_url, category, quote_text, quote_attribution | Active |
| **extracted_quotes** | 290 | id, story_id, quote_text, attribution, theme, is_validated, photo_url, impact_area | Active |
| **elder_quotes** | 162 | id, text, speaker_name, speaker_role, is_validated, permission_level, cultural_sensitivity | Active |
| **community_visions** | 6 | id, vision_text, author_name, category, is_approved | Active |
| **media_files** | 3063 | id, file_path, public_url, story_id, project_id, tags, page_context, page_section, is_featured, caption | Active |
| **page_media** | 1799 | Same schema as media_files, used for annual report pages | Active |
| **annual_reports** | 3 | id, organization_id, report_year, title, status, executive_summary, fiscal_year, html_url, auditor_name, revenue_by_funder | Active |
| **organization_services** | 31 | id, organization_id, name, slug, service_category, is_active, staff_count, clients_served_annual | Active |
| **report_statistics** | 40 | id, report_id, category, stat_label, stat_value, is_key_metric, display_order | Active |
| **report_sections** | 56 | id, report_id, section_type, section_title, section_content, display_order, featured_quote | Active |
| **board_members** | 20 | id, organization_id, name, role, photo_url, display_order | Active |
| **leadership** | 8 | id, organization_id, leadership_type, full_name, position, message_title, message_content, featured_quote | Active |
| **report_highlights** | 20 | id, report_id, highlight_type, title, metrics, is_featured, display_order, featured_image_url | Active |
| **organization_history** | 4 | id, era_name, year_start, year_end, description, milestones | Active |
| **organizations** | 3 | id, name, slug, description, website, is_active, abn, empathy_ledger_enabled | Active (3 orgs) |

### Tables NOT Found (Confirmed Missing)

- **services** — Does NOT exist. Confirmed earlier session was correct.
- **media_assets** — Does not exist. `media_files` is the canonical media table.
- **galleries** — Does not exist. Photos managed via `media_files` with tags.
- **videos** — Does not exist. No dedicated video table; stored in `media_files` (mime_type = video/*).

---

## 2. Web-Platform Data Source Map

### Annual Report Pipeline

**Entry Points:**
- `lib/annual-report/fetch-report-data.ts` — Main fetcher, queries PICC Supabase
- Fallback to `lib/annual-report/data-2024.ts` — Hardcoded 2023-24 data (JSON objects)

**Data Flow:**

```
fetch-report-data.ts (PICC DB primary source)
├─ annual_reports: fetch by report_year
├─ report_statistics: all rows for report
├─ report_sections: grouped by report_id
├─ board_members: 20 rows total
├─ leadership: CEO + Chair messages
├─ report_highlights: display_order sorted
├─ organization_services: 31 active services
├─ media_files: photos tagged 'annual-report' or 'annual-report-cover'
├─ stories: where report_worthy=true & status='published'
├─ elder_quotes: where is_validated=true & permission_level='public'
├─ community_visions: where is_approved=true
├─ organization_history: 4 eras
└─ financials: from `lib/financials/get-financials.ts` (separate module, sources unknown)
```

**Hardcoded Data (data-2024.ts):**
- REPORT metadata
- STATISTICS array (20 records with 2023-24 fiscal year data)
- BOARD_MEMBERS (7 people, photo URLs to Supabase Storage)
- LEADERSHIP_MESSAGES (CEO + Chair)
- HIGHLIGHTS (report highlights)
- SERVICES (service list)
- COMMUNITY_VOICES (mixed sources)
- COMPLIANCE_DATA (auditor name, audit opinion, agm_date, etc.)
- HISTORY_ERAS (4 historical periods)
- RESILIENCE_STORIES (custom story object)

**Data-2024 is only used as fallback** when Supabase is unavailable or empty. Prod uses `getReportData()` which fetches from DB first.

### Curated Voices / Elder Page Content

**Source:** `lib/quotes/get-curated-quotes.ts`

Queries PICC Supabase directly:
- **extracted_quotes** — Filters: `is_validated=true`, sorts by presence of `photo_url`
- **elder_quotes** — Filters: `is_validated=true & permission_level='public'`
- **community_visions** — Filters: `is_approved=true`

Used by:
- `/api/annual-report-data/curated-voices` — Returns mix of stories, elder quotes, visions
- `/api/public/curated-quotes` — Public-facing curated voices endpoint
- `/elders` page component — Displays elder quotes with profiles

**No EL integration for quotes** — All quote data comes from PICC Supabase tables.

### Media / Photos / Videos

**Storage locations:**
1. **Supabase Storage** (`story-media` bucket) — Primary location for all media
   - Resolves via `lib/media/asset-url.ts` → `assetUrl(path)`
   - Path format: `story-media/{year}/{id}.{ext}`

2. **media_files table** (3063 rows)
   - Columns: `public_url` (Supabase Storage URL), `file_type`, `page_context`, `page_section`, `tags`, `is_featured`
   - Used for: story images, project images, annual report photos
   - Query example: `media_files where tags @> ['annual-report']`

3. **page_media table** (1799 rows)
   - Same schema as `media_files`
   - Purpose: annual report page-specific photo assignments
   - Queried by `getSupabaseOverrides()` in `lib/annual-report/page-photos.ts`

4. **Static assets** (`/public/` directory)
   - Annual report fallback images in `/report-assets/`
   - Manifest file (`photo-manifest.json`) with keyword-searchable photos

5. **No videos table** — Video files stored in `media_files` with `file_type='video'`

**Annual Report Photo Assignment Flow:**

```
page-photos.ts:getPagePhotos()
├─ Check Supabase overrides (page_media with page_context='annual-report')
├─ Fall back to DEFAULT_ASSIGNMENTS (hardcoded curated photos)
├─ Try manifest keyword search (for pages without assignment)
└─ Final fallback: AI-generated placeholder image
```

**Result:** PagePhotoMap with hero URL + caption for each report page (cover, acknowledgement, messages, etc.)

### Services Display

**Source:** `organization_services` table (31 rows, actively maintained)

Queried by:
- `lib/explore/tools/services.ts` — Service info tool
- `/api/public/explore-services` — Public service listing
- `/api/services/[id]/route.ts` — Service detail
- `/services` page — Lists all active services
- `/api/unified/service/[slug]/route.ts` — Unified service endpoint

**No "services" table.** PICC never had one; `organization_services` is the canonical source.

### Projects Display

**Source:** `projects` table (8 rows)

Queried by:
- `/api/projects/list` — Lists projects with search
- `/picc/projects/[slug]/page.tsx` — Project detail page
- Annual report innovation section — Featured projects

**Projects in PICC DB:**
1. Elders Group Activations
2. Palm Island Photo Studio
3. Annual Report System
4. On-Country Server
5. Goods (social enterprise)
6. The Centre
7. Movember Connection to Country
8. Healthy Meals Program

**Conflict:** EL has 6 different projects (tracked separately in agent 1 audit).

### Financial Data

**Source:** `lib/financials/get-financials.ts` (separate module)

- Queries unknown source (likely a financials table or external API)
- Returns: `FinancialRecord` with `total_income`, `total_expenditure`, `net_result`, `expense_breakdown`
- Used in annual report to display financial summaries

**Hardcoded fallback:** `data-2024.ts` has no financials; uses `financials: null` in static data.

---

## 3. Known Misalignments

### Misalignment #1: PICC Projects (8) vs EL Projects (6)
- **PICC DB:** 8 projects (Elders Group Activations, Photo Studio, Annual Report System, etc.)
- **EL DB:** 6 different projects (tracked separately; see agent 1 audit)
- **Canonical Source:** Unclear; both are maintained separately
- **Impact:** Reports may cherry-pick from PICC, but EL has sovereign project records
- **Decision Needed:** Which source is source of truth for annual report?

### Misalignment #2: Services Tables
- **PICC:** Uses `organization_services` (31 active services)
- **EL:** Unknown (agent 1 will audit)
- **Code:** Web-platform queries only `organization_services` from PICC
- **Impact:** No service deduplication/sync logic visible

### Misalignment #3: Quote Attribution
- **extracted_quotes:** Has `attribution` field (text) + `profile_id` (FK to profiles)
- **elder_quotes:** Has `speaker_name` (text) + `speaker_role` (text)
- **Different schemas** → inconsistent quote rendering if mixing sources

### Misalignment #4: Media URL Fields
- **media_files:** Stores `public_url` (direct Supabase Storage URL)
- **Page context:** Uses `page_context` + `page_section` for annual report assignment
- **No link to stories:** Media is tagged but not strictly FK-linked to stories

### Misalignment #5: 2024-25 Data Location
- **2023-24 data:** Fully in `annual_reports` table + related tables
- **2024-25 data:** Likely in same tables, but `data-2024.ts` hardcodes 2023-24
- **Decision:** If 2024-25 needs different display, must create new report record or switch to new data source

---

## 4. Where 24/25 Data Would Need to Land

### Option A: Reuse Existing Tables (Recommended)
- Create new row in `annual_reports` with `fiscal_year='2024-25'`, `report_year=2025`
- Populate `report_statistics`, `report_sections`, `report_highlights` with links to new report
- Update `media_files` tags to include `2024-25` or use `fiscal_year` field
- `data-2024.ts` becomes a template; `fetch-report-data.ts` auto-fetches 2024-25
- **Pros:** Reuses proven schema, single source of truth
- **Cons:** Requires backfill of 2024-25 data into all related tables

### Option B: Create New Schema for 2024-25
- New tables: `annual_reports_2024_25`, `report_statistics_2024_25`, etc.
- Keeps historical data separate
- `fetch-report-data.ts` checks year and routes to correct table
- **Pros:** No risk of mixing fiscal years
- **Cons:** Code duplication, maintenance burden, schema explosion

### Option C: Hybrid (Suggested Safe Approach)
1. Keep existing schema as-is for 2023-24 (frozen for archives)
2. Create single new `annual_reports` row for 2024-25
3. Use `data-2024.ts` as template; copy to `data-2024-25.ts` (fallback only)
4. Gradually backfill 2024-25 data into shared tables as it becomes available
5. `fetch-report-data.ts` intelligently falls back to static data if DB row is empty

---

## 5. Questions for Main Thread

1. **Projects Source of Truth:** Is PICC's `projects` table (8) the canonical source, or should we sync from EL (6)?

2. **Services Alignment:** Do PICC's 31 `organization_services` exist in EL? Should we deduplicate?

3. **2024-25 Rollout Plan:** Which option (A/B/C above) for 2024-25 data? Should `data-2024.ts` be renamed/versioned?

4. **Financial Data Module:** Where does `lib/financials/get-financials.ts` get its data? Is it a DB table, external API, or hardcoded?

5. **EL Quote Integration:** When should web-platform switch from PICC quotes to EL quotes? Currently using only PICC.

6. **Media Deduplication:** Are photos in PICC's `media_files` (3063) duplicated in EL media storage? How to handle?

7. **Organizations Table:** PICC has 3 orgs in its DB. Should PICC sync org metadata with EL, or maintain separately?

---

## Summary

**PICC Supabase is well-structured** with dedicated tables for annual reports, services, projects, stories, quotes, and media. The web-platform primarily sources from PICC DB for all 5 entities (quotes, photos, videos, services, projects). **No dedicated EL integration** for these entities yet—EL is mentioned in code but not actively queried for the audit scope.

**Biggest alignment gap:** 8 PICC projects vs 6 EL projects + quote attribution schema inconsistency + media duplication risk.

**Next step:** Agent 2 (this audit) identifies what PICC owns. Agent 1 identifies what EL owns. Agent 3 will identify frontend dependencies on both.
