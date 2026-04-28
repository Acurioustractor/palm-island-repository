/**
 * SaltwaterRings — clean concentric rings as workforce anchor.
 *
 * Pivoted from the painted-PNG-as-backdrop approach (text on busy
 * painted ochre rings was unreadable). Now: clean CSS/SVG concentric
 * circles using the brand palette, controlled contrast, deliberate
 * spacing for the breakdown chips OUTSIDE the rings (no text-on-art
 * overlap). The painted concept asset still ships as a small
 * decorative banner before the graphic so the brand atmosphere is
 * present without fighting the data.
 */
'use client'

import { C } from './tokens'

interface Breakdown {
  value: string
  label: string
  caption?: string
  colour?: string
}

interface SaltwaterRingsProps {
  stat: string
  subtitle: string
  eyebrow?: string
  breakdowns?: Breakdown[]
}

export function SaltwaterRings({ stat, subtitle, eyebrow, breakdowns = [] }: SaltwaterRingsProps) {
  return (
    <section className="w-full" aria-label={`${stat} ${subtitle}`}>
      {/* DESKTOP — clean concentric SVG rings + center stat + flanking chips */}
      <div className="hidden md:flex items-center justify-center gap-12 mx-auto" style={{ maxWidth: 880 }}>
        {/* Left chip */}
        {breakdowns[0] && (
          <BreakdownChip breakdown={breakdowns[0]} align="right" />
        )}

        {/* Clean concentric rings */}
        <CleanRings stat={stat} subtitle={subtitle} eyebrow={eyebrow} />

        {/* Right chip */}
        {breakdowns[1] && (
          <BreakdownChip breakdown={breakdowns[1]} align="left" />
        )}
      </div>

      {/* Optional 3rd breakdown — centered below the rings */}
      {breakdowns[2] && (
        <div className="hidden md:flex justify-center mt-8">
          <BreakdownChip breakdown={breakdowns[2]} align="center" />
        </div>
      )}

      {/* MOBILE — clean rings + breakdown cards stacked, no painted banner */}
      <div className="md:hidden">
        <div className="mx-auto" style={{ maxWidth: 280 }}>
          <CleanRings stat={stat} subtitle={subtitle} eyebrow={eyebrow} />
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
                  <div className="font-caveat font-bold leading-none" style={{ color: colour, fontSize: 36 }}>
                    {bd.value}
                  </div>
                  <div className="mt-1 uppercase font-bold" style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.12em' }}>
                    {bd.label}
                  </div>
                  {bd.caption && (
                    <div className="font-caveat mt-1" style={{ color: C.driftwood, fontSize: 13, lineHeight: 1.2 }}>
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

// ─────────────────────────────────────────────────────────────────────

function CleanRings({
  stat,
  subtitle,
  eyebrow,
}: {
  stat: string
  subtitle: string
  eyebrow?: string
}) {
  return (
    <div className="relative" style={{ width: '100%', maxWidth: 360, aspectRatio: '1 / 1' }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" role="img" aria-hidden>
        {/* Outer rings — concentric, decreasing opacity inward */}
        <circle cx="50" cy="50" r="46" fill="none" stroke={C.ochre} strokeWidth="1.4" opacity={0.25} />
        <circle cx="50" cy="50" r="38" fill="none" stroke={C.ochre} strokeWidth="1.6" opacity={0.42} />
        <circle cx="50" cy="50" r="30" fill="none" stroke={C.ochre} strokeWidth="1.8" opacity={0.6} />
        {/* Inner disk — clean cream so center text is legible */}
        <circle cx="50" cy="50" r="24" fill="#FBF8EE" />
        <circle cx="50" cy="50" r="24" fill="none" stroke={C.ochre} strokeWidth="0.8" opacity={0.35} />
      </svg>

      {/* Center text overlay — sits on the clean cream disk */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        {eyebrow && (
          <div
            className="uppercase mb-2"
            style={{
              color: C.ochre,
              opacity: 0.75,
              letterSpacing: '0.3em',
              fontSize: 'clamp(9px, 1vw, 11px)',
            }}
          >
            {eyebrow}
          </div>
        )}
        <div
          className="font-caveat font-bold leading-none"
          style={{ color: C.midnight, fontSize: 'clamp(56px, 8vw, 88px)' }}
        >
          {stat}
        </div>
        <div
          className="uppercase mt-2"
          style={{
            color: C.midnight,
            opacity: 0.7,
            letterSpacing: '0.3em',
            fontSize: 'clamp(9px, 1vw, 11px)',
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────

function BreakdownChip({
  breakdown,
  align,
}: {
  breakdown: Breakdown
  align: 'left' | 'right' | 'center'
}) {
  const colour = breakdown.colour ?? C.ochre
  const textAlign = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <div className={`flex-shrink-0 ${textAlign}`} style={{ maxWidth: 200 }}>
      <div
        className="font-caveat font-bold leading-none"
        style={{ color: colour, fontSize: 'clamp(40px, 5vw, 56px)' }}
      >
        {breakdown.value}
      </div>
      <div
        className="font-bold uppercase mt-1"
        style={{ color: C.rock, fontSize: 12, letterSpacing: '0.12em' }}
      >
        {breakdown.label}
      </div>
      {breakdown.caption && (
        <div className="font-caveat mt-2" style={{ color: C.driftwood, fontSize: 15, lineHeight: 1.2 }}>
          {breakdown.caption}
        </div>
      )}
    </div>
  )
}
