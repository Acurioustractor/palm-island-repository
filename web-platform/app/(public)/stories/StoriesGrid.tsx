'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export type TypeKey =
  | 'all'
  | 'community_story'
  | 'challenge_overcome'
  | 'elder_wisdom'
  | 'service'
  | 'other'

export interface StoryCard {
  id: string
  title: string
  excerpt: string
  type: TypeKey
  typeLabel: string
  typeColour: string
  storyteller_name: string | null
  featured_image_url: string | null
  is_featured: boolean
  date: string | null
}

interface Props {
  cards: StoryCard[]
  typeLabels: Record<TypeKey, { label: string; colour: string; blurb: string }>
  counts: Record<TypeKey, number>
}

const FILTER_ORDER: TypeKey[] = [
  'all',
  'community_story',
  'challenge_overcome',
  'elder_wisdom',
  'service',
  'other',
]

export default function StoriesGrid({ cards, typeLabels, counts }: Props) {
  const [active, setActive] = useState<TypeKey>('all')

  const filtered = useMemo(() => {
    if (active === 'all') return cards
    return cards.filter((c) => c.type === active)
  }, [active, cards])

  const meta = typeLabels[active]

  return (
    <section className="px-6 md:px-12 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {FILTER_ORDER.filter((k) => counts[k] > 0).map((k) => {
            const isActive = active === k
            const m = typeLabels[k]
            return (
              <button
                key={k}
                type="button"
                onClick={() => setActive(k)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition"
                style={{
                  backgroundColor: isActive ? m.colour : '#fff',
                  color: isActive ? '#fff' : m.colour,
                  border: `1px solid ${m.colour}`,
                  letterSpacing: '0.15em',
                }}
              >
                {m.label}
                <span
                  className="text-[10px] font-mono px-1.5 py-0 rounded-full"
                  style={{
                    backgroundColor: isActive ? '#ffffff33' : m.colour + '22',
                    color: isActive ? '#fff' : m.colour,
                  }}
                >
                  {counts[k]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active section blurb */}
        <p
          className="font-fraunces mb-8"
          style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.55 }}
        >
          {meta.blurb}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center"
            style={{ borderColor: C.border, color: C.driftwood }}
          >
            No stories in this collection yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <Link
                key={c.id}
                href={`/stories/${c.id}`}
                className="group block rounded-2xl overflow-hidden border bg-white hover:shadow-md transition"
                style={{ borderColor: C.border }}
              >
                {c.featured_image_url ? (
                  <div className="aspect-[16/10] relative" style={{ backgroundColor: C.shell }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.featured_image_url}
                      alt={c.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div
                    className="aspect-[16/10] flex items-center justify-center p-4 text-center"
                    style={{ backgroundColor: c.typeColour + '15' }}
                  >
                    <div
                      className="font-fraunces font-bold leading-tight"
                      style={{ color: c.typeColour, fontSize: 20 }}
                    >
                      {c.title}
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className="inline-block text-[10px] uppercase font-bold tracking-[0.2em] px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: c.typeColour + '22',
                        color: c.typeColour,
                        letterSpacing: '0.15em',
                      }}
                    >
                      {c.typeLabel}
                    </span>
                    {c.is_featured && (
                      <span
                        className="inline-block text-[10px] uppercase font-bold tracking-[0.2em] px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: C.starGold,
                          color: C.midnight,
                          letterSpacing: '0.15em',
                        }}
                      >
                        Featured
                      </span>
                    )}
                  </div>
                  <h3
                    className="font-fraunces font-bold leading-tight mb-2"
                    style={{ color: C.ocean, fontSize: 18 }}
                  >
                    {c.title}
                  </h3>
                  <p className="text-sm mb-3" style={{ color: C.driftwood, lineHeight: 1.55 }}>
                    {c.excerpt}
                  </p>
                  <div className="flex items-baseline justify-between text-xs" style={{ color: C.driftwood }}>
                    {c.storyteller_name ? (
                      <span>— {c.storyteller_name}</span>
                    ) : (
                      <span>Anonymous</span>
                    )}
                    {c.date && (
                      <span className="font-mono text-[10px]">
                        {new Date(c.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
