/**
 * Component library registry.
 *
 * Single source of truth for what components exist + where to find them.
 * The gallery route at /picc/design-system/components reads this registry
 * to render every component live.
 *
 * Add a new component:
 *   1. Create components/library/<Name>/{web,pdf,sample,types,meta}.tsx
 *   2. Add `<Name>` to LIBRARY below — alphabetical order
 *   3. Component appears in the gallery automatically
 */

export type LibraryCategory =
  | 'almanac'
  | 'annual-report'
  | 'museum-element'
  | 'primitive'
  | 'form'
  | 'nav'

export type Implementation = 'web' | 'pdf'

export interface ComponentMeta {
  /** Component name, matches folder name. */
  name: string
  /** One-paragraph "what + when to use". */
  description: string
  /** Where the design lives. */
  pencilFile?: string
  /** Pencil node id (deep-link target). */
  pencilNodeId?: string
  /** Logical grouping in the gallery. */
  category: LibraryCategory
  /** Which implementations exist. */
  implementations: Implementation[]
  /** Optional ordering hint within a category (lower = earlier). */
  sortOrder?: number
}

export const LIBRARY = [
  'WebHero',
  'SectionOpener',
  'StatHero',
  'ServiceHeroCard',
  'ServiceCompactTile',
  'VideoOverlayCard',
  'MilestoneCallout',
  'QuoteCardElder',
  'PhotoBlock',
  'FinancialBars',
  'FooterCTA',
] as const

export type LibraryName = (typeof LIBRARY)[number]
