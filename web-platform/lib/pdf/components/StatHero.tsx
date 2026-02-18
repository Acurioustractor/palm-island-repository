/**
 * StatHero — massive stat number overlaid on or beside a photo.
 * The hero treatment from the Catalis-inspired Saltwater Country design.
 *
 * Variants:
 * - "overlay": Number on top of photo with gradient (like the 197 Staff card)
 * - "split": Number on one side, photo on the other (like 82% card)
 * - "plain": Large number with label, no photo (like $23.4M card)
 */
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { C } from '../theme'
import { CornerBrackets } from './CornerBrackets'

const styles = StyleSheet.create({
  overlay: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  overlayImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
  },
  overlayGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: C.reefDeep,
    opacity: 0.75,
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  split: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  splitPhoto: {
    width: '45%',
    objectFit: 'cover',
  },
  splitContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  plain: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  value: {
    fontFamily: 'PlayfairDisplay',
    fontWeight: 'bold',
    lineHeight: 0.85,
  },
  label: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: 6,
  },
  description: {
    fontSize: 8.5,
    lineHeight: 1.5,
    marginTop: 8,
  },
})

interface StatHeroProps {
  value: string
  label: string
  description?: string
  variant?: 'overlay' | 'split' | 'plain'
  /** Photo URL (required for overlay/split) */
  photo?: string
  /** Size of the value text in pt */
  valueSize?: number
  /** Color of the value */
  valueColor?: string
  /** Color of the label */
  labelColor?: string
  /** Height of the card (for overlay variant) */
  height?: number
  /** Accent color for decorative elements */
  accentColor?: string
  /** Background color (for plain variant) */
  bgColor?: string
}

export function StatHero({
  value,
  label,
  description,
  variant = 'plain',
  photo,
  valueSize = 72,
  valueColor,
  labelColor,
  height = 200,
  accentColor = C.reefBright,
  bgColor,
}: StatHeroProps) {
  if (variant === 'overlay' && photo) {
    return (
      <View style={[styles.overlay, { height }]}>
        <Image src={photo} style={styles.overlayImage} />
        <View style={styles.overlayGradient} />
        <View style={styles.overlayContent}>
          <Text style={[styles.value, { fontSize: valueSize, color: valueColor || C.white }]}>
            {value}
          </Text>
          <Text style={[styles.label, { color: labelColor || C.sand }]}>{label}</Text>
          {description && (
            <Text style={[styles.description, { color: C.sand, opacity: 0.9 }]}>{description}</Text>
          )}
        </View>
        <CornerBrackets color={C.white} opacity={0.4} size={20} inset={16} />
      </View>
    )
  }

  if (variant === 'split' && photo) {
    return (
      <View style={styles.split}>
        <Image src={photo} style={styles.splitPhoto} />
        <View style={styles.splitContent}>
          <Text style={[styles.value, { fontSize: valueSize, color: valueColor || C.reefDeep }]}>
            {value}
          </Text>
          <Text style={[styles.label, { color: labelColor || accentColor }]}>{label}</Text>
          {description && (
            <Text style={[styles.description, { color: C.driftwood }]}>{description}</Text>
          )}
          <View style={{ width: 24, height: 2, backgroundColor: accentColor, marginTop: 12 }} />
        </View>
      </View>
    )
  }

  // Plain variant
  return (
    <View style={[styles.plain, bgColor ? { backgroundColor: bgColor } : {}]}>
      <Text style={[styles.value, { fontSize: valueSize, color: valueColor || C.reefDeep }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: labelColor || accentColor }]}>{label}</Text>
      {description && (
        <Text style={[styles.description, { color: C.driftwood }]}>{description}</Text>
      )}
      <View style={{ width: 24, height: 2, backgroundColor: accentColor, marginTop: 12 }} />
    </View>
  )
}
