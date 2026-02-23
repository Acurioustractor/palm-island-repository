import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { C } from '../theme'

interface CardProps {
  title: string
  description: string
  badge?: string
  color?: string
  width?: string
  /** Optional hero image at top of card */
  imageUrl?: string
  /** Visual variant */
  variant?: 'default' | 'featured' | 'compact'
}

export const Card = ({
  title,
  description,
  badge,
  color = C.ocean,
  width = '48%',
  imageUrl,
  variant = 'default',
}: CardProps) => {
  if (variant === 'featured') {
    // Featured card — full-width with image, bolder treatment
    return (
      <View
        wrap={false}
        style={{
          width,
          backgroundColor: C.white,
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 12,
          borderBottom: `4pt solid ${color}`,
        }}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            style={{
              width: '100%',
              height: 90,
              objectFit: 'cover',
            }}
          />
        )}
        <View style={{ padding: 16 }}>
          {badge && (
            <View
              style={{
                backgroundColor: color,
                borderRadius: 4,
                paddingVertical: 2,
                paddingHorizontal: 8,
                alignSelf: 'flex-start',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 7, fontWeight: 'bold', color: C.white, textTransform: 'uppercase', letterSpacing: 1 }}>
                {badge}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: C.ocean, marginBottom: 4 }}>
            {title}
          </Text>
          <Text style={{ fontSize: 8.5, color: C.driftwood, lineHeight: 1.55 }}>
            {description}
          </Text>
        </View>
      </View>
    )
  }

  if (variant === 'compact') {
    // Compact card — smaller padding, tighter
    return (
      <View
        wrap={false}
        style={{
          width,
          backgroundColor: C.white,
          borderRadius: 6,
          padding: 10,
          marginBottom: 6,
          borderLeft: `3pt solid ${color}`,
        }}
      >
        <Text style={{ fontSize: 9, fontWeight: 'bold', color: C.ocean, marginBottom: 2 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 8, color: C.driftwood, lineHeight: 1.4 }}>
          {description}
        </Text>
        {badge && (
          <Text style={{ fontSize: 7, color, fontWeight: 'bold', marginTop: 4 }}>
            {badge}
          </Text>
        )}
      </View>
    )
  }

  // Default card
  return (
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
      <Text style={{ fontSize: 10, fontWeight: 'bold', color: C.ocean, marginBottom: 4 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 8.5, color: C.driftwood, lineHeight: 1.5, marginBottom: 6 }}>
        {description}
      </Text>
      {badge && (
        <View style={{ backgroundColor: C.shell, borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8, alignSelf: 'flex-start' }}>
          <Text style={{ fontSize: 7.5, fontWeight: 'semibold', color }}>{badge}</Text>
        </View>
      )}
    </View>
  )
}
