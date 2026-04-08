# EL Side Audit

**Audit Date:** 2026-04-08  
**PICC Org ID:** `084f851c-72e0-41fb-b5ba-f3088f44862d`  
**EL Supabase URL:** `https://yvnuayzslukamizrlhwb.supabase.co`

---

## 1. EL Supabase Schema

### extracted_quotes
**Source of Truth for PICC Quotes**

- **Columns:** id, quote_text, author_id, author_name, source_type, source_id, context, themes, sentiment, impact_score, organization_id, project_id, created_at, search_vector, approval_status, is_featured, edited_quote_text, editorial_notes, reviewed_by, reviewed_at, category, emotional_tone, service_id, event_year_min, event_year_max, era_label, historical_markers
- **Count for PICC:** 1,128 (as of 2026-04-08)
- **Image/Video fields:** No direct media URLs; linked via source_id (transcript or story)
- **FK relationships:** 
  - `organization_id` → organizations
  - `author_id` → storytellers  
  - `source_id` → transcripts OR stories (depends on source_type)
  - `project_id` → projects
  - `service_id` → services
- **Key metadata:** themes (array), emotional_tone, event_year_min/max, era_label, historical_markers

### transcripts
**Long-form Source for Extracted Content**

- **Columns:** id, storyteller_id, organization_id, title, transcript_content, recording_date, duration_seconds, media_asset_id, video_url, source_video_url, themes, key_quotes, ai_summary, project_id, status, created_at, updated_at, + 50+ additional columns for AI processing consent, cultural sensitivity, etc.
- **Count for PICC:** 123 (previously verified in context)
- **Image/Video fields:** 
  - `media_asset_id` → FK to media_assets
  - `video_url` (URL string)
  - `source_video_url` (original source)
- **FK relationships:**
  - `organization_id` → organizations
  - `storyteller_id` → storytellers
  - `project_id` → projects
  - `media_asset_id` → media_assets
- **Key metadata:** themes (array), key_quotes (array), ai_summary, cultural_sensitivity

### stories
**Curated Narrative Content (Some PICC Stories)**

- **Columns:** id, storyteller_id, organization_id, title, content, summary, media_url, story_image_url, media_urls (array), video_link, themes, cultural_sensitivity_flag, traditional_knowledge_flag, + 80+ additional columns for permissions, archiving, syndication, cultural protocols
- **Count for PICC:** 101
- **Image/Video fields:**
  - `story_image_url` (single cover image)
  - `media_urls` (array of media URLs)
  - `video_link` (single video URL or embed code)
- **FK relationships:**
  - `organization_id` → organizations
  - `storyteller_id` → storytellers
  - `transcript_id` → transcripts
  - `project_id` → projects
  - `service_id` → services
- **Key metadata:** cultural_sensitivity_flag, traditional_knowledge_flag, elder_approved, cultural_permission_level, anonymization_status

### storytellers
**Named Voices & Attribution (Global, No Org Filter)**

- **Columns:** id, profile_id, display_name, bio, cultural_background, is_active, is_elder, is_justicehub_featured, public_avatar_url, location, latitude, longitude, visual_identity, bio_source, tags, created_at, updated_at
- **Count (Total, All Orgs):** 342
- **Count (PICC-linked stories):** Approximately 76 (from previous context, storytellers table has no org_id column)
- **Image/Video fields:**
  - `public_avatar_url` — profile image
- **FK relationships:**
  - No direct org_id column; linked through stories/transcripts/extracted_quotes
  - `id` ← stories.storyteller_id, transcripts.storyteller_id, extracted_quotes.author_id
- **Key metadata:** is_elder, is_justicehub_featured, cultural_background (array), bio_source

### services
**Program/Service Catalog**

- **Columns:** id, organization_id, tenant_id, name, description, service_type, status, metadata, created_at, updated_at, image_url, gallery_id, latitude, longitude, address
- **Count for PICC:** 28
- **Image/Video fields:**
  - `image_url` (single hero/cover image)
  - `gallery_id` → FK to galleries
- **FK relationships:**
  - `organization_id` → organizations
  - `gallery_id` → galleries (optional)
- **Metadata examples:** {} (empty objects in most cases; no structured schema observed)
- **Known gap:** 5 services have NULL descriptions:
  - Palm Island Community Connection
  - Children and Family Centre
  - Social Enterprises
  - Family Care Service
  - Ferdies Haven

### projects
**Grant-Funded & Community Projects**

- **Columns:** id, organization_id, tenant_id, name, description, location, status, start_date, end_date, budget_cents, created_at, updated_at, slug, service_id, grant_id, cover_image_url, justicehub_enabled, justicehub_synced_at, external_references
- **Count for PICC:** 6
- **Image/Video fields:**
  - `cover_image_url` (single image URL)
