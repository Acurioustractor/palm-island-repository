'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'

interface FlatSurface {
  title: string
  description: string
  href: string
  count?: string
  group: string
  groupId: string
  groupColour: string
  badge?: string
  external?: boolean
}

interface Props {
  surfaces: FlatSurface[]
}

export default function AtlasSearch({ surfaces }: Props) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return []
    return surfaces
      .filter((s) =>
        s.title.toLowerCase().includes(t) ||
        s.description.toLowerCase().includes(t) ||
        s.group.toLowerCase().includes(t) ||
        s.href.toLowerCase().includes(t)
      )
      .slice(0, 12)
  }, [q, surfaces])

  return (
    <div className="relative">
      <div
        className="flex items-center gap-3 rounded-xl border-2 px-4 py-3"
        style={{ borderColor: '#0B4F6C', backgroundColor: '#fff' }}
      >
        <Search className="w-5 h-5" style={{ color: '#6B6560' }} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search any surface — try 'voices' or 'innovation' or 'sign'"
          className="flex-1 bg-transparent outline-none text-base"
          style={{ color: '#0B4F6C' }}
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            className="text-xs uppercase font-bold tracking-widest px-2 py-1 rounded"
            style={{ color: '#6B6560', letterSpacing: '0.2em' }}
          >
            Clear
          </button>
        )}
      </div>

      {q.trim() && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl border-2 p-2 z-20 max-h-[60vh] overflow-y-auto shadow-lg"
          style={{ borderColor: '#E8E6E3', backgroundColor: '#fff' }}
        >
          {filtered.length === 0 ? (
            <div className="p-4 text-sm" style={{ color: '#6B6560' }}>
              No surfaces match &ldquo;{q}&rdquo;.
            </div>
          ) : (
            <ul>
              {filtered.map((s) => (
                <li key={s.href + s.title}>
                  <Link
                    href={s.href}
                    target={s.external ? '_blank' : undefined}
                    onClick={() => setQ('')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-stone-50 transition"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.groupColour }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-bold" style={{ color: '#0B4F6C', fontSize: 14 }}>
                          {s.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: '#6B6560', letterSpacing: '0.2em' }}>
                          {s.group}
                        </span>
                      </div>
                      <div className="text-xs truncate" style={{ color: '#6B6560' }}>
                        {s.description}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: '#6B6560' }} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
