/**
 * PICC Design System — element registry.
 *
 * Declarative source of truth for every graphic element in the platform.
 * Surfaces in /picc/design-system/ for voting + curation. Promoted
 * elements (status='priority') become the palette for new pages.
 *
 * To add a new element: append an entry here. The voting page picks it
 * up automatically. No schema migration needed.
 */

export type ElementCategory =
  | 'infographic'      // Big idea concept renders — the showpiece visuals
  | 'motif'            // Reusable brand patterns / corner treatments
  | 'section-icon'     // SECTION map room icons (theme.ts)
  | 'bespoke-icon'     // Named PICC icon library (with white variant)
  | 'museum-element'   // The 12-element curatorial grammar (PDF + web)
  | 'report-component' // Higher-order composed components (BoardGrid etc.)
  | 'pencil-component' // Reusable components designed in picc-annual-report.pen

export type Implementation = 'pdf' | 'web' | 'concept'

export interface DesignElement {
  /** Stable unique key — used as primary key in design_element_votes */
  slug: string
  /** Display name */
  name: string
  /** Category for filtering */
  category: ElementCategory
  /** How to render the preview card */
  previewType: 'image' | 'component-stub'
  /** assetUrl path (for 'image') or short stub label (for 'component-stub') */
  previewSrc: string
  /** Where it lives in the codebase */
  source: string
  /** What it IS — one liner */
  description: string
  /** Which renderers actually have this element */
  implementations?: Implementation[]
  /** Optional: a paired light/dark variant for icons */
  variantSrc?: string
}

// ─────────────────────────────────────────────────────────────
// 1. Infographic concepts (8) — /icons/picc/infographics/
//    Big-idea PNG mockups designed in Figma/elsewhere. Need to
//    be ported into data-driven TSX as the next step after voting.
// ─────────────────────────────────────────────────────────────

const INFOGRAPHICS: DesignElement[] = [
  {
    slug: 'infographic-saltwater-rings',
    name: 'Saltwater Rings',
    category: 'infographic',
    previewType: 'image',
    previewSrc: '/icons/picc/infographics/01-saltwater-rings.png',
    source: 'public/icons/picc/infographics/01-saltwater-rings.png',
    description: 'Concentric ring structure — could anchor a year-in-numbers spread.',
    implementations: ['concept'],
  },
  {
    slug: 'infographic-river-timeline',
    name: 'River Timeline',
    category: 'infographic',
    previewType: 'image',
    previewSrc: '/icons/picc/infographics/02-river-timeline.png',
    source: 'public/icons/picc/infographics/02-river-timeline.png',
    description: 'Flowing river-form timeline — alt to a linear journey strip.',
    implementations: ['concept'],
  },
  {
    slug: 'infographic-reef-layers',
    name: 'Reef Layers',
    category: 'infographic',
    previewType: 'image',
    previewSrc: '/icons/picc/infographics/03-reef-layers.png',
    source: 'public/icons/picc/infographics/03-reef-layers.png',
    description: 'Stacked reef-strata layout — could express service tiers.',
    implementations: ['concept'],
  },
  {
    slug: 'infographic-constellation-stats',
    name: 'Constellation Stats',
    category: 'infographic',
    previewType: 'image',
    previewSrc: '/icons/picc/infographics/04-constellation-stats.png',
    source: 'public/icons/picc/infographics/04-constellation-stats.png',
    description: 'Stars-on-night-sky stats grouping — already echoed in KulingField element.',
    implementations: ['concept'],
  },
  {
    slug: 'infographic-before-after-hull',
    name: 'Before / After Hull',
    category: 'infographic',
    previewType: 'image',
    previewSrc: '/icons/picc/infographics/05-before-after-hull.png',
    source: 'public/icons/picc/infographics/05-before-after-hull.png',
    description: 'Hull River before/after comparison — the Specimen element in PNG form.',
    implementations: ['concept'],
  },
  {
    slug: 'infographic-stat-hero-horizon',
    name: 'Stat Hero Horizon',
    category: 'infographic',
    previewType: 'image',
    previewSrc: '/icons/picc/infographics/06-stat-hero-horizon.png',
    source: 'public/icons/picc/infographics/06-stat-hero-horizon.png',
    description: 'Single-stat over horizon line — Reliquary in mockup form.',
    implementations: ['concept'],
  },
  {
    slug: 'infographic-elder-quote-wash',
    name: 'Elder Quote Wash',
    category: 'infographic',
    previewType: 'image',
    previewSrc: '/icons/picc/infographics/07-elder-quote-wash.png',
    source: 'public/icons/picc/infographics/07-elder-quote-wash.png',
    description: 'Elder quote over textured wash — sacred-voice treatment, ties to Lantern.',
    implementations: ['concept'],
  },
  {
    slug: 'infographic-services-around-island',
    name: 'Services Around Island',
    category: 'infographic',
    previewType: 'image',
    previewSrc: '/icons/picc/infographics/08-services-around-island.png',
    source: 'public/icons/picc/infographics/08-services-around-island.png',
    description: 'Island map with services radiating — Atlas in mockup form.',
    implementations: ['concept'],
  },
]

