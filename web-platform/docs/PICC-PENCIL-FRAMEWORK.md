# PICC × Pencil Framework

How the Pencil design tool, the React component library, and the Empathy Ledger v2 data layer fit together — and how to add new things without breaking the system.

This is the canonical method for working in this repo. If anything here goes stale, update this doc instead of working around it.

---

## 1. The mental model

Three layers, one direction of truth:

```
┌────────────────────────────────┐
│  Pencil  (.pen files)          │   Designers / editors edit here
│  picc-almanac-web.pen          │   Variables, components, page mockups
└────────────┬───────────────────┘
             │  get_variables, batch_get
             ▼
┌────────────────────────────────┐
│  Tokens                        │   Auto-synced JSON
│  tokens/picc.tokens.json       │   tokens/pencil-variables.json
│  lib/design-tokens/pdf-tokens  │   Source of every colour, spacing, font-size
└────────────┬───────────────────┘
             │  imported by
             ▼
┌────────────────────────────────┐
│  Library + Almanac             │
│  components/library/<Name>/    │   Reusable Pencil components, web + pdf
│  components/annual-report/...  │   Almanac-specific exhibition pieces
└────────────┬───────────────────┘
             │  consumed by
             ▼
┌────────────────────────────────┐
│  Routes                        │
│  app/(public)/...              │   Public site
│  app/picc/...                  │   Admin
└────────────────────────────────┘
```

**Pencil is the design source of truth. Tokens are mechanical. Components and routes are hand-written but reference tokens.** Never hardcode a colour, spacing, or font-size — pull it from `tokens.color.brand.X`, `tokens.spacing.X`, `tokens.typography.fontSize.X`.

The .pen files in `web-platform/`:
- `picc-almanac-web.pen` — **active source**. The almanac, library components, page templates.
- `picc-annual-report.pen` — older, separate. Don't pull into scope unless explicitly asked.

---

## 2. Working with Pencil from the agent side

The Pencil MCP exposes the .pen file via tools prefixed `mcp__pencil__*`. Standard read flow:

```
get_editor_state({ include_schema: true })
   → lists top-level frames + reusable components
   → only call once per session (with schema), then false thereafter

batch_get({ filePath, nodeIds: [...], readDepth: 2 or 3 })
   → reads specific nodes. Keep readDepth low (large outputs blow context)

get_variables({ filePath })
   → returns the variable map. Diff against tokens/pencil-variables.json
     to confirm sync.

snapshot_layout({ filePath, parentId, maxDepth: 2 })
   → cheap structural view when you don't need full property data
```

Convention: when adding a component, the Pencil node ID goes in `meta.ts` as `pencilNodeId`. That's the deep-link back to the source.

When the design changes:
1. Designer edits in Pencil
2. If variables changed → re-run the token sync (currently manual: `get_variables` → write `tokens/picc.tokens.json` + `tokens/pencil-variables.json`)
3. If a reusable component changed visually → update its `web.tsx` + `pdf.tsx` to match
4. If a page template changed → re-audit against the relevant page (this is the m47PD-vs-`almanac/page.tsx` audit)

---

## 3. The component library contract

Every entry in `components/library/<Name>/` carries five files:

| File | Purpose |
|---|---|
| `types.ts` | `<Name>Props` interface. Shared between web + pdf. Header comment cites Pencil node id. |
| `web.tsx` | DOM implementation. Tailwind + inline `style` using `tokens.*`. |
| `pdf.tsx` | React-PDF implementation. `StyleSheet.create` using `C`, `SP`, `TYPE` from `lib/pdf/theme` + `tokens`. |
| `sample.tsx` | Default export renders the component with realistic props. Picked up by the design-system gallery. |
| `meta.ts` | `ComponentMeta` — name, description, `pencilFile`, `pencilNodeId`, `category`, `implementations`, `sortOrder`. |

Then add the component name to `LIBRARY` in `components/library/registry.ts` so the gallery picks it up.

**What's in the library today (11 components):**

| Component | Pencil node | Wired in production? |
|---|---|---|
| WebHero | G8642 | No (Cover element is richer) |
| SectionOpener | jX21S | Almanac year-in-numbers heading |
| StatHero | XhjFb | Almanac year-in-numbers grid |
| ServiceHeroCard | C64BFX#hero | No (gallery only) |
| ServiceCompactTile | C64BFX#tile | Almanac services-by-category |
| VideoOverlayCard | GMfEM | No (gallery only) |
| MilestoneCallout | zgUWR | Almanac year-17-first |
| QuoteCardElder | LXimo | No (Lantern is the Almanac voice) |
| PhotoBlock | d5aQmE | Almanac innovation hero images |
| FinancialBars | jpeCB | Almanac financials |
| FooterCTA | USpVp | No (BackCoverSection is bespoke) |

