# PICC Showcase — priority surfaces, all data lit up

*The platform has 26 services · 50+ projects · 197 staff · 452 voices · 8+ named Elders · 17 years of timeline · ~$23.4M of finance data · two Elder trips · a 20-year vision. Everything below is the menu of ways to surface that data so it FEELS alive. Pick from this list — nothing ships until you agree.*

The frame from the rebuild we just did:
- **Saltwater Almanac grammar everywhere** — full-bleed photos, big Fraunces, scroll motion, voices heard not described
- **Real data only** — no Lorem, no static placeholders, no orphan cards
- **One specific story per surface** — never a feature dump
- **Mobile-first, projectable** — Elders, board, community all on phones in the room

---

## 1 · ALL services lit up

**What exists now**
- `/services` index — 26 active services from EL v2, map, badge, innovation banner ✓
- `/services/[slug]` detail pages — hero photo, voices, quotes, photo gallery (audited as polished)

**What's thin**
- The index is a card grid — not a *story*. Cookie-cutter SaaS feel.
- Cover photos work via the slot-tag mechanism, but coverage isn't 100% (some services have no hero yet).
- The "what changed this year" beat is missing — every service should declare *one* thing that's different from last year.

**Priority moves (in order)**
1. **Hero coverage audit** — query EL v2 for which of the 26 services have a tagged hero photo and which don't. Surface the gap so Narelle/team can fill it.
2. **Service stories full-bleed scroller** — replace the per-service detail page with a scroll-driven layout: hero photo full-bleed → the one defining quote → key stats with provenance → the staff face who runs it → "what changed this year" → CTA.
3. **One-line "this year" per service** — small `service_metrics.headline_stat_label` already exists; lift it on cards as the second line under the service name. Currently buried.
4. **Service constellation** — *innovation idea*: render every service as a node with lines connecting to the funders, the staff count, the families served. Force-directed graph at `/services/network`.

---

## 2 · ALL projects lit up

**What exists now**
- `/projects/[slug]` detail pages exist ✓
- `/innovation` lifts a curated subset (the canonical INNOVATION_SLUGS) ✓
- `projects` table holds `project_type='innovation'` rows — currently filtered to is_public

**What's missing**
- **No `/projects` index page.** There's no single surface that lists every project. They're discoverable only via the curated `/innovation` subset or direct slug links.
- Projects don't have a "stage" badge (planning / active / wrapping up / done) on the cards.
- No timeline view — projects are listed flat, not by when they happened.

**Priority moves**
1. **`/projects` index page** — every project, filterable by status (active / planning / completed) and theme (Culture & Country / Tech & Sovereignty / Employment & Enterprise). Hero photo per project, tagline, status badge.
2. **Project timeline** — same projects rendered on a horizontal scroll by year. Visual story of "what PICC has been building."
3. **Linked services** — each project page lists which services it touches (currently no link between `projects` and `organization_services`). Schema-light: a `project_services` join table or a `related_service_slugs` array.

---

## 3 · ALL storytellers + their voices

**What exists now**
- `/voices` index with VoiceWall + StorytellerSearchStrip ✓
- `/voices/[slug]` per-storyteller profiles
- 452 voices across `elder_quotes` (162) + `extracted_quotes` (290)
- 20 Voices for 20 Years sprint tracker (just shipped) ✓

**What's thin**
- VoiceWall renders quotes; it doesn't really show the *people*. Names are tiny attributions.
- Each storyteller profile renders text-heavy. Photos are small.
- No way to see "everyone who has spoken about [theme]" with their faces.

**Priority moves**
1. **Storyteller wall with portraits** — at `/voices/who`, every named storyteller as a face-tile (name + role + quote count). Click into profile.
2. **"Appears alongside" face-graph** — already in the rad-ideas doc. Highest wow-per-hour. Shows community connectedness as a force-directed graph.
3. **Per-storyteller hero treatment** — `/voices/[slug]` redesigned: portrait full-bleed, name in big Fraunces, role + service in small caps, then their 5–10 strongest quotes with theme tags, then "appears alongside" mini-grid.
4. **Quote cards as 9:16 PNGs** — already in rad-ideas. Turns the platform into a content factory for community-owned social.

---

## 4 · ALL Elders + their work

**What exists now**
- `/elders` directory with merged data from PICC profiles + EL v2 (audited as polished, dual-source)
- `/elders/[slug]` profiles with merged quotes
- `/elders/leadership` page
- 8 named Elders in governance per SOUL.md
- `elder_trip_stops` table holds the 2024 trip data

