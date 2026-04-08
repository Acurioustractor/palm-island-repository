# Frontend / Annual Report Audit

**Status**: Complete read-only investigation. Data flow mapped. Critical gaps identified.
**Scope**: PICC public-facing pages + annual report 2.0 infrastructure 
**Date**: 8 April 2026

---

## 1. Public Pages Data Source Map

### Homepage (`/`)
- **Data shown**: 6 featured services, 4 innovation projects, 8 gallery photos, 6 community voices, key stats
- **Services source**: PICC Supabase `organization_services` (active only, filtered to exclude innovation slugs) + `service_metrics` 
- **Photos**: PICC Supabase `media_files` tagged `service:{slug}` and `hero`, with fallback to featured images
- **Staff/metrics**: PICC `service_metrics` (latest fiscal year per service)
- **Innovation projects**: PICC Supabase `projects` table (innovation type, active/in_progress only) 
- **Community voices**: **EL Supabase** via `getELQuotes()` + `groupQuotesByAuthor()`, filtered by impact score >= 70, deduplicated
- **Status**: Working. Voices are live from EL. Photos feed from PICC media tags. **Gap**: 6 featured services only shown; if a service has no hero photo + low photo count, it's invisible on homepage.

### Services (`/services`)
- **Data shown**: All active services with cover photos, service category, staff count, clients served, photo/video badges, matching EL quote per service
- **Services source**: PICC `organization_services` (all active)
- **Metrics**: PICC `service_metrics` (latest fiscal year)
- **Photos/videos**: PICC `media_files` tagged `service:{slug}`, separated by file_type
- **Quotes**: **EL Supabase** with keyword matching (pre-defined map for 28 services, e.g., 'safe-house' → ['safe house', 'children', 'safe', 'kids', 'home'])
- **Status**: Operational. Shows all 28 services. **Gap**: 5 services with null descriptions show as "Supporting the Palm Island community." (fallback). Keyword matching is fragile; if an EL quote doesn't contain a service keyword, no quote displays.

### Elders (`/elders`)
- **Data shown**: All elders (name, bio, featured quote, up to 6 quotes per elder, stories, interviews), trip photos (200 max), trip video, trip stops, theme insights
- **Elders source**: PICC Supabase `profiles` (is_elder=true, show_in_directory=true) 
- **Quotes**: Dual source:
  - Local PICC `extracted_quotes` (validated + suggested_for_report)
  - **EL Supabase** via `getELQuotes()` + name matching, merged & deduped
- **Stories**: PICC `stories` (storyteller_id matches)
- **Interviews**: PICC `interviews` (storyteller_id matches)
- **Trip photos**: PICC `media_files` (project_id OR tags containing 'project:elders-trips'), 200 max, reverse chronological
- **Trip video**: PICC `media_files` (tags=['external-video', 'project:elders-trips'], prefers 'platform:descript')
- **Trip stops**: PICC `elder_trip_stops` (hardcoded trip_name='elders-trip-2024')
- **Status**: Rich integration. **Gap**: Trip stops are hardcoded to 2024; if year changes, must update. EL quote matching by name is prone to false negatives (name spelling mismatches).

### Stories (`/stories`)
- **Data shown**: Featured stories (3), recent stories (12), elder stories (6), EL voices grouped by author (top 8)
- **Stories source**: PICC Supabase `stories` (published)
- **Voices**: **EL Supabase** via `getELQuotes()` + `groupQuotesByAuthor()`, impact >= 50, grouped by speaker name
- **Status**: Operational. **Gap**: Stories are from PICC only; no EL stories are surfaced despite EL being mentioned as a data source.

### Impact (`/impact`)
- **Data shown**: Staff growth, Indigenous staff %, financials history, expense breakdown, service metrics, leadership quote, 3 impact voices
- **Sources**: 
  - Staff: PICC `staff_statistics` (historical) + `service_metrics`
  - Financials: PICC `annual_financials` (historical, 7 expense categories tracked)
  - Service metrics: PICC `service_metrics` (aggregate by fiscal year)
  - Voices: **EL Supabase** with thematic filtering (workforce, service delivery, future-focused quotes)