**Almanac-specific elements** (`components/annual-report/2024-25/almanac/elements.tsx`) are the bespoke exhibition pieces — Cartouche, Reliquary, Lantern, Hearth, Horizon, Fold, MarginNote, Cover, AmbientSection. These are deliberately NOT in the library because they encode editorial choices specific to the almanac (side-alternation, consent badges, sand-bg sacred treatment for Elder voices, etc).

---

## 4. The slot system — photos and videos

Photos and videos live in **EL v2** (`empathy-ledger-v2`), not in PICC's git or Supabase. PICC fetches them by **slot tag** or **gallery join**.

### Slot tag convention

Editors tag a photo / video in `/admin/photos` on EL v2 with a key like `picc:slot:<purpose>`. PICC fetches via:

```ts
import {
  getPhotoForSlot,
  getPhotosForSlot,
  getPhotosBySlot,           // batch — returns { [slot]: ELPhoto[] }
  getPhotosForService,       // slot-tag based
  getCanonicalPhotosForService, // service_galleries join (preferred)
  getPhotosForStoryteller,
  getVideoOverlay,
  getPriorityPhotos,         // ★-flagged in EL v2 admin
} from '@/lib/media/el-photos'
```

### Slot keys (canonical)

| Surface | Slot key | Notes |
|---|---|---|
| Cover | `picc:slot:cover` | Edge-to-edge cover photo |
| Acknowledgement | `picc:slot:acknowledgement` | Painted island/horizon hero |
| CEO/Chair portraits | `picc:slot:messages` | 2 portraits, ordered |
| Back cover | `picc:slot:back-cover` | Closing photo |
| Per service | `picc:slot:service-<slug>` | Hero = first; rest = gallery |
| Anchor stories | `picc:slot:anchor-<name>` | e.g. `anchor-bwgcolman-way`, `anchor-1000d`, `anchor-ndis` |
| Video overlays | `picc:slot:video-<scene>` | e.g. `video-cover`, `video-acknowledgement` |
| Storyteller portraits | (face-tag in admin) | Resolved by `getPhotosForStoryteller(id)` |

The full editor reference is at **`/picc/almanac/photos/reference`** (admin) — that's the live docs page. Operational state (what's filled, what's missing, who flagged what) is at **`/picc/almanac/photos`**.

### The `★` priority mark

In EL v2 admin, click the ★ on any photo to mark it priority for its slot. PICC picks priority photos first when filling that slot — falls back to the rest of the gallery if there's no star. Use it to control which photo becomes the hero.

---

## 5. Data sources

Two Supabase projects. Know which one you're talking to.

| Project | URL | Used for |
|---|---|---|
| **PICC** | `uaxhjzqrdotoahjnxmbj.supabase.co` | Annual reports, services, board, stats, internal stories, elder_quotes, extracted_quotes, organization_services, media_files |
| **Empathy Ledger v2** | `yvnuayzslukamizrlhwb.supabase.co` | Storytellers, photos (consent-cleared), transcripts, EL stories, project archive |

Helpers:

```ts
// PICC supabase
import { createClient } from '@/lib/supabase/client'  // client
import { createServerSupabase } from '@/lib/supabase/client' // server

// EL v2
import {
  getELQuotes, findQuotesForPerson, groupQuotesByAuthor,
  getELTranscripts, getELStories,
  getPalmStorytellers,
  getELStats,
} from '@/lib/empathy-ledger/el-server'
```

PICC's `lib/services/el-services.ts` exposes the canonical 26-service roster with fallback to local `data-2025.ts`.

**Never** hardcode the EL URL or service-role keys — they live in env. EL v2 will return empty when `EMPATHY_LEDGER_SERVICE_KEY` isn't set; pages should degrade gracefully.

---

## 6. Bespoke icons + artwork

Source of truth: `lib/design-system/icons.ts`.

```ts
import { BESPOKE, BESPOKE_WHITE, ICONS } from '@/lib/design-system/icons'
import { BespokeIcon } from '@/components/ui/BespokeIcon'

<BespokeIcon name="quote" size={24} />          // black-on-transparent
<BespokeIcon name="quote" size={24} darkMode /> // white version
```

14 approved icons today: collection, crisis, governance, hopeful, housing, justice, land, photo, quote, reflective, restricted, search, timeline, traditionalKnowledge.

