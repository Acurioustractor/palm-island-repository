/**
 * ImpactSummary — PICC video composition with real photography.
 *
 * Scenes:
 *   1. Opening — hero photo with logo fade-in and Ken Burns zoom (0–5s)
 *   2. Title card — text over landscape photo with gradient overlay (5–10s)
 *   3. Stats — animated stat cards over dark gradient with photo background (10–25s)
 *   4. Photo montage — crossfade between community photos (25–40s)
 *   5. Quote — community voice over warm background (40–52s)
 *   6. Closing — sunset photo with logo + tagline (52–60s)
 */

import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  Easing,
} from 'remotion'
import { colors, fonts, spacing } from '../theme'

// ── Input Props ──────────────────────────────────────
export interface ImpactSummaryProps {
  title: string
  subtitle?: string
  year: string
  stats: Array<{ label: string; value: string; icon?: string }>
  quote?: { text: string; author: string | null }
  photos: string[]       // Array of photo URLs for montage + backgrounds
  logoUrl: string        // PICC logo
  orgName?: string
}

// ── Shared helpers ───────────────────────────────────

/** Ken Burns: slow zoom from `from` to `to` scale over the full sequence */
function useKenBurns(from = 1, to = 1.08) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  return interpolate(frame, [0, durationInFrames], [from, to], {
    extrapolateRight: 'clamp',
  })
}

/** Gradient overlay for text readability over photos */
function GradientOverlay({ direction = 'bottom', opacity = 0.7 }: {
  direction?: 'bottom' | 'top' | 'full'
  opacity?: number
}) {
  const gradients: Record<string, string> = {
    bottom: `linear-gradient(to bottom, transparent 20%, rgba(26,26,46,${opacity}) 100%)`,
    top: `linear-gradient(to top, transparent 20%, rgba(26,26,46,${opacity}) 100%)`,
    full: `rgba(26,26,46,${opacity})`,
  }
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: gradients[direction],
    }} />
  )
}

/** Ochre accent bar at bottom of frame */
function OchreBar() {
  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 6,
      backgroundColor: colors.ochre,
    }} />
  )
}

/** PICC Logo component with animation */
function Logo({ src, size = 120, delay = 0 }: {
  src: string
  size?: number
  delay?: number
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const scale = spring({
    frame: Math.max(0, frame - delay),
    fps,
    from: 0.8,
    to: 1,
    durationInFrames: 25,
    config: { damping: 15 },
  })
  return (
    <Img
      src={src}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        opacity,
        transform: `scale(${scale})`,
      }}
    />
  )
}

// ── Scene 1: Opening ─────────────────────────────────
function OpeningScene({ photoUrl, logoUrl, orgName }: {
  photoUrl: string
  logoUrl: string
  orgName: string
}) {
  const scale = useKenBurns(1, 1.1)
  const frame = useCurrentFrame()
  const textOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  return (
    <AbsoluteFill>
      <Img
        src={photoUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      <GradientOverlay direction="bottom" opacity={0.6} />
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Logo src={logoUrl} size={160} delay={10} />
        <div style={{
          opacity: textOpacity,
          marginTop: spacing.lg,
          fontSize: 20,
          fontFamily: fonts.body,
          fontWeight: 600,
          color: colors.white,
          letterSpacing: 6,
          textTransform: 'uppercase',
          textShadow: '0 2px 20px rgba(0,0,0,0.5)',
        }}>
          {orgName}
        </div>
      </div>
      <OchreBar />
    </AbsoluteFill>
  )
}

// ── Scene 2: Title Card ──────────────────────────────
function TitleScene({ title, subtitle, year, photoUrl }: {
  title: string
  subtitle?: string
  year: string
  photoUrl: string
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = useKenBurns(1.05, 1.12)

  const titleY = spring({ frame, fps, from: 60, to: 0, durationInFrames: 35, config: { damping: 12 } })
  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' })
  const subtitleOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: 'clamp' })
  const yearOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: 'clamp' })

  // Animated underline
  const lineWidth = interpolate(frame, [25, 55], [0, 200], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill>
      <Img
        src={photoUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      <GradientOverlay direction="bottom" opacity={0.75} />
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: spacing.xxxl,
        paddingBottom: 120,
      }}>
        <div style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}>
          <div style={{
            fontSize: 80,
            fontFamily: fonts.display,
            fontWeight: 700,
            color: colors.white,
            lineHeight: 1.05,
            textShadow: '0 4px 30px rgba(0,0,0,0.4)',
          }}>
            {title}
          </div>
        </div>

        {/* Ochre underline */}
        <div style={{
          width: lineWidth,
          height: 4,
          backgroundColor: colors.ochre,
          marginTop: spacing.md,
          borderRadius: 2,
        }} />

        {subtitle && (
          <div style={{
            opacity: subtitleOpacity,
            fontSize: 28,
            fontFamily: fonts.body,
            color: colors.shell,
            marginTop: spacing.lg,
            textShadow: '0 2px 15px rgba(0,0,0,0.4)',
            maxWidth: 800,
            lineHeight: 1.4,
          }}>
            {subtitle}
          </div>
        )}

        <div style={{
          opacity: yearOpacity,
          fontSize: 20,
          fontFamily: fonts.body,
          fontWeight: 600,
          color: colors.ochre,
          marginTop: spacing.md,
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}>
          Annual Report {year}
        </div>
      </div>
      <OchreBar />
    </AbsoluteFill>
  )
}

