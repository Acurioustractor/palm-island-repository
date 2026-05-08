import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { C } from '../theme'

interface StatBoxProps {
  value: string
  label: string
  color: string
  /** Visual variant */
  variant?: 'default' | 'large' | 'inline'
  /** Width override */
  width?: string
}

export const StatBox = ({
  value,
  label,
  color,
  variant = 'default',
  width = '48%',
}: StatBoxProps) => {
  if (variant === 'large') {
    // Large stat — for hero numbers
    return (
      <View
        wrap={false}
        style={{
          width,
          backgroundColor: C.white,
          borderRadius: 12,
          padding: 20,
          marginBottom: 10,
          borderTop: `4pt solid ${color}`,
        }}
      >
        <Text style={{ fontFamily: 'Caveat', fontSize: 44, fontWeight: 'bold', color, lineHeight: 0.9, marginBottom: 6 }}>
          {value}
        </Text>
        <Text style={{ fontSize: 9.5, color: C.driftwood, lineHeight: 1.4 }}>{label}</Text>
        <View style={{ width: 24, height: 2, backgroundColor: color, opacity: 0.3, marginTop: 10, borderRadius: 1 }} />
      </View>
    )
  }

  if (variant === 'inline') {
    // Inline stat — horizontal, compact
    return (
      <View
        wrap={false}
        style={{
          width,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: C.white,
          borderRadius: 8,
          padding: 12,
          marginBottom: 8,
        }}
      >
        <View style={{ width: 4, height: 28, backgroundColor: color, borderRadius: 2, marginRight: 12 }} />
        <View>
          <Text style={{ fontFamily: 'Caveat', fontSize: 24, fontWeight: 'bold', color, lineHeight: 1 }}>
            {value}
          </Text>
          <Text style={{ fontSize: 8, color: C.driftwood }}>{label}</Text>
        </View>
      </View>
    )
  }

  // Default stat box
  return (
    <View
      wrap={false}
      style={{
        width,
        backgroundColor: C.white,
        border: `1pt solid ${C.border}`,
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
        borderTop: `3pt solid ${color}`,
      }}
    >
      <Text style={{ fontFamily: 'Caveat', fontSize: 32, fontWeight: 'bold', color, marginBottom: 2 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 9, color: C.driftwood, lineHeight: 1.4 }}>{label}</Text>
    </View>
  )
}
