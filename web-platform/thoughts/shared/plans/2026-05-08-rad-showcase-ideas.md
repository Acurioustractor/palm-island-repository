# Rad showcase ideas — voices · services · projects

*Brainstorm of modern, scroll-stopping ways to surface what PICC already has. Each idea is rated **Impact (1-5)** × **Effort (S/M/L/XL)** × **Innovation tier** so you can pick from a menu rather than deciding from scratch.*

The bar: nothing generic. No purple gradients. Every idea uses real data already in EL v2 / Supabase. The "feel" is community-owned, story-first, mobile-friendly, and projectable.

---

## Tier 1 — Ship in a day, demo-ready

These reuse what's already in place and would slot into the leader meeting or polish the existing demo path.

### 1.1 · Voice-of-the-day kiosk (S, Impact 5)

Full-bleed rotating display: one quote, one named face, one photo, auto-rotates every 30 s. Designed for the office TV / lobby screen. URL = `/kiosk/voices`. No nav, no chrome. Reads from validated `extracted_quotes` ranked by impact. After every meeting it would loop the room's signatures.

**Why rad:** turns idle TV time into community presence. The same content the annual report uses, but ambient.

### 1.2 · Quote cards as 9:16 share-able PNGs (S, Impact 4)

Generate a downloadable Instagram-story / TikTok-cover PNG from any validated quote: ocean background, ochre accent, photo + name + quote in Fraunces. Endpoint `/api/voice-card?id=<quote-id>` → returns image. Add a "Share this" button on `/voices/[slug]` and on the kiosk.

**Why rad:** Elder reads it on screen → tap → swipe to story. The platform becomes a content factory for community-owned social.

### 1.3 · "Appears alongside" force-graph (M, Impact 5)

You already have faces-in-frame data from EL v2. Render it as a clickable D3 force-directed graph at `/voices/network` — every named storyteller is a node, photo co-presence is an edge, edge weight by shared photo count. Drag, hover for name, click to open profile.

**Why rad:** turns the consent-cleared photo archive into a visual proof of community connectedness. *This is exactly the kind of "innovation we're talking about" Rachel would point at.*

### 1.4 · Live activity stream (S, Impact 4)

Twitter/Bluesky-style feed at `/pulse-live`: every event in the last 24 h — voice approved, vision endorsed, photo tagged, story published. Reuses `/api/community-visions` polling pattern. Sortable by service / theme.

**Why rad:** gives the leader meeting a way to say "while we've been talking, eight things happened in the platform." Provable life.

### 1.5 · Sign-the-vision Slack-style digest (M, Impact 4)

After the meeting, generate a single-page PDF or email digest summarising what was signed: cover photo, the room's themes, top three quotes, every signed vision with attribution. Routes through `/api/digests/session?session=meeting-2026-05-08`. Send via GHL.

**Why rad:** the platform produces its own meeting minutes. No one has to write them.

---

## Tier 2 — Two-to-three day builds, big payoff

Bigger but each one would change the demo materially.

### 2.1 · Service "stories" full-bleed scroller (M, Impact 5)

Reimagine `/services/[slug]` as a story-scroll: hero photo full-bleed, scroll → the one quote that defines this service, scroll → the staff face who runs it, scroll → the key stat with provenance, scroll → the *one thing that's changed this year*. Apple-product-page energy, Saltwater Almanac grammar.

Pulled from the same data already on the cards — no new fields needed.

**Why rad:** cookie-cutter SaaS service pages are the most generic surface in this space. A story-scroll page makes every service feel hand-tended.

### 2.2 · Voice constellation / star-map (L, Impact 5)

Render every consented voice as a star on a Saltwater & Earth night-sky background. Star size = impact_score. Cluster by theme. Hover → reveal quote. Click → open profile. Background is `midnight` with subtle ochre dot patterns echoing the logo.

**Why rad:** literally turns "they are our ancestors of tomorrow" into a visualisation. Calls back the logo. Projects beautifully on a wall.

### 2.3 · "Everyone who said X" theme deep-link (M, Impact 4)

On any theme page (`/voices/themes/[theme]`), add a "see this on a map" toggle that drops every speaker who used the theme onto a Palm-Island map at the place the conversation happened. Pulls from the existing geo-tagged photo data via EL v2.

**Why rad:** themes go from text-list to physical-place. *"This is what we've been saying about culture, all over the island."*

### 2.4 · Project / service Sankey flow (M, Impact 4)

For board / funder audiences specifically: a Sankey diagram at `/picc/finances` that flows funder → service → outcome (clients served / staff employed). Computed from `annual_financials` and `service_metrics`. Goal: prove "most of every PICC dollar pays a Palm Islander" visually.

**Why rad:** funders will *love* this. It also calls Rachel's anchor line.