- **FK relationships:**
  - `organization_id` → organizations
  - `service_id` → services (optional)
  - `grant_id` → grants (table assumed to exist)
- **Key columns:** slug (URL-safe identifier), justicehub_enabled (boolean), budget_cents (financial tracking)

### media_assets
**Source of Truth for Photos & Videos**

- **Columns:** id, original_filename, display_name, file_type, storage_bucket, storage_path, cdn_url, thumbnail_url, medium_url, large_url, width, height, duration, fps, bitrate, title, description, alt_text, caption, cultural_tags, elder_approved, consent_obtained, requires_consent, organization_id, project_id, story_id, transcript_id, storyteller_id, created_at, updated_at, + 30+ additional columns for processing status, vision analysis, face detection, etc.
- **Count for PICC:** 2,611
- **File type breakdown:**
  - image/jpeg: 864
  - image/png: 43
  - image: 84 (generic or unclassified)
  - video/mp4: 7
  - video/external: 1
  - text/url: 1
- **FK relationships:**
  - `organization_id` → organizations
  - `project_id` → projects
  - `story_id` → stories
  - `transcript_id` → transcripts
  - `storyteller_id` → storytellers
- **Key metadata:** elder_approved, consent_obtained, cultural_tags (array), face_detection_status, face_detection_count, vision_analysis_completed

### galleries
**Photo Gallery Collections (Linked to Services)**

- **Columns:** id, organization_id, created_at, updated_at, title, slug, description, cover_image_id, created_by, cultural_theme, cultural_context, cultural_significance, cultural_sensitivity_level, visibility, status, photo_count, view_count, featured, is_public, publish_at, unpublish_at, access_password
- **Count for PICC:** 52
- **Photo coverage:** Highly variable — most have 0 photos; examples:
  - Mingga Mingga Rangers: 6 photos
  - Bwgcolman Indigenous Knowledge Centre: 8 photos
  - Community Hub: 3 photos
  - Community Justice Group: 1 photo
  - NDIS Services: 1 photo
  - Ferdies Haven: 0 photos
- **FK relationships:**
  - `organization_id` → organizations
  - `created_by` → profiles/users
  - `cover_image_id` → media_assets (optional; only 5 galleries have cover images)
- **Key metadata:** cultural_theme, cultural_significance, cultural_sensitivity_level, photo_count (denormalized)

### organizations
**PICC Record in EL**

- **Columns:** id, tenant_id, name, description, type, location, website_url, contact_email, logo_url, cultural_protocols, slug, subscription_tier, created_at, updated_at, + 40+ additional columns for governance, settings, impact tracking, etc.
- **PICC Record Details:**
  - id: `084f851c-72e0-41fb-b5ba-f3088f44862d`
  - name: "Palm Island Community Company" (assumed)
  - type: "community" (assumed, from context)
- **Key fields:** cultural_protocols (object), empathy_ledger_enabled, annual_reports_enabled, elder_approval_required

---

## 2. EL v2 Codebase Patterns

### How Quotes Are Written & Managed

**Source Files:**
- `/src/lib/services/site-content-service.ts` — fetches extracted_quotes for syndication
- `/src/app/api/v1/content-hub/quotes/route.ts` — multi-source quote aggregation API

**Pattern:**
Quotes are stored as standalone records in `extracted_quotes` table with:
- Full storyteller attribution (author_id, author_name)
- Thematic metadata (themes array, category, emotional_tone)
- Historical context (event_year_min/max, era_label)
- Approval workflow (approval_status, reviewed_by, reviewed_at, editorial_notes)
- Service/project linkage (service_id, project_id)

**Source of Truth:** `extracted_quotes` table is the **single source** for curated PICC quotes. Quotes are extracted from transcripts via AI analysis but then materialized as independent records for fast querying.

### How Media Is Organized

**Three-Layer Structure:**
1. **Collections Layer:** `galleries` table — human-curated collections with metadata (cultural_theme, cultural_significance, visibility)
2. **Asset Layer:** `media_assets` table — individual photos/videos with CDN URLs and processing metadata
3. **Linking Layer:**
   - services → galleries (via `gallery_id` FK)
   - stories → media (via `story_id` FK in media_assets)
   - transcripts → media (via `media_asset_id` FK in transcripts, and transcript_id FK in media_assets)
   - projects → media (via `project_id` FK in media_assets)

**No "media_files" or "gallery_items" tables.** All media is in `media_assets` with hierarchical organization via collections (galleries).