// ─────────────────────────────────────────────────────────────
// 2. Brand motifs (5) — /icons/picc/motifs/
//    Reusable surface treatments. Already in some PDF elements.
// ─────────────────────────────────────────────────────────────

const MOTIFS: DesignElement[] = [
  { slug: 'motif-concentric-corner', name: 'Concentric Corner',  category: 'motif', previewType: 'image', previewSrc: '/icons/picc/motifs/01-concentric-corner.png', source: 'public/icons/picc/motifs/01-concentric-corner.png', description: 'Concentric arcs anchored to a corner.', implementations: ['concept'] },
  { slug: 'motif-arc-dots',          name: 'Arc Dots',           category: 'motif', previewType: 'image', previewSrc: '/icons/picc/motifs/02-arc-dots.png',          source: 'public/icons/picc/motifs/02-arc-dots.png',          description: 'Curved arc of dots — section header underline candidate.', implementations: ['concept'] },
  { slug: 'motif-star-marker',       name: 'Star Marker',        category: 'motif', previewType: 'image', previewSrc: '/icons/picc/motifs/03-star-marker.png',       source: 'public/icons/picc/motifs/03-star-marker.png',       description: 'Single star — cross-reference / sacred marker.', implementations: ['concept'] },
  { slug: 'motif-corner-brackets',   name: 'Corner Brackets',    category: 'motif', previewType: 'image', previewSrc: '/icons/picc/motifs/04-corner-brackets.png',   source: 'public/icons/picc/motifs/04-corner-brackets.png',   description: 'Four-corner brackets — already used as page-edge accent.', implementations: ['pdf', 'web'] },
  { slug: 'motif-constellation',     name: 'Constellation',      category: 'motif', previewType: 'image', previewSrc: '/icons/picc/motifs/05-constellation.png',     source: 'public/icons/picc/motifs/05-constellation.png',     description: 'Scattered dot field — already used as ambient backdrop.', implementations: ['pdf', 'web'] },
]

// ─────────────────────────────────────────────────────────────
// 3. SECTION room icons (10) — /icons/picc/NN-name.png
//    Theme.ts SECTION map references these by code.
// ─────────────────────────────────────────────────────────────

