/**
 * Every image-fill node in the v2 SPREAD frames of picc-annual-report.pen.
 *
 * The bridge / library "Push to Pencil" feature uses this map to know
 * what node IDs to target with image fills. Discovered via batch_get
 * inspection 2026-05-12.
 *
 * Each entry:
 *   nodeId   — the frame/rectangle that takes the image fill
 *   spreadId — its parent SPREAD frame
 *   label    — human description so the UI can show meaningful options
 *   role     — "hero" | "portrait" | "secondary" — for default photo suggestions
 */

export interface ImageTarget {
  nodeId: string
  spreadId: string
  label: string
  role: 'hero' | 'portrait' | 'secondary' | 'background'
  /** Optional EL slot whose photo is the canonical pick for this target */
  defaultSlot?: string
}

export const IMAGE_TARGETS: ImageTarget[] = [
  // Cover (pQZZX)
  { nodeId: 'idW5e', spreadId: 'pQZZX', label: 'Cover · full-bleed hero', role: 'hero', defaultSlot: 'cover' },

  // Acknowledgement (WIyhs)
  { nodeId: 'kKSkJ', spreadId: 'WIyhs', label: 'Acknowledgement · Country horizon', role: 'hero', defaultSlot: 'acknowledgement' },

  // CEO Message (PQPPx)
  { nodeId: 'emo5S', spreadId: 'PQPPx', label: 'CEO portrait · Rachel Atkinson', role: 'portrait' },

  // Chair Message (1cNee)
  { nodeId: 'uxQu4', spreadId: '1cNee', label: 'Chair portrait · Luella Bligh', role: 'portrait' },

  // Featured Service · Bwgcolman Healing (HRveX)
  { nodeId: '9Xl34', spreadId: 'HRveX', label: 'Bwgcolman Healing · hero photo', role: 'hero', defaultSlot: 'service-bhs' },

  // Featured Service · First 1,000 Days (ht6rD)
  { nodeId: 'EmpDC', spreadId: 'ht6rD', label: 'First 1,000 Days · hero photo', role: 'hero' },

  // Featured Service · BEAI (CcAqN)
  { nodeId: 'HJt2F', spreadId: 'CcAqN', label: 'BEAI · apprentice in workshop', role: 'hero' },

  // Elders On Country — photo essay (bpXvp)
  { nodeId: 'cjgKv', spreadId: 'bpXvp', label: 'Elders on Country · full-bleed hero', role: 'hero', defaultSlot: 'elders-on-country' },

  // Elders On Country — RIGHT PAGE (AO7ma)
  { nodeId: 'HRIYW', spreadId: 'AO7ma', label: 'Elders on Country · grid 1 (top-left)', role: 'secondary', defaultSlot: 'elders-on-country' },
  { nodeId: '1GR2y', spreadId: 'AO7ma', label: 'Elders on Country · grid 2 (top-right)', role: 'secondary', defaultSlot: 'elders-on-country' },
  { nodeId: 'zmiMI', spreadId: 'AO7ma', label: 'Elders on Country · grid 3 (bottom-left)', role: 'secondary', defaultSlot: 'elders-on-country' },
  { nodeId: 'fOVAV', spreadId: 'AO7ma', label: 'Elders on Country · grid 4 (bottom-right)', role: 'secondary', defaultSlot: 'elders-on-country' },

  // Governance — Board (oTtjL) — 6 portraits
  { nodeId: '3NAoG', spreadId: 'oTtjL', label: 'Governance · Luella Bligh (Chair)', role: 'portrait' },
  { nodeId: '1dLtm', spreadId: 'oTtjL', label: 'Governance · Raymond W. Palmer Snr', role: 'portrait' },
  { nodeId: '0UJyn', spreadId: 'oTtjL', label: 'Governance · Allan Palm Island', role: 'portrait' },
  { nodeId: 'uuBK9', spreadId: 'oTtjL', label: 'Governance · Cassie Lang', role: 'portrait' },
  { nodeId: 'kOTew', spreadId: 'oTtjL', label: 'Governance · Matthew Lindsay', role: 'portrait' },
  { nodeId: 'ppoUy', spreadId: 'oTtjL', label: 'Governance · Harriet Hulthen', role: 'portrait' },

  // Community Voices — Double Page (zBumS) — 16 portraits
  { nodeId: 'Gz3rT', spreadId: 'zBumS', label: 'Voices · Aunty Ethel Robertson', role: 'portrait' },
  { nodeId: 'S8FhR', spreadId: 'zBumS', label: 'Voices · Winifred Obah', role: 'portrait' },
  { nodeId: 'csHi8', spreadId: 'zBumS', label: 'Voices · Cyndel Louise Pryor', role: 'portrait' },
  { nodeId: 'HO7jN', spreadId: 'zBumS', label: 'Voices · Marjoyie Burns', role: 'portrait' },
  { nodeId: '46Wms', spreadId: 'zBumS', label: 'Voices · Elsa Mortoa', role: 'portrait' },
  { nodeId: 'k0BPY', spreadId: 'zBumS', label: 'Voices · Gurtrude Grace Richardson', role: 'portrait' },
  { nodeId: 'IxVeo', spreadId: 'zBumS', label: 'Voices · Raymond W. Palmer Snr', role: 'portrait' },
  { nodeId: 'te3c7', spreadId: 'zBumS', label: 'Voices · Aunty Iris May Whitey', role: 'portrait' },
  { nodeId: 'ewUP5', spreadId: 'zBumS', label: 'Voices · Allan Palm Island', role: 'portrait' },
  { nodeId: '10kHH', spreadId: 'zBumS', label: 'Voices · Uncle Frank Daniel Landers', role: 'portrait' },
  { nodeId: 'Ua1vk', spreadId: 'zBumS', label: 'Voices · Rachel Atkinson', role: 'portrait' },
  { nodeId: 'TlP9D', spreadId: 'zBumS', label: 'Voices · Luella Bligh', role: 'portrait' },
  { nodeId: '3Ru9s', spreadId: 'zBumS', label: 'Voices · Henry Doyle', role: 'portrait' },
  { nodeId: 'GDfmD', spreadId: 'zBumS', label: 'Voices · Jess Smit', role: 'portrait' },
  { nodeId: 'GyYAD', spreadId: 'zBumS', label: 'Voices · Natalie Friday', role: 'portrait' },
  { nodeId: 'RUuon', spreadId: 'zBumS', label: 'Voices · Cassie Lang', role: 'portrait' },

  // Back Cover (vZQsM)
  { nodeId: 'GLMK2', spreadId: 'vZQsM', label: 'Back Cover · constellation motif', role: 'background' },
]

export const IMAGE_TARGETS_BY_NODE = Object.fromEntries(
  IMAGE_TARGETS.map((t) => [t.nodeId, t]),
) as Record<string, ImageTarget>

export const IMAGE_TARGETS_BY_SPREAD: Record<string, ImageTarget[]> = IMAGE_TARGETS.reduce(
  (acc, t) => {
    const arr = acc[t.spreadId] ?? []
    arr.push(t)
    acc[t.spreadId] = arr
    return acc
  },
  {} as Record<string, ImageTarget[]>,
)
