/**
 * Innovation tier — which services count as innovation programmes.
 *
 * Source: PICC-20-Year-Launchpad-Plan.md M1/M2 + Narelle services review.
 * These are the services driving the next-20 vision (delegated authority,
 * data sovereignty, locally-designed care, cultural infrastructure) — not
 * steady-state operations.
 *
 * Used by /services to badge cards and by /innovation to lift the same set
 * with story scroll. When a new innovation programme launches, add the
 * slug here in addition to setting the EL service_type.
 */
export const INNOVATION_SLUGS = new Set<string>([
  'bwgcolman-way',
  'bwgcolman-healing',
  'first-1000-days',
  'bwgcolman-education-engagement-attainment-initiative',
  'cultural_centre',
  'cultural-programs',
  'aged-care-services',
  'digital_services',
  'community-justice-group',
])

/**
 * One-line description per innovation slug. Used in the innovation badge
 * tooltip and on /innovation. Keep these in the Service register voice —
 * specific, short, no claims staff wouldn't own.
 */
export const INNOVATION_BLURBS: Record<string, string> = {
  'bwgcolman-way':
    'First ATSICCO in Queensland with delegated authority under Part 2A. Children stay on Country.',
  'bwgcolman-healing':
    'Doctor-led, locally-staffed primary health care. Returning Palm Islanders to Palm.',
  'first-1000-days':
    'Maternal and infant care anchored on Palm. Baby-by-baby, family-by-family.',
  'bwgcolman-education-engagement-attainment-initiative':
    'School engagement officers in classrooms. Attendance is the leading indicator.',
  'cultural_centre':
    'Cultural infrastructure designed and run by Palm Islanders. Language, art, ceremony.',
  'cultural-programs':
    'Programs that put cultural practice at the centre of every service.',
  'aged-care-services':
    'Aged care on Palm so Elders never have to leave Country. Flagged URGENT.',
  'digital_services':
    'Indigenous data sovereignty in practice. Community knowledge held in community hands.',
  'community-justice-group':
    'Community-led justice that names the problem before it names the person.',
}

export function isInnovation(slug: string | null | undefined): boolean {
  if (!slug) return false
  return INNOVATION_SLUGS.has(slug)
}
