'use client'

/**
 * AnimatedStat — the canonical "anchor number" component.
 *
 * Animates from 0 → value when scrolled into view. Renders the number in
 * Fraunces 700 with the brand caption cadence (Inter 700 uppercase 11px,
 * letter-spacing 0.3em) for the label. Optional provenance line for the
 * brand rule "every figure traces to a verified source".
 *
 * Behaviour:
 *  - useInView from framer-motion triggers a requestAnimationFrame ease-out
 *    cubic count. Easing is a curve, not a spring (per BRAND.md §8).
 *  - Respects `prefers-reduced-motion`: jumps to final value, skips RAF.
 *  - Provenance shows as a muted caption when short, or a <details> toggle
 *    when long-ish (>80 chars).
 */

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { C } from '../annual-report/2024-25/almanac/tokens'

export type AnimatedStatFormat =
  | 'number'
  | 'currency'
  | 'compact-currency'
  | 'percent'

export type AnimatedStatSize = 'sm' | 'md' | 'lg'

export interface AnimatedStatProps {
  /** Final number to count up to (e.g. 197 or 23_400_000). */
  value: number
  /** Caption beneath the number (e.g. "Palm Islanders employed"). */
  label: string
  /** Number formatter. Default 'number'. compact-currency renders "$23.4M". */
  format?: AnimatedStatFormat
  /** Optional prefix glyph (e.g. ">"). */
  prefix?: string
  /** Optional suffix glyph (e.g. "+", "%"). */
  suffix?: string
  /** Source line — e.g. "Source: 2024-25 audited financials". */
  provenance?: string
  /** Palette key from `C` (tokens.ts). Default 'ocean'. */
  colour?: keyof typeof C
  /** Display size. Default 'md'. lg = clamp(48px, 8vw, 88px). */
  size?: AnimatedStatSize
  /** Animation start delay in ms. */
  delay?: number
  /** Count duration in ms. Default 1500. */
  duration?: number
  /** Optional className passthrough on the wrapper. */
  className?: string
}

/** Roughly mirrors BRAND.md typography scale. */
const SIZE_PX: Record<AnimatedStatSize, string> = {
  sm: 'clamp(28px, 4vw, 40px)',
  md: 'clamp(36px, 6vw, 64px)',
  lg: 'clamp(48px, 8vw, 88px)',
}

function formatValue(n: number, format: AnimatedStatFormat): string {
  switch (format) {
    case 'currency':
      return `$${Math.round(n).toLocaleString('en-AU')}`
    case 'compact-currency': {
      // "$23.4M" / "$1.2B" / "$950K" / "$420"
      const abs = Math.abs(n)
      if (abs >= 1_000_000_000) {
        return `$${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
      }
      if (abs >= 1_000_000) {
        return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
      }
      if (abs >= 1_000) {
        return `$${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
      }
      return `$${Math.round(n)}`
    }
    case 'percent':
      return `${Math.round(n)}%`
    case 'number':
    default:
      return Math.round(n).toLocaleString('en-AU')
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function AnimatedStat({
  value,
  label,
  format = 'number',
  prefix = '',
  suffix = '',
  provenance,
  colour = 'ocean',
  size = 'md',
  delay = 0,
  duration = 1500,
  className = '',
}: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return

    if (prefersReducedMotion()) {
      setDisplay(value)
      return
    }

    let raf = 0
    let startTime: number | null = null

    const tick = (now: number) => {
      if (startTime === null) startTime = now + delay
      const elapsed = Math.max(0, now - startTime)
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic — matches the existing AnimatedCounter feel and
      // BRAND.md's "no spring everything" rule.
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isInView, value, delay, duration])

  const formatted = formatValue(display, format)
  const numberColour = C[colour]

  const longProvenance = !!provenance && provenance.length > 80

  return (
    <div ref={ref} className={`flex flex-col gap-2 ${className}`}>
      <span
        className="font-fraunces font-bold leading-none tabular-nums"
        style={{
          fontSize: SIZE_PX[size],
          color: numberColour,
          fontVariantNumeric: 'tabular-nums',
        }}
        aria-label={`${prefix}${formatValue(value, format)}${suffix} ${label}`}
      >
        {prefix}
        {formatted}
        {suffix}
      </span>

      <span
        className="font-sans font-bold uppercase text-[11px] tracking-[0.3em]"
        style={{ color: C.driftwood }}
      >
        {label}
      </span>

      {provenance && !longProvenance && (
        <span
          className="font-sans text-[11px] leading-snug"
          style={{ color: C.muted }}
        >
          {provenance}
        </span>
      )}

      {provenance && longProvenance && (
        <details className="font-sans text-[11px] leading-snug">
          <summary
            className="cursor-pointer select-none"
            style={{ color: C.muted }}
          >
            Source
          </summary>
          <p className="mt-1" style={{ color: C.muted }}>
            {provenance}
          </p>
        </details>
      )}
    </div>
  )
}

export default AnimatedStat
