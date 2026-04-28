/**
 * Fold — a consented, named photograph treated as a museum plate.
 *
 * Anatomy:
 *   - PhotoCover or TaggedPhoto image (consented, named)
 *   - CornerBrackets framing
 *   - Caveat caption ranged left beneath
 *   - Named consent in Inter 7pt at base-right
 *   - Thin GradientBar in section colour beneath the caption
 *
 * Three sub-shapes:
 *   - 'portrait' — closer crop, name larger (PersonAvatar register)
 *   - 'landscape' — wider gradient bar (place/event register)
 *   - 'country' — no person attribution, place-name in Caveat
 *
 * Used 18 times across the report — every photo gap fills a Fold.
 * Two folds per spread maximum, never three.
 *
 * The Fold is the only element that lets the user swap the photo without
 * disturbing the layout. Pass `photoUrl` and the museum frame holds.
 */
import { View, Text, Image } from '@react-pdf/renderer'
import { C, TYPE, SECTION, type SectionKey } from '../../theme'
import { CornerBrackets } from '../CornerBrackets'
import { resolveAsset } from '../../asset-resolver'

interface FoldProps {
  /** Path to the photograph. Required. */
  photoUrl: string

  /** Caveat caption — what the photo shows, in the curator's hand. */
  caption: string

  /** Section the fold belongs to. Drives bracket and gradient bar colour. */
  section: SectionKey

  /**
   * Three sub-shapes:
   *   'portrait'  — square crop, name larger
   *   'landscape' — 3:2 crop, wider gradient bar
   *   'country'   — landscape, no person attribution, place-name only
   */
  shape?: 'portrait' | 'landscape' | 'country'

  /** Subject's name — shown for portrait + landscape, hidden for country. */
  name?: string

  /** Place name — shown for country shape only. */
  place?: string

  /**
   * Named consent footer — the line that makes the cultural protocol visible.
   * Default: "Recorded with consent · Empathy Ledger"
   */
  consent?: string

  /** Width override. Default: 100%. */
  width?: string | number

  /** Height override. Defaults vary by shape. */
  height?: number

  /** Date of capture, optional small footer alongside consent. */
  date?: string
}

export function Fold({
  photoUrl,
  caption,
  section,
  shape = 'landscape',
  name,
  place,
  consent = 'Recorded with consent · Empathy Ledger',
  width = '100%',
  height,
  date,
}: FoldProps) {
  const accent = SECTION[section].color

  // Default heights by shape — A4 portrait page has ~720pt content area
  const photoHeight =
    height ?? (shape === 'portrait' ? 200 : shape === 'country' ? 170 : 180)

  const photoAspectStyle =
    shape === 'portrait'
      ? { width: '100%', height: photoHeight }
      : { width: '100%', height: photoHeight }

  return (
    <View style={{ width, marginVertical: 14, position: 'relative' }}>
      {/* Photo — sits inside an inset that gives the corner brackets room */}
      <View
        style={{
          position: 'relative',
          ...photoAspectStyle,
          overflow: 'hidden',
        }}
      >
        <Image
          src={resolveAsset(photoUrl)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Corner brackets sit on top of the photo at slight inset */}
        <CornerBrackets
          size={20}
          thickness={0.75}
          color={C.white}
          opacity={0.85}
          inset={8}
        />
      </View>

      {/* Caption row — Caveat ranged left + consent metadata ranged right */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginTop: 8,
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          {/* The caveat hand-caption */}
          <Text
            style={{
              fontFamily: TYPE.hand,
              fontSize: 14,
              color: C.earth,
              opacity: 0.85,
              lineHeight: 1.25,
            }}
          >
            {caption}
          </Text>

          {/* Optional name (portrait/landscape) or place (country) */}
          {shape !== 'country' && name && (
            <Text
              style={{
                fontFamily: TYPE.body,
                fontSize: 9,
                fontWeight: 'bold',
                color: C.rock,
                marginTop: 4,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {name}
            </Text>
          )}

          {shape === 'country' && place && (
            <Text
              style={{
                fontFamily: TYPE.hand,
                fontSize: 13,
                color: accent,
                opacity: 0.75,
                marginTop: 2,
              }}
            >
              — {place}
            </Text>
          )}
        </View>

        {/* Consent + date — small, right-aligned */}
        <View style={{ alignItems: 'flex-end', maxWidth: 170 }}>
          <Text
            style={{
              fontFamily: TYPE.body,
              fontSize: 6.5,
              color: C.muted,
              textAlign: 'right',
              lineHeight: 1.4,
            }}
          >
            {consent}
          </Text>
          {date && (
            <Text
              style={{
                fontFamily: TYPE.body,
                fontSize: 6.5,
                color: C.muted,
                textAlign: 'right',
                marginTop: 1,
              }}
            >
              {date}
            </Text>
          )}
        </View>
      </View>

      {/* Gradient bar — width varies by shape */}
      <View
        style={{
          marginTop: 10,
          width: shape === 'landscape' ? '100%' : shape === 'country' ? '70%' : '40%',
          height: 1.5,
          backgroundColor: accent,
          opacity: 0.5,
        }}
      />
    </View>
  )
}

/**
 * FoldPair — two folds side by side. Common spread arrangement.
 */
interface FoldPairProps {
  left: Omit<FoldProps, 'width'>
  right: Omit<FoldProps, 'width'>
}

export function FoldPair({ left, right }: FoldPairProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 14,
      }}
    >
      <View style={{ width: '48%' }}>
        <Fold {...left} width="100%" />
      </View>
      <View style={{ width: '48%' }}>
        <Fold {...right} width="100%" />
      </View>
    </View>
  )
}
