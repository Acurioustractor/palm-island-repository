/**
 * Corner bracket decoratives — thin L-shaped frames at page/section corners.
 * Inspired by the Catalis/SuperDesign treatment.
 */
import { View } from '@react-pdf/renderer'
import { C } from '../theme'

interface CornerBracketsProps {
  /** Size of each bracket arm in pt */
  size?: number
  /** Border thickness */
  thickness?: number
  /** Color of the brackets */
  color?: string
  /** Opacity */
  opacity?: number
  /** Inset from the container edges */
  inset?: number
  /** Which corners to show (default: all four) */
  corners?: ('tl' | 'tr' | 'bl' | 'br')[]
}

export function CornerBrackets({
  size = 30,
  thickness = 1,
  color = C.reefDeep,
  opacity = 0.3,
  inset = 24,
  corners = ['tl', 'tr', 'bl', 'br'],
}: CornerBracketsProps) {
  const bracketBase = {
    position: 'absolute' as const,
    width: size,
    height: size,
    opacity,
  }

  return (
    <>
      {corners.includes('tl') && (
        <View
          style={{
            ...bracketBase,
            top: inset,
            left: inset,
            borderTopWidth: thickness,
            borderLeftWidth: thickness,
            borderColor: color,
          }}
        />
      )}
      {corners.includes('tr') && (
        <View
          style={{
            ...bracketBase,
            top: inset,
            right: inset,
            borderTopWidth: thickness,
            borderRightWidth: thickness,
            borderColor: color,
          }}
        />
      )}
      {corners.includes('bl') && (
        <View
          style={{
            ...bracketBase,
            bottom: inset,
            left: inset,
            borderBottomWidth: thickness,
            borderLeftWidth: thickness,
            borderColor: color,
          }}
        />
      )}
      {corners.includes('br') && (
        <View
          style={{
            ...bracketBase,
            bottom: inset,
            right: inset,
            borderBottomWidth: thickness,
            borderRightWidth: thickness,
            borderColor: color,
          }}
        />
      )}
    </>
  )
}
