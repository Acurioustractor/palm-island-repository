/**
 * Lantern — the hush of the exhibition.
 *
 * An Elder quote presented as if lit from within. Always full-bleed left or
 * right edge, never centred — Elders speak from the side of the room, not
 * the lectern.
 *
 * Anatomy:
 *   - elder-quote-wash filling the panel
 *   - A single ConcentricDots-style cluster top-left as anchor (turtle red)
 *   - The quote in PlayfairDisplay italic at 28pt with generous leading
 *   - Attribution in Caveat beneath
 *   - Named consent line in Inter 7pt at the foot
 *
 * **Invariant by design.** Lanterns refuse section colour — the wash stays
 * warm-ochre regardless of which section's room they sit inside. This is
 * the cultural rule made visible. Do not parameterise it away.
 *
 * Used 4 times in the report: pages 3, 11, 17, 22. Each Lantern is one of
 * the report's slow rooms — the visitor pauses.
 */
import { View, Text, Image } from '@react-pdf/renderer'
import { C, TYPE } from '../../theme'
import { resolveAsset } from '../../asset-resolver'

interface LanternProps {
  /** The Elder's quote. Verbatim. With consent. */
  quote: string

  /** Elder's name (with title — Aunty / Uncle as the Elder uses). */
  name: string

  /** Role / cultural standing — short. e.g. "Bwgcolman Elder · Stolen Generations descendant" */
  role: string

  /**
   * Side of the page the lantern sits on.
   *   'left'  — full-bleed off the left edge
   *   'right' — full-bleed off the right edge
   * Centred is not an option. Elders speak from the side of the room.
   */
  side?: 'left' | 'right'

  /** Optional date of recording. */
  date?: string

  /** Cultural review status — small footer. Default reflects validated/public. */
  consent?: string

  /** Optional Elder portrait — if provided, sits as a small inset (not large; the quote leads). */
  portraitUrl?: string

  /** Pull the panel inward by this many points so the page flow accommodates it. */
  inset?: number
}

export function Lantern({
  quote,
  name,
  role,
  side = 'left',
  date,
  consent = 'Recorded with consent · Validated · Empathy Ledger',
  portraitUrl,
  inset = 0,
}: LanternProps) {
  return (
    <View
      style={{
        position: 'relative',
        marginVertical: 18,
        // Full-bleed off the chosen side using negative margin.
        // Standard A4 has 50pt page padding; we extend 50pt past it.
        marginLeft: side === 'left' ? -50 + inset : 0,
        marginRight: side === 'right' ? -50 + inset : 0,
        backgroundColor: C.sand,
        paddingTop: 32,
        paddingBottom: 28,
        paddingLeft: side === 'left' ? 60 : 28,
        paddingRight: side === 'right' ? 60 : 28,
        // No border-radius on the bleed edge — feel like the panel is part of the page edge.
        borderTopLeftRadius: side === 'left' ? 0 : 4,
        borderBottomLeftRadius: side === 'left' ? 0 : 4,
        borderTopRightRadius: side === 'right' ? 0 : 4,
        borderBottomRightRadius: side === 'right' ? 0 : 4,
      }}
    >
      {/* Elder-quote-wash substrate at low opacity — the lantern's interior light */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.18,
        }}
      >
        <Image
          src={resolveAsset('/icons/picc/infographics/07-elder-quote-wash.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </View>

      {/* Anchor cluster — small ring of dots top-left in turtle red */}
      <View
        style={{
          position: 'absolute',
          top: 14,
          left: side === 'left' ? 22 : 14,
          width: 28,
          height: 28,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignContent: 'space-between',
          justifyContent: 'space-between',
          opacity: 0.65,
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 3,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: C.turtleRed,
              margin: 1,
            }}
          />
        ))}
      </View>

      {/* The quote — large, serif italic, generous leading */}
      <View style={{ paddingTop: 28, paddingBottom: 12 }}>
        {/* Opening quotation mark — large, decorative */}
        <Text
          style={{
            fontFamily: TYPE.display,
            fontSize: 56,
            color: C.turtleRed,
            opacity: 0.4,
            lineHeight: 0.7,
            marginBottom: -8,
          }}
        >
          “
        </Text>

        <Text
          style={{
            fontFamily: TYPE.display,
            fontSize: 22,
            color: C.earth,
            lineHeight: 1.45,
            fontStyle: 'italic',
            maxWidth: 420,
          }}
        >
          {quote}
        </Text>
      </View>

      {/* Attribution — Caveat hand */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 6,
        }}
      >
        {/* Optional small portrait inset — discreet */}
        {portraitUrl && (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              overflow: 'hidden',
              marginRight: 12,
            }}
          >
            <Image
              src={resolveAsset(portraitUrl)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </View>
        )}

        <View>
          <Text
            style={{
              fontFamily: TYPE.hand,
              fontSize: 16,
              color: C.turtleRed,
              opacity: 0.85,
              lineHeight: 1.1,
            }}
          >
            — {name}
          </Text>
          <Text
            style={{
              fontFamily: TYPE.body,
              fontSize: 8,
              color: C.driftwood,
              marginTop: 2,
            }}
          >
            {role}
            {date && ` · ${date}`}
          </Text>
        </View>
      </View>

      {/* Cultural-review footer — very quiet, the protocol made visible */}
      <Text
        style={{
          fontFamily: TYPE.body,
          fontSize: 6.5,
          color: C.muted,
          marginTop: 18,
          letterSpacing: 0.5,
          maxWidth: 380,
        }}
      >
        {consent}
      </Text>
    </View>
  )
}
