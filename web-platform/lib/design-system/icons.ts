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

/**
 * Pick the best-fit approved icon for a stat / metric / heading label.
 *
 * Uses keyword matching against the 14 approved bespoke icons + the 4
 * approved section icons. Returns null if nothing matches — caller can
 * fall through to no-icon rendering.
 *
 * Tuned for PICC's 2024-25 stats (staff, services, care episodes,
 * placement nights, NDIS growth, income, blue card notices, etc).
 */
export function pickIconForLabel(label: string): string | null {
  const k = label.toLowerCase()

  // Compliance / governance / authority
  if (k.includes('blue card') || k.includes('notice') || k.includes('check')) return BESPOKE.restricted
  if (k.includes('queensland') || k.includes('first') || k.includes('authority') || k.includes('delegat') || k.includes('govern') || k.includes('board') || k.includes('director')) return BESPOKE.governance

  // Health & wellbeing
  if (k.includes('care') || k.includes('episode') || k.includes('health') || k.includes('wellbeing') || k.includes('healing') || k.includes('clinical')) return SECTION_ICONS.healthWellbeing

  // Children & families
  if (k.includes('placement') || k.includes('family') || k.includes('families') || k.includes('children') || k.includes('child') || k.includes('kin')) return SECTION_ICONS.childrenFamilies

  // Justice & safety
  if (k.includes('justice') || k.includes('safety') || k.includes('legal')) return BESPOKE.justice

  // Housing
  if (k.includes('hous') || k.includes('shelter') || k.includes('tenancy')) return BESPOKE.housing

  // Land / country
  if (k.includes('land') || k.includes('country') || k.includes('on country') || k.includes('cultural')) return BESPOKE.land

  // Time / growth / trajectory
  if (k.includes('growth') || k.includes('grew') || k.includes('increase') || k.includes('trend') || k.includes('over time')) return BESPOKE.timeline

  // Hopeful / future
  if (k.includes('vision') || k.includes('hope') || k.includes('future') || k.includes('aspirat')) return BESPOKE.hopeful

  // Reflective / past
  if (k.includes('reflect') || k.includes('legacy') || k.includes('history')) return BESPOKE.reflective

  // Crisis
  if (k.includes('crisis') || k.includes('urgent') || k.includes('risk') || k.includes('press')) return BESPOKE.crisis

  // Quotes / voices
  if (k.includes('quote') || k.includes('voice') || k.includes('story') || k.includes('testimony')) return BESPOKE.quote

  // Photos
  if (k.includes('photo') || k.includes('image') || k.includes('portrait')) return BESPOKE.photo

  // Search / discover
  if (k.includes('search') || k.includes('find')) return BESPOKE.search

  // Knowledge / traditional
  if (k.includes('knowledge') || k.includes('tradition') || k.includes('elder')) return BESPOKE.traditionalKnowledge

  // Collections / staff / services / income (anything that's "many of X")
  if (k.includes('staff') || k.includes('member') || k.includes('people') || k.includes('service') || k.includes('income') || k.includes('revenue') || k.includes('budget') || k.includes('total')) return BESPOKE.collection

  return null
}
