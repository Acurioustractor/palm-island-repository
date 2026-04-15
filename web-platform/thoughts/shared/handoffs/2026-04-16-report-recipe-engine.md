# PICC Report Recipe Engine — Design

**Date:** 2026-04-16
**Status:** Design proposal
**Sibling to:** `ANNUAL-REPORT-EDITORIAL.md` (editorial rules) · `PICC-BRAND-STYLE-GUIDE.md` (visual system) · `20-YEAR-BRAND-VISION.md` (horizon)

---

## Thesis

PICC holds **~4,000 individual content objects** in the Empathy Ledger archive: 1,048 extracted quotes, 236 stories, 137 transcripts, 2,636 media assets, 44 storytellers, 7 projects, 18 historical annual reports, 30 organisation services. The Annual Report 2024-25 uses maybe 5% of this.

The other 95% is not waste. It is **the raw material for every other report PICC will ever need to produce** — for a specific funder, a specific service, a specific project, a specific community moment.

This document proposes a **Report Recipe** format: a small declarative config that names an audience, a focus, a time window, and a depth. The engine renders a complete report by querying EL v2 + PICC Supabase and flowing the results into the existing React PDF template pipeline.

The same engine generates:
- The full 23-page annual report (the recipe: audience=board, focus=organisation, time=2024-25)
- A 4-page funder-facing brief on First 1,000 Days (audience=funder, focus=service:first-1000-days)
- A 6-page photo-led profile of Bwgcolman Way (audience=sector, focus=project:bwgcolman-way)
- A 2-page one-pager on what Henry Doyle's team does (audience=community, focus=person:henry-doyle)

---

## The recipe format

```yaml
# example: first-1000-days-for-commonwealth.recipe.yaml
report:
  title: First 1,000 Days — Health Outcomes Brief
  audience: funder-commonwealth        # enum: see below
  focus:
    type: service                       # service | project | person | theme | org | time-period
    id: first-1000-days-program
  time_window:
    from: 2023-07-01
    to: 2024-06-30
  depth: brief                          # brief (4pp) | standard (8pp) | deep (16pp+)
  language_register: formal             # warm | formal | clinical
  include:
    - stat_hero
    - service_description
    - delivery_numbers
    - community_voice
    - elder_framing
    - funder_accountability_statement
  exclude:
    - historical_timeline                # not relevant for this brief
  cover:
    photo_slot: feature-first-1000-days  # or a specific photo id
    title_override: "First 1,000 Days — Health outcomes 2023-24"
  branding:
    mode: standard                       # standard | 20-year | celebration
```

---

## Audience personas (and what each wants)

| Audience | Voice | Pages | Key content bias | Avoid |
|---|---|---|---|---|
| **funder-commonwealth** | Formal + specific | 4–8 | Outcomes data, compliance registrations, audited numbers, KPI deltas | Cultural narrative heavy; long Caveat quotes |
| **funder-state** | Formal + local | 4–8 | Queensland policy alignment, place-based evidence, partnership visibility | Same as above |
| **funder-philanthropic** | Warm + mission-led | 6–10 | Individual stories, named beneficiaries, theory of change | Heavy compliance tables |
| **board** | Formal + comprehensive | 16+ | Full governance · full financials · risks · succession · strategy | Nothing — board wants all of it |
| **community** | Warm + visual | 8–15 | Photos, voices, celebration, Elder voice, local names, bilingual framings | Acronyms · bureaucratic language |
| **supporter / public** | Warm + inspirational | 8–12 | Impact stories, big numbers in human terms, invitation to engage | Risk pages, compliance minutiae |
| **government / dept** | Formal + metric | 8–14 | Compliance, deliverables, service metrics, reporting requirements met | Elder voice heavy |
| **sector / ACCO peers** | Candid + methodological | 8–16 | How the model works, what was learned, what we would do differently | Funder pitch framing |

Each persona is a filter + a style overlay. The **same data** can produce a funder brief and a community celebration spread.

---

## Focus types

### `service`
- Pulls from `organization_services` filtered by id/slug
- Linked quotes via `service_story_links` · `service_metrics` · `service_grants` · `service_team_members`
- Photos tagged `picc:slot:feature-<service-slug>` in `media_assets`
- Example: First 1,000 Days, Bwgcolman Healing, BEAI, Digital Service Centre

