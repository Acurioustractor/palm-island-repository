/**
 * Service positions on the Palm Island map.
 *
 * Most PICC services are network-delivered across the island rather
 * than pinned to a single lat/lng — these coords cluster services
 * visually around the township (south-east coast) where the work
 * concentrates, with breathing room so dots don't overlap.
 *
 * Coords are 0-1 normalized within the PALM_ISLAND_VIEWBOX (1000x723).
 *   x: 0 = west edge, 1 = east edge
 *   y: 0 = north (top), 1 = south (bottom)
 *
 * Township sits roughly at (0.62, 0.74) in this projection.
 * Airport is roughly central (0.55, 0.55).
 */

export interface ServiceCoord {
  id: string
  map_x: number
  map_y: number
}

export const PICC_SERVICE_COORDS: ServiceCoord[] = [
  // ── Children & Families (7) ── township + south coast
  { id: 'bwg-way',     map_x: 0.58, map_y: 0.78 },
  { id: 'cfc',         map_x: 0.64, map_y: 0.78 },
  { id: '1000d',       map_x: 0.70, map_y: 0.78 },
  { id: 'fc',          map_x: 0.55, map_y: 0.85 },
  { id: 'fpp',         map_x: 0.61, map_y: 0.85 },
  { id: 'fwc',         map_x: 0.67, map_y: 0.85 },
  { id: 'safe-house',  map_x: 0.73, map_y: 0.83 },

  // ── Health & Wellbeing (5) ── BHS campus + SEWB / Ferdy's / WHS / Shelter
  { id: 'bhs',         map_x: 0.42, map_y: 0.78 },
  { id: 'sewb',        map_x: 0.46, map_y: 0.84 },
  { id: 'ferdys',      map_x: 0.38, map_y: 0.83 },
  { id: 'whs',         map_x: 0.34, map_y: 0.78 },
  { id: 'shelter',     map_x: 0.30, map_y: 0.83 },

  // ── Justice & Safety (3) ── community justice cluster (NW of town)
  { id: 'cjg',         map_x: 0.55, map_y: 0.66 },
  { id: 'dfv',         map_x: 0.61, map_y: 0.66 },
  { id: 'divers',      map_x: 0.49, map_y: 0.66 },

  // ── Youth (2) ── central, on Country
  { id: 'youth',       map_x: 0.55, map_y: 0.55 },
  { id: 'safe-haven',  map_x: 0.65, map_y: 0.55 },

  // ── Economic (3) ── east end, DSC + retail + logistics
  { id: 'dsc',         map_x: 0.84, map_y: 0.72 },
  { id: 'retail',      map_x: 0.80, map_y: 0.78 },
  { id: 'logistics',   map_x: 0.85, map_y: 0.84 },

  // ── Community (3) ── Hub + NDIS + Blue Card (W of town)
  { id: 'hub',         map_x: 0.46, map_y: 0.72 },
  { id: 'ndis',        map_x: 0.36, map_y: 0.72 },
  { id: 'blue-card',   map_x: 0.40, map_y: 0.66 },

  // ── Education (1) ── BEAI · cultural training, on Country (N)
  { id: 'beai',        map_x: 0.42, map_y: 0.42 },

  // ── Added 2026-04-29 with Narelle alignment ──
  { id: 'aged',            map_x: 0.30, map_y: 0.74 }, // health · SW
  { id: 'enterprises',     map_x: 0.78, map_y: 0.84 }, // economic · east
]

const COORD_BY_ID = new Map(PICC_SERVICE_COORDS.map((c) => [c.id, c]))

export function getServiceCoord(id: string): { map_x: number; map_y: number } | undefined {
  const c = COORD_BY_ID.get(id)
  return c ? { map_x: c.map_x, map_y: c.map_y } : undefined
}

// ─────────────────────────────────────────────────────────────────────
// Landmarks — orientation aids on the map (NOT services)
// ─────────────────────────────────────────────────────────────────────

export interface Landmark {
  /** Display label */
  label: string
  /** 0-1 normalized coords inside the SVG viewBox */
  map_x: number
  map_y: number
  /** Visual variant for the marker */
  kind: 'township' | 'airport' | 'point'
}

export const PALM_ISLAND_LANDMARKS: Landmark[] = [
  { label: 'Palm Island township', map_x: 0.62, map_y: 0.74, kind: 'township' },
  { label: 'Palm Island airport',  map_x: 0.55, map_y: 0.55, kind: 'airport' },
  { label: 'Eclipse Island',       map_x: 0.05, map_y: 0.78, kind: 'point' },
]