- **Status**: Working. **Gap**: Financials table (`annual_financials`) is separate from `annual_reports`; unclear which is source of truth for annual report generation.

### About (`/about`)
- **Data shown**: Hero video, 17-year milestones, board members with photos, CEO photo
- **Sources**:
  - Board members: PICC `leadership` table (leadership_type='board')
  - CEO: PICC `leadership` (leadership_type='executive')
  - Photos: PICC `leadership.photo_url`
  - Milestones: Hardcoded in `MILESTONES` constant
- **Status**: Operational. **Gap**: Milestones are static; if they're meant to update yearly, they're not wired to data.

### Elders Voices on Country (`/elders/voices-on-country`)
- **No page found** — does not exist in app structure.

### Annual Report (`/annual-report` and `/annual-report/[year]`)
- **Routes found**: `/annual-reports/` (not `/annual-report/`). Page structure incomplete at read time.
- **Data shown**: (Inferred from PDF generation) Title, executive summary, statistics, sections, board members, leadership messages, highlights, services, photos, financials, innovation projects, community voices, compliance data, history eras
- **Status**: Pages exist but index structure unclear. Data pipeline verified at API layer.

---

## 2. Annual Report Pipeline (24/25 Vision)

### Current State: 2023-24 Hardcoded
Today's annual report uses **static fallback** (`data-2024.ts`):
- **Hardcoded**: 197 staff, $23.4M revenue, $3.5M net assets, 6 photos, 7 board members, 20 statistics
- **Photos**: 6 Supabase URLs (annual-report-2024 folder, hardcoded)
- **Voices**: None (placeholder)
- **Services**: PICC Supabase (live query) or fallback list
- **Leadership messages**: Hardcoded in data-2024.ts

### Intended Flow: `fetch-report-data.ts`
```
getReportData('2024-25')
  ├─ annual_reports (report metadata)
  ├─ report_statistics (key metrics)
  ├─ report_sections (content blocks)
  ├─ board_members (board records)
  ├─ leadership (CEO/Chair messages)
  ├─ report_highlights (impact highlights)
  ├─ organization_services (all active services)
  ├─ media_files (cover, gallery, page-specific photos)
  ├─ annual_financials (income, expense breakdown)
  ├─ projects (innovation projects)
  ├─ stories + elder_quotes + community_visions (community voices)
  ├─ organization_history (era timeline)
  └─ page_photos.ts (photo assignments per page)
```

### Report Structure: 18-20 Pages (from planner-config.ts)
1. **Cover** — hero background photo + title
2. **Acknowledgement** — country text
3. **Messages** — CEO + Chair (photo, message, quote each)
4. **Numbers** — hero stat + metric grid (8-12 stats)
5. **Services** — service grid with staff/clients (4-6 services per audience)
6. **Board** — board member portraits + bios
7. **Leadership profiles** — extended leadership bios
8. **Financials** — income/expense breakdown charts
9. **History** — timeline or era summary
10. **Resilience** — climate/challenge narrative
11. **Innovation** — projects (4-8 shown)
12. **Community voices** — quotes/stories (6-12)
13. **Highlights** — impact cards (3-6)
14. **Partners** — logo grid (hardcoded)
15. **Compliance** — audit, AGM, members stats
16. **Appendix** — detailed metrics, definitions

### Audience Targeting
**Four variants per report**:
- **Community**: Full detail, emphasis on services + voices
- **Funder**: Financials + impact metrics + board + compliance
- **Supporter**: Balanced; focus on stories + impact
- **Board**: Full compliance, detailed governance

**Gap**: Audience filtering logic exists in planner UI but unclear if rendered PDF actually adapts content. `AnnualReportPDF.tsx` likely needs to conditionally render sections per audience.