const SECTION_ICONS: DesignElement[] = [
  { slug: 'section-icon-concentric-dots', name: '01 · Concentric Dots',  category: 'section-icon', previewType: 'image', previewSrc: '/icons/picc/01-concentric-dots.png', source: 'public/icons/picc/01-concentric-dots.png', description: 'Generic ambient marker.', implementations: ['concept'] },
  { slug: 'section-icon-health',          name: '02 · Health',           category: 'section-icon', previewType: 'image', previewSrc: '/icons/picc/02-health.png',          source: 'public/icons/picc/02-health.png',          description: 'Health & Wellbeing room.', implementations: ['concept'] },
  { slug: 'section-icon-family',          name: '03 · Family',           category: 'section-icon', previewType: 'image', previewSrc: '/icons/picc/03-family.png',          source: 'public/icons/picc/03-family.png',          description: 'Children & Families room.', implementations: ['concept'] },
  { slug: 'section-icon-justice',         name: '04 · Justice',          category: 'section-icon', previewType: 'image', previewSrc: '/icons/picc/04-justice.png',         source: 'public/icons/picc/04-justice.png',         description: 'Justice & Safety room.', implementations: ['concept'] },
  { slug: 'section-icon-community',       name: '05 · Community',        category: 'section-icon', previewType: 'image', previewSrc: '/icons/picc/05-community.png',       source: 'public/icons/picc/05-community.png',       description: 'Education & Community room.', implementations: ['concept'] },
  { slug: 'section-icon-economic',        name: '06 · Economic',         category: 'section-icon', previewType: 'image', previewSrc: '/icons/picc/06-economic.png',        source: 'public/icons/picc/06-economic.png',        description: 'Economic room.', implementations: ['concept'] },
  { slug: 'section-icon-digital',         name: '07 · Digital',          category: 'section-icon', previewType: 'image', previewSrc: '/icons/picc/07-digital.png',         source: 'public/icons/picc/07-digital.png',         description: 'Digital room (alt cross-cut).', implementations: ['concept'] },
  { slug: 'section-icon-elder',           name: '08 · Elder',            category: 'section-icon', previewType: 'image', previewSrc: '/icons/picc/08-elder.png',           source: 'public/icons/picc/08-elder.png',           description: 'Elders room (alt cross-cut).', implementations: ['concept'] },
  { slug: 'section-icon-youth',           name: '09 · Youth',            category: 'section-icon', previewType: 'image', previewSrc: '/icons/picc/09-youth.png',           source: 'public/icons/picc/09-youth.png',           description: 'Youth room.', implementations: ['concept'] },
  { slug: 'section-icon-country',         name: '10 · Country',          category: 'section-icon', previewType: 'image', previewSrc: '/icons/picc/10-country.png',         source: 'public/icons/picc/10-country.png',         description: 'Country / On Country room.', implementations: ['concept'] },
]

// ─────────────────────────────────────────────────────────────
// 4. Bespoke icons (42) — /icons/bespoke/<name>.png
//    Each has a paired white variant in /icons/bespoke-white/.
// ─────────────────────────────────────────────────────────────

const BESPOKE_ICON_NAMES = [
  'aged-care', 'audio', 'campfire', 'children', 'collection', 'community-only', 'community',
  'crisis', 'culture', 'determined', 'digital', 'disability', 'economic', 'education',
  'family', 'governance', 'grateful', 'health', 'hopeful', 'housing', 'inspiring',
  'justice', 'knowledge', 'land', 'mental-health', 'ocean', 'person', 'photo',
  'positive', 'proud', 'public', 'quote', 'reflective', 'restricted', 'search',
  'sport', 'story', 'timeline', 'traditional-knowledge', 'video', 'vision', 'youth',
] as const

const BESPOKE_ICONS: DesignElement[] = BESPOKE_ICON_NAMES.map((name) => ({
  slug: `bespoke-icon-${name}`,
  name: name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  category: 'bespoke-icon',
  previewType: 'image',
  previewSrc: `/icons/bespoke/${name}.png`,
  variantSrc: `/icons/bespoke-white/${name}.png`,
  source: `public/icons/bespoke/${name}.png`,
  description: `Bespoke "${name}" icon — black on transparent + white variant.`,
  implementations: ['pdf', 'web'],
}))

// ─────────────────────────────────────────────────────────────
// 5. Museum elements (12) — the curatorial grammar.
//    Mirrored across PDF (lib/pdf/components/elements/) and
//    Web (components/annual-report/2024-25/almanac/elements.tsx).
//    Source of truth: PICC-2024-25-CURATORIAL-GRAMMAR.md
// ─────────────────────────────────────────────────────────────

