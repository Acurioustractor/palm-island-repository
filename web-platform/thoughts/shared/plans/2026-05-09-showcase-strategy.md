# Showcase Strategy — what's been, what's coming

## The diagnosis

The platform has an enormous amount of data and ~50 surfaces. Every
surface tells a piece of the story. The problem isn't lack of data;
it's that the data is scattered across 30+ admin pages and 20+ public
pages with no single screen that shows **the whole**.

Today an operator (you, Narelle, Cassie) has to:
1. Open /picc to see command centres
2. Open /picc/dashboard for stats
3. Open /picc/services/coverage to see gaps
4. Open /picc/projects/coverage to see project gaps
5. Open /picc/voices for the storyteller list
6. Open /picc/library to see research sources
7. Open /picc/vision to see goals
8. Open /picc/annual-reports for the report workflow

That's 8 tabs to answer "what's on the platform right now and what
needs attention?" The answer should fit on one screen.

---

## The mental model

The platform is a **knowledge organism**. It has 5 metabolic
processes, each with input → store → output:

| Mode | Input | Store | Output |
|---|---|---|---|
| **CAPTURE** | voices, photos, stories submitted | EL canonical archives | quotes, faces, transcripts |
| **CURATE** | editorial review, brand voice, Elder approval | featured_themes, is_featured flags | tightened public surfaces |
| **CONNECT** | shared photos, shared themes, shared services | storyteller_connections, slug joins | network graph, profiles, theme tiles |
| **DIRECT** | community visions, strategic goals, innovation projects | community_visions, organization_goals, innovation_projects | next-20 commitments, vision board |
| **PUBLISH** | tightened content + tracked goals + visions | annual_reports, publications, research_sources | printed report, atlas, showcase |

Every page on the platform belongs to one of these modes. The
showcase plan is to surface ALL FIVE on one screen, with the right
density and the right action affordances.

---

## What we have today (audited 2026-05-09)

### Data
- **58** named storytellers (42 with photos, 16 historical/ancestral)
- **978** quotes attributed (curated + extracted)
- **162** elder quotes
- **400+** consented photos
- **26** active services (23 with covers, 3 missing)
- **10** projects (4 with covers, 6 missing)
- **5** innovation projects (3 active, 2 planning)
- **92** stories, 74 public
- **593** themes (6 featured, ~80 above the noise floor)
- **6** community visions (next-20 canvas)
- **7** strategic 2029 goals (just seeded)
- **13** research sources (just deduped)
- **3** annual reports in mirror, **16** more in EL archive only
- **2,508** media files, **474** knowledge entries

### Code surfaces (audited)
- 30+ operator admin pages under /picc/*
- 20+ public pages
- Every sidebar route returns 200, every API endpoint returns real data
- AI brand-voice description drafter live
- AI chat ("Ask Palm") live
- Annual report PDF builder (Pencil-primary; React-PDF for small bookmarks)

### What's been fixed this session
16 PRs: themes from EL canonical · service↔project linkage ·
storyteller↔service prominence · /get-involved hub · /picc/walk
presenter map · vision board schema fix · /sign-the-vision form fix ·
sidebar copy alignment · /picc/library filter+search+expand · 19-year
annual report timeline · OG metadata on every page · brand-voice AI
drafter · featured_themes seeded · audience-safe walk toggle.

---

## What's broken or incomplete (the honest list)

### Content (Narelle, in EL admin)
| Item | Count | Owner |
|---|---|---|
| Service covers | 3 missing (fc · 1000d · enterprises) | Narelle |
| Project covers | 6 missing | Narelle |
| DRAFT descriptions | 4 services, 0 projects | Narelle (use AI drafter) |
| Project taglines | 10 missing (all empty) | Narelle (use AI drafter) |
| Storyteller photos | 1 (Tammy) + 3 generic Team entries | Narelle |
| Annual report capture | 16 of 19 only in EL archive | Narelle / Cassie |
| Research source verification | 4 of 13 awaiting | Cassie |

### Code (build queue)
| Item | Effort | Priority |
|---|---|---|
| /picc/canvas — unified single-screen dashboard | 1 day | **HIGH** (this PR) |
| AI cover-photo suggester | 2 days | medium (after Tuesday) |
| Family-tree / kinship surface | 3 days | low (parked) |
| EL canonical migration Phase 2-5 (elders, quotes, trips, drop legacy) | 1-2 weeks | medium |
| Pencil → annual report finalisation | content + design | **HIGH** (you, in Pencil) |

### Decisions
1. Directors without photos — backfill or hide?
2. Upload Pencil-exported PDF to /annual-reports public download — yes/no?
3. /elders/trips upcoming-trip page — stub or skip?

---

## The plan — three horizons

### H0 · Tuesday (this week)
**Goal**: clean walk-through, every signal visible.

- Build **/picc/canvas** — unified single-screen dashboard
- /picc/walk?audience=true for the projector
- Pencil annual report opens cleanly
- Decisions made on the 3 above
- All 9 EL admin content tasks complete (or knowingly held)

