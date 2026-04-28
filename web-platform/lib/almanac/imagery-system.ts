/**
 * PICC Almanac — imagery system.
 *
 * Single declarative source of truth for which photo / video lands
 * in which slot of the digital almanac. Mirrors the section flow of
 * the report: Cover → Acknowledgement → Year in Numbers → Anchor
 * stories → Voices → Services → Financials → Forward → Back Cover.
 *
 * Three tag categories on every slot:
 *   1. PURPOSE — what the slot does in the page (hero, decorative,
 *      portrait, gallery, divider)
 *   2. SECTION — which almanac section it lives in
 *   3. SOURCE — where the asset comes from (EL v2 slot, PICC photo
 *      library, video clip, infographic concept)
 *
 * Add a new slot here → the almanac page picker can resolve it.
 * Tag a new photo upstream → it auto-lands in the matching slot.
 */

import { assetUrl } from '@/lib/media/asset-url'

// ─────────────────────────────────────────────────────────────────────
// Tag taxonomy
// ─────────────────────────────────────────────────────────────────────

export type Purpose =
  | 'hero'         // Edge-to-edge cover for a major section
  | 'decorative'   // Background / atmospheric
  | 'portrait'     // Single named person, sized for face
  | 'gallery'      // One of many in a grid / strip
  | 'divider'      // Section break visual
  | 'feature'      // Mid-page hero photo for an anchor story
  | 'icon-tile'    // Service/program card thumbnail

export type AlmanacSection =
  | 'cover'
  | 'acknowledgement'
  | 'leadership'
  | 'numbers'
  | 'highlights'
  | 'voices'
  | 'services'
  | 'governance'
  | 'financials'
  | 'journey'
  | 'forward'
  | 'back-cover'

export type SourceKind =
  | 'el-v2'        // Empathy Ledger v2 photo (consent-cleared, slot-tagged)
  | 'picc-photo'   // Locally migrated PICC photo library (picc-photos/)
  | 'video-clip'   // Curated video clip (hero-assets/clips/ or EL v2)
  | 'video-tag'    // VIDEO_TAGS_2025 keyed video
  | 'infographic'  // Concept render PNG (icons/picc/infographics/)
  | 'motif'        // Brand motif PNG (icons/picc/motifs/)

// ─────────────────────────────────────────────────────────────────────
// Slot definitions — every imagery slot in the almanac
// ─────────────────────────────────────────────────────────────────────

export interface ImagerySlot {
  /** Stable ID — used by the page picker */
  id: string
  /** Human label */
  label: string
  /** What this slot does on the page */
  purpose: Purpose
  /** Section it belongs to */
  section: AlmanacSection
  /** Where it sources its asset */
  source: SourceKind
  /** Resolver — returns a public URL or null if no asset is available */
  resolve?: () => string | null
  /** EL v2 slot key when source === 'el-v2' */
  elV2Slot?: string
  /** Direct asset path when source is local (picc-photo, video-clip, etc.) */
  path?: string
  /** Tag(s) for searchability */
  tags?: string[]
  /** Notes for whoever curates this slot next */
  notes?: string
}