### What's Hardcoded vs. Queried

| Data Point | Source Today | For 24/25 | Status |
|-----------|--------------|----------|--------|
| Staff numbers (197) | Hardcoded in data-2024.ts | Query `staff_statistics` + `service_metrics` sum | **Not wired** |
| Income ($23.4M) | Hardcoded | Query `annual_financials` | **Not wired** |
| Expenses ($23.7M) | Hardcoded | Query `annual_financials` | **Not wired** |
| Expense breakdown | Hardcoded | Query `annual_financials` (7 categories) | **Not wired** |
| Board members | Hardcoded (7 names, photos) | Query `leadership` (leadership_type='board') | **Wired** |
| CEO/Chair messages | Hardcoded text | Query `leadership` (messages, quotes) | **Partially wired** |
| Services list | Live query + fallback | Live query `organization_services` | **Wired** |
| Service metrics | Fallback per service | Query `service_metrics` | **Partially wired** |
| Cover photo | Hardcoded URL | Query `media_files` (tags=['annual-report-cover']) | **Partially wired** |
| Gallery photos (6) | Hardcoded URLs | Query `media_files` (tags=['annual-report']) | **Partially wired** |
| Page-specific photos | None (18 pages) | Use `page-photos.ts` system | **Partially wired** |
| Statistics (20) | Hardcoded in STATISTICS array | Query `report_statistics` | **Not wired** |
| Community voices | None (hardcoded empty) | Query `stories` + `elder_quotes` + `community_visions` | **Not wired** |
| History eras | Hardcoded (static) | Query `organization_history` | **Not wired** |
| Innovation projects | Hardcoded (3 projects) | Query `projects` (innovation type) | **Partially wired** |
| Compliance data | Hardcoded (audit firm, ICN, AGM) | Query `annual_reports` (compliance fields) | **Not wired** |
| Financials charts | Hardcoded (one year) | Query `annual_financials` (all years for comparison) | **Not wired** |

---

## 3. Services & Projects Display

### Services Display Status
- **Total services**: 28 in PICC Supabase (all shown on `/services`)
- **Visibility**: All 28 are queryable and display cards
- **Coverage**:
  - 23/28 services have ≥1 photo
  - 5/28 have null descriptions (show fallback: "Supporting the Palm Island community.")
  - 28/28 are matched with EL quotes (keyword-based, ~95% hit rate observed in code)
- **Gap**: Services with no photos or broken keyword matching show incomplete cards; homepage shows only top 6 by photo count

### Projects Display Status
- **PICC projects**: 8 in Supabase (query: `project_type='innovation'` + status in ['active', 'in_progress'])
- **EL projects**: 6 mentioned in launchpad page (inferred from stakeholder context, not currently displayed)
- **Alignment issue**: No cross-reference between PICC projects and EL projects visible in code
- **Display**: 4 innovation projects on homepage, 8 on `/annual-reports/` (if page exists)

### Gap: Alignment vs. Source of Truth
- PICC has 8 projects; EL has 6
- Frontend code queries only PICC `projects` table
- No merge logic for EL projects into public-facing pages
- Unclear which 6 EL projects are and whether they should appear on site

---

## 4. Media (Photos, Gallery, Videos)

### Current Patterns
- **Photo tagging system**: `media_files.tags` array, used to filter by:
  - Service: `service:{slug}`
  - Page: `page:elders`, `page:services`, `annual-report`, `annual-report-cover`
  - Project: `project:{slug}`
  - Special: `hero`, `featured`
- **Photo display**: 
  - Homepage: 8 gallery photos (featured first, random service diversity)
  - Services: 1 hero per service (service+hero tags) + photo count badge
  - Elders: 200+ trip photos (project_id OR tags)
  - Impact: None (financials focus)
