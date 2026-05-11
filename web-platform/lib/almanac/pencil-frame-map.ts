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
  { nodeId: 'WIyhs', label: 'Acknowledgement of Country', order: 2 },
  { nodeId: '0eq4I', label: 'Year 17 in Numbers — Constellation', order: 3 },
  { nodeId: 'kjUI7', label: 'Bwgcolman Way — Before/After', order: 4 },
  { nodeId: '0WnsQ', label: 'Services at a Glance — 30 services', order: 5 },
  { nodeId: 'JOvEu', label: 'Our Journey — River Timeline', order: 6 },
  { nodeId: 'cGaCV', label: 'Financial Summary — Saltwater Rings', order: 7 },
  { nodeId: 'fy7j6', label: 'Looking Forward — Reef Layers', order: 8 },
]

export const PENCIL_FRAME_BY_ID = Object.fromEntries(
  PENCIL_SPREADS.map((f) => [f.nodeId, f]),
) as Record<string, PencilFrame>

/**
 * Maps slot ID → Pencil frame ID. A slot can target one or more frames
 * (e.g. acknowledgement-painted shows up on both cover bleed + ack page).
 */
export const SLOT_TO_FRAMES: Record<string, string[]> = {
  // COVER
  'cover-video': ['pQZZX'],
  'cover-still': ['pQZZX'],

  // ACKNOWLEDGEMENT
  'acknowledgement-painted': ['WIyhs'],
  'acknowledgement-video': ['WIyhs'],

  // LEADERSHIP / MESSAGES — currently no dedicated v2 spread for portraits
  // (the messages page was folded into the cover's verso in v2). Leave
  // empty so the bridge UI shows them in the "unassigned" bucket.
  'ceo-portrait': [],
  'chair-portrait': [],

  // YEAR IN NUMBERS
  'numbers-divider': ['0eq4I'],

  // FEATURED SERVICES
  'feature-bwgcolman-1': ['kjUI7'],
  'feature-1000-days-1': [], // No v2 spread yet — flag as future

  // VOICES
  'voices-elders-on-country': ['JOvEu'], // Folded into journey timeline
  'voices-wall': ['0WnsQ'], // Voices wall sits beside services
  'voices-portraits': [],

  // SERVICES
  'services-around-island': ['0WnsQ'],

  // BOARD
  'board-portraits': [],

  // FINANCIALS
  'reef-layers-decor': ['cGaCV'],

  // JOURNEY
  'river-timeline': ['JOvEu'],

  // FORWARD
  'forward-video': ['fy7j6'],

  // BACK COVER
  'back-cover-still': [],
}

export function framesForSlot(slotId: string): PencilFrame[] {
  const ids = SLOT_TO_FRAMES[slotId] ?? []
  return ids.map((id) => PENCIL_FRAME_BY_ID[id]).filter(Boolean)
}
