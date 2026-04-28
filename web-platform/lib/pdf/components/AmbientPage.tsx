/**
 * AmbientPage — the Saltwater Almanac's six atmospheric layers.
 *
 * Wraps a Page so every spread of the report sits on the same gallery air:
 *   1. Sand-tone paper (page is never white)
 *   2. Constellation seed (faint night sky, every spread except cartouches)
 *   3. Water grain (saltwater rings under body copy zones)
 *   4. Corner-bracket rhythm (invisible frame in section colour)
 *   5. Foot motif (wave line + page number in dot cluster)
 *   6. The Caveat hand (one handwriting voice — set in elements, not here)
 *
 * Drop one <AmbientPage> per page. Place page contents as children. The
 * layers stack in z-order so children sit on top of all six ambients.
 *
 * If a page is a Cartouche (full-bleed colour wash) or a hero Pencil page,
 * pass `bare` to skip ambient layers.
 */
import { Page, View, Text } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { AMBIENT, C, SECTION, baseStyles, type SectionKey } from '../theme'
import { ConstellationPattern } from './ConstellationPattern'
import { CornerBrackets } from './CornerBrackets'

interface AmbientPageProps {
  /** Children render on top of the six atmospheric layers. */
  children: ReactNode

  /** Section the page belongs to. Drives corner-bracket colour. */
  section?: SectionKey

  /**
   * Skip atmospheric layers entirely. Use for Cartouches (their own colour wash),
   * full-bleed hero pages, or hand-curated Pencil exports brought in as PNG.
   */
  bare?: boolean

  /**
   * Hide the constellation seed for this page only — useful on dense data pages
   * where any extra texture would distract.
   */
  hideConstellation?: boolean

  /**
   * Page number to render in the foot motif. Pages 1 (cover) and 24 (back cover)
   * pass `null` to suppress.
   */
  pageNumber?: number | null

  /** Constellation seed for deterministic dot placement per page. */
  constellationSeed?: number

  /** Override the page background. Default: sand-tone paper. */
  background?: string
}

export function AmbientPage({
  children,
  section = 'childrenFamilies',
  bare = false,
  hideConstellation = false,
  pageNumber = null,
  constellationSeed = 42,
  background,
}: AmbientPageProps) {
  // Bare mode — no atmospheric layers at all (used by Cartouches and hero pages)
  if (bare) {
    return (
      <Page size="A4" style={baseStyles.pageBleed}>
        {children}
      </Page>
    )
  }

  const sectionColor = SECTION[section].color
  // Sand-tone paper at AMBIENT.paperSandOpacity over warm cream.
  // We render this as a solid full-bleed View at the back of the stack.
  const paperBg = background ?? blendSandOnCream(AMBIENT.paperSandOpacity)

  return (
    <Page
      size="A4"
      style={{
        ...baseStyles.page,
        backgroundColor: paperBg,
        // Make room at the bottom for the foot motif
        paddingBottom: 60,
      }}
    >
      {/* Layer 2 — Constellation seed (skip on dense data pages).
          Barely there: count and opacity both reduced so the night sky is felt, not seen. */}
      {!hideConstellation && (
        <ConstellationPattern
          color={C.starGold}
          opacity={AMBIENT.constellationOpacity}
          count={AMBIENT.constellationCount}
          seed={constellationSeed}
        />
      )}

      {/* Layer 3 (water grain) is intentionally NOT rendered globally — too noisy.
          Elements that want it (Reliquary, Lantern, Specimen, etc.) load their own
          substrate at element-level. The page itself stays calm. */}

      {/* Layer 4 — Corner-bracket rhythm in section colour, very soft */}
      <CornerBrackets
        size={22}
        thickness={0.5}
        color={sectionColor}
        opacity={AMBIENT.cornerBracketOpacity}
        inset={AMBIENT.cornerBracketInset}
      />

      {/* Page contents (sit on top of all atmospheric layers) */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* Layer 5 — Foot motif: wave line + page number inside dot cluster */}
      <FootMotif sectionColor={sectionColor} pageNumber={pageNumber} />
    </Page>
  )
}

/**
 * The foot motif — a thin wave line across the bottom of every body page,
 * with the page number set inside a tiny ConcentricDots-like cluster.
 */
function FootMotif({
  sectionColor,
  pageNumber,
}: {
  sectionColor: string
  pageNumber: number | null
}) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Wave line */}
      <View
        style={{
          width: '100%',
          height: AMBIENT.footWaveThickness,
          backgroundColor: sectionColor,
          opacity: AMBIENT.footWaveOpacity,
        }}
      />

      {/* Page number inside a small dot cluster */}
      {pageNumber !== null && (
        <View
          style={{
            marginTop: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Left dot */}
          <View
            style={{
              width: 2,
              height: 2,
              borderRadius: 1,
              backgroundColor: sectionColor,
              opacity: 0.4,
              marginRight: 6,
            }}
          />
          {/* Number */}
          <Text
            style={{
              fontFamily: 'Inter',
              fontSize: 7.5,
              color: C.muted,
              letterSpacing: 1,
            }}
          >
            {String(pageNumber).padStart(2, '0')}
          </Text>
          {/* Right dot */}
          <View
            style={{
              width: 2,
              height: 2,
              borderRadius: 1,
              backgroundColor: sectionColor,
              opacity: 0.4,
              marginLeft: 6,
            }}
          />
        </View>
      )}
    </View>
  )
}

/**
 * Sand `#FEF3C7` at given opacity over warm cream `#FBFAF6` produces the
 * gallery wall colour. Computed once and returned as a hex so the Page
 * background prop can use a literal value.
 */
function blendSandOnCream(opacity: number): string {
  // Warm cream base
  const baseR = 0xfb
  const baseG = 0xfa
  const baseR_ = 0xf6 // typo guard: leaving named variables explicit
  const baseB = 0xf6

  // Sand overlay
  const ovR = 0xfe
  const ovG = 0xf3
  const ovB = 0xc7

  const r = Math.round(baseR * (1 - opacity) + ovR * opacity)
  const g = Math.round(baseG * (1 - opacity) + ovG * opacity)
  const b = Math.round(baseB * (1 - opacity) + ovB * opacity)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