**What's missing — the big ones you flagged**
1. **Family tree linkage** — no surface that shows generational connections between Elders / community. The data may not exist yet in clean form; needs a small schema move.
2. **Atherton Tablelands trip** — `elder_trip_stops` has data; no public-facing rendering of the trip story.
3. **Past trip (the earlier Elders journey)** — same pattern — data probably scattered across stories/photos with no dedicated surface.
4. **Aggregate themes view** — when an Elder is named, what themes do they speak to most? Which services have they shaped? No view shows this.

**Priority moves**
1. **`/elders/trips` index** — both trips on one page. Map of the journey, photos at each stop, voices recorded along the way, captions. Use the ImageGallery + parallax pattern.
2. **`/elders/trips/atherton-tablelands-2025`** and **`/elders/trips/2024`** — each its own scroll-story. Day-by-day, photo-rich, with the audio quote where we have it.
3. **Family tree visual** — *needs a small data move first*. Add a `kinship` table or a `related_storyteller_ids` array on `profiles`. Then render a visual graph at `/elders/kin` showing Elder → child → grandchild lines. Big cultural-sovereignty win when done with consent.
4. **Per-Elder thematic page** — at the bottom of `/elders/[slug]`, surface "what Aunty Marjorie has spoken to most" — top 3 themes with quote counts and links into `/voices/themes/<theme>` filtered to her voice.
5. **"Elder constellation"** — *innovation idea*: voice constellation but Elders-first. Shows how the named Elders' voices radiate across services, projects, decades.

---

## 5 · The 20-year journey

**What exists now**
- `/20-years` — scrolling history page with year cards, era sections, quotes, growth chart, milestones (audited as polished)
- `/road-to-20-years` — 297 lines, structured strategy view
- `/picc/next-20` working canvas — 3 columns (visions, commitments, urgent asks), live polling ✓

**What's thin**
- The /20-years scroll is information-dense but not cinematic. Each year is a card; nothing pauses you.
- No "then & now" comparison — 2007 vs 2025 side-by-side per service.
- Forward commitments live in /picc/next-20 (admin); no public "where we're going" page.

**Priority moves**
1. **`/20-years/journey` cinematic rewrite** — full-bleed photo per inflection year (2007, 2008, 2021, 2024), big Fraunces date, one anchor stat, one quote, then scroll continues. The way the rebuilt /design-system flows.
2. **Then & now split-scroller** (rad-ideas Tier 3, but worth lifting earlier) — left side 2007, right side 2025, photos parallax, numbers count, service by service.
3. **Public /next-20 page** — a public-facing version of the working canvas (currently /picc/next-20 is admin). Six community visions front and centre, three commitments, sign-the-vision CTA. The signing canvas already feeds it.
4. **Photo timeline scroller** — every consented photo by year, horizontal scroll, decade markers. Already a Tier 2 rad-idea.

---

## 6 · Annual report data, alive

**What exists now**
- `/picc/finances` page (built Apr 2026, per memory)
- `annual_financials` table holds revenue/expenditure by year
- React-PDF annual report templates (audience-targeted: community/funder/supporter/board)
- Static infographics in `public/icons/picc/infographics/`

**What's thin**
- Finance page renders the curve but doesn't *tell* the story. Numbers without narrative.
- No funder → service → outcome flow visible anywhere.
- Static infographics are PNG renders, not interactive. They were generated for the PDF.
- No "who funded what this year" lookup.

**Priority moves**
1. **Funder Sankey flow** (rad-ideas 2.4) — at `/picc/finances` or new `/impact/funder-flow`. Funder → service → families served. Computed from `annual_financials` and `service_metrics`. Pairs with Rachel's anchor line: "Most of every PICC dollar pays a Palm Islander to deliver a service to another Palm Islander."
2. **Animated metric counters with provenance** — every big number on the page (197 staff, $23.4M, 26 services, 452 voices) animates from 0 on scroll-into-view AND has a tiny "source: …" hover tooltip. Provenance is already a stated rule; this surfaces it.
3. **17-year revenue + headcount split** — single chart, dual axis. Show the 1 → 197 staff line and the $1.6M → $23.4M revenue line on the same plot. The community-control inflection (2021) marked with a vertical line.
4. **"This year by the numbers" hero strip** — single horizontal hero on `/impact` with five animated stats: clients served · staff employed · stories captured · photos consented · revenue retained on island. All computed live from the canonical tables.
5. **Indigenous data sovereignty visual essay** (rad-ideas 3.5) — the under-told PICC innovation. Worth doing because nothing else makes this innovation visible.