Adding a new icon:
1. Designer drops the file in EL v2 admin (or local `public/icons/bespoke/`)
2. Add path to `BESPOKE` and `BESPOKE_WHITE` maps
3. If you want it gallery-listed, add to `ICONS` map
4. Status flag is on the design-system voting page (`/picc/design-system`)

---

## 7. Routes inventory

Public:

```
/                                    Home
/voices                              Quote wall + storyteller index strip
/voices/[slug]                       Per-storyteller profile (5 sections per Pencil inORe)
/storytellers                        Storyteller gallery (PICC supabase)
/services                            Services index
/services/[slug]                     Service detail (full-bleed hero)
/share-voice                         Voice submission
/share-story                         Story submission
/annual-report/2024-25/almanac       The Saltwater Almanac
/wiki/...                            Knowledge base
```

Admin (under `/picc/`):

```
/picc/                               Index dashboard
/picc/almanac/                       Almanac admin sub-pages
/picc/almanac/photos                 Operational photo state
/picc/almanac/photos/reference       Slot reference docs (Pencil iU28D)
/picc/almanac/services-coverage      EL v2 coverage
/picc/almanac/voices                 Sprint tracker + import
/picc/almanac/checklist              Pre-publish checklist
/picc/insights/patterns              Pattern recognition
/picc/insights/timeline              Timeline view
/picc/insights/impact                Impact tracker
/picc/chat/insights                  Ask Palm AI dashboard
/picc/library                        Knowledge inventory
/picc/governance                     Board + governance
... etc (40+ admin pages)
```

---

## 8. Priority area workflows

What follows is your five priority areas mapped to current state, the workflow to use today, and the concrete next build for each.

---

### 8.1 Photo discovery — one place, every use case

**Goal:** as an editor, find the right photo for a service / highlight / project / storyteller in seconds, without leaving PICC.

**Current state:**
- `/picc/almanac/photos` lists every IMAGERY_SLOT with current photo, status, swap link
- `/picc/almanac/photos/reference` documents what slot keys exist
- Search / filter UX is missing
- No direct "find me a photo OF storyteller X" or "for service Y" view

**Today's workflow:**
- Open EL v2 admin (`empathyledger.com/admin/photos`) and filter by tag
- For a service: filter by `service:<slug>`
- For a storyteller: face-tag panel
- Copy URL → paste into the appropriate slot

**Next build (concrete):**
**`/picc/photos/find` — universal photo finder.**

A single search page that takes a query mode (`service`, `highlight`, `project`, `storyteller`) and a target identifier, then renders all photos linked to that target across slot-tags + galleries + face-tags. Each photo gets:
- Thumbnail + caption
- The slot key it's tagged with (one-click copy)
- The EL v2 deep-link to edit

Implementation sketch: server component pulling from `getPhotosBySlot` + `getCanonicalPhotosForService` + `getPhotosForStoryteller` based on the mode, with a client filter component on top.

---

### 8.2 Storyteller features — stories, quotes, profiles

**Goal:** every storyteller has a rich, browsable presence — their stories, quotes, photos, contributions all in one place.

**Current state:**
- `/voices/[slug]` profile route (5 sections per Pencil inORe)
  - Hero portrait + name
  - Featured quote (highest impact_score from `findQuotesForPerson`)
  - Photo gallery (`getPhotosForStoryteller`)
  - "Where she connects" — currently empty (needs `getServicesForStoryteller`)
  - Back to voices wall
- `/voices` wall has the storyteller index strip
- VoiceWall quote cards now link to profiles when speaker_name matches
- Stories are NOT yet shown on the profile

**Today's workflow:**
- Editor adds a storyteller in EL v2
- Tags them in photos via face-recognition
- Links extracted_quotes.attribution to their display_name (string match)
- Profile auto-populates

**Implemented:** stories, conversations, and "Where she connects" sections all render from EL v2 helpers (`getStoriesForStoryteller`, `getTranscriptsForStoryteller`, `getServicesForStoryteller`).

**Note on the service connection:** EL v2 does NOT have a dedicated `storyteller_services` join table — the Pencil mockup was aspirational naming. The real path uses `stories.related_service` (text field) and aggregates distinct values across all of a storyteller's published stories. `getServicesForStoryteller(id)` does that aggregation; the profile page maps the raw EL v2 service tags onto PICC's canonical service slug list so each tile can link to `/services/<slug>`.

**Next build:** symmetric storyteller-bespoke artwork linkage on `/voices/<slug>` — same pattern as `/services/<slug>` but querying `media_files` tagged `related:<storyteller-slug>`.

---

### 8.3 Quote thematics — community pulse + contribution

