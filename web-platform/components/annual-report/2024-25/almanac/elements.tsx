/**
 * Saltwater Almanac — HTML/React versions of the 12 elements.
 *
 * Mirror of the React-PDF elements in `lib/pdf/components/elements/` but
 * rendered as DOM nodes for the digital companion experience.
 *
 * Brand tokens come from PICC-2024-25-BRAND-BOOK.md:
 *   - Caveat for display + curator's hand
 *   - Inter for body/labels
 *   - Saltwater & Earth palette
 *
 * Twelve elements + AmbientSection wrapper.
 */
'use client'

import type { ReactNode } from 'react'
import { C, SECTION_COLOURS, type SectionKey } from './tokens'
import { BESPOKE, getSectionIcon } from '@/lib/design-system/icons'
import { assetUrl } from '@/lib/media/asset-url'

// Re-export for any consumers still importing from elements
export { C, SECTION_COLOURS }
export type { SectionKey }

// ─────────────────────────────────────────────────────────────────────────────
// AmbientSection — page section with sand-tone paper + corner brackets
// ─────────────────────────────────────────────────────────────────────────────

interface AmbientSectionProps {
  children: ReactNode
  section?: SectionKey
  /** Anchor ID for nav linking */
  id?: string
  /** Vary the background. Defaults to sand-tone cream. */
  variant?: 'paper' | 'dark' | 'photo'
  /** When variant is 'photo', the URL of the background photo */
  photoUrl?: string
}

export function AmbientSection({
  children,
  section = 'all',
  id,
  variant = 'paper',
  photoUrl,
}: AmbientSectionProps) {
  const sectionColour = SECTION_COLOURS[section]

  const bgClass = {
    paper: 'bg-[#FBF8EE]', // sand-tone paper, warm cream blended
    dark: 'bg-[#1A1A2E]',
    photo: 'bg-stone-900',
  }[variant]

  return (
    <section
      id={id}
      className={`relative ${bgClass} overflow-hidden`}
      style={{ scrollMarginTop: 80 }}
    >
      {/* Photo backdrop with sand-tone overlay if variant=photo */}
      {variant === 'photo' && photoUrl && (
        <>
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(45, 35, 25, 0.45)' }} />
        </>
      )}

      {/* Corner brackets — invisible frame */}
      <CornerBracketSet colour={sectionColour} variant={variant} />

      {/* Content */}
      <div className="relative">{children}</div>

      {/* Star Gold thread — continuing graphic element across every section */}
      <div className="relative pb-10 pt-6 flex justify-center" aria-hidden>
        <div style={{ width: 60, height: 1, backgroundColor: '#F5A623', opacity: 0.55 }} />
      </div>
    </section>
  )
}

function CornerBracketSet({ colour, variant }: { colour: string; variant: 'paper' | 'dark' | 'photo' }) {
  const opacity = variant === 'paper' ? 0.18 : 0.55
  const stroke = variant === 'paper' ? colour : '#FFFFFF'
  const size = 28
  const inset = 24
  const positions: Array<{ top?: number; left?: number; right?: number; bottom?: number; corners: string }> = [
    { top: inset, left: inset, corners: 'border-t border-l' },
    { top: inset, right: inset, corners: 'border-t border-r' },
    { bottom: inset, left: inset, corners: 'border-b border-l' },
    { bottom: inset, right: inset, corners: 'border-b border-r' },
  ]

  return (
    <>
      {positions.map((p, i) => (
        <div
          key={i}
          aria-hidden
          className={p.corners}
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
            width: size,
            height: size,
            borderColor: stroke,
            borderWidth: 0,
            opacity,
          }}
        />
      ))}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Cartouche — section opener
// ─────────────────────────────────────────────────────────────────────────────

interface CartoucheProps {
  section: SectionKey
  numeral?: string
  title: string
  subtitle?: string
  promise?: string
  iconUrl?: string
  heroPhotoUrl?: string
}