### `project`
- Pulls from `projects` table (7 rows for PICC)
- Linked storytellers · commitments · timeline events
- Example: 20-Year Book, Palm-led economy, Bwgcolman Way statewide

### `person`
- A single storyteller profile
- Bio + photo + all their validated quotes + stories they appear in
- Role: can be Elder, CEO, Chair, staff, community member
- Examples: Rachel Atkinson, Luella Bligh, Aunty Ethel, Henry Doyle

### `theme`
- Pulls quotes filtered by theme in `extracted_quotes.themes`
- Examples: stolen_generations · connection_to_country · self_determination · intergenerational_healing
- Becomes a thematic essay pulling Elder voices across many interviews

### `time-period`
- Year or era scoped
- Pulls from `annual_report_timeline`, milestones, service launches within window
- Example: "2020-2024: How services integrated"

### `org` (default, = full annual report)
- The traditional annual report — 23-page flagship
- All sections of the editorial spine

---

## The data sources

| Content type | Where it lives | Count | Selection criteria |
|---|---|---|---|
| **Storyteller profiles** | `el.storytellers` (EL v2) | 44 PICC-linked | `is_elder` / `is_featured` / category tags |
| **Validated quotes** | `el.extracted_quotes` | 1,048 PICC | `is_featured` · `themes @>` · `author_name` · `service_id` |
| **Stories** | `el.stories` | 236 PICC | Service tags · storyteller · themes |
| **Approved photos** | `el.media_assets` via `/api/photos` | 122 consent-cleared | `cultural_tags @>` slot tags |
| **Transcripts** | `el.transcripts` | 137 PICC | For deeper narrative extraction (source material) |
| **Service descriptions** | `picc.organization_services` | 30 active | `is_active` · `service_category` |
| **Service metrics** | `picc.service_metrics` | varies | Per-service KPIs |
| **Historical annual reports** | `el.annual_reports` | 18 | Precedent · 2023-24 signed numbers |
| **Board members** | `el.storytellers` filtered on bio | 7 directors | bio contains "director" or "board" |
| **Infographic templates** | `.pen` file Graphic Library | 8 forms | Data-driven native Pencil shapes |

---

## The rendering layers

```
┌─────────────────────────────────────┐
│   Recipe (YAML/JSON)                │
│   audience · focus · time · depth   │
└─────────────┬───────────────────────┘
              ▼
┌─────────────────────────────────────┐
│   Selector                          │
│   fetch relevant content objects    │
│   rank + filter + deduplicate       │
└─────────────┬───────────────────────┘
              ▼
┌─────────────────────────────────────┐
│   Composer                          │
│   choose section sequence           │
│   allocate pages per section        │
│   obey editorial rules (Rule 1-6)   │
└─────────────┬───────────────────────┘
              ▼
┌─────────────────────────────────────┐
│   Renderer                          │
│   React PDF (lib/pdf/templates/)    │
│   uses TaggedPhoto + infographics   │
└─────────────┬───────────────────────┘
              ▼
       <output>.pdf
```

The **Selector** and **Composer** layers are what's NEW. The **Renderer** already exists — `web-platform/lib/pdf/` has a working React PDF pipeline (once the font-load bug is fixed).

---

## Section library (the building blocks)

Each section is a function `(recipe, data) → PDF page(s)`. Reused across recipes.

