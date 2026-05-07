# Leadership Presentation Plan — Annual Report, Services, Innovation, Elders, Next 20

**Audience:** PICC Board + senior leadership (Rachel, Luella, Narelle, Elders Group reps)
**Goal:** Show that the platform is no longer a website — it is a *living instrument of community control*. Annual reports, service stories, Elders' work, and the 20-year vision all run from one source of truth (Empathy Ledger v2 + PICC Supabase), with the community holding the pen.
**Date target:** TBD (work back from confirmed meeting date)

---

## 1. The frame (90 seconds at the top)

> "PICC belongs to the community."
> "Working with the community, not for the community."
> "Most of every PICC dollar pays a Palm Islander to deliver a service to another Palm Islander."

Four voices in one platform:
- **Organisation** (governance, public record) — Luella's voice
- **CEO / Direction** (where we're going) — Rachel's voice
- **Service / Operations** (what actually happens) — Narelle-verified
- **Community / Elders** (whose island this is) — named, consented, Elder-approved

Three threads that braid into one story:
1. **20 years of community control** (2007 public co. → 2021 community-controlled; 1 staff → 197; $1.6M → $23.4M)
2. **Bwgcolman Way** as inflection — Part 2A delegated authority, Rachel as sole delegate, 439 children statewide by Dec 2025
3. **Next 20 years** as a *design choice*, not a forecast — six community visions already articulated

---

## 2. Presentation arc (six acts, ~45 min + Q&A)

Each act is anchored to a live page on the site so leaders can navigate it with us in the room and after.

### Act 1 — *Who we are now* (5 min)
**Surface:** [/](app/(public)/page.tsx) → [/picc/launchpad](app/picc/launchpad/page.tsx)
- Open with the homepage live counter (storytellers, services, voices). This isn't marketing — it's the dashboard.
- Pivot to `/picc/launchpad` (the leader-facing index) — show the 13 admin surfaces in one screen.
- **Innovative move:** open the platform live on screen, not slides. Let leaders click.

### Act 2 — *20 years, told as evidence* (8 min)
**Surfaces:** [/20-years](app/(public)/20-years/page.tsx) · [/road-to-20-years](app/(public)/road-to-20-years/page.tsx) · [/picc/finances](app/picc/finances/page.tsx)
- Year-by-year walk: scroll through 2007 → 2025 with a single anchor stat per year (revenue, headcount, services).
- Stop at three inflection moments: 2008 (auspice begins), 2021 (community ownership), 2024 (Bwgcolman Way delegated authority).
- **Innovative move:** turn the timeline into a *projection canvas* — leaders point at a year, the page expands to show photos + voices + decisions from that year.

### Act 3 — *Bwgcolman Way as proof* (7 min)
**Surfaces:** [/bwgcolman](app/(public)/bwgcolman/page.tsx) · [/picc/governance](app/picc/governance/page.tsx) · [/picc/sector-map](app/picc/sector-map/page.tsx)
- The legal frame: Part 2A Child Protection Act 1999, prescribed delegate criteria, child-by-child delegations.
- The numbers: 439 children, 16 entities, 197 → 439 statewide growth in 18 months — Palm is one site in a movement.
- **Open question to flag:** the $107.8M figure is statewide envelope vs Palm-specific contract. Narelle interview Part D7-D8 closes this. Surface it as a *next step*, not a hole.
- **Innovative move:** sector-map page shows the three-layer ecosystem (local roots, peak bodies, sector position) — this is the only place leaders can see PICC's place in the broader Aboriginal-controlled child protection landscape.

### Act 4 — *Services as living stories* (10 min)
**Surfaces:** [/services](app/(public)/services/page.tsx) · [/innovation](app/(public)/innovation/page.tsx) · [/picc/sector-map](app/picc/sector-map/page.tsx)
- Live service map: 26 active services (EL v2 confirmed), each with cover photo + staff + clients-served.
- Click any service → service detail page → quotes from people who use it (EL v2 voices-pool, 53 voices currently tagged).
- Show the **innovation page** — projects in flight (Elders innovation work, "20 voices for 20 years" sprint, themes-of-the-year curation).
- **Innovative move:** "live map of service innovation" — overlay on the island map markers for each service, click to see *who works there* + *who they serve* + *what's changed in the last year*. (Build gap — see §5.)

### Act 5 — *Elders + Voices as cultural authority* (8 min)
**Surfaces:** [/elders](app/(public)/elders/page.tsx) · [/voices](app/(public)/voices/page.tsx) · [/voices/pulse](app/(public)/voices/pulse/page.tsx) · [/voices/themes](app/(public)/voices/themes/page.tsx)
- Elders directory: dual-source (PICC Supabase profiles + EL v2 quotes), name-matched, consented.
- Voices wall: 452 voices grid, theme-filtered, searchable.
- **Pulse**: voice-of-the-week / month — a single named Elder or community member every cycle, RSS feed already live.
- **Themes-of-the-year** — featured_themes table + admin curation already shipped. Pick the 3 themes that frame FY24-25.
- **Innovative move:** "appears alongside" panel — when leaders click a person, show every other person they appear in photos with. Faces-in-frame is already wired from EL v2.

### Act 6 — *Next 20 years as a community canvas* (7 min)
**Surfaces:** [/picc/next-20](app/picc/next-20/page.tsx) · [/picc/vision](app/picc/vision/page.tsx) · [/picc/community-voice](app/picc/community-voice/page.tsx)
- The six community visions (heal trauma; children stay on Country; staff from Palm; Aboriginal governance; services designed locally; revenue stays on island).
- Three commitments + three urgent asks (delegated authority stays; Elder cultural review; data sovereignty).
- **Innovative move:** turn the next-20 page into a *signing canvas*. Each leader / Elder can attach a recorded voice note or written endorsement to a vision item, captured live. This is the bridge from "we presented to leaders" to "leaders co-authored the next 20 years."

---

## 3. Innovative formats — rank-ordered by impact for this audience

| Format | What it does | Where it lives | Build state |
|---|---|---|---|
| **Live service-innovation map** | Click a service, see staff + voices + change-this-year | `/services` + new map view | Partial — service map exists, innovation overlay is the gap |
| **20-year projection canvas** | Scroll-driven timeline that expands per year on click | `/20-years`, `/road-to-20-years` | Pages exist; check expansion-on-click works |
| **"Appears alongside" panel** | Faces-in-frame from EL v2 | `/voices/[slug]` | ✓ shipped (Apr 2026) |
| **Themes-of-the-year curation** | Editor-picked themes get top-of-page lift | `/voices/themes` | ✓ shipped |
| **Voice-of-the-month + RSS** | One named voice per cycle, public feed | `/voices/this-month`, feed.xml | ✓ shipped |
| **Pulse / live counter** | Storytellers + services + voices counts on home | `/` + `/empathy-ledger` iframe | ✓ live |
| **Annual report PDF (audience-targeted)** | Same data, four audiences | `/picc/reports/builder` | ✓ shipped (community/funder/supporter/board) |
| **Community signing canvas** | Vision endorsement + voice notes | new — needs build | Gap |
| **Elder-edition print run** | Deboss + foil cover, 50 copies | annual report bind | Production decision |

---

## 4. Site readiness — what's solid vs what's a gap

**Solid (can demo today):**
- `/services`, `/services/[slug]` — real EL v2 data, polished, photos pulled live (✓ EL connection now verified — see commit 3bfba799)
- `/elders`, `/elders/[slug]`, `/elders/leadership` — dual-source merged
- `/voices` family (wall, themes, pulse, this-month, ask, questions, notes, share-note) — all real data
- `/annual-reports` timeline — polished, era-filtered
- `/picc/next-20`, `/picc/governance`, `/picc/sector-map`, `/picc/finances`, `/picc/risks`, `/picc/library` — built Apr 2026
- Annual report PDF generator with audience targeting (community / funder / supporter / board)
- React-PDF v4 still has Vercel font bug (per memory) — if generating PDFs live in the meeting, downgrade to v3 or inline base64 first

**Gap (build before the meeting):**
1. **Live service-innovation map view** — `/services` has the map, but no overlay distinguishing "innovation programmes" from steady-state services. ~½ day.
2. **20-year canvas expansion** — verify each year on `/20-years` expands with photos + voices + decisions. Some years may be sparse.
3. **Community signing canvas** — vision-endorsement capture (voice + text). New page at `/picc/community-voice` already exists; check whether it captures contributions or just renders. ~1 day if scaffold only.
4. **Bwgcolman case-study production polish** — `/bwgcolman` exists but state needs verification before showing to leaders. ½ day.
5. **20 Voices for 20 Years sprint tracker** — surfaced in `/picc/voices` per memory; check it's at a presentable state.
6. **Verify React-PDF rendering** (Vercel font issue) before any live PDF demo.

**Risk to flag in-meeting (not a build):**
- $107.8M scope (statewide vs Palm-specific) — Narelle interview Part D7-D8 closes it.
- Funding beyond June 2027 — QATSICPP evaluation pending.
- Palm-specific outcome numbers (children, cases, families under Bwgcolman Way) — not yet public.

---

## 5. Build backlog — ordered by leverage × time

```
P0  (must-have for the meeting, do first)
  [ ] Verify /20-years and /road-to-20-years expand-on-click works for every year
  [ ] Verify /bwgcolman renders cleanly with real data
  [ ] Smoke-test annual report PDF in all four audiences (community/funder/supporter/board)
  [ ] Confirm /picc/launchpad index links resolve to live pages
  [ ] Walk every link on the demo path; fix any 404s

P1  (high impact, ~½–1 day each)
  [ ] Add "innovation programme" overlay/badge on /services map
  [ ] Surface "20 Voices for 20 Years" sprint progress on /picc/voices and /voices
  [ ] Build community signing canvas (vision endorsement + voice note capture)
        — page: /picc/community-voice or /next-20/sign
        — capture: text + optional audio; store in EL v2 via intake API (now working)

P2  (nice-to-have)
  [ ] Themes-of-the-year: pick + lock 3 themes for FY24-25 with Narelle
  [ ] Add presenter-mode toggle that hides admin chrome on /picc/* during the demo
  [ ] Print proof of one Elder-edition annual report cover for show-and-tell
```

---

## 6. Community-control voice strategy — how stories keep building after the meeting

The presentation is a *checkpoint*, not the destination. The continuing operation:

**Capture (input)** — every week, somewhere on the island:
- A voice note or photo intake via `/share-note`, EL v2 admin, or a staff member adding to a service folder.
- An Elder interview captured in EL v2 with cultural-sensitivity tagging at the source.
- A meeting summary that lands in `/picc/notes` (already exists) and gets promoted to a story when the speaker consents.

**Curate (review)** — fortnightly:
- Editorial review pulls themes-of-the-month from EL v2.
- Elders Group cultural review on anything tagged `elder-content`.
- Narelle service-truth review (so claims are still ones staff would own).

**Publish (output)** — three cadences:
- **Daily / weekly** — pulse voice-of-the-week, RSS feed, public.
- **Quarterly** — themes-of-the-quarter lift, featured_themes update.
- **Annually** — annual report (4 audience cuts) + Elder-edition print + 20-year vision update.

**Govern (control)** — three rules baked into the platform:
1. **Elder approval for any Elder content** (sensitivity flag enforces a workflow stop).
2. **Named only with consent** (no aggregate quotes scrubbed of attribution).
3. **Data sovereignty** — Palm Island data stays on Palm Island; nothing exports to state systems without family consent. EL v2 is the canonical archive — PICC consumes via API, doesn't extract.

This is what makes the platform *community control* and not just a CMS: the rules of capture, curation, and publication are owned by the same people whose stories they are.

---

## 7. Open decisions to bring into the meeting

1. **Which 3 themes lock for FY24-25?** (Narelle decision — themes-of-the-year)
2. **Does the 20-year vision document live on the platform or as a printed Elder document only?** (Rachel + Elders)
3. **Voice-note signing canvas — opt-in or default-public?** (Privacy/consent question for the Elders Group)
4. **Annual report production — which audience cuts get printed vs digital-only?** (Board decision; affects budget)
5. **"20 Voices for 20 Years" — who chooses the 20?** (Curatorial governance question)

---

## 8. What I'll do next if you greenlight this plan

1. Walk the P0 list end-to-end and produce a "demo path is clean" checklist.
2. Pick one P1 build to ship first — recommendation: **community signing canvas at `/picc/community-voice`** because (a) intake API is now verified working, (b) it operationalises the strategy in §6, (c) it gives the leaders something to do *in the meeting*, not just watch.
3. Bring back the dry-run script for the presentation (act-by-act with timing + click path) once the surfaces verify clean.

— end —
