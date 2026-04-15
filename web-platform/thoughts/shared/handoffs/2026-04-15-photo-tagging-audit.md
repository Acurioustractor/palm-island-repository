# Photo Tagging Audit — EL v2 (Task 1)

**Date:** 2026-04-15
**Scope:** EL v2 `media_assets` filtered to PICC org

## Source of truth confirmed

- EL v2: `yvnuayzslukamizrlhwb.supabase.co` (separate from PICC `uaxhjzqrdotoahjnxmbj`)
- PICC org in EL v2: `organizations.id = 084f851c-72e0-41fb-b5ba-f3088f44862d` (name "Palm Island Community Company")
- Table: `media_assets` (NOT `media_files` — note for PICC web consumers)
- No `project_code='PICC'` exists on media_assets. The only project_code seen is `justicehub` (168 rows). Use `organization_id` to scope.

## PICC-scoped totals

| Metric | Count |
|---|---|
| Total PICC media_assets | **2,611** (handoff estimate 3,040 was high) |
| Rich-tagged (cultural_tags beyond `fy:*`) | 2,472 (94.7%) |
| Fiscal-year-only tags (`fy:2010-11` etc.) | 139 (5.3%) |
| Empty cultural_tags | 0 |
| Placeholder alt_text ("Image from PICC Annual Report …") | 167 (6.4%) |

A prior vision pass clearly ran — `cultural_tags`, `alt_text`, `description` are populated on most rows. The 139 fy-only + 167 placeholder rows are the re-tag targets. Likely overlap; assume **~167 images** need a fresh MiniMax vision pass, not 3,040.

## Consent / cultural safety — CRITICAL GAP

All 2,611 PICC rows:

| Field | Value | Count |
|---|---|---|
| `visibility` | `public` | 2,611 |
| `cultural_sensitivity_level` | `standard` | 2,611 |
| `elder_approved` | `false` | 2,611 |
| `consent_granted` | `false` | 2,611 |
| `consent_obtained` | `false` | 2,611 |
| `requires_consent` | `false` | 2,611 |
| `consent_granted_by` | null | 2,611 |
| `cultural_sensitivity_level=restricted` | — | 0 |
| `cultural_sensitivity_level=sensitive` | — | 0 |

**Interpretation:** `visibility=public` is a default flag set at ingest — it does NOT mean consent was obtained. Zero photos have been through a consent review. Shipping ANY of these to a public annual report PDF without a consent pass violates the cultural-safety rule in `PICC-BRAND-STYLE-GUIDE.md` §6 and `CLAUDE.md` "Real Data Only".

## Face detection

| Field | Count |
|---|---|
| `vision_analysis_completed=true` | 0 |
| `face_detection_status=completed` | 0 |
| `face_detection_count > 0` | 0 |
| `detected_people_ids not null` | 0 |
| `batch_tagged_at not null` | 0 |

Face detection + storyteller linking has never run.

## Schema surface relevant to Task 2–6

`media_assets` consent/tag columns:
- `cultural_sensitivity_level` (enum: standard/sensitive/restricted)
- `privacy_level`, `visibility`
- `requires_consent`, `consent_granted`, `consent_granted_by`, `consent_granted_at`, `consent_obtained`, `requires_consent_from`
- `elder_approved`
- `cultural_tags` (text[]), `ai_tag_suggestions` (jsonb), `description`, `alt_text`, `caption`
- `vision_analysis_completed`, `batch_tagged_at`, `batch_tagged_by`
- `face_detection_status`, `face_detection_count`, `detected_people_ids` (uuid[]), `storyteller_id`

## Recommended sequence (revised)

1. **Task 2 (MiniMax pass) scope reduction** — re-tag only the ~167 placeholder/fy-only images, not 3,040. Huge cost saving. Keep the 2,472 existing rich tags.
2. **Task 2.5 (new)** — consent-screening pass for any photo destined for the annual report. Options:
   - (a) Manual Elder review queue UI in EL v2 admin
   - (b) Opt-in curated shortlist (~30–60 images) reviewed once, marked `elder_approved=true` + `consent_obtained=true` with attribution
   - Recommend (b) first to unblock the report, then (a) for the long tail.
3. **Task 3 (avatars)** — board + storyteller avatars live on `storytellers` / `profiles` tables, not media_assets. Verify before populating.
4. **Task 4 (/api/photos)** — endpoint must filter on `elder_approved=true AND consent_obtained=true` as the default, with an override flag for internal use only.
5. **Task 6 (TaggedPhoto)** — must render a neutral placeholder when consent not obtained, not the image.

## Scripts left behind

In `empathy-ledger-v2/scripts/`:
- `_picc_audit_media.mjs` — candidate table discovery
- `_picc_audit_media_v2.mjs` — scoped aggregates
- `_picc_sample.mjs` — row-level sample
- `_picc_tag_quality.mjs` — rich vs fy-only vs empty tag classification

All read-only. Leaving underscored so they're easy to ignore or prune later.
