# Always-On Annual Report → Print · Unified Architecture

**Date:** 2026-04-16
**Companion to:** `2026-04-16-report-recipe-engine.md` (recipe format) · `ANNUAL-REPORT-EDITORIAL.md` (rules) · `PICC-BRAND-STYLE-GUIDE.md` (visual system)

---

## Thesis

There should be **one content archive** and **two output surfaces** — the always-on website report and the printable PDF/book. Both read from the same data. A change in the archive (new quote, new photo, new service metric, new story) flows to both surfaces without the designer or developer touching it. A Recipe (see companion doc) picks which audience, focus, and depth.

This document names what's already built, what's missing, and how the pieces connect.

---

## The data archive (source of truth)

**Empathy Ledger v2 Supabase** (`yvnuayzslukamizrlhwb`) holds PICC content:

| Table | PICC count | What it holds |
|---|---|---|
| `storytellers` | 44 | Name, bio, photo, is_elder, location, role |
| `extracted_quotes` | 1,048 | Text · themes · category · author_name · service_id · is_featured · era_label |
| `stories` | 236 | Long-form narratives with storyteller + themes |
| `transcripts` | 137 | Raw source material behind quotes |
| `media_assets` | 2,636 (122 consent-cleared) | Photos + alt_text + cultural_tags + consent flags |
| `projects` | 7 | 20-Year Book, Bwgcolman Way, Palm-led Economy, etc. |
| `annual_reports` | 18 | Historical PICC annual reports — narrative + stats |

**PICC Supabase** (`uaxhjzqrdotoahjnxmbj`) holds operational data:

| Table | Count | What it holds |
|---|---|---|
| `organization_services` | 30 active | Service name, category, status, description |
| `service_metrics` | varies | Per-service KPIs |
| `service_grants` | varies | Funding per service |
| `service_story_links` | varies | Cross-reference |
| `annual_report_timeline` | 0 | (empty — would be milestones) |

**Rule:** Consent always governed by EL v2. PICC never publishes a photo or named quote without EL v2 saying `elder_approved = true AND consent_obtained = true`.

---

## The API surface (content recall)

### Already live on EL v2 (public, no auth)

| Endpoint | What it returns | Current state |
|---|---|---|
| `GET /api/public/voices?theme=…&limit=…` | Quotes + storyteller name + avatar + location (HONY-style) | Live |
| `GET /api/public/stories` | Stories with storyteller attribution | Live |
| `GET /api/public/storyteller/:id` | Single storyteller profile + quotes + stories | Live |
| `GET /api/public/storytellers` | List of approved storytellers | Live |
| `GET /api/public/theme-stats` | Theme taxonomy + counts | Live |
| `GET /api/public/featured-stories` | Curator-selected features | Live |
| `GET /api/public/recent-stories` | Time-sorted recent content | Live |
| `GET /api/public/gallery` | Approved media assets | Live |
| `GET /api/public/stats` | Org-wide aggregate numbers | Live |

### Already live on EL v2 (shared-secret, PICC-only)

| Endpoint | What it returns |
|---|---|
| `GET /api/photos?slot=<slot>` | Consent-filtered photos keyed to the 19 AR slots |

### Already live on PICC

| Endpoint | What it returns |
|---|---|
| `GET /api/annual-report-data/curated-voices` | Curated quotes for annual report |
| `GET /api/annual-report-data/overview` | Report-year summary stats |
| `GET /api/annual-report-data/financials` | Revenue breakdown |
| `GET /api/annual-report-data/board` | Board members |
| `GET /api/annual-report-data/projects` | Featured projects |
| `GET /api/annual-report-data/metrics` | Service metrics |
| `GET /api/annual-report-data/stories` | Curated stories |
| `GET /api/annual-report-data/media` | Approved photos (proxies EL v2) |
| `GET /api/annual-report-data/highlights` | Year highlights |
| `GET /api/annual-report-data/page-plan` | Computed page structure |
| `GET /api/pdf/generate?type=annual-report&audience=<persona>` | PDF render of the report |

**Gap:** one gap is a **unified PICC-scoped recall endpoint** that accepts `{ type, query, filters }` and returns a mixed result set (quotes + stories + photos + people). Today you query each type separately. Minor to add.

---

