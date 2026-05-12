'use client'

/**
 * IntroOverlay — fades in over the constellation hero, holds for 4s,
 * then fades out and is removed from the DOM. After that, the user
 * has the constellation full-bleed with no chrome obstructing the
 * canvas. Click anywhere on the overlay also dismisses it.
 *
 * Render this inside a position:relative parent so the overlay's
 * absolute positioning anchors correctly to the constellation
 * container.
 */

import { useEffect, useState } from 'react'

interface Props {
  /** Big serif title, ~60-80pt presentation typography. */
  title: string
  /** One-line tagline shown below the title. */
  tagline: string
  /** Optional small label above the title (uppercase, tracking-wide). */
  eyebrow?: string
  /** How long to hold full-opacity before fading out. ms. */
  holdMs?: number
  /** Total fade-out duration. ms. */
  fadeMs?: number
}

export default function IntroOverlay({
  title,
  tagline,
  eyebrow,
  holdMs = 4000,
  fadeMs = 900,
}: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out' | 'gone'>('in')

  useEffect(() => {
    // Phase 1: fade in (handled by CSS keyframe on mount)
    const t1 = setTimeout(() => setPhase('hold'), 400)
    // Phase 2: fade out after hold
    const t2 = setTimeout(() => setPhase('out'), holdMs)
    // Phase 3: unmount after fade
    const t3 = setTimeout(() => setPhase('gone'), holdMs + fadeMs)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [holdMs, fadeMs])

  if (phase === 'gone') return null

  return (
    <div
      role="presentation"
      onClick={() => setPhase('out')}
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(251, 246, 238, 0.92) 0%, rgba(251, 246, 238, 0.55) 50%, rgba(251, 246, 238, 0.0) 100%)',
        opacity: phase === 'out' ? 0 : 1,
        transition: `opacity ${fadeMs}ms ease-out`,
      }}
    >
      <div
        className="pointer-events-auto text-center px-6"
        style={{
          maxWidth: 720,
          animation: 'introIn 600ms ease-out both',
        }}
      >
        {eyebrow && (
          <div
            className="text-[11px] uppercase tracking-[0.4em] font-bold mb-3"
            style={{ color: '#D4A373' }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          className="font-serif leading-[1.02] text-charcoal mb-4"
          style={{ fontSize: 'clamp(40px, 6vw, 76px)' }}
        >
          {title}
        </h1>
        <p
          className="text-stone-700 leading-relaxed"
          style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', maxWidth: 560, margin: '0 auto' }}
        >
          {tagline}
        </p>
        <div className="mt-8 text-[11px] uppercase tracking-[0.3em] text-stone-500">
          click anywhere to enter
        </div>
      </div>

      <style jsx>{`
        @keyframes introIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
