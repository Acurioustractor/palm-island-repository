'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Check, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export interface BridgeFrameRef {
  nodeId: string
  label: string
}

export interface BridgeSlot {
  id: string
  label: string
  section: string
  source: string
  url: string | null
  /** The Pencil-relative path if this slot has been synced via scripts/sync-pencil-photos.mjs */
  pencilPath: string | null
  detail?: string
  notes?: string
  frames: BridgeFrameRef[]
  extras: { url: string; caption: string | null; pencilPath: string | null }[]
  elV2Slot: string | null
}

export interface BridgeFrameGroup {
  nodeId: string
  label: string
  order: number
  slots: BridgeSlot[]
}

export default function PencilBridgeClient({
  groups,
  unassigned,
}: {
  groups: BridgeFrameGroup[]
  unassigned: BridgeSlot[]
}) {
  const [filter, setFilter] = useState<'all' | 'filled' | 'missing'>('all')

  function filterSlot(slot: BridgeSlot) {
    if (filter === 'filled') return !!slot.url
    if (filter === 'missing') return !slot.url
    return true
  }

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-6">
        <span
          className="text-xs font-bold uppercase"
          style={{ color: C.muted, letterSpacing: '0.2em' }}
        >
          Show:
        </span>
        {(['all', 'filled', 'missing'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-md text-xs font-bold uppercase transition-colors"
            style={{
              backgroundColor: filter === f ? C.ocean : '#FFFFFF',
              color: filter === f ? '#FFFFFF' : C.ocean,
              border: `1px solid ${filter === f ? C.ocean : C.border}`,
              letterSpacing: '0.1em',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Spreads */}
      <div className="space-y-12">
        {groups.map((group) => {
          const visible = group.slots.filter(filterSlot)
          if (visible.length === 0 && filter !== 'all') return null
          return (
            <FrameGroup key={group.nodeId} group={group} slots={visible} />
          )
        })}
      </div>

      {/* Unassigned */}
      {unassigned.filter(filterSlot).length > 0 && (
        <section className="mt-16">
          <header className="mb-6">
            <p
              className="font-bold uppercase mb-1"
              style={{ color: C.muted, fontSize: 10, letterSpacing: '0.3em' }}
            >
              UNASSIGNED · NEEDS A v2 SPREAD
            </p>
            <h2
              className="font-fraunces font-bold"
              style={{ color: C.ocean, fontSize: 24, lineHeight: 1.2 }}
            >
              Slots without a Pencil home yet
            </h2>
            <p className="mt-2 text-sm font-fraunces" style={{ color: C.driftwood }}>
              These photos exist on the web report but don't have a v2 spread to live
              in. Either map them in <code>pencil-frame-map.ts</code> or design a new
              spread.
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unassigned.filter(filterSlot).map((slot) => (
              <SlotCard key={slot.id} slot={slot} compact />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function FrameGroup({ group, slots }: { group: BridgeFrameGroup; slots: BridgeSlot[] }) {
  const filled = slots.filter((s) => s.url).length
  return (
    <section
      className="rounded-xl p-6"
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}
    >
      <header className="mb-4 pb-4 border-b" style={{ borderColor: C.border }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p
              className="font-bold uppercase mb-1"
              style={{ color: C.turtleRed, fontSize: 10, letterSpacing: '0.3em' }}
            >
              SPREAD {String(group.order).padStart(2, '0')} · PENCIL FRAME{' '}
              <code style={{ color: C.ocean }}>{group.nodeId}</code>
            </p>
            <h2
              className="font-fraunces font-bold"
              style={{ color: C.ocean, fontSize: 24, lineHeight: 1.2 }}
            >
              {group.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2 py-1 rounded-md"
              style={{
                backgroundColor: filled === slots.length && slots.length > 0 ? C.mangrove + '22' : C.shell,
                color: filled === slots.length && slots.length > 0 ? C.mangrove : C.muted,
                border: `1px solid ${C.border}`,
              }}
            >
              {filled} / {slots.length} filled
            </span>
          </div>
        </div>
      </header>
      {slots.length === 0 ? (
        <p className="text-sm font-fraunces italic" style={{ color: C.muted }}>
          No slots assigned to this spread yet — wire them in{' '}
          <code>lib/almanac/pencil-frame-map.ts</code>.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {slots.map((slot) => (
            <SlotCard key={`${group.nodeId}-${slot.id}`} slot={slot} />
          ))}
        </div>
      )}
    </section>
  )
}

function SlotCard({ slot, compact = false }: { slot: BridgeSlot; compact?: boolean }) {
  const [copied, setCopied] = useState(false)
  const [showExtras, setShowExtras] = useState(false)

  async function copyUrl(u: string) {
    try {
      await navigator.clipboard.writeText(u)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore — Safari private mode etc.
    }
  }

  return (
    <article
      className="rounded-lg overflow-hidden"
      style={{
        border: `1px solid ${slot.url ? C.border : C.turtleRed + '44'}`,
        backgroundColor: slot.url ? '#FFFFFF' : C.turtleRed + '08',
      }}
    >
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div
          className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}
        >
          {slot.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slot.url}
              alt={slot.detail ?? slot.label}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <AlertCircle className="w-6 h-6" style={{ color: C.turtleRed + '88' }} />
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-fraunces font-bold mb-1"
            style={{ color: C.ocean, fontSize: 14, lineHeight: 1.25 }}
          >
            {slot.label}
          </h3>
          <p className="text-xs mb-2" style={{ color: C.muted }}>
            <code>{slot.id}</code> · {slot.source}
            {slot.elV2Slot ? <> · EL slot <code>{slot.elV2Slot}</code></> : null}
          </p>
          {slot.detail && (
            <p
              className="text-xs mb-2 italic font-fraunces line-clamp-2"
              style={{ color: C.driftwood }}
            >
              {slot.detail}
            </p>
          )}

          {!compact && slot.frames.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {slot.frames.map((f) => (
                <span
                  key={f.nodeId}
                  className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: C.ocean + '12',
                    color: C.ocean,
                    letterSpacing: '0.1em',
                  }}
                  title={f.label}
                >
                  {f.nodeId}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-1.5">
            {slot.url ? (
              <>
                {slot.pencilPath ? (
                  <button
                    onClick={() => copyUrl(slot.pencilPath!)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors"
                    style={{
                      backgroundColor: copied ? C.mangrove : C.ocean,
                      color: '#FFFFFF',
                    }}
                    title={`Pencil image fill path: ${slot.pencilPath}`}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy Pencil path'}
                  </button>
                ) : (
                  <button
                    onClick={() => copyUrl(slot.url!)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors"
                    style={{
                      backgroundColor: copied ? C.mangrove : C.ochre,
                      color: '#FFFFFF',
                    }}
                    title="Run scripts/sync-pencil-photos.mjs to enable Pencil path"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy URL (run sync first)'}
                  </button>
                )}
                <a
                  href={slot.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-stone-50"
                  style={{ color: C.ocean, border: `1px solid ${C.border}` }}
                >
                  <ImageIcon className="w-3 h-3" /> Open
                </a>
                <a
                  href={slot.url}
                  download
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-stone-50"
                  style={{ color: C.muted, border: `1px solid ${C.border}` }}
                >
                  ↓ Download
                </a>
                {slot.extras.length > 0 && (
                  <button
                    onClick={() => setShowExtras((v) => !v)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-stone-50"
                    style={{ color: C.ochre, border: `1px solid ${C.border}` }}
                  >
                    {showExtras ? 'Hide' : `+${slot.extras.length} more`}
                  </button>
                )}
              </>
            ) : (
              <a
                href={`https://picc.empathyledger.com/admin/photos${slot.elV2Slot ? `?tag=${encodeURIComponent('picc:slot:' + slot.elV2Slot)}` : ''}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
                style={{
                  backgroundColor: C.turtleRed,
                  color: '#FFFFFF',
                }}
              >
                Wire in EL <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Extras (alternate photos for this slot) */}
      {showExtras && slot.extras.length > 0 && (
        <div
          className="px-3 pb-3 pt-0 border-t"
          style={{ borderColor: C.border }}
        >
          <p
            className="text-[10px] font-bold uppercase mt-2 mb-2"
            style={{ color: C.muted, letterSpacing: '0.2em' }}
          >
            ALTERNATES IN THIS SLOT
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {slot.extras.map((ex, i) => (
              <div key={i} className="space-y-1">
                <div
                  className="aspect-square rounded overflow-hidden"
                  style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ex.url}
                    alt={ex.caption ?? ''}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <button
                  onClick={() => copyUrl(ex.pencilPath ?? ex.url)}
                  className="w-full px-1 py-0.5 rounded text-[10px] font-bold hover:opacity-90"
                  style={{ backgroundColor: ex.pencilPath ? C.ocean : C.ochre, color: '#FFFFFF' }}
                  title={ex.pencilPath ?? ex.url}
                >
                  Copy {ex.pencilPath ? 'path' : 'URL'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
