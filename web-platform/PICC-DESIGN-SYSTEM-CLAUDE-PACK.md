# PICC Design System — Claude Pack

**Palm Island Community Company Ltd** | ABN 11 154 579 565
**Brand system version 2.0** (Feb 2026) · **Editorial version 1.0** (Apr 2026) · **20-year vision version 1.0** (Apr 2026)

> Single-file upload for Anthropic's design-system tool. Consolidates three source documents from `web-platform/`:
> 1. `PICC-BRAND-STYLE-GUIDE.md` v2.0 — brand foundation
> 2. `ANNUAL-REPORT-EDITORIAL.md` v1.0 — editorial application
> 3. `20-YEAR-BRAND-VISION.md` v1.0 — commemorative evolution (Oct 2027)
>
> When those three diverge from this pack, the originals win. This pack is the synthesis, not the law.

---

## Part I — Brand Foundation

### Who we are

Palm Island Community Company (PICC) is Australia's most innovative community-controlled Aboriginal and Torres Strait Islander organisation. Founded in 2009, we are in Year 17 of a 20-year vision to transform Palm Island through self-determination, integrated services, and cultural strength.

- 197 staff across 20 integrated services
- $23.4M annual revenue
- Community-controlled governance, board of Palm Island residents

### Brand personality

| Trait | What it means | What it doesn't mean |
|-------|--------------|---------------------|
| **Warm** | Welcoming, human, community-centred | Casual, informal, unserious |
| **Grounded** | Rooted in place, culture, and evidence | Conservative, backwards-looking |
| **Bold** | Confident, ambitious, unapologetic | Aggressive, boastful, loud |
| **Innovative** | Forward-thinking, creative, adaptive | Trendy, gimmicky, tech-for-tech's-sake |
| **Respectful** | Culturally safe, Elder-guided, dignified | Tokenistic, performative, paternalistic |

### Brand promise

*"Empowering the Palm Island community through self-determination, culture, and service excellence."*

### Load-bearing elements — never change

These are the constants. The 20-year work amplifies them; it does not replace them.

| Element | Rationale |
|---|---|
| Turtle + concentric dots logo | Continuity is the whole point |
| "Saltwater & Earth" palette | Drawn from Country; Country doesn't change |
| Caveat + Inter typography | Two fonts is the rule; exceptions are documented |
| Six editorial rules | Voice-first, restraint, one motif per spread |
| Cultural protocols | Elder approval, Sorry Business, Hull River gravity tighten — they don't loosen |

If a proposal contradicts this table, it is out of scope.

---

## Part II — Logo

### Primary logo

The PICC logo is a **sea turtle rendered in Indigenous art style** with concentric dot circles radiating outward. The turtle represents longevity, navigation, and connection to saltwater country. The dots reference the many communities, families, and individuals that make up Palm Island.

**File:** `public/logo/picc-logo-full.png`

### Logo colours

| Element | Hex | Usage |
|---------|-----|-------|
| Turtle body | `#8B1A1A` | Deep red — ceremony, culture |
| Dot circles | `#C8963E` | Ochre gold — earth, heritage |
| Outlines | `#000000` | Black — definition |
| Inner dots | `#FFFFFF` | White — light, spirit |
| Background | `#F5E6C8` | Cream — warmth |

### Clear space & minimum sizes

- Clear space: half the logo's height on all sides. No text, patterns, or images intrude.
- Minimums: Print 25mm wide · Screen 48px wide · Favicon 32px (simplified turtle icon)

### Logo don'ts

- Never stretch, skew, or rotate
- Never change the colours
- Never place on busy photographs without a solid backing
- Never add drop shadows, glows, effects
- Never recreate or redraw — always use the supplied asset
- Never crop the concentric dot circles — they are integral

---

## Part III — Colour system: "Saltwater & Earth"

The palette is drawn from Palm Island itself: the ocean around it, the reef beneath, the sand and earth underfoot, and the night sky above. Every colour has a reason rooted in place.

### Core identity

Three colours define PICC. Used together, they are instantly recognisable.

| Name | Hex | HSL | Role |
|------|-----|-----|------|
| **Ocean** | `#0B4F6C` | 197° 82% 23% | Primary. Deep waters around Palm Island. Headings, borders, trust. |
| **Ochre** | `#C8963E` | 37° 53% 51% | Accent. Golden warmth from the logo. Signature PICC colour. |
| **Earth** | `#2D2319` | 24° 30% 14% | Anchor. Near-black from the logo. Deepest text, hero gradient base. |

> Note: Tailwind config uses `picc-ochre` at `#C8922A` — a 2-point variance from PDF theme's `#C8963E`. Both are acceptable; prefer `#C8963E` for new work.

### Supporting

Functional colours for specific content types.

