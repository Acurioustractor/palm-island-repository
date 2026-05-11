'use client'

import { useState, useMemo } from 'react'
import { ExternalLink, Search, AlertCircle, Check } from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export interface AlignmentPhoto {
  file: string
  pencilPath: string
  source_url: string
  width: number | null
  height: number | null
  print_score: 'fullbleed' | 'halfpage' | 'quarterpage' | 'thumbnail' | 'too-small' | 'unknown'
  caption: string | null
}

export interface AlignmentEntity {
  kind: 'storyteller' | 'service' | 'project'
  id: string
  slug: string
  name: string
  isElder: boolean
  quoteCount: number | null
  photos: AlignmentPhoto[]
  elAdminUrl: string
}

const PRINT_COLOR: Record<string, string> = {
  fullbleed: '#15803D',
  halfpage: '#0EA5E9',
  quarterpage: '#C8963E',
  thumbnail: '#A39E99',
  'too-small': '#8B1A1A',
  unknown: '#6B6560',
}

export default function AlignmentClient({
  storytellers,
  services,
}: {
  storytellers: AlignmentEntity[]
  services: AlignmentEntity[]
}) {
  const [tab, setTab] = useState<'storytellers' | 'services'>('storytellers')
  const [query, setQuery] = useState('')
  const [showOnlyGaps, setShowOnlyGaps] = useState(false)
  const [showOnlyElders, setShowOnlyElders] = useState(false)

  const entities = tab === 'storytellers' ? storytellers : services

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return entities.filter((e) => {
      if (showOnlyGaps && e.photos.length > 0) return false
      if (showOnlyElders && !e.isElder) return false
      if (!q) return true
      return e.name.toLowerCase().includes(q) || e.slug.toLowerCase().includes(q)
    })
  }, [entities, query, showOnlyGaps, showOnlyElders])

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {(['storytellers', 'services'] as const).map((t) => {
          const count = t === 'storytellers' ? storytellers.length : services.length
          const gap = (t === 'storytellers' ? storytellers : services).filter((e) => e.photos.length === 0).length
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-md text-sm font-bold inline-flex items-center gap-2"
              style={{
                backgroundColor: tab === t ? C.ocean : '#FFFFFF',
                color: tab === t ? '#FFFFFF' : C.ocean,
                border: `1px solid ${tab === t ? C.ocean : C.border}`,
              }}
            >
              {t === 'storytellers' ? 'Storytellers' : 'Services'} ({count})
              {gap > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                  style={{
                    backgroundColor: tab === t ? '#FFFFFF22' : C.turtleRed + '14',
                    color: tab === t ? '#FFFFFF' : C.turtleRed,
                  }}
                  title={`${gap} need photos`}
                >
                  {gap} gaps
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div
          className="flex items-center gap-2 flex-1 min-w-[240px] px-3 py-2 rounded-md"
          style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: C.muted }} />
          <input
            type="text"
            placeholder={`Search ${tab}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent"
            style={{ color: C.earth }}
          />
        </div>
        <button
          onClick={() => setShowOnlyGaps((v) => !v)}
          className="px-3 py-2 rounded-md text-xs font-bold uppercase"
          style={{
            backgroundColor: showOnlyGaps ? C.turtleRed : '#FFFFFF',
            color: showOnlyGaps ? '#FFFFFF' : C.turtleRed,
            border: `1px solid ${C.turtleRed}66`,
            letterSpacing: '0.1em',
          }}
        >
          {showOnlyGaps ? 'Showing gaps only' : 'Show gaps only'}
        </button>
        {tab === 'storytellers' && (
          <button
            onClick={() => setShowOnlyElders((v) => !v)}
            className="px-3 py-2 rounded-md text-xs font-bold uppercase"
            style={{
              backgroundColor: showOnlyElders ? C.ochre : '#FFFFFF',
              color: showOnlyElders ? '#FFFFFF' : C.ochre,
              border: `1px solid ${C.ochre}66`,
              letterSpacing: '0.1em',
            }}
          >
            ✦ {showOnlyElders ? 'Elders only' : 'Show Elders'}
          </button>
        )}
        <span className="text-xs font-bold uppercase" style={{ color: C.muted, letterSpacing: '0.2em' }}>
          {filtered.length} shown
        </span>
      </div>

      {/* Entity cards */}
      <div className="space-y-3">
        {filtered.map((e) => (
          <EntityRow key={`${e.kind}-${e.id}`} entity={e} />
        ))}
      </div>
    </>
  )
}

function EntityRow({ entity }: { entity: AlignmentEntity }) {
  const hasPhotos = entity.photos.length > 0
  const heroPhoto = entity.photos[0]
  const cover = entity.photos[0]
  return (
    <article
      className="rounded-lg overflow-hidden flex items-stretch"
      style={{
        backgroundColor: '#FFFFFF',
        border: `1px solid ${hasPhotos ? C.border : C.turtleRed + '44'}`,
      }}
    >
      {/* Cover thumbnail */}
      <div
        className="w-32 sm:w-40 flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: hasPhotos ? C.shell : C.turtleRed + '08' }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.source_url}
            alt={entity.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-center p-3">
            <AlertCircle className="w-6 h-6 mx-auto mb-1" style={{ color: C.turtleRed }} />
            <p className="text-[10px] font-bold uppercase" style={{ color: C.turtleRed, letterSpacing: '0.1em' }}>
              No photo
            </p>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-fraunces font-bold flex items-center gap-2 flex-wrap"
              style={{ color: C.ocean, fontSize: 18, lineHeight: 1.2 }}
            >
              {entity.name}
              {entity.isElder && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: C.ochre + '14', color: C.ochre, fontWeight: 700, letterSpacing: '0.05em' }}
                  title="Elder"
                >
                  ✦ Elder
                </span>
              )}
              {entity.kind === 'service' && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: C.mangrove + '14', color: C.mangrove, fontWeight: 700 }}
                >
                  Service
                </span>
              )}
            </h3>
            <p className="text-xs mt-1" style={{ color: C.muted }}>
              <code>{entity.slug}</code>
              {entity.quoteCount !== null && (
                <span> · {entity.quoteCount} quotes</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasPhotos ? (
              <span
                className="text-xs px-2 py-1 rounded font-bold inline-flex items-center gap-1"
                style={{ backgroundColor: C.mangrove + '14', color: C.mangrove }}
              >
                <Check className="w-3 h-3" /> {entity.photos.length} photo{entity.photos.length === 1 ? '' : 's'}
              </span>
            ) : (
              <a
                href={entity.elAdminUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded text-xs font-bold inline-flex items-center gap-1"
                style={{ backgroundColor: C.turtleRed, color: '#FFFFFF' }}
              >
                Upload photo in EL <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Photo strip */}
        {hasPhotos && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {entity.photos.map((p) => (
              <div key={p.file} className="flex-shrink-0 group">
                <div
                  className="w-20 h-24 rounded overflow-hidden relative"
                  style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}
                  title={`${p.file} · ${p.width ?? '?'}×${p.height ?? '?'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.source_url} alt={p.file} className="w-full h-full object-cover" loading="lazy" />
                  <div
                    className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[8px] font-bold text-center"
                    style={{
                      backgroundColor: PRINT_COLOR[p.print_score] + 'EE',
                      color: '#FFFFFF',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {p.print_score === 'fullbleed' ? 'FULL' : p.print_score === 'halfpage' ? '½' : p.print_score === 'quarterpage' ? '¼' : '?'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {heroPhoto?.caption && (
          <p className="text-xs mt-3 italic font-fraunces" style={{ color: C.driftwood }}>
            "{heroPhoto.caption}"
          </p>
        )}
      </div>
    </article>
  )
}
