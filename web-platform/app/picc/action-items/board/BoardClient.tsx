'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Circle, Clock, CheckCircle2, X, User, Calendar, Lock, AlertTriangle } from 'lucide-react'

export type ItemStatus = 'open' | 'in_progress' | 'done' | 'cancelled'

export interface BoardItem {
  meeting_id: string
  item_index: number
  text: string
  meeting_title: string
  meeting_date: string
  group_name: string
  status: ItemStatus
  assignee: string | null
  due_date: string | null
  requires_elder_approval: boolean
}

const COLUMNS: Array<{ id: ItemStatus; label: string; icon: any; bg: string; border: string; pill: string }> = [
  { id: 'open',        label: 'Open',        icon: Circle,       bg: 'bg-stone-50',  border: 'border-stone-200', pill: 'text-stone-700' },
  { id: 'in_progress', label: 'In progress', icon: Clock,        bg: 'bg-sky-50',    border: 'border-sky-200',   pill: 'text-sky-800' },
  { id: 'done',        label: 'Done',        icon: CheckCircle2, bg: 'bg-green-50',  border: 'border-green-200', pill: 'text-green-800' },
  { id: 'cancelled',   label: 'Cancelled',   icon: X,            bg: 'bg-stone-100', border: 'border-stone-200', pill: 'text-stone-500' },
]

interface Props {
  initialItems: BoardItem[]
  phase2Enabled: boolean
}

export default function BoardClient({ initialItems, phase2Enabled }: Props) {
  const [items, setItems] = useState(initialItems)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<ItemStatus | null>(null)

  const moveItem = (meetingId: string, itemIndex: number, nextStatus: ItemStatus) => {
    if (!phase2Enabled) {
      setError('Phase 2 not enabled — apply the migration first')
      return
    }
    setError(null)
    // Optimistic
    setItems((prev) =>
      prev.map((it) =>
        it.meeting_id === meetingId && it.item_index === itemIndex
          ? { ...it, status: nextStatus }
          : it
      )
    )
    startTransition(async () => {
      try {
        const res = await fetch('/api/meetings/action-items', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meeting_id: meetingId, item_index: itemIndex, status: nextStatus }),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j?.error || `Save failed (${res.status})`)
        }
      } catch (err: any) {
        setError(err?.message || 'Save failed')
      }
    })
  }

  const handleDragStart = (e: React.DragEvent, item: BoardItem) => {
    e.dataTransfer.setData(
      'application/x-action-item',
      JSON.stringify({ meeting_id: item.meeting_id, item_index: item.item_index, status: item.status })
    )
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, status: ItemStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCol !== status) setDragOverCol(status)
  }

  const handleDragLeave = () => setDragOverCol(null)

  const handleDrop = (e: React.DragEvent, nextStatus: ItemStatus) => {
    e.preventDefault()
    setDragOverCol(null)
    try {
      const raw = e.dataTransfer.getData('application/x-action-item')
      if (!raw) return
      const payload = JSON.parse(raw) as { meeting_id: string; item_index: number; status: ItemStatus }
      if (payload.status === nextStatus) return
      moveItem(payload.meeting_id, payload.item_index, nextStatus)
    } catch { /* ignore malformed */ }
  }

  const cycleStatus = (current: ItemStatus): ItemStatus => {
    const order: ItemStatus[] = ['open', 'in_progress', 'done', 'cancelled']
    const idx = order.indexOf(current)
    return order[(idx + 1) % order.length]
  }

  return (
    <div>
      {!phase2Enabled && (
        <div className="mb-6 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>Read-only.</strong> Apply the action_item_states migration to enable drag-and-drop.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colItems = items.filter((i) => i.status === col.id)
          const isDragTarget = dragOverCol === col.id
          const Icon = col.icon
          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-xl border ${col.border} ${col.bg} p-3 min-h-[200px] transition-all ${
                isDragTarget ? 'ring-2 ring-picc-ochre ring-offset-2' : ''
              }`}
            >
              {/* Column header */}
              <div className={`flex items-center justify-between mb-3 ${col.pill}`}>
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Icon className="w-4 h-4" />
                  {col.label}
                </div>
                <span className="text-xs font-mono opacity-60">{colItems.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {colItems.length === 0 ? (
                  <p className="text-xs text-stone-400 italic text-center py-4">
                    Drop cards here
                  </p>
                ) : (
                  colItems.map((item) => (
                    <div
                      key={`${item.meeting_id}-${item.item_index}`}
                      draggable={phase2Enabled}
                      onDragStart={(e) => handleDragStart(e, item)}
                      className={`group bg-white rounded-lg border border-stone-200 p-3 shadow-sm hover:shadow-md transition-shadow ${
                        phase2Enabled ? 'cursor-move' : ''
                      } ${col.id === 'done' ? 'opacity-70' : ''} ${col.id === 'cancelled' ? 'opacity-50' : ''}`}
                    >
                      <Link
                        href={`/picc/action-items/${item.meeting_id}/${item.item_index}`}
                        className="block"
                      >
                        <p className={`text-sm leading-snug text-stone-800 ${
                          col.id === 'done' ? 'line-through' : ''
                        } ${col.id === 'cancelled' ? 'line-through text-stone-400' : ''}`}>
                          {item.text}
                        </p>

                        {(item.assignee || item.due_date) && (
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-500">
                            {item.assignee && (
                              <span className="inline-flex items-center gap-0.5">
                                <User className="w-2.5 h-2.5" />
                                {item.assignee}
                              </span>
                            )}
                            {item.due_date && (
                              <span className="inline-flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5" />
                                {item.due_date}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-stone-100">
                          <p className="text-[10px] text-stone-400 truncate flex-1">
                            {item.meeting_title}
                          </p>
                          {item.requires_elder_approval && (
                            <Lock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                          )}
                        </div>
                      </Link>

                      {/* Touch fallback: tap to cycle status */}
                      {phase2Enabled && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveItem(item.meeting_id, item.item_index, cycleStatus(item.status))
                          }}
                          disabled={pending}
                          className="md:hidden mt-2 w-full text-[10px] text-stone-500 hover:text-picc-ochre underline"
                        >
                          Tap to advance →
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {pending && (
        <p className="text-xs text-stone-400 italic mt-4">Saving…</p>
      )}
    </div>
  )
}
