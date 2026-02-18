/**
 * Wave line divider — organic horizontal line used as section separator.
 * Rendered as a thin colored bar with optional gradient effect.
 */
import { View } from '@react-pdf/renderer'
import { C } from '../theme'

interface WaveLineProps {
  /** Width of the line (default: 100%) */
  width?: number | string
  /** Color of the line */
  color?: string
  /** Thickness */
  thickness?: number
  /** Vertical margin */
  marginVertical?: number
  /** Alignment */
  align?: 'left' | 'center' | 'right'
}

export function WaveLine({
  width = '100%',
  color = C.reefDeep,
  thickness = 0.75,
  marginVertical = 16,
  align = 'left',
}: WaveLineProps) {
  return (
    <View
      style={{
        width,
        height: thickness,
        backgroundColor: color,
        opacity: 0.2,
        marginVertical,
        ...(align === 'center' ? { alignSelf: 'center' } : {}),
        ...(align === 'right' ? { alignSelf: 'flex-end' } : {}),
      }}
    />
  )
}
