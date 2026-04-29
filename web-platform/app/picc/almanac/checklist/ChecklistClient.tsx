'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

export interface ChecklistItem {
  slug: string
  category: 'data' | 'sign-off' | 'photos' | 'content' | 'video'
  title: string
  description: string | null
  owner: string | null
  due_date: string | null
  urgency: 'urgent' | 'normal' | 'low'
  status: 'open' | 'in-progress' | 'done' | 'blocked' | 'n-a'
  resolved_at: string | null
  comment: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PhotoFlagSummary {
  total: number
  wrong: number
  review: number
  placeholder: number
  approved: number
  unresolved: number
}

const CATEGORY_LABEL: Record<ChecklistItem['category'], string> = {
  data: 'Data',
  'sign-off': 'Sign-off',
  photos: 'Photos',
  content: 'Content',
  video: 'Video',
}

const CATEGORY_COLOUR: Record<ChecklistItem['category'], string> = {
  data:       'bg-amber-100 text-amber-900 border-amber-200',
  'sign-off': 'bg-rose-100 text-rose-900 border-rose-200',
  photos:     'bg-sky-100 text-sky-900 border-sky-200',
  content:    'bg-violet-100 text-violet-900 border-violet-200',
  video:      'bg-emerald-100 text-emerald-900 border-emerald-200',
}

const STATUS_COLOUR: Record<ChecklistItem['status'], { bg: string; label: string }> = {
  open:          { bg: 'bg-stone-200 text-stone-700',     label: '○ open' },
  'in-progress': { bg: 'bg-amber-200 text-amber-900',     label: '◐ in progress' },
  done:          { bg: 'bg-emerald-200 text-emerald-900', label: '✓ done' },
  blocked:       { bg: 'bg-red-200 text-red-900',         label: '✗ blocked' },
  'n-a':         { bg: 'bg-stone-100 text-stone-500',     label: '— n/a' },
}

const URGENCY_COLOUR: Record<ChecklistItem['urgency'], string> = {
  urgent: 'bg-red-600 text-white',
  normal: 'bg-stone-300 text-stone-800',
  low:    'bg-stone-100 text-stone-600',
}

type Filter = 'all' | 'open' | 'urgent' | 'done' | 'blocked'

interface Props {
  items: ChecklistItem[]
  photoFlags: PhotoFlagSummary
}

export default function ChecklistClient({ items: initial, photoFlags }: Props) {
  const [items, setItems] = useState<ChecklistItem[]>(initial)
  const [filter, setFilter] = useState<Filter>('open')
  const [editingComment, setEditingComment] = useState<string | null>(null)

  // ── Mutations ──
  async function patchItem(slug: string, patch: Partial<ChecklistItem>) {
    setItems((prev) => prev.map((it) => (it.slug === slug ? { ...it, ...patch } : it)))
    const res = await fetch('/api/almanac/checklist', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, ...patch }),
    })
    if (res.ok) {
      const { item } = await res.json()
      setItems((prev) => prev.map((it) => (it.slug === slug ? item : it)))
    }
  }

  // ── Derived ──
  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (filter === 'all') return true
      if (filter === 'open') return it.status === 'open' || it.status === 'in-progress'
      if (filter === 'urgent') return it.urgency === 'urgent' && it.status !== 'done' && it.status !== 'n-a'
      if (filter === 'done') return it.status === 'done'
      if (filter === 'blocked') return it.status === 'blocked'
      return true
    })
  }, [items, filter])

  const grouped = useMemo(() => {
    const out = new Map<ChecklistItem['category'], ChecklistItem[]>()
    for (const it of filtered) {
      const arr = out.get(it.category) ?? []
      arr.push(it)
      out.set(it.category, arr)
    }
    return out
  }, [filtered])

  const stats = useMemo(() => {
    const total = items.length
    const done = items.filter((i) => i.status === 'done' || i.status === 'n-a').length
    const blocked = items.filter((i) => i.status === 'blocked').length
    const urgent = items.filter((i) => i.urgency === 'urgent' && i.status !== 'done' && i.status !== 'n-a').length
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)
    return { total, done, blocked, urgent, pct }
  }, [items])

  const photoBlockerCount = photoFlags.unresolved + photoFlags.wrong
  const readyToShip = stats.urgent === 0 && stats.blocked === 0 && stats.pct === 100 && photoBlockerCount === 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* ── Header ── */}
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Internal · Almanac · Pre-publish
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-stone-800 italic mb-3">
          Almanac Pre-publish Checklist
        </h1>
        <p className="text-stone-600 max-w-2xl leading-relaxed">
          Every blocker before the 2024-25 almanac can ship. Data, sign-offs,
          photo flags, content, and video. One ready-percentage at the top.
        </p>
      </div>

      {/* ── Readiness banner ── */}
      <div className={`rounded-2xl border-2 p-6 ${readyToShip ? 'border-emerald-400 bg-emerald-50' : 'border-stone-200 bg-stone-50'}`}>
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-500 mb-1">
              {readyToShip ? '✓ Ready to publish' : 'Not ready to publish'}
            </div>
            <div className="font-serif text-5xl text-stone-800 italic">
              {stats.pct}<span className="text-2xl text-stone-500">% complete</span>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <Stat label="Total" value={stats.total} />
            <Stat label="Done" value={stats.done} tone="emerald" />
            <Stat label="Urgent open" value={stats.urgent} tone={stats.urgent ? 'red' : 'stone'} />
            <Stat label="Blocked" value={stats.blocked} tone={stats.blocked ? 'red' : 'stone'} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-stone-200 overflow-hidden">
          <div
            className={`h-full transition-all ${readyToShip ? 'bg-emerald-500' : 'bg-picc-ochre'}`}
            style={{ width: `${stats.pct}%` }}
          />
        </div>

        {/* Photo flags inline summary */}
        <div className="mt-5 flex items-center gap-4 text-sm text-stone-700 flex-wrap">
          <Link href="/picc/almanac/photos" className="text-picc-ochre hover:underline font-semibold">
            Photos →
          </Link>
          <span>{photoFlags.total} flagged total</span>
          <span className={photoFlags.unresolved ? 'font-semibold text-red-700' : 'text-stone-500'}>
            {photoFlags.unresolved} unresolved
          </span>
          <span className="text-stone-500">{photoFlags.wrong} wrong · {photoFlags.review} review · {photoFlags.placeholder} placeholder · {photoFlags.approved} approved</span>
        </div>
      </div>

      {/* ── Filter pills ── */}
      <div className="flex gap-2 flex-wrap">
        {(['open', 'urgent', 'all', 'done', 'blocked'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm transition ${
              filter === f
                ? 'bg-stone-800 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {f === 'open' && '○ Open'}
            {f === 'urgent' && '! Urgent'}
            {f === 'all' && '· All'}
            {f === 'done' && '✓ Done'}
            {f === 'blocked' && '✗ Blocked'}
            {' '}({
              f === 'all' ? items.length :
              f === 'open' ? items.filter(i => i.status === 'open' || i.status === 'in-progress').length :
              f === 'urgent' ? stats.urgent :
              f === 'done' ? stats.done :
              stats.blocked
            })
          </button>
        ))}
      </div>

      {/* ── Grouped items ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          Nothing matches this filter — clear the filter to see all items.
        </div>
      ) : (
        <div className="space-y-8">
          {(['data', 'sign-off', 'content', 'photos', 'video'] as const).map((cat) => {
            const list = grouped.get(cat)
            if (!list || list.length === 0) return null
            return (
              <section key={cat}>
                <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-stone-500 mb-3">
                  {CATEGORY_LABEL[cat]} · {list.length}
                </h2>
                <div className="space-y-2">
                  {list.map((it) => (
                    <ItemRow
                      key={it.slug}
                      item={it}
                      onPatch={(patch) => patchItem(it.slug, patch)}
                      isEditingComment={editingComment === it.slug}
                      onToggleEditComment={() =>
                        setEditingComment(editingComment === it.slug ? null : it.slug)
                      }
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, tone = 'stone' }: { label: string; value: number; tone?: 'stone' | 'emerald' | 'red' }) {
  const colour =
    tone === 'emerald' ? 'text-emerald-700' :
    tone === 'red' ? 'text-red-700' :
    'text-stone-700'
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-stone-500">{label}</div>
      <div className={`text-2xl font-serif ${colour}`}>{value}</div>
    </div>
  )
}

interface ItemRowProps {
  item: ChecklistItem
  onPatch: (patch: Partial<ChecklistItem>) => void
  isEditingComment: boolean
  onToggleEditComment: () => void
}

function ItemRow({ item, onPatch, isEditingComment, onToggleEditComment }: ItemRowProps) {
  const [commentDraft, setCommentDraft] = useState(item.comment ?? '')

  return (
    <div className={`rounded-lg border p-4 ${item.status === 'done' || item.status === 'n-a' ? 'bg-stone-50 border-stone-200 opacity-70' : 'bg-white border-stone-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLOUR[item.category]}`}>
              {CATEGORY_LABEL[item.category]}
            </span>
            {item.urgency === 'urgent' && (
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${URGENCY_COLOUR[item.urgency]}`}>
                Urgent
              </span>
            )}
            <code className="text-[10px] text-stone-400 font-mono">{item.slug}</code>
          </div>
          <div className={`font-serif text-lg ${item.status === 'done' || item.status === 'n-a' ? 'line-through text-stone-500' : 'text-stone-800'}`}>
            {item.title}
          </div>
          {item.description && (
            <p className="text-sm text-stone-600 mt-1">{item.description}</p>
          )}
          {item.owner && (
            <p className="text-xs text-stone-500 mt-1">Owner: <span className="text-stone-700">{item.owner}</span></p>
          )}
          {item.comment && !isEditingComment && (
            <div className="mt-2 text-sm bg-amber-50 border-l-2 border-amber-400 px-3 py-2 text-stone-700 italic">
              {item.comment}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end shrink-0">
          <select
            value={item.status}
            onChange={(e) => onPatch({ status: e.target.value as ChecklistItem['status'] })}
            className={`text-xs px-2 py-1.5 rounded border-0 cursor-pointer ${STATUS_COLOUR[item.status].bg}`}
          >
            {(Object.keys(STATUS_COLOUR) as ChecklistItem['status'][]).map((s) => (
              <option key={s} value={s}>{STATUS_COLOUR[s].label}</option>
            ))}
          </select>

          <select
            value={item.urgency}
            onChange={(e) => onPatch({ urgency: e.target.value as ChecklistItem['urgency'] })}
            className="text-xs px-2 py-1 rounded border border-stone-200 bg-white text-stone-600 cursor-pointer"
          >
            <option value="urgent">! Urgent</option>
            <option value="normal">· Normal</option>
            <option value="low">↓ Low</option>
          </select>

          <button
            onClick={onToggleEditComment}
            className="text-xs text-stone-500 hover:text-stone-800"
          >
            {item.comment ? '✎ Edit note' : '+ Add note'}
          </button>
        </div>
      </div>

      {isEditingComment && (
        <div className="mt-3 pt-3 border-t border-stone-200 space-y-2">
          <textarea
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            placeholder="Note for editors — what's blocking, who you're waiting on, decisions made…"
            className="w-full text-sm p-2 rounded border border-stone-300 bg-white"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onPatch({ comment: commentDraft || null })
                onToggleEditComment()
              }}
              className="px-3 py-1.5 rounded bg-stone-800 text-white text-xs hover:bg-stone-900"
            >
              Save
            </button>
            <button
              onClick={onToggleEditComment}
              className="px-3 py-1.5 rounded text-xs text-stone-500 hover:text-stone-800"
            >
              Cancel
            </button>
            {item.comment && (
              <button
                onClick={() => {
                  setCommentDraft('')
                  onPatch({ comment: null })
                  onToggleEditComment()
                }}
                className="ml-auto px-3 py-1.5 rounded text-xs text-red-600 hover:text-red-800"
              >
                Clear note
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