| Section | Input data | Typical pages |
|---|---|---|
| `cover` | photo slot + audience subtitle | 1 |
| `acknowledgement_of_country` | horizon photo + (optional) audience wording | 1 |
| `contents` | auto-generated from subsequent sections | 1 |
| `ceo_message` | person:rachel-atkinson quotes + portrait | 1–2 |
| `chair_message` | person:luella-bligh quotes + portrait | 1–2 |
| `year_in_numbers` | 4 hero stats from annual_reports + services | 1 |
| `bwgcolman_way_flagship` | before/after graphic + 2 Ethel quotes | 1 |
| `our_journey` | river timeline with staff-sized milestone dots | 1–2 |
| `financial_summary` | saltwater rings donut + YoY + Rachel quote | 1 |
| `services_at_a_glance` | 30-dot cluster + delivery numbers | 1 |
| `community_voices_wall` | 4×4 or 4×6 photo+quote grid | 1–2 (spread) |
| `governance` | chair + directors + guardrails | 1 |
| `featured_service` | photo hero + stats + staff voice (repeats per service) | 1 per service |
| `elders_on_country` | photo essay + Elder voices | 2 (spread) |
| `looking_forward` | commitment bands + horizon dates | 1 |
| `compliance` | registrations table | 1 |
| `risks` | 8-risk grid + framing quote | 1 |
| `with_thanks` | community / people / funders / team sections | 1 |
| `back_cover` | constellation + mission + ABN | 1 |
| **NEW: `theme_essay`** | all quotes tagged with theme, sequenced | 2–6 |
| **NEW: `person_profile`** | single storyteller deep-dive | 2–4 |
| **NEW: `project_spotlight`** | project + linked storytellers + timeline | 2–6 |
| **NEW: `service_deep_dive`** | service + all related quotes/stats/stories | 3–6 |
| **NEW: `service_directory_table`** | all 30 services with metrics | 1–2 |
| **NEW: `impact_map`** | geographic/social reach visualisation | 1 |
| **NEW: `funder_accountability`** | outcomes vs deliverables table | 1–2 |

---

## Three worked recipes

### Recipe 1 — **Commonwealth DSS brief · First 1,000 Days · 2023-24**

```yaml
report:
  audience: funder-commonwealth
  focus: { type: service, id: first-1000-days-program }
  time_window: { from: 2023-07-01, to: 2024-06-30 }
  depth: brief
  sections:
    - cover                         # 1p
    - acknowledgement_of_country    # 1p
    - service_deep_dive             # 3p (what · numbers · outcomes)
    - funder_accountability         # 1p (compliance + KPIs)
    - back_cover                    # 1p
  tone: formal
  emphasis: outcomes, clinical evidence, partnership visibility
```

**Output:** 7 pages. No Caveat headers. Compact stat tables. Single Elder endorsement quote. Funder contact footer.

### Recipe 2 — **Community celebration · Bwgcolman Way · Year 17**

```yaml
report:
  audience: community
  focus: { type: project, id: bwgcolman-way }
  time_window: { from: 2007-01-01, to: 2024-06-30 }
  depth: standard
  sections:
    - cover                         # full-bleed mural or gathering photo
    - acknowledgement_of_country
    - elders_on_country             # 2p photo essay
    - bwgcolman_way_flagship        # 1p flagship
    - our_journey                   # 2p timeline
    - community_voices_wall         # 2p spread
    - looking_forward
    - with_thanks
    - back_cover
  tone: warm
  emphasis: Elder voices, celebration, place, continuity
```

**Output:** 12 pages. Caveat headers throughout. Turtle Red borders on Elder quotes. Photo-heavy. In Bwgcolman voice.

### Recipe 3 — **Sector paper · How community control works**

```yaml
report:
  audience: sector
  focus: { type: theme, id: self_determination }
  time_window: { from: 2007-01-01, to: 2024-06-30 }
  depth: deep
  sections:
    - cover
    - acknowledgement_of_country
    - theme_essay                   # 4p — all self_determination quotes, sequenced
    - bwgcolman_way_flagship
    - governance                    # 1p — community-controlled structure
    - risks                         # 1p — what we carry
    - financial_summary             # 1p — how money follows mandate
    - project_spotlight             # 4p — 20-year arc
    - looking_forward
    - with_thanks
    - back_cover
  tone: candid-methodological
  emphasis: how + what-we-learned, not celebration
```

**Output:** 16 pages. Mixed voices. Includes methodology notes and footnotes.

---

## Engine implementation path

### Phase 1 — manual Pencil templates (now)
Every section exists as a frame in `picc-annual-report.pen`. A designer hand-picks sections into a new `.pen` for each audience. Slow but works today. 23 spreads already built.

### Phase 2 — Recipe JSON + manual Pencil composition (4 weeks)
Write recipes as YAML, human hand-places the spreads into a new `.pen` following the recipe. Recipe is a brief for the designer, not yet automated. Benefit: consistency, documented audience patterns, no code.

