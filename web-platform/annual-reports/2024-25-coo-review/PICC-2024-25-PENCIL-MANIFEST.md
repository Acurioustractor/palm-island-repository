# PICC 2024-25 Annual Report — Pencil Layout Manifest

**Render engine:** Pencil — `web-platform/picc-annual-report.pen`
**Asset pool:** `web-platform/public/report-assets/2024-25-pool/`
**Status:** asset organisation complete (28 April 2026); ready for Pencil layout
**Last updated:** 28 April 2026

---

## How this manifest works

For every page of the FY24-25 annual report, this file says exactly:
1. **Element** — which of the 12 Saltwater Almanac elements is the page anchor
2. **Folder** — where Pencil finds candidate assets
3. **Photos** — recommended primary + alternates (already copied into the folder)
4. **Type stack** — fonts, sizes, weights, colours
5. **Section colour** — drives accent treatments
6. **Notes** — gaps, capture priorities, cultural protocols

Each page-slot folder has a `_brief.md` with the full layout brief. This manifest is the index across all 25 slots.

---

## Brand foundations (one source of truth)

### Two-font rule (per brand guide)

- **Caveat** — display + curator's hand. Section names, numerals, sub-lines, annotations, dates.
- **Inter** — body, labels, captions, dates set in caps, UI.

PlayfairDisplay was previously trialled as a Canela substitute but failed to embed reliably. Two fonts only.

### Saltwater & Earth palette

| Name | Hex | Role |
|------|-----|------|
| Ocean | `#0B4F6C` | Primary. Headings, ocean register. |
| Ochre | `#C8963E` | Accent. Heritage, warmth. Children & Families section. |
| Earth | `#2D2319` | Anchor. Deep text, hero gradient base. |
| Reef | `#0EA5E9` | Bright blue. Links, Youth section, highlights. |
| Mangrove | `#15803D` | Rich green. Health & Wellbeing section. |
| Coral | `#E8600A` | Warm orange. Justice & Safety section. |
| Star Gold | `#F5A623` | Celebration, Elder wisdom, Economic section. |
| Turtle Red | `#8B1A1A` | Cultural ceremony, Elder content borders. Lantern accent. |
| Sand | `#FEF3C7` | Community voices backgrounds, acknowledgement, Lantern panels. |
| Midnight | `#1A1A2E` | Back cover, dark sections. |
| Rock | `#292524` | Primary body text. |
| Driftwood | `#6B6560` | Secondary text, captions. |
| Muted | `#A39E99` | Tertiary text, page numbers. |
| Shell | `#F7F6F4` | Card backgrounds. |

### Section colour map (six rooms)

| Section | Colour | Icon |
|---------|--------|------|
| Children & Families | Ochre | `03-family.png` |
| Health & Wellbeing | Mangrove | `02-health.png` |
| Justice & Safety | Coral | `04-justice.png` |
| Youth | Reef | `09-youth.png` |
| Economic | Star Gold | `06-economic.png` |
| Education & Community | Ocean | `05-community.png` |

### The 12-element grammar

| Element | Where used | Frequency |
|---------|------------|-----------|
| **Cartouche** | Section openers (6 rooms) | 6 |
| **Reliquary** | One sacred number per anchor story | 4 (Bwgcolman Way, BHS, CFC, First 1000 Days) |
| **Songline** | Full-spread narrative band — RARE | 1-2 (Hull River; CFC rebuild optional) |
| **Lantern** | Elder voice (sacred, refuses section colour) | 4 |
| **Hearth** | Community voice with portrait | 4-6 |
| **Horizon** | Forward-looking vision | 3 (one per commitment) |
| **Atlas** | Services-around-island map | 1-2 (orientation + closing) |
| **Specimen** | Before/after panel | 1-2 |
| **Kuling Field** | Constellation of stats | 2-3 |
| **Vitrine** + Triptych | Display case for one fact | many (in section openers + financials + innovation) |
| **Fold** + Pair | Photo plate (consented) | 18 photo slots |
| **Margin Note** | Curator's whisper | 1-2 per spread |

---

## Page-by-page manifest

