/**
 * ArcDots — On-brand decorative element inspired by the PICC logo's
 * curved dot trail that arcs around the turtle.
 *
 * Renders a quarter-arc or half-arc trail of dots, diminishing in size
 * along the path. Perfect for corner accents on pages.
 */
import React from 'react'
import { Svg, Circle } from '@react-pdf/renderer'
import { C } from '../theme'

interface ArcDotsProps {
  /** X position (absolute) */
  x: number
  /** Y position (absolute) */
  y: number
  /** Arc radius */
  radius?: number
  /** Start angle in degrees (0 = right, 90 = bottom) */
  startAngle?: number
  /** End angle in degrees */
  endAngle?: number
  /** Number of dots along the arc */
  dotCount?: number
  /** Primary color */
  color?: string
  /** Opacity */
  opacity?: number
  /** Starting dot size (diminishes along arc) */
  dotSize?: number
  /** Number of parallel arc trails */
  trails?: number
  /** Gap between parallel trails */
  trailGap?: number
}

export const ArcDots = ({
  x,
  y,
  radius = 40,
  startAngle = 0,
  endAngle = 90,
  dotCount = 12,
  color = C.purple,
  opacity = 0.12,
  dotSize = 2.5,
  trails = 2,
  trailGap = 8,
}: ArcDotsProps) => {
  const maxR = radius + (trails - 1) * trailGap + dotSize
  const size = maxR * 2 + dotSize * 2

  const dots: Array<{ cx: number; cy: number; r: number; o: number }> = []

  for (let trail = 0; trail < trails; trail++) {
    const trailRadius = radius + trail * trailGap
    const trailDots = dotCount + trail * 2 // More dots on outer trail
    const trailOpacity = opacity * (1 - trail * 0.2)

    for (let i = 0; i < trailDots; i++) {
      const t = i / (trailDots - 1)
      const angleDeg = startAngle + t * (endAngle - startAngle)
      const angleRad = (angleDeg * Math.PI) / 180
      // Dot size diminishes from start to end of arc
      const ds = dotSize * (1 - t * 0.4) - trail * 0.3

      dots.push({
        cx: size / 2 + trailRadius * Math.cos(angleRad),
        cy: size / 2 + trailRadius * Math.sin(angleRad),
        r: Math.max(ds, 0.6),
        o: trailOpacity * (1 - t * 0.3), // Fade along arc
      })
    }
  }

  return (
    <Svg
      width={String(size)}
      height={String(size)}
      style={{ position: 'absolute', left: x - size / 2, top: y - size / 2 }}
    >
      {dots.map((dot, i) => (
        <Circle
          key={i}
          cx={String(dot.cx)}
          cy={String(dot.cy)}
          r={String(dot.r)}
          fill={color}
          opacity={String(dot.o)}
        />
      ))}
    </Svg>
  )
}
