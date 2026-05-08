# Migration to single source of truth — Empathy Ledger v2

*PICC's web platform currently reads from BOTH EL v2 (canonical) AND PICC Supabase tables (legacy parallel data). This plan moves everything to EL v2. No more dual sources, no more drift.*

## Current state — audit-confirmed

| Domain | Where it lives now | EL-canonical? |
|---|---|---|
| Storytellers (13) + photos | EL v2 `storytellers` + voices-pool | ✓ Already EL |
| Services (26 active) | EL v2 `/api/picc/services` | ✓ Already EL |
| Service photos + galleries | EL v2 `service_galleries` | ✓ Already EL |
| Voices (extracted) | EL v2 `extracted_quotes` | ✓ Already EL |
| **Projects (9 public)** | **PICC Supabase `projects` table** | ⚠ Duplicated — EL has its own seed |
| **Project hero photos** | **PICC `projects.hero_image_url`** | ⚠ EL v2 has the photos already |
| **Elder profiles (8)** | **PICC `profiles.is_elder=true`** | ⚠ Duplicated — EL has `storytellers.is_elder` |
| **Elder bios + portraits** | **PICC `profile_image_url` / `bio`** | ⚠ EL has equivalents |
| **Elder curated quotes (162)** | **PICC `elder_quotes` table** | ⚠ Some overlap with EL extracted_quotes |
| **Elder trips (5 stops)** | **PICC `elder_trip_stops` table** | ⚠ No EL equivalent yet |

## Discovered: EL v2 already has what we need

- **`storytellers`** (EL v2) — has `is_elder` flag, `is_featured`, `bio`, `public_avatar_url`, `cultural_background`, `location`. Same shape as PICC profile.
- **`projects`** (EL v2) — already seeded with PICC's 9 active projects via migration `20260429140000_picc_projects_canonical_seed.sql`. PICC Supabase is keeping its own copy in parallel.
- **`/api/picc/services`** (EL v2) — exists.
- **`/api/picc/storytellers/[id]/photos`** (EL v2) — exists.
- **`/api/picc/voices-pool`** (EL v2) — exists.
- **NO `/api/picc/projects` endpoint** — gap.
- **NO `/api/picc/elders` endpoint** — gap.
- **NO trip data in EL v2** — needs new modelling.

## Target state

```
PICC web platform
   │
   └─→ EL v2 API (CANONICAL — consent enforced server-side)
         ├── /api/picc/services            ✓ existing
         ├── /api/picc/storytellers        (extends existing, filter is_elder for elders)
         ├── /api/picc/projects            NEW
         ├── /api/picc/elders              NEW (or covered by storytellers?is_elder=true)
         ├── /api/picc/elders/trips        NEW (after data move)
         ├── /api/picc/voices-pool         ✓ existing
         └── /api/photos                   ✓ existing

PICC Supabase
   │
   └── used ONLY for:
         - operational data: chat sessions, signing canvas (community_visions),
           page content overrides, real-time pulse
         - PII at rest where governance keeps it on-island
         - Things that are not narrative (risks, governance decisions, finances)
```

## Phases — what ships when

Each phase is independently mergeable. No phase is blocking on the next.

### Phase 0 · Read-only audit (done)

- [x] `scripts/audit-coverage.mjs` produces the truth report on demand
- [x] This plan documents the migration

### Phase 1 · Projects → EL v2 (1 session)

**Code in EL v2 repo:**
1. Add `src/app/api/picc/projects/route.ts` — returns PICC projects with hero, photos via the project-`<slug>` slot, status, theme. Authenticated via `x-picc-api-key` (same pattern as services).
2. Verify the canonical seed migration ran in EL v2 production. If the 9 projects are already there, no data move needed.

**Code in PICC web-platform:**
1. Add `lib/empathy-ledger/el-projects.ts` — typed client with `getPiccProjects(opts)` and `getPiccProject(slug)`. Falls back to nothing — if EL is down, no projects render (vs. dual source).
2. Update `app/(public)/projects/page.tsx` and `app/(public)/projects/[slug]/page.tsx` to consume `getPiccProjects()`.
3. Update `app/(public)/innovation/page.tsx` — already reads from PICC `projects` table; switch to EL.
4. Update `lib/services/innovation-tier.ts` if it touches PICC projects.