// ── Scene 3: Stats ───────────────────────────────────
function StatsScene({ stats, photoUrl }: {
  stats: ImpactSummaryProps['stats']
  photoUrl: string
}) {
  const frame = useCurrentFrame()
  const scale = useKenBurns(1.02, 1.08)

  return (
    <AbsoluteFill>
      <Img
        src={photoUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
          filter: 'brightness(0.3)',
        }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, rgba(11,79,108,0.85) 0%, rgba(26,26,46,0.9) 100%)`,
      }} />

      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xxxl,
      }}>
        {/* Section label */}
        <div style={{
          fontSize: 16,
          fontFamily: fonts.body,
          fontWeight: 600,
          color: colors.ochre,
          letterSpacing: 6,
          textTransform: 'uppercase',
          marginBottom: spacing.xl,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          Impact at a Glance
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing.lg,
          justifyContent: 'center',
          maxWidth: 1500,
        }}>
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  )
}

function StatCard({ stat, index }: {
  stat: { label: string; value: string; icon?: string }
  index: number
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const delay = 15 + index * 12

  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })
  const y = spring({
    frame: Math.max(0, frame - delay),
    fps,
    from: 40,
    to: 0,
    durationInFrames: 20,
    config: { damping: 12 },
  })

  return (
    <div style={{
      opacity,
      transform: `translateY(${y}px)`,
      backgroundColor: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(10px)',
      borderRadius: 20,
      padding: `${spacing.xl}px ${spacing.xxl}px`,
      minWidth: 280,
      textAlign: 'center',
      border: '1px solid rgba(200, 150, 62, 0.25)',
    }}>
      {stat.icon && (
        <Img src={stat.icon} style={{ width: 48, height: 48, margin: '0 auto', marginBottom: spacing.sm }} />
      )}
      <div style={{
        fontSize: 72,
        fontFamily: fonts.display,
        fontWeight: 700,
        color: colors.starGold,
        lineHeight: 1,
        marginBottom: spacing.sm,
      }}>
        {stat.value}
      </div>
      <div style={{
        fontSize: 16,
        fontFamily: fonts.body,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        letterSpacing: 2,
      }}>
        {stat.label}
      </div>
    </div>
  )
}

// ── Scene 4: Photo Montage ───────────────────────────
function PhotoMontageScene({ photos }: { photos: string[] }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  if (photos.length === 0) return <AbsoluteFill style={{ backgroundColor: colors.midnight }} />

  const framesPerPhoto = Math.floor(durationInFrames / photos.length)
  const currentIndex = Math.min(
    Math.floor(frame / framesPerPhoto),
    photos.length - 1
  )
  const localFrame = frame - currentIndex * framesPerPhoto
  const nextIndex = Math.min(currentIndex + 1, photos.length - 1)

  // Crossfade in last 15 frames of each photo
  const crossfadeStart = framesPerPhoto - 15
  const nextOpacity = localFrame > crossfadeStart
    ? interpolate(localFrame, [crossfadeStart, framesPerPhoto], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  // Ken Burns per photo — alternate between zoom-in and zoom-out
  const evenZoom = interpolate(localFrame, [0, framesPerPhoto], [1, 1.12], { extrapolateRight: 'clamp' })
  const oddZoom = interpolate(localFrame, [0, framesPerPhoto], [1.12, 1], { extrapolateRight: 'clamp' })
  const currentScale = currentIndex % 2 === 0 ? evenZoom : oddZoom

  return (
    <AbsoluteFill style={{ backgroundColor: colors.midnight }}>
      {/* Current photo */}
      <AbsoluteFill>
        <Img
          src={photos[currentIndex]}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${currentScale})`,
          }}
        />
      </AbsoluteFill>

      {/* Next photo (crossfade) */}
      {nextOpacity > 0 && currentIndex !== nextIndex && (
        <AbsoluteFill style={{ opacity: nextOpacity }}>
          <Img
            src={photos[nextIndex]}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </AbsoluteFill>
      )}

      {/* Subtle vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(26,26,46,0.4) 100%)',
      }} />

      {/* Bottom text strip */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: `${spacing.lg}px ${spacing.xxxl}px`,
        background: 'linear-gradient(transparent, rgba(26,26,46,0.8))',
      }}>
        <div style={{
          fontSize: 14,
          fontFamily: fonts.body,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}>
          Our Community · Our Story
        </div>
      </div>

      <OchreBar />
    </AbsoluteFill>
  )
}

