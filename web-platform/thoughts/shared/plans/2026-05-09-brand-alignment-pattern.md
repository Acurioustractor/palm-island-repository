# Brand Alignment Pattern — operator admin pages

Use this when fixing any /picc/* page that's still using generic
Tailwind chrome (blue / indigo / purple / emerald / amber / rose
icon backgrounds, gray-400 eyebrows, sans-serif h1, blue-50→indigo-50
gradients).

The pattern is already live on these pages — copy from there:
- `/picc/canvas` — full reference, 8 sections
- `/picc/dashboard` — typical operator landing
- `/picc/walk` — presenter map, audience-toggle
- `/picc/services/coverage` — admin index pattern

---

## The recipe

### 1. Header — every page

```tsx
<p
  className="uppercase font-bold mb-2"
  style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
>
  PICC admin · {section}
</p>
<h1
  className="font-fraunces font-bold leading-tight"
  style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 48px)' }}
>
  {Section title.}
</h1>
<p className="mt-2 text-sm" style={{ color: C.driftwood }}>
  {One-line context. Signpost to /picc/canvas if relevant.}
</p>
```

Eyebrow is **always** turtleRed with 0.3em tracking. H1 is **always**
Fraunces, ocean colour. Subhead is always driftwood, ~14px.

### 2. Stat cards — top-border pattern

```tsx
<div
  className="rounded-xl bg-white p-4"
  style={{
    border: `1px solid ${C.border}`,
    borderTopWidth: 3,
    borderTopColor: <SECTION_COLOUR>,
  }}
>
  <p className="text-[10px] uppercase font-bold" style={{ color: <SECTION_COLOUR>, letterSpacing: '0.2em' }}>
    {Label}
  </p>
  <p className="font-fraunces font-bold mt-1 leading-none" style={{ color: C.ocean, fontSize: 28 }}>
    {value}
  </p>
  <p className="text-[11px] mt-2" style={{ color: C.driftwood }}>
    {sub-line}
  </p>
</div>
```

**No coloured icon background tiles.** No `bg-blue-50 text-blue-600`
chrome. The colour lives on the top border + label, the number is
always ocean Fraunces.

### 3. Section cards — eyebrow + body

```tsx
<div className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${C.border}` }}>
  <h3
    className="uppercase font-bold mb-4"
    style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
  >
    {Section heading}
  </h3>
  {children}
</div>
```

Section headings are turtleRed eyebrow style. **Never** use plain
gray-900 sans-serif h3.

### 4. CTA buttons — primary action

```tsx
<Link
  href={...}
  className="px-5 py-2.5 text-sm font-bold uppercase tracking-widest rounded-md hover:opacity-90 transition"
  style={{ backgroundColor: C.ocean, color: '#FBF8EE', letterSpacing: '0.15em' }}
>
  {Verb the action}
</Link>
```

Primary CTAs are **ocean background, shell text, uppercase tracking-widest**.
Never gray-900. Never default Tailwind blue.

### 5. Status pills — derived tone

```tsx
const tone = status === 'published' ? '#16A34A'
           : status === 'drafting' ? C.ochre
           : status === 'pending' ? C.turtleRed
           : C.driftwood
<span
  className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded"
  style={{ backgroundColor: tone + '22', color: tone, letterSpacing: '0.15em' }}
>
  {status}
</span>
```

Pill backgrounds are always `<tone>+'22'` (low-opacity tint). Text is
the same tone. **No raw bg-amber-100 text-amber-700.**

### 6. Cards with category — left-edge band

```tsx
<div
  className="rounded-xl bg-white p-4"
  style={{
    border: `1px solid ${categoryColour}33`,
    borderLeftWidth: 4,
    borderLeftColor: categoryColour,
  }}
>
```

Used on /picc/vision visions list, /picc/canvas action queue. The
category colour is on the left edge so the eye scans top-to-bottom
fast.

### 7. Empty states — never bare

```tsx
<p className="text-sm text-center py-6" style={{ color: C.driftwood }}>
  {Specific empty-state copy}
</p>
```

Never "No results." Always "No pending reviews." or "No deadlines in
the next 30 days." — descriptive of the specific filter/section.

---

## The token cheatsheet

```ts
// from @/components/annual-report/2024-25/almanac/tokens
C.ocean       = '#0B4F6C'   // primary brand, h1, ocean text
C.ochre       = '#C8963E'   // secondary brand, accents
C.earth       = '#2D2319'   // body text on shell
C.starGold    = '#F5A623'   // print/annual-report register
C.turtleRed   = '#8B1A1A'   // eyebrows, alerts, primary
C.sand        = '#FEF3C7'   // soft accent bg
C.midnight    = '#1A1A2E'   // dark hero / footer bg
C.driftwood   = '#6B6560'   // muted text
C.muted       = '#A39E99'   // very-muted text
C.shell       = '#F7F6F4'   // off-white card bg
C.border      = '#E8E6E3'   // borders

// SECTION_COLOURS map service categories to brand tones:
SECTION_COLOURS.healthWellbeing   = ochre
SECTION_COLOURS.educationCommunity = ocean
SECTION_COLOURS.governance        = turtleRed
SECTION_COLOURS.justiceSafety     = (red variant)
SECTION_COLOURS.economic          = starGold
```

---

## Pages still on generic chrome (sweep backlog)

Found via `grep -rln "bg-blue-50\|bg-indigo-50\|bg-purple-50\|bg-emerald-50"`:

| Path | Priority | Notes |
|---|---|---|
| /picc/inbox | high | sidebar-visible, operator landing |
| /picc/report-readiness | high | sidebar-visible |
| /picc/database | medium | sidebar-visible |
| /picc/stories | medium | high traffic, content review |
| /picc/community-voice | medium | content surface |
| /picc/capture | medium | content surface |
| /picc/innovation | medium | sidebar-visible |
| /picc/insights/impact | low | analytics |
| /picc/insights/timeline | low | analytics |
| /picc/scraper | low | tool |
| /picc/permissions | low | settings-tier |
| /picc/content-studio | low | tool |
| /picc/content-hub/* | low | tools |
| /picc/knowledge/* | low | tools |
| /picc/report-generator | low | already wired, pencil-driven |
| /picc/create | low | scratchpad |
| /picc/guide | low | docs |

**Order of attack** (next session): /picc/inbox → /picc/report-readiness
→ /picc/stories → /picc/innovation → the rest.

The pattern is short enough to apply in 5-10 min per page once you
know the recipe above. No rebuild — just header + stat cards + section
headings + CTA + pills.

---

## Consistency rules (the "would Saltwater & Earth recognise this?" test)

1. Does the eyebrow read uppercase + turtleRed + 0.3em tracking? ✓
2. Is the H1 Fraunces, ocean colour? ✓
3. Are stat numbers ocean Fraunces (not gray-900 sans)? ✓
4. Are status pills using `tone + '22'` backgrounds? ✓
5. Is the primary CTA ocean + shell + uppercase tracking-widest? ✓
6. Is the page background `#FBF8EE` or `C.shell`? ✓
7. Are borders `C.border` (#E8E6E3) — not `border-gray-200`? ✓
8. Do icons use brand colour (ochre, ocean, driftwood) — not blue/purple/indigo? ✓

If any answer is no, the page reads as a generic SaaS template and
the brand breaks. The fix is mechanical — copy from the recipe above.
