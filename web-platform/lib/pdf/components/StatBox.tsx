import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { C } from '../theme'

export const StatBox = ({ value, label, color }: { value: string; label: string; color: string }) => (
  <View
    wrap={false}
    style={{
      width: '48%',
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
    <Text style={{ fontSize: 9, color: C.textSecondary, lineHeight: 1.4 }}>{label}</Text>
  </View>
)
