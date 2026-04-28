/**
 * Saltwater Almanac — design tokens (server-safe).
 *
 * Plain `.ts` (no 'use client') so both server pages and client components
 * can import the values directly. Mirrors `lib/pdf/theme.ts` palette.
 */

export const C = {
  ocean: '#0B4F6C',
  ochre: '#C8963E',
  earth: '#2D2319',
  reef: '#0EA5E9',
  mangrove: '#15803D',
  coral: '#E8600A',
  starGold: '#F5A623',
  turtleRed: '#8B1A1A',
  sand: '#FEF3C7',
  midnight: '#1A1A2E',
  rock: '#292524',
  driftwood: '#6B6560',
  muted: '#A39E99',
  shell: '#F7F6F4',
  border: '#E8E6E3',
} as const

export const SECTION_COLOURS = {
  childrenFamilies: C.ochre,
  healthWellbeing: C.mangrove,
  justiceSafety: C.coral,
  youth: C.reef,
  economic: C.starGold,
  educationCommunity: C.ocean,
  governance: C.turtleRed,
  all: C.ocean,
} as const

export type SectionKey = keyof typeof SECTION_COLOURS
