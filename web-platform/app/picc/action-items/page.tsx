/**
 * /picc/action-items — every action item across every recorded meeting.
 *
 * Read-only dashboard. Aggregates `action_items[]` from `meeting_notes`
 * with source meeting context. No status mutation yet — Phase 2 ships
 * that on top of a new `action_item_states` table after the CEO meeting
 * approves the bi-monthly cadence.
 */
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, CheckCircle2, Calendar, MapPin, Users, Lock, Filter } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Action Items · PICC Admin',
  description: 'Every commitment from every meeting · cross-meeting view',
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

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function fetchAllItems({ group }: { group?: string } = {}): Promise<{
  items: FlatItem[]
  meetingCount: number
}> {
  try {
    const supabase = getSupabase()
    let query = supabase
      .from('meeting_notes')
      .select('id, title, meeting_date, location, group_name, action_items, attendees, is_sensitive, metadata')
      .order('meeting_date', { ascending: false })
      .limit(200)

    if (group) query = query.eq('group_name', group)

    const { data, error } = await query
    if (error) throw error

    const meetings: MeetingRow[] = data || []
    const items: FlatItem[] = []

    for (const m of meetings) {
      const actions = Array.isArray(m.action_items) ? m.action_items : []
      const requiresElderApproval = Boolean(
        (m.metadata as any)?.requires_elder_approval
      )
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

    return { items, meetingCount: meetings.length }
  } catch (err) {
    console.error('Failed to load action items:', err)
    return { items: [], meetingCount: 0 }
  }
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

export default async function ActionItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>
}) {
  const params = await searchParams
  const groupFilter = params?.group?.trim() || undefined
  const { items, meetingCount } = await fetchAllItems({ group: groupFilter })

  // Group by meeting for the secondary view
  const byMeeting = new Map<string, FlatItem[]>()
  for (const item of items) {
    const list = byMeeting.get(item.meeting_id) || []
    list.push(item)
    byMeeting.set(item.meeting_id, list)
  }

  // Distinct groups for filter chips
  const distinctGroups = Array.from(new Set(items.map((i) => i.group_name))).sort()

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Link
        href="/picc"
        className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to admin
      </Link>

      <div className="mb-6">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Cross-meeting · accountability
        </p>
        <h1 className="font-serif text-3xl text-stone-800 italic mb-2">Action items</h1>
        <p className="text-stone-600 max-w-2xl leading-relaxed">
          Every commitment captured across every recorded meeting. Source-of-truth for what was
          said, who said it, and when. Status tracking ships in Phase 2 — for now this is the
          read-only ledger so nothing slips between visits.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat label="Action items" value={items.length} />
        <Stat label="Meetings" value={meetingCount} />
        <Stat label="Groups" value={distinctGroups.length} />
        <Stat label="Pending Elder approval" value={items.filter((i) => i.requires_elder_approval).length} />
      </div>

      {/* Filter chips */}
      {distinctGroups.length > 1 && (
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </span>
          <Link
            href="/picc/action-items"
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              !groupFilter ? 'bg-picc-ochre text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All
          </Link>
          {distinctGroups.map((g) => (
            <Link
              key={g}
              href={`/picc/action-items?group=${encodeURIComponent(g)}`}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                groupFilter === g ? 'bg-picc-ochre text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {g}
            </Link>
          ))}
        </div>
      )}

      {/* Items grouped by meeting */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-xl">
          <CheckCircle2 className="w-12 h-12 mx-auto text-stone-300 mb-3" />
          <p className="text-stone-700 font-medium mb-1">No action items yet</p>
          <p className="text-stone-500 text-sm">
            Process a meeting at <Link href="/picc/meetings/process" className="underline">/picc/meetings/process</Link> to start the ledger.
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
                <ul className="divide-y divide-stone-100">
                  {meetingItems.map((item) => (
                    <li key={`${item.meeting_id}-${item.index}`} className="flex items-start gap-3 px-5 py-3">
                      <CheckCircle2 className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
                      <p className="text-sm text-stone-700 leading-relaxed">{item.text}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      {/* Phase 2 hint */}
      <div className="mt-10 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
        <p className="font-semibold text-stone-800 mb-1">Coming next (Phase 2)</p>
        <p className="leading-relaxed">
          Per-item status (open · in progress · done · cancelled), assignee, due date, completion
          notes. Backed by an <code>action_item_states</code> table keyed by meeting + item index, so
          existing meeting records aren&apos;t mutated. Ship after the CEO meeting approves the
          bi-monthly cadence.
        </p>
      </div>
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
