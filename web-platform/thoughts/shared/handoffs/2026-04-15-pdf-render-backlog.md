# Backlog — PDF Render Broken on Vercel

**Date:** 2026-04-15
**Status:** Not blocking. API-side photo pipeline is shipped and verified. This is a separate, pre-existing React-PDF + Vercel interaction that surfaced while trying to do an end-to-end PDF test.

## Symptom

`GET https://picc.studio/api/pdf/generate?type=annual-report&audience=community` times out at the Vercel function duration (504) or returns 500 with one of:

- `ENOENT: no such file or directory, open '/var/task/lib/pdf/fonts/Inter-Regular.ttf'`
- `Could not resolve font for Inter, fontWeight 400, fontStyle italic`
- `dataUrl.split is not a function`
- `FUNCTION_INVOCATION_TIMEOUT` (600 timeout even with `maxDuration = 300`)

## What was tried (7 deploys)

1. Kept local filesystem loading → ENOENT (Next.js doesn't trace `path.join(process.cwd(), …)`)
2. Added `outputFileTracingIncludes: { '/api/pdf/**': ['lib/pdf/fonts/**/*.ttf'] }` → still ENOENT, tracing config not honored
3. Mirrored fonts to `public/fonts/` and switched to HTTPS URL src → passed ENOENT but **timeout** during render (serial HTTPS fetches)
4. Bumped `maxDuration = 300` → still timed out
5. Prefetched into Buffers at module init → `dataUrl.split is not a function` (React-PDF v4 rejected raw Buffer)
6. Converted Buffers to base64 data URL strings → timed out again at 5 min (lambda hangs somewhere in the render path)

## Notes for the next attempt

- React-PDF docs indicate `src: Buffer` works in v3 but was changed/narrowed in v4. Check current v4 API: may need `url` + `ArrayBuffer` split.
- Fonts are already uploaded to EL v2 Supabase Storage at `profile-images/picc-pdf-fonts/*.ttf` — no need to re-upload.
- Total base64-encoded font payload is ~3 MB (11 files). Encoding in each call is non-trivial — cache the data URL string, not the Buffer.
- The hang at step 6 suggests React-PDF v4 may not handle data URLs either. Try `@react-pdf/renderer` v3 as a downgrade.
- Alternative that's known to work on Vercel: package fonts as base64 constants in a `.ts` file alongside `register-fonts.ts`. Webpack bundles TS constants reliably. 11 × ~30 KB after base64 = ~3 MB source file, chunky but reliable.

## What IS working (don't touch)

- **EL v2 `/api/photos`**: live, returns 200 with correct consent-filtered photos across all 19 slots
- **AR pipeline wiring**: `lib/annual-report/page-photos.ts` correctly pulls from EL v2
- **TaggedPhoto**: built and ready in `lib/pdf/components/` + `components/media/`
- **Env vars**: clean on both projects, no trailing newlines
- **Consent writes**: 122 photos `elder_approved=true` + `consent_obtained=true` in EL v2
- **Middleware allowlist**: `/api/photos` is in `PUBLIC_API_ALWAYS_EXACT`

## Update — extended attempt 2026-04-15 (deploys 8–10)

Root-caused the data URL hang: React-PDF 4.3.2 `_load()` for data URLs does `atob(raw).split('').map(c => c.charCodeAt(0))` — O(n) with huge string allocations, hangs on 11 × 330 KB TTFs.

Fix attempted (deploy 10): prefetch fonts to `/tmp/picc-pdf-fonts/` at module init, pass file paths to `Font.register` (hits `fontkit.open()` fast path). Plus `AbortController`+15 s timeout on EL v2 fetch with `cache: 'no-store'` to bound upstream.

**Result: still hangs 5 min with no body.** Runtime logs show ONLY the recurring `Invalid '' string child outside <Text> component` warning — which is a symptom, not the cause. The hang is now somewhere inside the React-PDF render tree itself, independent of fonts or upstream fetches.

## Update 2 — local-repro diagnosis 2026-04-15 (commit 873471fd)

Ran `npm run dev` locally and watched the render log. Found + fixed **two real bugs**:

1. **URL concatenation bug** in `lib/annual-report/page-photos.ts` + `lib/pdf/templates/AnnualReportPDF.tsx`. `getBaseUrl()` was being prepended to URLs returned by `assetUrl()`, which already returns absolute Supabase URLs for migrated asset prefixes (`/annual-report-photos/`, `/report-assets/`, `/hero-assets/`, etc.). Produced `http://localhost:3000https://…` that React-PDF couldn't fetch.
2. **Bare path logo ref** — several templates used `src="/logo/picc-logo-full.png"` directly. React-PDF in server mode treats bare paths as filesystem reads → ENOENT. Resolved via `getBaseUrl()` prefix.

With those fixed, all URL errors disappear from the render log. **One remaining issue:**

```
Node of type IMAGE can't wrap between pages and it's bigger than available page height
Node of type SVG can't wrap between pages and it's bigger than available page height
```

React-PDF layout engine hits an Image (or SVG) that exceeds A4 page height, and the layout pass appears to enter a wait/deadlock rather than erroring. The lambda (and local dev) hang silently past their timeout budget.

## Revised next-session entry point

Pipeline is now two URL bugs + one layout bug away from a rendered PDF. The URL bugs are fixed (873471fd). What's left:

1. **Reproduce locally** — `cd web-platform && vercel env pull .env.local --yes && npm run dev`, then `curl http://localhost:3000/api/pdf/generate?type=annual-report&audience=community`.
2. **Find the oversized node.** Log lines will be: `Node of type IMAGE can't wrap between pages …` and/or `Node of type SVG can't wrap between pages …`. Search the AR template for `<Image>` or `<Svg>` nodes whose `style` has no explicit `height`, or a `height` approaching/exceeding `A4_H` (841 pt). Likely candidates:
   - full-bleed cover/backcover imagery
   - the Journey timeline spread (long SVG)
   - decorative ConstellationPattern / concentric dot SVGs if their size wasn't clamped
3. **Fix in one of two ways:**
   - Set a concrete `height` smaller than the page content area, OR
   - Wrap the offending `<View>` with `wrap={false}` + add `break` to the enclosing page so React-PDF doesn't try to split.
4. **Verify locally**, then deploy. At that point the end-to-end is closed.

Not worth doing unless steps 1–3 are blocked:
- Downgrade `@react-pdf/renderer` v4 → v3 (may unblock layout heuristics but risks other templates).
- Template-wide audit for `''` string children (the recurring warning). Harmless, unrelated to the hang.

Don't waste cycles on `outputFileTracingIncludes` — it's a Next 15 feature; this project is on Next 14.2.33 where it's silently ignored. Fonts now load via `/tmp/` prefetch which works on Vercel Lambda.
