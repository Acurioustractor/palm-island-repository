'use client'

import { useState, useMemo, useEffect } from 'react'
import { Copy, Check, Search, X, ExternalLink, Send, Zap, Trash2, RefreshCw } from 'lucide-react'
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

export interface PencilTarget {
  nodeId: string
  spreadId: string
  spreadLabel: string
  label: string
  role: 'hero' | 'portrait' | 'secondary' | 'background'
}

interface QueueEntry {
  id: string
  nodeId: string
  pencilPath: string
  label?: string
  status: 'pending' | 'processed' | 'failed'
  queued_at: string
}

export default function PhotoLibraryClient({
  groups,
  targets,
}: {
  groups: LibraryGroup[]
  targets: PencilTarget[]
}) {
  const [query, setQuery] = useState('')
  const [activeSlot, setActiveSlot] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<LibraryPhoto | null>(null)
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const [pushMode, setPushMode] = useState(false)
  const [activeTarget, setActiveTarget] = useState<PencilTarget | null>(null)
  const [queue, setQueue] = useState<{ pending: QueueEntry[]; processed: QueueEntry[]; counts: { pending: number; processed: number; failed: number; total: number } } | null>(null)
  const [pushed, setPushed] = useState<Set<string>>(new Set())
  const [pushing, setPushing] = useState<string | null>(null)

  async function refreshQueue() {
    try {
      const r = await fetch('/api/pencil/queue')
      const j = await r.json()
      setQueue(j)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    refreshQueue()
    const t = setInterval(refreshQueue, 4000)
    return () => clearInterval(t)
  }, [])

  async function pushToPencil(target: PencilTarget, photo: LibraryPhoto) {
    const key = `${target.nodeId}:${photo.pencilPath}`
    setPushing(key)
    try {
      const r = await fetch('/api/pencil/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: target.nodeId,
          pencilPath: photo.pencilPath,
          label: `${target.label} ← ${photo.file}`,
        }),
      })
      if (r.ok) {
        setPushed((s) => {
          const n = new Set(s)
          n.add(key)
          return n
        })
        setTimeout(() => setPushed((s) => {
          const n = new Set(s)
          n.delete(key)
          return n
        }), 2400)
        refreshQueue()
      }
    } finally {
      setPushing(null)
    }
  }

  async function clearQueue(all: boolean) {
    if (!confirm(all ? 'Clear ALL queue entries (pending + processed)?' : 'Clear processed entries?')) return
    await fetch(`/api/pencil/queue?all=${all}`, { method: 'DELETE' })
    refreshQueue()
  }

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

  // Group targets by spread for the dropdown
  const targetsBySpread = targets.reduce((acc, t) => {
    const arr = acc.get(t.spreadLabel) ?? []
    arr.push(t)
    acc.set(t.spreadLabel, arr)
    return acc
  }, new Map<string, PencilTarget[]>())

  return (
    <>
      {/* Push mode toggle + queue status */}
      <section
        className="rounded-xl p-5 mb-6"
        style={{
          backgroundColor: pushMode ? C.ocean + '08' : '#FFFFFF',
          border: `2px solid ${pushMode ? C.ocean : C.border}`,
        }}
      >
        <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
          <div>
            <p
              className="font-bold uppercase mb-1"
              style={{ color: pushMode ? C.ocean : C.muted, fontSize: 10, letterSpacing: '0.3em' }}
            >
              {pushMode ? 'PUSH-TO-PENCIL MODE · ACTIVE' : 'PUSH-TO-PENCIL MODE'}
            </p>
            <h2
              className="font-fraunces font-bold"
              style={{ color: C.ocean, fontSize: 22, lineHeight: 1.2 }}
            >
              {pushMode
                ? 'Pick a frame, click photos to queue them'
                : 'Skip the manual paste — queue photos to push directly into Pencil'}
            </h2>
          </div>
          <button
            onClick={() => setPushMode((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded font-bold text-sm transition-colors"
            style={{
              backgroundColor: pushMode ? C.turtleRed : C.ocean,
              color: '#FFFFFF',
            }}
          >
            <Zap className="w-4 h-4" />
            {pushMode ? 'Exit push mode' : 'Enable push mode'}
          </button>
        </div>

        {pushMode && (
          <>
            {/* Target picker */}
            <div className="mb-3">
              <label
                className="block text-xs font-bold uppercase mb-2"
                style={{ color: C.muted, letterSpacing: '0.2em' }}
              >
                Target frame in Pencil
              </label>
              <select
                value={activeTarget?.nodeId ?? ''}
                onChange={(e) => {
                  const t = targets.find((x) => x.nodeId === e.target.value) ?? null
                  setActiveTarget(t)
                }}
                className="w-full px-3 py-2 rounded-md text-sm"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: C.earth,
                  border: `1px solid ${C.border}`,
                }}
              >
                <option value="">— pick a frame —</option>
                {Array.from(targetsBySpread.entries()).map(([spread, ts]) => (
                  <optgroup key={spread} label={spread}>
                    {ts.map((t) => (
                      <option key={t.nodeId} value={t.nodeId}>
                        {t.label} · {t.nodeId}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {activeTarget && (
                <p className="mt-2 text-xs font-fraunces italic" style={{ color: C.driftwood }}>
                  Clicking a photo below will queue: <code>{activeTarget.nodeId}</code> →{' '}
                  <code>pencil-photos/&lt;file&gt;</code>
                </p>
              )}
            </div>

            {/* Queue status */}
            <div
              className="rounded p-3"
              style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <p
                  className="font-bold uppercase"
                  style={{ color: C.ochre, fontSize: 10, letterSpacing: '0.3em' }}
                >
                  PUSH QUEUE
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshQueue}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-stone-50"
                    style={{ color: C.muted, border: `1px solid ${C.border}` }}
                    title="Refresh queue"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  {queue && queue.counts.processed > 0 && (
                    <button
                      onClick={() => clearQueue(false)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-stone-50"
                      style={{ color: C.muted, border: `1px solid ${C.border}` }}
                    >
                      <Trash2 className="w-3 h-3" /> Clear processed
                    </button>
                  )}
                  {queue && queue.counts.total > 0 && (
                    <button
                      onClick={() => clearQueue(true)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-stone-50"
                      style={{ color: C.turtleRed, border: `1px solid ${C.turtleRed}44` }}
                    >
                      <Trash2 className="w-3 h-3" /> Clear all
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="px-2 py-1 rounded" style={{ backgroundColor: C.ocean + '12', color: C.ocean }}>
                  Pending: <strong>{queue?.counts.pending ?? 0}</strong>
                </span>
                <span className="px-2 py-1 rounded" style={{ backgroundColor: C.mangrove + '12', color: C.mangrove }}>
                  Processed: <strong>{queue?.counts.processed ?? 0}</strong>
                </span>
                {queue && queue.counts.failed > 0 && (
                  <span className="px-2 py-1 rounded" style={{ backgroundColor: C.turtleRed + '12', color: C.turtleRed }}>
                    Failed: <strong>{queue.counts.failed}</strong>
                  </span>
                )}
              </div>
              {queue && queue.counts.pending > 0 && (
                <div
                  className="mt-3 p-3 rounded text-sm font-fraunces"
                  style={{ backgroundColor: C.ochre + '12', color: C.earth, border: `1px dashed ${C.ochre}` }}
                >
                  <strong>{queue.counts.pending} push{queue.counts.pending === 1 ? '' : 'es'} ready.</strong>{' '}
                  In your Claude Code chat, type:{' '}
                  <code
                    className="px-2 py-0.5 rounded text-xs ml-1"
                    style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, color: C.ocean }}
                  >
                    process pencil queue
                  </code>{' '}
                  — Claude will read the queue and apply the image fills via MCP.
                </div>
              )}
              {queue && queue.pending.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs font-fraunces" style={{ color: C.driftwood }}>
                  {queue.pending.slice(0, 5).map((e) => (
                    <li key={e.id}>
                      <code style={{ color: C.ocean }}>{e.nodeId}</code> ← {e.pencilPath}
                      {e.label && <span style={{ color: C.muted }}> · {e.label}</span>}
                    </li>
                  ))}
                  {queue.pending.length > 5 && (
                    <li style={{ color: C.muted }}>… and {queue.pending.length - 5} more</li>
                  )}
                </ul>
              )}
            </div>
          </>
        )}
      </section>

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
              {g.photos.map((p) => {
                const pushKey = activeTarget ? `${activeTarget.nodeId}:${p.pencilPath}` : ''
                return (
                  <PhotoCard
                    key={`${p.slot}-${p.index}`}
                    photo={p}
                    copied={copiedPath === p.pencilPath}
                    onCopy={() => copyPath(p.pencilPath)}
                    onOpen={() => setLightbox(p)}
                    pushMode={pushMode}
                    activeTarget={activeTarget}
                    onPush={() => activeTarget && pushToPencil(activeTarget, p)}
                    pushed={pushed.has(pushKey)}
                    pushing={pushing === pushKey}
                  />
                )
              })}
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
  pushMode,
  activeTarget,
  onPush,
  pushed,
  pushing,
}: {
  photo: LibraryPhoto
  copied: boolean
  onCopy: () => void
  onOpen: () => void
  pushMode: boolean
  activeTarget: PencilTarget | null
  onPush: () => void
  pushed: boolean
  pushing: boolean
}) {
  const canPush = pushMode && activeTarget !== null
  return (
    <article
      className="group rounded-lg overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
      style={{
        backgroundColor: '#FFFFFF',
        border: `1px solid ${pushed ? C.mangrove : C.border}`,
        boxShadow: pushed ? `0 0 0 2px ${C.mangrove}55` : undefined,
      }}
    >
      {/* Big thumbnail */}
      <div
        onClick={canPush ? onPush : onOpen}
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
        {canPush && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: C.ocean + 'CC' }}
          >
            <span className="font-bold text-white text-sm inline-flex items-center gap-2">
              <Send className="w-4 h-4" /> Queue for {activeTarget?.nodeId}
            </span>
          </div>
        )}
        {pushed && (
          <div
            className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded text-xs font-bold inline-flex items-center justify-center gap-1"
            style={{ backgroundColor: C.mangrove, color: '#FFFFFF' }}
          >
            <Check className="w-3 h-3" /> Queued
          </div>
        )}
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

        {canPush ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPush()
            }}
            disabled={pushing}
            className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-60"
            style={{
              backgroundColor: pushed ? C.mangrove : C.turtleRed,
              color: '#FFFFFF',
            }}
            title={`Queue: ${activeTarget?.nodeId} ← ${photo.pencilPath}`}
          >
            {pushing ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : pushed ? (
              <Check className="w-3 h-3" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            {pushing ? 'Queuing…' : pushed ? 'Queued!' : `Push to ${activeTarget?.nodeId}`}
          </button>
        ) : (
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
        )}
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