## The web surface (always-on)

Pages already exist in `web-platform/app/`:

| Route | What it is |
|---|---|
| `/annual-report/live` | **Always-on live version** — auto-refreshes as archive updates |
| `/annual-report/2024-25` | Fiscal-year specific snapshot |
| `/annual-report/[year]` | Any historical year |
| `/annual-report/print` | Print-optimised HTML (CSS `@media print`) — browsers print to PDF directly |
| `/thematic-reports/[theme]` | Recipe: focus=theme, e.g. `/thematic-reports/self-determination` |
| `/picc/reports/builder` | **Report builder UI** — staff pick audience + focus + time · generate PDF |
| `/picc/reports/composer` | Manual spread composer |
| `/picc/reports/planner` | Pre-production planning view |
| `/picc/reports/thematic` | Thematic report catalog |
| `/picc/reports/photos` | Photo library scoped to annual report |
| `/picc/annual-reports/[id]/quotes` | Per-report quote archive |
| `/picc/annual-reports/[id]/images` | Per-report image archive |

The always-on surface is **a proper living report.** It queries the EL v2 archive on every render. A new approved photo shows on Elders On Country the moment it's flagged. A new featured quote appears on the Voices Wall within one cache window (300s default revalidate).

---

## The print surface (PDF / book)

**Current pipeline:**

```
/api/pdf/generate?type=annual-report&audience=<persona>&year=<fy>
  └─ web-platform/lib/pdf/templates/AnnualReportPDF.tsx
  │    ├─ React PDF (@react-pdf/renderer)
  │    ├─ fetches data: lib/annual-report/fetch-report-data.ts
  │    │    ├─ PICC Supabase: services · board · financials · milestones
  │    │    └─ EL v2 via /api/photos: consent-filtered approved photos
  │    ├─ renders via lib/pdf/components/ (TaggedPhoto, PhotoCover, Quote, …)
  │    └─ uses lib/pdf/theme.ts (brand colours, type scale, spacing)
  └─ returns application/pdf bytes
```

**Current status:** font-load bug blocks render (see `2026-04-15-pdf-render-backlog.md`). Next-session entry: downgrade `@react-pdf/renderer` to v3, or inline TTFs as base64 TS constants.

**Pencil file (`picc-annual-report.pen`)** holds the 23-spread design master. Once the PDF render is unblocked, the React PDF output should visually match the Pencil master. If they drift, the React PDF is the primary print output; Pencil is the editorial + design source of truth.

**Book production** — for the 20-Year Book and any premium print runs, the workflow is:
1. Run `/picc/reports/builder` → download PDF
2. Send to print partner (Townsville-area printer known to PICC)
3. The Pencil `.pen` file is the design master if the printer needs editable source

---

## How a change flows through

**Scenario: Narelle approves a new Aunty Ethel quote via the EL admin.**

1. `UPDATE extracted_quotes SET is_featured=true WHERE id=… AND author_id=ethel_id`
2. **Within 5 min** — `/api/public/voices?theme=elders_wisdom` returns it (next cache window)
3. **Within 5 min** — `/annual-report/live` Community Voices section refreshes with it
4. **On next PDF generation** — `/api/pdf/generate` picks it up (cache-busted per request)
5. **In Pencil** — if the Pencil file pulls from the API (via the Pen → API bridge), it refreshes too. Otherwise it's a manual update.

**Scenario: new photo uploaded to EL v2, tagged `picc:slot:elders-on-country`, Elder-approved.**

1. Upload + tagging happens in EL v2 admin
2. `/api/photos?slot=elders-on-country` returns it
3. `/annual-report/live` Elders On Country spread refreshes
4. `TaggedPhoto` component on web + PDF shows it
5. Pencil file: needs manual refresh (Pencil images are embedded at design time)

---

## The Content Library UI — what should be built

Today, content recall is spread across multiple pages:
- `/picc/reports/photos` — photos
- `/picc/annual-reports/[id]/quotes` — quotes per report
- `/picc/voices` — 452 voices
- `/picc/library` — research sources

**Missing:** one unified `/picc/content` search that queries across quotes + stories + photos + storytellers with a single input. Think: "show me everything tagged `self_determination` and `elders_wisdom`, from 2024". Or "show me every photo and quote from Aunty Ethel". Or "pull all content linked to First 1,000 Days".

