'use client'

import { useEffect, useMemo, useState } from 'react'

export interface ResolvedSlot {
  id: string
  label: string
  section: string
  purpose: string
  source: string
  url: string | null
  status: 'filled' | 'missing'
  swapHref: string
  notes?: string
  detail?: string
}

interface FlagRow {
  slot_id: string
  flag_type: 'wrong' | 'review' | 'placeholder' | 'approved'
  comment: string | null
  flagged_by: string | null
  flagged_at: string
  resolved_at: string | null
}

const FLAG_COLOUR: Record<FlagRow['flag_type'], { bg: string; text: string; label: string }> = {
  wrong:       { bg: 'bg-red-600',     text: 'text-white', label: '✗ wrong' },
  review:      { bg: 'bg-amber-500',   text: 'text-white', label: '? review' },
  placeholder: { bg: 'bg-stone-500',   text: 'text-white', label: '· placeholder' },
  approved:    { bg: 'bg-emerald-600', text: 'text-white', label: '✓ approved' },
}

interface Props {
  items: ResolvedSlot[]
}

export default function AlmanacPhotosClient({ items }: Props) {
  const [flags, setFlags] = useState<Record<string, FlagRow>>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'flagged' | 'missing' | 'wrong' | 'review'>('all')
  const [openFlagFor, setOpenFlagFor] = useState<string | null>(null)

  // Initial fetch
  useEffect(() => {
    fetch('/api/almanac/flags').then((r) => r.json()).then((data) => {
      const map: Record<string, FlagRow> = {}
      for (const f of data.flags ?? []) map[f.slot_id] = f
      setFlags(map)
    })
  }, [])

  // ── Mutations ──
  async function saveFlag(slot_id: string, patch: Partial<FlagRow>) {
    const base: FlagRow = flags[slot_id] ?? {
      slot_id,
      flag_type: 'wrong',
      comment: null,
      flagged_by: null,
      flagged_at: new Date().toISOString(),
      resolved_at: null,
    }
    const optimistic: FlagRow = { ...base, ...patch, slot_id }
    setFlags((prev) => ({ ...prev, [slot_id]: optimistic }))

    const res = await fetch('/api/almanac/flags', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slot_id, ...patch }),
    })
    if (res.ok) {
      const { flag } = await res.json()
      setFlags((prev) => ({ ...prev, [slot_id]: flag }))
    }
  }

  async function clearFlag(slot_id: string) {
    setFlags((prev) => {
      const copy = { ...prev }
      delete copy[slot_id]
      return copy
    })
    await fetch(`/api/almanac/flags/${encodeURIComponent(slot_id)}`, { method: 'DELETE' })
  }

  // ── Selection / bulk ──
  function toggle(id: string) {
    setSelected((prev) => {
      const copy = new Set(prev)
      if (copy.has(id)) copy.delete(id); else copy.add(id)
      return copy
    })
  }
  function clearSelection() { setSelected(new Set()) }
  function openSelectedInELv2() {
    for (const id of Array.from(selected)) {
      const item = items.find((i) => i.id === id)
      if (item) window.open(item.swapHref, '_blank', 'noopener')
    }
    clearSelection()
  }

  // ── Filtering ──
  const visible = useMemo(() => {
    return items.filter((i) => {
      const f = flags[i.id]
      if (filter === 'all') return true
      if (filter === 'flagged') return Boolean(f) && !f?.resolved_at
      if (filter === 'missing') return i.status === 'missing'
      if (filter === 'wrong') return f?.flag_type === 'wrong' && !f?.resolved_at
      if (filter === 'review') return f?.flag_type === 'review' && !f?.resolved_at
      return true
    })
  }, [items, flags, filter])

  const sections = useMemo(() => Array.from(new Set(visible.map((i) => i.section))), [visible])
  const counts = useMemo(() => {
    const filled = items.filter((i) => i.status === 'filled').length
    const missing = items.length - filled
    const flaggedCount = Object.values(flags).filter((f) => !f.resolved_at).length
    const wrongCount = Object.values(flags).filter((f) => f.flag_type === 'wrong' && !f.resolved_at).length
    const reviewCount = Object.values(flags).filter((f) => f.flag_type === 'review' && !f.resolved_at).length
    return { filled, missing, flaggedCount, wrongCount, reviewCount }
  }, [items, flags])

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
            Internal · Almanac Editor
          </p>
          <h1 className="font-fraunces text-3xl md:text-4xl text-stone-800 italic mb-3">
            Almanac Photos
          </h1>
          <p className="text-stone-600 max-w-2xl leading-relaxed">
            Every photo + video the almanac uses, where it lands, and how to swap.
            Flag anything that's wrong; click "Swap in EL v2 →" to open the EL v2 admin filtered to that slot.
          </p>
          <a
            href="/picc/almanac/photos/reference"
            className="inline-block mt-3 text-xs font-semibold tracking-[0.15em] uppercase text-picc-ochre hover:underline"
          >
            View slot reference →
          </a>
        </div>

        {/* Filter pills */}
        <div className="sticky top-0 z-10 -mx-6 mb-6 border-b border-stone-200 bg-stone-50/95 px-6 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {(['all', 'flagged', 'missing', 'wrong', 'review'] as const).map((f) => {
              const count =
                f === 'all' ? items.length :
                f === 'flagged' ? counts.flaggedCount :
                f === 'missing' ? counts.missing :
                f === 'wrong' ? counts.wrongCount :
                counts.reviewCount
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1 font-medium transition ${filter === f ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
                >
                  {f} · {count}
                </button>
              )
            })}
            <span className="self-center text-stone-500 ml-2">{visible.length} of {items.length} shown</span>

            {selected.size > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-stone-700 font-medium">{selected.size} selected</span>
                <button
                  onClick={openSelectedInELv2}
                  className="rounded-md bg-picc-red text-white px-3 py-1 font-semibold hover:opacity-90"
                >
                  Open {selected.size} in EL v2 →
                </button>
                <button
                  onClick={clearSelection}
                  className="rounded-md bg-stone-200 text-stone-700 px-3 py-1 font-medium hover:bg-stone-300"
                >Clear</button>
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => {
          const sectionItems = visible.filter((i) => i.section === section)
          if (sectionItems.length === 0) return null
          return (
            <section key={section} className="mb-12">
              <h2 className="font-fraunces text-xl text-stone-800 mb-4 uppercase tracking-wide">{section}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sectionItems.map((item) => {
                  const f = flags[item.id]
                  const isSelected = selected.has(item.id)
                  const isOpenFlag = openFlagFor === item.id
                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border bg-white shadow-sm overflow-hidden flex flex-col transition ${isSelected ? 'border-picc-red ring-2 ring-picc-red/30' : 'border-stone-200'}`}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                        {item.url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.url}
                            alt={item.label}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-xs uppercase tracking-widest">
                            {item.source === 'video-tag' ? 'video tag' : 'no photo'}
                          </div>
                        )}
                        <label className="absolute top-2 left-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggle(item.id)}
                            className="h-4 w-4 accent-stone-900"
                          />
                        </label>
                        <div
                          className={`absolute top-2 right-2 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.status === 'filled' ? 'bg-emerald-600 text-white' : 'bg-stone-700 text-white'}`}
                        >
                          {item.status === 'filled' ? '✓' : '○'} {item.purpose}
                        </div>
                        {f && !f.resolved_at && (
                          <div className={`absolute bottom-2 left-2 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${FLAG_COLOUR[f.flag_type].bg} ${FLAG_COLOUR[f.flag_type].text}`}>
                            {FLAG_COLOUR[f.flag_type].label}
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-3 flex flex-col gap-2 flex-1">
                        <div className="font-semibold text-stone-900 text-sm leading-tight">{item.label}</div>
                        <div className="text-[11px] text-stone-500 font-mono break-all">{item.id}</div>
                        {item.detail && <div className="text-xs text-stone-600 italic">{item.detail}</div>}
                        {item.notes && <div className="text-xs text-stone-500 leading-snug">{item.notes}</div>}
                        {f && !f.resolved_at && f.comment && (
                          <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 leading-snug">
                            <span className="font-semibold">{f.flag_type}: </span>{f.comment}
                          </div>
                        )}

                        {/* Inline flag form */}
                        {isOpenFlag && (
                          <FlagForm
                            existing={f}
                            onSave={(p) => { saveFlag(item.id, p); setOpenFlagFor(null) }}
                            onClear={() => { clearFlag(item.id); setOpenFlagFor(null) }}
                            onCancel={() => setOpenFlagFor(null)}
                          />
                        )}

                        {/* Actions */}
                        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setOpenFlagFor(isOpenFlag ? null : item.id)}
                            className={`text-xs font-semibold ${f && !f.resolved_at ? 'text-red-700' : 'text-stone-600 hover:text-stone-900'}`}
                          >
                            {f && !f.resolved_at ? 'Edit flag' : '⚐ Flag'}
                          </button>
                          <a
                            href={item.swapHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-picc-red hover:underline"
                          >
                            Swap in EL v2 →
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {/* Footer note */}
        <div className="mt-12 rounded-lg bg-stone-100 p-6 text-sm text-stone-600">
          <h3 className="font-semibold text-stone-800 mb-2">How this page works</h3>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Tick photos that need swapping → "Open N in EL v2 →" opens each in a new tab.</li>
            <li>Or click "⚐ Flag" on a single card to leave a comment about what's wrong.</li>
            <li>Make changes in EL v2 admin (re-tag, star priority).</li>
            <li>Reload here — fresh photos appear within seconds.</li>
            <li>Set flag to "approved" once it's fixed; it'll move out of the wrong/review filter.</li>
          </ol>
        </div>
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────

function FlagForm({
  existing,
  onSave,
  onClear,
  onCancel,
}: {
  existing?: FlagRow
  onSave: (p: Partial<FlagRow>) => void
  onClear: () => void
  onCancel: () => void
}) {
  const [flagType, setFlagType] = useState<FlagRow['flag_type']>(existing?.flag_type ?? 'wrong')
  const [comment, setComment] = useState(existing?.comment ?? '')

  return (
    <div className="rounded-md bg-stone-50 border border-stone-300 p-2 space-y-2">
      <div className="flex flex-wrap gap-1">
        {(['wrong', 'review', 'placeholder', 'approved'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFlagType(t)}
            className={`rounded px-2 py-0.5 text-[11px] font-medium border ${flagType === t ? `${FLAG_COLOUR[t].bg} ${FLAG_COLOUR[t].text} border-transparent` : 'bg-white text-stone-700 border-stone-300'}`}
          >{t}</button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What's wrong? (max 500 chars)"
        rows={2}
        className="w-full rounded border border-stone-300 px-2 py-1 text-xs focus:border-stone-500 focus:outline-none"
      />
      <div className="flex justify-between text-[11px]">
        <button
          onClick={() => onSave({ flag_type: flagType, comment })}
          className="rounded bg-stone-900 text-white px-2 py-1 font-semibold hover:opacity-90"
        >Save</button>
        <div className="flex gap-2">
          {existing && (
            <button onClick={onClear} className="text-stone-500 hover:text-stone-900">Clear</button>
          )}
          <button onClick={onCancel} className="text-stone-500 hover:text-stone-900">Cancel</button>
        </div>
      </div>
    </div>
  )
}
