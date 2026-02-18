import React from 'react'
import { Svg, Defs, LinearGradient, Stop, Rect } from '@react-pdf/renderer'
import { C } from '../theme'

export const GradientBar = ({ width = 80 }: { width?: number }) => (
  <Svg width={width} height={4} style={{ marginBottom: 12 }}>
    <Defs>
      <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor={C.blue} />
        <Stop offset="100%" stopColor={C.purple} />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width={String(width)} height="4" rx="2" fill="url(#grad)" />
  </Svg>
)
