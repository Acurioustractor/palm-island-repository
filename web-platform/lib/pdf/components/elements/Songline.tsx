/**
 * Songline — a horizontal narrative band that crosses a full spread.
 *
 * Anatomy:
 *   - river-timeline OR three-bands wash as substrate
 *   - ArcDots-style punctuation at each waypoint
 *   - WaveLine threading through
 *   - Dates in Inter caps
 *   - Place-names in Caveat
 *
 * Reads left-to-right like a scroll. Used twice in the report only —
 * Hull River (pp.8-9) and CFC rebuild (pp.14-15). Songlines must stay
 * rare or they stop singing.
 *
 * Variants:
 *   - 'hullRiver' — Ocean → Reef → Mangrove palette (return-to-Country)
 *   - 'cfcRebuild' — Earth → Coral → Sand palette (recovery)
 *
 * Each Songline has 3-7 waypoints. Waypoints are absolutely positioned
 * along the band; the connecting WaveLine sits behind them.
 */
import { View, Text, Image } from '@react-pdf/renderer'
import { C, TYPE } from '../../theme'
import { resolveAsset } from '../../asset-resolver'

interface Waypoint {
  /** Date or year — Inter caps. */
  date: string
  /** Place name — Caveat hand. */
  place: string
  /** A short note — a few words at most. Body type. */
  note?: string
  /** Optional photoUrl — small inset above the waypoint. */
  photoUrl?: string
}

interface SonglineProps {
  /** Title above the band — "Walking Country Together" or similar. */
  title: string
  /** Brief sub-line. */
  subtitle?: string
  /** The waypoints — 3-7 ideal. */
  waypoints: Waypoint[]
  /** Palette/substrate variant. */
  variant?: 'hullRiver' | 'cfcRebuild'
  /** Width — defaults to full content. */
  width?: string | number
}

export function Songline({
  title,
  subtitle,
  waypoints,
  variant = 'hullRiver',
  width = '100%',
}: SonglineProps) {
  // Substrate per variant
  const substrateUrl =
    variant === 'hullRiver'
      ? '/icons/picc/infographics/02-river-timeline.png'
      : '/icons/picc/infographics/05-before-after-hull.png'

  // Palette per variant
  const palette =
    variant === 'hullRiver'
      ? { primary: C.ocean, mid: C.reef, end: C.mangrove }
      : { primary: C.earth, mid: C.coral, end: C.sand }

  return (
    <View style={{ width, marginVertical: 18 }}>
      {/* Title above the band */}
      <View style={{ marginBottom: 14, paddingHorizontal: 14 }}>
        <Text
          style={{
            fontFamily: TYPE.body,
            fontSize: 7.5,
            fontWeight: 'bold',
            color: palette.primary,
            textTransform: 'uppercase',
            letterSpacing: 2.5,
            marginBottom: 4,
          }}
        >
          Songline
        </Text>
        <Text
          style={{
            fontFamily: TYPE.display,
            fontSize: 26,
            fontWeight: 'bold',
            color: palette.primary,
            lineHeight: 1.1,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontFamily: TYPE.hand,
              fontSize: 16,
              color: C.earth,
              opacity: 0.75,
              marginTop: 4,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* The band */}
      <View
        style={{
          position: 'relative',
          height: 220,
          backgroundColor: C.shell,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {/* Substrate wash */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.20,
          }}
        >
          <Image
            src={resolveAsset(substrateUrl)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </View>

        {/* The wave line threading through — horizontal at mid-height */}
        <View
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: palette.primary,
            opacity: 0.35,
          }}
        />
        {/* A second slimmer wave for visual depth */}
        <View
          style={{
            position: 'absolute',
            top: '52%',
            left: 0,
            right: 0,
            height: 0.5,
            backgroundColor: palette.mid,
            opacity: 0.25,
          }}
        />

        {/* Waypoints — equally spaced along the band */}
        {waypoints.map((wp, i) => {
          const leftPct = ((i + 0.5) / waypoints.length) * 100
          const isUpper = i % 2 === 0
          // Interpolate color across the band
          const t = i / Math.max(1, waypoints.length - 1)
          const dotColor =
            t < 0.5
              ? palette.primary
              : t < 0.85
                ? palette.mid
                : palette.end

          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: 0,
                bottom: 0,
                width: 100,
                marginLeft: -50,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Vertical hairline from dot to label */}
              <View
                style={{
                  position: 'absolute',
                  top: isUpper ? '20%' : '52%',
                  bottom: isUpper ? '50%' : '20%',
                  width: 0.5,
                  backgroundColor: dotColor,
                  opacity: 0.5,
                }}
              />

              {/* The dot */}
              <View
                style={{
                  position: 'absolute',
                  top: '49%',
                  width: 8,
                  height: 8,
                  marginTop: -4,
                  borderRadius: 4,
                  backgroundColor: dotColor,
                  borderWidth: 1.5,
                  borderColor: C.sand,
                }}
              />

              {/* Label block — alternates above/below */}
              <View
                style={{
                  position: 'absolute',
                  top: isUpper ? 14 : 'auto',
                  bottom: isUpper ? 'auto' : 14,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                }}
              >
                {wp.photoUrl && (
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      overflow: 'hidden',
                      marginBottom: 4,
                    }}
                  >
                    <Image
                      src={resolveAsset(wp.photoUrl)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </View>
                )}
                <Text
                  style={{
                    fontFamily: TYPE.body,
                    fontSize: 6.5,
                    fontWeight: 'bold',
                    color: dotColor,
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                  }}
                >
                  {wp.date}
                </Text>
                <Text
                  style={{
                    fontFamily: TYPE.hand,
                    fontSize: 13,
                    color: C.earth,
                    opacity: 0.85,
                    textAlign: 'center',
                    lineHeight: 1.1,
                    marginTop: 2,
                  }}
                >
                  {wp.place}
                </Text>
                {wp.note && (
                  <Text
                    style={{
                      fontFamily: TYPE.body,
                      fontSize: 6.5,
                      color: C.driftwood,
                      textAlign: 'center',
                      maxWidth: 90,
                      marginTop: 2,
                      lineHeight: 1.3,
                    }}
                  >
                    {wp.note}
                  </Text>
                )}
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
