# EL v2 photo + video tagging workflow

**Source of truth:** Empathy Ledger v2 (repo: `/Users/benknight/Code/empathy-ledger-v2`)

This is the canonical workflow for getting a photo or video onto the PICC
website (or annual report) via Empathy Ledger v2's tag-driven slot system.

## How it works in one sentence

> Tag a photo in EL v2 admin → PICC reads photos by slot via the
> `/api/photos?slot=<key>` endpoint → the photo lands in the matching
> almanac slot.

No code changes are required to retag, swap, or add photos. Tagging is
the entire workflow.

---

## Tag conventions

All PICC-bound photos are tagged with strings prefixed `picc:slot:`. The
convention forks by category:

| Tag pattern | Used for | Example |
|---|---|---|
| `picc:slot:cover` | Almanac / annual-report cover hero | `picc:slot:cover` |
| `picc:slot:acknowledgement` | Acknowledgement of Country | — |
| `picc:slot:messages` | CEO / Chair portraits | — |
| `picc:slot:elders-on-country` | EOC photo gallery | — |
| `picc:slot:voices-wall` | Voices wall portrait grid | — |
| **`picc:slot:service-<slug>`** | Per-service photos (hero + gallery) | `picc:slot:service-bwgcolman-way` |
| **`picc:slot:video-<scene>`** | Video overlays (transitions, hero loops) | `picc:slot:video-acknowledgement` |
| `fy:<year>` | Optional fiscal-year filter | `fy:2024` |

**Service slug list** is `lib/annual-report/data-2025.ts > SERVICES_2025[].id`
(stripped of the `svc-` prefix). Examples:

- `picc:slot:service-bwg-way` — Bwgcolman Way
- `picc:slot:service-cfc` — CFC Early Childhood
- `picc:slot:service-1000d` — First 1,000 Days
- `picc:slot:service-fc` — Family Care
- `picc:slot:service-fwc` — Family Wellbeing Centre
- `picc:slot:service-safe-house` — Safe House
- (… 18 more)

**Video scene list** is up to the editor, but PICC's almanac currently
expects:

- `picc:slot:video-cover` — looping hero on the cover page
- `picc:slot:video-acknowledgement` — bwgcolman transition
- `picc:slot:video-anchor-bwgcolman-way` — split scene for anchor story
- `picc:slot:video-anchor-1000d` — split scene
- `picc:slot:video-anchor-ndis` — split scene
- `picc:slot:video-elder-<id>` — quote-over-video backdrop
- `picc:slot:video-stat-<key>` — animated stat reveal

---

## Author workflow

1. Open EL v2 admin: **`https://<el-v2-url>/admin/photos`**
2. Upload a photo OR find an existing one in the grid
3. Click the photo → cultural tag editor opens
4. Add the appropriate `picc:slot:*` tag(s)
5. Confirm the photo has `elder_approved=true` AND `consent_obtained=true`
   (these are filtered server-side; tagged photos that don't meet consent
   are silently dropped)
6. Save. PICC will pick it up on the next page load (no cache —
   `/api/photos` is `cache: 'no-store'` on the PICC side).

**To swap a hero photo for a service:** retag the new photo first, then
remove the old tag. The most-recently-tagged photo lands first in the
result array, so this is also how to control hero ordering.

---

## What PICC reads

All consumption goes through `web-platform/lib/media/el-photos.ts`:

| Helper | What it returns | Tag pattern it queries |
|---|---|---|
| `getPhotoForSlot(slot)` | First photo for slot, or `null` | `picc:slot:<slot>` |
| `getPhotosForSlot(slot, limit)` | All photos for slot | `picc:slot:<slot>` |
| `getPhotosBySlot()` | Map of every slot → photo array | `picc:slot:*` |
| **`getPhotosForService(slug)`** | `{ hero, gallery, all }` for a service | `picc:slot:service-<slug>` |
| **`getVideoOverlay(scene)`** | Single video overlay or `null` | `picc:slot:video-<scene>` |

Page-level usage uses `lib/almanac/imagery-system.ts` slot definitions to
declare WHICH slots a section consumes; that file is the single
declarative registry of imagery-system requirements.

---

## What's still missing on the EL v2 side

These would unlock cleaner integrations:

1. **Native service entity** — services are currently a PICC concept layered
   on top of EL v2 slot tags. A `services` table in EL v2 with a
   `service_photos` join table would replace the slot-tag convention.
2. **`is_cover_image` flag at service level** — currently first photo wins.
   A flag would let editors pick a non-first cover.
3. **Video metadata** — aspect ratio, duration, has-audio aren't exposed
   in the `/api/photos` response. Adding them would let PICC render
   videos at correct aspect.
4. **Per-slot ordering** — currently photos return in upload order. An
   `order` column or `position` field would let editors hand-sort.

These are tracked here for the EL v2 roadmap.

---

## Required env vars (PICC side)

Both must be set in `web-platform/.env.local`:

```
EL_V2_API_URL=https://<el-v2-deployment>.vercel.app
EL_V2_API_KEY=<shared secret matching EL v2 PICC_API_KEY>
```

Without these, the helpers all return `null` / empty arrays — no error,
just no photos. Check first if photos aren't showing.

---

## Reference

- `web-platform/lib/media/el-photos.ts` — PICC-side client
- `web-platform/lib/almanac/imagery-system.ts` — declarative slot
  registry mapping each almanac section to its imagery requirements
- `empathy-ledger-v2/src/app/api/photos/route.ts` — EL v2 endpoint impl
- `empathy-ledger-v2/src/app/admin/photos/page.tsx` — tagging UI
- `picc-almanac-web.pen` → "🏝️ Services Overview" frame — visual
  reference for the four service-photo treatments
- `picc-almanac-web.pen` → "🎬 Video Overlay Gallery" frame — visual
  reference for the six video overlay treatments + create-new spec
