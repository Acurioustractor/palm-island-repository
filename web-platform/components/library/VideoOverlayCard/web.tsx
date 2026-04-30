import { tokens } from '@/lib/design-tokens/pdf-tokens'
import type { VideoOverlayCardProps } from './types'

const ASPECT_PADDING_RATIO: Record<NonNullable<VideoOverlayCardProps['aspect']>, string> = {
  '16:9': '56.25%',
  '1:1': '100%',
  '9:16': '177.78%',
  '4:3': '75%',
}

export function VideoOverlayCard({
  eyebrow,
  caption,
  subcaption,
  videoUrl,
  posterUrl,
  surface = 'shell',
  captionPosition = 'below',
  tint,
  aspect = '16:9',
  nextSectionId,
  nextSectionLabel = 'Next',
}: VideoOverlayCardProps) {
  const surfaceBg =
    surface === 'midnight'
      ? tokens.color.brand.midnight
      : surface === 'ocean'
        ? tokens.color.brand.ocean
        : tokens.color.brand.shell

  const isDark = surface === 'midnight' || surface === 'ocean'
  const eyebrowColor = isDark ? tokens.color.brand.starGold : tokens.color.brand.turtleRed
  const captionColor = isDark ? '#FFFFFF' : tokens.color.brand.earth
  const subcaptionColor = isDark ? 'rgba(255,255,255,0.7)' : tokens.color.brand.driftwood
  const placeholderTint = tint ? tokens.color.section[tint] : tokens.color.brand.midnight

  return (
    <div
      className="flex flex-col gap-md rounded-lg overflow-hidden w-full"
      style={{ backgroundColor: surfaceBg, padding: captionPosition === 'below' ? tokens.spacing.lg : 0 }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          paddingTop: ASPECT_PADDING_RATIO[aspect],
          backgroundColor: posterUrl || videoUrl ? undefined : `${placeholderTint}40`,
          borderRadius: captionPosition === 'overlay-bottom' ? 0 : 8,
        }}
      >
        {videoUrl ? (
          <video
            src={videoUrl}
            poster={posterUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={caption}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}

        {captionPosition === 'overlay-bottom' && (
          <div
            className="absolute inset-0 flex flex-col justify-end p-lg"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, transparent 50%, rgba(0,0,0,0.65) 100%)',
            }}
          >
            <div
              className="uppercase font-bold mb-1 text-white"
              style={{ fontSize: 11, letterSpacing: '0.3em' }}
            >
              {eyebrow}
            </div>
            <div
              className="font-fraunces font-bold italic leading-tight text-white"
              style={{ fontSize: 28 }}
            >
              {caption}
            </div>
            {subcaption && (
              <div
                className="text-white/80 mt-1"
                style={{ fontSize: 13 }}
              >
                {subcaption}
              </div>
            )}
            {nextSectionId && (
              <NextSectionCue
                href={`#${nextSectionId}`}
                label={nextSectionLabel}
                tone="overlay"
              />
            )}
          </div>
        )}
      </div>

      {captionPosition === 'below' && (
        <div className="flex flex-col gap-sm" style={{ padding: tokens.spacing.md }}>
          <div
            className="uppercase font-bold"
            style={{ color: eyebrowColor, fontSize: 11, letterSpacing: '0.3em' }}
          >
            {eyebrow}
          </div>
          <div
            className="font-fraunces font-bold italic leading-tight"
            style={{ color: captionColor, fontSize: 22 }}
          >
            {caption}
          </div>
          {subcaption && (
            <div style={{ color: subcaptionColor, fontSize: 13 }}>{subcaption}</div>
          )}
          {nextSectionId && (
            <NextSectionCue
              href={`#${nextSectionId}`}
              label={nextSectionLabel}
              tone={isDark ? 'dark' : 'light'}
            />
          )}
        </div>
      )}
    </div>
  )
}

function NextSectionCue({
  href,
  label,
  tone,
}: {
  href: string
  label: string
  tone: 'light' | 'dark' | 'overlay'
}) {
  const isLight = tone === 'light'
  const bg = isLight ? 'transparent' : 'rgba(255,255,255,0.12)'
  const color = isLight ? tokens.color.brand.ocean : '#FFFFFF'
  const border = isLight ? `1px solid ${tokens.color.brand.border}` : '1px solid rgba(255,255,255,0.25)'
  return (
    <a
      href={href}
      className="self-start inline-flex items-center gap-2 rounded-full font-bold uppercase hover:opacity-80 transition-opacity mt-2"
      style={{
        backgroundColor: bg,
        color,
        border,
        fontSize: 11,
        letterSpacing: '0.2em',
        padding: '6px 14px',
      }}
    >
      <span aria-hidden style={{ fontSize: 14 }}>↓</span>
      <span>{label}</span>
    </a>
  )
}