**Proposed spec for this page (`/picc/content`):**

```
┌──────────────────────────────────────────────┐
│ What are you looking for?                    │
│ [ search box: name · theme · service · year ]│
│                                              │
│ Filters: [Audience] [Type] [Themes] [Year]   │
└──────────────────────────────────────────────┘

Results (grouped by type):

 ┌─ Quotes (47) ──────────────────┐
 │ • "I need to learn from you…"  │
 │   — Aunty Ethel  ✦  [add to recipe]
 │ • "We've been teaching them…"  │
 │   — Allan Palm Island ✦        │
 └────────────────────────────────┘

 ┌─ Photos (23) ──────────────────┐
 │ [thumb] [thumb] [thumb] [thumb]│
 │ [add to recipe]                │
 └────────────────────────────────┘

 ┌─ Stories (8) ──────────────────┐
 │ • Hull River · Aunty Ethel     │
 │ • First 1000 Days launch · …  │
 └────────────────────────────────┘

 ┌─ Storytellers (12) ────────────┐
 │ [avatar grid]                  │
 └────────────────────────────────┘

[ Compile as recipe → draft report ]
```

This page would:
1. Union-query across the EL v2 + PICC APIs (all public + authenticated PICC endpoints exist)
2. Let a staff member build a recipe by drag-selecting content
3. Export a `recipe.yaml` or trigger `/api/pdf/generate` directly

**Estimated build:** 1–2 days of work given all the underlying APIs already exist. Mostly React + Tailwind composition.

---

## Gap list (what to do next, in priority order)

| # | Gap | Effort | Blocking what |
|---|---|---|---|
| 1 | PDF render broken (font-load bug) | 0.5 day | All printable output |
| 2 | Unified `/picc/content` recall page | 2 days | Staff-friendly content discovery |
| 3 | Recipe YAML → `/api/pdf/generate` binding | 1 day | Non-board recipes actually rendering |
| 4 | Parametrize AnnualReportPDF.tsx sections | 2 days | Reusable per-recipe rendering |
| 5 | Pencil → data binding (optional) | 1 week | Keeping Pencil live-synced with archive |

---

## What this enables

When (1) + (2) + (3) + (4) ship:
- **Staff can generate any report in minutes** at `/picc/reports/builder` — pick audience + focus + year, download PDF.
- **Narelle can spin up a Commonwealth DSS brief** from the First 1,000 Days recipe without touching design tools.
- **The community celebration version** prints for community morning teas; the funder version goes to DCSSDS; the sector version goes to QATSICPP. All from the same archive, same day.
- **Every new quote or photo Narelle approves in EL** is one cache window away from appearing in live web + next PDF.

That is the always-on annual report.

---

## Diagram

```
              ┌─────────────────────────────┐
              │    Empathy Ledger v2        │
              │    (1048 quotes · 236       │
              │     stories · 2636 photos · │
              │     44 storytellers)        │
              └───────────┬─────────────────┘
                          │
            ┌─────────────┴──────────────┐
            │    Consent-filtered APIs    │
            │                             │
            │  /api/public/voices         │
            │  /api/public/stories        │
            │  /api/photos  (PICC-auth)   │
            │  /api/public/theme-stats    │
            └───────────┬─────────────────┘
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Always-on    │ │ Report       │ │ Pencil       │
│ web pages    │ │ builder UI   │ │ .pen master  │
│              │ │              │ │              │
│ /annual-     │ │ /picc/       │ │ (design      │
│  report/     │ │ reports/     │ │  source of   │
│  live        │ │ builder      │ │  truth)      │
└──────┬───────┘ └──────┬───────┘ └──────────────┘
       │                │
       │                ▼
       │        ┌──────────────┐
       │        │ Recipe       │
       │        │ (YAML)       │
       │        └──────┬───────┘
       │               │
       │               ▼
       │        ┌──────────────┐
       │        │ React PDF    │
       │        │ pipeline     │
       │        │              │
       │        │ /api/pdf/    │
       │        │ generate     │
       │        └──────┬───────┘
       │               │
       ▼               ▼
    Browser         PDF file
    reader          → print partner
```

---

*The content archive is the annual report. The annual report is just one of its views.*
