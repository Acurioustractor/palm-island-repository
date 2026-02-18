/**
 * Reef gradient bar — horizontal progress/accent bar in reef tones.
 * Used for stat visualizations and section accents.
 */
import { View } from '@react-pdf/renderer'
import { C } from '../theme'

interface ReefGradientBarProps {
  /** Width as percentage (0-100) or fixed pt */
  width?: number | string
  /** Height of the bar */
  height?: number
  /** Border radius */
  radius?: number
  /** Top accent bar (thin 3pt colored strip) */
  accentOnly?: boolean
  /** Accent color */
  color?: string
}

export function ReefGradientBar({
  width = '100%',
  height = 6,
  radius = 3,
  accentOnly = false,
  color = C.reefDeep,
}: ReefGradientBarProps) {
  if (accentOnly) {
    return (
      <View
        style={{
          width,
          height: 3,
          backgroundColor: color,
          borderRadius: 1.5,
        }}
      />
    )
  }

  return (
    <View
      style={{
        width: '100%',
        height,
        backgroundColor: C.bgLight,
        borderRadius: radius,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width,
          height: '100%',
          backgroundColor: color,
          borderRadius: radius,
        }}
      />
    </View>
  )
}