const MUSEUM_ELEMENTS: DesignElement[] = [
  { slug: 'museum-cartouche',    name: '01 · Cartouche',     category: 'museum-element', previewType: 'component-stub', previewSrc: 'Section opener / wall plaque',                       source: 'lib/pdf/components/elements/Cartouche.tsx',    description: 'Section opener / wall plaque — full A4 / hero band.', implementations: ['pdf', 'web'] },
  { slug: 'museum-reliquary',    name: '02 · Reliquary',     category: 'museum-element', previewType: 'component-stub', previewSrc: 'One sacred number per anchor story',                source: 'lib/pdf/components/elements/Reliquary.tsx',    description: 'Single sacred number per anchor story.', implementations: ['pdf', 'web'] },
  { slug: 'museum-songline',     name: '03 · Songline',      category: 'museum-element', previewType: 'component-stub', previewSrc: 'Full-spread horizontal narrative band (RARE)',      source: 'lib/pdf/components/elements/Songline.tsx',     description: 'Full-spread horizontal narrative band — used sparingly.', implementations: ['pdf'] },
  { slug: 'museum-lantern',      name: '04 · Lantern',       category: 'museum-element', previewType: 'component-stub', previewSrc: 'Elder voice quote (sacred, refuses section colour)', source: 'lib/pdf/components/elements/Lantern.tsx',      description: 'Elder voice quote — sacred, refuses section colour.', implementations: ['pdf', 'web'] },
  { slug: 'museum-hearth',       name: '05 · Hearth',        category: 'museum-element', previewType: 'component-stub', previewSrc: 'Community voice with photo',                        source: 'lib/pdf/components/elements/Hearth.tsx',       description: 'Community voice with photo.', implementations: ['pdf', 'web'] },
  { slug: 'museum-horizon',      name: '06 · Horizon',       category: 'museum-element', previewType: 'component-stub', previewSrc: 'Forward-looking vision quote',                      source: 'lib/pdf/components/elements/Horizon.tsx',      description: 'Forward-looking vision quote.', implementations: ['pdf', 'web'] },
  { slug: 'museum-atlas',        name: '07 · Atlas',         category: 'museum-element', previewType: 'component-stub', previewSrc: 'Services-around-island map',                        source: 'lib/pdf/components/elements/Atlas.tsx',        description: 'Services-around-island map (PDF only currently).', implementations: ['pdf'] },
  { slug: 'museum-specimen',     name: '08 · Specimen',      category: 'museum-element', previewType: 'component-stub', previewSrc: 'Before/after comparative panel',                    source: 'lib/pdf/components/elements/Specimen.tsx',     description: 'Before/after comparative panel.', implementations: ['pdf'] },
  { slug: 'museum-kuling-field', name: '09 · KulingField',   category: 'museum-element', previewType: 'component-stub', previewSrc: 'Constellation of small stats',                      source: 'lib/pdf/components/elements/KulingField.tsx',  description: 'Constellation of small stats — kuling = many stars.', implementations: ['pdf'] },
  { slug: 'museum-vitrine',      name: '10 · Vitrine',       category: 'museum-element', previewType: 'component-stub', previewSrc: 'Display case for one fact (also Triptych)',         source: 'lib/pdf/components/elements/Vitrine.tsx',      description: 'Display case for one fact — also a 3-up Triptych variant.', implementations: ['pdf', 'web'] },
  { slug: 'museum-fold',         name: '11 · Fold',          category: 'museum-element', previewType: 'component-stub', previewSrc: 'Photo plate — consented, named (also Pair)',         source: 'lib/pdf/components/elements/Fold.tsx',         description: 'Photo plate — consented, named. Also a 2-up Pair variant.', implementations: ['pdf', 'web'] },
  { slug: 'museum-margin-note',  name: '12 · MarginNote',    category: 'museum-element', previewType: 'component-stub', previewSrc: "Curator's whisper",                                 source: 'lib/pdf/components/elements/MarginNote.tsx',   description: 'Curator\'s whisper — small annotation in margin.', implementations: ['pdf', 'web'] },
]

// ─────────────────────────────────────────────────────────────
// 6. Report components (7) — higher-order composed components
//    that already work in the existing 2024-25 page.
// ─────────────────────────────────────────────────────────────