---

## 7 · Aggregations across everything (the meta-views)

These don't have a current surface but unlock huge "wow" with the existing data.

**Priority moves**
1. **`/explore` reframed as "ask the community"** — chat already exists. Reframe so the corpus is named voices and the answers cite who said what. Already partially built per memory.
2. **`/voices/themes/<theme>` upgraded** — from theme list to: theme story-scroll. Open with a defining quote. Then every speaker's face. Then a map of where the conversation happened. Then top 5 quotes.
3. **Live activity stream** (rad-ideas 1.4) — `/pulse-live`. Voice approved · vision endorsed · photo tagged · story published. Last 24h.
4. **Year-in-review auto-shorts** (rad-ideas 3.2) — vertical 9:16 videos generated from photos + voice clips + stats by year. Distributable.

---

## 8 · Connective tissue (small but high leverage)

These connect existing data so users can move *between* surfaces naturally.

1. **Service ↔ Project** — currently no FK. Add `related_service_slugs` to projects.
2. **Storyteller ↔ Service** — `voices-pool` API already returns `service_slugs[]`. Use it on `/services/[slug]` to show "voices from this service" prominently.
3. **Elder ↔ Theme** — compute on render. Show top 3 themes per Elder.
4. **Theme ↔ Photo** — photos in EL v2 should carry thematic tags so `/voices/themes/<theme>` can show photo + quote pairs, not just text.
5. **Project ↔ Trip / Vision** — projects that came out of the Elders trips or signed visions should link back. Story discoverability.

---

## 9 · The data we don't have yet (or that needs cleaning)

Pure gaps to fill before the showcase work pays off:

| Gap | Source | Owner |
|---|---|---|
| Service hero photos for every active service | EL v2 admin tag | Narelle / media team |
| Family tree / kinship data | New table or array on profiles | Elder consultation needed |
| Atherton Tablelands trip stops + photos | `elder_trip_stops` table + EL v2 photos tagged for the trip | Trip lead |
| Per-Elder consent flags for public surfacing | Existing `permission_level` column — audit | Cultural review group |
| Project status field consistency | Already exists; verify all rows have it | Data cleanup |
| "What changed this year" line per service | New column or `metadata.changed_this_year` | Narelle review pass |

---

## Recommended pick-list — order to build in

If we ship one of these per session, the platform transforms in two weeks. Each one is sized **S/M/L** and is independent from the others.

1. **`/projects` index page** (S) — the missing front door. Existing data, one page.
2. **Service hero coverage audit + dashboard** (S) — operator surface listing which services need a hero photo. Unblocks #3.
3. **Service stories full-bleed scroller** for `/services/[slug]` (M) — the rebuild that makes service pages feel alive.
4. **Storyteller wall with portraits** at `/voices/who` (M) — face-first, not quote-first.
5. **`/elders/trips` + sub-pages** (M) — Atherton + past trip as scroll-stories. Pulls from `elder_trip_stops` + tagged photos.
6. **Funder Sankey** at `/picc/finances` (M) — single biggest funder/board win.
7. **Animated metric counters with provenance** (S) — sprinkle across `/`, `/impact`, `/services`, `/voices`.
8. **Per-Elder thematic page** (S) — bottom of every `/elders/[slug]`.
9. **Family tree (after data) at `/elders/kin`** (L) — needs schema move + Elder consent first. Plan, don't build yet.
10. **Then & now split-scroller** (L) — the polish piece. After 1–8.
11. **Live activity stream** at `/pulse-live` (S) — proves the platform is alive.

---

## How we work from here

Two rules for the rest of the cycle:

1. **No more drive-by deploys.** We agree on which surface from the list above to build, build it locally, walk it on a preview URL, then merge in one batch. No more "merge → notice issue → hot-fix" loops.
2. **Every priority builds against the same five rules** (from the rad-ideas doc):
   - Real data already in EL/Supabase — no synthetic content
   - Consent + Elder review respected
   - Mobile-first
   - Saltwater & Earth palette
   - One specific story per surface

When you're ready, point at one item from the pick-list and we go. My recommendation for the next build: **`/projects` index** — it's the smallest gap and the data is all there.
