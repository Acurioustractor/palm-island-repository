/**
 * StatHeroHorizon — painted island/horizon backdrop with a single hero stat.
 *
 * Hybrid component: the brush-textured PNG carries the aesthetic, real
 * HTML overlay carries the data. Approved via design-system voting
 * (slug: infographic-stat-hero-horizon, intended use: "Use for the
 * acknowledgement").
 *
 * Source PNG: /icons/picc/infographics/06-stat-hero-horizon.png (3:2 painted
 * watercolour island under sunrise sky).
 */
'use client'

import { assetUrl } from '@/lib/media/asset-url'
import { C } from './tokens'

interface StatHeroHorizonProps {
  /** Big hero number — keep it short (1–4 chars works best). */
  stat: string
  /** Caption sitting above the stat — e.g. "Year". */
  eyebrow?: string
  /** Subtitle under the stat — e.g. "of 20". */
  label?: string
  /** Optional one-line note at the bottom of the painted island band. */
  caption?: string
  /** Override the backdrop. Defaults to the approved painted concept. */
  heroImageUrl?: string
  /** Tint the overlay text. Defaults to ocean ink for sky readability. */
  textColor?: string
}

const DEFAULT_HERO = assetUrl('/icons/picc/infographics/06-stat-hero-horizon.png')

export function StatHeroHorizon({
  stat,
  eyebrow,
  label,
  caption,
  heroImageUrl,
  textColor = C.midnight,
}: StatHeroHorizonProps) {
  return (
    <section className="relative w-full" aria-label={`${eyebrow ?? ''} ${stat} ${label ?? ''}`.trim()}>
      {/* 3:2 painted backdrop, full-bleed */}
      <div className="relative w-full" style={{ aspectRatio: '3 / 2' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImageUrl ?? DEFAULT_HERO}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay — positioned in the upper sky third where the painted
            sun rises. Uses percentage units so it stays put as the panel
            scales responsively. */}
        <div className="absolute inset-x-0 top-[8%] flex flex-col items-center text-center px-6">
          {eyebrow && (
            <div
              className="uppercase mb-3"
              style={{
                color: textColor,
                opacity: 0.55,
                letterSpacing: '0.4em',
                fontSize: 'clamp(10px, 1.1vw, 13px)',
              }}
            >
              {eyebrow}
            </div>
          )}

          <div
            className="font-fraunces font-bold leading-none"
            style={{
              color: textColor,
              fontSize: 'clamp(96px, 16vw, 200px)',
              textShadow: '0 2px 8px rgba(255, 255, 255, 0.4)',
            }}
          >
            {stat}
          </div>

          {label && (
            <div
              className="font-fraunces italic mt-1"
              style={{
                color: textColor,
                opacity: 0.85,
                fontSize: 'clamp(20px, 2.4vw, 32px)',
              }}
            >
              {label}
            </div>
          )}
        </div>

        {/* Optional caption — sits low over the painted island band. */}
        {caption && (
          <div className="absolute inset-x-0 bottom-[6%] flex justify-center px-8">
            <p
              className="font-fraunces italic max-w-2xl text-center"
              style={{
                color: textColor,
                opacity: 0.9,
                fontSize: 'clamp(14px, 1.6vw, 20px)',
                textShadow: '0 1px 4px rgba(255, 255, 255, 0.5)',
              }}
            >
              {caption}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
