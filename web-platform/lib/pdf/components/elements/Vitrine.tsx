/**
 * Vitrine — the display case. A single fact, figure, service, or program
 * presented as if behind glass.
 *
 * Anatomy:
 *   - CornerBrackets always (in section colour at 60%)
 *   - A single number or short phrase set in PlayfairDisplay
 *   - A one-line caption in Inter
 *   - A hairline GradientBar beneath
 *   - No background fill — page paper shows through (the brackets are the frame,
 *     the white space is the glass)
 *
 * Used as a triptych on every section opener — three vitrines side by side.
 * Pages 4, 7, 10, 13, 16, 19 carry vitrine triptychs after the cartouche.
 *
 * Variants:
 *   - section colour drives bracket hue
 *   - Elder voice variant: brackets become ConcentricDots in upper-left only
 *   - Community voice variant: brackets stay; bar becomes WaveLine
 */
import { View, Text } from '@react-pdf/renderer'
import { C, TYPE, SECTION, type SectionKey } from '../../theme'
import { CornerBrackets } from '../CornerBrackets'

interface VitrineProps {
  /** The big number or short phrase. */
  value: string
  /** What the number means — short, restrained. */
  label: string
  /** Optional secondary caption beneath the label. */
  caption?: string
  /** Section the vitrine belongs to — drives the bracket colour. */
  section: SectionKey
  /**
   * Visual variant.
   *   'standard' — corner brackets at 60% (default)
   *   'elder'    — concentric dots upper-left only (Elder voice register)
   *   'community'— corner brackets + wave line beneath (Community voice register)
   */
  variant?: 'standard' | 'elder' | 'community'
  /** Override width — useful when laying out triptychs vs. quartets. */
  width?: string | number
}

export function Vitrine({
  value,
  label,
  caption,
  section,
  variant = 'standard',
  width = '31%',
}: VitrineProps) {
  const accent = SECTION[section].color

  return (
    <View
      style={{
        position: 'relative',
        width,
        minHeight: 110,
        paddingVertical: 20,
        paddingHorizontal: 12,
        // No background fill — the page paper is the glass
      }}
    >
      {/* Variant: Elder — small ring of dots upper-left, references the logo's concentric circles */}
      {variant === 'elder' && (
        <View
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: 22,
            height: 22,
            opacity: 0.55,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignContent: 'space-between',
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 2.5,
                height: 2.5,
                borderRadius: 1.25,
                backgroundColor: C.turtleRed,
                margin: 1,
              }}
            />
          ))}
        </View>
      )}

      {/* Variant: standard or community — full corner brackets */}
      {variant !== 'elder' && (
        <CornerBrackets
          size={18}
          thickness={0.75}
          color={accent}
          opacity={0.6}
          inset={0}
        />
      )}

      {/* Value */}
      <Text
        style={{
          fontFamily: TYPE.display,
          fontSize: 36,
          fontWeight: 'bold',
          color: accent,
          textAlign: 'center',
          lineHeight: 1.0,
        }}
      >
        {value}
      </Text>

      {/* Label */}
      <Text
        style={{
          fontFamily: TYPE.body,
          fontSize: 8.5,
          color: C.driftwood,
          textAlign: 'center',
          marginTop: 12,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          lineHeight: 1.3,
        }}
      >
        {label}
      </Text>

      {/* Optional secondary caption */}
      {caption && (
        <Text
          style={{
            fontFamily: TYPE.hand,
            fontSize: 11,
            color: C.earth,
            opacity: 0.7,
            textAlign: 'center',
            marginTop: 6,
            lineHeight: 1.2,
          }}
        >
          {caption}
        </Text>
      )}

      {/* Hairline beneath — bar in standard, wave in community */}
      <View
        style={{
          marginTop: 12,
          width: '40%',
          alignSelf: 'center',
          height: variant === 'community' ? 0.5 : 1,
          backgroundColor: accent,
          opacity: variant === 'community' ? 0.35 : 0.6,
        }}
      />
    </View>
  )
}

/**
 * VitrineTriptych — the standard arrangement of three vitrines side by side.
 * Used after every Cartouche.
 */
interface VitrineTriptychProps {
  vitrines: [VitrineData, VitrineData, VitrineData]
  section: SectionKey
}

interface VitrineData {
  value: string
  label: string
  caption?: string
}

export function VitrineTriptych({ vitrines, section }: VitrineTriptychProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 18,
      }}
    >
      {vitrines.map((v, i) => (
        <Vitrine
          key={i}
          value={v.value}
          label={v.label}
          caption={v.caption}
          section={section}
          width="31%"
        />
      ))}
    </View>
  )
}