// ── Scene 5: Quote ───────────────────────────────────
function QuoteScene({ text, author, photoUrl }: {
  text: string
  author: string | null
  photoUrl: string
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = useKenBurns(1, 1.06)

  const quoteOpacity = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: 'clamp' })
  const quoteY = spring({ frame: Math.max(0, frame - 10), fps, from: 30, to: 0, durationInFrames: 30 })
  const authorOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: 'clamp' })

  // Opening quotation mark animation
  const markScale = spring({ frame, fps, from: 3, to: 1, durationInFrames: 40, config: { damping: 8 } })
  const markOpacity = interpolate(frame, [0, 20], [0, 0.15], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill>
      <Img
        src={photoUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
          filter: 'brightness(0.35) saturate(0.8)',
        }}
      />
      {/* Warm tint overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, rgba(200,150,62,0.15) 0%, rgba(26,26,46,0.7) 100%)`,
      }} />

      {/* Giant quotation mark */}
      <div style={{
        position: 'absolute',
        top: 120,
        left: 140,
        fontSize: 400,
        fontFamily: fonts.display,
        color: colors.ochre,
        opacity: markOpacity,
        transform: `scale(${markScale})`,
        lineHeight: 1,
      }}>
        &ldquo;
      </div>

      {/* Quote content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xxxl,
      }}>
        <div style={{
          maxWidth: 1100,
          textAlign: 'center',
          opacity: quoteOpacity,
          transform: `translateY(${quoteY}px)`,
        }}>
          <div style={{
            fontSize: 44,
            fontFamily: fonts.display,
            fontStyle: 'italic',
            color: colors.white,
            lineHeight: 1.45,
            textShadow: '0 3px 25px rgba(0,0,0,0.5)',
          }}>
            &ldquo;{text}&rdquo;
          </div>
        </div>

        {author && (
          <div style={{
            opacity: authorOpacity,
            marginTop: spacing.xl,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
          }}>
            {/* Ochre dash before author */}
            <div style={{ width: 40, height: 2, backgroundColor: colors.ochre }} />
            <div style={{
              fontSize: 22,
              fontFamily: fonts.body,
              fontWeight: 500,
              color: colors.ochre,
              letterSpacing: 1,
            }}>
              {author}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}

