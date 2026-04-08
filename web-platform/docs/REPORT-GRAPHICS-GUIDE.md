# Generate Report Graphics — User Guide

## Overview

The **Generate Report Graphics** feature creates AI-generated illustrations for every page of the annual report using Google Gemini. Generated images are uploaded to Supabase Storage and used as fallback art when no real photo has been assigned to a page.

---

## How to Use

### From the Admin UI

1. Navigate to **Report Builder** → **Report Photos** (`/picc/reports/builder` → click "Report Photos")
   - Or go directly to `/picc/reports/photos`

2. At the top of the page you'll see the **AI Report Graphics** panel

3. Click **Generate Graphics** — the system will:
   - Generate 12 illustrations, one per report page
   - Upload each to Supabase Storage (`platform-media/report-assets/`)
   - Show real-time progress with status indicators per image

4. Generation takes roughly 20–40 seconds per image (~5–8 minutes total)

5. Once complete, the new art is immediately available as fallback images in the PDF

### Via API

```bash
# Generate all 12 page graphics
curl -X POST https://your-domain.com/api/reports/generate-graphics \
  -H "Content-Type: application/json" \
  -d '{}'

# Generate specific pages only
curl -X POST https://your-domain.com/api/reports/generate-graphics \
  -H "Content-Type: application/json" \
  -d '{"pages": ["cover", "acknowledgement", "backCover"]}'
```

The API streams NDJSON progress events:

```jsonl
{"type":"start","total":12}
{"type":"progress","index":0,"total":12,"pageKey":"cover","label":"Cover Hero","status":"generating"}
{"type":"progress","index":0,"total":12,"pageKey":"cover","label":"Cover Hero","status":"done","url":"https://..."}
{"type":"complete","results":[...]}
```

---

## Page Keys

| Page Key | Label | Aspect | Description |
|----------|-------|--------|-------------|
| `cover` | Cover Hero | 3:4 | Aerial golden-hour Palm Island |
| `acknowledgement` | Acknowledgement | 16:9 | Indigenous dot painting pattern |
| `contents` | Contents / Map | 3:4 | Illustrated watercolor island map |
| `communityVoices` | Community Voices | 16:9 | Community gathering under palm trees |
| `youthVoices` | Youth Voices | 16:9 | Kids playing sport/arts outdoors |
| `governance` | Governance | 16:9 | Professional boardroom meeting |
| `services` | Services | 16:9 | Community service workers |
| `journey` | Journey Timeline | 16:9 | Aerial island panorama |
| `resilience` | Next 20 Years | 16:9 | Sunrise, stepping stones, hope |
| `backCover` | Back Cover | 3:4 | Underwater reef/turtle scene |
| `highlights` | Highlights | 16:9 | Mosaic of community life |
| `photos` | Photo Spread BG | 16:9 | Soft watercolor background |

---

## How Photos and Graphics Work Together

The annual report uses a priority chain for each page:

1. **Supabase media override** — a real photo assigned via the Report Photos admin
2. **Curated static photo** — a known photo from the archive (e.g. `/annual-report-photos/2018-19/photo-006.jpg`)
3. **Manifest keyword match** — auto-matched from the photo manifest
4. **AI fallback illustration** — the Gemini-generated art (this feature)

Assigning a real photo on the Report Photos page always takes priority over AI art. The generated graphics are the safety net ensuring every page has a quality illustration even when no real photo is available.

---

## Requirements

- `GEMINI_API_KEY` environment variable must be set (Google AI Studio key)
- Supabase Storage bucket `platform-media` must exist and be public
- The key is already configured in Vercel production environment

---

## Files

| File | Purpose |
|------|---------|
| `lib/annual-report/graphic-prompts.ts` | Prompt templates per page with PICC brand direction |
| `app/api/reports/generate-graphics/route.ts` | API route — generates images and uploads to Storage |
| `lib/annual-report/page-photos.ts` | Photo assignment system with fallback references |
| `app/picc/reports/photos/page.tsx` | Admin UI with Generate Graphics button |

---

## Regenerating

You can regenerate at any time — the system uses `upsert: true` when uploading, so new images replace old ones at the same Storage path. Old versions are overwritten, not kept as separate files.

To regenerate a single page, call the API with that page key:

```bash
curl -X POST /api/reports/generate-graphics \
  -H "Content-Type: application/json" \
  -d '{"pages": ["cover"]}'
```
