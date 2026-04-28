/**
 * Kuling Field — the night-sky stat panel where many small numbers cluster.
 *
 * Anatomy:
 *   - constellation-stats wash background
 *   - ConstellationPattern dense overlay
 *   - Each stat is a star: StarMarker + number + 2-word label
 *   - Star size maps to magnitude (the biggest number = brightest star)
 *   - Hairlines connect stars into informal constellations grouped by theme
 *
 * Star Gold and Reef colours only.
 *
 * Used 3 times — pages 12 (NDIS figures), 18 (youth participation),
 * 20 (economic).
 *
 * Where Vitrines hold three monumental facts side-by-side, the Kuling Field
 * holds many smaller facts as a single composition. The visitor reads it
 * the way you read a sky — picking out shapes.
 */
import { View, Text } from '@react-pdf/renderer'
import { C, TYPE } from '../../theme'
import { ConstellationPattern } from '../ConstellationPattern'
import { StarMarker } from '../StarMarker'

interface KulingStar {
  /** The number — the star's body. */
  value: string
  /** Two-word label beneath. */
  label: string
  /**
   * Magnitude 1-5. 5 = brightest = biggest. Default 3.
   * Maps to StarMarker size (6 → 14pt).
   */
  magnitude?: number
  /** Position — % from top (5-90) and % from left (5-90). */
  top: number
  left: number
}

interface KulingFieldProps {
  /** The title of the field — short, evocative. */
  title: string
  /** A one-line subtitle — the constellation's name. */
  subtitle?: string
  /** Stars in the field. 5-12 typical. */
  stars: KulingStar[]
  /**
   * Optional connector lines between star indices — informal constellations.
   * e.g. [[0,1],[1,2],[3,4]] draws three connecting hairlines.
   */
  connectors?: [number, number][]
  /** Background tone — defaults to a near-midnight panel for contrast. */
  background?: string
}

export function KulingField({
  title,
  subtitle,
  stars,
  connectors = [],
  background,
}: KulingFieldProps) {
  // Use a soft midnight tinted with cream — the night sky over the cream paper
  const bg = background ?? '#F4EFE0' // Sand pulled toward earth

  return (
    <View
      style={{
        position: 'relative',
        marginVertical: 18,
        paddingHorizontal: 22,
        paddingVertical: 26,
        backgroundColor: bg,
        minHeight: 280,
        borderRadius: 4,
      }}
    >
      {/* Dense constellation overlay — the night beneath the named stars */}
      <ConstellationPattern color={C.starGold} opacity={0.18} count={32} seed={37} />

      {/* Title block — top-left */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontFamily: TYPE.body,
            fontSize: 7.5,
            color: C.driftwood,
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 4,
          }}
        >
          A Field of
        </Text>
        <Text
          style={{
            fontFamily: TYPE.display,
            fontSize: 24,
            fontWeight: 'bold',
            color: C.ocean,
            lineHeight: 1.1,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontFamily: TYPE.hand,
              fontSize: 14,
              color: C.earth,
              opacity: 0.7,
              marginTop: 4,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* The starfield itself — absolute-positioned stars within a relative frame */}
      <View style={{ position: 'relative', height: 200, marginTop: 4 }}>
        {/* Connector hairlines — drawn first so stars sit on top */}
        {connectors.map(([a, b], i) => {
          const sa = stars[a]
          const sb = stars[b]
          if (!sa || !sb) return null
          // Approximate a line by placing a thin View at the midpoint with rotation.
          // React-PDF doesn't support transform-rotate well, so we render a soft
          // gradient bar between the two points using flex-positioned views.
          // For first version, use a simple absolutely-positioned bar.
          const x1 = sa.left
          const y1 = sa.top
          const x2 = sb.left
          const y2 = sb.top
          const dx = x2 - x1
          const dy = y2 - y1
          const length = Math.sqrt(dx * dx + dy * dy)
          const angle = Math.atan2(dy, dx) * (180 / Math.PI)
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                top: `${y1}%`,
                left: `${x1}%`,
                width: `${length}%`,
                height: 0.5,
                backgroundColor: C.starGold,
                opacity: 0.35,
                transformOrigin: '0 0',
                transform: `rotate(${angle}deg)`,
              }}
            />
          )
        })}

        {/* The stars */}
        {stars.map((star, i) => {
          const mag = star.magnitude ?? 3
          const starSize = 6 + mag * 2 // 8 → 16pt
          const valueFontSize = 14 + mag * 2 // 16 → 24pt
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                top: `${star.top}%`,
                left: `${star.left}%`,
                alignItems: 'center',
              }}
            >
              <StarMarker size={starSize} color={C.starGold} />
              <Text
                style={{
                  fontFamily: TYPE.display,
                  fontSize: valueFontSize,
                  fontWeight: 'bold',
                  color: C.ocean,
                  marginTop: 4,
                  lineHeight: 1,
                }}
              >
                {star.value}
              </Text>
              <Text
                style={{
                  fontFamily: TYPE.body,
                  fontSize: 7,
                  color: C.driftwood,
                  marginTop: 3,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  textAlign: 'center',
                  maxWidth: 80,
                }}
              >
                {star.label}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
