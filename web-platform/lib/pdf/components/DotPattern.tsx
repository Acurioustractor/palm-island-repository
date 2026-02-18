import React from 'react'
import { Svg, Circle } from '@react-pdf/renderer'
import { C } from '../theme'

export const DotPattern = ({
  x, y, rows = 4, cols = 6, color = C.purple, opacity = 0.15,
}: {
  x: number; y: number; rows?: number; cols?: number; color?: string; opacity?: number
}) => (
  <Svg
    width={String(cols * 12)}
    height={String(rows * 12)}
    style={{ position: 'absolute', left: x, top: y }}
  >
    {Array.from({ length: rows * cols }).map((_, i) => (
      <Circle
        key={i}
        cx={String((i % cols) * 12 + 3)}
        cy={String(Math.floor(i / cols) * 12 + 3)}
        r="2"
        fill={color}
        opacity={String(opacity)}
      />
    ))}
  </Svg>
)
