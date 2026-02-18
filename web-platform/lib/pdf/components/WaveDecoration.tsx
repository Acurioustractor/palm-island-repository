import React from 'react'
import { Svg, Path } from '@react-pdf/renderer'
import { C, A4_W } from '../theme'

export const WaveDecoration = ({ color = C.blue, y = 0 }: { color?: string; y?: number }) => (
  <Svg
    width={String(A4_W)}
    height="60"
    style={{ position: 'absolute', bottom: y, left: 0 }}
  >
    <Path
      d={`M0,30 Q${A4_W * 0.15},0 ${A4_W * 0.3},25 T${A4_W * 0.6},20 T${A4_W * 0.9},30 T${A4_W},25 L${A4_W},60 L0,60 Z`}
      fill={color}
      opacity="0.08"
    />
    <Path
      d={`M0,40 Q${A4_W * 0.2},20 ${A4_W * 0.35},35 T${A4_W * 0.65},30 T${A4_W},35 L${A4_W},60 L0,60 Z`}
      fill={color}
      opacity="0.05"
    />
  </Svg>
)
