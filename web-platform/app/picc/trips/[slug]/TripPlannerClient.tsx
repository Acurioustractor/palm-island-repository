'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus, X, Loader2, Circle, Clock, CheckCircle2, User, ExternalLink,
  CircleDollarSign, Lightbulb, Flag, Users as UsersIcon,
} from 'lucide-react'
import type { Trip, TripMilestone, TripBudgetRow, TripIdea } from '@/lib/trips/seed'

const MILESTONE_STATUSES: Array<{ value: TripMilestone['status']; label: string; icon: any; cls: string }> = [
  { value: 'open',        label: 'Open',         icon: Circle,       cls: 'text-stone-500' },
  { value: 'in_progress', label: 'In progress',  icon: Clock,        cls: 'text-sky-600' },
  { value: 'done',        label: 'Done',         icon: CheckCircle2, cls: 'text-green-600' },
  { value: 'cancelled',   label: 'Cancelled',    icon: X,            cls: 'text-stone-400' },
]

const BUDGET_STATUSES: TripBudgetRow['status'][] = ['estimating', 'requested', 'approved', 'paid', 'rejected']

interface ResolvedAttendee {
  slug: string
  photo_url: string | null
  role: string | null
  is_elder: boolean
}

interface Props {
  slug: string
  initial: Trip
  elderByName: Record<string, ResolvedAttendee>
  canEdit: boolean
}

function genId(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function fmtMoney(n: number): string {
  if (!n) return '—'
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 })
}

function fmtDate(d: string): string {
  if (!d) return ''
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return d }
}

