# PICC Leader Walkthrough — Master Brief
## The 20-year celebration, Bwgcolman Way, and the next 20 — grounded in the data that already exists

**Draft v1 · 10 April 2026 · Ben**

**Purpose of this document.** Before Rachel and Narelle decide what the 20-year celebration looks like, they should see what we already have. This brief is an evidence inventory across **two data homes** — the PICC Supabase platform (`uaxhjzqrdotoahjnxmbj`) and the Empathy Ledger v2 canonical archive (`yvnuayzslukamizrlhwb`) — then proposes five concrete walkthrough experiences that can be stood up from existing material, plus a clear list of gaps that need the Narelle interview to fill.

Every number in this document was queried directly against the live databases or read from source files on 10 April 2026. Nothing is fabricated. Every opportunity is tied to real rows in real tables.

---

# Part 1 — What already exists (the inventory)

## 1A. PICC Supabase — the narrative layer

Queried live on 10 April 2026.

| Layer | Table | Count | Notes |
|---|---|---:|---|
| **Voice** | `stories` (published, public) | **53** | 25 storytellers, 37 with quotes, 46 with images |
| | `elder_quotes` (public/community) | **162** | All public-level. 54 community, 27 culture, 23 elders, 3 youth |
| | `extracted_quotes` | **290** | AI-extracted from transcripts |
| | `community_visions` | **6** | Approved forward-looking visions — the "next 20 years" seed |
| **Services** | `organization_services` (active) | **30** | Matches Narelle doc + EL canonical |
| | `service_metrics` | **28** | One per EL canonical service |
| | `projects` | **9** | 6 EL canonical + 3 PICC-only |
| **History** | `timeline_events` | **53** | Full arc 1914 → 2024 |
| | `story_timeline_events` | **24** | Stories linked to specific years |
| | `governance_achievements` | **80** | Multi-year, categorised |
| | `historical_artifacts` | **584** | Photos, documents, citations |
| **Capture** | `interviews` | **34** | With 2,036 interview segments |
| | `interview_segments` | **2,036** | Chunked for analysis |
| **Media** | `media_files` (active) | **2,508** | 2,491 photos + 17 videos |
| **Reports** | `report_highlights` (2024-25) | **8** | Already assembled for the 24/25 annual report |
| **Knowledge** | `knowledge_entries` | **474** | Platform-wide KB |
| **Themes** | `themes` | **12** | Platform theme taxonomy |

**The 24/25 annual report is already seeded.** Eight report highlights exist in the DB for fiscal year 2024-25:

1. **Staff Growth to 197 Employees** — 30% growth, 70%+ Palm Islanders *[milestone]*
2. **Delegated Authority Implementation** — Community decides care for children (Bwgcolman Way) *[achievement]*
3. **First 1,000 Days Program Launch** — new maternal/child health program *[innovation]*
4. **Health Services Expansion** — Bwgcolman Healing: 2,283 clients, 17,488 episodes *[achievement]*
5. **Safe Haven Children Support** — 1,187 children supported *[community_impact]*
6. **RACGP Accreditation Renewed** — valid to 2027 *[milestone]*
7. **Digital Service Centre Growth** — 50 languages, 21 staff *[innovation]*
8. **Revenue of $23.4 Million** — across 16 services *[milestone]*

> **Data flag:** Highlight #8 says $23.4M / 16 services — these are the **2023-24** figures, not 2024-25. Either the report hasn't been updated yet or the 24/25 numbers haven't landed. Confirm with finance before the annual report ships. (This is exactly what Part C of the Narelle interview framework will resolve.)

## 1B. Empathy Ledger v2 — the canonical archive

Located at `/Users/benknight/Code/empathy-ledger-v2`. PICC-specific material found:

**`docs/15-reports/picc-annual-reports/`** — a structured 17-year archive:

- `timeline.md` — the full growth table from 2007-08 to 2023-24
- `methodology.md` — how the extracts were made (93 lines)
- `years/` — 17 per-year summary files (2007-08 through 2023-24), each ~30 lines with CEO/Chair, key stats, summary, section list, and PDF link

**Scripts that run against PICC data:**
- `scripts/generate-picc-report.mjs`
- `scripts/upload-picc-videos.mjs`
- `scripts/sync-palm-island-media.mjs`
- `scripts/edit-and-era-quotes.ts`
- `scripts/extract-all-pdfs.ts`