| Name | Hex | Role |
|------|-----|------|
| **Reef** | `#0EA5E9` | Bright blue. Links, interactive elements, highlights. |
| **Mangrove** | `#15803D` | Rich green. Health services, success, growth. |
| **Coral** | `#E8600A` | Warm orange. Energy, justice services, community action. |
| **Star Gold** | `#F5A623` | Rich gold. Celebration, Elder wisdom, milestones. |

### Cultural — use sparingly

Reserved for moments of cultural significance.

| Name | Hex | Role |
|------|-----|------|
| **Turtle Red** | `#8B1A1A` | Deep red from the logo. Cultural ceremony, Elder content borders. |
| **Sand** | `#FEF3C7` | Warm cream. Community voices backgrounds, acknowledgement sections. |

### Dark

| Name | Hex | Role |
|------|-----|------|
| **Midnight** | `#1A1A2E` | Deep indigo. Back cover, dark hero sections, night sky. |

### Neutrals — warm-toned only, nothing cold or blue-grey

| Name | Hex | Role |
|------|-----|------|
| **Rock** | `#292524` | Primary body text. Warm near-black. |
| **Driftwood** | `#6B6560` | Secondary text, captions, metadata. |
| **Muted** | `#A39E99` | Tertiary text, running headers, page numbers. |
| **Shell** | `#F7F6F4` | Card backgrounds, info boxes. |
| **Border** | `#E8E6E3` | Subtle warm borders, dividers. |
| **White** | `#FFFFFF` | Page backgrounds. |

### Gradients

| Name | Stops | Usage |
|------|-------|-------|
| **Hero** | `#2D2319 → #8B1A1A → #C8963E` | Homepage hero, major landing sections |
| **Ocean** | `#0B4F6C → #0EA5E9` | PDF section labels, interactive highlights |
| **Warm** | `#C8963E → #F5A623` | Celebration, milestone callouts |
| **Subtle** | `#FFFFFF → #FEF3C7` | Warm page wash, community content |

### Colour coding conventions

| Content type | Colour | Hex |
|-------------|--------|-----|
| Health services | Mangrove | `#15803D` |
| Family services | Ochre | `#C8963E` |
| Justice services | Coral | `#E8600A` |
| Community services | Ocean | `#0B4F6C` |
| Economic development | Reef | `#0EA5E9` |
| Digital services | Star Gold | `#F5A623` |
| Elder wisdom | Turtle Red | `#8B1A1A` |
| Community story | Ocean | `#0B4F6C` |
| Community vision | Mangrove | `#15803D` |
| Community feedback | Reef | `#0EA5E9` |

### Accessibility — WCAG 2.1 AA minimum

| Combination | Ratio | Pass? |
|-------------|-------|-------|
| Rock on White | 14.5:1 | AA |
| Ocean on White | 8.2:1 | AA |
| Ochre on White | 3.3:1 | Large only |
| White on Ocean | 8.2:1 | AA |
| White on Midnight | 15.1:1 | AA |
| White on Earth | 14.8:1 | AA |

**Rule:** Ochre is never used for body text on white — only for borders, accents, and large display text. For small text, darken to `#9A7520`.

---

## Part IV — Typography

Two fonts. Caveat for warmth and humanity. Inter for clarity and professionalism.

### Font families

| Font | Role | Weights | Fallback |
|------|------|---------|----------|
| **Caveat** | Display headings, stat values, cover titles, mission statements | Regular (400), Bold (700) | cursive |
| **Inter** | Body text, UI, labels, headers, buttons, captions — everything else | Regular (400), Semibold (600), Bold (700) | system-ui, sans-serif |

### Type scale — PDF (React PDF, A4 at 72dpi)

| Element | Font | Size | Weight | Line height | Colour | Letter spacing |
|---------|------|------|--------|-------------|--------|---------------|
| Cover title | Caveat | 44pt | Bold | 1.1 | White | 0 |
| H1 | Caveat | 32pt | Bold | 1.15 | Ocean | 0 |
| H2 | Caveat | 24pt | Bold | 1.2 | Ocean | 0 |
| H3 | Inter | 14pt | Bold | 1.3 | Ocean | 0 |
| H4 | Inter | 11pt | Bold | 1.3 | Ocean | 0 |
| Lead | Inter | 11pt | Regular | 1.7 | Driftwood | 0 |
| Body | Inter | 9.5pt | Regular | 1.65 | Driftwood | 0 |
| Body small | Inter | 8.5pt | Regular | 1.6 | Driftwood | 0 |
| Stat value | Caveat | 32pt | Bold | 1.0 | (accent) | 0 |
| Section label | Inter | 7.5pt | Bold | 1.0 | Reef | 2px uppercase |
| Running header | Inter | 6.5pt | Semibold | 1.0 | Muted | 2px uppercase |
| Page number | Inter | 8pt | Regular | 1.0 | Muted | 0 |
| Caption | Inter | 7.5pt | Regular | 1.4 | Muted | 0 |
| Mission text | Caveat | 22pt | Regular | 1.3 | White | 0 |

