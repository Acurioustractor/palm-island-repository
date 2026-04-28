/**
 * MarginNote — the curator's hand-written note in the margin.
 *
 * Anatomy:
 *   - A single line of Caveat in Earth or Ochre
 *   - A small ArcDots motif as a "see also" mark
 *   - Optional thin connector hairline to the thing it annotates
 *
 * Never longer than 12 words. Used 1-2 times per spread, never on cartouche
 * pages or lantern pages — the margin note is the curator's whisper, and
 * cartouches and lanterns are too sacred for whispers.
 *
 * The most consistent voice in the report — one hand, one tone, throughout.
 */
import { View, Text } from '@react-pdf/renderer'
import { C, TYPE } from '../../theme'

interface MarginNoteProps {
  /** The note. Max 12 words. Caveat italic feel. */
  text: string
  /** Ink colour — Earth or Ochre. Default: Earth. */
  color?: 'earth' | 'ochre'
  /** Position — anchors the note to a page edge. */
  align?: 'left' | 'right' | 'centre'
  /** Optional hairline connector — pulls the eye to what's annotated. */
  connector?: boolean
}

export function MarginNote({
  text,
  color = 'earth',
  align = 'left',
  connector = false,
}: MarginNoteProps) {
  const ink = color === 'ochre' ? C.ochre : C.earth

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        alignSelf:
          align === 'right' ? 'flex-end' : align === 'centre' ? 'center' : 'flex-start',
        maxWidth: 220,
        marginVertical: 8,
      }}
    >
      {/* See-also mark — three diminishing dots, hand-drawn rhythm */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 6,
          marginRight: 8,
        }}
      >
        <View
          style={{
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: ink,
            opacity: 0.55,
          }}
        />
        <View
          style={{
            width: 2.5,
            height: 2.5,
            borderRadius: 1.25,
            backgroundColor: ink,
            opacity: 0.4,
            marginLeft: 3,
          }}
        />
        <View
          style={{
            width: 2,
            height: 2,
            borderRadius: 1,
            backgroundColor: ink,
            opacity: 0.25,
            marginLeft: 3,
          }}
        />
      </View>

      {/* The note */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: TYPE.hand,
            fontSize: 13,
            color: ink,
            lineHeight: 1.25,
            opacity: 0.85,
          }}
        >
          {text}
        </Text>

        {/* Optional connector — tiny hairline beneath */}
        {connector && (
          <View
            style={{
              width: 32,
              height: 0.5,
              backgroundColor: ink,
              opacity: 0.4,
              marginTop: 4,
            }}
          />
        )}
      </View>
    </View>
  )
}