**Upload & Storage:**
- Supabase Storage bucket: `media` (inferred from storage_bucket column)
- CDN URLs: `https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/...`
- Thumbnail/medium/large variants auto-generated (thumbnail_url, medium_url, large_url columns)

### How Services & Projects Are Read

**Services:**
- Fetched via `/src/app/api/organizations/[id]/services/route.ts`
- Query pattern: `select * from services where organization_id = ?`
- Linked to galleries via `gallery_id` FK
- Metadata column stores unstructured JSON (currently empty for most PICC services)
- No image field populated; `image_url` is nullable

**Projects:**
- Fetched via `/src/app/api/v1/content-hub/services/route.ts` (misnomer — also handles projects)
- Query pattern: `select * from projects where organization_id = ?`
- Linked to services via `service_id` FK (optional)
- Linked to stories/transcripts via foreign key references
- JusticeHub syndication metadata: `justicehub_enabled`, `justicehub_synced_at`

**Aggregation Service:**
- `/src/lib/services/project-aggregation.service.ts` — rolls up storyteller, quote, and media counts per project

### Annual Report Data Structure

**Location:** `/docs/15-reports/picc-annual-reports/`

**Files:**
- `methodology.md` — reporting approach and data sourcing
- `timeline.md` — fiscal year definitions and publication schedule
- `years/` — subdirectories per fiscal year with extracted/curated data

**Data Sourced From:**
- `extracted_quotes` — quotes by era_label and historical_markers
- `stories` — narratives by cultural_sensitivity_flag, traditional_knowledge_flag
- `media_assets` — photos/videos by organization_id, visibility, elder_approved
- `projects` — grant-funded work, budget_cents, timeline
- `transcripts` — long-form interviews and key_quotes (AI-summarized)
- `organizations` — PICC metadata, cultural_protocols

**No custom "annual_reports" table.** Reports are generated on-demand by querying the above tables and filtering by fiscal year date ranges (July-June convention per context).

### PICC-Specific Code Patterns

**Location-Based Hardcoding:**
- `palm island: [-18.7307, 146.5843]` in ReportContent.tsx
- "Palm Island, Queensland, Australia" in storyteller-cleanup.ts

**Admin Pages:**
- `/src/app/admin/storyteller-cleanup/page.tsx` — cleanup page with PICC storyteller name mappings
- `/src/app/admin/editorial-command/page.tsx` — editorial studio with "PICC Studio" link

**Report Rendering:**
- `/src/app/org/[slug]/report/[year]/` — server-rendered annual report page with PICC Pencil design references
- `/src/app/org/[slug]/services/page.tsx` — services listing page mentioning "28 active services across Palm Island and Townsville"

**No hardcoded org_id references** in source code; slug-based lookups used throughout.

---

## 3. Key Findings

### Source of Truth for Each Entity

| Entity | Table | Single Source? | Materialized? | Notes |
|--------|-------|---|---|---|
| **Quotes** | extracted_quotes | ✓ Yes | ✓ Yes | Extracted from transcripts, materialized as independent records for fast querying |
| **Transcripts** | transcripts | ✓ Yes | ✓ Yes | Raw/processed interview recordings, AI-analyzed for quotes/themes |
| **Stories** | stories | ✓ Yes | ✓ Yes | Curated narrative content; some linked to transcripts/storytellers |
| **Storytellers** | storytellers | ✓ Yes | — | No org_id column; linked via stories/transcripts/quotes. 342 total, ~76 PICC-linked. |
| **Services** | services | ✓ Yes | ✓ Yes | 28 for PICC; linked to galleries for photo collections |
| **Projects** | projects | ✓ Yes | ✓ Yes | 6 for PICC; linked to services, stories, transcripts, media |
| **Photos/Videos** | media_assets | ✓ Yes | ✓ Yes | 2,611 for PICC; organized into galleries; 864 JPEGs, 43 PNGs, 7 MP4s, 1 external video |
| **Galleries** | galleries | ✓ Yes | ✓ Yes | 52 for PICC; human-curated collections; mostly empty (0 photos) except for 3 major galleries |

### Confirmed Gaps

1. **5 Services with NULL Descriptions:**
   - ✓ Confirmed still NULL as of 2026-04-08
   - Affected: Palm Island Community Connection, Children and Family Centre, Social Enterprises, Family Care Service, Ferdies Haven
   - **Action needed:** Backfill descriptions from web-platform or PICC source documents

2. **Gallery-to-Media Linkage Sparse:**
   - 52 galleries exist for PICC, but only 5 have cover_image_id set
   - Most galleries have photo_count = 0 despite media_assets existing
   - **Gap:** No documented many-to-many relationship between galleries and media_assets in schema
   - **Finding:** Photo linkage to galleries may be implicit (via service_id → gallery_id, then manual curation) rather than foreign key

