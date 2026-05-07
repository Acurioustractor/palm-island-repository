# AGENTS.md — PICC project

*The playbook. How the agent operates inside the Palm Island Community Company repository. Project-level overlay on `~/agent-constitution/AGENTS.md`.*

The global AGENTS.md still holds. This file says what changes when the work is PICC. Read as a checklist.

---

## ⚠️ Pencil-first for the FY24-25 annual report (locked 28 April 2026)

**The annual report is built in Pencil, not React-PDF.** This was tested. React-PDF produced cluttered layouts, font embed errors (PlayfairDisplay-Bold extraction failures), and visual fights between substrates. Pencil aligns better, is what Rachel is comfortable with, and what's worked before.

**Operational rules:**

- Pencil document: `web-platform/picc-annual-report.pen` (existing file — reuse, don't replace).
- Asset pool: `web-platform/public/report-assets/2024-25-pool/` (25 slot folders + `_shared/` + `_to-sort/`).
- Manifest: `web-platform/annual-reports/2024-25-coo-review/PICC-2024-25-PENCIL-MANIFEST.md`.
- Per-slot briefs: `web-platform/public/report-assets/2024-25-pool/<slot>/_brief.md`.
- React-PDF infrastructure (`lib/pdf/`) stays as scaffolding for `/api/pdf/specimen` and audience-variant exports if needed, but layout iteration happens in Pencil.
- The Saltwater Almanac 12-element grammar applies regardless of render engine — those names are the design language used in briefs and manifest.

**Pencil files are encrypted.** Only `mcp__pencil__*` tools can read or write them. Never `Read` or `Grep` them directly.

---

## Every-message checks (PICC)

Before composing any reply when working on PICC:

1. **Confirm the working directory.** PICC web platform = `web-platform/`. Annual reports = `annual-reports/` and `web-platform/annual-reports/`. Don't auto-cd elsewhere.
2. **Check whether the user is editing copy or building infrastructure.** Different rhythms apply.
3. **Check the live state of the master report file** — `web-platform/annual-reports/2024-25-coo-review/PICC-2024-25-MASTER-REPORT.md` — before drafting anything new. It is the single source of truth.
4. **Check Narelle's verified service list** — `web-platform/annual-reports/2024-25-coo-review/PICC-2024-25-Services-Overview-FINAL.md` — before naming or describing any service.
5. **Check the brand guide** — `web-platform/PICC-BRAND-STYLE-GUIDE.md` — before any visual or typographic decision. The Saltwater & Earth v2.0 palette is the only palette. Old blue/purple is dead.
6. **Check cultural protocol** before publishing or generating any imagery touching Elders, ceremony, named individuals, or Sorry Business.

---

## Never (PICC-specific, no exceptions)

- **Never default back to React-PDF for layout iteration on the FY24-25 annual report.** Pencil is the render engine. React-PDF is fallback only.
- **Never register PlayfairDisplay** in `lib/pdf/register-fonts.ts`. The bold variant fails Adobe's font extraction and breaks PDFs. Two fonts only: Caveat + Inter.
- **Never generate photographs of Aboriginal people.** Generated imagery is for atmosphere, motif, and place — never for human faces.
- **Never use the old PICC palette.** Blue / purple / green / orange / teal are dead. The current palette is Saltwater & Earth v2.0.
- **Never refer to PICC as "first in Australia" for Bwgcolman Way.** First in Queensland. (Per Narelle, 28 April 2026.)
- **Never present $107.8M as PICC-only.** Statewide commitment, PICC is one of the first ATSICCOs to go live.
- **Never bring back deleted services** — Palm Island Community Connection, Social Enterprises (umbrella), separate Children's Lunch Program, separate Court Support, duplicate CFC entry. The verified list is 24 services.
- **Never use AI vocab in PICC copy.** Same banned list as global. Search before shipping.
- **Never use em-dashes in any PICC copy.** Comma, full stop, or colon.
- **Never run a database migration without verifying column names first.** Schema-first per `web-platform/CLAUDE.md`.
- **Never use seed/fake/placeholder data in PICC dashboards.** Real data only. Empty state explicitly when no data.
- **Never commit binary assets to git.** Photos go to Supabase Storage; reference with `assetUrl()`. Per memory.
- **Never bypass the Elders Group on cultural content.** Pause first.
- **Never claim a deployment is live until it is verified live.** Deploy → verify → report.

---

## Lookup chains (PICC)

### When writing PICC narrative copy
1. `SOUL.md` (project root) — voice rules
2. `~/.claude/SOUL.md` — global voice rules
3. `web-platform/PICC-BRAND-STYLE-GUIDE.md` — brand
4. `web-platform/annual-reports/2024-25-coo-review/PICC-2024-25-MASTER-REPORT.md` — current authoritative draft
5. `web-platform/picc-vault/storytellers/` — captured voices, validated quotes
6. `web-platform/picc-vault/transcripts/` — source transcripts (some metadata-only — verify before quoting)

### When writing service descriptions
1. `web-platform/annual-reports/2024-25-coo-review/PICC-2024-25-Services-Overview-FINAL.md` — Narelle-verified
2. EL v2 source if listed there as authoritative
3. Service `metadata.metrics_*` for stats
4. **Never** invent a stat. If a stat doesn't exist, say so.

### When working with PICC database
1. `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '<x>'` BEFORE writing
2. `web-platform/CLAUDE.md` — known patterns
3. Supabase MCP for migrations and queries
4. URL: `https://uaxhjzqrdotoahjnxmbj.supabase.co`
5. Project: `uaxhjzqrdotoahjnxmbj`
6. Credentials: `web-platform/.env.local`

### When checking deployments
1. Local: `pm2 logs`
2. Vercel: `vercel ls` and `vercel logs`
3. CI: `gh run list` then `gh run view <id>`
4. PICC platform deploys from `main` to Vercel

### When generating imagery
1. `web-platform/annual-reports/2024-25-coo-review/PICC-2024-25-STORIES-AND-VISUAL-PACK.md` — prompt library §4
2. Always append the **Style Stem** to every prompt
3. Output to `web-platform/public/report-assets/generated/`
4. Filename format: `[T-tier]-[name]-[v1/v2/v3].png` with `.txt` sidecar holding the prompt + seed
5. Move into the matching slot folder under `2024-25-pool/<slot>/` once identified.
6. Never generate Aboriginal people. Atmosphere, motif, place only.

### When working on annual report layout (Pencil-first)
1. Read `PICC-2024-25-PENCIL-MANIFEST.md` for the page-by-page brief.
2. Read the slot's `_brief.md` for type stack + colours + photo recommendations.
3. Open the Pencil document via `mcp__pencil__*` tools only.
4. Photos and assets sit in `web-platform/public/report-assets/2024-25-pool/<slot>/` — that's where Pencil indexes.
5. The 12-element grammar (Cartouche, Reliquary, Lantern, Hearth, Horizon, Atlas, Specimen, KulingField, Vitrine, Fold, MarginNote, Songline) is the design language. Use the names.

### When recalling PICC past work
1. `~/.claude/projects/-Users-benknight-Code-Palm-Island-Reposistory/memory/MEMORY.md`
2. `web-platform/annual-reports/2024-25-coo-review/` — all current draft material
3. `PICC-Narelle-Rachel-Workshop/` — workshop and interview frameworks
4. Supabase `project_knowledge` for stored learnings:
   ```sql
   SELECT title, content FROM project_knowledge
   WHERE content ILIKE '%term%'
   ORDER BY recorded_at DESC LIMIT 5
   ```

---

## Path rules (PICC)

- **Web platform**: `web-platform/` — Next.js + Supabase + Vercel + Stripe + GHL.
- **Annual reports source pack**: `web-platform/annual-reports/2024-25-coo-review/`.
- **Master report**: `PICC-2024-25-MASTER-REPORT.md`.
- **Services overview**: `PICC-2024-25-Services-Overview-FINAL.md`.
- **Stories + visual pack**: `PICC-2024-25-STORIES-AND-VISUAL-PACK.md`.
- **CEO and Chair message drafts**: `PICC-2024-25-CEO-Message-DRAFT.md`, `PICC-2024-25-Chair-Message-DRAFT.md`.
- **Pencil files**: `web-platform/picc-annual-report.pen` — encrypted. Use only `mcp__pencil__*` tools.
- **PDF system**: `web-platform/lib/pdf/` — React PDF (`@react-pdf/renderer`). API: `/api/pdf/generate`.
- **Brand style guide**: `web-platform/PICC-BRAND-STYLE-GUIDE.md` — Saltwater & Earth v2.0.
- **Brand evolution PRD**: `.superdesign/PICC-BRAND-EVOLUTION-PRD.md`.
- **Photo asset library**: `web-platform/public/icons/picc/photos/` (organised) and `web-platform/public/hero-assets/stills/` (16 hero stills) and `web-platform/public/annual-report-photos/` (historical, by year).
- **Photo pool for FY24-25 layout**: build at `web-platform/public/report-assets/2024-25-pool/` per the Stories & Visual Pack §3.C.
- **Generated imagery output**: `web-platform/public/report-assets/generated/` — always with prompt + seed sidecar.
- **Memory**: `~/.claude/projects/-Users-benknight-Code-Palm-Island-Reposistory/memory/`.

---

## When to ask vs when to act (PICC)

### Act without asking
- Read any file under the PICC repo.
- Edit drafts under `annual-reports/2024-25-coo-review/`.
- Add to the Stories & Visual Pack.
- Generate brand-consistent atmospheric imagery (per rules).
- Build infrastructure scripts that don't touch PICC's live data (helper scripts, photo pool builders, prompt-library generators).
- Run schema-introspection SQL.
- Read transcripts and storyteller files.
- Build the photo pool folder structure.

### Ask before acting
- Push to `main` (always).
- Run a Supabase migration affecting production data.
- Trigger any GHL or Stripe action.
- Trigger any cron / scheduled task that touches live publishing endpoints.
- Modify cultural content in published outputs.
- Send a draft to Rachel, Luella, Narelle, or any Elder.
- Generate any image of a person.
- Print or order print runs.
- Delete any content from `picc-vault/`.
- Modify `~/.claude/` configuration.
- Re-run a destructive bulk operation.

---

## The PICC content workflow

```
[Sources: transcripts · storytellers · services · Narelle walkthrough · Rachel/Luella quotes · brand guide · photo asset libraries]
                                  ↓
[Master report .md draft in Obsidian — single source of truth]
                                  ↓
[Sweep + verification with Narelle (services), Mark (financials), Rachel (CEO message), Luella (Chair message), Elders Group (cultural review)]
                                  ↓
[Photo pool curated · Generated imagery batched · Visual & Infographic plan locked]
                                  ↓
[Pencil layout — `web-platform/picc-annual-report.pen` — using mcp__pencil__* tools only]
                                  ↓
[PDF export · Audience variants generated via /api/pdf/generate]
                                  ↓
[Print run (50 Elder-edition + 200 general) · Digital companion microsite at picc.com.au/annual-report-2024-25]
```

The agent's responsibility is **everything up to Pencil layout**. Pencil layout itself is a hand-off to Pencil's tools and to a designer working with Rachel.

---

## Verification checklist before publishing any PICC content

Run through this every time before any external send or commit to a published artefact:

1. Does the page name names accurately?
2. Is every quote sourced to a verified storyteller or transcript?
3. Is every number traceable to Mark, audit, ops team, or a cited public source?
4. Has the Saltwater & Earth palette been used and not the old palette?
5. Has the verified service list been used and not earlier drafts?
6. Is "first in Queensland" used and not "first in Australia" for Bwgcolman Way?
7. Is $107.8M framed as statewide and not as PICC-only?
8. Are there em-dashes? (If yes, replace.)
9. Is there AI vocab? (If yes, replace.)
10. Does any photo carry cultural sensitivity? (If yes, has the Elders Group reviewed?)
11. Does the page acknowledge what it does not include, where appropriate?
12. Has the AI-Powered Annual Report System been credited as a named project, not hidden?

If any check fails, pause. Fix. Re-run.

---

## Failure handling

When something goes wrong on PICC work:

1. **State what broke** in one sentence. No spirals.
2. **State the impact.** What is now wrong? Who sees it?
3. **State the fix.** Specific, executable.
4. **Ask whether to apply.** Don't auto-roll-forward on cultural or external-facing content.
5. **Update memory.** Record the failure pattern in `~/.claude/projects/-Users-benknight-Code-Palm-Island-Reposistory/memory/` so it doesn't recur.

If the failure touches an Elder, a name, a cultural protocol, or a published external artefact: **stop, name, ask before fixing.** The cost of pausing is low. The cost of a quiet override is high.

---

## Special operating notes

- **Pencil files are encrypted.** Only `mcp__pencil__*` tools can read or write them.
- **Empathy Ledger v2 is the source of truth for photos.** PICC consumes via `/api/photos`. Don't re-upload images that already exist there.
- **Per-storyteller consent is operative.** When in doubt, treat consent as "no" until verified "yes."
- **GHL is the comms layer.** Never build custom email/SMS for PICC.
- **React PDF is the PDF standard.** WeasyPrint pipeline in `annual-reports/` is legacy.
- **Fiscal year is July–June.** "FY24-25" = 1 July 2024 – 30 June 2025.
- **PIC Leadership Program launches May 2026** — that is FY25-26, not FY24-25. The *design and decision* work was FY24-25 and that is what the report claims.
- **Hull River journey transcripts are FY25-26.** The FY24-25 report frames the trip as "since the year ended", not as a year-17 deliverable.

---

*Last edited: 28 April 2026.*
