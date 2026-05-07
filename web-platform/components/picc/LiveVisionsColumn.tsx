'use client'

import { useEffect, useState, useRef } from 'react'
import { Sparkles, Quote } from 'lucide-react'

/**
 * Live-polling Community Visions column for the /picc/next-20 canvas.
 *
 * Calls /api/community-visions?status=approved every POLL_MS and
 * animates new entries in. Designed for the leader meeting: an
 * Elder signs on /sign-the-vision, Rachel approves on /picc/vision,
 * the new line lights up here without anyone reaching for refresh.
 */

interface Vision {
  id: string
  vision_text: string
  category: string | null
  author_name: string | null
  is_anonymous: boolean
  approved_at: string | null
  created_at: string
}

const POLL_MS = 8_000
const FLASH_MS = 6_000

const CATEGORY_TINT: Record<string, string> = {
  culture: '#8B1A1A',
  youth: '#0EA5E9',
  services: '#0B4F6C',
  governance: '#8B1A1A',
  economic: '#F5A623',
  environment: '#15803D',
  other: '#6B6560',
}

interface Props {
  initial: Vision[]
}

export default function LiveVisionsColumn({ initial }: Props) {
  const [visions, setVisions] = useState<Vision[]>(initial)
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set())
  const seenIds = useRef<Set<string>>(new Set(initial.map((v) => v.id)))
  const [stale, setStale] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function tick() {
      try {
        const res = await fetch('/api/community-visions?status=approved', { cache: 'no-store' })
        if (!res.ok) {
          setStale(true)
          return
        }
        setStale(false)
        const data = (await res.json()) as Vision[]
        if (cancelled) return
        const fresh: Vision[] = []
        const newlyArrived: string[] = []
        for (const v of data) {
          fresh.push(v)
          if (!seenIds.current.has(v.id)) {
            seenIds.current.add(v.id)
            newlyArrived.push(v.id)
          }
        }
        // Sort: newest approved_at first, fallback to created_at
        fresh.sort((a, b) => {
          const ta = new Date(a.approved_at || a.created_at).getTime()
          const tb = new Date(b.approved_at || b.created_at).getTime()
          return tb - ta
        })
        setVisions(fresh)
        if (newlyArrived.length > 0) {
          setFlashIds((prev) => {
            const next = new Set(prev)
            newlyArrived.forEach((id) => next.add(id))
            return next
          })
          // Clear flash after FLASH_MS
          setTimeout(() => {
            if (cancelled) return
            setFlashIds((prev) => {
              const next = new Set(prev)
              newlyArrived.forEach((id) => next.delete(id))
              return next
            })
          }, FLASH_MS)
        }
      } catch {
        setStale(true)
      }
    }

    const id = setInterval(tick, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return (
    <div>
      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-4 text-[11px] font-bold uppercase tracking-[0.2em]">
        <span className="relative flex w-2 h-2">
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${
              stale ? 'bg-stone-300' : 'bg-emerald-500 animate-ping opacity-75'
            }`}
          />
          <span
            className={`relative inline-flex w-2 h-2 rounded-full ${
              stale ? 'bg-stone-400' : 'bg-emerald-500'
            }`}
          />
        </span>
        <span style={{ color: stale ? '#A39E99' : '#15803D' }}>
          {stale ? 'Reconnecting…' : 'Live · refreshing every 8s'}
        </span>
      </div>

      {visions.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
          No approved visions yet. Sign the canvas at{' '}
          <a href="/sign-the-vision" className="font-bold underline" style={{ color: '#0B4F6C' }}>
            /sign-the-vision
          </a>{' '}
          and approve via{' '}
          <a href="/picc/vision" className="font-bold underline" style={{ color: '#0B4F6C' }}>
            /picc/vision
          </a>
          .
        </div>
      ) : (
        <ul className="space-y-3">
          {visions.map((v) => {
            const flashing = flashIds.has(v.id)
            const tint = CATEGORY_TINT[v.category || 'other'] || CATEGORY_TINT.other
            return (
              <li
                key={v.id}
                className={`rounded-xl border p-4 bg-white transition-all ${
                  flashing ? 'shadow-lg' : ''
                }`}
                style={{
                  borderColor: flashing ? '#15803D' : '#E8E6E3',
                  borderWidth: flashing ? 2 : 1,
                  animation: flashing ? 'pulse-emerald 2s ease-in-out 3' : undefined,
                }}
              >
                {flashing && (
                  <div
                    className="inline-flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-[0.3em]"
                    style={{ color: '#15803D' }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Just signed
                  </div>
                )}
                <Quote className="w-4 h-4 mb-2" style={{ color: tint, opacity: 0.6 }} />
                <p className="font-serif italic leading-snug mb-3" style={{ color: '#0B4F6C', fontSize: 17 }}>
                  &ldquo;{v.vision_text}&rdquo;
                </p>
                <div className="flex items-center justify-between text-[11px]">
                  <span style={{ color: '#6B6560' }}>
                    {v.is_anonymous || !v.author_name ? 'Anonymous' : v.author_name}
                  </span>
                  {v.category && (
                    <span
                      className="uppercase font-bold tracking-widest"
                      style={{ color: tint, fontSize: 9, letterSpacing: '0.2em' }}
                    >
                      {v.category}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <style jsx>{`
        @keyframes pulse-emerald {
          0%, 100% { box-shadow: 0 0 0 0 rgba(21, 128, 61, 0); }
          50% { box-shadow: 0 0 0 6px rgba(21, 128, 61, 0.15); }
        }
      `}</style>
    </div>
  )
}