**Goal:** see what the community is saying *in aggregate* (themes, sentiment, time trends), and let anyone — community member, staff, funder — contribute a voice / note / question.

**Current state:**
- `extracted_quotes` table has `theme`, `sentiment`, `impact_score`, `category`, `themes[]` (multi-tag)
- VoiceWall renders 10 hardcoded themes as filter pills (community, culture, healing, family, country, language, youth, services, achievement, resilience)
- `/api/public/themes` route exists — fetch with thematic aggregation
- `/picc/insights/patterns`, `/picc/insights/timeline`, `/picc/insights/impact` exist — admin views, not public
- `/share-voice` and `/share-story` exist for contribution
- No public-facing community pulse / theme cloud / sentiment over time

**Today's workflow:**
- Quote intake: `/share-voice` → admin reviews → flagged `is_validated = true` → appears on VoiceWall
- Theme analysis: admin runs from `/picc/insights/patterns`
- No public visualisation

**Next builds (in order):**

1. **`/voices/pulse` — community pulse public view.** Server-rendered page showing:
   - Top 12 themes by quote-count + a small bar each
   - Sentiment distribution (positive / inspiring / reflective / grateful / hopeful / proud)
   - Time series: voices contributed per month over the last 12 months
   - Top 5 quotes by impact_score this month
   - Reads from `/api/public/themes` (extend if needed)
2. **Thematic theme pages: `/voices/themes/[theme]`.** Lists every quote tagged with that theme. Auto-generated from `extracted_quotes.theme` + `themes[]`.
3. **Contribution-aware UI on `/voices`.** Persistent "Add your voice" CTA (Pencil ocean-bg footer-style) above the wall, deep-linking to `/share-voice` with the current theme filter pre-selected when one is active.
4. **Question prompts.** Add a `quote_type = 'question'` flow alongside voice/note submission — community members can ask questions, PICC team can answer them, both get rendered in their own thread.

---

### 8.4 Video overlays between sections

**Goal:** every section transition in the almanac (and any future scroll-experience) has a beautiful video overlay that the editor can swap from a gallery, with optional next-section text overlay.

**Current state:**
- `VideoBreak` element in the almanac (hand-built, hardcoded) — used 4× in the live page
- `VideoOverlayCard` library component just shipped — covers 6 Pencil treatments via 3 knobs (surface, captionPosition, aspect)
- `getVideoOverlay(scene)` fetcher reads from `picc:slot:video-<scene>` in EL v2
- `VIDEO_TAGS_2025` static map exists for fallback URLs
- No admin gallery for swapping

**Today's workflow:**
- Editor drops a video in EL v2 admin tagged `picc:slot:video-<scene>`
- PICC fetches via `getVideoOverlay(scene)` at request time
- The almanac uses 5 scenes today: `acknowledgement`, `children-families`, `elders`, `forward-commitments`, plus the cover loop

**Next builds (in order):**

1. **Replace `VideoBreak` usages with `VideoOverlayCard`.** Map the 4 almanac uses to surface + captionPosition combinations. Get a single rendering path.
2. **`/picc/almanac/videos` admin.** Mirror of `/picc/almanac/photos`: list every video slot, current contents (poster preview), missing/filled status, EL v2 swap link. Use the same flag system.
3. **"Link to next section" feature.** Add `nextSectionId` + `nextSectionLabel` props to VideoOverlayCard. When provided, the overlay shows a small "↓ Next: <label>" button that scrolls to the section. Mirrors the cinema "next chapter" hint.
4. **Auto-generate the gallery.** `/picc/design-system/videos` page that renders every `picc:slot:video-*` slot using VideoOverlayCard variations — the editor sees what's available + what each treatment looks like.

---

### 8.5 Icons + bespoke artwork — submission and continuity

**Goal:** community members can submit drawings / icons / artwork; bespoke art carries through services and projects so the visual identity of a service deepens over time.

**Current state:**
- `lib/design-system/icons.ts` — 14 approved bespoke icons + companion white versions
- `BespokeIcon` component
- Approval workflow lives at `/picc/design-system` (voting page, status = approved)
- `lib/design-system/get-promoted.ts` exists
- No public submission flow
- No "service has X bespoke artworks" tracking

**Today's workflow:**
- Designer drops a new icon in `public/icons/bespoke/<name>.png` (+ companion white)
- Adds entry to `BESPOKE` and `BESPOKE_WHITE` maps in `icons.ts`
- Marks status = `approved` on the design-system voting page
- Sites import from `BESPOKE` / `BespokeIcon`

**Next builds (in order):**