- **Video display**:
  - Services: Video count badge (no playback shown)
  - Elders: 1 trip video (external-video tag, prefers Descript platform)
  - About: Hero video (hardcoded fallback to `/hero-assets/clips/palm-island-aerial.mp4`)
- **Hero images**: Scattered lookup via `getHeroImage(pageContext)` util

### Annual Report Photos
- **Cover**: Query tags=['annual-report-cover'] (1 featured image)
- **Gallery**: Query tags=['annual-report'] (6 images max)
- **Page-specific**: Managed by `page-photos.ts`:
  - Looks for Supabase tags matching page name
  - Falls back to photo manifest JSON (keyword matching)
  - Falls back to hardcoded year-specific paths
  - Final fallback: AI-generated placeholder from `/report-assets/`
- **Gap**: Page photo system is defensive but untested for 24/25; photo manifest likely outdated

### Video Support
- **Playback**: Only on `/elders` (Descript player, external URL)
- **Elsewhere**: Video metadata collected but not played
- **Gap**: No video playback component for services, annual report, or other pages

---

## 5. 24/25 Annual Report Readiness Checklist

### Data Availability Analysis

| Data Point | Needed For | Current Location | Availability | Readiness |
|-----------|-----------|------------------|--------------|-----------|
| **Financial: Income** | Funder, Board pages | `annual_financials.total_income` | Exists for 2023-24 (FY 2024) | ✅ Query ready; 24/25 data unknown |
| **Financial: Expenditure** | All audiences | `annual_financials.total_expenditure` | Same table | ✅ Query ready |
| **Financial: Expense breakdown** | Funder, Board | `annual_financials` (7 categories) | Labour, admin, travel, client costs, property, vehicles | ✅ Query ready |
| **Financial: Net assets** | Board | `annual_financials.net_assets` | Not seen in code | ❌ **Missing** |
| **Staff: Total** | All audiences | `staff_statistics.total_staff` | Exists | ✅ Query ready |
| **Staff: Indigenous %** | Impact, Board | `staff_statistics.indigenous_staff_count` | Exists | ✅ Query ready |
| **Staff: By service** | Services page (if shown) | `service_metrics.staff_count` | Per service, per fiscal year | ✅ Query ready |
| **Services: List** | All audiences | `organization_services` | 28 active services | ✅ Live |
| **Services: Clients served** | Impact, Services | `service_metrics.clients_served` | Per service | ✅ Query ready |
| **Services: Metrics labels/values** | Highlights | `service_metrics.headline_stat_label/value` | Custom per-service highlight | ⚠️ Exists but underutilized |
| **Board members** | Board, Compliance | `leadership` (type='board') | 7 members (2023-24) | ✅ Query ready |
| **CEO/Chair messages** | Messages page | `leadership` + message fields | CEO + Chair with quotes | ⚠️ Fields exist; content may be stale |
| **Annual report text** | Cover, acknowledgement, executive summary | `annual_reports` (columns: title, executive_summary, looking_forward, acknowledgments) | Report metadata table | ⚠️ Exists; likely stale for 24/25 |
| **Community voices: Stories** | Community page | `stories` (report_worthy=true) | Up to 6 stories | ✅ Query ready |
| **Community voices: Elder quotes** | Elders page, voices section | `elder_quotes` (is_validated, permission_level='public') | High-quality quotes | ✅ Query ready |
| **Community voices: Visions** | Community page | `community_visions` (is_approved=true) | Community aspirations | ✅ Query ready |
| **Innovation projects** | Innovation page | `projects` (innovation type, active status) | 8 total (EL has 6 more, not queried) | ✅ Partial |
| **History eras** | History page | `organization_history` (era_name, milestones) | Timeline by year | ✅ Query ready (if records exist) |
| **Cover photo** | Cover page | `media_files` (tags=['annual-report-cover']) | 1 featured | ✅ Query ready |
| **Page-specific photos** | All 18 pages | `media_files` + `page-photos.ts` manifest | Per-page hero + gallery | ⚠️ System exists; photos may be missing |
| **Board member photos** | Board page | `leadership.photo_url` | Per-member headshot | ✅ Query ready |
| **Compliance: Auditor** | Compliance page | `annual_reports.auditor_name/firm` | Audit firm name | ✅ Query ready |
| **Compliance: ICN** | Compliance page | `annual_reports.icn_number` | Australian charity ID | ✅ Query ready |
| **Compliance: Board meetings** | Board page | `annual_reports.board_meetings_held` | # of meetings in FY | ✅ Query ready |
| **Compliance: Members** | Compliance page | `annual_reports.members_count` | Total voting members | ✅ Query ready |
| **Compliance: AGM date** | Compliance page | `annual_reports.agm_date` | Most recent AGM | ✅ Query ready |
| **Compliance: Revenue by funder** | Funder page | `annual_reports.revenue_by_funder` (JSON array) | Breakdown by funder | ✅ Query ready |

