# Next-Phase Prompt · PICC Annual Report Template Engine

**Created:** 2026-04-16
**For:** The next Claude Code session (or developer) picking up this track
**Last session ended at commit:** `18ad1ac3` on `Acurioustractor/palm-island-repository` main

---

## Paste-ready prompt for the next session

> Continuing the PICC Annual Report + Recipe Engine work. In order, read these three design docs first (in `web-platform/thoughts/shared/handoffs/`):
>
> 1. `2026-04-15-photo-tagging-audit.md` — how the consent pipeline works (122 photos elder-approved in EL v2)
> 2. `2026-04-16-report-recipe-engine.md` — the recipe format, audience personas, section library, three worked recipes
> 3. `2026-04-16-always-on-to-print-architecture.md` — how the data archive feeds always-on web + printable PDF + Pencil design master, and the five gaps remaining
>
> Also glance at the three recipe YAMLs in `web-platform/thoughts/shared/recipes/`.
>
> **The annual report design itself is complete** — 23 dense spreads in `web-platform/picc-annual-report.pen` at y=10,000 → 14,500 in reading order, using real EL v2 data (Rachel + Luella full messages from their Empathy Ledger interviews, 16-voice community wall, Elders On Country double-page, native data-driven infographics for Financial + Services + Journey + Year 17 + Bwgcolman Way + Looking Forward). The `.pen` file is gitignored — open it in Pencil desktop.
>
> **Priority work for this phase, in order:**
>
> 1. **Fix the PDF font-load bug.** Backlog detail in `2026-04-15-pdf-render-backlog.md`. Seven deploys last session narrowed the issue — the lambda hangs inside React-PDF 4.3.2's `_load()` decoding data URLs via `atob().split('').map(...)` — which is O(n) with enormous string allocations for 11 × 330KB TTFs. Workaround attempted (prefetch to `/tmp`) but Next.js still hangs. The next-session entry is documented: downgrade `@react-pdf/renderer` to v3 OR inline TTFs as base64 TS constants in a file webpack can trace. Do NOT waste cycles on `outputFileTracingIncludes` — the project is Next 14.2.33 where it's silently ignored. Reproduce locally first with `cd web-platform && vercel env pull .env.local --yes && npm run dev`, then hit `http://localhost:3000/api/pdf/generate?type=annual-report&audience=community`.
>
> 2. **Build the unified `/picc/content` recall page.** One search input across 1,048 quotes + 236 stories + 2,636 photos + 44 storytellers in EL v2. All underlying APIs exist — `/api/public/voices`, `/api/public/stories`, `/api/public/storyteller/:id`, `/api/photos?slot=…`. The React page does union-query + grouped results + drag-select into a draft recipe. Mock at the bottom of the architecture doc. Estimate: 2 days of React + Tailwind composition.
>
> 3. **Bind Recipe YAML to `/api/pdf/generate`.** The engine reads a recipe id → fetches the right data → renders the PDF. Today `/api/pdf/generate?type=annual-report&audience=community` works against a hardcoded section list. Extend to `?recipe=bwgcolman-way--community--year-17` where the recipe name matches the YAML file. 1 day.
>
> 4. **Parametrize `AnnualReportPDF.tsx` sections.** Today one monolithic template. Refactor so `featured_service(service_id)`, `person_message(person_id)`, `community_voices_wall()`, `elders_on_country()`, `theme_essay(theme_id)` are reusable sections that take params and render 1–N pages. Recipe drives the composition. 2 days.
>
> 5. **(Later) Live Pencil ↔ data binding.** Stretch. Pencil images are currently embedded at design-time; making them pull from `/api/photos` at render-time is possible but requires a Pencil bridge.
>
> **Key constants to remember:**
> - PICC org id in EL v2: `084f851c-72e0-41fb-b5ba-f3088f44862d`
> - EL v2 tenant id: `9eb91d66-2286-4810-a04a-311d4cdb4631`
> - Shared secret: `PICC_API_KEY` (EL v2) / `EL_V2_API_KEY` (PICC) — use `printf "%s"` not `echo` when setting
> - 122 photos consent-cleared across 19 slots — slot tags like `picc:slot:cover`, `picc:slot:voices-wall`, `picc:slot:feature-first-1000-days`
> - Deep-quote search: extracted_quotes.author_id linkage is sparse; use `author_name ILIKE '%name%'` instead (surfaced 10+ Ethel quotes we thought didn't exist)
>
> **What NOT to do:**
> - Don't rebuild the annual report design — it's done and Rachel-Narelle will review the `.pen`
> - Don't touch consent: all approvals came from Ben on 2026-04-15 with verbal Elder sign-off; do not auto-approve new photos without the same confirmation
> - Don't commit binary assets to git (photos in `web-platform/public/icons/picc/photos/`) — stay local per the asset management rule in `CLAUDE.md`
> - Don't waste time on `outputFileTracingIncludes` in `next.config.js` — the Next 14 syntax is silently ignored
>
> **First action when you start:** `cd /Users/benknight/Code/Palm Island Reposistory && git log --oneline -20` to see the most recent commits, then scan the three design docs, then pick task #1.

---

## Session 2026-04-15 → 2026-04-16 · what shipped

### Consent pipeline (ended 2026-04-15)
- Audit found 2,611 PICC photos in EL v2 `media_assets`, 0 elder-approved
- Curated shortlist of 138 candidates generated via scoring
- 122 photos auto-approved with Elder sign-off confirmed verbally
- 25 storyteller profile images ingested as `media_assets` rows (Voices Wall needed them)
- Gemini 2.5 Flash re-tagged 167 fy-only or placeholder photos (free tier, 28 min)
- `/api/photos?slot=<name>` shipped on EL v2 with shared-secret + middleware allowlist
- Env vars set on both Vercels, deploys live

### Annual Report design (2026-04-15 → 2026-04-16)
- 10 hand-drawn icons + 5 motifs + 8 infographics via Gemini 2.5 Flash Image (warm-paper ink style, NOT Aboriginal art pastiche)
- 23 dense spreads in `picc-annual-report.pen` using real EL v2 data
- Native data-driven graphics replaced six decorative images: Financial donut (60/26/10/4 real segments), 30-dot Services cluster, river timeline with staff-sized dots, 4-star Constellation, before/after Bwgcolman Way panels, 3-band Looking Forward
- Double-page spreads for Community Voices (16 voices, 12 verified quotes) and Elders On Country (hero photo + 4-tile photo+quote grid)
- Rachel + Luella messages composed from their actual Empathy Ledger interviews (8 quotes each)
- All 23 spreads reordered into sequential reading order at y=10,000 → 14,500
- Visual polish sweep: 6 duplicate image frames deleted, Year 17 contrast improved

### Architecture (2026-04-16)
- `2026-04-16-report-recipe-engine.md` — recipe format, 8 audience personas, 6 focus types, section library, 3 worked recipes, 4-phase implementation path
- `2026-04-16-always-on-to-print-architecture.md` — full data → API → web + print flow, gap list
- 3 recipe YAML files: First 1,000 Days for Commonwealth DSS · Bwgcolman Way community celebration · Self-determination sector paper

### Open bugs / deferred
- PDF render still hangs on fonts (documented)
- `/picc/content` unified recall page not built (2d)
- Recipe → PDF binding not wired (1d)
- `AnnualReportPDF.tsx` not yet parametrized by section (2d)

---

## Memory that survives across sessions

Auto-memory in `/Users/benknight/.claude/projects/-Users-benknight-Code-Palm-Island-Reposistory/memory/`:

- `feedback_vercel_env_newlines.md` — use `printf` not `echo`
- `feedback_react_pdf_vercel.md` — React-PDF v4 font-load dead-ends (avoid repeating)
- `project-el-photo-pipeline.md` — PICC → EL v2 photo pipeline constants + scripts

Plus `MEMORY.md` index in that same directory.

---

*When you pick this up next, read the three design docs first, confirm the priority order with Ben, then ship task #1 (PDF font bug). The content and architecture are ready — what's missing is the wiring to let any PICC staff member generate any report on any morning.*
