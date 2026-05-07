# BRAND.md — PICC

*Saltwater & Earth v2.0 · single-file design DNA for any agent or human producing PICC output.*

This is the recipe. It does not replace the canonical reference docs — it distils them into a portable file you can drop into a prompt, a brief, or a new surface. When agents stay on-brand without being told, this is why.

**Canonical longer references (don't duplicate — read when in doubt):**
- [PICC-BRAND-STYLE-GUIDE.md](web-platform/PICC-BRAND-STYLE-GUIDE.md) — full visual system
- [PICC-DESIGN-SYSTEM-CLAUDE-PACK.md](web-platform/PICC-DESIGN-SYSTEM-CLAUDE-PACK.md) — agent-focused pack
- [SOUL.md](SOUL.md) — voice, registers, names that matter
- [USER.md](USER.md) — who the editor (Ben) is

---

## 1 · Identity, in one breath

Palm Island Community Company is **community-controlled, not community-engaged**. Year 17 of a 20-year vision. 197 staff, $23.4M revenue, all run from one island. The brand is the ocean around it, the earth under it, the night sky above it. Saltwater & Earth.

> "PICC belongs to the community." — Luella
> "Working with the community, not for the community." — Rachel
> "Most of every PICC dollar pays a Palm Islander to deliver a service to another Palm Islander."

If output doesn't sound like that, rewrite it.

---

## 2 · Personality (5 traits · what it is, what it isn't)

| Trait | Is | Isn't |
|---|---|---|
| **Warm** | Welcoming, human, community-centred | Casual, informal, unserious |
| **Grounded** | Rooted in place, culture, evidence | Conservative, backwards-looking |
| **Bold** | Confident, ambitious, unapologetic | Aggressive, boastful, loud |
| **Innovative** | Forward-thinking, adaptive | Trendy, gimmicky, tech-for-tech's-sake |
| **Respectful** | Culturally safe, Elder-guided, dignified | Tokenistic, performative, paternalistic |

---

## 3 · Voice — three registers

Every piece of copy fits one of these. If it fits none, it's wrong.

**A · Rachel register** (CEO, Chair messages, frontmatter)
Plain-spoken, direct, Australian. Reflective in long form, sharp in short. Closes lines that would land in a meeting. Names move between specific ("Hailey and her team") and aggregate ("twenty-one Palm Islanders").

**B · Luella register** (Chair, governance, declaratives)
Public-record cadence. Sharper. Shorter. *"We do not move on these numbers. They are the point."*

**C · Service / Operations register** (service descriptions, captions, infographic numbers)
Specific. Short. Cited in the order staff would cite them. *"Auspiced since 2008. Six staff. ~120 community members supported a year."*

**Voice authenticity test:** *Would the lead person on this service read this aloud and recognise it?* If no, rewrite.

---

## 4 · Anti-patterns (never do)

- "We helped / provided / delivered." PICC is the community delivering to itself. Reframe.
- Generic service descriptions that fit any ATSICCO. They must fit *this* one.
- Cultural language used decoratively. *Bwgcolman* is not a brand element.
- Photos that treat Elders as decoration. Cultural authority is governance, not garnish.
- Numbers without provenance. Every figure traces to a verified source.
- Cherry-picking heroic stories and hiding the floods. The flood and the rebuild are the same story.
- Generic AI patterns: purple gradients, em-dashes used as drama beats, "Imagine if…" openers, "harness the power of," "leverage," "synergies."
- Cookie-cutter SaaS layouts. Every PICC surface should *feel like Palm Island*, not like another startup.

---

## 5 · Colour — Saltwater & Earth

Source of truth: [`web-platform/components/annual-report/2024-25/almanac/tokens.ts`](web-platform/components/annual-report/2024-25/almanac/tokens.ts) (server-safe) and [`web-platform/lib/pdf/theme.ts`](web-platform/lib/pdf/theme.ts) (PDF). Both mirror Pencil variables and rebuild via `npm run tokens:build`.

### Core (these three are the brand)

| Token | Hex | Use |
|---|---|---|
| `ocean` | `#0B4F6C` | Primary. Headings, borders, trust. Deep waters around Palm. |
| `ochre` | `#C8963E` | Accent. The signature PICC colour. Heritage, warmth. |
| `earth` | `#2D2319` | Anchor. Deepest text, hero gradient base. |

### Supporting (functional)

| Token | Hex | Use |
|---|---|---|
| `reef` | `#0EA5E9` | Links, interactive highlights |
| `mangrove` | `#15803D` | Health services, growth, success |
| `coral` | `#E8600A` | Justice services, energy, action |
| `starGold` | `#F5A623` | Celebration, Elder wisdom, milestones |

### Cultural (sparingly)

| Token | Hex | Use |
|---|---|---|
| `turtleRed` | `#8B1A1A` | Cultural ceremony, Elder content borders |
| `sand` | `#FEF3C7` | Community-voices backgrounds, acknowledgement sections |

### Anchor + neutrals

| Token | Hex | Use |
|---|---|---|
| `midnight` | `#1A1A2E` | Dark hero sections, back covers |
| `shell` | `#F7F6F4` | Section panels |
| `driftwood` | `#6B6560` | Body / muted |
| `border` | `#E8E6E3` | Hairlines |

### Section colours (service / report sections)

`childrenFamilies → ochre · healthWellbeing → mangrove · justiceSafety → coral · youth → reef · economic → starGold · educationCommunity → ocean · governance → turtleRed`

### Colour rules
- **Never use purple gradients.** Generic SaaS tell.
- **Never use cold blue-grey neutrals.** PICC neutrals are warm-toned.
- One supporting colour per surface. Don't stack three accents.
- Cultural colours (`turtleRed`, `sand`) are reserved. Don't use them as decoration.

---

## 6 · Typography

Loaded in [`app/layout.tsx`](web-platform/app/layout.tsx) via `next/font`.

| Family | Role | Where |
|---|---|---|
| **Fraunces** | Display, headings, big quotes | h1–h3, hero, pull-quotes |
| **Inter** | Body, UI, microcopy | paragraphs, buttons, captions |
| **Caveat** | Curator's hand | MarginNote component only |

### Type scale (use these, not arbitrary sizes)

```
Display     clamp(40px, 7vw, 72px)   Fraunces 700  leading 1.05
H1          clamp(36px, 6vw, 64px)   Fraunces 700  leading 1.1
H2          28–32px                  Fraunces 700  leading 1.15
H3          22–24px                  Fraunces 600  leading 1.25
Lead body   18–20px                  Fraunces 400  leading 1.5–1.6
Body        15–16px                  Inter    400  leading 1.55
Small       13–14px                  Inter    400  leading 1.5
Caption     11–12px                  Inter    700  letter-spacing 0.3em uppercase
```

**Typography rules**
- Captions and section labels are *always* uppercase 11px Inter 700 letter-spacing 0.3em — that cadence is the brand.
- Big quotes and section heads are *always* Fraunces. Don't mix Inter into display roles.
- Line-height tight for display, generous (1.5+) for body. The page should breathe.

---

## 7 · Spacing & layout grammar

Saltwater Almanac grammar — the visual rhythm:

- Wide gutters: 24px on mobile, 48px+ on desktop. Don't crowd.
- Sections separate by colour-block (`shell` panel) or photograph, not by hairlines.
- Caption labels above the heading, not below. (Tiny uppercase 11px → Fraunces display.)
- Margin notes (Caveat) live in the right rail or below the body.
- Hero pattern: full-bleed photo · short caption underneath · big Fraunces line · short body. In that order.

Spacing scale: Tailwind default (`px-6 md:px-12 py-12 md:py-20` is the standard section).

---

## 8 · Motion

Tokens (in `lib/design/tokens.ts`):
```
duration: instant 0  · fast 150  · normal 300  · slow 500  · slower 700  (ms)
easing:   linear · easeIn · easeOut · easeInOut · spring
```

**Rules**
- Default to `easeOut` `200–300ms` for hover and reveal. Never spring everything.
- Hero / scroll-driven motion: `easeInOut` `500–700ms` only when motion serves story.
- Reduced-motion: respect `prefers-reduced-motion`. Drop to fade or none.
- No purple-gradient laser-show generic AI effects. PICC motion is restrained.

---

## 9 · Logo

[`web-platform/public/logo/picc-logo-full.png`](web-platform/public/logo/picc-logo-full.png) (32KB) · transparent variant in same dir.

The mark is a sea turtle in Indigenous art style with concentric dot circles. **Never** stretch, recolour, drop-shadow, or recreate it. Min sizes: 25mm print · 48px screen · 32px favicon (simplified turtle). Clear space = half logo height on all sides.

---

## 10 · Icons

All bespoke icons live in **Supabase Storage** (`platform-icons` bucket) and are gitignored in `public/`. Resolve via `assetUrl()` or use the canonical [`<BespokeIcon name=…>`](web-platform/components/ui/BespokeIcon.tsx) component — **never** hardcode `/icons/bespoke/<slug>.png` as a `<Image src>`, that path returns 404 in production.

| Set | Resolver path | Use |
|---|---|---|
| **PICC bespoke** (44 services) | `assetUrl('/icons/bespoke/<slug>.png')` | Service grids, navigation. PICC's own. |
| **PICC bespoke white** | `assetUrl('/icons/bespoke-white/<slug>.png')` | Dark backgrounds. |
| **PICC sections** (10 + 8 infographics + 5 motifs) | `assetUrl('/icons/picc/<…>')` | Annual report sections, room icons, motifs. |
| **lucide-react** | `import { Icon } from 'lucide-react'` | UI utility only (search, close, chevron). |

**Icon rule:** if it represents a PICC service or section, use the bespoke set via `<BespokeIcon>`. Lucide is for UI utility only — never for service identity.

---

## 11 · Photos & assets

Heavy assets live in **Supabase Storage**, not in `public/`. The resolver is [`web-platform/lib/media/asset-url.ts`](web-platform/lib/media/asset-url.ts) — `assetUrl('/picc-photos/board/rachel.jpg')` returns the bucketed URL.

| Bucket | Prefix | Holds |
|---|---|---|
| `platform-documents` | `documents/` | PDFs |
| `platform-media` | `picc-photos/`, `hero-assets/`, `video/`, `annual-report-photos/`, `archive-photos/`, `report-assets/` | Photos, video |
| `platform-icons` | `icons/bespoke`, `icons/picc` | Bespoke icon sets |

**Photo source-of-truth: Empathy Ledger v2.** Pull live via [`lib/media/el-photos.ts`](web-platform/lib/media/el-photos.ts) — slot-tagged, consent-cleared, returns `ELPhoto[]`.

**Use the right helper for the job:**

| Need | Helper | Behaviour on empty |
|---|---|---|
| All photos for one specific service | `getCanonicalPhotosForService(slug)` | Falls back to slot-tag mechanism |
| Photos in one specific slot | `getPhotosForSlot(slot, limit)` | Returns `[]` |
| Photos across a priority list of slots | `getPhotosForSlots([s1, s2, s3], limit)` | Returns first non-empty slot's photos |
| Hero / single photo with fallback | `getPhotoForSlots([s1, s2, s3])` | Returns first available |
| Anything consented (last-resort showcase) | `getAnyConsentedPhotos(limit)` | Pulls from any non-empty slot |

**Verify the slot exists before using it.** Run `npm run check-el` — it prints the live slot inventory with counts. Common slots that actually exist (as of FY24-25): `voices-wall` · `gallery` · `elders-on-country` · `feature-bwgcolman-healing` · `feature-beai` · `feature-first-1000-days` · `bwgcolman-way` · `cover` · `services` · `governance` · `journey` · `youthVoices` · `communityVoices`. Slot names are exact-match — `community-voice` is **not** the same as `communityVoices`.

**Pages that show photos must never show an empty state.** Always end the fallback chain with `getAnyConsentedPhotos()` for showcases, or with a graceful tonal placeholder for service-specific pages where forcing unrelated photos would be misleading.

**Photo rules**
- Never commit binary assets to git. Upload → reference via `assetUrl()`.
- Every photo of a named person needs consent (filtered server-side in EL v2).
- Every Elder photo runs through cultural review before public lift.
- Captions are non-decorative: name people, place, date. Generic captions are a tell.

---

## 12 · Surface checklist

Every new PICC page must:

1. Use **Fraunces** for display + **Inter** for body. No system fonts.
2. Use the **palette tokens** above. No hex literals outside `tokens.ts` / `theme.ts`.
3. Pull photos via `assetUrl()` or `el-photos.ts`. Never hardcode bucket URLs.
4. Use the **uppercase-11-letterspaced caption** above headings. It's the cadence.
5. Pass the **voice authenticity test** for any copy that names a person, service, or number.
6. Respect the section-colour map (children → ochre, health → mangrove, etc.) for accents.
7. Carry an Elder review flag if it surfaces Elder content.
8. Cite numbers (provenance — `thoughts/shared/templates/provenance-template.md` if data-driven).

---

## 13 · The 20-year story (why everything above exists)

The brand is in service of one story: **the next 20 years are a design choice, not a forecast.**

Three threads braided through every surface:

1. **20 years of community control.** 2007 public-co → 2021 community-controlled. 1 staff → 197. $1.6M → $23.4M.
2. **Bwgcolman Way as proof.** Part 2A delegated authority. Rachel as sole delegate. 439 children statewide by Dec 2025.
3. **Next 20 as canvas.** Six community visions. Three commitments. Three urgent asks.

Four voices braided through every page (organisation · CEO · service · community-Elders) — see [SOUL.md §Voice](SOUL.md) for the full register.

When in doubt about whether a surface is on-brand: **does it sound like a Palm Islander reading it aloud, with photos that name the people, with numbers an Elder would sign off on?** That is the bar.

---

## 14 · For agents — minimum prompt context

When working on PICC, drop this into your context:

> Working on PICC (Palm Island Community Company). Brand is *Saltwater & Earth v2.0*: Ocean #0B4F6C primary, Ochre #C8963E accent, Earth #2D2319 anchor. Fraunces for display, Inter for body. Photos via `assetUrl()` or `lib/media/el-photos.ts`. Voice is "community-controlled, not community-engaged" — use Rachel/Luella/Service registers per `SOUL.md`. Anti-patterns: purple gradients, generic SaaS chrome, "we helped" framing, decorative cultural language, photos of Elders without consent. Source of truth tokens: `web-platform/components/annual-report/2024-25/almanac/tokens.ts`. Full system: `BRAND.md`.

— end —
