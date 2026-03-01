/**
 * Palm Island History Chapter definitions
 *
 * Central source of truth for chapter metadata used across
 * the wiki history hub, navigation, and chapter pages.
 */

import { assetUrl } from '@/lib/media/asset-url'

export interface HistoryChapter {
  slug: string
  title: string
  subtitle: string
  dateRange: string
  summary: string
  /** High-sensitivity chapters show cultural warning banners */
  sensitivity: 'standard' | 'high'
  /** Hero image for chapter cards */
  image?: string
}

export const HISTORY_CHAPTERS: HistoryChapter[] = [
  {
    slug: 'manbarra',
    title: 'Manbarra Country',
    subtitle: 'Traditional Owners of Palm Island',
    dateRange: 'Before 1914',
    summary:
      'For thousands of years, the Manbarra people lived on these islands — part of the broader Wulgurukaba nation, the "canoe people" of the Halifax Bay coast.',
    sensitivity: 'standard',
    image: assetUrl('/hero-assets/stills/waterfall.jpg'),
  },
  {
    slug: 'reserve',
    title: 'The Reserve',
    subtitle: 'Palm Island gazetted as an Aboriginal settlement',
    dateRange: '1914–1971',
    summary:
      'Under the Aboriginals Protection Act, the government could remove any Aboriginal person to any reserve, for any reason, without appeal.',
    sensitivity: 'high',
    image: assetUrl('/hero-assets/stills/mountain-valley.jpg'),
  },
  {
    slug: 'hull-river',
    title: 'Hull River',
    subtitle: 'Catastrophe on Djiru Country',
    dateRange: '1914–1918',
    summary:
      'A Category 5 cyclone obliterated Hull River settlement in March 1918. Survivors were transferred to Palm Island, carrying their languages, knowledge, and grief.',
    sensitivity: 'high',
    image: assetUrl('/hero-assets/stills/mountain-valley.jpg'),
  },
  {
    slug: 'languages',
    title: 'Many Tribes, One People',
    subtitle: 'Bwgcolman — 20+ language groups brought together',
    dateRange: '1918–1972',
    summary:
      'Over 3,950 documented removals from across Queensland. People speaking different languages, carrying different songlines, forged a new community identity.',
    sensitivity: 'standard',
  },
  {
    slug: 'dormitories',
    title: 'The Dormitories',
    subtitle: 'Children taken from families',
    dateRange: '1918–1971',
    summary:
      'Children were separated from their families and placed in dormitories under strict supervision. This systematic removal devastated families and cultural transmission.',
    sensitivity: 'high',
  },
  {
    slug: 'strike-1957',
    title: 'The 1957 Strike',
    subtitle: 'Resistance and the fight for justice',
    dateRange: '1957',
    summary:
      'Workers on Palm Island went on strike against oppressive conditions, low wages, and the denial of basic rights. A watershed moment in the fight for self-determination.',
    sensitivity: 'standard',
  },
  {
    slug: 'mulrunji',
    title: 'The Death of Mulrunji',
    subtitle: 'Cameron Doomadgee and the fight for justice',
    dateRange: '2004–2007',
    summary:
      'The death of Mulrunji (Cameron Doomadgee) in Palm Island police custody in November 2004 and the community\'s fight for accountability.',
    sensitivity: 'high',
  },
  {
    slug: 'self-determination',
    title: 'Self-Determination',
    subtitle: 'Taking control of community services',
    dateRange: '2007–2021',
    summary:
      'From one staff member and no income to 197 staff and $23.4 million — PICC\'s 20-year journey to full community control.',
    sensitivity: 'standard',
  },
  {
    slug: 'picc',
    title: 'PICC Today',
    subtitle: '100% community-controlled',
    dateRange: '2021–Present',
    summary:
      'Palm Island Community Company operates 16+ integrated services with 197 staff members — proving Indigenous self-determination works.',
    sensitivity: 'standard',
  },
]

export function getChapterBySlug(slug: string): HistoryChapter | undefined {
  return HISTORY_CHAPTERS.find((c) => c.slug === slug)
}

export function isHighSensitivity(slug: string): boolean {
  const chapter = getChapterBySlug(slug)
  return chapter?.sensitivity === 'high'
}
