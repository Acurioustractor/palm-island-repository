/**
 * Atlas — the map of what PICC does.
 *
 * Anatomy:
 *   - services-around-island substrate
 *   - ConstellationPattern overlaid at 15%
 *   - 24 service nodes plotted as small ConcentricDots-style markers in
 *     section colours
 *   - Hairlines connecting clusters
 *   - Inter labels in two sizes (program / service)
 *
 * Used twice in the report:
 *   - Pages 2-3: Orientation Atlas (descriptive — what PICC is today)
 *   - Page 23: Closing Atlas (aspirational — same coordinates, 2028
 *     commitments mapped on)
 *
 * Same map, different stars lit. The closing atlas rhymes loosely with the
 * orientation atlas — visitors recognise the geography and read change.
 */
import { View, Text, Image } from '@react-pdf/renderer'
import { C, TYPE, SECTION, type SectionKey } from '../../theme'
import { ConstellationPattern } from '../ConstellationPattern'
import { resolveAsset } from '../../asset-resolver'

interface ServiceNode {
  /** Service name — short, will be set in Inter caps. */
  name: string
  /** Section key — drives the dot colour. */
  section: SectionKey
  /** Position — % from top (5-90) and % from left (5-90). */
  top: number
  left: number
  /** Magnitude 1-3. 3 = larger dot for anchor services. Default 2. */
  magnitude?: number
  /** Optional one-line caveat note beneath. */
  note?: string
}

interface AtlasProps {
  /** Title — e.g. "Orientation" or "What's Next" */
  title: string
  /** Sub-line — e.g. "24 services around one island." */
  subtitle?: string
  /** The service nodes. */
  nodes: ServiceNode[]
  /**
   * Optional connector pairs — informal clusters drawn as hairlines.
   * e.g. [[0,1],[1,2]] connects nodes 0-1-2 into a chain.
   */
  connectors?: [number, number][]
  /**
   * Variant — orientation (full saturation) or closing (muted, with
   * future-tinted highlights).
   */
  variant?: 'orientation' | 'closing'
  /** Footer caption — quiet attribution. */
  caption?: string
}

export function Atlas({
  title,
  subtitle,
  nodes,
  connectors = [],
  variant = 'orientation',
  caption,
}: AtlasProps) {
  return (
    <View style={{ marginVertical: 18, position: 'relative' }}>
      {/* Header */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontFamily: TYPE.body,
            fontSize: 7.5,
            fontWeight: 'bold',
            color: C.ocean,
            textTransform: 'uppercase',
            letterSpacing: 2.5,
            marginBottom: 4,
          }}
        >
          Atlas
        </Text>
        <Text
          style={{
            fontFamily: TYPE.display,
            fontSize: 26,
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

      {/* The map field */}
      <View
        style={{
          position: 'relative',
          height: 360,
          backgroundColor: C.shell,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {/* Substrate — services-around-island */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: variant === 'orientation' ? 0.22 : 0.14,
          }}
        >
          <Image
            src={resolveAsset('/icons/picc/infographics/08-services-around-island.png')}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </View>

        {/* Constellation overlay */}
        <ConstellationPattern color={C.starGold} opacity={0.10} count={20} seed={101} />

        {/* Connectors — drawn before nodes */}
        {connectors.map(([a, b], i) => {
          const na = nodes[a]
          const nb = nodes[b]
          if (!na || !nb) return null
          const dx = nb.left - na.left
          const dy = nb.top - na.top
          const length = Math.sqrt(dx * dx + dy * dy)
          const angle = Math.atan2(dy, dx) * (180 / Math.PI)
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                top: `${na.top}%`,
                left: `${na.left}%`,
                width: `${length}%`,
                height: 0.5,
                backgroundColor: C.ocean,
                opacity: 0.25,
                transformOrigin: '0 0',
                transform: `rotate(${angle}deg)`,
              }}
            />
          )
        })}

        {/* Service nodes */}
        {nodes.map((node, i) => {
          const dotColor = SECTION[node.section].color
          const mag = node.magnitude ?? 2
          const dotSize = 5 + mag * 2 // 7 → 11pt
          const labelWidth = 90

          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                top: `${node.top}%`,
                left: `${node.left}%`,
                width: labelWidth,
                marginLeft: -labelWidth / 2,
                alignItems: 'center',
              }}
            >
              {/* Outer ring (a tribute to ConcentricDots motif, simplified) */}
              <View
                style={{
                  width: dotSize + 6,
                  height: dotSize + 6,
                  borderRadius: (dotSize + 6) / 2,
                  borderWidth: 0.5,
                  borderColor: dotColor,
                  opacity: variant === 'closing' ? 0.4 : 0.7,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Inner dot */}
                <View
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    backgroundColor: dotColor,
                    opacity: variant === 'closing' ? 0.65 : 0.95,
                  }}
                />
              </View>

              {/* Label */}
              <Text
                style={{
                  fontFamily: TYPE.body,
                  fontSize: 7,
                  fontWeight: mag === 3 ? 'bold' : 'normal',
                  color: dotColor,
                  textAlign: 'center',
                  marginTop: 4,
                  lineHeight: 1.15,
                  maxWidth: labelWidth,
                }}
              >
                {node.name}
              </Text>

              {node.note && (
                <Text
                  style={{
                    fontFamily: TYPE.hand,
                    fontSize: 9,
                    color: C.earth,
                    opacity: 0.7,
                    textAlign: 'center',
                    marginTop: 1,
                    maxWidth: labelWidth,
                  }}
                >
                  {node.note}
                </Text>
              )}
            </View>
          )
        })}
      </View>

      {caption && (
        <Text
          style={{
            fontFamily: TYPE.body,
            fontSize: 7,
            color: C.muted,
            textAlign: 'right',
            marginTop: 8,
            letterSpacing: 0.5,
          }}
        >
          {caption}
        </Text>
      )}
    </View>
  )
}