// ── Scene 6: Closing ─────────────────────────────────
function ClosingScene({ logoUrl, orgName, year, photoUrl }: {
  logoUrl: string
  orgName: string
  year: string
  photoUrl: string
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = useKenBurns(1.05, 1)

  const contentOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })
  const taglineOpacity = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill>
      <Img
        src={photoUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      <GradientOverlay direction="bottom" opacity={0.75} />

      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: contentOpacity,
      }}>
        <Logo src={logoUrl} size={140} delay={5} />

        <div style={{
          marginTop: spacing.xl,
          fontSize: 42,
          fontFamily: fonts.display,
          fontWeight: 700,
          color: colors.white,
          textAlign: 'center',
          textShadow: '0 3px 25px rgba(0,0,0,0.4)',
          lineHeight: 1.3,
        }}>
          Our Community, Our Future, Our Way
        </div>

        <div style={{
          opacity: taglineOpacity,
          marginTop: spacing.lg,
          fontSize: 18,
          fontFamily: fonts.body,
          color: colors.ochre,
          letterSpacing: 4,
          textTransform: 'uppercase',
        }}>
          {orgName} · {year}
        </div>
      </div>

      <OchreBar />
    </AbsoluteFill>
  )
}

// ── Main Composition ─────────────────────────────────
export function ImpactSummary({
  title,
  subtitle,
  year,
  stats,
  quote,
  photos,
  logoUrl,
  orgName = 'Palm Island Community Company',
}: ImpactSummaryProps) {
  const { fps } = useVideoConfig()

  // Assign photos to scenes (fallback gracefully if fewer photos provided)
  const getPhoto = (i: number) => photos[i % photos.length] || ''
  const montagePhotos = photos.length > 3 ? photos.slice(2) : photos

  // Scene durations (seconds → frames)
  const s = (sec: number) => fps * sec
  const openingDur  = s(5)
  const titleDur    = s(5)
  const statsDur    = s(15)
  const montageDur  = s(15)
  const quoteDur    = s(12)
  const closingDur  = s(8)

  let offset = 0

  return (
    <AbsoluteFill style={{ backgroundColor: colors.midnight }}>
      {/* Scene 1: Opening with logo */}
      <Sequence from={offset} durationInFrames={openingDur} name="Opening">
        <OpeningScene
          photoUrl={getPhoto(0)}
          logoUrl={logoUrl}
          orgName={orgName}
        />
      </Sequence>

      {/* Scene 2: Title card */}
      <Sequence from={(offset += openingDur)} durationInFrames={titleDur} name="Title">
        <TitleScene
          title={title}
          subtitle={subtitle}
          year={year}
          photoUrl={getPhoto(1)}
        />
      </Sequence>

      {/* Scene 3: Stats */}
      <Sequence from={(offset += titleDur)} durationInFrames={statsDur} name="Stats">
        <StatsScene stats={stats} photoUrl={getPhoto(2)} />
      </Sequence>

      {/* Scene 4: Photo montage */}
      {montagePhotos.length > 0 && (
        <Sequence from={(offset += statsDur)} durationInFrames={montageDur} name="Photos">
          <PhotoMontageScene photos={montagePhotos} />
        </Sequence>
      )}

      {/* Scene 5: Quote */}
      {quote && (
        <Sequence
          from={(offset += montagePhotos.length > 0 ? montageDur : statsDur)}
          durationInFrames={quoteDur}
          name="Quote"
        >
          <QuoteScene
            text={quote.text}
            author={quote.author}
            photoUrl={getPhoto(0)}
          />
        </Sequence>
      )}

      {/* Scene 6: Closing */}
      <Sequence
        from={(offset += quote ? quoteDur : (montagePhotos.length > 0 ? montageDur : statsDur))}
        durationInFrames={closingDur}
        name="Closing"
      >
        <ClosingScene
          logoUrl={logoUrl}
          orgName={orgName}
          year={year}
          photoUrl={getPhoto(1)}
        />
      </Sequence>
    </AbsoluteFill>
  )
}