**The archive also holds:** the original PDF annual reports, stored in Supabase Storage at `yvnuayzslukamizrlhwb.supabase.co/storage/.../annual-reports/{org_id}/{year}.pdf`.

This is the **17-year history as machine-readable data**. It is the spine of the 20-year story.

## 1C. Currently live pages (localhost:3000)

Confirmed 200 OK as of the last session:

- `/` · `/services` · `/services/[slug]` (30 active services all rendering)
- `/20-years` · `/road-to-20-years`
- `/elders` · `/elders/voices-on-country`
- `/picc/launchpad` (the CEO-review page from the April 8 commit)
- `/picc/services` · `/picc/projects` · `/picc/reports/builder`
- `/annual-report/live`

---

# Part 2 — The 17-year arc (the numbers that tell the 20-year story)

Pulled from EL v2 `timeline.md`, cross-referenced with PICC `governance_achievements`.

## The growth curve

| Year | Staff | Revenue | Programs | Clients | Chair |
|---|---:|---:|---:|---:|---|
| 2007-08 | 1 | — | — | — | Jim Petrich AM |
| 2009-10 | — | $3.46M | 7 | 1,235 | Jim Petrich AM |
| 2013-14 | 70 | $6.19M | 9 | 800 | Jim Petrich AM |
| 2017-18 | 100 | $8.97M | 12 | 2,000 | Mislam Sam |
| 2019-20 | ~100 | $11.75M | 20 | — | Luella Bligh |
| 2020-21 | 129 | $12.97M | 20 | — | Luella Bligh |
| 2021-22 | 135 | $14.83M | 20 | — | Luella Bligh |
| 2022-23 | 151 | $20.10M | 12 | 4,626 | Luella Bligh |
| **2023-24** | **197** | **$23.4M** | **16** | — | **Luella Bligh** |

**The headline:**

- **Staff: 1 → 197** (197x growth)
- **Revenue: $1.6M → $23.4M** (15x growth)
- **Programs: 7 → 20+** (3x)
- **CEO continuity: Rachel Atkinson from 2007 to today** — one leader across the whole arc

**The key inflection points** (from `timeline_events` + `governance_achievements`):

| Year | Event | Significance |
|---|---|---|
| 1914 | Hull River Settlement established | Before PICC, there was Hull River |
| 1918 | Hull River Cyclone (Cat 5, 305mm rain) — settlement destroyed | The founding trauma |
| 1918 | Survivors transferred to Palm Island | Palm Island as home |
| 1919 | Palm Island formally gazetted as Aboriginal reserve | 50+ language groups forcibly relocated |
| 1972 | End of documented removals period | — |
| 2004 | Death in custody, civic unrest | The crisis that made PICC necessary |
| **2007** | **PICC established** (QLD Gov + Council joint venture) | The founding |
| 2008 | Service delivery begins | First operations |
| 2012 | CFC modular facility arrives by barge | First purpose-built infrastructure |
| 2012 | Safe House — **FIRST** residential out-of-home care licence in QLD | First "first" |
| 2013 | 85% community satisfaction survey | Community confidence |
| 2014 | Social enterprises begin | Economic sovereignty begins |
| 2018 | Peak service year: 3,306 clients, 17 services, 11 funders | Scale achieved |
| 2019 | Ipsos independent evaluation — recommends full community control | The mandate |
| 2019 | 10th anniversary | The previous milestone moment |
| **2021** | **Transition to community-controlled structure (30 Sep)** | PINCL → community control |
| 2022 | COVID response: 601 vaccinations | Crisis capability |
| 2023 | Commenced Delegated Authority project | Bwgcolman Way begins |
| **2024** | **Implemented Delegated Authority — first ATSICCO in QLD** | **Bwgcolman Way lands** |
| 2024 | Staff 197 (30% growth) | Scale today |

**This is the spine of the 20-year celebration narrative — and every row is in the database.**

---

# Part 3 — Five walkthrough experiences (built from existing data)

Each one is a concrete thing that can be stood up from material already in the platform. No fake data. No placeholders. Each also has a **status** (what exists today vs what needs to be built) and a **rough build estimate**.

## Experience 1 — The Year-by-Year Walk

**The big idea:** A single scrolling page at `/20-years/walk` (or similar) where the visitor moves through every year from 2007 to 2025. Each year presents: the staff count, the revenue, the key achievement that year, one governance milestone, one voice (quote or story), one photo, and the sentence that captures what changed.

**Data sources:**

