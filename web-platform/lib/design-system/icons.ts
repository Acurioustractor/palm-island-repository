/**
 * PICC approved icon library.
 *
 * Single source of truth for icon paths used across pages. All paths
 * resolve through assetUrl() to Supabase Storage.
 *
 * Each icon listed here has been approved via the design-system voting
 * page (status='approved'). When you add a new use site:
 *   import { ICONS } from '@/lib/design-system/icons';
 *   <img src={ICONS.quote} alt="" />
 */
import { assetUrl } from '@/lib/media/asset-url'

// ── Bespoke icons (14 approved) ───────────────────────────────────────
// Black-on-transparent. Companion white versions live at /icons/bespoke-white/.

export const BESPOKE = {
  collection:           assetUrl('/icons/bespoke/collection.png'),
  crisis:               assetUrl('/icons/bespoke/crisis.png'),
  governance:           assetUrl('/icons/bespoke/governance.png'),
  hopeful:              assetUrl('/icons/bespoke/hopeful.png'),
  housing:              assetUrl('/icons/bespoke/housing.png'),
  justice:              assetUrl('/icons/bespoke/justice.png'),
  land:                 assetUrl('/icons/bespoke/land.png'),
  photo:                assetUrl('/icons/bespoke/photo.png'),
  quote:                assetUrl('/icons/bespoke/quote.png'),
  reflective:           assetUrl('/icons/bespoke/reflective.png'),
  restricted:           assetUrl('/icons/bespoke/restricted.png'),
  search:               assetUrl('/icons/bespoke/search.png'),
  timeline:             assetUrl('/icons/bespoke/timeline.png'),
  traditionalKnowledge: assetUrl('/icons/bespoke/traditional-knowledge.png'),
} as const

export const BESPOKE_WHITE = {
  collection:           assetUrl('/icons/bespoke-white/collection.png'),
  crisis:               assetUrl('/icons/bespoke-white/crisis.png'),
  governance:           assetUrl('/icons/bespoke-white/governance.png'),
  hopeful:              assetUrl('/icons/bespoke-white/hopeful.png'),
  housing:              assetUrl('/icons/bespoke-white/housing.png'),
  justice:              assetUrl('/icons/bespoke-white/justice.png'),
  land:                 assetUrl('/icons/bespoke-white/land.png'),
  photo:                assetUrl('/icons/bespoke-white/photo.png'),
  quote:                assetUrl('/icons/bespoke-white/quote.png'),
  reflective:           assetUrl('/icons/bespoke-white/reflective.png'),
  restricted:           assetUrl('/icons/bespoke-white/restricted.png'),
  search:               assetUrl('/icons/bespoke-white/search.png'),
  timeline:             assetUrl('/icons/bespoke-white/timeline.png'),
  traditionalKnowledge: assetUrl('/icons/bespoke-white/traditional-knowledge.png'),
} as const

// ── Section room icons (4 approved + companions) ─────────────────────
// Large, illustrative. Use as page markers / cartouche heroes.
// Keyed by the almanac SectionKey strings (children-families, etc).

export const SECTION_ICONS: Record<string, string> = {
  childrenFamilies:   assetUrl('/icons/picc/03-family.png'),
  justiceSafety:      assetUrl('/icons/picc/04-justice.png'),
  educationCommunity: assetUrl('/icons/picc/05-community.png'), // companion
  healthWellbeing:    assetUrl('/icons/picc/02-health.png'),
}

// "country" doesn't map to a SectionKey but the icon is approved and
// requested for stories pages.
export const COUNTRY_ICON = assetUrl('/icons/picc/10-country.png')

// ── Brand motifs (2 approved) ─────────────────────────────────────────

export const MOTIFS = {
  concentricCorner: assetUrl('/icons/picc/motifs/01-concentric-corner.png'),
  arcDots:          assetUrl('/icons/picc/motifs/02-arc-dots.png'),
} as const

// ── Helper ────────────────────────────────────────────────────────────

/** Pick the SECTION icon for a given section key, or undefined. */
export function getSectionIcon(section: string): string | undefined {
  return SECTION_ICONS[section]
}
