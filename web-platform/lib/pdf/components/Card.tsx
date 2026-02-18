import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { C } from '../theme'

export const Card = ({
  title, description, badge, color = C.blue, width = '48%',
}: {
  title: string; description: string; badge?: string; color?: string; width?: string
}) => (
  <View
    wrap={false}
    style={{
      width,
      backgroundColor: C.white,
      border: `1pt solid ${C.border}`,
      borderRadius: 8,
      padding: 14,
      marginBottom: 8,
      borderLeft: `3pt solid ${color}`,
    }}
  >
    <Text style={{ fontSize: 10, fontWeight: 'bold', color: C.blueDark, marginBottom: 4 }}>
      {title}
    </Text>
    <Text style={{ fontSize: 8.5, color: C.textSecondary, lineHeight: 1.5, marginBottom: 6 }}>
      {description}
    </Text>
    {badge && (
      <View style={{ backgroundColor: C.bgSection, borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8, alignSelf: 'flex-start' }}>
        <Text style={{ fontSize: 7.5, fontWeight: 'semibold', color }}>{badge}</Text>
      </View>
    )}
  </View>
)
