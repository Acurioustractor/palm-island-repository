import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { C } from '../theme'

interface PersonAvatarProps {
  photoUrl: string | null
  name: string
  size?: number
  color?: string
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const PersonAvatar = ({
  photoUrl,
  name,
  size = 48,
  color = C.blue,
}: PersonAvatarProps) => {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          objectFit: 'cover',
        }}
      />
    )
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: size * 0.38,
          fontWeight: 'bold',
          color: C.white,
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  )
}
