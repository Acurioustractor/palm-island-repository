/**
 * Constellation pattern — scattered dots at varying sizes representing
 * "many tribes, one people" (Bwgcolman). Used as subtle page backgrounds.
 */
import { View } from '@react-pdf/renderer'
import { C } from '../theme'

interface ConstellationPatternProps {
  /** Dot color */
  color?: string
  /** Overall opacity for the pattern */
  opacity?: number
  /** Number of dots to scatter */
  count?: number
  /** Random seed for deterministic layout */
  seed?: number
}

/** Simple seeded PRNG for deterministic dot placement */
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

export function ConstellationPattern({
  color = C.starGold,
  opacity = 0.06,
  count = 12,
  seed = 42,
}: ConstellationPatternProps) {
  const rand = seededRandom(seed)
  const dots = Array.from({ length: count }, () => ({
    top: `${rand() * 90 + 5}%`,
    left: `${rand() * 90 + 5}%`,
    size: 1.5 + rand() * 3,
  }))

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {dots.map((dot, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            borderRadius: dot.size / 2,
            backgroundColor: color,
            opacity,
          }}
        />
      ))}
    </View>
  )
}