| # | Page | Folder | Element(s) | Section | Status |
|---|------|--------|------------|---------|--------|
| 00 | Cover | `00-cover/` | Cover photo + title | All | 14 photo candidates ready |
| 01 | Acknowledgement | `01-acknowledgement/` | Centred panel + corner brackets | All | Type-only, motif ready |
| 02–03 | Rachel CEO message | `02-rachel-message/` | Hearth × CEO (2pp spread) | All | 2 portrait candidates |
| 04 | Luella Chair message | `03-luella-message/` | Hearth × Chair | All | 1 portrait candidate |
| 05 | Our Board | `04-board/` | Group photo + portraits | All | 3 individual portraits; group photo MISSING |
| 06 | Our Elders | `05-elders/` | Portrait grid + governance frame | All | 11 candidates; group photo MISSING |
| 07 | Hull River Songline | `06-hull-river-songline/` | Songline (epilogue framing) | All | 8 EoC photos + substrate ready |
| 08 | Year 17 in Numbers | `07-year-in-numbers/` | KulingField + Vitrines | All | 3 substrate options, no photos needed |
| 09–10 | Photo spread | `08-photo-spread/` | FoldPair + grid | Community/supporter | 16 photo candidates |
| 11 | Cartouche I — Children & Families | `09-cartouche-children-families/` | Cartouche | Children & Families (Ochre) | Icon + 3 hero photo candidates |
| 12 | Anchor I — Bwgcolman Way | `10-reliquary-bwgcolman-way/` | Reliquary + MarginNote | Children & Families | Substrate ready; case-study sentence pending cultural review |
| 13 | Cartouche II — Health & Wellbeing | `11-cartouche-health/` | Cartouche (photo-led) | Health & Wellbeing (Mangrove) | Icon + group-dinner hero candidate |
| 14 | Anchor II — Bwgcolman Healing | `12-reliquary-bhs/` | Reliquary + Hearth (Dr Blackman) | Health & Wellbeing | Substrate ready; Dr Blackman portrait MISSING |
| 15 | Cartouche III — Justice & Safety | `13-cartouche-justice/` | Cartouche | Justice & Safety (Coral) | Icon + memorial-gathering hero |
| 16 | Cartouche IV — Youth | `14-cartouche-youth/` | Cartouche (photo-led) | Youth (Reef) | Icon + youth photos + 2 worker portraits |
| 17 | Cartouche V — Economic | `15-cartouche-economic/` | Cartouche | Economic (Star Gold) | Icon only — service photos MISSING (May visit) |
| 18 | Cartouche VI — Education & Community | `16-cartouche-education/` | Cartouche (photo-led) | Education & Community (Ocean) | Icon + BEAI feature photos |
| 19–20 | Atlas | `17-services-atlas/` | Atlas (centre spread) | All | 2 substrates + 2 alternates ready |
| 21 | Elder Lanterns | `18-elder-lanterns/` | Lantern × 4 | Cross-section (Sand/Turtle Red) | 6 Elder portraits + Lantern wash ready |
| 22 | Staff & Community Hearths | `19-staff-hearths/` | Hearth × 6 | Community/supporter | 7 candidates; 3 staff portraits MISSING (May visit) |
| 23 | Innovation + 3 Horizons | `20-innovation/` | Vitrines + 3 Horizons | All | 4 candidates ready |
| 24 | PIC Leadership Program | `21-leadership-program/` | Hero + Vitrines | All | Placeholder ready; cohort photo MISSING |
| 25 | Financials | `22-financials/` | Vitrines + KulingField + 16-yr curve | Funder/board/govt | 2 substrates ready; figures pending Mark |
| 26 | Governance, Compliance, Risks, Declaration | `23-governance/` | Compliance rows + 8-risk panel + signature | Funder/board/govt | 3 board portraits + governance icon ready |
| 27 | Back cover — Next 20 Years | `24-back-cover/` | Constellation + commitments + contact | All | Motifs + alt landscape ready |

**Total:** 27 page slots (24 pages + 3 spreads).

---

## Photo gaps to capture during the May 11–13 visit

Top priority for capture (in order of report dependency):

