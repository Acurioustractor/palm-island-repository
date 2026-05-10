'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, Clock, X, Loader2, User, Calendar, ExternalLink } from 'lucide-react'

export type ItemStatus = 'open' | 'in_progress' | 'done' | 'cancelled'

interface ActionItemState {
  status: ItemStatus
  assignee: string | null
  due_date: string | null
  completion_notes: string | null
  completed_at: string | null
}

interface Props {
  meetingId: string
  itemIndex: number
  text: string
  initialState: ActionItemState | null
  /** Whether the action_item_states table exists (Phase 2 enabled). */
  phase2Enabled: boolean
}

const STATUS_PILLS: Array<{ value: ItemStatus; label: string; icon: any; cls: string }> = [
  { value: 'open',        label: 'Open',         icon: Circle,        cls: 'bg-stone-100 text-stone-700 border-stone-200' },
  { value: 'in_progress', label: 'In progress',  icon: Clock,         cls: 'bg-sky-50 text-sky-800 border-sky-200' },
  { value: 'done',        label: 'Done',         icon: CheckCircle2,  cls: 'bg-green-50 text-green-800 border-green-200' },
  { value: 'cancelled',   label: 'Cancelled',    icon: X,             cls: 'bg-stone-100 text-stone-500 border-stone-200 line-through' },
]

export default function ActionItemRow({ meetingId, itemIndex, text, initialState, phase2Enabled }: Props) {
  const [state, setState] = useState<ActionItemState>(
    initialState || { status: 'open', assignee: null, due_date: null, completion_notes: null, completed_at: null }
  )
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const persist = (next: Partial<ActionItemState>) => {
    if (!phase2Enabled) {
      setError('Phase 2 not enabled — apply migration first')
      return
    }
    const optimistic = { ...state, ...next }
    setState(optimistic)
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/meetings/action-items', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meeting_id: meetingId,
            item_index: itemIndex,
            ...next,
          }),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j?.error || `Save failed (${res.status})`)
        }
      } catch (err: any) {
        setError(err?.message || 'Save failed')
        // best-effort: don't revert optimistic update; user can refresh to re-fetch
      }
    })
  }

  const isDone = state.status === 'done'
  const isCancelled = state.status === 'cancelled'

  return (
    <div className="px-5 py-3">
      <div className="flex items-start gap-3">
        {/* Status indicator (clickable when Phase 2 on) */}
        <div className="flex-shrink-0 mt-0.5">
          {isDone ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : isCancelled ? (
            <X className="w-4 h-4 text-stone-300" />
          ) : state.status === 'in_progress' ? (
            <Clock className="w-4 h-4 text-sky-500" />
          ) : (
            <Circle className="w-4 h-4 text-stone-300" />
          )}
        </div>

        {/* Item text */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/picc/action-items/${meetingId}/${itemIndex}`}
            className="group inline-flex items-start gap-1 hover:text-picc-ochre"
          >
            <p className={`text-sm leading-relaxed ${isDone ? 'text-stone-500 line-through' : isCancelled ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
              {text}
            </p>
            <ExternalLink className="w-3 h-3 text-stone-300 group-hover:text-picc-ochre shrink-0 mt-0.5" />
          </Link>

          {/* Status pills */}
          {phase2Enabled && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {STATUS_PILLS.map((p) => {
                const Icon = p.icon
                const active = state.status === p.value
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => persist({ status: p.value })}
                    disabled={pending}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                      active ? p.cls + ' ring-1 ring-current' : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {p.label}
                  </button>
                )
              })}
              {pending && <Loader2 className="w-3 h-3 animate-spin text-stone-400 ml-1" />}
            </div>
          )}

          {/* Meta row */}
          {(state.assignee || state.due_date) && !editing && (
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-stone-500">
              {state.assignee && (
                <span className="inline-flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {state.assignee}
                </span>
              )}
              {state.due_date && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  due {state.due_date}
                </span>
              )}
            </div>
          )}

          {/* Edit toggle */}
          {phase2Enabled && (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="mt-2 text-[11px] text-stone-500 hover:text-picc-ochre underline"
            >
              {editing ? 'Hide details' : (state.assignee || state.due_date ? 'Edit details' : '+ Add assignee or due date')}
            </button>
          )}

          {/* Edit form */}
          {editing && phase2Enabled && (
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Assignee (e.g. Aunty Pearl, Ben)"
                defaultValue={state.assignee || ''}
                onBlur={(e) => {
                  const v = e.target.value.trim()
                  if (v !== (state.assignee || '')) persist({ assignee: v || null })
                }}
                className="px-2 py-1 border border-stone-300 rounded text-xs"
              />
              <input
                type="date"
                defaultValue={state.due_date || ''}
                onBlur={(e) => {
                  const v = e.target.value || null
                  if (v !== state.due_date) persist({ due_date: v })
                }}
                className="px-2 py-1 border border-stone-300 rounded text-xs"
              />
              <textarea
                placeholder="Completion notes…"
                defaultValue={state.completion_notes || ''}
                onBlur={(e) => {
                  const v = e.target.value.trim()
                  if (v !== (state.completion_notes || '')) persist({ completion_notes: v || null })
                }}
                rows={2}
                className="md:col-span-2 px-2 py-1 border border-stone-300 rounded text-xs"
              />
            </div>
          )}

          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )
}
