'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ElementCategory } from '@/lib/design-system/elements-registry'

type Status = 'concept' | 'approved' | 'priority' | 'retire'
type Vote   = 'fire' | 'up' | 'meh' | 'down'

interface CategoryMeta {
  value: ElementCategory
  label: string
  count: number
}

interface ElementCard {
  slug: string
  name: string
  category: ElementCategory
  previewType: 'image' | 'component-stub'
  previewSrc: string
  previewUrl: string | null
  variantUrl: string | null
  source: string
  description: string
  implementations?: ('pdf' | 'web' | 'concept')[]
  status: Status
  vote: Vote | null
  score: number
  intended_use: string | null
  notes: string | null
  updated_at: string | null
}

const STATUS_COLOR: Record<Status, string> = {
  concept:  'bg-stone-100  text-stone-700  border-stone-300',
  approved: 'bg-sky-100    text-sky-800    border-sky-300',
  priority: 'bg-orange-100 text-orange-800 border-orange-400',
  retire:   'bg-red-50     text-red-700    border-red-300',
}

const VOTE_LABEL: Record<Vote, string> = {
  fire: '🔥',
  up:   '👍',
  meh:  '😐',
  down: '👎',
}

const SORT_OPTIONS = [
  { value: 'score-desc',  label: 'Score · high → low' },
  { value: 'score-asc',   label: 'Score · low → high' },
  { value: 'name-asc',    label: 'Name · A → Z' },
  { value: 'updated-desc',label: 'Recently voted' },
] as const
type SortOption = typeof SORT_OPTIONS[number]['value']

