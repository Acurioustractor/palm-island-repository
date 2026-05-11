/**
 * Maps almanac slot IDs → Pencil v2 SPREAD frame IDs in
 * `web-platform/picc-annual-report.pen`.
 *
 * Used by /picc/almanac/pencil-bridge so each photo slot displays the
 * exact Pencil frame it should be pasted into. Edit this when new
 * spreads land or slots get re-homed.
 */
export interface PencilFrame {
  /** Pencil node ID (visible in Pencil URL bar / batch_get) */
  nodeId: string
  /** Human label for the spread */
  label: string
  /** Order on the printed almanac (page number-ish) */
  order: number
}

/** Every v2 SPREAD frame in picc-annual-report.pen, in print order. */
export const PENCIL_SPREADS: PencilFrame[] = [
  { nodeId: 'pQZZX', label: 'Cover', order: 1 },
  { nodeId: 'UNmRP', label: 'Contents', order: 2 },
  { nodeId: 'WIyhs', label: 'Acknowledgement of Country', order: 3 },
  { nodeId: 'PQPPx', label: 'CEO Message — Rachel Atkinson', order: 4 },
  { nodeId: '1cNee', label: 'Chair Message — Luella Bligh', order: 5 },
  { nodeId: '0eq4I', label: 'Year 17 in Numbers — Constellation', order: 6 },
  { nodeId: 'JOvEu', label: 'Our Journey — River Timeline', order: 7 },
  { nodeId: 'kjUI7', label: 'Bwgcolman Way — Before/After', order: 8 },
  { nodeId: 'HRveX', label: 'Featured Service — Bwgcolman Healing', order: 9 },
  { nodeId: 'ht6rD', label: 'Featured Service — First 1,000 Days', order: 10 },
  { nodeId: 'CcAqN', label: 'Featured Service — BEAI', order: 11 },
  { nodeId: 'zBumS', label: 'Community Voices — Double Page', order: 12 },
  { nodeId: '0WnsQ', label: 'Services at a Glance — 30 services', order: 13 },
  { nodeId: 'cGaCV', label: 'Financial Summary — Saltwater Rings', order: 14 },
  { nodeId: 'oTtjL', label: 'Governance — Board', order: 15 },
  { nodeId: 'bpXvp', label: 'Elders On Country — photo essay', order: 16 },
  { nodeId: 'AO7ma', label: 'Elders On Country — RIGHT PAGE', order: 17 },
  { nodeId: 'fy7j6', label: 'Looking Forward — Reef Layers', order: 18 },
  { nodeId: 'EihyD', label: 'Risks', order: 19 },
  { nodeId: 'QPEH6', label: 'Compliance & Accreditation', order: 20 },
  { nodeId: 'IBRsF', label: 'Acknowledgements & Credits', order: 21 },
  { nodeId: 'vZQsM', label: 'Back Cover', order: 22 },
]

export const PENCIL_FRAME_BY_ID = Object.fromEntries(
  PENCIL_SPREADS.map((f) => [f.nodeId, f]),
) as Record<string, PencilFrame>

/**
 * Maps slot ID → Pencil frame ID(s). A slot can target one or more frames
 * (e.g. acknowledgement-painted shows up on both cover bleed + ack page).
 *
 * UPDATED 2026-05-12: now covers all 22 v2 SPREAD frames including the
 * three Featured Service spreads, both Elders On Country pages, the
 * Community Voices double page, and Governance.
 */
export const SLOT_TO_FRAMES: Record<string, string[]> = {
  // COVER
  'cover-video': ['pQZZX'],
  'cover-still': ['pQZZX'],

  // ACKNOWLEDGEMENT
  'acknowledgement-painted': ['WIyhs'],
  'acknowledgement-video': ['WIyhs'],

  // LEADERSHIP / MESSAGES
  'ceo-portrait': ['PQPPx'],
  'chair-portrait': ['1cNee'],

  // YEAR IN NUMBERS
  'numbers-divider': ['0eq4I'],

  // FEATURED SERVICES
  'feature-bwgcolman-1': ['HRveX'], // Featured Service — Bwgcolman Healing
  'feature-1000-days-1': ['ht6rD'], // Featured Service — First 1,000 Days

  // VOICES — Elders on Country has its own dedicated photo essay
  // spread (left page hero) + a 4-grid right page. Voices wall sits
  // beside services + community-voices double-page.
  'voices-elders-on-country': ['bpXvp', 'AO7ma'],
  'voices-wall': ['zBumS'],
  'voices-portraits': ['zBumS', 'oTtjL'], // Both community voices + board

  // SERVICES
  'services-around-island': ['0WnsQ'],

  // BOARD
  'board-portraits': ['oTtjL'],

  // FINANCIALS
  'reef-layers-decor': ['cGaCV'],

  // JOURNEY
  'river-timeline': ['JOvEu'],

  // FORWARD
  'forward-video': ['fy7j6'],

  // BACK COVER
  'back-cover-still': ['vZQsM'],
}

export function framesForSlot(slotId: string): PencilFrame[] {
  const ids = SLOT_TO_FRAMES[slotId] ?? []
  return ids.map((id) => PENCIL_FRAME_BY_ID[id]).filter(Boolean)
}
