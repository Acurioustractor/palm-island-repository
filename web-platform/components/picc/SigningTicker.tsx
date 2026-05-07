'use client'

import { useEffect, useState, useRef } from 'react'

/**
 * Live ticker on /sign-the-vision — shows total signatures + recent
 * activity, auto-refreshing so a signer sees their own and other
 * contributions land in real time during the leader meeting.
 */

interface Vision {
  id: string
  vision_text: string
  author_name: string | null
  is_anonymous: boolean
  category: string | null
  is_approved: boolean
  created_at: string
}

const POLL_MS = 6_000

export default function SigningTicker() {
  const [total, setTotal] = useState<number | null>(null)
  const [pending, setPending] = useState<number | null>(null)
  const [latest, setLatest] = useState<Vision | null>(null)
  const lastSeenIdRef = useRef<string | null>(null)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function tick() {
      try {
        const [allRes, pendingRes] = await Promise.all([
          fetch('/api/community-visions?limit=200', { cache: 'no-store' }),
          fetch('/api/community-visions?status=pending&limit=1', { cache: 'no-store' }),
        ])
        if (cancelled) return
        if (allRes.ok) {
          const data = (await allRes.json()) as Vision[]
          setTotal(data.length)
          const newest = data[0]
          if (newest) {
            if (lastSeenIdRef.current && lastSeenIdRef.current !== newest.id) {
              setFlash(true)
              setTimeout(() => !cancelled && setFlash(false), 5_000)
            }
            lastSeenIdRef.current = newest.id
            setLatest(newest)
          }
        }
        if (pendingRes.ok) {
          const data = (await pendingRes.json()) as Vision[]
          setPending(data.length)
        }
      } catch {
        /* silent — ticker is decorative */
      }
    }

    tick()
    const id = setInterval(tick, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return (
    <div
      className="rounded-xl border-2 transition-all overflow-hidden"
      style={{
        borderColor: flash ? '#15803D' : '#E8E6E3',
        backgroundColor: '#fff',
      }}
    >
      <div className="px-5 py-4 md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="relative flex w-2 h-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 animate-ping opacity-75"
              />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            <div className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: '#15803D' }}>
              Live · canvas
            </div>
          </div>
          <div className="flex items-baseline gap-5 text-sm">
            <span style={{ color: '#6B6560' }}>
              <strong style={{ color: '#0B4F6C', fontSize: 18 }}>
                {total === null ? '—' : total}
              </strong>{' '}
              signed
            </span>
            <span style={{ color: '#6B6560' }}>
              <strong style={{ color: '#8B1A1A', fontSize: 18 }}>
                {pending === null ? '—' : pending}
              </strong>{' '}
              awaiting Elder review
            </span>
          </div>
        </div>
        {latest && (
          <div className="mt-4 pt-4 border-t border-stone-100 text-sm">
            <div
              className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1"
              style={{ color: flash ? '#15803D' : '#6B6560' }}
            >
              {flash ? 'Just signed' : 'Most recent'}
            </div>
            <p
              className="font-serif italic leading-snug"
              style={{ color: '#0B4F6C', fontSize: 16 }}
            >
              &ldquo;{latest.vision_text.length > 200 ? latest.vision_text.slice(0, 197) + '…' : latest.vision_text}&rdquo;
            </p>
            <p className="mt-1 text-xs" style={{ color: '#6B6560' }}>
              — {latest.is_anonymous || !latest.author_name ? 'Anonymous' : latest.author_name}
              {latest.category && (
                <span className="ml-2 capitalize" style={{ color: '#8B1A1A' }}>
                  · {latest.category}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
