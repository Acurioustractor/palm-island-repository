# Dry-run checklist — leadership presentation

*Walk this in 15 minutes on any machine that has the env. Tick boxes as you go. Anything that doesn't behave as written is a real bug, not a quirk.*

**Setup once:**

```bash
cd web-platform
npm run check-el          # 4/4 green required
npm run dev               # localhost:3000
```

Open four tabs:
- A · `http://localhost:3000/picc/demo` — operator dashboard
- B · `http://localhost:3000/picc/next-20?presenter=1` — projected canvas
- C · `http://localhost:3000/picc/vision` — approval queue
- D · `http://localhost:3000/sign-the-vision` — signing canvas

---

## Stage 1 — Brand integrity (3 min)

- [ ] **Tab D** shows a turtle-warm hero. **No purple gradients anywhere.**
- [ ] Header reads `Saltwater & Earth · v2.0` and the body is in Fraunces.
- [ ] Open `/design-system` in a fifth tab. Hero pulls a real photo. Palette swatches show ocean / ochre / earth as the first three. Anti-pattern wall on midnight background lists "Never use purple gradients" up top.
- [ ] Open `/services`. Find at least one card with a star-gold **Innovation** pill (top-left). Hover the pill — title attribute should describe the programme.
- [ ] Open `/innovation`. The "Programmes" section appears above the themed projects. Each card has the star-gold pill. Counts match the badge count on `/services`.

If any of those fail → stop, the brand DNA isn't loading.

---

## Stage 2 — EL connection (1 min)

- [ ] **Tab D** ticker shows a non-zero number for "signed" *or* "awaiting Elder review" within 6 s of load.
- [ ] **Tab A** shows the QR panel rendering (image, not a broken icon) with the typed URL underneath.
- [ ] Open `/voices`. The 20 Voices tracker bar shows a non-zero "captured" number. Mangrove-green if ≥20, gold while in progress.

If the ticker stays at "—" or the bar doesn't render → check `EL_V2_API_URL` and `EL_V2_API_KEY` in `.env.local`.

---

## Stage 3 — Live signature loop (5 min)

The actual demo finale. Test it three ways.

**A · Tablet path (Tab D, manual)**

- [ ] Type a test vision (15+ chars), pick a category, sign with a fake name, submit.
- [ ] Form returns "Received" green panel within 2 s. The 8-char reference matches what's about to land in admin.
- [ ] **Tab C** within ≤5 s: filter to today's `meeting-YYYY-MM-DD` session — your test appears. Click Approve.
- [ ] **Tab B** (canvas) within ≤8 s: vision pulses emerald with "Just signed" badge. Sticks for ~6 s, then settles into the column.

**B · QR scan path (phone, optional but worth doing)**

- [ ] Scan QR from Tab D on a phone. Form loads, session chip shows the same `meeting-YYYY-MM-DD`.
- [ ] Sign from phone. Same loop as above. Tab D ticker increments.

**C · Endorsement path**

- [ ] On Tab D, tap one of the founding-six cards. Card pulses, form scrolls into view, headline reads "Add your voice alongside this vision."
- [ ] Submit. POST should include `related_themes: ["endorses:fallback-N"]` (visible in browser devtools network tab).
- [ ] Approve on Tab C. Vision shows on Tab B with `Endorsing:` prefix in the text.

If the canvas doesn't pulse → check that `LiveVisionsColumn` is mounted (open devtools → see polls every 8s to `/api/community-visions?status=approved`).

---

## Stage 4 — Demo path walkthrough (4 min)

Click through Tab A's "Open" buttons in order. Each should load without error and **not** be a 404.

- [ ] Act 1 · `/` — counters render, no console errors
- [ ] Act 2 · `/20-years` — at least one era renders with year cards
- [ ] Act 3 · `/bwgcolman` — page renders
- [ ] Act 4 · `/services` — innovation banner + at least 3 innovation-badged cards
- [ ] Act 5 · `/voices` — sprint tracker visible above the fold
- [ ] Act 6 · `/picc/next-20?presenter=1` — sidebar nav HIDDEN, "Live · refreshing every 8s" indicator pulses

If `?presenter=1` doesn't hide the nav → re-check the layout.tsx searchParams read.

---

## Stage 5 — Session integrity (2 min)

- [ ] On Tab A, append `?session=board-test-001`. Header session chip changes. QR re-renders pointing at the new session URL.
- [ ] Open the QR target from the new URL (or visit it directly). Tab D session chip on the form matches.
- [ ] Sign from the test session. Tab C: filter chip for `board-test-001` appears in the row above the queue. Click it — only your test shows.
- [ ] Click "All". Both `meeting-YYYY-MM-DD` and `board-test-001` are in the list now.

---

## Stage 6 — Pencil hand-off integrity (skip if not deploying)

- [ ] Open `picc-almanac-web.pen` in Pencil. Confirm the variables (palette, fonts) match what you saw on `/design-system`. They should be identical — Pencil is the source.
- [ ] Run `npm run tokens:build` to confirm the pipeline still emits `lib/design-tokens/`.

---

## Failure-mode quick fixes

| Symptom | Cause | Fix |
|---|---|---|
| `/sign-the-vision` 500s | Schema mismatch | Confirm `community_visions` migration applied: `vision_text`, `category`, `is_approved`, `is_anonymous`, `session_id` columns exist |
| Canvas doesn't pulse | API blocked | DevTools → Network → look for `/api/community-visions?status=approved` returning 200; check Supabase service role key |
| Innovation badge missing | Slug mismatch | Open `lib/services/innovation-tier.ts`; confirm the service slug matches what's in `organization_services` |
| 20-voices tracker stuck at 0 | EL session_id not flowing | Confirm `EL_V2_API_URL` reachable; `npm run check-el` should show non-zero voices-pool count |
| Presenter mode shows nav | Suspense boundary issue | Hard-refresh; if persistent re-check that `searchParams.get('presenter')` reads on client |

---

## Bring-into-the-meeting script

Two minutes of operator narration to set up the demo:

> "What you're about to see is the platform driving Palm Island's next twenty years. Every page on screen is real data from Empathy Ledger v2 and the PICC archive. Six acts, about forty-five minutes. The sixth act is where you sign — anyone in the room can scan the QR on the screen and add a vision from your phone. Elders and Rachel will see them in the moderation queue and approve them live. By the end of this meeting, the next-20 canvas will have your fingerprints on it."

That's the bar. If the dry-run hits every checkbox, that script lands.