1. **`/share-art` public submission route.** Form similar to `/share-voice` but for image upload. Stores to PICC's `media_files` with `status = pending_review`, `media_type = artwork`. Admin reviews at `/picc/design-system/submissions`.
2. **Service-bespoke linkage.** Add `service_id` (nullable) to bespoke icon entries. When a service has 1+ approved bespoke pieces, surface them on `/services/[slug]` and on `ServiceHeroCard` as accent decoration. Build a "Bespoke art for this service: 3 pieces" link in the admin.
3. **Projects + artwork pairing.** Each project page (existing or new) gets a "Bespoke" zone that renders 1-3 approved artworks tagged with that project. Maintains visual continuity across project documentation.
4. **Voice-to-artwork pairing.** When an extracted_quote has a high impact_score, allow editors to commission/upload bespoke art for it. Renders the art alongside the quote in the wall.

---

## 9. Adding a new feature — the recipe

When you want to add something to the system, follow the order:

1. **Find or design in Pencil first.** If the visual treatment doesn't exist yet, mock it up. Get the node ID.
2. **Check the variable surface.** Does the design need a new colour / spacing / font-size? If so, add it as a Pencil variable, sync tokens, propagate to `pdf-tokens.ts`. Don't hardcode.
3. **Decide: library component or one-off?**
   - **Library** if it'll be used 2+ places, has a clear contract, and lives in the Pencil "Component Library" frame (RBZwj).
   - **One-off** if it's editorially specific (Almanac elements live here), or if it's a single-page section.
4. **Implement.** Library → 5 files + registry entry. One-off → wherever it belongs.
5. **Wire data.** Photos via the slot system. Quotes via `getELQuotes` + `findQuotesForPerson`. Stories via `stories` table or `getELStories`.
6. **Verify.** `npx tsc --noEmit` then `npm run build`. Both must pass before commit.
7. **Commit with the Pencil node ID in the body.** That's the trail back to source when the next person needs to debug visual drift.

---

## 10. Drift-checking

Run this when you suspect Pencil and code have diverged:

| Check | How |
|---|---|
| Variables in sync | `get_variables({ filePath })` → diff against `tokens/picc.tokens.json` and `lib/design-tokens/pdf-tokens.ts` |
| Library components match Pencil | For each component in the registry, `batch_get({ nodeIds: [pencilNodeId] })` → compare visual structure to `web.tsx` |
| Pages match Pencil mockups | For the almanac, `batch_get({ nodeIds: ['m47PD'] })` → compare section order + content to `app/(public)/annual-report/2024-25/almanac/page.tsx` |

When you find drift:
- **Mechanical** (a colour value, a missing section): fix in code immediately
- **Editorial** (Pencil shows 3 anchor stories, page shows 6 highlights): document in a commit body, don't autonomously change

---

## 11. Where the rest of the docs live

- `docs/DESIGN-SYSTEM-COMPLETE.md` — older design-system overview (superseded by this doc for the Pencil pipeline)
- `docs/MEDIA-INTEGRATION-STRATEGY.md` — historical; current truth is section 4 above
- `docs/PDF-GENERATION.md` — React-PDF pipeline specifics
- `PICC-DESIGN-SYSTEM-CLAUDE-PACK.md` (project root) — Anthropic onboarding pack for the design system
- `CLAUDE.md` — agent rules + workflow conventions

When this doc and an older doc conflict, **this doc wins**. Update the older one or mark it superseded.

---

## 12. Quick reference

```ts
// Tokens
import { tokens } from '@/lib/design-tokens/pdf-tokens'
import { C, SP, TYPE } from '@/lib/pdf/theme'  // for React-PDF

// Library
import { StatHero } from '@/components/library/StatHero/web'
import { StatHeroPdf } from '@/components/library/StatHero/pdf'

// EL v2 photos
import { getPhotosForSlot, getPhotosForService, getPhotosForStoryteller, getVideoOverlay } from '@/lib/media/el-photos'

// EL v2 data
import { getPalmStorytellers, getELQuotes, findQuotesForPerson, getELStories } from '@/lib/empathy-ledger/el-server'

// PICC supabase
import { createServerSupabase } from '@/lib/supabase/client'

// Bespoke icons
import { BESPOKE } from '@/lib/design-system/icons'
import { BespokeIcon } from '@/components/ui/BespokeIcon'

// Almanac elements (bespoke, NOT library)
import { Cartouche, Reliquary, Lantern, Hearth, Horizon } from '@/components/annual-report/2024-25/almanac/elements'
```

---

*Last updated: 2026-04-30. When you make structural changes to the framework, update this file in the same commit.*
