/**
 * Reliquary — one sacred number per anchor story. Page-sized presentation
 * of a single fact dressed as if behind glass.
 *
 * Anatomy:
 *   - A wash substrate (chosen per anchor: stat-hero-horizon for default,
 *     T3.1 rings for Bwgcolman Way, T3.2 arc for First 1,000 Days, etc.)
 *   - A numeral set extra-large in PlayfairDisplay (Canela substitute)
 *   - A Caveat hand-annotation slanting beneath ("families. not files.")
 *   - A StarMarker placed where a museum docent would point
 *   - ConstellationPattern at 8% opacity floats around the numeral
 *
 * Used once per anchor story. Never twice on a spread. Pages 5, 13, 14, 15.
 */
import { View, Text, Image } from '@react-pdf/renderer'
import { C, TYPE, SECTION, type SectionKey } from '../../theme'
import { ConstellationPattern } from '../ConstellationPattern'
import { StarMarker } from '../StarMarker'
import { resolveAsset } from '../../asset-resolver'

interface ReliquaryProps {
  /** The big number — usually 1-3 chars, but can be a phrase. */
  numeral: string
  /** What the number means. Short. Set in body type beneath. */
  unit: string
  /** Hand-annotation ("families. not files.") — Caveat italic style. */
  annotation: string
  /** Section the anchor story belongs to — drives accent colour. */
  section: SectionKey
  /**
   * Which substrate wash. One of the prompt slots in the asset library.
   *   'horizon'    → stat-hero-horizon (default)
   *   'rings'      → T3.1 (Bwgcolman Way)
   *   'arc'        → T3.2 (First 1,000 Days)
   *   'water'      → T3.3 (CFC rebuild)
   *   'reef'       → T3.4 (BHS)
   *   'custom'     → use customSubstrateUrl prop (e.g. swap in a generated image)
   */
  substrate?: 'horizon' | 'rings' | 'arc' | 'water' | 'reef' | 'custom'
  /** Used when substrate === 'custom' — path to a generated image. */
  customSubstrateUrl?: string
  /** Substrate opacity. Default 0.18. Tune per page if the wash competes with the numeral. */
  substrateOpacity?: number
  /**
   * Optional thin caption beneath the unit — date, source, or quiet attribution.
   * e.g. "Bwgcolman Way · FY24-25"
   */
  caption?: string
  /** Compact mode — tightens vertical padding so two Reliquaries can sit on one page. */
  compact?: boolean
}

const SUBSTRATE_MAP = {
  horizon: '/icons/picc/infographics/06-stat-hero-horizon.png',
  rings: '/icons/picc/infographics/01-saltwater-rings.png',
  arc: '/icons/picc/infographics/04-constellation-stats.png',
  water: '/icons/picc/infographics/05-before-after-hull.png',
  reef: '/icons/picc/infographics/03-reef-layers.png',
} as const

export function Reliquary({
  numeral,
  unit,
  annotation,
  section,
  substrate = 'horizon',
  customSubstrateUrl,
  substrateOpacity = 0.18,
  caption,
  compact = false,
}: ReliquaryProps) {
  const accent = SECTION[section].color
  const substrateUrl =
    substrate === 'custom' && customSubstrateUrl
      ? customSubstrateUrl
      : SUBSTRATE_MAP[substrate === 'custom' ? 'horizon' : substrate]

  return (
    <View
      style={{
        position: 'relative',
        width: '100%',
        minHeight: compact ? 220 : 320,
      }}
    >
      {/* Substrate wash — full panel, low opacity */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: substrateOpacity,
        }}
      >
        <Image
          src={resolveAsset(substrateUrl)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </View>

      {/* Constellation around the numeral */}
      <ConstellationPattern color={C.starGold} opacity={0.08} count={9} seed={section.length * 7} />

      {/* Numeral — centre, monumental */}
      <View
        style={{
          paddingTop: compact ? 30 : 50,
          paddingBottom: compact ? 18 : 28,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: TYPE.display,
            fontSize: compact ? 96 : 130,
            fontWeight: 'bold',
            color: accent,
            lineHeight: 0.95,
            letterSpacing: -2,
          }}
        >
          {numeral}
        </Text>

        {/* Unit beneath — small, restrained */}
        <Text
          style={{
            fontFamily: TYPE.body,
            fontSize: 10,
            color: C.driftwood,
            textTransform: 'uppercase',
            letterSpacing: 3,
            marginTop: 6,
          }}
        >
          {unit}
        </Text>

        {/* Star marker — the docent's pointer */}
        <View style={{ marginTop: 14 }}>
          <StarMarker size={9} color={C.starGold} />
        </View>

        {/* Hand annotation — Caveat, italic feel through font weight + style */}
        <Text
          style={{
            fontFamily: TYPE.hand,
            fontSize: 22,
            color: C.earth,
            opacity: 0.82,
            marginTop: 14,
            textAlign: 'center',
            maxWidth: 320,
            lineHeight: 1.2,
          }}
        >
          {annotation}
        </Text>

        {/* Caption — quiet attribution */}
        {caption && (
          <Text
            style={{
              fontFamily: TYPE.body,
              fontSize: 8,
              color: C.muted,
              marginTop: 22,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
            }}
          >
            {caption}
          </Text>
        )}
      </View>
    </View>
  )
}