### H1 · Next two weeks
**Goal**: every public surface has zero broken/missing signals.

- AI cover-photo suggester (closes the gap on the 9 missing covers)
- Phase 2 EL canonical migration (Elders profiles → EL `is_elder`)
- Annual report Pencil export uploaded to /annual-reports
- /elders/trips upcoming page if the data lands
- 16 missing annual reports captured into PICC mirror table

### H2 · Next quarter
**Goal**: publish-grade. The platform is the single source of truth
for every external claim PICC makes.

- Full kinship / family-tree visualization
- Phase 3-5 EL canonical migration (curated quotes, trips as projects, drop legacy tables)
- AI-assisted theme curation (auto-feature themes when they cross a quote-count threshold)
- Photo provenance dashboard (every photo traces to the storyteller(s) depicted, the photographer, the date, the consent path)
- Live financial dashboard pulling FY24-25 audited numbers
- Service↔project↔innovation linkage graph (replaces the soft shared-storyteller bridge with explicit relationships)

### H3 · 12-month vision
**Goal**: PICC is the reference build for community-controlled
storytelling infrastructure. Other ATSICCOs spin it up in days, not
months.

- White-label / template version of the platform
- Public API for cross-org research (already partially in place via EL)
- Annual report as a generative product (Pencil + AI = first draft in
  minutes, not weeks)
- Sovereignty checklist baked in (every surface enforces consent +
  cultural protocol + provenance)

---

## How the canvas changes the day

The proposed /picc/canvas page is the bridge between H0 and H1. It
takes every signal we already track and makes it visible on one
screen, sectioned by the 5 metabolic modes:

### Section 1: TODAY — what's live
- Live counts strip (one row, every key number)
- 7 strategic goals progress bars (already on /picc/vision)
- 6 community visions (already on /sign-the-vision)
- Top 5 themes with quote counts (already on /voices/themes)
- Top 5 newest storytellers / photos / quotes / stories

### Section 2: GAPS — what needs attention
- Service coverage map: 3 missing covers · 4 DRAFT descriptions · 2 thin
- Project coverage: 6 missing covers · 10 missing taglines
- Storyteller backfill: 1 named missing photo + 3 generic Team entries
- Annual report capture: 16 of 19 in EL archive only
- Research sources awaiting verification: 4

### Section 3: PIPELINE — what's coming
- 5 innovation projects with status + progress
- 2 in planning (Centre kitchen, recycling beds)
- 6 community visions surfaced as commitments
- 7 strategic goals — % toward 2029

### Section 4: KNOWLEDGE — the layered archive
- 92 stories · 74 public · grouped by type
- 162 elder quotes
- 290 extracted quotes from 34 interviews
- 474 knowledge entries
- 13 research sources (9 verified · 4 awaiting)
- 19 fiscal-year annual reports (3 mirrored · 16 in EL archive)

### Section 5: WHAT'S NEXT — the action queue
- Top 5 prioritised actions (mix of operator + content tasks)
- Each has an owner (you / Narelle / Cassie / Rachel)
- Each links into the right admin surface
- Pulled from the gap data above

This is the screen that answers "what state are we in right now?" in
under 30 seconds.

---

## How it shows up in the demo

- **CEO Tuesday**: walk picc.studio/atlas (audience-facing) AND
  picc.studio/picc/canvas (operator-side, on a second screen). The
  canvas is the proof: every signal is alive, every gap is named,
  every action is owned.
- **Funder one-on-ones**: bookmark canvas + /picc/walk?audience=true.
  Show the 7 goals, 6 visions, 5 innovation projects, 593 themes,
  978 voices. Dimensions of impact, not anecdotes.
- **Onboarding new staff**: the canvas is the first page they see.
  One screen replaces three weeks of "where do I find X?"
- **Board meetings**: print the canvas to PDF. The annual report is
  Pencil; the canvas is the live operating picture.

---

## The visualizations to build (priority order)

1. **Counts strip** — single row, 8-10 key numbers, animated up on load (already have AnimatedStat component)
2. **Goal progress bars** — 7 strategic targets toward 2029 (already on /picc/vision)
3. **Coverage matrix** — services × (cover · description · photos · stories · quotes) as a heatmap
4. **Theme cloud** — top 30 themes weighted by quote count (D3 word cloud or pill grid)
5. **Storyteller mosaic** — top 12 by quote count (already have the Bento on /voices)
6. **Innovation pipeline** — 5 cards with status + progress
7. **Annual report timeline** — 19 fiscal years left-to-right with status pills
8. **Action queue** — top 5 prioritized tasks with owners

Each is small. Together they make the canvas.

---

## Anti-patterns to avoid

- Another stack of admin links. The platform has enough.
- Tabs that hide things. The canvas is one continuous scroll.
- Static numbers. Every count is live; "Updated 30s ago" pill if needed.
- Chart for chart's sake. Every visualization answers a specific operator question.
- Audience-mode separation here. The canvas is operator-only —
  /atlas + /showcase are the audience views and they already exist.
