/**
 * SaltwaterRings — painted concentric rings as a workforce-breakdown
 * anchor.
 *
 * Hybrid component: brush-textured painted rings PNG (approved
 * infographic #01-saltwater-rings) carries the aesthetic, real HTML
 * overlay holds the data. Center number + two breakdown chips that
 * sit on the ring edges.
 *
 * Designed for "210 Total Staff · 75% Indigenous · 70% Palm Island
 * resident" but generalised: caller supplies the anchor stat + 1-3
 * breakdown chips with their own color tints.
 */
'use client'

import { assetUrl } from '@/lib/media/asset-url'
import { C } from './tokens'

interface Breakdown {
  /** Display value, e.g. "75%" */
  value: string
  /** Short label, e.g. "Indigenous" */
  label: string
  /** Optional caption under the label */
  caption?: string
  /** Tint, defaults to ochre */
  colour?: string
}

interface SaltwaterRingsProps {
  /** Center stat — e.g. "~210" */
  stat: string
  /** Subtitle under the stat — e.g. "Total staff" */
  subtitle: string
  /** Optional eyebrow above the stat */
  eyebrow?: string
  /** 1–3 breakdown chips, positioned around the painted rings */
  breakdowns?: Breakdown[]
  /** Override the painted backdrop */
  heroImageUrl?: string
}

const DEFAULT_HERO = assetUrl('/icons/picc/infographics/01-saltwater-rings.png')

// Predefined chip positions (clockwise from 1 o'clock). Matches the
// number of breakdowns: 1 → top, 2 → top + bottom, 3 → top + 5 + 7
// o'clock to balance.
const CHIP_POSITIONS_BY_COUNT: Record<number, { x: number; y: number; side: 'left' | 'right' }[]> = {
  1: [{ x: 50, y: 8, side: 'right' }],
  2: [
    { x: 80, y: 22, side: 'right' },
    { x: 20, y: 78, side: 'left' },
  ],
  3: [
    { x: 80, y: 22, side: 'right' },
    { x: 20, y: 50, side: 'left' },
    { x: 50, y: 92, side: 'right' },
  ],
}

export function SaltwaterRings({
  stat,
  subtitle,
  eyebrow,
  breakdowns = [],
  heroImageUrl,
}: SaltwaterRingsProps) {
  const positions = CHIP_POSITIONS_BY_COUNT[Math.min(breakdowns.length, 3) || 1] ?? []

  return (
    <section className="relative w-full" aria-label={`${stat} ${subtitle}`}>
      {/* DESKTOP — painted rings + center stat + chips on the rings */}
      <div
        className="relative mx-auto hidden md:block"
        style={{ aspectRatio: '1 / 1', maxWidth: 640 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImageUrl ?? DEFAULT_HERO}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* Center stat — large Caveat number with subtitle below */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          {eyebrow && (
            <div
              className="uppercase mb-3"
              style={{
                color: C.ochre,
                opacity: 0.7,
                letterSpacing: '0.4em',
                fontSize: 'clamp(10px, 1.1vw, 12px)',
              }}
            >
              {eyebrow}
            </div>
          )}
          <div
            className="font-caveat font-bold leading-none"
            style={{
              color: C.midnight,
              fontSize: 'clamp(64px, 9vw, 110px)',
              textShadow: '0 2px 8px rgba(255, 255, 255, 0.5)',
            }}
          >
            {stat}
          </div>
          <div
            className="uppercase mt-3"
            style={{
              color: C.midnight,
              opacity: 0.75,
              letterSpacing: '0.3em',
              fontSize: 'clamp(10px, 1.1vw, 12px)',
              textShadow: '0 1px 4px rgba(255, 255, 255, 0.6)',
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Breakdown chips — positioned on the painted rings */}
        {breakdowns.slice(0, 3).map((bd, i) => {
          const pos = positions[i]
          if (!pos) return null
          const colour = bd.colour ?? C.ochre
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: pos.side === 'right' ? 'translate(-100%, -50%)' : 'translate(0%, -50%)',
                maxWidth: 180,
                textAlign: pos.side === 'right' ? 'right' : 'left',
              }}
            >
              <div className="flex items-baseline gap-2" style={{ flexDirection: pos.side === 'right' ? 'row' : 'row' }}>
                <div
                  className="font-caveat font-bold leading-none"
                  style={{ color: colour, fontSize: 'clamp(28px, 3.6vw, 44px)' }}
                >
                  {bd.value}
                </div>
                <div
                  className="uppercase"
                  style={{
                    color: C.driftwood,
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    fontWeight: 600,
                  }}
                >
                  {bd.label}
                </div>
              </div>
              {bd.caption && (
                <div className="font-caveat mt-1" style={{ color: C.driftwood, fontSize: 14, lineHeight: 1.2 }}>
                  {bd.caption}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* MOBILE — stacked: rings on top, breakdown cards below */}
      <div className="md:hidden">
        <div className="relative mx-auto" style={{ maxWidth: 320, aspectRatio: '1 / 1' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImageUrl ?? DEFAULT_HERO}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
            style={{ mixBlendMode: 'multiply' }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            {eyebrow && (
              <div
                className="uppercase mb-2"
                style={{ color: C.ochre, opacity: 0.7, letterSpacing: '0.3em', fontSize: 10 }}
              >
                {eyebrow}
              </div>
            )}
            <div
              className="font-caveat font-bold leading-none"
              style={{ color: C.midnight, fontSize: 64 }}
            >
              {stat}
            </div>
            <div
              className="uppercase mt-2"
              style={{ color: C.midnight, opacity: 0.75, letterSpacing: '0.25em', fontSize: 10 }}
            >
              {subtitle}
            </div>
          </div>
        </div>
        {breakdowns.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-3 px-4 sm:grid-cols-2">
            {breakdowns.map((bd, i) => {
              const colour = bd.colour ?? C.ochre
              return (
                <div
                  key={i}
                  className="rounded-md border bg-white/40 p-3 text-center"
                  style={{ borderColor: `${colour}40` }}
                >
                  <div
                    className="font-caveat font-bold leading-none"
                    style={{ color: colour, fontSize: 36 }}
                  >
                    {bd.value}
                  </div>
                  <div
                    className="mt-1 uppercase font-bold"
                    style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.12em' }}
                  >
                    {bd.label}
                  </div>
                  {bd.caption && (
                    <div
                      className="font-caveat mt-1"
                      style={{ color: C.driftwood, fontSize: 13, lineHeight: 1.2 }}
                    >
                      {bd.caption}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
