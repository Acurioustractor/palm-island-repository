# TODOS

## extracted_quotes permission model
**What:** Add `permission_level` column to `extracted_quotes` table and tighten RLS policy from `USING (true)` to permission-based access control.
**Why:** Codex plan review (2026-04-11) found that `extracted_quotes` has no `permission_level` column. The public RLS policy is `USING (true)`, meaning all extracted quotes are publicly accessible regardless of sensitivity. `elder_quotes` has proper permission gating but `extracted_quotes` does not. This is a data governance gap affecting the whole platform.
**Pros:** Consistent permission model across both quote tables. Prevents accidental exposure of sensitive extracted content.
**Cons:** Requires migration + backfill of existing rows + updating all queries that read `extracted_quotes`.
**Context:** The `/picc/voices` page currently filters elder_quotes by `permission_level` but only checks `is_validated` for extracted_quotes. The public curated-quotes API has the same inconsistency. Found during pipeline demo eng review.
**Depends on:** Nothing. Can be done independently.

## Audience-specific PDF cache strategy
**What:** Design and implement a cache strategy for pre-generated audience-targeted PDFs: storage location, invalidation model, and alignment with the audience switcher on the demo page.
**Why:** The demo's PDF fallback is underspecified. The current PDF route renders live on every request. Cold starts on Vercel take 5-10s. The demo needs instant fallback when live generation is slow. But with 3+ audiences (funder, community, board), a single cached PDF isn't enough.
**Pros:** Instant PDF delivery during demos. Eliminates cold-start anxiety for presenters.
**Cons:** Cache invalidation complexity. Stale cached PDFs could show outdated data.
**Context:** The `/api/pdf/generate` endpoint supports `audience` param. The demo's audience switcher toggles between audiences. Each audience gets different pages/framing in the annual report. Pre-generating all 3 on deploy would cover the demo case. Found during pipeline demo eng review.
**Depends on:** Pipeline demo page being built first (to know exact audience options).

## Create DESIGN.md
**What:** Create a DESIGN.md file with component specs, spacing scale, interaction patterns, motion guidelines, and responsive breakpoints. Run /design-consultation to generate.
**Why:** The brand guide (PICC-BRAND-STYLE-GUIDE.md) has colors, typography, and personality but no component vocabulary, spacing system, or interaction patterns. Every UI task faces the same gap: the builder has to invent component specs from scratch. A DESIGN.md bridges brand → code.
**Pros:** Consistent UI across all pages. Faster implementation (specs exist before coding). Eliminates design debt accumulation.
**Cons:** ~20 min CC time to generate. Needs to be maintained as the design evolves.
**Context:** Found during pipeline demo design review (2026-04-11). The demo page required specifying brand tokens for every element because no shared design system document existed. The brand guide is rich but doesn't translate to code-level decisions (component shapes, spacing, animation timing).
**Depends on:** Nothing. Can be done independently.