### Type scale — Web (Tailwind)

| Element | Class | Size | Weight | Line height |
|---------|-------|------|--------|-------------|
| Hero H1 | `text-4xl md:text-5xl lg:text-6xl` | 36–60px | Bold (700) | 1.1 |
| Section H2 | `text-3xl md:text-4xl` | 30–36px | Bold (700) | 1.2 |
| Card H3 | `text-xl md:text-2xl` | 20–24px | Bold (700) | 1.3 |
| Body Large | `text-lg` | 18px | Regular (400) | 1.7 |
| Body | `text-base` | 16px | Regular (400) | 1.75 |
| Body Small | `text-sm` | 14px | Regular (400) | 1.6 |
| Label | `text-sm` | 14px | Medium (500) | 1.4 |
| Button | `text-base` | 16px | Semibold (600) | 1.5 |
| Caption | `text-xs` | 12px | Regular (400) | 1.5 |

### Typography rules

1. **Caveat is for display only.** Never body text, labels, or UI. It is the "handshake" — warm, personal, human.
2. **Inter does the work.** All functional text is Inter.
3. **No third font.** Two fonts is the rule. Emphasis comes from weight, size, or colour — never another typeface.
4. **Uppercase sparingly.** Only section labels and running headers use uppercase + tracking. Never uppercase headings or body text.
5. **Maximum line length.** Body text max 65ch on web (`max-w-prose`), 495pt content width on PDF.

---

## Part V — Spacing system

### Base unit

**4px (1pt in PDF, 0.25rem on web).** All spacing is a multiple of 4.

### Scale

| Token | PDF (pt) | Web (rem) | Pixels | Usage |
|-------|----------|-----------|--------|-------|
| `xs` | 4 | 0.25 | 4 | Tight gaps (icon + text) |
| `sm` | 8 | 0.5 | 8 | Small internal padding |
| `md` | 12 | 0.75 | 12 | Component internal gaps |
| `base` | 16 | 1.0 | 16 | Default padding, paragraph spacing |
| `lg` | 24 | 1.5 | 24 | Card padding, element groups |
| `xl` | 32 | 2.0 | 32 | Section element spacing |
| `2xl` | 48 | 3.0 | 48 | Section padding (top/bottom) |
| `3xl` | 64 | 4.0 | 64 | Major section spacing |
| `4xl` | 96 | 6.0 | 96 | Hero section padding |

### PDF page layout

- Page size: A4 portrait (595.28 × 841.89pt / 210 × 297mm)
- Standard page margins: 50pt all sides (17.6mm)
- Content width: 495.28pt
- Standard page top padding: 60pt (running header)
- Standard page bottom padding: 50pt (page number)
- Full-bleed pages: 0pt margins (cover, back cover)

### Web layout

- Container max width: 1280px (`max-w-7xl`)
- Text max width: 768px (`max-w-3xl`) for long-form
- Container padding: `px-4 sm:px-6 lg:px-8`
- Section vertical padding: `py-12 md:py-16 lg:py-20`
- Grid gap: `gap-6 md:gap-8`

---

## Part VI — Photography & imagery

### Style direction

Photos should feel **authentic, warm, and community-centred.** Real people, real moments, real places on Palm Island. Never stock. Never staged corporate.

| Mood | Examples |
|------|---------|
| **Celebratory** | Community events, graduations, NAIDOC week, award ceremonies |
| **Working** | Staff delivering services, meetings, training, health clinics |
| **Country** | Palm Island landscapes, reef, beach, mangroves, sunsets |
| **Cultural** | Dance, art, ceremony (with Elder approval), traditional practices |
| **People** | Portraits, group shots, children, Elders, families |

### Treatment

- No filters or heavy colour grading. Natural tones, true-to-life.
- Brightness and contrast can be adjusted for print/PDF clarity.
- Text overlay: dark gradient from transparent to `rgba(0,0,0,0.7)` when text sits over photo.
- Border radius: 0 for full-bleed, 8–12px for web card images, 8pt for PDF card images.

### Cultural photography protocols

- **Elder photos** require explicit approval (`elder_approval_given = true` in database)
- **Ceremony and cultural practice** photos require Elder sign-off before publication
- **Children** require parental consent
- **Sensitivity levels:** `standard` (open use), `sensitive` (restricted contexts), `restricted` (Elder approval per use)
- **Never use** photos of deceased persons without family consultation (Sorry Business)

### Aspect ratios

| Context | Ratio |
|---------|-------|
| Hero / cover | 3:4 portrait (A4) or 16:9 landscape (web hero) |
| Card images | 3:2 or 16:9 |
| Thumbnails | 1:1 square |
| Photo spread (PDF) | Mix of 3:2 and 4:3 |
| Avatar | 1:1 circle |

---

## Part VII — Brand motifs

