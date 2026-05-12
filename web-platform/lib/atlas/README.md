# `/lib/atlas/` — workshop whitelist

The Living Atlas at `/living-atlas` reads from **EL v2** (storytellers, services, projects, quotes, photos) and **PICC supabase** (annual reports, board, leadership). Both backends are live. This folder controls which of their rows make it to the workshop hero, so the surface stays tight even when the source data drifts.

## The one file you edit

[`whitelist.ts`](./whitelist.ts) — every featured entity is listed here. Order in the file is order on the page.

### Add a new featured Elder

1. Find their slug in EL admin (e.g. `marjoyie-burns`)
2. Add it to `FEATURED_ELDER_SLUGS` in the position you want
3. Save → push → the atlas updates on next request

### Add / swap a service

1. Find the slug in `/admin/picc-tagging` or EL services list
2. Add to `FEATURED_SERVICE_SLUGS` in the position you want
3. Save → push

### Hide a face from EL (data drift)

Add the storyteller slug to `HIDDEN_STORYTELLER_SLUGS`. This is the right move when EL still has someone (e.g. Freddy Wai) but they're not a PICC storyteller.

### Patch a broken photo

Two cases:

1. **Photo file is missing in Storage** → add slug to `MISSING_PHOTO_SLUGS`. That storyteller stops appearing on the canvas.
2. **EL has wrong photo, real photo exists elsewhere** → add slug → URL to `STORYTELLER_PHOTO_OVERRIDES`. Override takes precedence over EL.

### Pin specific voice-wall quotes

Add EL `extracted_quotes.id` values to `FEATURED_QUOTE_IDS`. Empty array (default) = auto-pick by impact_score (current behaviour).

## Service cover photos

Set them in **EL admin** at `/admin/picc-tagging` — the "set as cover" button writes directly to `services.image_url`, which is what the atlas reads. No code change needed.

## Project cover photos

Set them in **EL admin** at `/admin/picc-tagging` (projects tab) — writes to `projects.cover_image_url`. The atlas reads this directly.

## Safety net

Every fetch in `lib/constellation/queries.ts` is wrapped in try/catch with graceful fallbacks. If EL is unreachable mid-demo, the atlas still renders — just with reduced data. No render crashes, ever.
