'use client'

import { useState, useMemo } from 'react'
import { Copy, Check, Search, X, ExternalLink } from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export interface LibraryPhoto {
  slot: string
  index: number
  file: string
  pencilPath: string
  source_url: string
  alt: string | null
  caption: string | null
  service_name: string | null
  el_id: string
  bytes: number
}

export interface LibraryGroup {
  slot: string
  photos: LibraryPhoto[]
}

export default function PhotoLibraryClient({ groups }: { groups: LibraryGroup[] }) {
  const [query, setQuery] = useState('')
  const [activeSlot, setActiveSlot] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<LibraryPhoto | null>(null)
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  const filteredGroups = useMemo(() => {
    return groups
      .map((g) => {
        if (activeSlot && g.slot !== activeSlot) return null
        if (!query) return g
        const q = query.toLowerCase()
        const photos = g.photos.filter(
          (p) =>
            p.slot.toLowerCase().includes(q) ||
            p.file.toLowerCase().includes(q) ||
            (p.alt ?? '').toLowerCase().includes(q) ||
            (p.caption ?? '').toLowerCase().includes(q) ||
            (p.service_name ?? '').toLowerCase().includes(q),
        )
        if (photos.length === 0) return null
        return { ...g, photos }
      })
      .filter((g): g is LibraryGroup => g !== null)
  }, [groups, query, activeSlot])

  const allSlots = groups.map((g) => g.slot)
  const totalShown = filteredGroups.reduce((s, g) => s + g.photos.length, 0)

  async function copyPath(path: string) {
    try {
      await navigator.clipboard.writeText(path)
      setCopiedPath(path)
      setTimeout(() => setCopiedPath(null), 1800)
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* Filter bar */}
      <div
        className="sticky top-0 z-10 flex flex-wrap items-center gap-3 mb-6 py-3"
        style={{ backgroundColor: '#FBF8EE' }}
      >
        <div
          className="flex items-center gap-2 flex-1 min-w-[240px] px-3 py-2 rounded-md"
          style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: C.muted }} />
          <input
            type="text"
            placeholder="Search by slot, filename, caption, alt text…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent"
            style={{ color: C.earth }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-xs" style={{ color: C.muted }}>
              clear
            </button>
          )}
        </div>
        <span className="text-xs font-bold uppercase" style={{ color: C.muted, letterSpacing: '0.2em' }}>
          {totalShown} shown
        </span>
      </div>

      {/* Slot pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveSlot(null)}
          className="px-3 py-1 rounded-md text-xs font-bold uppercase"
          style={{
            backgroundColor: activeSlot === null ? C.ocean : '#FFFFFF',
            color: activeSlot === null ? '#FFFFFF' : C.ocean,
            border: `1px solid ${activeSlot === null ? C.ocean : C.border}`,
            letterSpacing: '0.1em',
          }}
        >
          All ({groups.reduce((s, g) => s + g.photos.length, 0)})
        </button>
        {allSlots.map((slot) => {
          const count = groups.find((g) => g.slot === slot)?.photos.length ?? 0
          const active = activeSlot === slot
          return (
            <button
              key={slot}
              onClick={() => setActiveSlot(slot)}
              className="px-3 py-1 rounded-md text-xs font-bold uppercase"
              style={{
                backgroundColor: active ? C.ocean : '#FFFFFF',
                color: active ? '#FFFFFF' : C.ocean,
                border: `1px solid ${active ? C.ocean : C.border}`,
                letterSpacing: '0.1em',
              }}
            >
              {slot} ({count})
            </button>
          )
        })}
      </div>

      {/* Photo grid grouped by slot */}
      <div className="space-y-12">
        {filteredGroups.map((g) => (
          <section key={g.slot}>
            <header className="mb-4 pb-2 border-b" style={{ borderColor: C.border }}>
              <p
                className="font-bold uppercase mb-1"
                style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
              >
                SLOT
              </p>
              <h2
                className="font-fraunces font-bold"
                style={{ color: C.ocean, fontSize: 24, lineHeight: 1.2 }}
              >
                {g.slot}
                <span className="ml-2 text-sm" style={{ color: C.muted }}>
                  · {g.photos.length} photo{g.photos.length === 1 ? '' : 's'}
                </span>
              </h2>
            </header>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {g.photos.map((p) => (
                <PhotoCard
                  key={`${p.slot}-${p.index}`}
                  photo={p}
                  copied={copiedPath === p.pencilPath}
                  onCopy={() => copyPath(p.pencilPath)}
                  onOpen={() => setLightbox(p)}
                />
              ))}
            </div>
          </section>
        ))}
        {filteredGroups.length === 0 && (
          <p className="text-center font-fraunces py-12" style={{ color: C.muted }}>
            No photos match your search.
          </p>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          photo={lightbox}
          onClose={() => setLightbox(null)}
          onCopy={() => copyPath(lightbox.pencilPath)}
          copied={copiedPath === lightbox.pencilPath}
        />
      )}
    </>
  )
}