All decorative elements derive from the **sea turtle logo and its concentric dot circles.** Never generic geometric patterns (hexagons, triangles, abstract shapes). Every decoration connects back to culture, country, or the logo.

| Motif | Form | Usage | Colour | Notes |
|-------|------|-------|--------|-------|
| **Concentric dots** | 2–3 rings of evenly-spaced dots radiating from a centre | Subtle page accents, section backgrounds, watermarks | Ocean, Ochre, or Turtle Red at 6–12% opacity | Atmosphere, not information |
| **Arc dots** | Curved dot trail (quarter- or half-arc), diminishing size | Corner accents, section transitions | Same as concentric | Parallel trails supported |
| **Star marker** | 4-point SVG star — Kuling (Milky Way) reference | List bullets, highlight markers, Elder wisdom indicators | Star Gold `#F5A623` or Ochre `#C8963E` | 6–10pt PDF, 12–16px web |
| **Section divider** | Horizontal dot row that swells to centre then diminishes | Between major sections | Border `#E8E6E3` or Ocean at 20% | Full content width |
| **Corner brackets** | L-shaped brackets at content corners | Featured content, pull quotes, Elder wisdom | Ocean, Ochre, or Turtle Red at 15–30% | 20–30pt per arm |
| **Constellation** | Scattered dots at seeded-random positions | Back cover, dark-background sections only | Star Gold at 8% opacity | 15–25 dots per A4 |
| **Wave** | Full-width subtle SVG wave, two overlapping paths | Data-heavy pages as softening element | White (on dark) or Ocean (on light), 5–8% opacity | Page-bottom placement |
| **Gradient bar** | Small decorative bar (60–100pt × 3–4pt) | Below section labels, separating org name from title on covers | Ocean → Reef gradient | Signature rhythm mark |

---

## Part VIII — Components

### Cards

**Standard card — PDF**
- 48% width in 2-column grid
- White background, 1pt Border, 8pt border-radius
- 3pt coloured LEFT border (category colour)
- Title: Inter 10pt Bold, Ocean
- Description: Inter 8.5pt Regular, Driftwood
- Padding: 10pt · Optional badge pill (top-right)

**Standard card — Web**
```
bg-white rounded-xl shadow-sm border border-[#E8E6E3] overflow-hidden
hover:shadow-md transition-shadow
```
Padding `p-6` · Title `text-lg font-bold text-[#292524]` · Desc `text-sm text-[#6B6560]`

**Stat card — PDF**
- 48% width, white bg, 1pt Border, 10pt border-radius
- 3pt coloured TOP border (accent colour)
- Value: Caveat 32pt Bold in accent colour
- Label: Inter 9pt Regular, Driftwood
- Padding: 12pt

**Voice card — PDF**
- 48% width, white bg, 1pt Border, 10pt border-radius
- 3pt coloured TOP border (voice-type colour)
- Type label: Inter 7pt Bold uppercase, voice-type colour
- Quote: Inter 9pt Italic, Rock
- Author: Inter 8pt Regular, Driftwood

### Quote block

- 3pt coloured left border — Turtle Red for Elder · Ocean for community · Mangrove for vision
- Left padding: 16pt (PDF) / `pl-4` (web)
- Quote text: Inter 11pt Italic, Rock (PDF) / `text-base italic text-[#292524]` (web)
- Attribution: Inter 8.5pt Regular, Driftwood / `text-sm text-[#6B6560]`
- Optional Corner Brackets for Elder quotes

### Buttons — web

```
// Primary
bg-[#0B4F6C] text-white px-6 py-3 rounded-lg font-semibold
hover:bg-[#094158] transition-colors

// Secondary
bg-white text-[#0B4F6C] border-2 border-[#0B4F6C] px-6 py-3 rounded-lg font-semibold
hover:bg-[#f0f9ff] transition-colors

// Accent (CTA)
bg-gradient-to-r from-[#0B4F6C] to-[#0EA5E9] text-white px-8 py-4 rounded-lg font-semibold
hover:from-[#094158] hover:to-[#0B8FCC] transition-all shadow-lg hover:shadow-xl

// Ghost
text-[#6B6560] hover:bg-[#F7F6F4] px-4 py-2 rounded-lg font-medium transition-colors
```

### Badges & tags

```
// Year badge
inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
bg-[#f0f9ff] text-[#0B4F6C]

// Status badge (active)
bg-[#ecfdf5] text-[#15803D]

// Status badge (draft)
bg-[#F7F6F4] text-[#6B6560]

// Status badge (archived)
bg-[#FEF3C7] text-[#9A7520]

// Category tag
text-xs px-3 py-1 rounded-full border border-[#E8E6E3] text-[#6B6560]
```

### Person avatar

- Circular, default 48px (web) / 48pt (PDF)
- Photo with `border-radius: 50%` and 2px white border
- Fallback: coloured circle (Ocean, Ochre, or Mangrove) with white initials in Inter Bold
- Elder avatars: subtle Star Gold ring border to indicate Elder status

