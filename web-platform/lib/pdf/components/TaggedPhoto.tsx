import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { C } from '../theme';
import type { ELPhoto } from '@/lib/media/el-photos';

/**
 * Consent-aware photo for React PDF. Any ELPhoto handed in has already cleared
 * elder_approved + consent_obtained server-side in EL v2. If no photo is
 * available for the slot, renders a neutral placeholder — never invents or
 * falls back to an unapproved image.
 */

interface TaggedPhotoProps {
  photo: ELPhoto | null;
  width?: number | string;
  height?: number;
  mode?: 'cultural' | 'editorial' | 'operational';
  caption?: string;
  fallbackLabel?: string;
}

export const TaggedPhoto = ({
  photo,
  width = '100%',
  height = 240,
  mode = 'editorial',
  caption,
  fallbackLabel = 'Photo pending cultural approval',
}: TaggedPhotoProps) => {
  if (!photo?.url) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: C.shell,
          borderRadius: mode === 'operational' ? 8 : 0,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: C.border,
          borderStyle: 'dashed',
        }}
      >
        <Text style={{ fontSize: 8, color: C.muted, letterSpacing: 1 }}>
          {fallbackLabel.toUpperCase()}
        </Text>
      </View>
    );
  }

  const capText = caption ?? photo.caption ?? photo.alt_text ?? null;
  const attribution = photo.attribution;

  return (
    <View style={{ width }}>
      <Image
        src={photo.url}
        style={{
          width: '100%',
          height,
          objectFit: 'cover',
          borderRadius: mode === 'operational' ? 8 : 0,
        }}
      />
      {mode === 'editorial' && (capText || attribution) && (
        <Text
          style={{
            fontSize: 7.5,
            color: C.muted,
            marginTop: 6,
            fontStyle: 'italic',
          }}
        >
          {capText}
          {attribution ? ` — ${attribution}` : ''}
        </Text>
      )}
    </View>
  );
};
