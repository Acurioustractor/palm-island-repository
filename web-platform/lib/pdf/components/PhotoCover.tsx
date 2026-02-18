import React from 'react'
import {
  Page,
  Text,
  View,
  Image,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from '@react-pdf/renderer'
import { C, A4_W, A4_H, MARGIN, baseStyles } from '../theme'
import { PageNumber } from './PageNumber'
import { DotPattern } from './DotPattern'
import { WaveDecoration } from './WaveDecoration'

interface PhotoCoverProps {
  photoUrl: string | null
  title: string
  subtitle: string
  year: string
  logoUrl?: string
}

export const PhotoCover = ({
  photoUrl,
  title,
  subtitle,
  year,
  logoUrl = '/logo/picc-logo-full.png',
}: PhotoCoverProps) => (
  <Page size="A4" style={baseStyles.pageBleed}>
    {photoUrl ? (
      <>
        {/* Full-bleed community photo */}
        <Image
          src={photoUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: A4_W,
            height: A4_H,
            objectFit: 'cover',
          }}
        />
        {/* Dark gradient overlay from bottom for text legibility */}
        <Svg
          width={String(A4_W)}
          height={String(A4_H)}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <Defs>
            <LinearGradient id="photoOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#000000" stopOpacity={0.15} />
              <Stop offset="40%" stopColor="#000000" stopOpacity={0.1} />
              <Stop offset="70%" stopColor="#000000" stopOpacity={0.55} />
              <Stop offset="100%" stopColor="#000000" stopOpacity={0.85} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={String(A4_W)} height={String(A4_H)} fill="url(#photoOverlay)" />
        </Svg>
      </>
    ) : (
      <>
        {/* Fallback: SVG gradient cover (blue → purple) */}
        <Svg
          width={String(A4_W)}
          height={String(A4_H)}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <Defs>
            <LinearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={C.blueDark} />
              <Stop offset="60%" stopColor={C.blueDeep} />
              <Stop offset="100%" stopColor={C.purpleDark} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={String(A4_W)} height={String(A4_H)} fill="url(#coverGrad)" />
        </Svg>
        <DotPattern x={A4_W - 120} y={80} rows={6} cols={8} color={C.white} opacity={0.1} />
        <DotPattern x={40} y={A4_H - 260} rows={4} cols={5} color={C.white} opacity={0.08} />
        <WaveDecoration color={C.white} y={0} />
      </>
    )}

    {/* Logo */}
    <Image
      src={logoUrl}
      style={{
        position: 'absolute',
        top: 50,
        left: MARGIN,
        width: 120,
        height: 60,
      }}
    />

    {/* Title block */}
    <View
      style={{
        position: 'absolute',
        bottom: 120,
        left: MARGIN,
        right: MARGIN,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: C.white,
          opacity: 0.9,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        {subtitle}
      </Text>
      <Text
        style={{
          fontFamily: 'Caveat',
          fontSize: 44,
          fontWeight: 'bold',
          color: C.white,
          marginBottom: 8,
          lineHeight: 1.1,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: C.white,
          marginTop: 12,
          letterSpacing: 2,
        }}
      >
        {year}
      </Text>
    </View>

    <PageNumber />
  </Page>
)
