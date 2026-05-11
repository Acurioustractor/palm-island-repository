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
  /** EL storyteller slug — when set, prefer that person's photo */
  storytellerSlug?: string
  /** EL service slug — when set, prefer photos from that service's gallery */
  serviceSlug?: string
}

export const IMAGE_TARGETS: ImageTarget[] = [
  // Cover (pQZZX)
  { nodeId: 'idW5e', spreadId: 'pQZZX', label: 'Cover · full-bleed hero', role: 'hero', defaultSlot: 'cover' },

  // Acknowledgement (WIyhs)
  { nodeId: 'kKSkJ', spreadId: 'WIyhs', label: 'Acknowledgement · Country horizon', role: 'hero', defaultSlot: 'acknowledgement' },

  // CEO Message (PQPPx) — Rachel Atkinson, EL slug confirmed
  { nodeId: 'emo5S', spreadId: 'PQPPx', label: 'CEO portrait · Rachel Atkinson', role: 'portrait', storytellerSlug: 'rachel-atkinson' },

  // Chair Message (1cNee) — Luella Bligh, EL slug confirmed
  { nodeId: 'uxQu4', spreadId: '1cNee', label: 'Chair portrait · Luella Bligh', role: 'portrait', storytellerSlug: 'luella-bligh' },

  // Featured Service · Bwgcolman Healing (HRveX) — service slug
  { nodeId: '9Xl34', spreadId: 'HRveX', label: 'Bwgcolman Healing · hero photo', role: 'hero', serviceSlug: 'bhs', defaultSlot: 'service-bhs' },

  // Featured Service · First 1,000 Days (ht6rD)
  { nodeId: 'EmpDC', spreadId: 'ht6rD', label: 'First 1,000 Days · hero photo', role: 'hero', serviceSlug: 'first-1000-days' },

  // Featured Service · BEAI (CcAqN)
  { nodeId: 'HJt2F', spreadId: 'CcAqN', label: 'BEAI · apprentice in workshop', role: 'hero', serviceSlug: 'beai' },

  // Elders On Country — photo essay (bpXvp)
  { nodeId: 'cjgKv', spreadId: 'bpXvp', label: 'Elders on Country · full-bleed hero', role: 'hero', defaultSlot: 'elders-on-country' },

  // Elders On Country — RIGHT PAGE (AO7ma)
  { nodeId: 'HRIYW', spreadId: 'AO7ma', label: 'Elders on Country · grid 1 (top-left)', role: 'secondary', defaultSlot: 'elders-on-country' },
  { nodeId: '1GR2y', spreadId: 'AO7ma', label: 'Elders on Country · grid 2 (top-right)', role: 'secondary', defaultSlot: 'elders-on-country' },
  { nodeId: 'zmiMI', spreadId: 'AO7ma', label: 'Elders on Country · grid 3 (bottom-left)', role: 'secondary', defaultSlot: 'elders-on-country' },
  { nodeId: 'fOVAV', spreadId: 'AO7ma', label: 'Elders on Country · grid 4 (bottom-right)', role: 'secondary', defaultSlot: 'elders-on-country' },

  // Governance — Board (oTtjL) — 6 portraits, all by storyteller slug
  { nodeId: '3NAoG', spreadId: 'oTtjL', label: 'Governance · Luella Bligh (Chair)', role: 'portrait', storytellerSlug: 'luella-bligh' },
  { nodeId: '1dLtm', spreadId: 'oTtjL', label: 'Governance · Raymond W. Palmer Snr', role: 'portrait', storytellerSlug: 'raymond-w-palmer-snr' },
  { nodeId: '0UJyn', spreadId: 'oTtjL', label: 'Governance · Allan Palm Island', role: 'portrait', storytellerSlug: 'allan-palm-island' },
  { nodeId: 'uuBK9', spreadId: 'oTtjL', label: 'Governance · Cassie Lang', role: 'portrait', storytellerSlug: 'cassie-lang' },
  { nodeId: 'kOTew', spreadId: 'oTtjL', label: 'Governance · Matthew Lindsay', role: 'portrait', storytellerSlug: 'matthew-lindsay' },
  { nodeId: 'ppoUy', spreadId: 'oTtjL', label: 'Governance · Harriet Hulthen', role: 'portrait', storytellerSlug: 'harriet-hulthen' },

  // Community Voices — Double Page (zBumS) — 16 portraits, ALL by storyteller slug
  // Slugs match EL display_name → kebab-case (verified 2026-05-12).
  // EL has "Aunty Ethel Taylor Robertson" — using that slug
  { nodeId: 'Gz3rT', spreadId: 'zBumS', label: 'Voices · Aunty Ethel Robertson', role: 'portrait', storytellerSlug: 'aunty-ethel-taylor-robertson' },
  { nodeId: 'S8FhR', spreadId: 'zBumS', label: 'Voices · Winifred Obah', role: 'portrait', storytellerSlug: 'winifred-obah' },
  { nodeId: 'csHi8', spreadId: 'zBumS', label: 'Voices · Cyndel Louise Pryor', role: 'portrait', storytellerSlug: 'cyndel-louise-pryor' },
  { nodeId: 'HO7jN', spreadId: 'zBumS', label: 'Voices · Marjoyie Burns', role: 'portrait', storytellerSlug: 'marjoyie-burns' },
  // EL has "Elsa Watson" — almanac copy uses Elsa Mortoa, mapping by closest match. Update if wrong.
  { nodeId: '46Wms', spreadId: 'zBumS', label: 'Voices · Elsa Mortoa', role: 'portrait', storytellerSlug: 'elsa-watson' },
  { nodeId: 'k0BPY', spreadId: 'zBumS', label: 'Voices · Gurtrude Grace Richardson', role: 'portrait', storytellerSlug: 'gurtrude-grace-richardson' },
  { nodeId: 'IxVeo', spreadId: 'zBumS', label: 'Voices · Raymond W. Palmer Snr', role: 'portrait', storytellerSlug: 'raymond-w-palmer-snr' },
  { nodeId: 'te3c7', spreadId: 'zBumS', label: 'Voices · Aunty Iris May Whitey', role: 'portrait', storytellerSlug: 'aunty-iris-may-whitey' },
  { nodeId: 'ewUP5', spreadId: 'zBumS', label: 'Voices · Allan Palm Island', role: 'portrait', storytellerSlug: 'allan-palm-island' },
  // "Uncle Frank Daniel Landers" — not in EL list, falls back to role
  { nodeId: '10kHH', spreadId: 'zBumS', label: 'Voices · Uncle Frank Daniel Landers', role: 'portrait', storytellerSlug: 'uncle-frank-daniel-landers' },
  { nodeId: 'Ua1vk', spreadId: 'zBumS', label: 'Voices · Rachel Atkinson', role: 'portrait', storytellerSlug: 'rachel-atkinson' },
  { nodeId: 'TlP9D', spreadId: 'zBumS', label: 'Voices · Luella Bligh', role: 'portrait', storytellerSlug: 'luella-bligh' },
  { nodeId: '3Ru9s', spreadId: 'zBumS', label: 'Voices · Henry Doyle', role: 'portrait', storytellerSlug: 'henry-doyle' },
  { nodeId: 'GDfmD', spreadId: 'zBumS', label: 'Voices · Jess Smit', role: 'portrait', storytellerSlug: 'jess-smit' },
  { nodeId: 'GyYAD', spreadId: 'zBumS', label: 'Voices · Natalie Friday', role: 'portrait', storytellerSlug: 'natalie-friday' },
  { nodeId: 'RUuon', spreadId: 'zBumS', label: 'Voices · Cassie Lang', role: 'portrait', storytellerSlug: 'cassie-lang' },

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