### Navigation — web header

```
sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E8E6E3]
```
Logo 40px height, left-aligned · Links Inter 14px Semibold Rock, `hover:text-[#0B4F6C]` · Height 64px

### Tables — PDF

- Header row: Shell background, Inter 8pt Bold uppercase Ocean, 1px bottom border
- Body rows: Inter 8.5pt Regular Driftwood, alternating white/Shell backgrounds
- Cell padding: 6pt vertical, 8pt horizontal
- No vertical borders. Horizontal borders only (Border colour at 50%)

---

## Part IX — Tone of voice

### Writing principles

1. **Community-first language.** "Our community" not "the community." "Palm Islanders" not "residents." "People" not "clients" (unless formal reporting context).
2. **Active voice.** "PICC delivered 20 programs" not "20 programs were delivered."
3. **Specific and evidence-based.** Real numbers, real names (with permission), real outcomes. Never vague feel-good claims.
4. **Respectful of knowledge systems.** Elder knowledge is knowledge, not "stories" or "folklore." Traditional practices are practices, not "customs."
5. **Warm but not informal.** Professional enough for government, warm enough for community. Avoid jargon, acronyms (unless defined), and bureaucratic language.

### Vocabulary guide

| Prefer | Avoid |
|--------|-------|
| Self-determination | Empowerment (overused, implies power is given) |
| Community-controlled | Community-based (less specific) |
| First Nations, Aboriginal and Torres Strait Islander | Indigenous (too generic), ATSI (acronym dehumanises) |
| Elders | Elderly, old people |
| Country, saltwater country | Land, territory (too legal) |
| Community members, Palm Islanders | Clients, beneficiaries, target population |
| Knowledge holders | Informants, subjects |
| Cultural practice | Custom, tradition (can sound antiquated) |
| Integrated services | Silos, programs (when describing the holistic model) |

### Cultural sensitivity

- **Acknowledgement of Country** appears on every report and major page.
- **Elder content** is always attributed and approved.
- **Sorry Business:** never use names or images of recently deceased without family consultation.
- **Traditional Knowledge** is flagged with `contains_traditional_knowledge` and treated as intellectual property of the community.
- **Hull River narrative** is central to organisational identity — handle with gravity and respect.

---

## Part X — PDF page anatomy

### Standard content page

```
┌─────────────────────────────────────┐
│  Running Header (org | section)     │  ← 6.5pt Inter Semibold uppercase Muted
│                                     │
│  SECTION LABEL                      │  ← 7.5pt Inter Bold uppercase Reef
│  ───── (gradient bar)               │  ← 60pt Ocean→Reef, 3pt tall
│  Display Heading                    │  ← 32pt Caveat Bold Ocean
│  Lead paragraph text here...        │  ← 11pt Inter Regular Driftwood
│                                     │
│  ┌──────────┐  ┌──────────┐         │  ← 2-col grid, 48% width each
│  │ Card     │  │ Card     │         │
│  └──────────┘  └──────────┘         │
│                                     │
│              · 3 ·                  │  ← Page number 8pt Inter Muted
└─────────────────────────────────────┘
```

### Cover page

- Full-bleed community photo or gradient fallback with dark gradient overlay at bottom
- Logo 48×48pt, top-left, 30pt in from edges
- 60pt white bar (2pt thick) above title block
- ORG NAME: 12pt Inter Semibold uppercase white
- "Annual Report 2024-25": 44pt Caveat Bold white

### Back cover page

- Midnight `#1A1A2E` background
- Constellation pattern (Star Gold 8%, 15–25 dots)
- Centred logo 120×120pt
- Mission: 22pt Caveat Regular white, centred
- White bar 60pt × 3pt at 40% opacity
- Contact block: 9pt Inter Regular white (ABN, PO Box, URL)
- Report label: 7pt Inter white 50% opacity

---

## Part XI — Audience targeting

Visual system stays identical across audiences — only page selection and ordering change.

| Audience | Pages | Focus |
|----------|-------|-------|
| **Community** | 15 | Stories, photos, celebration, youth voices |
| **Funder** | 14 | Financials, compliance, accountability, outcomes |
| **Supporter** | 13 | Impact, innovation, inspirational narratives |
| **Board** | 16 | Comprehensive governance, strategy, full data |
| **Government** | 14 | Formal compliance, metrics, service delivery |

---

## Part XII — Animation & motion (web)

### Principles

1. **Purposeful.** Animations guide attention or provide feedback. Never decorative.
2. **Fast.** 200–300ms transitions, 150ms micro-interactions.
3. **Respect motion preferences.** Always honour `prefers-reduced-motion`.