- EL v2 `timeline.md` — the staff/revenue/programs numbers per year
- PICC `timeline_events` (53 rows) — key events with dates, significance, descriptions
- PICC `governance_achievements` (80 rows, fiscal_year tagged) — one per year minimum
- PICC `elder_quotes` (162) — tagged by relevance
- PICC `stories` (53 public) — 46 with images, linked to years via `story_timeline_events`
- PICC `media_files` (2,508 photos) — tagged by period or event

**What exists today:**
- `/20-years/page.tsx` renders a `TwentyYearsClient` with a hero, EL voices sample, and 20-year vision — NOT a year-by-year walk yet
- `/road-to-20-years` is a separate experience
- The `story_timeline_events` junction table exists but has only 24 rows — most stories are not yet linked to years

**What needs to be built:**
- A new route or section that joins timeline_events + governance_achievements + story_timeline_events by fiscal_year
- Year anchor navigation (clicking 2014 scrolls to the 2014 section)
- One "primary voice" per year — initially pulled by keyword match from elder_quotes, refined over time with manual curation
- Exports: print-friendly version for the physical book artefact in the Launchpad plan

**Rough build:** 2–3 days for a real, data-driven year-by-year page. Media tagging per year is the long tail.

**Status:** Data ready. Route missing. This is the single highest-leverage new page for the celebration.

---

## Experience 2 — The Bwgcolman Way Spine

**The big idea:** A single long-form story page at `/services/bwgcolman-way` (exists but currently a generic service detail page) that tells the Delegated Authority arc from beginning to end: why it was needed (2004 crisis), how the conversation started (pre-2019), commenced (2023), implemented (2024, first ATSICCO in QLD), and where it goes next (Health? Justice? 2030 vision?).

**Data sources (all already in the platform):**

- `governance_achievements` has the exact sequence:
  - 2021: *"Transitioned to community-controlled structure (PINCL)"*
  - 2023: *"Commenced Delegated Authority project to shift child protection decision-making from government back to community control"*
  - 2024: *"Implemented delegated authority through the Bwgcolman Way service, giving PICC CEO authority to make decisions concerning children in care on Palm Island"*
  - 2024: *"Received Delegated Authority — first ATSICCO in QLD"*
- `report_highlights` #2: *"Delegated Authority Implementation — Full community control over child protection decisions"*
- Related services to link: Bwgcolman Way, Safe House, Family Care Service (6,698 placement nights in 23/24), Family Participation Program, Children and Family Centre
- The service description already in EL is strong raw material
- The 2023 SNAICC National Conference presentation (in `governance_achievements` 2023-24)
- **The NARRATIVE CASE STUDY** (1,500 words) — not yet written; produced by Part D of the Narelle interview framework

**What exists today:**
- `/services/bwgcolman-way` is a working service detail page (verified 200 OK) using the standard `ServiceStoryPage` component
- The keyword map was fixed yesterday so EL voices can match `['child protection', 'community control', 'delegated', 'bwgcolman way', 'self-determination']`
- The service description is in place

**What needs to be built:**
- A richer case-study layout (component: `BwgcolmanCaseStudy`) that:
  - Opens with the 1918 → 2007 → 2024 arc using the governance_achievements rows
  - Embeds the 2023 SNAICC presentation as evidence of peer recognition
  - Shows the service connections (Safe House, Family Care, Family Participation) as a small map
  - Has a dedicated "Where it goes next" section with the 6 community_visions
  - Ends with Rachel's sentence from the next-20 vision (to be captured)
- **The 1,500-word case study text** — produced by Part D of the Narelle interview

**Rough build:** 1–2 days for the component; 0 days for the data; 1 interview + 1 day writing for the case study text.

**Status:** Page exists. Data exists. Case study content is the gap — unblocked by the Narelle interview.

---

## Experience 3 — The Voices Grid (wall of community voice)

**The big idea:** A walk-through installation (digital page AND physical wall at The Centre) that presents all 452 voices — the 162 elder quotes + 290 extracted quotes — as a navigable grid. Tap a voice, hear the audio or read the full context. Filter by category, by service, by year.

**Data sources (all ready):**

- `elder_quotes`: 162 public quotes
  - community: 54
  - culture: 27
  - elders: 23
  - youth: 3 **(GAP — low coverage; flag for Narelle interview voice-capture priority list)**
  - plus per-year ai-extraction-v2 categories (3–5 per year)