export default function DesignSystemClient() {
  const [categories, setCategories] = useState<CategoryMeta[]>([])
  const [elements, setElements] = useState<ElementCard[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<ElementCategory | 'all'>('all')
  const [filterStatus,   setFilterStatus]   = useState<Status | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('score-desc')

  // ── Initial fetch ──
  useEffect(() => {
    let cancelled = false
    fetch('/api/design-system/elements')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setCategories(data.categories ?? [])
        setElements(data.elements ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // ── Mutation: post a partial update for one slug ──
  async function patchElement(slug: string, patch: Partial<{ vote: Vote | null; status: Status; intended_use: string; notes: string }>) {
    const optimistic = elements.map((e) => (e.slug === slug ? { ...e, ...patch } : e))
    setElements(optimistic)

    const res = await fetch('/api/design-system/vote', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, ...patch }),
    })

    if (!res.ok) {
      // Refetch on failure to undo optimistic write
      const fresh = await fetch('/api/design-system/elements').then((r) => r.json())
      setElements(fresh.elements ?? [])
      return
    }
    const { vote: row } = await res.json()
    setElements((prev) => prev.map((e) => (e.slug === slug ? { ...e, ...row } : e)))
  }

  // ── Derived view ──
  const visible = useMemo(() => {
    let list = elements
    if (filterCategory !== 'all') list = list.filter((e) => e.category === filterCategory)
    if (filterStatus !== 'all')   list = list.filter((e) => e.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.slug.includes(q))
    }
    const sorted = [...list]
    switch (sort) {
      case 'score-desc':   sorted.sort((a, b) => b.score - a.score); break
      case 'score-asc':    sorted.sort((a, b) => a.score - b.score); break
      case 'name-asc':     sorted.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'updated-desc': sorted.sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? '')); break
    }
    return sorted
  }, [elements, filterCategory, filterStatus, search, sort])

  // ── Top-level summary ──
  const summary = useMemo(() => {
    const by: Record<Status, number> = { concept: 0, approved: 0, priority: 0, retire: 0 }
    for (const e of elements) by[e.status]++
    return by
  }, [elements])

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Design System</h1>
          <p className="mt-2 text-stone-600">
            Every graphic element in the platform. Vote · promote · curate. The priority set becomes the palette for new pages.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <a
              href="/picc/design-system/components"
              className="font-bold uppercase tracking-widest text-picc-ochre hover:underline"
            >
              Component gallery →
            </a>
            <a
              href="/picc/design-system/submissions"
              className="font-bold uppercase tracking-widest text-picc-ochre hover:underline"
            >
              Art submissions queue →
            </a>
          </div>
          {!loading && (
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <SummaryPill label="🔥 priority" count={summary.priority} active={filterStatus === 'priority'} onClick={() => setFilterStatus(filterStatus === 'priority' ? 'all' : 'priority')} color="bg-orange-100 text-orange-800" />
              <SummaryPill label="✓ approved" count={summary.approved} active={filterStatus === 'approved'} onClick={() => setFilterStatus(filterStatus === 'approved' ? 'all' : 'approved')} color="bg-sky-100 text-sky-800" />
              <SummaryPill label="◌ concept"  count={summary.concept}  active={filterStatus === 'concept'}  onClick={() => setFilterStatus(filterStatus === 'concept'  ? 'all' : 'concept')}  color="bg-stone-100 text-stone-700" />
              <SummaryPill label="× retire"   count={summary.retire}   active={filterStatus === 'retire'}   onClick={() => setFilterStatus(filterStatus === 'retire'   ? 'all' : 'retire')}   color="bg-red-50 text-red-700" />
              <span className="self-center text-stone-500">{visible.length} of {elements.length} shown</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="sticky top-0 z-10 -mx-6 mb-6 border-b border-stone-200 bg-stone-50/95 px-6 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="rounded border border-stone-300 bg-white px-3 py-1.5"
            >
              <option value="all">All categories ({elements.length})</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label} ({c.count})</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded border border-stone-300 bg-white px-3 py-1.5"
            >
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <input
              type="text"
              placeholder="Search name, slug, description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] rounded border border-stone-300 bg-white px-3 py-1.5"
            />

            {(filterCategory !== 'all' || filterStatus !== 'all' || search) && (
              <button
                onClick={() => { setFilterCategory('all'); setFilterStatus('all'); setSearch('') }}
                className="rounded border border-stone-300 bg-white px-3 py-1.5 text-stone-600 hover:bg-stone-100"
              >Reset</button>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center text-stone-500">Loading registry…</div>
        ) : visible.length === 0 ? (
          <div className="text-center text-stone-500">No elements match these filters.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((el) => (
              <ElementCardView key={el.slug} el={el} onPatch={patchElement} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────

function SummaryPill({ label, count, active, onClick, color }: { label: string; count: number; active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${color} ${active ? 'ring-2 ring-stone-900/30' : 'opacity-70 hover:opacity-100'}`}
    >
      {label} · {count}
    </button>
  )
}

function ElementCardView({ el, onPatch }: { el: ElementCard; onPatch: (slug: string, patch: any) => Promise<void> }) {
  const [intendedUse, setIntendedUse] = useState(el.intended_use ?? '')
  const [notes, setNotes] = useState(el.notes ?? '')

  // Keep local fields in sync if the server pushes back a refetch
  useEffect(() => { setIntendedUse(el.intended_use ?? '') }, [el.intended_use])
  useEffect(() => { setNotes(el.notes ?? '') }, [el.notes])

  const isBespokeIcon = el.category === 'bespoke-icon'

  return (
    <div className="flex flex-col rounded-lg border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Preview */}
      <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-t-lg ${isBespokeIcon ? 'bg-stone-50' : 'bg-stone-100'}`}>
        {el.previewType === 'image' && el.previewUrl ? (
          <>
            <img
              src={el.previewUrl}
              alt={el.name}
              className={`max-h-full max-w-full ${isBespokeIcon ? 'h-3/5 w-3/5 object-contain' : 'object-contain'}`}
            />
            {el.variantUrl && (
              <div className="absolute bottom-1 right-1 rounded bg-stone-900/80 p-1">
                <img src={el.variantUrl} alt={`${el.name} (white variant)`} className="h-6 w-6 object-contain" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <div className="text-3xl">⌘</div>
            <div className="text-xs uppercase tracking-widest text-stone-500">Code element</div>
            <div className="text-sm text-stone-700">{el.previewSrc}</div>
          </div>
        )}
        {el.score > 0 && (
          <div className="absolute top-2 right-2 rounded bg-stone-900/80 px-2 py-0.5 text-xs font-bold text-white">
            {el.score}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-stone-900">{el.name}</h3>
            <span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] uppercase tracking-wide ${STATUS_COLOR[el.status]}`}>
              {el.status}
            </span>
          </div>
          <p className="mt-1 text-xs leading-snug text-stone-600">{el.description}</p>
          <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-stone-400">
            <span className="font-mono">{el.slug}</span>
            {el.implementations?.map((i) => (
              <span key={i} className="rounded bg-stone-100 px-1.5 py-0.5 uppercase text-stone-500">{i}</span>
            ))}
          </div>
        </div>

        {/* Vote row */}
        <div className="flex items-center gap-1">
          {(['fire', 'up', 'meh', 'down'] as Vote[]).map((v) => (
            <button
              key={v}
              onClick={() => onPatch(el.slug, { vote: el.vote === v ? null : v })}
              className={`flex-1 rounded border py-1.5 text-lg transition ${el.vote === v ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white hover:border-stone-400'}`}
              title={v}
            >{VOTE_LABEL[v]}</button>
          ))}
        </div>

        {/* Status row */}
        <div className="flex flex-wrap gap-1 text-[11px]">
          {(['concept', 'approved', 'priority', 'retire'] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => onPatch(el.slug, { status: s })}
              className={`rounded border px-2 py-1 transition ${el.status === s ? 'border-stone-900 bg-stone-900 text-white' : `${STATUS_COLOR[s]} hover:opacity-80`}`}
            >{s}</button>
          ))}
        </div>

        {/* Intended use */}
        <input
          type="text"
          value={intendedUse}
          onChange={(e) => setIntendedUse(e.target.value)}
          onBlur={() => intendedUse !== (el.intended_use ?? '') && onPatch(el.slug, { intended_use: intendedUse })}
          placeholder="Intended use (one line)"
          className="w-full rounded border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none"
        />

        {/* Notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => notes !== (el.notes ?? '') && onPatch(el.slug, { notes })}
          placeholder="Notes…"
          rows={2}
          className="w-full resize-none rounded border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none"
        />
      </div>
    </div>
  )
}