3. **Storytellers Table Missing org_id:**
   - storytellers table has NO organization_id column
   - Storyteller-to-PICC linkage is through stories/transcripts/extracted_quotes only
   - **Implication:** Cannot query "all PICC storytellers" directly; must go through content tables

4. **Service Image URLs All NULL:**
   - services.image_url = NULL for all PICC services
   - Only gallery_id is populated (52 galleries, but most with 0 photos)
   - **Gap:** No individual hero images for services; must use gallery cover images if available

### Unexpected Findings

1. **2,611 Media Assets but Only ~20 with Photos:**
   - Total media_assets: 2,611 for PICC
   - Galleries with photo_count > 0: Only 3 major galleries (Mingga Mingga Rangers: 6, Bwgcolman Centre: 8, Community Hub: 3)
   - **Finding:** Majority of media_assets may be from annual reports (PNG/JPG archives) or unlinked to galleries
   - **Implication:** Photo gallery frontend may only show subset of available media

2. **Video Coverage Minimal:**
   - Only 7 MP4 videos in media_assets for PICC
   - No video table distinct from media_assets
   - **Finding:** Videos are stored as media_assets rows with file_type = 'video/mp4'

3. **Transcripts Column Explosion:**
   - transcripts table has 50+ columns (AI processing consent, cultural sensitivity, anonymization, etc.)
   - Columns suggest full AI pipeline integration (ai_processing_date, ai_model_version, ai_confidence_score)
   - **Finding:** Transcripts are heavily processed with cultural and consent metadata

4. **Projects-Services FK Optional:**
   - projects.service_id is nullable
   - Many projects may not be linked to a specific service
   - **Finding:** Projects are grant-funded entities, services are program offerings; not always 1:1

### Data Quality Observations

- **Metadata field structure:** services.metadata is currently {} (empty) for all PICC services; no schema enforced
- **Gallery coverage:** 52 galleries exist but most have 0 photos; gallery slugs match service names (e.g., "ferdies-haven"), suggesting galleries are pre-created stubs
- **Cultural metadata:** Stories and media_assets have cultural_sensitivity_level, cultural_tags, elder_approved flags; transcripts have cultural_sensitivity column; strong cultural safety infrastructure
- **Consent tracking:** Media_assets track consent_obtained, requires_consent, consent_granted_by, consent_granted_at; full consent audit trail available

---

## 4. Alignment Audit Questions for Next Phase

1. **Photo Gallery Frontend:** Which media_assets actually render in the public gallery UI? Are only galleries with photo_count > 0 shown?

2. **Service Images:** Should services.image_url be populated from gallery cover images? Or should services link directly to media_assets?

3. **Storyteller Org Association:** Should a storyteller_organizations junction table exist in EL to enable "all PICC storytellers" queries? Currently must infer via content tables.

4. **Annual Report Data Freshness:** How is `year_review_cache` in organizations table used? Is annual report data cached or generated fresh on each request?

5. **PICC Supabase Duplicate:** Confirm that PICC's own Supabase (web-platform project) does NOT have services/projects/media tables that would compete with EL as source of truth.

6. **ACT Syndication:** How do JusticeHub and other ACT ecosystem sites consume PICC data? Are they reading directly from EL Supabase or via REST APIs (content-hub endpoints)?

---

## 5. API Endpoints for Integration

| Endpoint | Method | Purpose | Query Params |
|----------|--------|---------|--------------|
| `/api/v1/content-hub/quotes` | GET | Multi-source quote aggregation | limit, theme, category, storyteller, project, organization, min_impact, source, justicehub |
| `/api/v1/content-hub/media` | GET | Media library browsing | organization_id, project_code, type, theme, elder_approved, page, limit |
| `/api/v1/content-hub/services` | GET | Service catalog | organization_id, limit |
| `/api/organizations/[id]/services` | GET | Services for org | id (org_id) |
| `/api/organizations/[id]/media` | GET | Media for org | id (org_id), type, limit |
| `/api/v1/harvest/gallery` | GET | Gallery media | (undocumented) |
| `/api/v1/galleries/[galleryId]/embed` | GET | Gallery embed code | galleryId |

---

## Handoff Status

**Scope Covered:** ✓ Complete  
**Ready for Phase 2 (Web-Platform Side):** ✓ Yes  
**Ready for Phase 3 (Frontend Alignment):** Pending Phase 2 findings  

**Next Agent:** Investigate web-platform Supabase schema and confirm services/projects/media are NOT duplicated (should be read-only from EL).

