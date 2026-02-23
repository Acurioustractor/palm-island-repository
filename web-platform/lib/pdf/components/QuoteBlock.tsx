import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { C } from '../theme'

interface QuoteBlockProps {
  text: string
  author?: string
  role?: string
  color?: string
  /** Optional portrait photo URL for the author */
  photoUrl?: string
  /** Visual variant */
  variant?: 'default' | 'large' | 'editorial'
}

export const QuoteBlock = ({
  text,
  author,
  role,
  color = C.ocean,
  photoUrl,
  variant = 'default',
}: QuoteBlockProps) => {
  if (variant === 'editorial') {
    // Large editorial pull-quote — Caveat font, centered, no border
    return (
      <View
        wrap={false}
        style={{
          paddingVertical: 20,
          paddingHorizontal: 24,
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'Caveat',
            fontSize: 22,
            color: C.ocean,
            lineHeight: 1.35,
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          &ldquo;{text}&rdquo;
        </Text>
        {author && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {photoUrl && (
              <Image
                src={photoUrl}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  objectFit: 'cover',
                  marginRight: 8,
                }}
              />
            )}
            <Text style={{ fontSize: 8.5, color: C.driftwood }}>
              — {author}{role ? `, ${role}` : ''}
            </Text>
          </View>
        )}
        {/* Ochre accent dash below */}
        <View
          style={{
            width: 32,
            height: 2,
            backgroundColor: C.ochre,
            marginTop: 12,
            borderRadius: 1,
          }}
        />
      </View>
    )
  }

  if (variant === 'large') {
    // Large quote with optional portrait — for Community Voices
    return (
      <View
        wrap={false}
        style={{
          flexDirection: 'row',
          marginBottom: 16,
          padding: 16,
          backgroundColor: C.white,
          borderRadius: 10,
          borderLeft: `4pt solid ${color}`,
        }}
      >
        {photoUrl && (
          <Image
            src={photoUrl}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              objectFit: 'cover',
              marginRight: 14,
            }}
          />
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              fontStyle: 'italic',
              color: C.rock,
              lineHeight: 1.7,
              marginBottom: 8,
            }}
          >
            &ldquo;{text}&rdquo;
          </Text>
          {author && (
            <Text style={{ fontSize: 8.5, color: C.driftwood, fontWeight: 'bold' }}>
              — {author}{role ? `, ${role}` : ''}
            </Text>
          )}
        </View>
      </View>
    )
  }

  // Default variant — left-border quote
  return (
    <View
      wrap={false}
      style={{
        borderLeft: `3pt solid ${color}`,
        paddingLeft: 16,
        paddingVertical: 12,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontStyle: 'italic',
          color: C.rock,
          lineHeight: 1.7,
          marginBottom: 6,
        }}
      >
        &ldquo;{text}&rdquo;
      </Text>
      {author && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {photoUrl && (
            <Image
              src={photoUrl}
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                objectFit: 'cover',
                marginRight: 8,
              }}
            />
          )}
          <Text style={{ fontSize: 8.5, color: C.driftwood }}>
            — {author}{role ? `, ${role}` : ''}
          </Text>
        </View>
      )}
    </View>
  )
}
