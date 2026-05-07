# Walkthrough — exact URLs & what you'll see

*~15 minutes, in order. Open each URL in a new tab so you can flip between them. Tick boxes as you go.*

---

## Before you start — pick your base URL

**Option A (recommended): production · picc.studio**
Replace `<BASE>` with `https://picc.studio` everywhere below.
**Requires:** PR #2 merged to main. Vercel auto-deploys ~3 min after merge.

**Option B: preview · login-gated**
Replace `<BASE>` with `https://palm-island-repository-flcn3bch0-benjamin-knights-projects.vercel.app`.
**Requires:** signed in to Vercel team (benjamin-knights-projects). Same content as A but behind Vercel preview auth.

Both serve the same code (commit `9d805229` on `claude/dazzling-liskov-e0f6f1`).

---

## Stop 1 · Brand DNA on display
**URL:** `<BASE>/design-system`

The new public showcase. What you should see:
- [ ] **Hero** on midnight Saltwater background. Caption reads `Saltwater & Earth · v2.0` in ochre. Real photo from EL v2 (or just the dark gradient if no photo tagged for `hero-island` slot).
- [ ] **One-breath identity** section in shell-cream. Three anchor quotes ("PICC belongs to the community", Rachel's, the dollar-on-the-island one).
- [ ] **Three voice registers** as colour-coded cards (Rachel/ocean · Luella/turtleRed · Service/mangrove).
- [ ] **Colour swatches** — 3 core, 4 supporting, 3 cultural+anchor — each with hex + role.
- [ ] **Typography** samples at real scale.
- [ ] **8 bespoke icons** in the icon grid (aged-care, children, community, …).
- [ ] **Photo strip** from EL v2 `community-voice` slot. If empty: graceful message, not a broken image.
- [ ] **3 live quotes** from `extracted_quotes`.
- [ ] **Anti-patterns wall** on midnight. "Never use purple gradients" listed.
- [ ] CTA at bottom links to `/sign-the-vision`.

**Why this matters:** every other surface inherits this DNA. If this looks generic, the system isn't loading.

---

## Stop 2 · The signing canvas
**URL:** `<BASE>/sign-the-vision`

The leader-meeting finale. What you should see:
- [ ] **Hero** on shell-cream. Caption "Next 20 Years · Community Canvas" in turtleRed. Title "Sign the vision" in big Fraunces.
- [ ] **Live ticker** below the hero showing total signed + pending. Green dot pulse top-left. Updates every 6s.
- [ ] **QR panel** on the right (desktop only) — image renders, typed URL underneath. Caption "Scan to sign on your phone".
- [ ] **Founding-six cards** below the hero. Each card has a category pill + vision text + "Tap to endorse" hint.
- [ ] **Form** below the cards. Session chip at top reads `meeting-2026-05-08` (today's date). Category chips, 600-char counter, optional name field, anonymous checkbox, big ocean Submit button.

**Try it:**
- [ ] Tap one founding-six card. Form scrolls into view; the heading flips to "Add your voice alongside this vision". The card you tapped is bordered + highlighted.
- [ ] Type a test vision (e.g. "Test from the dry-run, please ignore"). Sign anonymously. Submit.
- [ ] You should see a green "Received" panel within ~2 seconds. Reference id (8 chars).
- [ ] Within ~6s, the ticker on the same page should update its count.

---

## Stop 3 · Approval queue
**URL:** `<BASE>/picc/vision`

The admin moderation page. What you should see:
- [ ] Header "Vision Board" + DIRECTION subtitle.
- [ ] **Community Visions** section. Your test from Stop 2 should be in the pending list.
- [ ] Above the list, a row of **session filter chips**: "Session: All · meeting-2026-05-08 · …". Active chip in blue.
- [ ] On your test card: vision_text in quotes · author "Anonymous" · category · date · session_id badge (clickable).
- [ ] **Approve** button (green) and **Reject** button (gray) on each card.

**Try it:**
- [ ] Click the session badge on your test → list filters to that session only.
- [ ] Click "All" chip → all pending visions return.
- [ ] Click **Approve** on your test. Card disappears from the pending list.

If you also want to clean up: there's no built-in "delete test data" action, so leave the approved test row in place — Stop 4 will show it lit up live.

---

## Stop 4 · Live next-20 canvas
**URL:** `<BASE>/picc/next-20?presenter=1`

The projected canvas during the leader meeting. What you should see:
- [ ] **No sidebar nav.** The /picc admin chrome is hidden — just the canvas, full-bleed.
- [ ] Tiny "Presenter" pill top-right (red dot). Click it to exit presenter mode.
- [ ] Header "The Next 20 Years" in Fraunces italic. Hull River quote in dark ocean panel.
- [ ] **PICC in context** card.
- [ ] Three columns: **Community Visions** (live-polling, count varies), **Forward Commitments** (3 cards from the Launchpad plan), **Urgent Asks** (3 red-bordered cards).
- [ ] In Column 1: a green pulsing dot top-left and the text "Live · refreshing every 8s".
- [ ] **Your test vision from Stop 3 should be at the top of Column 1**, with a "Just signed" badge and a pulsing emerald border for ~6s after first appearance.

**Why this matters:** this is the live signature loop in action. The ≤8s flow from approval → canvas pulse is the demo finale.

---

## Stop 5 · Operator run-of-show
**URL:** `<BASE>/picc/demo`

What you should see:
- [ ] Header "Operator · Run of show". Active session chip showing today's `meeting-2026-05-08`.
- [ ] **Live signature loop callout** in gold. Four-step protocol on the left, QR panel on the right (different QR than /sign-the-vision — both point to the same session).
- [ ] **Six act cards** numbered 1–6, each with title, duration (5+8+7+10+8+7 = 45 min), notes, callouts, "Open" buttons.
- [ ] Act 6 card has **Presenter mode** button alongside the regular Open button.
- [ ] **Pre-flight checklist** at the bottom with `npm run check-el`, vision queue, sign-the-vision tab, QR scan-test, /design-system backup.

**Try it:**
- [ ] Append `?session=board-test-001` to the URL. Header chip changes. QR re-renders. The QR target URL (small text) should now end with `&session=board-test-001`.
- [ ] Open `<BASE>/sign-the-vision?session=board-test-001` in a new tab. Form session chip should match `board-test-001`.
- [ ] Sign a test vision; visit `<BASE>/picc/vision`; new chip `board-test-001` appears in the filter row.

---

## Stop 6 · Services with innovation pills
**URL:** `<BASE>/services`

What you should see:
- [ ] Hero with services count.
- [ ] **Innovation banner** above the grid: gold border, text "{N} programmes driving the next 20 years" with link to /innovation.
- [ ] **Service cards** in the grid. At least 8 of them carry a **star-gold "Innovation" pill** top-left of the cover image — these are the slugs in `lib/services/innovation-tier.ts`: bwgcolman-way, bwgcolman-healing, first-1000-days, BEAI, cultural centre/programs, aged-care, digital, community-justice.
- [ ] Click any innovation-badged card → service detail page. Hero photo, voices, photo grid all from EL v2.

---

## Stop 7 · Innovation programmes
**URL:** `<BASE>/innovation`

What you should see:
- [ ] Hero with "Innovation on Country" + video background.
- [ ] **"Why We Innovate" text section** (existing).
- [ ] **NEW: Programmes section** on warm-cream background. Heading "{N} programmes driving the next 20 years". Cards with star-gold pills, blurbs, and "Open service →" links into `/services/<slug>`.
- [ ] Below: existing themed Project sections (Culture & Country / Tech & Sovereignty / Employment & Enterprise).

**Why this matters:** /services and /innovation now agree on what "innovation" means — both pull from the same `INNOVATION_SLUGS` constant.

---

## Stop 8 · 20 Voices sprint tracker
**URL:** `<BASE>/voices`

What you should see:
- [ ] Hero with "Community Voices" title.
- [ ] **Below the hero, a sprint tracker** in a gold-bordered card: "X of 20 named voices captured · sprint" with a progress bar (gold while in progress, mangrove if complete).
- [ ] CTA "Add a voice →" linking to `/share-note`.
- [ ] Storyteller search strip below.
- [ ] VoiceWall grid of quotes.

Then visit **`<BASE>/picc/voices`** (admin):
- [ ] Same tracker, but the CTA points at `/picc/voices/capture` (capture queue).

---

## Stop 9 · Voices themes index (was 404 before)
**URL:** `<BASE>/voices/themes`

What you should see:
- [ ] Hero with "Themes" title and total count.
- [ ] **Featured this year** section if any rows exist in `featured_themes` (currently editor-curated by Narelle).
- [ ] **All themes** tag cloud — each pill shows theme name + count, links to `/voices/themes/<theme>`.
- [ ] Empty-state message if no themes are tagged yet (graceful).

Before this commit, this URL was a 404.

---

## Stop 10 · The home page
**URL:** `<BASE>/`

What you should see:
- [ ] Saltwater hero, no purple gradients anywhere.
- [ ] Live counters (storytellers / services / voices) pulled from EL v2.
- [ ] CTAs into the main public surfaces.

---

## What "all live" means now

After PR #2 merges:
- ✅ **Brand DNA** — `BRAND.md` at root + `/design-system` showcase + brand skill rewritten to load from BRAND.md (no more legacy blue/purple)
- ✅ **EL v2 connection** — verified, `npm run check-el` available, intake-key fixed on Vercel prod
- ✅ **Demo path** — every URL in the six-act flow renders cleanly · 404s closed (`/voices/themes` index · `/api/community-visions` collection)
- ✅ **Signing canvas** — `/sign-the-vision` with founding-six cards, endorsement flow, session tagging, QR panel
- ✅ **Live signature loop** — `LiveVisionsColumn` polls every 8s on the next-20 canvas with emerald pulse on new approvals
- ✅ **Innovation overlay** — `/services` star-gold pills + banner · `/innovation` programmes section · single source of truth at `lib/services/innovation-tier.ts`
- ✅ **20 Voices for 20 Years** — sprint tracker on `/voices` and `/picc/voices`, counts distinct named storytellers from EL v2 voices-pool toward the 20 target
- ✅ **Presenter mode** — `?presenter=1` on `/picc/*` hides chrome, exit chip top-right
- ✅ **Operator run-of-show** — `/picc/demo` with QR + six-act cards + pre-flight checklist + session override
- ✅ **Session attendance** — `?session=` flows from QR → POST → admin filter

13 commits on PR #2. TS clean. Build passing. Lazy-loaded chat model so previews build without AI keys.

---

## If something doesn't work

| Symptom | Likely cause | Fix |
|---|---|---|
| `/sign-the-vision` 500 | `community_visions` migration not applied | Run `supabase/migrations/20260214_community_visions.sql` |
| Canvas doesn't pulse on new approval | Live polling blocked | DevTools → Network: confirm `/api/community-visions?status=approved` returns 200 every ~8s |
| Innovation pills missing | Slug mismatch between EL and `INNOVATION_SLUGS` | Open `lib/services/innovation-tier.ts` and verify the slug is in `organization_services.slug` |
| 20-voices tracker stuck at 0 | EL voices-pool not reachable | `npm run check-el` should show ≥40 voices |
| Presenter mode shows nav | Cached layout | Hard refresh; `?presenter=1` query is read on every render |
| QR image broken | api.qrserver.com unreachable | Typed URL underneath is the fallback — type into phone |

---

That's the full surface. If every checkbox above passes, PICC has a presentation-grade platform that the leader meeting can actually run from.