### Standard timing

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button hover | 200ms | ease-in-out |
| Card hover shadow | 300ms | ease-in-out |
| Page element fade-in | 500ms | ease-out |
| Stagger reveal (per item) | +100ms delay | ease-out |
| Modal open | 200ms | cubic-bezier(0.22, 1, 0.36, 1) |

### Custom easing

```css
--ease-elegant: cubic-bezier(0.22, 1, 0.36, 1);
```

---

## Part XIII — Accessibility

### Standards

- **WCAG 2.1 AA** minimum for all public-facing content
- **WCAG 2.1 AAA** target for Elder-facing and community content

### Requirements

| Requirement | Standard |
|-------------|----------|
| Text contrast | 4.5:1 minimum (3:1 large text) |
| Focus indicators | Visible ring on all interactive elements |
| Keyboard navigation | Full keyboard access, logical tab order |
| Screen readers | Semantic HTML, ARIA labels, descriptive alt text |
| Motion | `prefers-reduced-motion` respected |
| Text scaling | Content usable at 200% zoom |

### Focus state

```css
*:focus-visible {
  outline: 2px solid #0B4F6C;
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

# Part XIV — Editorial system (Annual Report only)

**Editorial thesis:** Voice carries equal weight to data, and visual restraint signals confidence.

Six rules. Three are table stakes. Three are deliberate departures from how every other ACCO annual report looks. This section governs the annual report only; the brand guide is the source of truth for everything else.

### Rule 1 — Photo treatment: three modes, used consistently

Every photo is one of three modes. Chosen by what the moment is, not what is convenient.

| Mode | Use | Treatment |
|------|-----|-----------|
| **Cultural opener** | Country, ceremony, Elder portraits, Hull River, on-Country trips | Full-bleed. No caption. No text overlay. The photo speaks. |
| **Editorial spread** | Programs, events, milestones | 3:2 with white-space halo. Italic Inter caption in Driftwood `#6B6560` underneath. |
| **Operational** | Service delivery, staff at work, day-to-day | Card-contained, 8pt corner radius, clipped. Caption optional. |

**Never** mix modes on a single spread. Never use stock photography.

### Rule 2 — Quote attribution standard

Every attributed quote carries: **name · role/relationship to PICC · year captured.**

> *"We had to make our own way back."*
> — Aunty Ethel · Elder, Stolen Generations survivor · 2024

**Never** "a community member." **Never** "one staff member said." Where consent prevents naming, the quote does not run. Anonymous quotes belong in research papers, not this report.

Pull from `elder_quotes` (validated, public), `extracted_quotes`, and `interviews.themes`. If the row does not have a name and a year, the row does not get used.

### Rule 3 — Decoration cadence: one motif per spread, max

The brand offers seven decorative motifs. Spend them like currency.

**Allowed to layer motifs:** Cover · Back Cover · Bwgcolman Way anchor spread. Three pages, total.

**Everywhere else:** pick one motif. If a page already has a strong photo, no motif at all.

If you find yourself reaching for a second motif "to fill space," the page has the wrong content, not too little decoration.

### Rule 4 — Caveat earns ONE additional context: Elder pull-quotes only

The brand reserves Caveat for display use. This rule grants one documented exception.

| Voice type | Quote treatment |
|------------|-----------------|
| **Elder** | Caveat 22pt italic, ≤25 words, attributed, Turtle Red `#8B1A1A` left border, optional Corner Brackets |
| **Staff** | Inter 11pt italic, Ocean `#0B4F6C` left border |
| **Community member** | Inter 11pt italic, Ocean left border |
| **Funder / partner** | Inter 11pt italic, Driftwood left border |
| **Vision / aspiration** | Inter 11pt italic, Mangrove left border |

The Caveat exception applies only to Elder pull-quotes ≤25 words. Longer Elder passages run as Inter italic body.

**Cost:** one documented brand exception. **Gain:** Elder voice is visually distinct from staff, community, and funder voices in a way no other ACCO annual report achieves.

### Rule 5 — Voice-first column grammar (every data page)

Every page with data — stats, charts, finances, KPIs, services directory rows — uses a fixed two-column rhythm:

```
┌───────────────────────────────┬─────────────┐
│  Numbers / chart / cards      │  One voice  │
│  (66% / 327pt content width)  │  (33%)      │
│                               │             │
│                               │  attributed │
│                               │  quote      │
└───────────────────────────────┴─────────────┘
```

The right column is always the same x-coordinate across every data page. Within three pages, the reader trains: *"the number, and the human it is about, side by side."*

**Exempt:** Cover · Acknowledgement · Contents · Cultural opener spreads · Back Cover · full-bleed photo essays.

### Rule 6 — Two service colours per spread, maximum

| Page type | Colour rule |
|-----------|-------------|
| **Services directory** (lists all 30 services) | All seven service colours allowed — that is its job |
| **Featured service spreads** | One service colour owns the spread, with Ocean as constant |
| **All other spreads** | Maximum two service colours, plus Ocean as constant |
| **Cover · Bwgcolman Way · Next 20 Years** | Hero gradient or cultural palette only; service colours not used |

