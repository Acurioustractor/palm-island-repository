# Always-On Annual Report — Strategy + Roadmap

**Date:** 2026-05-12 (Day 2 of Palm Island visit · Wednesday CEO meeting)
**Owner:** Ben + Rachel + Narelle
**Status:** strategy locked, build in progress

---

## The pivot

The annual report is no longer a yearly PDF. It's a **living artefact** with two surfaces:

1. **Always-on web report** — `/annual-report/2024-25/almanac`. Pulls live from EL. Every visit shows current state.
2. **Saltwater Almanac (print)** — Pencil → A4 portrait → printer. Annual editorial artefact, audience-targeted.

Both surfaces share the same content. The web is a stream. The print is a snapshot.

---

## Why this matters

- **Old reports were screenshots in time.** This one keeps moving.
- **Audience-targeted from one source.** Same data, 5 cuts (community / funder / supporter / board / govt).
- **Community-controlled.** Every Elder voice has a consent gate (`requires_elder_approval` on extracted_quotes).
- **Print on demand.** A funder asks for a fresh report mid-year — print it from current data.

---

## The innovation layer — 3 directions

### 1. Continuous content — voices, photos, art keep flowing
- `/share-voice` → quote arrives in EL → admin reviews → publishes → next print picks it up
- `/share-art` → artwork submission → admin reviews → published to bespoke icon library → next service page features it
- `/share-note` → field note → links to meeting / story
- `/picc/meetings/process` → meeting transcript → action items → linked to projects → next print includes "what we said, what got done"

**No "report cycle." Just a continuous capture loop with a print event.**

### 2. Print on demand — multiple form factors

| Format | Audience | Cadence |
|---|---|---|
| **Saltwater Almanac (full 27pp)** | Board / annual moment | Yearly |
| **Funder cuts (~12pp)** | Specific funders | On demand per funder |
| **Community pamphlet (~6pp)** | Community AGM | Quarterly |
| **Kids' picture book** | Schools / kids in services | On demand, by topic |
| **Monthly snapshot** | Subscribers / staff | Monthly via email |
| **Trip storybook** | After each Elders trip | Per trip (e.g. Atherton Tablelands 2026) |

Each cut pulls from the same EL + meetings + action_items data. The Pencil v2 grammar (Cartouche · Reliquary · Lantern · Hearth) provides the visual vocabulary.

### 3. Community as makers — kids' books

- Young people choose a topic (a service, an Elder, a place)
- They contribute drawings, quotes, photos via `/share-art`, `/share-voice`
- Admin assembles a small book (~12 pages) using the Pencil component library
- **Print on demand** via Lulu / Blurb / local print partner
- Every kid who contributes gets a free copy
- Books become teaching tools, gifts, gentle proof

This isn't a side project — it's how the report becomes generative instead of extractive. Kids own it.

---

## What exists today

### Codebase (✅ live)
- `/annual-report/2024-25/almanac` — live web report
- `/annual-report/live` — always-on report shell (audience-targeted)
- `/annual-report/[year]` — historical reports
- `/picc/annual-reports` — admin list
- `/picc/annual-reports/[id]` — admin detail
- `/picc/almanac/checklist` — pre-publish status
- `/picc/almanac/photos` — photo slots, swap from EL
- `/picc/almanac/photos/reference` — slot key documentation
- `/picc/almanac/voices` — 20-voice sprint tracker
- `/picc/almanac/videos` — video slot management
- `/picc/almanac/preview` — full-page preview
- `/picc/almanac/services-coverage` — per-service traffic-light status
- `/share-art`, `/share-voice`, `/share-story`, `/share-note` — public capture
- `/picc/meetings/*` — bi-monthly meeting capture pipeline
- `/picc/action-items` (+ `/board`, per-item detail) — accountability ledger
- `/picc/trips/atherton-tablelands-2026` — trip planner

### Pencil (✅ designed)
- 22 v2 SPREAD frames covering the whole 27-page Almanac
- 19 reusable components (Stat Cards, Callouts, Quote Cards, Photo Layouts, Service Cards, Donut, Data Table)
- Design System frame
- PICC Graphic Library frame (icons + motifs)
- 1 video frame "Many tribes, one people"

### Pencil (🚨 gaps)
- **Old v1 frames at top of canvas** — still visible, confuses the canvas. Need to be archived or relabeled.
- **Variables not defined** — the .pen has zero design tokens. Colours are hardcoded per element. Needs Pencil-side import of tokens from `picc-almanac-web.pen`.
- **Caveat used for display titles** — should be Fraunces. Caveat is reserved for MarginNotes per BRAND.md.
- **Photo slots show checkered placeholders** — need to wire to EL photo URLs (or paste the image fills directly).

### NEW — built today (`/picc/annual-report` hub)
- Single command center for the always-on annual report
- Surfaces: spreads checklist · live data status · voices stream · artwork inbox · updates feed
- Print actions: snapshot full · snapshot per audience · snapshot custom selection
- Links out to Pencil, EL, every existing admin sub-page

---

## Build plan — what ships when

### Today (Tue 2026-05-12 — visit Day 2)
- ✅ Audit Pencil .pen file — done
- ✅ Strategy doc (this file) — done
- ⏳ Build `/picc/annual-report` hub
- ⏳ Pencil canvas tidy — label v1 vs v2 cluster

### Wednesday (2026-05-13 — CEO + Narelle meeting)
- Walk live web almanac
- Walk Pencil v2 spreads (Cover → Acknowledgement → Year 17 → 1 Featured Service → Saltwater Rings)
- Walk `/picc/annual-report` hub — show how content flows in continuously
- Show the 3 innovation directions: continuous content, print on demand, community books
- Get sign-off on:
  1. Content (28-service list, financials, governance)
  2. Production schedule (when the Saltwater Almanac prints)
  3. Next phase build (community books module, monthly snapshot)

### Next 2 weeks (between visits)
- Pencil: import variables from `picc-almanac-web.pen`, swap Caveat → Fraunces on titles, archive v1 frames
- Codebase: build `/picc/books` MVP (kids' book builder)
- Wire EL photos into Pencil v2 service spreads
- Set up monthly snapshot pipeline (PDF-from-web → Supabase Storage → email link)
- Get one Saltwater Almanac printed (50 copies for board + Elders)

### Next bi-monthly visit (June)
- Run an Elders meeting through the cadence
- Process meeting → action items → linked to spreads
- Print first community books with 2 schools
- Send first monthly snapshot to subscribers

---

## Decision asks for Wednesday

| Decision | Owner | What we need |
|---|---|---|
| 28-service list final lock | Narelle | yes/no |
| Cultural review schedule for Saltwater Almanac | Elders Group | dates |
| CEO message sign-off | Rachel | sign |
| Chair message sign-off | Luella | sign |
| Print partner + run quote | Mark / procurement | quote + lead time |
| Community books pilot — which school first? | Narelle + community | nominate |
| Funder for monthly snapshot subscription model | Rachel | identify |
| Photo capture during this visit (16 gaps) | Photographer | brief now |

---

## The line that holds it all together

**The annual report doesn't get written. It gets captured.**

Every photo that lands in EL · every voice that gets recorded · every meeting action item that gets ticked off · every kid's drawing that comes through `/share-art` — feeds the report.

The print event is just *"what was true on this date, in this audience's voice."*

That's why this is innovative. Old reports performed at funders. This one belongs to the community that made it.