### 24/25 Gap Summary

| Category | Issue | Impact | Fix Needed |
|----------|-------|--------|-----------|
| **Financials** | No 24/25 FY data in `annual_financials` yet | Cannot generate funder/board reports | Xero sync must populate by June 30, 2025 |
| **Staff stats** | No 24/25 records in `staff_statistics` | Cannot show latest staff numbers | Manual entry or HR system sync needed |
| **Service metrics** | 24/25 data must be entered per service | Cannot show clients served, staff per service | Service leads must report by July 2025 |
| **Stories** | Stories table exists but 24/25 report-worthy stories may be missing | Community voices section may be empty | Content team must tag stories as `report_worthy=true` |
| **Elder quotes** | Quotes exist in EL; must be validated & approved | Voices section may show only PICC quotes | Elder approval cycle must run weekly (M5 in launchpad) |
| **Report metadata** | Executive summary, looking_forward, acknowledgments are stale (2023-24) | Cover page shows old text | Rachel must update annual_reports record before PDF generation |
| **Page photos** | Photo manifest may be outdated; photos may be missing per page | Pages may have broken images or fallback AI placeholders | Photo tagging system must be tested & updated by Month 5 |
| **Board members** | Board member list may have changed | Stale photos, missing names | Leadership table must be kept current |
| **Compliance data** | ICN, auditor, AGM date may not be recorded | Compliance page missing critical info | Finance/governance team must populate annual_reports record |

---

## 6. Top 5 Frontend Gaps

### 1. **No 24/25 data in any table yet** (Critical — blocks all report generation)
   - `annual_financials` is empty for FY2024-25
   - `staff_statistics` is empty for FY2024-25
   - `service_metrics` lacks 24/25 entries
   - **Fix**: Coordinate with Xero sync (agents 1 & 2 own this). Data must be live by June 30, 2025 to generate reports in July.

### 2. **Annual report content not wired to data tables** (High — frontendblocks 24/25 launch)
   - Statistics are hardcoded in `data-2024.ts`, not queried from `report_statistics`
   - Community voices array is empty; no logic to populate from stories/quotes/visions
   - Photos per page exist in `page-photos.ts` but untested for 24/25
   - **Fix**: Complete the `fetch-report-data.ts` → `AnnualReportPDF.tsx` flow. Test with real 24/25 data by May 2025.

### 3. **Audience-targeted variants may not actually render differently** (Medium — promised feature)
   - `/api/pdf/generate?audience=funder|community|board|supporter` endpoint accepts parameter
   - `AnnualReportPDF.tsx` receives `audience` prop
   - **Unclear**: Does the PDF component conditionally hide/show pages per audience? Code inspection needed.
   - **Fix**: Verify `AnnualReportPDF` renders 4 variants; document which sections are audience-specific.

