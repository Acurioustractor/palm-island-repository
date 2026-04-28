/**
 * Horizon — forward-looking voices.
 *
 * Anatomy:
 *   - stat-hero-horizon wash full-width at panel base
 *   - Vision quote set in PlayfairDisplay ranged left
 *   - A Caveat date-stamp ("by 2030") top-right
 *   - GradientBar dividing the speaker from the year
 *
 * The eye is pulled toward the upper edge of the page — vision, not
 * retrospection. Used 3 times — pages 20, 22, 23 — clustered near the
 * close where the report begins to look outward.
 *
 * One per forward commitment (2028 Aged Care · 2030 Bwgcolman Way · 2045
 * Sovereign Story Archive).
 */
import { View, Text, Image } from '@react-pdf/renderer'
import { C, TYPE, SECTION, type SectionKey } from '../../theme'
import { resolveAsset } from '../../asset-resolver'

interface HorizonProps {
  /** The vision statement. Short. Forward-tense. */
  statement: string

  /** The year — the only thing that changes between Horizons. */
  year: string

  /** Short title of the commitment. e.g. "Aged Care on Palm Island" */
  title: string

  /** A single sentence describing what gets there. */
  detail: string

  /** Optional attribution — the speaker / source of the vision. */
  attribution?: string

  /**
   * Section the Horizon belongs to (for accent colour). Most Horizons sit in
   * 'educationCommunity' or 'childrenFamilies' — the sections that bring the
   * report to a forward close.
   */
  section?: SectionKey
}

export function Horizon({
  statement,
  year,
  title,
  detail,
  attribution,
  section = 'educationCommunity',
}: HorizonProps) {
  const accent = SECTION[section].color

  return (
    <View
      style={{
        position: 'relative',
        marginVertical: 18,
        paddingTop: 24,
        paddingBottom: 32,
        paddingHorizontal: 22,
        minHeight: 180,
      }}
    >
      {/* Horizon wash at the base — the upper edge stays clear, eye pulls upward */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '60%',
          opacity: 0.20,
        }}
      >
        <Image
          src={resolveAsset('/icons/picc/infographics/06-stat-hero-horizon.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </View>

      {/* Top row — title left, year stamp right */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 10,
        }}
      >
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text
            style={{
              fontFamily: TYPE.body,
              fontSize: 8,
              fontWeight: 'bold',
              color: accent,
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 4,
            }}
          >
            Forward Commitment
          </Text>
          <Text
            style={{
              fontFamily: TYPE.display,
              fontSize: 22,
              fontWeight: 'bold',
              color: C.ocean,
              lineHeight: 1.15,
            }}
          >
            {title}
          </Text>
        </View>

        {/* Year stamp — Caveat, prominent, accent colour */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontFamily: TYPE.body,
              fontSize: 7,
              color: C.muted,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            By
          </Text>
          <Text
            style={{
              fontFamily: TYPE.hand,
              fontSize: 36,
              fontWeight: 'bold',
              color: accent,
              lineHeight: 1,
            }}
          >
            {year}
          </Text>
        </View>
      </View>

      {/* Gradient bar dividing speaker from year */}
      <View
        style={{
          height: 1,
          backgroundColor: accent,
          opacity: 0.4,
          marginTop: 6,
          marginBottom: 14,
        }}
      />

      {/* The vision statement — display serif, generous leading */}
      <Text
        style={{
          fontFamily: TYPE.display,
          fontSize: 16,
          color: C.earth,
          lineHeight: 1.4,
          maxWidth: 460,
        }}
      >
        {statement}
      </Text>

      {/* The detail line */}
      <Text
        style={{
          fontFamily: TYPE.body,
          fontSize: 9,
          color: C.driftwood,
          lineHeight: 1.6,
          marginTop: 10,
          maxWidth: 460,
        }}
      >
        {detail}
      </Text>

      {/* Optional attribution */}
      {attribution && (
        <Text
          style={{
            fontFamily: TYPE.hand,
            fontSize: 12,
            color: accent,
            opacity: 0.75,
            marginTop: 14,
            textAlign: 'right',
          }}
        >
          — {attribution}
        </Text>
      )}
    </View>
  )
}
