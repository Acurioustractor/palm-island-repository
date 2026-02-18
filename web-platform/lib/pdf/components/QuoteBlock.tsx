import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { C } from '../theme'

export const QuoteBlock = ({
  text, author, role, color = C.purple,
}: {
  text: string; author?: string; role?: string; color?: string
}) => (
  <View
    wrap={false}
    style={{
      borderLeft: `3pt solid ${color}`,
      paddingLeft: 16,
      paddingVertical: 12,
      marginBottom: 16,
    }}
  >
    <Text style={{ fontSize: 11, fontStyle: 'italic', color: C.textPrimary, lineHeight: 1.7, marginBottom: 6 }}>
      &ldquo;{text}&rdquo;
    </Text>
    {author && (
      <Text style={{ fontSize: 8.5, color: C.textSecondary }}>
        — {author}{role ? `, ${role}` : ''}
      </Text>
    )}
  </View>
)
