/**
 * Illustrative service positions on the Palm Island map.
 *
 * PICC services are network-delivered across the island, not pinned to
 * specific lat/lng. These coords cluster services visually inside the
 * township region (south + south-east) where the work concentrates,
 * grouped loosely by category.
 *
 * Coords are 0-1 normalized within the PALM_ISLAND_VIEWBOX (1000x723).
 * - x: 0 = west edge, 1 = east edge
 * - y: 0 = north (top), 1 = south (bottom)
 *
 * Township area is roughly x=0.5–0.7, y=0.7–0.85 in this projection.
 */

export interface ServiceCoord {
  /** Service id from SERVICES_2025 in data-2025.ts */
  id: string
  map_x: number
  map_y: number
}

export const PICC_SERVICE_COORDS: ServiceCoord[] = [
  // ── Children & Families (7) ── township + surrounding
  { id: 'svc-bwg-way',     map_x: 0.62, map_y: 0.74 },
  { id: 'svc-cfc',         map_x: 0.58, map_y: 0.78 },
  { id: 'svc-1000d',       map_x: 0.55, map_y: 0.80 },
  { id: 'svc-fc',          map_x: 0.66, map_y: 0.76 },
  { id: 'svc-fpp',         map_x: 0.60, map_y: 0.81 },
  { id: 'svc-fwc',         map_x: 0.64, map_y: 0.80 },
  { id: 'svc-safe-house',  map_x: 0.68, map_y: 0.78 },

  // ── Health & Wellbeing (5) ── Bwgcolman Healing campus + outreach
  { id: 'svc-bhs',         map_x: 0.52, map_y: 0.82 },
  { id: 'svc-mh',          map_x: 0.50, map_y: 0.84 },
  { id: 'svc-aged',        map_x: 0.48, map_y: 0.78 },
  { id: 'svc-disability',  map_x: 0.46, map_y: 0.83 },
  { id: 'svc-ndis',        map_x: 0.42, map_y: 0.80 },

  // ── Justice & Safety (3) ── community justice cluster
  { id: 'svc-cjg',         map_x: 0.54, map_y: 0.62 },
  { id: 'svc-blue-card',   map_x: 0.58, map_y: 0.66 },
  { id: 'svc-diversion',   map_x: 0.50, map_y: 0.68 },

  // ── Youth (2) ── central + outreach
  { id: 'svc-youth',       map_x: 0.50, map_y: 0.55 },
  { id: 'svc-safe-haven',  map_x: 0.45, map_y: 0.58 },

  // ── Economic (3) ── DSC + enterprise
  { id: 'svc-dsc',         map_x: 0.70, map_y: 0.71 },
  { id: 'svc-enterprise',  map_x: 0.72, map_y: 0.75 },
  { id: 'svc-workforce',   map_x: 0.68, map_y: 0.69 },

  // ── Education & Community (4) ──
  { id: 'svc-knowledge',   map_x: 0.40, map_y: 0.72 },
  { id: 'svc-community',   map_x: 0.36, map_y: 0.76 },
  { id: 'svc-cultural',    map_x: 0.34, map_y: 0.74 },
  { id: 'svc-pathways',    map_x: 0.38, map_y: 0.70 },
]

const COORD_BY_ID = new Map(PICC_SERVICE_COORDS.map((c) => [c.id, c]))

export function getServiceCoord(id: string): { map_x: number; map_y: number } | undefined {
  const c = COORD_BY_ID.get(id)
  return c ? { map_x: c.map_x, map_y: c.map_y } : undefined
}
