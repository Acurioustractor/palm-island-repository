import type { BespokeIconName } from '@/components/ui/BespokeIcon'

/**
 * Canonical mapping from service slug → BespokeIcon name.
 * Single source of truth used by service pages, chat source cards,
 * and annual report components.
 */
const SLUG_TO_ICON: Record<string, BespokeIconName> = {
  'bwgcolman-healing': 'health',
  'family-wellbeing': 'family',
  'youth-services': 'youth',
  'early-learning': 'children',
  'cultural-centre': 'culture',
  'ranger-program': 'land',
  'community-safety': 'community',
  'digital-service-centre': 'digital',
  'housing-infrastructure': 'housing',
  'justice-services': 'justice',
  'crisis-services': 'crisis',
  'economic-development': 'economic',
  'sport-recreation': 'sport',
  'mental-health': 'mental-health',
  'disability-services': 'disability',
  'governance-admin': 'governance',
}

const DEFAULT_ICON: BespokeIconName = 'community'

/** Resolve a service slug to its BespokeIcon name. Falls back to 'community'. */
export function getServiceIcon(slug: string): BespokeIconName {
  return SLUG_TO_ICON[slug] || DEFAULT_ICON
}

/**
 * Fuzzy-match a service name/title to an icon.
 * Used by chat source cards where we have a display name rather than a slug.
 */
const KEYWORD_TO_ICON: Array<{ keywords: string[]; icon: BespokeIconName }> = [
  { keywords: ['healing', 'health', 'medical', 'bwgcolman'], icon: 'health' },
  { keywords: ['family', 'wellbeing'], icon: 'family' },
  { keywords: ['youth'], icon: 'youth' },
  { keywords: ['early learning', 'children', 'child', 'daycare'], icon: 'children' },
  { keywords: ['cultural', 'culture', 'centre'], icon: 'culture' },
  { keywords: ['ranger', 'land', 'sea'], icon: 'land' },
  { keywords: ['safety', 'safe house'], icon: 'community' },
  { keywords: ['digital', 'telstra', 'wifi'], icon: 'digital' },
  { keywords: ['housing', 'infrastructure'], icon: 'housing' },
  { keywords: ['justice'], icon: 'justice' },
  { keywords: ['crisis'], icon: 'crisis' },
  { keywords: ['economic', 'employment', 'business'], icon: 'economic' },
  { keywords: ['sport', 'recreation'], icon: 'sport' },
  { keywords: ['mental health', 'mental-health', 'counselling'], icon: 'mental-health' },
  { keywords: ['disability', 'ndis'], icon: 'disability' },
  { keywords: ['governance', 'admin'], icon: 'governance' },
]

export function getServiceIconByName(name: string): BespokeIconName {
  const lower = name.toLowerCase()
  for (const entry of KEYWORD_TO_ICON) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.icon
    }
  }
  return DEFAULT_ICON
}
