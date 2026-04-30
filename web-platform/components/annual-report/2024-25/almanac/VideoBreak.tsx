/**
 * VideoBreak — full-bleed video transition between sections.
 *
 * Plays a themed video clip with a single line of overlay type.
 * Auto-plays muted, loops, lazy-loads on viewport entry.
 *
 * The 12 themed clips at /hero-assets/clips/ feed these breaks.
 */
'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoBreakProps {
  /** Path to the video file (relative to /public). */
  videoUrl: string
  /** Optional poster image (still frame for slow connections). */
  posterUrl?: string
  /** Single line overlay text. */
  caption?: string
  /** Sub-line (Caveat). */
  subcaption?: string
  /** Aspect ratio (height in vh). Default: 80vh. */
  height?: string
  /** Optional anchor id of the next section. When provided, renders a
      "↓ <label>" cue at the bottom of the break that scrolls to it. */
  nextSectionId?: string
  /** Label next to the down-arrow cue. Default 'Next'. */
  nextSectionLabel?: string
}

export function VideoBreak({
  videoUrl,
  posterUrl,
  caption,
  subcaption,
  height = '80vh',
  nextSectionId,
  nextSectionLabel = 'Next',
}: VideoBreakProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          ref.current?.play().catch(() => {})
        } else {
          ref.current?.pause()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height, backgroundColor: '#1A1A2E' }}
      aria-label={caption || 'Section transition'}
    >
      <video
        ref={ref}
        src={inView ? videoUrl : undefined}
        poster={posterUrl}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient for legibility */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(45,35,25,0.20) 0%, rgba(45,35,25,0.55) 100%)',
        }}
      />

      {(caption || subcaption) && (
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-8">
          {caption && (
            <h3
              className="font-fraunces font-bold leading-tight"
              style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
            >
              {caption}
            </h3>
          )}
          {subcaption && (
            <p
              className="mt-3 font-caveat"
              style={{ fontSize: 'clamp(16px, 2vw, 22px)', opacity: 0.85 }}
            >
              {subcaption}
            </p>
          )}
        </div>
      )}

      {nextSectionId && (
        <a
          href={`#${nextSectionId}`}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-2 rounded-full font-bold uppercase hover:opacity-80 transition-opacity"
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.25)',
            fontSize: 11,
            letterSpacing: '0.2em',
            padding: '8px 16px',
            backdropFilter: 'blur(8px)',
          }}
          aria-label={`Skip to ${nextSectionLabel}`}
        >
          <span aria-hidden style={{ fontSize: 14 }}>↓</span>
          <span>{nextSectionLabel}</span>
        </a>
      )}
    </section>
  )
}
