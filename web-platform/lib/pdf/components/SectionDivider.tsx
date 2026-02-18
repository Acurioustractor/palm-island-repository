/**
 * SectionDivider — On-brand section separator inspired by the PICC logo.
 *
 * A horizontal line of dots that gradually scales up to a center point
 * then back down, creating a gentle diamond/lens shape in dot form.
 * Elegant, simple, distinctively PICC.
 */
import React from 'react'
import { Svg, Circle } from '@react-pdf/renderer'
import { C } from '../theme'

interface SectionDividerProps {
  /** Total width */
  width?: number
  /** Primary color */
  color?: string
  /** Opacity */
  opacity?: number
  /** Number of dots */
  dotCount?: number
  /** Style override */
  style?: object
}

export const SectionDivider = ({
  width = 120,
  color = C.purple,
  opacity = 0.2,
  dotCount = 9,
  style,
}: SectionDividerProps) => {
  const height = 16
  const midPoint = Math.floor(dotCount / 2)
  const spacing = width / (dotCount + 1)

  return (
    <Svg width={String(width)} height={String(height)} style={{ marginVertical: 12, ...style }}>
      {Array.from({ length: dotCount }).map((_, i) => {
        // Scale dots: smallest at edges, largest in center
        const distFromCenter = Math.abs(i - midPoint) / midPoint
        const dotRadius = 1.2 + (1 - distFromCenter) * 1.8
        const dotOpacity = opacity * (0.5 + (1 - distFromCenter) * 0.5)

        return (
          <Circle
            key={i}
            cx={String(spacing * (i + 1))}
            cy={String(height / 2)}
            r={String(dotRadius)}
            fill={color}
            opacity={String(dotOpacity)}
          />
        )
      })}
    </Svg>
  )
}
