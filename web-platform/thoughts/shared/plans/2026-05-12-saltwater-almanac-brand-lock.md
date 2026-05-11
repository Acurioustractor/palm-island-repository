# Saltwater Almanac — Brand Lock v3

**Date:** 2026-05-12
**Reference:** BRAND.md (Saltwater & Earth v2.0)
**Purpose:** the visual contract for the v3 Pencil document. Every spread MUST pass these checks.

---

## Palette — exactly these hex values, no others

| Token | Hex | Use |
|---|---|---|
| `ocean` | `#0B4F6C` | Primary brand. H1, eyebrow accent, full-bleed callouts |
| `reef` | `#0EA5E9` | Secondary. Accents, links, gradient endpoints |
| `ochre` | `#C8963E` | Featured Service · Family, "next" headings, dividers |
| `turtleRed` | `#8B1A1A` | Eyebrows, Elder voice, governance, flagship "Bwgcolman Way" |
| `mangrove` | `#15803D` | Health, success state, "verified" stamps |
| `starGold` | `#F5A623` | Highlight on dark navy, callout dots, financial KPIs |
| `earth` | `#2D2319` | Primary body text |
| `driftwood` | `#6B6560` | Secondary body, captions, italic |
| `muted` | `#A39E99` | Tertiary, page numbers, source lines |
| `shell` | `#FEF3C7` | Acknowledgement bg, callout bg, warm neutral |
| `paper` | `#FFFFFF` | Default page background |
| `border` | `#E8E6E3` | Dividers, hairlines |