### Phase 3 — React PDF recipe engine (2 months)
`web-platform/lib/pdf/templates/RecipeReportPDF.tsx` takes `{ recipe, data }` and renders. Reuses the section components already written for the annual report (refactor each spread into a reusable section). `/api/pdf/generate?recipe=<id>` serves any recipe.

### Phase 4 — Recipe UI (open-ended)
A `/picc/reports/builder` page in PICC web where staff pick audience + focus + time via dropdowns, see a preview, and download. This is where the "spin up reports anytime" lands.

---

## What this requires from the data layer

Already in place:
- ✅ `/api/photos?slot=<name>` on EL v2 (consent-filtered)
- ✅ `extracted_quotes` with `themes`, `author_name`, `service_id`, `is_featured`
- ✅ `storytellers` with `is_elder`, `is_featured`, `profile_image_url`
- ✅ `stories`, `transcripts` (unused so far but queryable)

Needs to be built:
- Stories → service linking (some exists via `service_story_links`)
- Project → quote → photo linking
- Theme → service mapping
- Quote → moment/event linking (for timeline reports)
- "Storyteller featured work" — top 3 stories per person, curated

---

## 20 spreads inventory — what's already a section

Current `picc-annual-report.pen` spreads that map cleanly to `sections/`:

| Spread id | Section name | Reusable? |
|---|---|---|
| `pQZZX` Cover | `cover` | ✅ params: photo + subtitle |
| `WIyhs` Acknowledgement | `acknowledgement_of_country` | ✅ |
| `UNmRP` Contents | auto-generated | ✅ |
| `PQPPx` CEO Message | `person_message` (Rachel) | ✅ params: person id |
| `1cNee` Chair Message | `person_message` (Luella) | ✅ |
| `0eq4I` Year 17 in Numbers | `year_in_numbers` | ✅ |
| `kjUI7` Bwgcolman Way | `bwgcolman_way_flagship` | ✅ |
| `JOvEu` Journey | `our_journey` | ✅ |
| `cGaCV` Financial | `financial_summary` | ✅ |
| `0WnsQ` Services | `services_at_a_glance` | ✅ |
| `zBumS` Voices Wall | `community_voices_wall` | ✅ double-page |
| `oTtjL` Governance | `governance` | ✅ |
| `HRveX` Bwg Healing | `featured_service(bwgcolman-healing)` | ✅ |
| `ht6rD` First 1000 | `featured_service(first-1000-days)` | ✅ |
| `CcAqN` BEAI | `featured_service(beai)` | ✅ |
| `bpXvp`+`AO7ma` Elders OC | `elders_on_country` spread | ✅ |
| `fy7j6` Looking Forward | `looking_forward` | ✅ |
| `QPEH6` Compliance | `compliance` | ✅ |
| `EihyD` Risks | `risks` | ✅ |
| `IBRsF` With Thanks | `with_thanks` | ✅ |
| `vZQsM` Back Cover | `back_cover` | ✅ |

**20 of 23 spreads are cleanly parametrizable sections.** The other 3 (Voices left page, Voices right page pre-consolidation, Elders OC pair) are already part of the double-page patterns.

---

## Next step — what I recommend

1. **Lock this design doc** with the team — Rachel + Narelle sign off on the 8 audience personas and the recipe format.
2. **Write the first 3 recipes as YAML** — start with the three examples above. One file each.
3. **Ship the Annual Report 2024-25** as `recipe:annual-report-2024-25-board.yaml` (the recipe that produces what we have today).
4. **Then** — move Phase 2 manual composition to prove the recipe format before investing in Phase 3 code.

Code investment only makes sense once the format is used 3+ times and patterns stabilise.

---

## What the data is telling us

We have **1,048 quotes** and used ~30. The next annual report iteration doesn't need more data — it needs a better way to SURFACE what's already there. The template engine is not a content problem; it is a selection problem.

*Voice carries equal weight to data, and visual restraint signals confidence.*

The recipe engine lets PICC say that 1,048 different ways, for 1,048 different audiences, from the same archive.
