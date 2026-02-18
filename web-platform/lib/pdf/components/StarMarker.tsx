/**
 * Star marker — small 4-point star used as bullet points and milestone markers.
 * References the Kuling (Milky Way) and TSI flag star.
 */
import { Svg, Path } from '@react-pdf/renderer'

interface StarMarkerProps {
  /** Size of the star */
  size?: number
  /** Fill color */
  color?: string
}

export function StarMarker({ size = 6, color = '#FBBF24' }: StarMarkerProps) {
  // 4-point star path centered on 12x12 viewBox
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Path
        d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z"
        fill={color}
      />
    </Svg>
  )
}