**Banned:**
- ❌ Purple gradients (generic SaaS)
- ❌ Cool blue-grey (#F8FAFC, #64748B etc.) — PICC neutrals are WARM
- ❌ Any unbranded #RRGGBB literal outside this table

---

## Typography — two faces only

| Style | Face | Size | Weight | Letter-spacing | Use |
|---|---|---|---|---|---|
| Display H1 | **Fraunces** | clamp(32, 4vw, 48) | 700 | -0.5 | Spread titles |
| Display H2 | **Fraunces** | 30 | 700 | 0 | Section heads on print |
| Display H3 | **Fraunces** | 22 | 700 | 0 | Sub-section |
| Eyebrow | **Inter** | 11 | 700 | 0.3em (3.3pt) | "PICC · ALMANAC · …" |
| Pull quote | **Fraunces** | 20–24 | normal italic | -0.2 | Italicized voice |
| Body | **Inter** | 10 | 400 | 0 | Default text |
| Caption | **Inter** | 9 | normal italic | 0.5 | Photo captions, sources |
| Stat number | **Fraunces** | 28–42 | 700 | -0.5 | Big numbers |
| Source line | **Inter** | 6.5 | normal italic | 0 | Provenance footers |
| Footer page no. | **Inter** | 8 | normal | 0.2em | "· 12 ·" |

**Banned:**
- ❌ **Caveat** for display titles (it's reserved for margin notes per BRAND.md — handwritten asides only, never section heads)
- ❌ Any third typeface
- ❌ Faux-italic or faux-bold — use real Fraunces/Inter weights

---

## The eyebrow recipe (every spread)

```
Inter · 700 · 11px · letter-spacing 3.3pt (0.3em) · turtleRed (#8B1A1A)
Format: "PICC · ANNUAL REPORT 2024—25"  (em dash, not hyphen)
Position: y=25, x=50, width:495
```

Followed by:
```
Inter · 700 · 7.5px · letter-spacing 2pt · accent color of section
Format: "SECTION NAME · MODIFIER"  (uppercase, no period)
e.g.: "FEATURED SERVICE · HEALTH"  in mangrove
```

---

## Components — the 8 essentials

Every spread is composed from these 8 reusable components. No bespoke
geometry per spread.

| # | Component | Purpose |
|---|---|---|
| 1 | **Stat Card** (Teal/Cream/Navy/Outlined) | KPI display — big number + label + caption |
| 2 | **Callout** (Teal Full / Navy Stat+Icon / Cream Highlight) | Emphasis block |
| 3 | **Quote Card** (White Shadow / Navy / Photo+Quote) | Storyteller voice with attribution |
| 4 | **Photo Layout** (Full Bleed + Caption / Grid 2x2 / Hero + 2 Stack) | Photo composition |
| 5 | **Service Card** (Icon Left / Compact / Dark) | Service identity tile |
| 6 | **Stat Strip** | Horizontal stat row (4 KPIs across) |
| 7 | **Quote Pull** | Inline pull quote with hairline above & below |
| 8 | **Source Footer** | Bottom-of-page sourcing line + page number |

Every component lives in the DESIGN SYSTEM frame as `reusable: true`. Every
spread is built by inserting refs and overriding text/photo only.

---

## Icons — bespoke only for services

- **PICC services use** `/public/icons/bespoke/` icons (28 service icons, custom designed)
- **Lucide is OK for:** UI utility (search, close, chevron, arrow) — NEVER for service identity
- **Never use:** generic stock icons, emoji, Font Awesome

---

## Photo rules

Source: **Empathy Ledger v2 only**. Every photo must:
1. Have `consent_given = true` in EL
2. Be linked to a storyteller or service via EL's join tables
3. Pass print-readiness check (≥1200 px long edge for halfpage, ≥2400 for fullbleed)
4. Have a real `alt_text` (no "image of person")

For the printed almanac, use only photos that fit the printed slot's
resolution requirement (see `lib/almanac/imagery-system.ts` for slot defs).

---

## Section colour map

Each section gets ONE accent colour. Don't mix.

| Section | Eyebrow accent | Stat colour |
|---|---|---|
| Cover | — (full-bleed photo with white text) | — |
| Acknowledgement | turtleRed | turtleRed |
| CEO Message | reef | ocean |
| Chair Message | turtleRed | turtleRed |
| Year 17 in Numbers | reef | ocean / starGold / mangrove |
| Our Journey | reef | gradient ocean→reef |
| Bwgcolman Way | turtleRed | turtleRed (1918) → ocean (2024) |
| Featured Service · Health | mangrove | mangrove |
| Featured Service · Family | ochre | ochre |
| Featured Service · Education | reef | reef |
| Community Voices | reef | ocean (each voice has its own accent bar) |
| Financial Summary | reef | ocean / ochre / starGold |
| Services at a Glance | reef | per-category color |
| Governance | reef | ocean |
| Looking Forward | reef | turtleRed (#01) / mangrove (#02) / reef (#03) |
| Elders on Country | turtleRed | turtleRed |
| Risks | starGold (#F5A623 hue at 700) | ochre / turtleRed for #07 |
| Compliance | reef | mangrove |
| Acknowledgements | ochre | — |
| Back Cover | starGold (logo accent only) | — |

---

## The 14-point checklist (run before each spread is signed off)

1. **One eyebrow** in the exact recipe at y=25 + section eyebrow below at y=70
2. **One display title** in Fraunces, ocean, with proper hierarchy
3. **One pull quote OR one stat block OR one photo** — never all three competing
4. **Margins:** 50px sides, 25px top/bottom
5. **Hairline divider** after title block (height:3, width:60, eyebrow accent color)
6. **Page number** at y=815, centered, Inter 8px muted
7. **Source line** at y=782, Inter 6.5px italic muted — every fact must source
8. **Photos:** real EL photos only, never placeholder/checkered
9. **Names:** every storyteller named (no "an Elder said")
10. **Numbers:** every figure has a date or "preliminary" note
11. **No purple, no Caveat for titles, no cool blue-grey neutrals**
12. **Caveat allowed:** ONLY in pull quotes (italic, 20–28px) — handwritten feel
13. **At least one component instance** (`ref`) from the design system
14. **No hex literals outside the palette table** above

---

## Cultural protocols (non-negotiable)

- Any photo of an Elder requires `requires_elder_approval = true` checked
- Any quote from a sensitive meeting requires `cultural_review_pending = false`
- Sorry Business protocol applies to recent passings — flagged in EL
- "Many tribes, one people" → "Bwgcolman" — never decorative, always sourced
- Manbarra Traditional Owners acknowledged first, Bwgcolman second

---

## Build sequence for v3 Pencil document

1. **Variables panel** — paste the palette table above as Pencil variables
2. **Type ramps** — define `$display-h1`, `$display-h2`, `$eyebrow`, `$body`, etc.
3. **DESIGN SYSTEM frame** — build the 8 reusable components
4. **Cover template** — first spread, fully on-brand, sign-off before next
5. **22 spreads** — built from refs, overriding text/photo only
6. **PHOTOS LIBRARY frame** — every EL photo synced + tile + entity tag
7. **EXPLAINER frame** — 1pp A4 "how the system works" map

Stop after step 4 and review. No spread #2 until #1 is brand-locked.