**Deprecate (don't drop yet):**
- PICC Supabase `projects` table — leave in place for now, mark deprecated in a comment. Drop in Phase 5.

**Acceptance:**
- `/projects`, `/projects/[slug]`, `/innovation` all render from EL v2.
- `npm run check-el` shows projects endpoint returning ≥9.
- Audit script reports projects coverage from EL, not PICC Supabase.

### Phase 2 · Elder profiles → EL v2 storytellers (1 session)

**Migration data move:**
1. Confirm the 8 elders already exist in EL v2 `storytellers` with `is_elder=true`. If yes, no move. If no, run a one-time SQL to insert from PICC `profiles` → EL `storytellers` (id mapping, consent flags carried).
2. Verify `bio` and `public_avatar_url` are populated for all 8 elders in EL.

**Code in EL v2:**
1. Extend `/api/picc/storytellers` (or add `/api/picc/elders`) to filter by `is_elder=true` and return enriched payload (bio, avatar, role, location, themes-they-speak-to).

**Code in PICC web-platform:**
1. Add `lib/empathy-ledger/el-elders.ts` with `getPiccElders()` returning the typed shape.
2. Rewrite `app/(public)/elders/page.tsx` to consume EL only. Remove PICC `profiles.is_elder=true` query.
3. Rewrite `app/(public)/elders/[slug]/page.tsx` to consume EL only.
4. Rewrite `app/(public)/elders/leadership/page.tsx`.

**Deprecate:**
- PICC `profiles.is_elder` flag becomes informational only (not the source).

### Phase 3 · Elder curated quotes → EL v2 (1 session)

**Migration data move:**
1. Inspect PICC `elder_quotes` (162 rows). Diff against EL `extracted_quotes` for the same storytellers. Identify rows that are PICC-only and need to move.
2. Insert PICC-only rows into EL `extracted_quotes` (or a `curated_quotes` view) with `source='picc-curated-pre-2026'`, `is_validated=true`, `permission_level` mapped.

**Code in PICC web-platform:**
1. Update every consumer of `elder_quotes` (find via grep) to use `getELQuotes()` / `findQuotesForPerson()`.
2. Drop the dual-fetch pattern in `/elders/page.tsx`.

**Deprecate:**
- PICC `elder_quotes` table — leave for one cycle, drop in Phase 5.

### Phase 4 · Elder trips → EL v2 (1–2 sessions, depends on EL schema)

**Decision needed:**
Trips are events with stops. EL v2 doesn't have a `trips` or `events` table. Three options:

(a) **Model as projects.** Each trip = a project with `project_type='trip'`. Stops as project-children or rows in `project_features`. Reuses existing infrastructure.

(b) **New `events` table in EL.** Cleaner conceptual model. More work, more coordination with the EL team.

(c) **Keep in PICC for now.** Trips are operational, not narrative. Document as a known gap, revisit after Phase 5.

**Recommendation:** (a) — model as projects with `project_type='trip'`. Reuses photo + media linkage we already have.

**If (a):**
1. Add `trip` as a valid `project_type` value in EL.
2. Migrate `elder_trip_stops` rows → EL `projects` + `project_features` (or a similar nested rows table).
3. Build `/elders/trips`, `/elders/trips/atherton-tablelands-2025`, `/elders/trips/2024` pages consuming EL.

### Phase 5 · Drop the legacy PICC tables (after 2 weeks of stable Phase 1–4)

When the new pipeline has been live for two weeks with no issues:

1. Drop or rename PICC Supabase `projects` table → `_legacy_projects_archive`.
2. Drop `elder_quotes` (or rename).
3. Remove `is_elder` writes from PICC `profiles` (the column stays for historical reasons but stops being authoritative).
4. Drop `elder_trip_stops` if Phase 4 chose (a) or (b).

## What stays in PICC Supabase forever

Operational + governance data that is NOT narrative. Don't migrate these:

- `community_visions` — signing-canvas submissions live here, then sync to EL after Elder approval.
- `chat_sessions`, `chat_feedback`, `chat_analytics` — operational telemetry.
- `annual_financials` — finance data is governance-tier, stays on PICC.
- `governance_achievements`, `board_members` — governance-tier.
- `featured_themes` — editorial curation, PICC-side.
- `media_files` — local media that's been uploaded but not yet pushed to EL canonical (staging area).
- Any chat / conversation tables.

## Risks + reversibility

| Risk | Mitigation |
|---|---|
| EL v2 outage takes down `/projects` and `/elders` | Add a degraded-mode banner; keep PICC Supabase as a read-only standby until Phase 5 |
| Schema drift between EL `storytellers.is_elder` and PICC `profiles.is_elder` | Phase 2 step 1 syncs them; afterwards EL is sole source |
| Curated elder_quotes lost in migration | Phase 3 step 1 includes a diff before insert; export the table to JSON before any drop |
| Trip data shape differs in EL projects model | Phase 4 starts with a write into EL, validates the read, then deletes from PICC. Rollback = restore from snapshot |
| EL intake key rotated again | Already have `npm run check-el` to detect; happens before any user-facing failure |

## Open questions for you to decide before we start

1. **Phase 1 vs. all-at-once?** Recommend phased — projects first (cleanest), then elders. Each is one merge, walked on preview.
2. **Do trips become EL projects (option a) or get their own table (option b)?** My read: (a). Less work, photos already flow through EL by tag.
3. **Curated quotes — keep the PICC `elder_quotes` table as a "curated" overlay forever, or fold into EL `extracted_quotes` with a `source` flag?** Recommend fold-in. Single archive.
4. **Are you comfortable dropping `projects` from PICC Supabase after 2 weeks of stable Phase 1?** Or do we keep the parallel writes longer for safety?
5. **Who edits EL v2 admin?** The `/api/picc/projects` GET is read-only. To EDIT projects (status changes, new ones), Narelle needs access to EL admin. Confirm she has the credentials.

## How we work this

Per the rule we agreed: **no more drive-by deploys.** Each phase is:

1. Code in worktree
2. Audit script confirms the new endpoint returns expected counts
3. Walk the affected URLs locally on `localhost:3006`
4. Open a single PR per phase
5. Merge when you're satisfied — Vercel deploys

If you greenlight this plan, I start Phase 1 (Projects → EL v2). One PR, one walk, one merge. No spillover into Phase 2 until Phase 1 is verified live.

— end —
