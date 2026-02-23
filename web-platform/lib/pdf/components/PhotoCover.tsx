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
import { ArcDots } from './ArcDots'

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
        {/* Dark gradient overlay — stronger at bottom for text, subtle vignette at top */}
        <Svg
          width={String(A4_W)}
          height={String(A4_H)}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <Defs>
            <LinearGradient id="photoOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#000000" stopOpacity={0.2} />
              <Stop offset="35%" stopColor="#000000" stopOpacity={0.05} />
              <Stop offset="60%" stopColor="#000000" stopOpacity={0.35} />
              <Stop offset="85%" stopColor="#000000" stopOpacity={0.75} />
              <Stop offset="100%" stopColor="#000000" stopOpacity={0.88} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={String(A4_W)} height={String(A4_H)} fill="url(#photoOverlay)" />
        </Svg>
      </>
    ) : (
      <>
        {/* Fallback: Ocean gradient cover */}
        <Svg
          width={String(A4_W)}
          height={String(A4_H)}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <Defs>
            <LinearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={C.ocean} />
              <Stop offset="60%" stopColor={C.ocean} />
              <Stop offset="100%" stopColor={C.midnight} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={String(A4_W)} height={String(A4_H)} fill="url(#coverGrad)" />
        </Svg>
        <DotPattern x={A4_W - 120} y={80} rows={6} cols={8} color={C.white} opacity={0.1} />
        <DotPattern x={40} y={A4_H - 260} rows={4} cols={5} color={C.white} opacity={0.08} />
        <WaveDecoration color={C.white} y={0} />
      </>
    )}

    {/* Decorative arc dots in top-right corner */}
    <ArcDots
      x={A4_W - 30}
      y={30}
      radius={50}
      startAngle={180}
      endAngle={270}
      dotCount={10}
      color={C.white}
      opacity={0.15}
      dotSize={2}
      trails={2}
      trailGap={10}
    />

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

    {/* Title block — positioned at bottom */}
    <View
      style={{
        position: 'absolute',
        bottom: 80,
        left: MARGIN,
        right: MARGIN,
      }}
    >
      {/* Subtitle / org name */}
      <Text
        style={{
          fontSize: 11,
          color: C.white,
          opacity: 0.85,
          letterSpacing: 3,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {subtitle}
      </Text>

      {/* Main title — large Caveat display */}
      <Text
        style={{
          fontFamily: 'Caveat',
          fontSize: 48,
          fontWeight: 'bold',
          color: C.white,
          lineHeight: 1.05,
          marginBottom: 12,
        }}
      >
        {title}
      </Text>

      {/* Year with ochre accent dash */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 32,
            height: 3,
            backgroundColor: C.ochre,
            borderRadius: 1.5,
            marginRight: 12,
          }}
        />
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: C.white,
            letterSpacing: 2,
          }}
        >
          {year}
        </Text>
      </View>
    </View>

    {/* Ochre accent bar at very bottom of page */}
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: C.ochre,
      }}
    />

    <PageNumber />
  </Page>
)
