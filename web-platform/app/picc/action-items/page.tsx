/**
 * /picc/action-items — every action item across every recorded meeting.
 *
 * Phase 1: read-only ledger of every commitment ever captured.
 * Phase 2: per-item status, assignee, due date — interactive when the
 *          action_item_states table has been migrated. Until then the
 *          UI degrades to read-only and shows the migration banner.
 */
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, Calendar, MapPin, Users, Lock, Filter, AlertTriangle } from 'lucide-react'
import ActionItemRow, { type ItemStatus } from './ActionItemRow'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Action Items · PICC Admin',
  description: 'Every commitment from every meeting · cross-meeting accountability view',
}

interface MeetingRow {
  id: string
  title: string
  meeting_date: string
  location: string | null
  group_name: string
  action_items: string[] | null
  attendees: string[] | null
  is_sensitive: boolean | null
  metadata: Record<string, unknown> | null
}

interface FlatItem {
  text: string
  index: number
  meeting_id: string
  meeting_title: string
  meeting_date: string
  group_name: string
  location: string | null
  is_sensitive: boolean
  requires_elder_approval: boolean
}

interface StateRow {
  meeting_id: string
  item_index: number
  status: ItemStatus
  assignee: string | null
  due_date: string | null
  completion_notes: string | null
  completed_at: string | null
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function isMissingTableError(err: any): boolean {
  const msg = String(err?.message || '')
  const code = String(err?.code || '')
  return code === '42P01' || /relation .* does not exist/i.test(msg)
}

async function fetchAll({ group }: { group?: string } = {}): Promise<{
  items: FlatItem[]
  meetingCount: number
  states: Map<string, StateRow>
  phase2Enabled: boolean
}> {
  const supabase = getSupabase()

  // Meetings + items
  let q = supabase
    .from('meeting_notes')
    .select('id, title, meeting_date, location, group_name, action_items, attendees, is_sensitive, metadata')
    .order('meeting_date', { ascending: false })
    .limit(200)
  if (group) q = q.eq('group_name', group)

  const meetingsRes = await q
  if (meetingsRes.error) throw meetingsRes.error
  const meetings: MeetingRow[] = meetingsRes.data || []

  const items: FlatItem[] = []
  for (const m of meetings) {
    const actions = Array.isArray(m.action_items) ? m.action_items : []
    const requiresElderApproval = Boolean((m.metadata as any)?.requires_elder_approval)
    actions.forEach((text, index) => {
      if (typeof text !== 'string' || !text.trim()) return
      items.push({
        text: text.trim(),
        index,
        meeting_id: m.id,
        meeting_title: m.title,
        meeting_date: m.meeting_date,
        group_name: m.group_name,
        location: m.location,
        is_sensitive: Boolean(m.is_sensitive),
        requires_elder_approval: requiresElderApproval,
      })
    })
  }

  // States — graceful fallback if table missing
  let phase2Enabled = true
  const states = new Map<string, StateRow>()
  try {
    const statesRes = await supabase
      .from('action_item_states')
      .select('meeting_id, item_index, status, assignee, due_date, completion_notes, completed_at')
    if (statesRes.error) {
      if (isMissingTableError(statesRes.error)) phase2Enabled = false
      else throw statesRes.error
    } else {
      for (const s of statesRes.data || []) {
        states.set(`${s.meeting_id}::${s.item_index}`, s as StateRow)
      }
    }
  } catch (err) {
    if (isMissingTableError(err)) phase2Enabled = false
    else throw err
  }

  return { items, meetingCount: meetings.length, states, phase2Enabled }
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function statusCounts(items: FlatItem[], states: Map<string, StateRow>) {
  const counts = { open: 0, in_progress: 0, done: 0, cancelled: 0 }
  for (const it of items) {
    const s = states.get(`${it.meeting_id}::${it.index}`)
    counts[s?.status || 'open'] += 1
  }
  return counts
}

export default async function ActionItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; status?: string }>
}) {
  const params = await searchParams
  const groupFilter = params?.group?.trim() || undefined
  const statusFilter = params?.status?.trim() || undefined

  let payload
  try {
    payload = await fetchAll({ group: groupFilter })
  } catch (err: any) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-900">Failed to load action items</p>
          <p className="text-sm text-red-800 mt-1">{err?.message || 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  const { items, meetingCount, states, phase2Enabled } = payload

  // Status filter applied AFTER state lookup
  const filteredItems = statusFilter
    ? items.filter((it) => (states.get(`${it.meeting_id}::${it.index}`)?.status || 'open') === statusFilter)
    : items

  // Group by meeting
  const byMeeting = new Map<string, FlatItem[]>()
  for (const item of filteredItems) {
    const list = byMeeting.get(item.meeting_id) || []
    list.push(item)
    byMeeting.set(item.meeting_id, list)
  }

  const distinctGroups = Array.from(new Set(items.map((i) => i.group_name))).sort()
  const counts = statusCounts(items, states)

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Link
        href="/picc/meetings"
        className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Meetings hub
      </Link>

      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
            Cross-meeting · accountability
          </p>
          <h1 className="font-serif text-3xl text-stone-800 italic mb-2">Action items</h1>
          <p className="text-stone-600 max-w-3xl leading-relaxed">
            Every commitment captured across every recorded meeting. Click any item title to open
            its detail page — full meeting context + transcript snippet.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-picc-ochre text-white font-medium">
            Grouped
          </span>
          <Link
            href={`/picc/action-items/board${groupFilter ? `?group=${encodeURIComponent(groupFilter)}` : ''}`}
            className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium"
          >
            Board
          </Link>
        </div>
      </div>

      {/* Phase 2 banner */}
      {!phase2Enabled && (
        <div className="mb-6 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-900">Phase 2 ready — apply migration to enable status tracking</p>
            <p className="text-amber-800 mt-1">
              Per-item status (open · in progress · done · cancelled), assignee, due date, completion notes are
              coded and waiting on the <code className="bg-white/80 px-1 rounded">action_item_states</code> table.
              Migration: <code className="bg-white/80 px-1 rounded text-xs">supabase/migrations/20260511_action_item_states.sql</code>
            </p>
          </div>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat label="Total" value={items.length} />
        <StatusStat label="Open" value={counts.open} colour="stone" filterValue="open" current={statusFilter} group={groupFilter} />
        <StatusStat label="In progress" value={counts.in_progress} colour="sky" filterValue="in_progress" current={statusFilter} group={groupFilter} />
        <StatusStat label="Done" value={counts.done} colour="green" filterValue="done" current={statusFilter} group={groupFilter} />
        <StatusStat label="Cancelled" value={counts.cancelled} colour="stone" filterValue="cancelled" current={statusFilter} group={groupFilter} />
      </div>

      {/* Filter chips */}
      {distinctGroups.length > 1 && (
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Group
          </span>
          <Link
            href={statusFilter ? `/picc/action-items?status=${statusFilter}` : '/picc/action-items'}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              !groupFilter ? 'bg-picc-ochre text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All
          </Link>
          {distinctGroups.map((g) => {
            const params = new URLSearchParams()
            params.set('group', g)
            if (statusFilter) params.set('status', statusFilter)
            return (
              <Link
                key={g}
                href={`/picc/action-items?${params}`}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  groupFilter === g ? 'bg-picc-ochre text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {g}
              </Link>
            )
          })}
        </div>
      )}

      {/* Items grouped by meeting */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-xl">
          <p className="text-stone-700 font-medium mb-1">
            {items.length === 0 ? 'No action items yet' : 'No items match this filter'}
          </p>
          <p className="text-stone-500 text-sm">
            {items.length === 0 ? (
              <>Process a meeting at <Link href="/picc/meetings/process" className="underline">/picc/meetings/process</Link> to start the ledger.</>
            ) : (
              <Link href="/picc/action-items" className="underline">Clear filters</Link>
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(byMeeting.entries()).map(([meetingId, meetingItems]) => {
            const first = meetingItems[0]
            return (
              <section
                key={meetingId}
                className="rounded-xl border border-stone-200 bg-white overflow-hidden"
              >
                <header className="bg-stone-50 border-b border-stone-200 px-5 py-3">
                  <h2 className="font-semibold text-stone-800">{first.meeting_title}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-stone-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(first.meeting_date)}
                    </span>
                    {first.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {first.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {first.group_name}
                    </span>
                    {first.requires_elder_approval && (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <Lock className="w-3.5 h-3.5" />
                        Awaiting Elder approval
                      </span>
                    )}
                  </div>
                </header>
                <div className="divide-y divide-stone-100">
                  {meetingItems.map((item) => (
                    <ActionItemRow
                      key={`${item.meeting_id}-${item.index}`}
                      meetingId={item.meeting_id}
                      itemIndex={item.index}
                      text={item.text}
                      initialState={states.get(`${item.meeting_id}::${item.index}`) || null}
                      phase2Enabled={phase2Enabled}
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-serif text-3xl text-stone-800 italic">{value}</p>
    </div>
  )
}

function StatusStat({
  label, value, colour, filterValue, current, group,
}: {
  label: string; value: number; colour: 'stone' | 'sky' | 'green'; filterValue: string;
  current?: string; group?: string
}) {
  const palette = {
    stone: 'text-stone-700 border-stone-200 bg-white',
    sky: 'text-sky-800 border-sky-200 bg-sky-50',
    green: 'text-green-800 border-green-200 bg-green-50',
  }[colour]
  const active = current === filterValue
  const params = new URLSearchParams()
  if (group) params.set('group', group)
  if (!active) params.set('status', filterValue)
  const href = `/picc/action-items${params.toString() ? '?' + params : ''}`
  return (
    <Link
      href={href}
      className={`rounded-xl border p-4 hover:shadow-sm transition-shadow ${palette} ${active ? 'ring-2 ring-picc-ochre' : ''}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-70">{label}</p>
      <p className="font-serif text-3xl italic">{value}</p>
    </Link>
  )
}