export const IMAGERY_SLOTS: ImagerySlot[] = [
  // ── COVER ────────────────────────────────────────────────────────
  {
    id: 'cover-video',
    label: 'Cover · video hero',
    purpose: 'hero',
    section: 'cover',
    source: 'video-clip',
    path: '/hero-assets/clips/kids-beach.mp4',
    tags: ['cover', 'video', 'children', 'beach'],
    notes: 'Looping video. Falls back to coverPhoto on slow connections.',
  },
  {
    id: 'cover-still',
    label: 'Cover · still fallback',
    purpose: 'hero',
    section: 'cover',
    source: 'picc-photo',
    path: '/picc-photos/cover-youth-beach.jpg',
    tags: ['cover', 'children', 'beach'],
  },

  // ── ACKNOWLEDGEMENT ──────────────────────────────────────────────
  {
    id: 'acknowledgement-painted',
    label: 'Acknowledgement · painted island/horizon',
    purpose: 'hero',
    section: 'acknowledgement',
    source: 'infographic',
    path: '/icons/picc/infographics/06-stat-hero-horizon.png',
    tags: ['acknowledgement', 'country', 'painted'],
    notes: 'Hero uses sky region for body text; painted island anchors foot.',
  },
  {
    id: 'acknowledgement-video',
    label: 'Acknowledgement · video bwgcolman',
    purpose: 'divider',
    section: 'acknowledgement',
    source: 'video-tag',
    path: 'acknowledgement', // VIDEO_TAGS_2025 key
    tags: ['acknowledgement', 'country', 'video'],
  },

  // ── LEADERSHIP / MESSAGES ────────────────────────────────────────
  {
    id: 'ceo-portrait',
    label: 'CEO portrait — Rachel Atkinson',
    purpose: 'portrait',
    section: 'leadership',
    source: 'picc-photo',
    path: '/picc-photos/rachel-atkinson.jpg',
    tags: ['leadership', 'ceo', 'portrait', 'rachel-atkinson'],
  },
  {
    id: 'chair-portrait',
    label: 'Chair portrait — Luella Bligh',
    purpose: 'portrait',
    section: 'leadership',
    source: 'picc-photo',
    path: '/picc-photos/luella-bligh.jpg',
    tags: ['leadership', 'chair', 'portrait', 'luella-bligh'],
  },

  // ── YEAR IN NUMBERS ──────────────────────────────────────────────
  {
    id: 'numbers-divider',
    label: 'Year in Numbers · video transition',
    purpose: 'divider',
    section: 'numbers',
    source: 'video-tag',
    path: 'children-families',
    tags: ['numbers', 'video', 'transition'],
  },

  // ── HIGHLIGHTS / ANCHOR STORIES ──────────────────────────────────
  {
    id: 'feature-bwgcolman-1',
    label: 'Feature · Bwgcolman Way · daycare opening',
    purpose: 'feature',
    section: 'highlights',
    source: 'picc-photo',
    path: '/picc-photos/feature-bwgcolman-healing/01.jpg',
    tags: ['highlights', 'bwgcolman-way', 'daycare', 'feature'],
  },
  {
    id: 'feature-1000-days-1',
    label: 'Feature · First 1,000 Days · three generations',
    purpose: 'feature',
    section: 'highlights',
    source: 'picc-photo',
    path: '/picc-photos/feature-first-1000-days/01.jpg',
    tags: ['highlights', 'first-1000-days', 'family', 'feature'],
  },

  // ── VOICES ──────────────────────────────────────────────────────
  {
    id: 'voices-elders-on-country',
    label: 'Voices · Elders on Country gallery',
    purpose: 'gallery',
    section: 'voices',
    source: 'el-v2',
    elV2Slot: 'elders-on-country',
    tags: ['voices', 'elders', 'on-country', 'gallery'],
    notes: '15 photos in EL v2 slot. Use as photo strip / mosaic.',
  },
  {
    id: 'voices-wall',
    label: 'Voices · voices wall portraits',
    purpose: 'portrait',
    section: 'voices',
    source: 'el-v2',
    elV2Slot: 'voices-wall',
    tags: ['voices', 'portrait', 'community'],
    notes: '30 photos in EL v2 slot. Use as named-portrait grid.',
  },
  {
    id: 'voices-portraits',
    label: 'Voices · named PICC portraits',
    purpose: 'portrait',
    section: 'voices',
    source: 'picc-photo',
    path: '/picc-photos/voices/',
    tags: ['voices', 'portrait', 'named'],
    notes: '17 named portraits in picc-photos/voices/.',
  },

  // ── SERVICES ────────────────────────────────────────────────────
  {
    id: 'services-around-island',
    label: 'Services · around-island infographic',
    purpose: 'hero',
    section: 'services',
    source: 'infographic',
    path: '/icons/picc/infographics/08-services-around-island.png',
    tags: ['services', 'island', 'infographic'],
    notes: 'Decorative anchor. Real services data drives the dot clusters.',
  },

  // ── GOVERNANCE ───────────────────────────────────────────────────
  {
    id: 'board-portraits',
    label: 'Board · director portraits',
    purpose: 'portrait',
    section: 'governance',
    source: 'picc-photo',
    path: '/picc-photos/board/',
    tags: ['governance', 'board', 'portrait'],
    notes: 'rhonda-phillips, harriet-hulthen, matthew-lindsay (3 jpgs).',
  },

  // ── FINANCIALS ──────────────────────────────────────────────────
  {
    id: 'reef-layers-decor',
    label: 'Financials · painted reef layers',
    purpose: 'decorative',
    section: 'financials',
    source: 'infographic',
    path: '/icons/picc/infographics/03-reef-layers.png',
    tags: ['financials', 'decorative', 'infographic'],
    notes: 'Painted strata as section header decoration above stacked bars.',
  },

  // ── JOURNEY ─────────────────────────────────────────────────────
  {
    id: 'river-timeline',
    label: 'Journey · river timeline divider',
    purpose: 'divider',
    section: 'journey',
    source: 'infographic',
    path: '/icons/picc/infographics/02-river-timeline.png',
    tags: ['journey', 'timeline', 'divider', 'infographic'],
  },

  // ── FORWARD COMMITMENTS ─────────────────────────────────────────
  {
    id: 'forward-video',
    label: 'Forward · video transition',
    purpose: 'divider',
    section: 'forward',
    source: 'video-tag',
    path: 'forward-commitments',
    tags: ['forward', 'video', 'transition'],
  },

  // ── BACK COVER ──────────────────────────────────────────────────
  {
    id: 'back-cover-still',
    label: 'Back cover · CEO quote backdrop',
    purpose: 'hero',
    section: 'back-cover',
    source: 'picc-photo',
    path: '/picc-photos/cover-kirrily-2024.jpg',
    tags: ['back-cover', 'ceo', 'closing'],
  },
]

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

/** Find a slot by ID. */
export function getSlot(id: string): ImagerySlot | undefined {
  return IMAGERY_SLOTS.find((s) => s.id === id)
}

/** All slots that belong to a section, ordered by their array order. */
export function getSlotsForSection(section: AlmanacSection): ImagerySlot[] {
  return IMAGERY_SLOTS.filter((s) => s.section === section)
}

/** All slots filtered by purpose. */
export function getSlotsByPurpose(purpose: Purpose): ImagerySlot[] {
  return IMAGERY_SLOTS.filter((s) => s.purpose === purpose)
}

/**
 * Resolve a slot to a public URL. Synchronous for local sources;
 * EL v2 slots need a separate async fetch via lib/media/el-photos.
 */
export function resolveLocalSlot(slot: ImagerySlot): string | null {
  if (slot.path && slot.source !== 'video-tag' && slot.source !== 'el-v2') {
    return assetUrl(slot.path)
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────
// Tag-based search
// ─────────────────────────────────────────────────────────────────────

/** Find slots that match all given tags (AND search). */
export function findSlotsByTags(...tags: string[]): ImagerySlot[] {
  return IMAGERY_SLOTS.filter((slot) =>
    tags.every((t) => slot.tags?.includes(t)),
  )
}

/** Distinct tag list across all slots. */
export function allTags(): string[] {
  const set = new Set<string>()
  for (const slot of IMAGERY_SLOTS) {
    slot.tags?.forEach((t) => set.add(t))
  }
  return Array.from(set).sort()
}
