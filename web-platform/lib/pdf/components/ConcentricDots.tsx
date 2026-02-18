/**
 * ConcentricDots — On-brand decorative element inspired by the PICC logo's
 * concentric dot circle motif (top-right of the sea turtle).
 *
 * Renders 2-3 concentric rings of evenly-spaced dots, radiating outward.
 * Uses brand colors: dark red (#8B1A1A), ochre (#C8963E), or the standard
 * blue/purple palette depending on context.
 */
import React from 'react'
import { Svg, Circle } from '@react-pdf/renderer'
import { C } from '../theme'

interface ConcentricDotsProps {
  /** Center X position (absolute) */
  x: number
  /** Center Y position (absolute) */
  y: number
  /** Number of concentric rings (2-4) */
  rings?: number
  /** Base radius of innermost ring */
  baseRadius?: number
  /** Gap between rings */
  ringGap?: number
  /** Dots per ring (more dots on outer rings) */
  dotsPerRing?: number
  /** Primary color for dots */
  color?: string
  /** Opacity (0-1) */
  opacity?: number
  /** Dot radius */
  dotSize?: number
}

export const ConcentricDots = ({
  x,
  y,
  rings = 3,
  baseRadius = 16,
  ringGap = 10,
  dotsPerRing = 8,
  color = C.purple,
  opacity = 0.12,
  dotSize = 2,
}: ConcentricDotsProps) => {
  const totalSize = (baseRadius + ringGap * rings) * 2 + dotSize * 2

  const dots: Array<{ cx: number; cy: number; r: number; o: number }> = []

  for (let ring = 0; ring < rings; ring++) {
    const radius = baseRadius + ring * ringGap
    const count = dotsPerRing + ring * 4 // More dots on outer rings
    const ringOpacity = opacity * (1 - ring * 0.15) // Fade outer rings slightly

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count
      dots.push({
        cx: totalSize / 2 + radius * Math.cos(angle),
        cy: totalSize / 2 + radius * Math.sin(angle),
        r: dotSize - ring * 0.3, // Slightly smaller dots on outer rings
        o: ringOpacity,
      })
    }
  }

  return (
    <Svg
      width={String(totalSize)}
      height={String(totalSize)}
      style={{ position: 'absolute', left: x - totalSize / 2, top: y - totalSize / 2 }}
    >
      {dots.map((dot, i) => (
        <Circle
          key={i}
          cx={String(dot.cx)}
          cy={String(dot.cy)}
          r={String(Math.max(dot.r, 0.8))}
          fill={color}
          opacity={String(dot.o)}
        />
      ))}
    </Svg>
  )
}
