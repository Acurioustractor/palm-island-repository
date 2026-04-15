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

## Revised next-session entry point

1. **Reproduce locally** — run `npm run dev` and hit `/api/pdf/generate` with all env vars set (`EL_V2_API_URL`, `EL_V2_API_KEY`, Supabase creds). Trace where it actually hangs; you'll get full stack + console logs that prod runtime logs don't surface.
2. **Chase the warning first** — grep templates for `''` as a child. Most likely a conditional like `{foo && foo.text}` where `foo === ''`. Replace with `{foo ? <Text>{foo}</Text> : null}`. This could be masking a deeper bug where the "" keeps regenerating and never terminates.
3. **If warning isn't the cause**, add granular `console.time` blocks around: registerFonts, getReportData, renderToBuffer. Redeploy once to see which phase hangs.
4. **Nuclear fallback**: downgrade `@react-pdf/renderer` to v3 (`^3.4.5`), which uses different font + render internals. Riskier (breaks other templates potentially) but a known-good baseline.

Do **not** waste another deploy cycle on `outputFileTracingIncludes` or font variant tweaks — that rabbit hole is exhausted.
