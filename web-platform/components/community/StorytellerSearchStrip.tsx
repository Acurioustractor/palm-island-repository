'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

interface StorytellerEntry {
  id: string
  name: string
  slug: string
}

interface Props {
  storytellers: StorytellerEntry[]
}

function normalise(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
}

export default function StorytellerSearchStrip({ storytellers }: Props) {
  const [query, setQuery] = useState('')
  const trimmed = query.trim()

  const filtered = useMemo(() => {
    if (!trimmed) return storytellers
    const q = normalise(trimmed)
    return storytellers.filter((s) => normalise(s.name).includes(q))
  }, [storytellers, trimmed])

  return (
    <div className="border-b border-stone-200 bg-white/60">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-3">
          <div className="text-xs uppercase font-bold text-stone-500 tracking-widest">
            Browse storytellers · {storytellers.length}
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              className="w-full pl-9 pr-3 py-2 rounded-full border border-stone-300 bg-white text-sm focus:outline-none focus:border-picc-ochre focus:ring-1 focus:ring-picc-ochre"
              aria-label="Search storytellers"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm italic text-stone-500 py-2">
            No storytellers match &ldquo;{trimmed}&rdquo;.
          </p>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {filtered.map((s) => (
              <Link
                key={s.id}
                href={`/voices/${s.slug}`}
                className="text-sm text-picc-earth hover:text-picc-earth-700 hover:underline font-medium"
              >
                {s.name}
              </Link>
            ))}
          </div>
        )}

        {trimmed && filtered.length > 0 && (
          <p className="mt-3 text-xs text-stone-500">
            {filtered.length} of {storytellers.length} shown
          </p>
        )}
      </div>
    </div>
  )
}