- `extracted_quotes`: 290 AI-extracted quotes from interview transcripts
- `interviews`: 34 interviews with 2,036 segments — the raw material
- `media_files`: 2,491 photos tied to services/events
- EL canonical has additional voices beyond what PICC mirror holds

**What exists today:**
- `/elders` + `/elders/voices-on-country` already render community voices from EL with photos and themes — this is the **proof of concept**
- `/api/public/curated-quotes` endpoint already exposes EL quotes via the live server
- The keyword map in the services pages was fixed yesterday to match 7 more services

**What needs to be built:**
- A `/voices` or `/20-years/voices` grid view that pulls all public voices and tags them by the 12 themes + service + year + storyteller
- Audio/video embed for the 17 existing video files + the new voices from the 20 voices capture sprint
- A physical export — a print layout for the installation wall at The Centre

**Rough build:** 2 days for the digital grid; the physical wall is the book designer's job.

**Status:** Data is rich. Proof of concept lives at `/elders`. The scale-up is a 2-day build.

---

## Experience 4 — The Impact Dashboard (present + arc)

**The big idea:** One page that shows leaders "where PICC is right now, and how it got here" — the 24/25 numbers on top of the 17-year curve. This is what Rachel hands a federal minister or a major funder. It is what the funder/sector briefing (E3 in the Launchpad plan) opens with.

**Data sources:**

- `report_highlights` for 24/25 (8 rows already in the DB)
- EL v2 `timeline.md` — the 17-year staff/revenue/programs table
- `service_metrics` for all 28 canonical services
- `annual_financials` table (exists, not yet queried — holds the audited numbers)
- Charts: growth curve (staff), revenue bars, services count

**What exists today:**
- `/annual-report/live` route exists
- `/picc/reports/builder` UI for generating the audience-targeted PDFs
- The `/api/annual-report-data/*` family of routes (overview, highlights, financials, metrics, trends, progress) already expose everything needed
- The 24/25 annual report was produced via the PDF pipeline — PDFs for 2024-25 AND 2025-26 sit in the repo root

**What needs to be built:**
- A single `/impact` dashboard (or reuse the existing `/impact` if it can be extended) that loads the 17-year curve from `timeline.md` data AND the 24/25 highlights — side by side
- A minimal export: the one page that Rachel can print on a single sheet

**Rough build:** 1 day. Most of the work is wiring existing APIs together.

**Status:** Data is the strongest here. The PDF version already exists. The on-screen dashboard is the gap.

---

## Experience 5 — The Next-20 Canvas

**The big idea:** A live, editable canvas at `/picc/next-20` (internal) where the 6 approved community visions, the 3 forward commitments from the Launchpad plan (aged care by 2028, delegated authority into health/justice by 2030, sovereign archive by 2045), and the urgent asks (Aged Care meeting 10 April outcome, Blue Card funding cliff) sit together for Rachel to arrange and refine.

**Data sources (already in the DB):**

- `community_visions` (6 approved rows) — the grassroots seed:
  1. "I want Palm Island to be a place where our young people can see a future — where they have jobs, education, and pride in who they are." *(Young Person)*
  2. "My vision is that every young person on Palm Island finishes school and has a pathway to work or further study right here at home." *(Parent)*
  3. "**By 2029** I want to see Palm Island running its own hospital, its own school, and its own economy. We have the people — we just need the opportunity." *(Community Member)*
  4. "I dream of a time when our culture is so strong that every child grows up knowing their language, their stories, and their place on this land." *(Cultural Elder)*
  5. "More housing, more jobs, and more services that are run by us, for us. That is the future I want for my grandchildren." *(Community Leader)*
  6. "I want visitors to come to Palm Island and see what a strong, proud Aboriginal community looks like. **Not the problems — the solutions.**" *(Palm Island Resident)*
- Launchpad plan M2 (next-20 vision draft)
- The Narelle doc's urgent flags (Aged Care, Blue Card, 3 missing services)

**What exists today:**
- `/picc/launchpad` renders the CEO-reviewed Launchpad plan as a static page
- `community_visions` table has 6 approved rows (queried today)
- No route yet that assembles these together for active editing

**What needs to be built:**
- A new internal route `/picc/next-20` (NOT public — Narelle/Rachel only)
- A visual canvas with three columns: **Community visions** (the 6 rows) · **Forward commitments** (the 3 from the Launchpad) · **Urgent asks** (Aged Care, Blue Card, missing services)
- Editable — Rachel can draft her sentence in the third column, save as the M2 vision statement
- Read-only public version at `/20-years/vision` for the celebration