### 2.5 · Photo timeline scroller (M, Impact 4)

Every consented photo, ordered by year, scrolled horizontally. Decade markers. Filter by category (services, leadership, events, country). Click to enter full-screen viewer with caption + people named. Uses `/api/photos` with year buckets.

**Why rad:** the photo archive is currently per-service or per-page. A timeline view turns it into a visual oral history.

---

## Tier 3 — Bigger swings, week-plus builds

These are bets, not commitments. Pick at most one to start.

### 3.1 · Listen-to-PICC audio tour (XL, Impact 5)

Web Speech API + EL audio (where it exists) → an audio guide that reads validated voices aloud. Each service page has a "listen" button. New page `/listen` is a podcast-style queue of every named voice. Subtitled, accessible. Optional: ElevenLabs to generate a Rachel/Luella voice from samples (with consent).

**Why rad:** literacy-independent. A grandmother who can't read English can listen. Cultural — voice is the medium that matters most.

### 3.2 · Year-in-review auto-shorts (XL, Impact 5)

Stitches photos + voice clips + stats into 60-second 9:16 vertical videos by year. Server-side `ffmpeg` or Remotion. One per year for FY24-25 plus a 17-year mega-cut. Distributed via TikTok/Insta.

**Why rad:** the annual report becomes shareable in a way no PDF ever is.

### 3.3 · Constellation of services (XL, Impact 4)

Like 2.2 but services are the stars and lines connect to the people they serve. Animated. Rotates slowly. Background motion synced to ambient audio of Palm Island recorded by community.

**Why rad:** ambient room piece. Office TV hero. Calls back to the logo cosmology.

### 3.4 · "Then & now" split-scroller per service (L, Impact 4)

Each service has a horizontal split-screen scroll: left side is 2007 (auspice begins), right side is 2025 (Bwgcolman Way / current state). Photos parallax. Numbers count. The 17-year journey told one service at a time.

**Why rad:** quantifies the community-control transition concretely, service by service.

### 3.5 · Indigenous data sovereignty visualisation (XL, Impact 5)

A visual essay at `/data-sovereignty`: animated diagram of where PICC data lives (community-controlled archive) vs where state systems would put it (extracted to government servers). Uses Tammy's BEAI quotes verbatim. Closes with the rule: *Palm Island data stays on Palm Island.*

**Why rad:** the most under-told PICC innovation. Visual proof of a structural commitment.

---

## Tier 4 — Wild swings (worth thinking about, not committing)

### 4.1 · AR turtle on the cover

Scan the annual report cover with the camera → turtle animates, dot circles ripple, plays a Rachel quote. Could be done with WebAR / 8th Wall.

### 4.2 · Voice-recorder embedded in /sign-the-vision

Record a 30-sec voice note instead of typing. Upload to Supabase Storage. Plays back on the canvas when approved. Makes the signing canvas literally hold the voice.

### 4.3 · "Walk Palm Island" geo-located audio

Stand somewhere on Palm, the app plays the voices recorded at that spot. Requires GPS permission + audio-tagged voice clips.

### 4.4 · LLM-narrated tour of the platform

User asks a question, the platform answers using EL voices as the corpus. Already partially built (`/explore` chat) — but reframe it as "ask the community" with attribution to the named storytellers.

### 4.5 · Generational voice threads

Visualise grandparent → parent → child voices on related themes side-by-side. Pulls from EL storyteller relationships if they exist; otherwise use surname matching as a starting hint.

---

## Recommended pick-list

If we ship one Tier-1 item per day for the next week, the platform looks unrecognisable from where it was a fortnight ago. My ranked recommendation:

1. **1.3 · Force-graph "appears alongside"** — biggest "wow" per hour of work. Demo gold.
2. **1.2 · Quote cards as PNGs** — turns the platform into a content factory.
3. **2.1 · Service stories full-bleed scroller** — fixes the most generic surface.
4. **1.4 · Live activity stream** — proves the platform is alive, not staged.
5. **2.4 · Funder Sankey flow** — pairs with Rachel's anchor line for board audiences.

Then a Tier-3 stretch — likely **3.1 (audio tour)** for the cultural fit, or **3.5 (data sovereignty visual essay)** for the strategic-narrative fit.

---

## What unites these

Every idea above:
- Uses **data already in EL v2 or Supabase** — no new collection
- Respects **consent and Elder review** — nothing decorative with cultural content
- Is **mobile-first** — Elders, board, community all on phones in the room
- Carries the **Saltwater & Earth** palette — no purple gradients, ever
- Tells **one specific story** — not a feature dump
- Could be projected, scanned, or scrolled on a tablet — never just admin

If a candidate idea fails any of those, kill it before you start.