### How the six rules cohere

| Rule | Pulls toward |
|------|--------------|
| 1 — Photo modes | Restraint |
| 2 — Attribution | Voice |
| 3 — Decoration cadence | Restraint |
| 4 — Caveat for Elders | Voice |
| 5 — Voice-first columns | Voice |
| 6 — Two colours per spread | Restraint |

**Voice + Restraint.** A publication that trusts its content does not need to shout.

### Per-spread sign-off checklist

- [ ] Photo mode is one of the three, applied consistently across the spread
- [ ] Every quote has name · role · year, or it does not appear
- [ ] At most one decorative motif (or zero, if there is a strong photo)
- [ ] If an Elder pull-quote is present: Caveat 22pt italic, ≤25 words, Turtle Red border
- [ ] If the page contains data, it has the 33% right column with one attributed quote
- [ ] No more than two service colours, plus Ocean

---

# Part XV — 20-Year commemorative system (Oct 2027)

**Horizon:** October 2027 — 20 years of Palm Island Community Company.

### Thesis

The 20-year celebration is **not** a re-brand. It is a deliberate evolution — the brand matures into itself. The turtle, the concentric dots, saltwater country, and Bwgcolman voice stay exactly where they are. What changes is the *vocabulary of expression* built on top of them: a denser graphic language, a deeper archival use of photography, and a commemorative typography treatment reserved for the 20-year arc.

By October 2027 the system must feel like the same brand, older, quieter, and more certain of itself.

### The Twenty motif

A new primary decorative element. The only truly new graphic.

- **Form:** twenty concentric dots arranged as two tightening spiral arcs — ten dots on each arm, converging on a shared centre. Reads as motion and as completeness.
- **Derivation:** the outer rings of the logo unrolled into a spiral. Not a new shape; a re-phrasing of an existing one.
- **Exclusive usage:** cover of the 20-year publication · opening frame of Oct 2027 exhibition · anniversary site page headers · single ceremonial use on AR 2026-27 cover.
- **Not usage:** anywhere in the standard system after Oct 2027. The motif retires with the celebration.
- **Colours:** gradient from Turtle Red `#8B1A1A` (innermost dot) through Ochre `#C8963E` (midpoint) to Star Gold `#F5A623` (outer). The gradient tracks the arc, not a fill.

### Commemorative typography

Caveat earns one additional time-limited exception — mirroring the structure of the Elder pull-quote exception.

| Context | Treatment |
|---|---|
| Phrase "20 years" (numeric or spelled) | Caveat 72pt Bold, Ocean → Star Gold vertical gradient, letter-spacing −2 |
| Phrase "Year 20" | Caveat 44pt Bold, Turtle Red |
| Decade markers ("Year 2008", "Year 2017") in timeline | Caveat 24pt Regular, Ochre |

Every other headline uses the standard H1/H2 scale. Caveat is not scattered; it is earned at three specific moments.

### Palette modes — celebration overlay

Saltwater & Earth stays as the base. Three **mode overlays** are added — each a restricted subset that signals which commemorative surface you are on.

| Mode | Dominant | Accent | Use |
|---|---|---|---|
| **Sunrise** (horizon, future) | Ochre `#C8963E` | Star Gold `#F5A623` | Exhibition "next" sections, 2027-onward narrative |
| **Saltwater Deep** (archive, memory) | Ocean `#0B4F6C` | Midnight `#1A1A2E` | Timeline pages, archival photos, founding-era content |
| **Hearth** (community, presence) | Turtle Red `#8B1A1A` | Sand `#FEF3C7` | Community portrait sections, Elder voices, Bwgcolman Way spreads |

Within a single spread, one mode dominates. Editorial rule 6 (two service colours + Ocean, max) still applies — modes are curatorial metadata, not a licence for more colour.

### Photography language — the archive as anchor

- **Before / After pairings.** Two photos, same place, years apart. 2009 and 2027. Captioned with year, location, source. Sixty of these are the spine of the 20-year publication.
- **Uncropped Elder portraits.** Where consent allows. Large, quiet, no overlay text. Inter caption below in Driftwood. The Elder holds the page.
- **Country without people.** Every chapter opens on a Palm Island landscape without a human figure. Reef, mangrove, horizon, Hull River. The land as unchanging witness.

Standard photo treatment modes (editorial Rule 1) still apply.

### Motion — commemorative digital site

| Interaction | Treatment |
|---|---|
| Page enter | Twenty dots animate in, one per 50ms, then settle. Once per visit; stored in localStorage. |
| Timeline scroll | Year markers pulse briefly on enter (300ms, Ochre). `prefers-reduced-motion` honoured — replaced by static border highlight. |
| Elder quote reveal | Cross-fade only, 400ms. No slide, no zoom. Voice deserves stillness. |