export function Cartouche({ section, numeral, title, subtitle, promise, iconUrl, heroPhotoUrl }: CartoucheProps) {
  const colour = SECTION_COLOURS[section]
  const wallTint = `${colour}14` // 8% alpha — softer wall

  // Auto-pick the approved SECTION icon when caller didn't pass one.
  const resolvedIcon = iconUrl ?? getSectionIcon(section)

  return (
    <AmbientSection section={section} id={`cartouche-${section}`} variant="paper">
      <div className="relative py-24 md:py-32" style={{ backgroundColor: wallTint }}>
        <div className="max-w-4xl mx-auto px-8 md:px-12 text-center">
          {/* Roman numeral */}
          {numeral && (
            <div
              className="uppercase mb-10"
              style={{ color: colour, opacity: 0.55, letterSpacing: '0.4em', fontSize: 11 }}
            >
              Room {numeral}
            </div>
          )}

          {/* Hero photo or icon */}
          {heroPhotoUrl ? (
            <div className="mb-12 mx-auto max-w-2xl">
              <div className="relative aspect-[16/10] overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroPhotoUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ backgroundColor: colour, opacity: 0.10 }} />
              </div>
            </div>
          ) : resolvedIcon ? (
            <div className="mb-10 mx-auto" style={{ width: 200, height: 200, opacity: 0.40 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolvedIcon} alt="" className="w-full h-full object-contain" />
            </div>
          ) : null}

          {/* Title */}
          <h2
            className="font-fraunces font-bold leading-tight"
            style={{ color: colour, fontSize: 'clamp(48px, 8vw, 84px)' }}
          >
            {title}
          </h2>

          {/* Hairline */}
          <div
            className="mx-auto my-6"
            style={{ width: 60, height: 1, backgroundColor: colour, opacity: 0.6 }}
            aria-hidden
          />

          {/* Subtitle */}
          {subtitle && (
            <p className="font-fraunces" style={{ color: C.earth, opacity: 0.85, fontSize: 'clamp(20px, 2.4vw, 26px)' }}>
              {subtitle}
            </p>
          )}

          {/* Promise */}
          {promise && (
            <p
              className="mt-6 mx-auto leading-relaxed"
              style={{ color: C.driftwood, fontSize: 'clamp(14px, 1.5vw, 16px)', maxWidth: 520 }}
            >
              {promise}
            </p>
          )}
        </div>
      </div>
    </AmbientSection>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Reliquary — single sacred number
// ─────────────────────────────────────────────────────────────────────────────

interface ReliquaryProps {
  section: SectionKey
  numeral: string
  unit: string
  annotation: string
  caption?: string
  substrateUrl?: string
}

export function Reliquary({ section, numeral, unit, annotation, caption, substrateUrl }: ReliquaryProps) {
  const colour = SECTION_COLOURS[section]

  return (
    <div className="relative py-24 md:py-32 overflow-hidden">
      {/* Substrate — centred, fades to transparent at edges so it does NOT
          look like a rectangle. Uses radial-gradient mask. */}
      {substrateUrl && (
        <div
          className="absolute pointer-events-none"
          aria-hidden
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(700px, 92%)',
            aspectRatio: '1 / 1',
            opacity: 0.35,
            WebkitMaskImage:
              'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 80%)',
            maskImage:
              'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 80%)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={substrateUrl} alt="" className="w-full h-full object-contain" />
        </div>
      )}

      {/* Constellation seed dots — quieter */}
      <ConstellationDots count={7} opacity={0.06} />

      <div className="relative text-center px-8">
        <div
          className="font-fraunces font-bold leading-none mx-auto"
          style={{ color: colour, fontSize: 'clamp(120px, 20vw, 200px)', letterSpacing: '-0.02em' }}
        >
          {numeral}
        </div>

        <div
          className="mt-2 uppercase font-medium"
          style={{ color: C.driftwood, fontSize: 11, letterSpacing: '0.3em' }}
        >
          {unit}
        </div>

        {/* Star marker */}
        <div className="mt-4 flex justify-center">
          <Star size={12} fill={C.starGold} />
        </div>

        <p
          className="mt-6 mx-auto font-caveat leading-tight"
          style={{ color: C.earth, opacity: 0.82, fontSize: 'clamp(18px, 2vw, 24px)', maxWidth: 380 }}
        >
          {annotation}
        </p>

        {caption && (
          <p
            className="mt-6 uppercase"
            style={{ color: C.muted, fontSize: 9, letterSpacing: '0.2em' }}
          >
            {caption}
          </p>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Lantern — Elder voice (sacred, refuses section colour)
// ─────────────────────────────────────────────────────────────────────────────

interface LanternProps {
  quote: string
  speaker: string
  role: string
  side?: 'left' | 'right'
  portraitUrl?: string
  consent?: string
  date?: string
}

export function Lantern({
  quote,
  speaker,
  role,
  side = 'left',
  portraitUrl,
  consent = 'Recorded with consent · Validated · Empathy Ledger',
  date,
}: LanternProps) {
  return (
    <div
      className="relative py-12 md:py-16 px-8 md:px-16 my-8 md:my-12"
      style={{
        backgroundColor: C.sand,
        marginLeft: side === 'left' ? 0 : 'auto',
        marginRight: side === 'right' ? 0 : 'auto',
        maxWidth: '88%',
      }}
    >
      {/* Anchor dot cluster */}
      <DotCluster colour={C.turtleRed} className="absolute top-4 left-4" />

      <div className="relative">
        {/* Approved bespoke quote icon — sacred Elder voice marker */}
        <div className="mb-4" style={{ width: 44, height: 44, opacity: 0.85 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BESPOKE.quote} alt="" className="w-full h-full object-contain" />
        </div>

        <p
          className="font-fraunces italic leading-relaxed"
          style={{ color: C.earth, fontSize: 'clamp(20px, 2.4vw, 28px)', maxWidth: 560 }}
        >
          {quote}
        </p>

        <div className="mt-6 flex items-center gap-3">
          {portraitUrl && (
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portraitUrl} alt={speaker} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <div className="font-fraunces" style={{ color: C.turtleRed, fontSize: 18, opacity: 0.85 }}>
              — {speaker}
            </div>
            <div style={{ color: C.driftwood, fontSize: 11, marginTop: 2 }}>
              {role}
              {date && ` · ${date}`}
            </div>
          </div>
        </div>

        <div style={{ color: C.muted, fontSize: 9, marginTop: 16, letterSpacing: 0.3 }}>
          {consent}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Hearth — Community voice with portrait
// ─────────────────────────────────────────────────────────────────────────────

interface HearthProps {
  section: SectionKey
  quote: string
  speaker: string
  role: string
  portraitUrl?: string
  date?: string
}

export function Hearth({ section, quote, speaker, role, portraitUrl, date }: HearthProps) {
  const colour = SECTION_COLOURS[section]
  return (
    <div
      className="relative p-6 md:p-8 my-6 rounded-md"
      style={{ backgroundColor: '#FBF6E4', borderTop: `2px solid ${colour}` }}
    >
      <div className="flex gap-5">
        {portraitUrl ? (
          <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-sm overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portraitUrl} alt={speaker} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 flex items-center justify-center rounded-sm"
            style={{ backgroundColor: C.shell }}
          >
            <span className="font-fraunces" style={{ color: colour, opacity: 0.6, fontSize: 32 }}>
              {speaker
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </span>
          </div>
        )}

        <div className="flex-1">
          {/* Approved bespoke quote icon */}
          <div className="mb-2" style={{ width: 24, height: 24, opacity: 0.7 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BESPOKE.quote} alt="" className="w-full h-full object-contain" />
          </div>
          <p className="font-fraunces italic leading-snug" style={{ color: C.rock, fontSize: 16 }}>
            {quote}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <Star size={8} fill={colour} />
            <div>
              <div className="font-bold uppercase" style={{ color: C.rock, fontSize: 11, letterSpacing: 0.5 }}>
                {speaker}
              </div>
              <div style={{ color: C.driftwood, fontSize: 10 }}>
                {role}
                {date && ` · ${date}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Horizon — Forward commitment
// ─────────────────────────────────────────────────────────────────────────────

interface HorizonProps {
  section: SectionKey
  year: string
  title: string
  statement: string
  detail: string
}

export function Horizon({ section, year, title, statement, detail }: HorizonProps) {
  const colour = SECTION_COLOURS[section]
  return (
    <div
      className="relative my-6 p-6 md:p-10 rounded-md overflow-hidden"
      style={{
        background: `linear-gradient(180deg, transparent 0%, transparent 30%, ${colour}10 100%)`,
        minHeight: 200,
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <div className="uppercase font-bold" style={{ color: colour, fontSize: 9, letterSpacing: '0.2em' }}>
            Forward Commitment
          </div>
          <h3 className="font-fraunces font-bold leading-tight mt-1" style={{ color: C.ocean, fontSize: 24 }}>
            {title}
          </h3>
        </div>
        <div className="text-right">
          <div className="uppercase" style={{ color: C.muted, fontSize: 8, letterSpacing: '0.25em' }}>
            By
          </div>
          <div className="font-fraunces font-bold leading-none" style={{ color: colour, fontSize: 48 }}>
            {year}
          </div>
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: colour, opacity: 0.4, margin: '8px 0 16px' }} />

      <p className="font-fraunces leading-relaxed" style={{ color: C.earth, fontSize: 18, maxWidth: 480 }}>
        {statement}
      </p>

      <p className="mt-3" style={{ color: C.driftwood, fontSize: 13, maxWidth: 480 }}>
        {detail}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Vitrine — display case for a fact
// ─────────────────────────────────────────────────────────────────────────────

interface VitrineProps {
  section: SectionKey
  value: string
  label: string
  caption?: string
}

export function Vitrine({ section, value, label, caption }: VitrineProps) {
  const colour = SECTION_COLOURS[section]
  return (
    <div className="relative px-3 py-6 text-center">
      <div className="font-fraunces font-bold leading-none" style={{ color: colour, fontSize: 'clamp(28px, 4vw, 40px)' }}>
        {value}
      </div>
      <div
        className="mt-3 uppercase"
        style={{ color: C.driftwood, fontSize: 9, letterSpacing: '0.15em' }}
      >
        {label}
      </div>
      {caption && (
        <div className="mt-1 font-caveat" style={{ color: C.earth, opacity: 0.7, fontSize: 12 }}>
          {caption}
        </div>
      )}
      <div
        className="mx-auto mt-3"
        style={{ width: '40%', height: 1, backgroundColor: colour, opacity: 0.5 }}
      />
    </div>
  )
}

interface VitrineTriptychProps {
  section: SectionKey
  vitrines: Array<Omit<VitrineProps, 'section'>>
}

export function VitrineTriptych({ section, vitrines }: VitrineTriptychProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
      {vitrines.map((v, i) => (
        <Vitrine key={i} section={section} {...v} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Fold — photo plate
// ─────────────────────────────────────────────────────────────────────────────

interface FoldProps {
  section: SectionKey
  photoUrl: string
  caption: string
  name?: string
  consent?: string
  date?: string
  shape?: 'portrait' | 'landscape' | 'country'
}

export function Fold({
  section,
  photoUrl,
  caption,
  name,
  consent = 'Recorded with consent · Empathy Ledger',
  date,
  shape = 'landscape',
}: FoldProps) {
  const colour = SECTION_COLOURS[section]
  const aspectClass = shape === 'portrait' ? 'aspect-[3/4]' : shape === 'country' ? 'aspect-[16/10]' : 'aspect-[3/2]'

  return (
    <div className="my-6">
      <div className={`relative ${aspectClass} overflow-hidden rounded-md`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt={caption} className="w-full h-full object-cover" />
        <CornerBracketSet colour="#FFFFFF" variant="photo" />
      </div>

      <div className="mt-3 flex justify-between items-start gap-3">
        <div className="flex-1">
          <p className="font-fraunces" style={{ color: C.earth, opacity: 0.85, fontSize: 16 }}>
            {caption}
          </p>
          {name && shape !== 'country' && (
            <div className="mt-1 uppercase font-bold" style={{ color: C.rock, fontSize: 10, letterSpacing: '0.1em' }}>
              {name}
            </div>
          )}
        </div>
        <div className="text-right max-w-[180px]">
          <div style={{ color: C.muted, fontSize: 9 }}>{consent}</div>
          {date && <div style={{ color: C.muted, fontSize: 9, marginTop: 2 }}>{date}</div>}
        </div>
      </div>

      <div className="mt-2" style={{ height: 1.5, backgroundColor: colour, opacity: 0.5, width: shape === 'landscape' ? '100%' : '40%' }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Margin Note — curator's whisper
// ─────────────────────────────────────────────────────────────────────────────

export function MarginNote({ text, ink = 'earth' }: { text: string; ink?: 'earth' | 'ochre' }) {
  const colour = ink === 'ochre' ? C.ochre : C.earth
  return (
    <div className="flex items-start gap-2 my-4 max-w-md">
      <div className="flex items-center mt-2 gap-1">
        <span style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colour, opacity: 0.55 }} />
        <span style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: colour, opacity: 0.4 }} />
        <span style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: colour, opacity: 0.25 }} />
      </div>
      <p className="font-fraunces leading-snug" style={{ color: colour, fontSize: 14, opacity: 0.85 }}>
        {text}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — Star, ConstellationDots, DotCluster
// ─────────────────────────────────────────────────────────────────────────────

function Star({ size = 8, fill = C.starGold }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden>
      <path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill={fill} />
    </svg>
  )
}

function ConstellationDots({ count = 12, opacity = 0.06, color = C.starGold }: { count?: number; opacity?: number; color?: string }) {
  // Deterministic positions
  const seed = count * 7
  const dots = Array.from({ length: count }, (_, i) => {
    const x = Math.abs(Math.sin(seed + i * 9.7)) * 90 + 5
    const y = Math.abs(Math.cos(seed + i * 13.3)) * 90 + 5
    const size = 2 + Math.abs(Math.sin(seed + i * 5)) * 2
    return { top: `${y}%`, left: `${x}%`, size }
  })
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{ top: d.top, left: d.left, width: d.size, height: d.size, backgroundColor: color, opacity }}
        />
      ))}
    </div>
  )
}

function DotCluster({ colour, className }: { colour: string; className?: string }) {
  return (
    <div className={`grid grid-cols-3 gap-1 w-7 h-7 ${className ?? ''}`} aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="block rounded-full" style={{ width: 3, height: 3, backgroundColor: colour, opacity: 0.65 }} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Cover — opening page
// ─────────────────────────────────────────────────────────────────────────────

interface CoverProps {
  title: string
  subtitle: string
  yearTag: string
  /** Optional still image used as poster + fallback when no video. */
  photoUrl?: string
  /** When provided, plays as the hero loop. Falls back to photoUrl on slow connection. */
  videoUrl?: string
}

export function Cover({ title, subtitle, yearTag, photoUrl, videoUrl }: CoverProps) {
  return (
    <section
      className="relative flex flex-col justify-center items-center text-center text-white overflow-hidden"
      style={{ height: '95vh', minHeight: 700 }}
    >
      {videoUrl ? (
        <video
          src={videoUrl}
          poster={photoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center center' }}
        />
      ) : photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 35%' }}
        />
      ) : null}

      {/* Even darker centre wash so type sits cleanly */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(45,35,25,0.65) 0%, rgba(45,35,25,0.45) 40%, rgba(45,35,25,0.30) 70%, rgba(45,35,25,0.55) 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        <div
          className="uppercase mb-6"
          style={{ fontSize: 11, letterSpacing: '0.4em', opacity: 0.92 }}
        >
          Palm Island Community Company
        </div>

        {/* Title — constrained width keeps "Many tribes, one people." holding together */}
        <h1
          className="font-fraunces font-bold leading-none"
          style={{
            fontSize: 'clamp(56px, 9vw, 110px)',
            textShadow: '0 6px 40px rgba(0,0,0,0.6)',
            maxWidth: '14ch',
          }}
        >
          {title}
        </h1>

        {/* Hairline rule — Star Gold thread, repeats across sections as the graphic element */}
        <div
          className="mt-8 mb-6"
          style={{ width: 80, height: 1, backgroundColor: '#F5A623', opacity: 0.85 }}
          aria-hidden
        />

        <p className="font-light max-w-xl mx-auto" style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', opacity: 0.95 }}>
          {subtitle}
        </p>

        <div
          className="mt-10 uppercase"
          style={{ fontSize: 10, letterSpacing: '0.4em', opacity: 0.85 }}
        >
          {yearTag}
        </div>

        {/* Logo — bottom of text stack, transparent PNG */}
        <div className="mt-12 md:mt-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/picc-logo-transparent.png"
            alt="Palm Island Community Company"
            style={{
              width: 'clamp(80px, 7vw, 120px)',
              height: 'auto',
              filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.4))',
            }}
          />
        </div>
      </div>

      {/* Scroll cue at bottom corner — quiet, suggests gallery walk continues */}
      <div
        className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 z-10 pointer-events-none"
        style={{ opacity: 0.55 }}
        aria-hidden
      >
        <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Scroll</div>
        <div style={{ width: 1, height: 24, backgroundColor: 'white' }} />
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Acknowledgement
// ─────────────────────────────────────────────────────────────────────────────

interface AcknowledgementProps {
  body: string
}

/**
 * Acknowledgement of Country — painted-hero treatment.
 *
 * The brush-textured island/horizon PNG (approved infographic
 * #06-stat-hero-horizon, intended use "Use for the acknowledgement")
 * carries the full visual weight. Acknowledgement text sits over the
 * painted sky in a quiet centered column. Closing "Bwgcolman" line
 * anchors the painted island band at the foot.
 */
export function Acknowledgement({ body }: AcknowledgementProps) {
  const heroUrl = assetUrl('/icons/picc/infographics/06-stat-hero-horizon.png')

  return (
    <section
      id="acknowledgement"
      className="relative w-full overflow-hidden"
      aria-label="Acknowledgement of Country"
      style={{ minHeight: '92vh' }}
    >
      {/* Painted backdrop — full bleed, fixed-aspect art bottom-anchored
          so the painted island sits along the foot of the section while
          the sky climbs into the upper text area. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-bottom"
      />

      {/* Sky scrim — soft cream wash over the upper third so the
          acknowledgement copy stays readable without hiding the brush. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0"
        style={{
          height: '55%',
          background: 'linear-gradient(180deg, rgba(251, 248, 238, 0.78) 0%, rgba(251, 248, 238, 0.45) 65%, rgba(251, 248, 238, 0) 100%)',
        }}
      />

      {/* Eyebrow + body — anchored to the upper portion (sky band) */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 md:px-12 md:pt-28 text-center">
        <div
          className="uppercase mb-6"
          style={{
            color: C.turtleRed,
            opacity: 0.75,
            letterSpacing: '0.4em',
            fontSize: 'clamp(10px, 1.1vw, 12px)',
          }}
        >
          Acknowledgement of Country
        </div>

        <p
          className="leading-relaxed"
          style={{
            color: C.earth,
            fontSize: 'clamp(15px, 1.6vw, 18px)',
            whiteSpace: 'pre-line',
            maxWidth: '60ch',
          }}
        >
          {body}
        </p>
      </div>

      {/* Closing line — sits over the painted island band at the foot */}
      <div className="absolute inset-x-0 bottom-[8%] flex justify-center px-6 z-10">
        <div
          className="font-fraunces text-center"
          style={{
            color: C.midnight,
            fontSize: 'clamp(28px, 4.5vw, 56px)',
            lineHeight: 1.05,
            textShadow: '0 2px 12px rgba(255, 255, 255, 0.55)',
          }}
        >
          Bwgcolman — many tribes, one people.
        </div>
      </div>
    </section>
  )
}
