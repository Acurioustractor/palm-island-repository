---
description: Load PICC brand DNA before any UI, design, copy, or content work. Saltwater & Earth v2.0 — community-controlled, not community-engaged.
---

# Brand Skill

PICC's brand is **Saltwater & Earth v2.0**. Read BRAND.md, then apply.

## When to use

- Before creating or modifying any UI component
- Before writing copy that names a service, person, or number
- Before designing new pages, layouts, or PDF templates
- Before choosing colours, typography, spacing, or motion
- When briefing an agent or building a new surface

## Step 1 — Load the recipe

Read [BRAND.md](BRAND.md) at the repo root. It is the single canonical reference. ~250 structured lines synthesising:

- Identity, in one breath (the three anchor quotes)
- The 5 personality traits (warm · grounded · bold · innovative · respectful)
- Three voice registers (Rachel · Luella · Service)
- Anti-patterns (the never-do list)
- Saltwater & Earth palette (ocean · ochre · earth + supporting + cultural)
- Typography (Fraunces displays · Inter speaks)
- Section colour map
- Logo · icons · photo system
- The 14-point surface checklist
- The 20-year story (why all of this exists)

For full system depth: [web-platform/PICC-BRAND-STYLE-GUIDE.md](web-platform/PICC-BRAND-STYLE-GUIDE.md).
For voice / philosophy depth: [SOUL.md](SOUL.md).

## Step 2 — Apply, don't reinvent

**Token sources** (server-safe, importable):
- `web-platform/components/annual-report/2024-25/almanac/tokens.ts` — `C` palette + `SECTION_COLOURS`
- `web-platform/lib/pdf/theme.ts` — PDF mirror of the same palette
- `web-platform/lib/design/tokens.ts` — full UI scale

Never write hex literals outside these files.

**Photo source-of-truth:** Empathy Ledger v2 via `web-platform/lib/media/el-photos.ts`. Use `getPhotosForSlot()`, `getPhotosForService()`, `getCanonicalPhotosForService()`. Never hardcode bucket URLs — use `assetUrl()` from `web-platform/lib/media/asset-url.ts`.

**Icons:** PICC services use `web-platform/public/icons/bespoke/`. Lucide is for UI utility only (search, close, chevron) — never for service identity.

**Typography:** Fraunces for display, Inter for body. Captions are uppercase 11px Inter 700 letter-spaced 0.3em — that cadence is the brand.

## Critical anti-patterns (never do)

- **Never use purple gradients.** Generic SaaS tell. Banned.
- **Never use cold blue-grey neutrals.** PICC neutrals are warm-toned.
- **"We helped / provided / delivered."** PICC is the community delivering to itself. Reframe.
- **Generic service descriptions** that fit any ATSICCO. They must fit *this* one.
- **Cultural language used decoratively.** *Bwgcolman* is not a brand element.
- **Photos that treat Elders as decoration.** Cultural authority is governance, not garnish.
- **Numbers without provenance.** Every figure traces to a verified source.
- **Cookie-cutter SaaS chrome.** Every PICC surface should *feel like Palm Island*.

## Voice authenticity test

Before submitting copy that names a service or person, ask:
> Would the lead person on this service read this aloud and recognise it?

If no, rewrite.

## Public showcase

The `/design-system` page demonstrates the system live with real data — open it when onboarding designers or sanity-checking that a new surface is on-brand.

## Component patterns to reuse, not reinvent

- `components/annual-report/2024-25/almanac/` — Saltwater Almanac grammar
- `components/story-scroll/` — scroll-based storytelling
- `components/annual-reports/` — report-specific layouts
- `components/report/` — interactive report elements
- `components/navigation/` — nav patterns

## PDF-specific branding

For React-PDF templates: use the palette from `web-platform/lib/pdf/theme.ts`. A4 portrait, 15mm margins (12mm sides). Full-bleed cover page. Print-safe colours, no transparency. Optimised for 300dpi print.

## Why this skill exists

The brand is in service of one story: the next 20 years are a design choice, not a forecast. Every surface braids three threads — twenty years of community control · Bwgcolman Way as proof · next 20 as canvas — and four voices (organisation · CEO · service · community-Elders).

When in doubt: *does it sound like a Palm Islander reading it aloud, with photos that name the people, with numbers an Elder would sign off on?* That is the bar.