export default function TripPlannerClient({ slug, initial, elderByName, canEdit }: Props) {
  const [trip, setTrip] = useState<Trip>(initial)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  const persist = (next: Trip) => {
    setTrip(next)
    if (!canEdit) return
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/trips/${slug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: next.data }),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j?.error || `Save failed (${res.status})`)
        }
        setSavedAt(new Date())
      } catch (err: any) {
        setError(err?.message || 'Save failed')
      }
    })
  }

  // ── Milestone helpers
  const updateMilestone = (id: string, patch: Partial<TripMilestone>) => {
    persist({
      ...trip,
      data: {
        ...trip.data,
        milestones: trip.data.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      },
    })
  }
  const addMilestone = () => {
    persist({
      ...trip,
      data: {
        ...trip.data,
        milestones: [
          ...trip.data.milestones,
          { id: genId('m'), text: '', date: '', status: 'open' },
        ],
      },
    })
  }
  const removeMilestone = (id: string) => {
    persist({
      ...trip,
      data: { ...trip.data, milestones: trip.data.milestones.filter((m) => m.id !== id) },
    })
  }

  // ── Budget helpers
  const updateBudget = (id: string, patch: Partial<TripBudgetRow>) => {
    persist({
      ...trip,
      data: {
        ...trip.data,
        budget: trip.data.budget.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      },
    })
  }
  const addBudget = () => {
    persist({
      ...trip,
      data: {
        ...trip.data,
        budget: [
          ...trip.data.budget,
          { id: genId('b'), item: '', source: '', amount_min: 0, amount_max: 0, status: 'estimating', notes: '' },
        ],
      },
    })
  }
  const removeBudget = (id: string) => {
    persist({
      ...trip,
      data: { ...trip.data, budget: trip.data.budget.filter((b) => b.id !== id) },
    })
  }

  // ── Idea helpers
  const updateIdea = (id: string, text: string) => {
    persist({
      ...trip,
      data: {
        ...trip.data,
        ideas: trip.data.ideas.map((i) => (i.id === id ? { ...i, text } : i)),
      },
    })
  }
  const addIdea = () => {
    persist({
      ...trip,
      data: {
        ...trip.data,
        ideas: [...trip.data.ideas, { id: genId('i'), text: '' }],
      },
    })
  }
  const removeIdea = (id: string) => {
    persist({
      ...trip,
      data: { ...trip.data, ideas: trip.data.ideas.filter((i) => i.id !== id) },
    })
  }
  const promoteIdeaToMilestone = (idea: TripIdea) => {
    persist({
      ...trip,
      data: {
        ...trip.data,
        milestones: [
          ...trip.data.milestones,
          { id: genId('m'), text: idea.text, date: '', status: 'open' },
        ],
        ideas: trip.data.ideas.filter((i) => i.id !== idea.id),
      },
    })
  }

  // ── Notes
  const updateNotes = (notes: string) => {
    persist({ ...trip, data: { ...trip.data, notes } })
  }

  // Budget summary
  const totalRequested = trip.data.budget
    .filter((b) => b.status === 'requested' || b.status === 'approved')
    .reduce((sum, b) => sum + (b.amount_max || b.amount_min || 0), 0)
  const totalApproved = trip.data.budget
    .filter((b) => b.status === 'approved' || b.status === 'paid')
    .reduce((sum, b) => sum + (b.amount_max || b.amount_min || 0), 0)

  return (
    <div className="space-y-8">
      {/* Status banner */}
      <div className="flex items-center justify-between text-xs">
        <div className="text-stone-500">
          {pending && <span className="inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving…</span>}
          {!pending && savedAt && <span className="text-green-600">Saved {savedAt.toLocaleTimeString('en-AU')}</span>}
        </div>
        {error && <span className="text-red-600">{error}</span>}
      </div>

      {/* Attendees */}
      <Section icon={<UsersIcon className="w-4 h-4" />} title="Travelling together" subtitle={`${trip.data.attendee_names.length} people`}>
        {trip.data.attendee_names.length === 0 ? (
          <p className="text-sm text-stone-400 italic">No attendees added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {trip.data.attendee_names.map((name) => {
              const r = elderByName[name.toLowerCase().trim()]
              const cardCls = r?.is_elder
                ? 'border-amber-200 bg-amber-50'
                : r
                ? 'border-picc-ochre/30 bg-picc-ochre/5'
                : 'border-stone-200 bg-stone-50'
              return (
                <div key={name} className={`flex items-center gap-3 rounded-lg border p-2.5 ${cardCls}`}>
                  {r?.photo_url ? (
                    <Link href={`/voices/${r.slug}`} className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-stone-200">
                      <Image src={r.photo_url} alt={name} fill sizes="40px" className="object-cover" />
                    </Link>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0 text-stone-500">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {r ? (
                      <Link href={`/voices/${r.slug}`} className="text-sm font-semibold text-stone-800 hover:underline inline-flex items-center gap-1 truncate">
                        {name}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-stone-700 truncate">{name}</p>
                    )}
                    <p className="text-[11px] text-stone-500 truncate">
                      {r?.is_elder && <span className="font-bold text-amber-700 uppercase mr-1">Elder ·</span>}
                      {r?.role || (r ? '' : 'Plain attendee')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      {/* Milestones */}
      <Section icon={<Flag className="w-4 h-4" />} title="Milestones" subtitle={`${trip.data.milestones.filter((m) => m.status === 'done').length} of ${trip.data.milestones.length} done`}>
        <div className="space-y-2 mb-3">
          {trip.data.milestones.length === 0 ? (
            <p className="text-sm text-stone-400 italic">No milestones yet.</p>
          ) : (
            trip.data.milestones
              .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'))
              .map((m) => {
                const statusCfg = MILESTONE_STATUSES.find((s) => s.value === m.status) || MILESTONE_STATUSES[0]
                const Icon = statusCfg.icon
                return (
                  <div key={m.id} className="flex items-start gap-2 rounded-lg border border-stone-200 bg-white p-3">
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => {
                        const order: TripMilestone['status'][] = ['open', 'in_progress', 'done', 'cancelled']
                        const next = order[(order.indexOf(m.status) + 1) % order.length]
                        updateMilestone(m.id, { status: next })
                      }}
                      title={`Status: ${statusCfg.label} (click to advance)`}
                      className={`mt-1 ${statusCfg.cls} ${canEdit ? 'hover:scale-110' : ''} transition-transform`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={m.text}
                      onChange={(e) => updateMilestone(m.id, { text: e.target.value })}
                      readOnly={!canEdit}
                      placeholder="Milestone description"
                      className={`flex-1 px-2 py-1 text-sm bg-transparent ${canEdit ? 'border border-transparent hover:border-stone-200 focus:border-stone-300 focus:bg-white' : ''} rounded ${m.status === 'done' ? 'line-through text-stone-500' : 'text-stone-800'}`}
                    />
                    <input
                      type="date"
                      value={m.date}
                      onChange={(e) => updateMilestone(m.id, { date: e.target.value })}
                      readOnly={!canEdit}
                      className="px-2 py-1 text-xs text-stone-600 bg-transparent border border-transparent hover:border-stone-200 rounded w-32"
                    />
                    {canEdit && (
                      <button type="button" onClick={() => removeMilestone(m.id)} className="text-stone-300 hover:text-red-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )
              })
          )}
        </div>
        {canEdit && (
          <button type="button" onClick={addMilestone} className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-picc-ochre">
            <Plus className="w-4 h-4" /> Add milestone
          </button>
        )}
      </Section>

      {/* Budget */}
      <Section
        icon={<CircleDollarSign className="w-4 h-4" />}
        title="Budget"
        subtitle={`Requested ${fmtMoney(totalRequested)} · Approved ${fmtMoney(totalApproved)}`}
      >
        <div className="space-y-2 mb-3">
          {trip.data.budget.length === 0 ? (
            <p className="text-sm text-stone-400 italic">No budget rows yet.</p>
          ) : (
            trip.data.budget.map((b) => (
              <div key={b.id} className="rounded-lg border border-stone-200 bg-white p-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={b.item}
                    onChange={(e) => updateBudget(b.id, { item: e.target.value })}
                    readOnly={!canEdit}
                    placeholder="Item"
                    className="md:col-span-4 px-2 py-1 text-sm border border-transparent hover:border-stone-200 rounded"
                  />
                  <input
                    type="text"
                    value={b.source}
                    onChange={(e) => updateBudget(b.id, { source: e.target.value })}
                    readOnly={!canEdit}
                    placeholder="Source"
                    className="md:col-span-3 px-2 py-1 text-sm border border-transparent hover:border-stone-200 rounded"
                  />
                  <input
                    type="number"
                    value={b.amount_min || ''}
                    onChange={(e) => updateBudget(b.id, { amount_min: Number(e.target.value) || 0 })}
                    readOnly={!canEdit}
                    placeholder="Min"
                    className="md:col-span-1 px-2 py-1 text-sm border border-transparent hover:border-stone-200 rounded text-right"
                  />
                  <span className="text-stone-300 text-center">–</span>
                  <input
                    type="number"
                    value={b.amount_max || ''}
                    onChange={(e) => updateBudget(b.id, { amount_max: Number(e.target.value) || 0 })}
                    readOnly={!canEdit}
                    placeholder="Max"
                    className="md:col-span-1 px-2 py-1 text-sm border border-transparent hover:border-stone-200 rounded text-right"
                  />
                  <select
                    value={b.status}
                    onChange={(e) => updateBudget(b.id, { status: e.target.value as TripBudgetRow['status'] })}
                    disabled={!canEdit}
                    className="md:col-span-2 px-2 py-1 text-xs rounded border border-stone-200 bg-white"
                  >
                    {BUDGET_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                {(b.notes || canEdit) && (
                  <input
                    type="text"
                    value={b.notes}
                    onChange={(e) => updateBudget(b.id, { notes: e.target.value })}
                    readOnly={!canEdit}
                    placeholder="Notes (e.g. supporting materials, conditions)"
                    className="w-full px-2 py-1 text-xs text-stone-600 border border-transparent hover:border-stone-200 rounded"
                  />
                )}
                {canEdit && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removeBudget(b.id)} className="text-xs text-stone-400 hover:text-red-600">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {canEdit && (
          <button type="button" onClick={addBudget} className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-picc-ochre">
            <Plus className="w-4 h-4" /> Add budget row
          </button>
        )}
      </Section>

      {/* Ideas */}
      <Section icon={<Lightbulb className="w-4 h-4" />} title="Ideas + sites to visit" subtitle="Capture loosely · promote to milestones when ready">
        <div className="space-y-2 mb-3">
          {trip.data.ideas.length === 0 ? (
            <p className="text-sm text-stone-400 italic">No ideas yet — capture them as the conversation flows.</p>
          ) : (
            trip.data.ideas.map((i) => (
              <div key={i.id} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white p-2.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <input
                  type="text"
                  value={i.text}
                  onChange={(e) => updateIdea(i.id, e.target.value)}
                  readOnly={!canEdit}
                  placeholder="Idea / site"
                  className="flex-1 px-2 py-1 text-sm bg-transparent border border-transparent hover:border-stone-200 rounded"
                />
                {canEdit && (
                  <>
                    <button
                      type="button"
                      onClick={() => promoteIdeaToMilestone(i)}
                      title="Promote to milestone"
                      className="text-[10px] text-stone-500 hover:text-picc-ochre uppercase tracking-wide"
                    >
                      → Milestone
                    </button>
                    <button type="button" onClick={() => removeIdea(i.id)} className="text-stone-300 hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
        {canEdit && (
          <button type="button" onClick={addIdea} className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-picc-ochre">
            <Plus className="w-4 h-4" /> Add idea
          </button>
        )}
      </Section>

      {/* Notes */}
      <Section icon={<Flag className="w-4 h-4" />} title="Notes" subtitle="Free text · context · open questions">
        <textarea
          value={trip.data.notes}
          onChange={(e) => updateNotes(e.target.value)}
          readOnly={!canEdit}
          rows={5}
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg leading-relaxed"
        />
      </Section>
    </div>
  )
}

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <div className="inline-flex items-center gap-2 text-stone-700">
          {icon}
          <h2 className="font-serif text-xl italic text-stone-800">{title}</h2>
        </div>
        {subtitle && <span className="text-xs text-stone-500 font-mono">{subtitle}</span>}
      </div>
      {children}
    </section>
  )
}