const REPORT_COMPONENTS: DesignElement[] = [
  { slug: 'report-acknowledgment-banner', name: 'Acknowledgment Banner',   category: 'report-component', previewType: 'component-stub', previewSrc: 'Country acknowledgment band',                source: 'components/annual-report/2024-25/AcknowledgmentBanner.tsx', description: 'Country acknowledgment banner.', implementations: ['web'] },
  { slug: 'report-board-grid',            name: 'Board Grid',              category: 'report-component', previewType: 'component-stub', previewSrc: 'Director portraits + roles grid',            source: 'components/annual-report/2024-25/BoardGrid.tsx',            description: 'Director portraits with names and roles.', implementations: ['web'] },
  { slug: 'report-elder-portrait-section',name: 'Elder Portrait Section',  category: 'report-component', previewType: 'component-stub', previewSrc: 'Featured elder + grid of 5',                 source: 'components/annual-report/2024-25/ElderPortraitSection.tsx', description: 'One featured elder + grid of 5 with portrait + quote.', implementations: ['web'] },
  { slug: 'report-fullscreen-video',      name: 'Full-Screen Video Break', category: 'report-component', previewType: 'component-stub', previewSrc: 'Edge-to-edge video interstitial',            source: 'components/annual-report/2024-25/FullScreenVideoBreak.tsx', description: 'Edge-to-edge video interstitial between sections.', implementations: ['web'] },
  { slug: 'report-innovation-showcase',   name: 'Innovation Showcase',     category: 'report-component', previewType: 'component-stub', previewSrc: 'Innovation projects highlight',              source: 'components/annual-report/2024-25/InnovationShowcase.tsx',   description: 'Innovation projects highlight section.', implementations: ['web'] },
  { slug: 'report-service-card-grid',     name: 'Service Card Grid',       category: 'report-component', previewType: 'component-stub', previewSrc: 'Service tiles grouped by category',          source: 'components/annual-report/2024-25/ServiceCardGrid.tsx',      description: 'Service tiles grouped by category with icon + description.', implementations: ['web'] },
  { slug: 'report-share-voice-cta',       name: 'Share Your Voice CTA',    category: 'report-component', previewType: 'component-stub', previewSrc: 'Community story submission CTA',             source: 'components/annual-report/2024-25/ShareVoiceCTA.tsx',        description: 'Community story submission call-to-action.', implementations: ['web'] },
]

// ─────────────────────────────────────────────────────────────
// 7. Pencil components (19) — reusable components designed in
//    picc-annual-report.pen. Discovered via Pencil MCP. These
//    are visual designs that don't yet have a web/PDF code
//    implementation — voting decides which to port first.
// ─────────────────────────────────────────────────────────────