Motion is a whisper in the 20-year system, not a performance.

### Voice — commemorative register

Standard tone of voice unchanged. One additional editorial register available for 20-year surfaces only:

**Plain past, plain future.**

> *"In 2008, seven Elders signed a deed. In 2027, we are still here, and so are they."*

No "we are proud to announce." No "it is with great pleasure." Facts, dates, consequences. The longer the view, the quieter the tone.

### The publication family — Oct 2027

Five products. Each has a defined role.

| Product | Role | Format |
|---|---|---|
| **The 20-Year Book** | Definitive anchor. 160pp hardcover. The archive, in order. | Printed book, 250 copies, community first |
| **Exhibition** | Palm Island + Townsville + travelling | 30 panels, A0, exhibition vinyl + digital kiosk |
| **Anniversary site** | Always-on digital home for the arc | Dedicated subdomain or `/20-years/` |
| **Annual Report 2026-27** | Standard AR carrying commemorative cover + 8-page insert | Standard AR pipeline, extended |
| **Community Video** | 8–12 min. Voices first, land second, statistics third. | MP4 + captioned, distributed via GHL + socials |

A proposal for a sixth product needs a named reason that is not "because we could."

### Timeline

| Date | Milestone |
|---|---|
| Apr 2026 | Vision locked (v1.0) |
| Jul 2026 | Twenty motif finalised; exhibition curatorial framework drafted |
| Oct 2026 | Archive consent pass complete |
| Dec 2026 | First draft of The 20-Year Book to Rachel + Elders Council |
| Mar 2027 | AR 2026-27 design freeze — includes 20-year insert |
| Jul 2027 | Exhibition panels print-ready |
| Sep 2027 | Anniversary site live; video locked |
| **Oct 2027** | **20-year celebration — Palm Island** |
| Nov 2027 | Twenty motif retires. System reverts to standard brand. |

### Governance

Any 20-year surface requires sign-off from **all three**:

1. **Rachel Atkinson** (CEO) — strategic and editorial
2. **Elders Council representative** — cultural protocol, photograph consent at category level
3. **Brand custodian** (current: Ben Knight) — adherence to the system

No single role can green-light a commemorative product alone.

### What the 20-year system is not

- Not a re-brand guide. If you find yourself changing the logo, palette base, or type pair, stop.
- Not a marketing campaign. It is commemorative — it looks inward first.
- Not a licence for more decoration. Read editorial Rule 3 again: one motif per spread.
- Not permanent. The Twenty motif and commemorative Caveat treatment retire November 2027.

---

## Part XVI — Quick reference (cheat sheet)

```tsx
// Primary button (web)
className="bg-[#0B4F6C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#094158] transition-colors"

// Accent CTA
className="bg-gradient-to-r from-[#0B4F6C] to-[#0EA5E9] text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl"

// Body text
className="text-[#292524] leading-relaxed"

// Headline (H1)
className="font-[Caveat] text-4xl md:text-5xl lg:text-6xl font-bold text-[#0B4F6C]"

// Section label
className="text-xs uppercase tracking-widest font-bold text-[#0EA5E9]"

// Link
className="text-[#0B4F6C] hover:text-[#0EA5E9] underline"

// Card
className="bg-white rounded-xl shadow-sm border border-[#E8E6E3] p-6 hover:shadow-md transition-shadow"

// Subtle section wash
className="bg-gradient-to-b from-white to-[#FEF3C7]"

// Hero gradient
className="bg-gradient-to-br from-[#2D2319] via-[#8B1A1A] to-[#C8963E]"

// Focus ring (global)
className="focus-visible:outline-2 focus-visible:outline-[#0B4F6C] focus-visible:outline-offset-2"
```

---

## Part XVII — File reference (source repo)

| Asset | Path |
|-------|------|
| Master brand guide | `PICC-BRAND-STYLE-GUIDE.md` |
| Editorial system | `ANNUAL-REPORT-EDITORIAL.md` |
| 20-year vision | `20-YEAR-BRAND-VISION.md` |
| PDF theme (colours, styles) | `lib/pdf/theme.ts` |
| PDF components | `lib/pdf/components/` |
| PDF templates | `lib/pdf/templates/` |
| Logo | `public/logo/picc-logo-full.png` |
| Fonts (PDF) | `lib/pdf/fonts/` (Inter, Caveat) |
| Tailwind config | `tailwind.config.js` |
| Global CSS | `app/globals.css` |
| SuperDesign system | `.superdesign/design-system.md` (auto-generated) |

---

## Version history

| Pack version | Date | Source versions | Notes |
|---|---|---|---|
| 1.0 | 2026-04-20 | Brand 2.0 · Editorial 1.0 · 20-Year 1.0 | Initial consolidated pack for Claude design-system tool. |

---

*When in doubt, ask two questions: "Does this feel like Palm Island?" and "Does this trust the content, or shout over it?"*