**Rough build:** 2 days. Most of the value is the arrangement and the fact that the 6 community visions are already captured and approved.

**Status:** Visions exist. Launchpad plan exists. The canvas is a new build. **This is the experience most directly tied to the Rachel workshop outcome.**

---

# Part 4 — The gaps (mapped to the Narelle interview)

Every gap in this document can be traced to a specific section of the Narelle interview framework. This is the cross-reference.

| Gap | Narelle interview section | Unlocks |
|---|---|---|
| 24/25 financial figures ($23.4M is 23/24) | Part C (the numbers round) | Impact Dashboard, Annual Report sign-off |
| 3 PICC-only projects not in EL (Healthy Meals, On-Country Server, Goods) | Part B Tier 3 | Correct service count on every page |
| 3 auto-drafted service descriptions need review | Part B Tier 2 | Services index trustworthiness |
| Bwgcolman Way 1,500-word case study | Part D (deep-dive) | Experience 2 (the spine) |
| 3 missing services Narelle said existed | Part A3 | Completeness of the 28/31 count |
| Voice capture priorities (Elder, staff, young person, board, CEO) | Part F1–F6 | The 20 voices sprint, youth gap (only 3 elder quotes in youth category today) |
| The sentence — PICC's next 20 in Rachel's words | Part E8–E11 + Rachel workshop Slide 12 | Experience 5 (the canvas) |
| Elder approval process for public content | Part F7–F9 | Every experience above |
| Which PICC-only services to keep/retire/fold | Part B Tier 2 | Clean service list in every page |
| Typo: `children-s-lunch-progam` | Part B Tier 2 (flagged as her call) | Cosmetic, low priority |

**What this means:** the Narelle interview isn't a nice-to-have. It is the unlock for at least 4 of the 5 walkthrough experiences above. Book it.

---

# Part 5 — What PICC data can push back into EL v2

The user asked: "use all the PICC data in here to support `/Users/benknight/Code/empathy-ledger-v2`." Here's the honest account of what PICC mirror holds that EL canonical could benefit from.

## 5A. Content to push upstream

| PICC Table | Rows | Action for EL v2 |
|---|---:|---|
| `community_visions` | 6 | **Push to EL canonical** — these are PICC's forward intent statements, EL should hold them as canonical |
| `governance_achievements` | 80 | **Push to EL canonical** — multi-year, categorised; EL's `timeline.md` is a spine but these are the richer row-level achievements |
| `report_highlights` 2024-25 | 8 | **Push to EL canonical** — for the PICC org scoped to the 2024-25 report |
| `service_metrics` | 28 | **Reconcile with EL** — service metrics should live with EL canonical services |
| `story_timeline_events` | 24 | **Push to EL canonical** — links between stories and years are sovereign content |
| `interview_segments` | 2,036 | **Confirm EL holds these** — the raw capture material must live in EL as source of truth |

## 5B. EL v2 archive to pull downstream

| EL v2 Source | What's there | Action for PICC |
|---|---|---|
| `docs/15-reports/picc-annual-reports/timeline.md` | 17-year growth table in markdown | **Import to PICC `organization_history` or `annual_reports`** so it drives the Year-by-Year Walk page |
| `docs/15-reports/picc-annual-reports/years/*.md` | 17 per-year summaries | **Import as `annual_reports` rows** for years PICC doesn't yet have in the DB |
| `docs/15-reports/picc-annual-reports/methodology.md` | Extraction methodology | Reference — helps Narelle and Rachel understand how the summaries were produced |
| Storage: `annual-reports/{org_id}/{year}.pdf` | Original PDFs for all years | Already accessible via signed URL — link from the walk page |

## 5C. Scripts that already exist (don't rewrite)

EL v2 has working PICC scripts:

- `scripts/generate-picc-report.mjs` — annual report generation from EL
- `scripts/upload-picc-videos.mjs` — video upload helper
- `scripts/sync-palm-island-media.mjs` — media sync
- `scripts/extract-all-pdfs.ts` — how the year files were extracted

**Recommendation:** Before building new sync tooling in the PICC platform, read these scripts and extend them if they fit. The principle from the repo memory is clear — EL is the source of truth for services, projects, voices.

---

# Part 6 — What to walk Rachel through in 20 minutes

A tight tour using the live dev server (`http://localhost:3000`). In order:

| # | Minutes | URL | What to show |
|---|---:|---|---|
| 1 | 2 min | `http://localhost:3000/` | The front door — first impression |
| 2 | 3 min | `http://localhost:3000/services` | 30 integrated services with real descriptions, real metrics, EL voices matched to 7 newly-fixed services |
| 3 | 3 min | `http://localhost:3000/services/bwgcolman-way` | The anchor of the 20-year story — already a service page, becoming a case study |
| 4 | 3 min | `http://localhost:3000/elders/voices-on-country` | The proof of concept for community voice at scale |
| 5 | 2 min | `http://localhost:3000/20-years` | The current 20-year page — show what's there, show the gap |
| 6 | 3 min | `http://localhost:3000/picc/launchpad` | The CEO-review of the Launchpad strategic plan |
| 7 | 2 min | `http://localhost:3000/picc/reports/builder` | The audience-targeted annual report generator |
| 8 | 2 min | This document | The five walkthrough experiences and what's needed to build each |

## What Rachel should come out of the walkthrough with

1. **Confidence that the data is real.** Every number on screen comes from a query, not a mockup.
2. **Clarity on the five experiences.** Five concrete things we can build from what already exists.
3. **A ranking.** Which of the 5 experiences ships first for the celebration? (Ben's recommendation: Experience 1 — the Year-by-Year Walk — because it's the highest-leverage and the data is already there.)
4. **The unlock list.** The 10 Narelle-interview-dependent gaps in Part 4. Narelle interview becomes non-negotiable after seeing this.
5. **A green light** on the Bwgcolman Way case study as the anchor of Experience 2.

---

# Part 7 — The next-20 in one paragraph, drafted from the data

A first draft of Rachel's sentence, built from the 6 approved community visions + the Launchpad commitments + the Bwgcolman Way arc. **This is not final. It is a starting point for Rachel to rewrite in her own voice during the workshop.**

> *In the next 20 years, PICC will build the community-controlled infrastructure Palm Island needed all along. By 2028, aged care on Palm — so our Elders never have to leave Country again. By 2030, Bwgcolman Way expanded beyond child safety into health and justice — the first Indigenous-led delegated authority across three domains in Australia. By 2029, Palm Island running its own hospital, its own school, its own economy — because we have the people, we just needed the opportunity. And by 2045, every Palm Island story captured, consented, and sovereign — so the next generation inherits not just the buildings we built, but the voices that built them. Not the problems. The solutions.*

The italicised phrases are direct lifts from the 6 approved `community_visions` rows. Rachel owns the rewrite.

---

# Appendix — Where each number in this brief came from

Every claim in this document is sourced. This appendix lets Narelle or Rachel verify anything.

| Claim | Source | How to re-verify |
|---|---|---|
| 30 active services | `organization_services WHERE is_active=true` | `SELECT COUNT(*) FROM organization_services WHERE is_active=true` |
| 9 projects | `projects` | `SELECT COUNT(*) FROM projects` |
| 53 published stories | `stories WHERE status='published' AND access_level='public'` | Query ran 10 April 2026 |
| 162 elder quotes | `elder_quotes WHERE permission_level IN ('public','community')` | All public-level |
| 290 extracted quotes | `extracted_quotes` | Total count |
| 6 community visions | `community_visions WHERE is_approved=true` | All 6 verbatim in Part 3 Experience 5 |
| 53 timeline events | `timeline_events` | Full arc 1914→2024 |
| 80 governance achievements | `governance_achievements` | Multi-year |
| 2,508 media files | `media_files WHERE deleted_at IS NULL` | 2,491 photos + 17 videos |
| 34 interviews / 2,036 segments | `interviews` / `interview_segments` | Raw capture layer |
| 474 knowledge entries | `knowledge_entries` | Platform KB |
| 8 highlights for 24/25 | `report_highlights JOIN annual_reports WHERE fiscal_year='2024-25'` | All 8 listed in Part 1A |
| Staff 1→197, Rev $1.6M→$23.4M | `/Users/benknight/Code/empathy-ledger-v2/docs/15-reports/picc-annual-reports/timeline.md` | 17-year table |
| Rachel Atkinson CEO 2007–present | EL v2 `timeline.md` + PICC `governance_achievements` | Cross-referenced |

---

*Draft v1 · 10 April 2026 · Ben · Slots into the PICC-Narelle-Rachel-Workshop vault as doc #7. Feeds the Rachel workshop agenda (`PICC-Rachel-Workshop-Slides.md`) and is the evidence layer behind every decision in the Launchpad plan.*