1. **Group photo of current Board** (post-Nov 2025 AGM) — page 05
2. **Group photo of the Elders Group** — page 06
3. **Hailey Jane Wetzel** (CFC Manager) — page 22 (Hearth)
4. **Clay Alfred** (Men's Pathway to Healing) — page 22
5. **Tammy** (BEAI Program Lead) — page 22
6. **Dr Raymond Blackman** (BHS) — page 14 (Hearth)
7. **Digital Service Centre interior** — page 17 (Cartouche hero)
8. **Retail Community Shop** — page 17 (alt) and services directory
9. **Logistics in operation** — services directory
10. **NDIS team** — services directory
11. **Diversionary Program activity** — services directory
12. **Justice Group team** — services directory
13. **CFC pre-flood and post-rebuild interior pair** — for the Specimen element if used
14. **First 1,000 Days team photo** — page 11 (Cartouche alt)
15. **Movember Project activity** (if it happened in FY24-25) — page 23
16. **PIC Leadership Program cohort** — page 24

---

## Generated images — to-sort

19 PNG files in `_to-sort/` need visual identification + renaming + placement into slot folders.

See `2024-25-pool/_to-sort/README.md` for the placement guide. Once Ben opens each PNG and identifies which of the 17 prompts produced it, files move to the correct slot folder with a `.txt` sidecar.

---

## Pencil workflow

1. **Open** `web-platform/picc-annual-report.pen` (existing file — reuse, don't replace).
2. **Index the pool** — Pencil reads the 25 slot folders. Each folder shows photos + substrates + briefs.
3. **For each page**, follow the corresponding `_brief.md`:
   - Place the substrate (if any) at the specified opacity.
   - Place the chosen photo(s) at the specified crop ratio.
   - Set type per the type stack (Caveat + Inter, sizes and colours specified).
   - Apply section-colour accents (corner brackets, hairlines, gradient bars).
   - Run the foot motif (page number in dot cluster + thin wave line at 18% section colour).
4. **Audition photos** — every slot folder has 2-7 candidates. Cycle through with arrow keys.
5. **Lock once Rachel approves** — locked pages get a `_LOCKED` suffix in the slot folder.
6. **Export** — A4 portrait, 300dpi, full-bleed safe areas honoured.

---

## Common cross-page details

### Page foot (every page except cover, back cover, cartouches)

- Thin wave line at 18% section colour, 0.5pt thickness, full width with 50pt margin.
- Page number inside small 3-dot cluster, Inter 7.5pt Muted, letter-spacing 1.
- Format: `· 12 ·`

### Running header (every page except cover, back cover)

- Top of page, Inter 6.5pt Semibold, uppercase, letter-spacing 2, Muted colour.
- Left: "PALM ISLAND COMMUNITY COMPANY"
- Right: "ANNUAL REPORT 2024–25"

### Corner brackets (atmospheric — every page that's not cartouche or full-bleed)

- 12mm from trim (~34pt), section colour at 18% opacity, 0.5pt thickness, all 4 corners.
- DO NOT add corner brackets where an element already provides its own framing (Lanterns, Reliquaries, Vitrines have their own).

### Constellation seed

- Star Gold at 2.5% opacity, 9 dots scattered (seeded for deterministic placement per page).
- Skip on dense data pages (Atlas, Year in Numbers, Financials).

---

## Cultural protocols

- **Elder portraits**: only with `elder_approval_given = true` in the database. Validated. Public level. Sorry Business: never use a photo of a deceased person without family consultation.
- **Cultural review**: every page touching Elders, ceremony, Hull River, or Sorry Business must be cultural-reviewed by the Elders Group before printing.
- **Consent footer**: every Hearth and Lantern carries a small "Recorded with consent · Empathy Ledger" footer. This is not optional — it is the protocol made visible.
- **Bwgcolman Way framing**: "first in Queensland", NOT "first in Australia". $107.8M is statewide, NOT PICC-only.
- **Elders Group** is governance content, NOT a service.

---

## Audience variants

Five audience variants drive which pages are included:

| Page | Community | Funder | Supporter | Board | Govt |
|------|-----------|--------|-----------|-------|------|
| Cover, Acknowledgement, Messages | ✓ | ✓ | ✓ | ✓ | ✓ |
| Numbers, Cartouches, Atlas | ✓ | ✓ | ✓ | ✓ | ✓ |
| Photo spread, Hearths | ✓ | — | ✓ | ✓ | — |
| Songline, Elder Lanterns | ✓ | — | ✓ | — | — |
| Innovation, Leadership, Horizons | ✓ | ✓ | ✓ | ✓ | ✓ |
| Financials, Compliance, Declaration | — | ✓ | — | ✓ | ✓ |
| Back cover | ✓ | ✓ | ✓ | ✓ | ✓ |

Pencil should support audience variants by toggling page visibility.

---

## Sign-off chain

| # | Item | Owner | Status |
|---|------|-------|--------|
| 1 | Final services list | Narelle | Verified 28 April 2026 |
| 2 | FY24-25 audited financials | Mark | Pending |
| 3 | CEO message sign-off | Rachel | Draft v1 ready |
| 4 | Chair message sign-off | Luella | Draft v1 ready |
| 5 | Post-AGM Board composition | Narelle | Pending |
| 6 | Elders Group composition + consent | Narelle + Elders Group | Pending |
| 7 | Cultural review | Elders Group | Required before print |
| 8 | Bwgcolman Way case study | Bwgcolman Way team | Required during May visit |
| 9 | Photo capture (16 gaps) | Photographer | May visit |
| 10 | 19 generated PNGs identified | Ben | Visual review |
| 11 | Funder + partner naming list | Narelle | Pending |
| 12 | Print run quote (50 Elder ed. + 200 general) | Print partner | Pending |

---

*End of manifest. Pencil layout begins from here.*