const PENCIL_COMPONENTS: DesignElement[] = [
  { slug: 'pencil-stat-card-teal',         name: 'Stat Card · Teal',           category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Stat card on teal fill (SG5HK)',          source: 'picc-annual-report.pen#SG5HK', description: 'Stat card variant — teal fill background.', implementations: ['concept'] },
  { slug: 'pencil-stat-card-cream',        name: 'Stat Card · Cream',          category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Stat card on cream fill (UbFHQ)',         source: 'picc-annual-report.pen#UbFHQ', description: 'Stat card variant — cream fill background.', implementations: ['concept'] },
  { slug: 'pencil-stat-card-navy',         name: 'Stat Card · Navy',           category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Stat card on navy fill (pLffj)',          source: 'picc-annual-report.pen#pLffj', description: 'Stat card variant — navy fill, light text.', implementations: ['concept'] },
  { slug: 'pencil-stat-card-outlined',     name: 'Stat Card · Outlined',       category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Stat card outline only (5cNZk)',          source: 'picc-annual-report.pen#5cNZk', description: 'Stat card variant — outlined, no fill.', implementations: ['concept'] },
  { slug: 'pencil-callout-teal-full',      name: 'Callout · Teal Full',        category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Callout block, full teal (Pj2lx)',         source: 'picc-annual-report.pen#Pj2lx', description: 'Callout block — full teal background.', implementations: ['concept'] },
  { slug: 'pencil-callout-navy-stat-icon', name: 'Callout · Navy Stat+Icon',   category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Callout with stat + icon, navy (bYqsg)',  source: 'picc-annual-report.pen#bYqsg', description: 'Callout combining stat + icon on navy.', implementations: ['concept'] },
  { slug: 'pencil-callout-cream-highlight',name: 'Callout · Cream Highlight',  category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Callout with cream highlight (nWggS)',     source: 'picc-annual-report.pen#nWggS', description: 'Callout with cream highlight tone.', implementations: ['concept'] },
  { slug: 'pencil-quote-white-shadow',     name: 'Quote Card · White Shadow',  category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Quote card, white shadow (qOFmV)',         source: 'picc-annual-report.pen#qOFmV', description: 'Quote card — white with soft shadow.', implementations: ['concept'] },
  { slug: 'pencil-quote-navy',             name: 'Quote Card · Navy',          category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Quote card on navy (hgTaC)',              source: 'picc-annual-report.pen#hgTaC', description: 'Quote card — navy, light text.', implementations: ['concept'] },
  { slug: 'pencil-quote-photo-quote',      name: 'Quote Card · Photo + Quote', category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Photo paired with quote (K97U3)',         source: 'picc-annual-report.pen#K97U3', description: 'Quote card combining a portrait + quote.', implementations: ['concept'] },
  { slug: 'pencil-photo-fullbleed',        name: 'Photo · Full Bleed + Caption', category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Full-bleed photo with caption (pNUhJ)', source: 'picc-annual-report.pen#pNUhJ', description: 'Full-bleed photo with named caption.', implementations: ['concept'] },
  { slug: 'pencil-photo-grid-2x2',         name: 'Photo · Grid 2×2',           category: 'pencil-component', previewType: 'component-stub', previewSrc: '4-photo 2×2 grid (gcYNm)',                source: 'picc-annual-report.pen#gcYNm', description: 'Four-photo 2×2 grid layout.', implementations: ['concept'] },
  { slug: 'pencil-photo-hero-2-stack',     name: 'Photo · Hero + 2 Stack',     category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Hero photo + 2 stacked (TXyZi)',          source: 'picc-annual-report.pen#TXyZi', description: 'Hero photo with 2 supporting stacked.', implementations: ['concept'] },
  { slug: 'pencil-service-icon-left',      name: 'Service Card · Icon Left',   category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Service card, icon-left (2Z32W)',         source: 'picc-annual-report.pen#2Z32W', description: 'Service card with icon on the left.', implementations: ['concept'] },
  { slug: 'pencil-service-compact',        name: 'Service Card · Compact',     category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Compact service card (cEcLg)',            source: 'picc-annual-report.pen#cEcLg', description: 'Compact service card variant.', implementations: ['concept'] },
  { slug: 'pencil-service-dark',           name: 'Service Card · Dark',        category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Dark-mode service card (GISc0)',          source: 'picc-annual-report.pen#GISc0', description: 'Dark-mode service card variant.', implementations: ['concept'] },
  { slug: 'pencil-progress-horizontal',    name: 'Progress Bar · Horizontal',  category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Horizontal progress bar (NwC2Q)',         source: 'picc-annual-report.pen#NwC2Q', description: 'Horizontal progress bar.', implementations: ['concept'] },
  { slug: 'pencil-donut-chart',            name: 'Donut Chart · Placeholder',  category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Donut chart placeholder (EDmsS)',         source: 'picc-annual-report.pen#EDmsS', description: 'Donut chart placeholder for percentage breakdowns.', implementations: ['concept'] },
  { slug: 'pencil-data-table-compact',     name: 'Data Table · Compact',       category: 'pencil-component', previewType: 'component-stub', previewSrc: 'Compact data table (Ol6oB)',              source: 'picc-annual-report.pen#Ol6oB', description: 'Compact data table for financials/breakdowns.', implementations: ['concept'] },
]

// ─────────────────────────────────────────────────────────────
// Public registry
// ─────────────────────────────────────────────────────────────

export const ELEMENTS: DesignElement[] = [
  ...INFOGRAPHICS,
  ...MOTIFS,
  ...SECTION_ICONS,
  ...BESPOKE_ICONS,
  ...MUSEUM_ELEMENTS,
  ...REPORT_COMPONENTS,
  ...PENCIL_COMPONENTS,
]

export const CATEGORIES: { value: ElementCategory; label: string; count: number }[] = [
  { value: 'infographic',      label: 'Infographic concepts', count: INFOGRAPHICS.length },
  { value: 'motif',            label: 'Brand motifs',         count: MOTIFS.length },
  { value: 'section-icon',     label: 'Section icons',        count: SECTION_ICONS.length },
  { value: 'bespoke-icon',     label: 'Bespoke icons',        count: BESPOKE_ICONS.length },
  { value: 'museum-element',   label: 'Museum elements',      count: MUSEUM_ELEMENTS.length },
  { value: 'report-component', label: 'Report components',    count: REPORT_COMPONENTS.length },
  { value: 'pencil-component', label: 'Pencil components',    count: PENCIL_COMPONENTS.length },
]

export function getElementBySlug(slug: string): DesignElement | undefined {
  return ELEMENTS.find((e) => e.slug === slug)
}
