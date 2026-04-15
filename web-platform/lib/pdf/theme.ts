/**
 * PICC PDF Theme — "Saltwater & Earth" palette v2.0
 * Unified colour system across web and PDF.
 * Source of truth: PICC-BRAND-STYLE-GUIDE.md
 */
import { StyleSheet } from '@react-pdf/renderer'

// ── Saltwater & Earth Palette ────────────────────────
export const C = {
  // Core Identity
  ocean: '#0B4F6C',
  ochre: '#C8963E',
  earth: '#2D2319',

  // Supporting
  reef: '#0EA5E9',
  mangrove: '#15803D',
  coral: '#E8600A',
  starGold: '#F5A623',

  // Cultural
  turtleRed: '#8B1A1A',
  sand: '#FEF3C7',

  // Dark
  midnight: '#1A1A2E',

  // Neutrals
  rock: '#292524',
  driftwood: '#6B6560',
  muted: '#A39E99',
  shell: '#F7F6F4',
  border: '#E8E6E3',
  white: '#ffffff',

  // Opacity helpers
  ocean10: 'rgba(11, 79, 108, 0.1)',
  ochre10: 'rgba(200, 150, 62, 0.1)',

  // ── Legacy aliases (backward compatibility) ────────
  // These map old names → new palette so existing templates
  // keep working while we migrate references one-by-one.
  reefDeep: '#0B4F6C',        // → ocean
  reefBright: '#0EA5E9',      // → reef
  reefDeep10: 'rgba(11, 79, 108, 0.1)', // → ocean10
  blue: '#0B4F6C',            // → ocean
  blueDark: '#0B4F6C',        // → ocean
  blueDeep: '#0B4F6C',        // → ocean
  blue50: '#f0f9ff',
  blue100: '#e0f2fe',
  purple: '#0EA5E9',          // → reef
  purple50: '#f0f9ff',
  purple100: '#e0f2fe',
  purpleDark: '#0B4F6C',      // → ocean
  green: '#15803D',            // → mangrove
  green50: '#ecfdf5',
  amber: '#F5A623',            // → starGold
  amber50: '#FEF3C7',         // → sand
  orange: '#E8600A',           // → coral
  teal: '#0EA5E9',             // → reef
  lagoon: '#0EA5E9',           // → reef
  textPrimary: '#292524',      // → rock
  textSecondary: '#6B6560',    // → driftwood
  textMuted: '#A39E99',        // → muted
  textLight: '#E8E6E3',        // → border
  shellWhite: '#F7F6F4',      // → shell
  bgLight: '#F7F6F4',         // → shell
  bgSection: '#F7F6F4',       // → shell
  bgDark: '#1A1A2E',          // → midnight
  borderLight: '#F7F6F4',     // → shell
} as const

// ── Page Dimensions (A4) ─────────────────────────────
export const A4_W = 595.28 // pt
export const A4_H = 841.89 // pt
export const MARGIN = 50
export const CONTENT_W = A4_W - MARGIN * 2

// ── Currency Formatting ──────────────────────────────
export function fmtCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export function fmtFullCurrency(n: number): string {
  const abs = Math.abs(n)
  const formatted = abs.toLocaleString('en-AU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return n < 0 ? `($${formatted})` : `$${formatted}`
}

// ── Spacing Scale ───────────────────────────────────
export const SP = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const

// ── Base Styles ──────────────────────────────────────
export const baseStyles = StyleSheet.create({
  // Standard content page
  page: {
    flexDirection: 'column',
    backgroundColor: C.white,
    fontFamily: 'Inter',
    fontSize: 9.5,
    color: C.rock,
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: MARGIN,
  },

  // Sand-tinted content page (for warm sections)
  pageSand: {
    flexDirection: 'column',
    backgroundColor: C.sand,
    fontFamily: 'Inter',
    fontSize: 9.5,
    color: C.rock,
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: MARGIN,
  },

  // Shell/light content page
  pageShell: {
    flexDirection: 'column',
    backgroundColor: C.shell,
    fontFamily: 'Inter',
    fontSize: 9.5,
    color: C.rock,
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: MARGIN,
  },

  // Full-bleed page (no padding)
  pageBleed: {
    flexDirection: 'column',
    backgroundColor: C.white,
    fontFamily: 'Inter',
    fontSize: 9.5,
    color: C.rock,
    // Full-bleed pages (cover, back cover) must have zero padding — React PDF
    // Page defaults to 36pt padding, so an A4_H-sized image would exceed the
    // content area and hang the layout engine on pagination.
    padding: 0,
  },

  // Running header
  runningHeader: {
    position: 'absolute',
    top: 20,
    left: MARGIN,
    right: MARGIN,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  runningHeaderText: {
    fontSize: 6.5,
    fontWeight: 'semibold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: C.muted,
  },

  // Page number footer
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: C.muted,
  },

  // Section label — uppercase tracking label above headings
  sectionLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    color: C.ochre,
    marginBottom: 6,
  },

  // Headings — Caveat for display warmth, bolder sizing
  h1: {
    fontFamily: 'Caveat',
    fontSize: 36,
    fontWeight: 'bold',
    color: C.ocean,
    marginBottom: 10,
    lineHeight: 1.1,
  },
  h2: {
    fontFamily: 'Caveat',
    fontSize: 26,
    fontWeight: 'bold',
    color: C.ocean,
    marginBottom: 8,
    lineHeight: 1.15,
  },
  h3: {
    fontSize: 14,
    fontWeight: 'bold',
    color: C.ocean,
    marginBottom: 6,
  },
  h4: {
    fontSize: 11,
    fontWeight: 'bold',
    color: C.ocean,
    marginBottom: 4,
  },

  // Display text — for large pull quotes and editorial text
  display: {
    fontFamily: 'Caveat',
    fontSize: 20,
    color: C.ocean,
    lineHeight: 1.3,
  },

  // Body text
  body: {
    fontSize: 9.5,
    color: C.driftwood,
    lineHeight: 1.7,
  },
  bodySmall: {
    fontSize: 8.5,
    color: C.driftwood,
    lineHeight: 1.6,
  },
  lead: {
    fontSize: 11,
    color: C.driftwood,
    lineHeight: 1.7,
    marginBottom: 16,
  },

  // Caption / fine print
  caption: {
    fontSize: 7.5,
    color: C.muted,
    lineHeight: 1.4,
  },

  // ── Layout helpers ──────────────────────────────────
  row: {
    flexDirection: 'row',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  col40: {
    width: '38%',
  },
  col60: {
    width: '58%',
  },
  col48: {
    width: '48%',
  },
  col31: {
    width: '31%',
  },

  // ── Accent bar — ochre stripe at bottom of sections ──
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: C.ochre,
  },
})