function PhotoCard({
  photo,
  copied,
  onCopy,
  onOpen,
}: {
  photo: LibraryPhoto
  copied: boolean
  onCopy: () => void
  onOpen: () => void
}) {
  return (
    <article
      className="group rounded-lg overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}
    >
      {/* Big thumbnail */}
      <div
        onClick={onOpen}
        className="aspect-[4/5] overflow-hidden relative"
        style={{ backgroundColor: C.shell }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.source_url}
          alt={photo.alt ?? photo.file}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        <div
          className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
          style={{
            backgroundColor: C.ocean + 'DD',
            color: '#FFFFFF',
            letterSpacing: '0.1em',
          }}
        >
          #{photo.index + 1}
        </div>
        <div
          className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px]"
          style={{
            backgroundColor: '#FFFFFFEE',
            color: C.muted,
          }}
        >
          {(photo.bytes / 1024).toFixed(0)}KB
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <p
          className="text-xs font-bold mb-1 truncate"
          style={{ color: C.ocean }}
          title={photo.file}
        >
          {photo.file}
        </p>
        {photo.alt && (
          <p
            className="text-[11px] font-fraunces italic line-clamp-2 mb-2"
            style={{ color: C.driftwood }}
            title={photo.alt}
          >
            {photo.alt}
          </p>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            onCopy()
          }}
          className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-bold transition-colors"
          style={{
            backgroundColor: copied ? C.mangrove : C.ocean,
            color: '#FFFFFF',
          }}
          title={photo.pencilPath}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy Pencil path'}
        </button>
      </div>
    </article>
  )
}

function Lightbox({
  photo,
  onClose,
  onCopy,
  copied,
}: {
  photo: LibraryPhoto
  onClose: () => void
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: '#000000DD' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-xl overflow-hidden max-w-4xl max-h-[90vh] flex flex-col"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="relative bg-black flex-1 min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.source_url}
            alt={photo.alt ?? photo.file}
            className="w-full h-full object-contain max-h-[60vh]"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FFFFFFEE', color: C.earth }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">
          <p
            className="font-bold uppercase mb-2"
            style={{ color: C.turtleRed, fontSize: 10, letterSpacing: '0.3em' }}
          >
            SLOT · {photo.slot} · #{photo.index + 1}
          </p>
          <h3
            className="font-fraunces font-bold mb-2"
            style={{ color: C.ocean, fontSize: 22, lineHeight: 1.2 }}
          >
            {photo.file}
          </h3>
          {photo.alt && (
            <p
              className="font-fraunces italic mb-3"
              style={{ color: C.driftwood, fontSize: 14, lineHeight: 1.4 }}
            >
              {photo.alt}
            </p>
          )}
          <code
            className="block text-xs px-3 py-2 rounded mb-3 overflow-x-auto"
            style={{ backgroundColor: C.shell, color: C.ocean, border: `1px solid ${C.border}` }}
          >
            {photo.pencilPath}
          </code>
          <div className="flex gap-2">
            <button
              onClick={onCopy}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded font-bold transition-colors"
              style={{
                backgroundColor: copied ? C.mangrove : C.ocean,
                color: '#FFFFFF',
              }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Pencil path'}
            </button>
            <a
              href={photo.source_url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded inline-flex items-center gap-1.5 hover:bg-stone-50"
              style={{ color: C.ocean, border: `1px solid ${C.border}` }}
            >
              EL source <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={photo.source_url}
              download
              className="px-4 py-2 rounded hover:bg-stone-50"
              style={{ color: C.muted, border: `1px solid ${C.border}` }}
            >
              ↓ Download
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