### 4. **EL projects not surfaced on public pages** (Medium — alignment gap)
   - Frontend queries only PICC `projects` table (8 projects)
   - Launchpad mentions "6 EL projects" but these don't appear in annual report or services
   - **Fix**: Decide: are EL projects published or internal? If published, wire a third data source (EL API or new PICC projects linked to EL).

### 5. **Service keyword matching for EL quotes is fragile** (Low — handles gracefully but brittle)
   - 28 services mapped to keyword arrays in `/services/page.tsx`
   - If service keyword doesn't match quote text, no voice shown
   - Keyword list is hardcoded and outdated for new services
   - **Fix**: Move keyword map to database; implement fuzzy or semantic matching instead of substring match.

---

## 7. Critical Path for 24/25 Annual Report Launch

### Phase 1: Data Population (April–June 2025)
- [ ] Xero integration syncs financials to `annual_financials` table
- [ ] HR system populates `staff_statistics` for FY2024-25
- [ ] Service leads submit `service_metrics` (clients, staff, headline stats)
- [ ] Community vote/approve 669 pending voices (weekly approval cycle starts now per M5)
- [ ] Stories tagged as `report_worthy=true` (content team)
- [ ] Rachel writes/updates annual_reports record (executive_summary, looking_forward, acknowledgments)

### Phase 2: Content Build (May–July 2025)
- [ ] Test `fetch-report-data.ts` queries with live 24/25 data
- [ ] Verify page photo system (all 18 pages have hero + gallery images)
- [ ] Audit audience-targeting logic in AnnualReportPDF (community/funder/board/supporter filters)
- [ ] Board member list synced to `leadership` table
- [ ] Compliance data populated (auditor, ICN, AGM, members count)

### Phase 3: Launch (July–August 2025)
- [ ] PDF generation tested end-to-end (all 4 audiences)
- [ ] `/picc/reports/planner` UI tested (content selection, export)
- [ ] Public annual report page (`/annual-reports/2024-25`) live
- [ ] "Download PDF" buttons on public pages wired to `/api/pdf/generate`

---

## 8. Summary: Where Data Flows Today vs. Where It Needs to Go

### Today (2023-24)
```
Hardcoded data-2024.ts
  ↓
AnnualReportPDF (static render)
  ↓
PDF (static document, no audience targeting)
```

### What We Need (2024-25)
```
PICC Supabase (annual_financials, staff_statistics, service_metrics, report_statistics)
+
EL Supabase (stories, elder_quotes, community_visions)
+
PICC Supabase (media_files, board_members, leadership)
  ↓
fetch-report-data.ts (unified query layer)
  ↓
AnnualReportPDF (audience-aware component)
  ↓
/api/pdf/generate?audience=X
  ↓
PDF (4 variants: community, funder, supporter, board)
```

---

## 9. File Inventory

**Key Frontend Pages**:
- `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/page.tsx` — homepage
- `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/services/page.tsx` — services index
- `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/elders/page.tsx` — elders index
- `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/impact/page.tsx` — impact metrics
- `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/about/page.tsx` — about
- `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/picc/reports/planner/page.tsx` — report builder UI
- `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/api/pdf/generate/route.ts` — PDF generation endpoint

**Annual Report Core**:
- `/Users/benknight/Code/Palm Island Reposistory/web-platform/lib/annual-report/fetch-report-data.ts` — data fetcher (primary)
- `/Users/benknight/Code/Palm Island Reposistory/web-platform/lib/annual-report/data-2024.ts` — fallback (hardcoded)
- `/Users/benknight/Code/Palm Island Reposistory/web-platform/lib/annual-report/page-photos.ts` — photo assignment system
- `/Users/benknight/Code/Palm Island Reposistory/web-platform/lib/annual-report/planner-config.ts` — page slot definitions
- `/Users/benknight/Code/Palm Island Reposistory/web-platform/lib/pdf/templates/AnnualReportPDF.tsx` — React PDF component

---

**Investigation complete. Handoff ready for data alignment team.**
