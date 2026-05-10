'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, X, ExternalLink, Loader2, User } from 'lucide-react'

export interface Elder {
  id: string
  slug: string
  name: string
  role: string | null
  photo_url: string | null
  location: string | null
  quote_count: number
  is_elder?: boolean
}

interface Props {
  meetingId: string
  initialAttendees: string[]
  /** Optional pre-fetched elders list (server-side). Falls back to API fetch on mount. */
  elders?: Elder[]
}

function normalize(name: string): string {
  return name.toLowerCase().trim()
}

export default function AttendeesPanel({ meetingId, initialAttendees, elders: preFetched }: Props) {
  const [attendees, setAttendees] = useState<string[]>(initialAttendees)
  const [elders, setElders] = useState<Elder[]>(preFetched || [])
  const [loadingElders, setLoadingElders] = useState(!preFetched)
  const [picking, setPicking] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [freeText, setFreeText] = useState('')

  useEffect(() => {
    if (preFetched) return
    let cancelled = false
    fetch('/api/picc/storytellers-list', { signal: AbortSignal.timeout(8000) })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => {
        if (cancelled) return
        setElders(Array.isArray(j?.data) ? j.data : [])
        setLoadingElders(false)
      })
      .catch(() => {
        if (cancelled) return
        setLoadingElders(false)
      })
    return () => { cancelled = true }
  }, [preFetched])

  // Match attendees to Elder records by name
  const elderByName = useMemo(() => {
    const m = new Map<string, Elder>()
    for (const e of elders) m.set(normalize(e.name), e)
    return m
  }, [elders])

  const attendedSet = useMemo(() => new Set(attendees.map(normalize)), [attendees])

  const availableElders = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase()
    return elders
      .filter((e) => !attendedSet.has(normalize(e.name)))
      .filter((e) => !q || e.name.toLowerCase().includes(q) || (e.role || '').toLowerCase().includes(q))
  }, [elders, attendedSet, pickerSearch])

  const persist = (next: string[]) => {
    setAttendees(next)
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attendees: next }),
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

  const addAttendee = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (attendees.some((a) => normalize(a) === normalize(trimmed))) return
    persist([...attendees, trimmed])
    setPickerSearch('')
  }

  const removeAttendee = (name: string) => {
    persist(attendees.filter((a) => a !== name))
  }

  return (
    <div>
      {/* Selected attendees as rich cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
        {attendees.map((name) => {
          const elder = elderByName.get(normalize(name))
          const isElder = elder?.is_elder
          const cardCls = isElder
            ? 'border-amber-200 bg-amber-50'
            : elder
            ? 'border-picc-ochre/40 bg-picc-ochre/10'
            : 'border-stone-200 bg-stone-50'
          const nameCls = isElder
            ? 'text-amber-900'
            : elder
            ? 'text-stone-800'
            : 'text-stone-700'
          return (
            <div
              key={name}
              className={`flex items-center gap-3 rounded-lg border p-2.5 ${cardCls}`}
            >
              {/* Photo / placeholder */}
              {elder?.photo_url ? (
                <Link href={`/voices/${elder.slug}`} className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-stone-200">
                  <Image
                    src={elder.photo_url}
                    alt={elder.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </Link>
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  elder ? 'bg-amber-200 text-amber-900' : 'bg-stone-200 text-stone-500'
                }`}>
                  <User className="w-5 h-5" />
                </div>
              )}

              {/* Name + role + link */}
              <div className="flex-1 min-w-0">
                {elder ? (
                  <Link
                    href={`/voices/${elder.slug}`}
                    className={`text-sm font-semibold hover:underline inline-flex items-center gap-1 truncate ${nameCls}`}
                  >
                    {name}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-stone-700 truncate">{name}</p>
                )}
                <p className="text-[11px] text-stone-500 truncate">
                  {elder
                    ? `${isElder ? 'Elder' : 'Storyteller'} · ${elder.role || `${elder.quote_count} quotes`}`
                    : 'Not in EL · plain attendee'}
                </p>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeAttendee(name)}
                disabled={pending}
                title="Remove from attendees"
                className="text-stone-400 hover:text-red-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}

        {attendees.length === 0 && (
          <p className="col-span-full text-sm text-stone-400 italic">No attendees yet — add Elders or other attendees below.</p>
        )}
      </div>

      {pending && (
        <p className="text-xs text-stone-400 italic mb-2">Saving…</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mb-2">{error}</p>
      )}

      {/* Picker toggle */}
      {!picking ? (
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-picc-ochre text-white text-sm font-medium hover:bg-picc-ochre/90"
        >
          <Plus className="w-4 h-4" />
          Add Elder or attendee
        </button>
      ) : (
        <div className="rounded-lg border border-stone-200 bg-white p-3 mt-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Add from Empathy Ledger ({elders.length} storytellers · {elders.filter((e) => e.is_elder).length} Elders)
            </p>
            <button
              type="button"
              onClick={() => { setPicking(false); setPickerSearch(''); setFreeText('') }}
              className="text-xs text-stone-500 hover:text-stone-700"
            >
              Done
            </button>
          </div>

          <input
            type="text"
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            placeholder="Search Elders by name or role…"
            className="w-full px-3 py-2 border border-stone-300 rounded text-sm mb-3"
          />

          {loadingElders ? (
            <div className="flex items-center gap-2 text-xs text-stone-500 py-3">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading Elders from Empathy Ledger…
            </div>
          ) : availableElders.length === 0 ? (
            <p className="text-xs text-stone-400 italic py-3">
              {pickerSearch ? 'No Elders match' : 'All Elders already added'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-64 overflow-y-auto">
              {availableElders.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => addAttendee(e.name)}
                  disabled={pending}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-colors disabled:opacity-50 ${
                    e.is_elder
                      ? 'border-stone-200 hover:border-amber-300 hover:bg-amber-50'
                      : 'border-stone-200 hover:border-picc-ochre/50 hover:bg-picc-ochre/10'
                  }`}
                >
                  {e.photo_url ? (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-stone-200">
                      <Image src={e.photo_url} alt={e.name} fill sizes="28px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-stone-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate flex items-center gap-1.5">
                      {e.name}
                      {e.is_elder && (
                        <span className="text-[9px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-1 py-0.5 rounded">
                          Elder
                        </span>
                      )}
                    </p>
                    {e.role && <p className="text-[10px] text-stone-500 truncate">{e.role}</p>}
                  </div>
                  <Plus className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Free-text fallback */}
          <div className="mt-3 pt-3 border-t border-stone-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
              Or add a non-Elder attendee
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (freeText.trim()) { addAttendee(freeText); setFreeText('') }
                  }
                }}
                placeholder="Staff, visitor, family member…"
                className="flex-1 px-3 py-1.5 border border-stone-300 rounded text-sm"
              />
              <button
                type="button"
                onClick={() => { if (freeText.trim()) { addAttendee(freeText); setFreeText('') } }}
                className="px-3 py-1.5 rounded bg-stone-100 text-stone-700 text-sm hover:bg-stone-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
