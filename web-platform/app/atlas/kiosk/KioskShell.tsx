'use client'

/**
 * KioskShell — the always-on TV surface.
 *
 * Two states:
 *   - attract  · ambient cycling frames, no UI chrome
 *   - active   · interactive Atlas surface, with a "Done" button
 *
 * Behaviour:
 *   - any pointer / key event in attract → enter active
 *   - 90 s of no input in active → return to attract
 *   - "Done" → return to attract immediately
 *   - first user gesture also requests fullscreen
 *
 * The attract loop is a slow cross-fade through frames built from the
 * payload — featured faces, theme moments, year highlights, community
 * visions, foundation events. ~10 s per frame.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Constellation from '../../picc/constellation/Constellation'
import type { ConstellationPayload, FaceNode } from '@/lib/constellation/types'

const IDLE_RESET_MS = 90_000 // 90 s
const FRAME_INTERVAL_MS = 10_000 // 10 s

interface Props {
  data: ConstellationPayload
}

type Frame =
  | { kind: 'face'; face: FaceNode }
  | { kind: 'theme'; key: string; label: string; quote: string | null; attribution: string | null }
  | { kind: 'year'; year: number; title: string; subtitle: string | null }
  | { kind: 'vision'; text: string; author: string | null }
  | { kind: 'foundation'; year: number; title: string }
  | {
      kind: 'tagline'
      heading: string
      body: string
    }

export default function KioskShell({ data }: Props) {
  const [state, setState] = useState<'attract' | 'active'>('attract')
  const [frameIdx, setFrameIdx] = useState(0)
  const idleTimerRef = useRef<number | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Build the attract-loop frame list once.
  const frames: Frame[] = useMemo(() => {
    const out: Frame[] = []

    out.push({
      kind: 'tagline',
      heading: 'Bwgcolman',
      body: 'Many tribes, one people.',
    })

    // Featured faces (Elders + featured storytellers)
    for (const f of data.faces.slice(0, 12)) {
      if (f.is_elder || f.is_featured) out.push({ kind: 'face', face: f })
    }

    // Top themes with a quote
    for (const t of data.themes.slice(0, 6)) {
      const q = t.top_quotes[0]
      out.push({
        kind: 'theme',
        key: t.key,
        label: t.label,
        quote: q?.text ?? null,
        attribution: q?.attribution ?? null,
      })
    }

    // Year highlights
    for (const y of data.years.slice(-6).reverse()) {
      if (!y.report_title) continue
      out.push({
        kind: 'year',
        year: y.fiscal_year,
        title: y.report_title,
        subtitle: y.report_subtitle,
      })
    }

    // Community visions
    for (const v of data.visions.slice(0, 4)) {
      out.push({ kind: 'vision', text: v.text, author: v.author_name })
    }

    // Foundation
    for (const f of data.foundation.slice(0, 4)) {
      out.push({ kind: 'foundation', year: f.year, title: f.title })
    }

    out.push({
      kind: 'tagline',
      heading: 'Every face here has said yes.',
      body: 'Every theme here was named by community.',
    })

    return out.length > 0
      ? out
      : [{ kind: 'tagline', heading: 'Palm Island Living Atlas', body: 'Loading…' }]
  }, [data])

  // Frame ticker — only runs while in attract state.
  useEffect(() => {
    if (state !== 'attract') return
    const id = window.setInterval(() => {
      setFrameIdx((i) => (i + 1) % frames.length)
    }, FRAME_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [state, frames.length])

  const goActive = useCallback(async () => {
    if (state === 'active') return
    setState('active')
    // First user gesture — request fullscreen if not already.
    try {
      if (!document.fullscreenElement && wrapperRef.current) {
        await wrapperRef.current.requestFullscreen()
      }
    } catch {
      // some browsers will refuse — ignore.
    }
  }, [state])

  const resetToAttract = useCallback(() => {
    setState('attract')
    setFrameIdx(0)
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }, [])

  // Idle reset while in active state.
  useEffect(() => {
    if (state !== 'active') return
    function bumpIdle() {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = window.setTimeout(resetToAttract, IDLE_RESET_MS)
    }
    bumpIdle()
    const events: (keyof DocumentEventMap)[] = [
      'mousemove',
      'mousedown',
      'touchstart',
      'keydown',
      'wheel',
    ]
    events.forEach((e) => document.addEventListener(e, bumpIdle, { passive: true }))
    return () => {
      events.forEach((e) => document.removeEventListener(e, bumpIdle))
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current)
    }
  }, [state, resetToAttract])

  return (
    <div
      ref={wrapperRef}
      className="bg-cream min-h-screen flex flex-col"
      onClick={state === 'attract' ? goActive : undefined}
      onKeyDown={state === 'attract' ? goActive : undefined}
      role={state === 'attract' ? 'button' : undefined}
      tabIndex={state === 'attract' ? 0 : undefined}
      style={{ cursor: state === 'attract' ? 'pointer' : 'auto' }}
    >
      {state === 'attract' ? (
        <AttractLoop frames={frames} frameIdx={frameIdx} />
      ) : (
        <ActiveAtlas data={data} onDone={resetToAttract} />
      )}
    </div>
  )
}

function AttractLoop({
  frames,
  frameIdx,
}: {
  frames: Frame[]
  frameIdx: number
}) {
  const frame = frames[frameIdx] ?? frames[0]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center"
      style={{
        background:
          'linear-gradient(180deg, #FBF6EE 0%, #F4E9DC 50%, #EDD6BA 100%)',
      }}>
      <div className="absolute top-6 left-6 text-[11px] uppercase tracking-[0.3em] text-ochre font-bold">
        Palm Island Living Atlas
      </div>
      <div className="absolute top-6 right-6 text-[11px] text-stone-500 italic">
        Tap anywhere to explore
      </div>

      <div
        key={frameIdx}
        className="max-w-3xl mx-auto"
        style={{ animation: 'kiosk-fade 1.2s ease' }}
      >
        <FrameView frame={frame} />
      </div>

      {/* progress dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
        {frames.map((_, i) => (
          <span
            key={i}
            className="inline-block rounded-full"
            style={{
              width: 6,
              height: 6,
              backgroundColor: i === frameIdx ? '#2D5F4F' : '#D4C4A8',
              transition: 'background-color 300ms ease',
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes kiosk-fade {
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

function FrameView({ frame }: { frame: Frame }) {
  switch (frame.kind) {
    case 'tagline':
      return (
        <>
          <h1 className="font-serif text-5xl md:text-7xl text-charcoal mb-4 leading-tight">
            {frame.heading}
          </h1>
          <p className="font-serif italic text-stone-700 text-xl md:text-2xl">
            {frame.body}
          </p>
        </>
      )
    case 'face':
      return (
        <div className="flex flex-col items-center">
          <img
            src={frame.face.avatar_url}
            alt=""
            className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover shadow-2xl mb-6"
            style={{
              border: `4px solid ${frame.face.is_elder ? '#B8860B' : '#FBF6EE'}`,
            }}
          />
          <div className="font-serif text-3xl md:text-4xl text-charcoal mb-2">
            {frame.face.name ?? 'Storyteller'}
          </div>
          {frame.face.role && (
            <div className="text-stone-600 text-lg">{frame.face.role}</div>
          )}
          {frame.face.cultural_background && (
            <div className="text-stone-500 text-sm mt-1 italic">
              {frame.face.cultural_background}
            </div>
          )}
        </div>
      )
    case 'theme':
      return (
        <>
          <div className="text-[12px] uppercase tracking-[0.3em] text-ochre font-bold mb-2">
            Theme
          </div>
          <h2 className="font-serif text-5xl text-charcoal mb-6">{frame.label}</h2>
          {frame.quote && (
            <blockquote className="font-serif italic text-xl md:text-2xl text-stone-700 leading-relaxed border-l-2 border-ochre pl-6 max-w-2xl mx-auto text-left">
              “{frame.quote}”
              {frame.attribution && (
                <div className="text-base text-stone-500 mt-3 not-italic">
                  — {frame.attribution}
                </div>
              )}
            </blockquote>
          )}
        </>
      )
    case 'year':
      return (
        <>
          <div className="font-serif text-7xl md:text-8xl text-sage-700 mb-4"
            style={{ color: '#2D5F4F' }}>
            FY {frame.year}
          </div>
          <h2 className="font-serif text-3xl text-charcoal mb-2">{frame.title}</h2>
          {frame.subtitle && (
            <p className="text-stone-600 text-lg">{frame.subtitle}</p>
          )}
        </>
      )
    case 'vision':
      return (
        <>
          <div className="text-[12px] uppercase tracking-[0.3em] font-bold mb-3"
            style={{ color: '#2D5F4F' }}>
            Vision · the next 20 years
          </div>
          <blockquote className="font-serif italic text-2xl md:text-3xl text-stone-800 leading-relaxed max-w-2xl mx-auto">
            “{frame.text}”
          </blockquote>
          {frame.author && (
            <div className="text-stone-500 mt-4 text-lg">— {frame.author}</div>
          )}
        </>
      )
    case 'foundation':
      return (
        <>
          <div className="font-serif text-7xl md:text-8xl mb-4"
            style={{ color: '#8B1A1A' }}>
            {frame.year}
          </div>
          <h2 className="font-serif text-3xl text-charcoal mb-3">{frame.title}</h2>
          <div className="text-stone-600 italic text-base">
            The foundation. Bwgcolman remembers.
          </div>
        </>
      )
  }
}

function ActiveAtlas({
  data,
  onDone,
}: {
  data: ConstellationPayload
  onDone: () => void
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="text-[10px] uppercase tracking-[0.3em] text-ochre font-bold">
          PICC Atlas · Kiosk Mode
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/atlas/capture"
            className="text-xs underline text-sage-700"
          >
            Share a thought
          </Link>
          <button
            type="button"
            onClick={onDone}
            className="text-xs px-3 py-1.5 rounded-md font-semibold text-white"
            style={{ backgroundColor: '#2D5F4F' }}
          >
            Done
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Constellation data={data} variant="atlas" />
      </div>
    </div>
  )
}
