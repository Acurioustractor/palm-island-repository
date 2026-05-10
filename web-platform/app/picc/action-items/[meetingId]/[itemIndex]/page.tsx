/**
 * /picc/action-items/[meetingId]/[itemIndex] — per-item detail page.
 *
 * Shows: the item, its status + assignee + due date + completion notes,
 * the source meeting context, all sibling items from the same meeting,
 * and a transcript snippet matching the item text where possible.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, Calendar, MapPin, Users, Lock, FileText, ListChecks } from 'lucide-react'
import ActionItemRow, { type ItemStatus } from '../../ActionItemRow'

export const dynamic = 'force-dynamic'

interface MeetingDetail {
  id: string
  title: string
  meeting_date: string
  location: string | null
  group_name: string
  summary: string | null
  transcript: string | null
  attendees: string[] | null
  action_items: string[] | null
  is_sensitive: boolean | null
  metadata: Record<string, unknown> | null
}

interface StateRow {
  meeting_id: string
  item_index: number
  status: ItemStatus
  assignee: string | null
  due_date: string | null
  completion_notes: string | null
  completed_at: string | null
  updated_at: string
  updated_by: string | null
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function isMissingTableError(err: any): boolean {
  const msg = String(err?.message || '')
  const code = String(err?.code || '')
  return code === '42P01' || /relation .* does not exist/i.test(msg)
}

function findTranscriptSnippet(transcript: string | null, itemText: string): string | null {
  if (!transcript || !itemText) return null

  // Pull a few signal words from the item — skip obvious stopwords/short tokens.
  const stop = new Set(['the','and','for','with','from','this','that','to','of','in','a','an','on','at','by','is','are','was','were','be','been'])
  const words = itemText
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !stop.has(w))
    .slice(0, 4)

  if (words.length === 0) return null

  const lower = transcript.toLowerCase()
  let bestIdx = -1
  let bestScore = 0
  for (const w of words) {
    const idx = lower.indexOf(w)
    if (idx >= 0 && idx > bestScore) { bestIdx = idx; bestScore = idx }
    if (idx >= 0 && bestIdx === -1) bestIdx = idx
  }

  // Search again — pick the FIRST hit of any signal word
  bestIdx = -1
  for (const w of words) {
    const idx = lower.indexOf(w)
    if (idx >= 0 && (bestIdx === -1 || idx < bestIdx)) bestIdx = idx
  }

  if (bestIdx < 0) return null
  const start = Math.max(0, bestIdx - 200)
  const end = Math.min(transcript.length, bestIdx + 400)
  let snippet = transcript.slice(start, end)
  if (start > 0) snippet = '…' + snippet
  if (end < transcript.length) snippet = snippet + '…'
  return snippet
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default async function ActionItemDetailPage({
  params,
}: {
  params: Promise<{ meetingId: string; itemIndex: string }>
}) {
  const { meetingId, itemIndex: itemIndexStr } = await params
  const itemIndex = Number(itemIndexStr)
  if (!Number.isInteger(itemIndex) || itemIndex < 0) notFound()

  const supabase = getSupabase()

  const meetingRes = await supabase
    .from('meeting_notes')
    .select('id, title, meeting_date, location, group_name, summary, transcript, attendees, action_items, is_sensitive, metadata')
    .eq('id', meetingId)
    .single()

  if (meetingRes.error || !meetingRes.data) notFound()
  const meeting = meetingRes.data as MeetingDetail
  const actions = Array.isArray(meeting.action_items) ? meeting.action_items : []
  if (itemIndex >= actions.length) notFound()
  const itemText = actions[itemIndex]

  // Phase 2 state — graceful fallback
  let phase2Enabled = true
  let state: StateRow | null = null
  try {
    const sRes = await supabase
      .from('action_item_states')
      .select('meeting_id, item_index, status, assignee, due_date, completion_notes, completed_at, updated_at, updated_by')
      .eq('meeting_id', meetingId)
      .eq('item_index', itemIndex)
      .maybeSingle()
    if (sRes.error) {
      if (isMissingTableError(sRes.error)) phase2Enabled = false
      else throw sRes.error
    } else {
      state = (sRes.data as StateRow) || null
    }
  } catch (err) {
    if (isMissingTableError(err)) phase2Enabled = false
    else throw err
  }

  const requiresElderApproval = Boolean((meeting.metadata as any)?.requires_elder_approval)
  const snippet = findTranscriptSnippet(meeting.transcript, itemText)

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <Link
        href="/picc/action-items"
        className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to ledger
      </Link>

      {/* Item card */}
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Action item {itemIndex + 1} of {actions.length}
        </p>
        <h1 className="font-serif text-2xl md:text-3xl text-stone-800 italic leading-tight mb-4">
          {itemText}
        </h1>

        {requiresElderApproval && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 inline-flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>
              <strong>Awaiting Elder approval</strong> · this commitment came from a sensitive meeting and
              requires Elders Group sign-off before publication.
            </span>
          </div>
        )}
      </div>

      {/* Status row (interactive when Phase 2) */}
      <section className="rounded-xl border border-stone-200 bg-white overflow-hidden mb-8">
        <header className="bg-stone-50 border-b border-stone-200 px-5 py-3">
          <h2 className="text-sm font-semibold text-stone-800">Status</h2>
        </header>
        <ActionItemRow
          meetingId={meetingId}
          itemIndex={itemIndex}
          text={itemText}
          initialState={state}
          phase2Enabled={phase2Enabled}
        />
      </section>

      {/* Meeting context */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 mb-8">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-500 mb-2 inline-flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          Source meeting
        </p>
        <h2 className="font-semibold text-stone-800 text-lg mb-2">{meeting.title}</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mb-3">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(meeting.meeting_date)}
          </span>
          {meeting.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {meeting.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {meeting.group_name}
          </span>
        </div>

        {meeting.summary && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase text-stone-500 tracking-wide mb-1">Summary</p>
            <p className="text-sm text-stone-700 leading-relaxed">{meeting.summary}</p>
          </div>
        )}

        {meeting.attendees && meeting.attendees.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase text-stone-500 tracking-wide mb-1">Attendees</p>
            <div className="flex flex-wrap gap-1.5">
              {meeting.attendees.map((name) => (
                <span key={name} className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Transcript snippet */}
      {snippet && (
        <section className="rounded-xl border border-stone-200 bg-white p-5 mb-8">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-500 mb-2">
            Transcript context
          </p>
          <p className="text-sm text-stone-700 italic leading-relaxed bg-stone-50 rounded-lg p-3 border-l-2 border-picc-ochre">
            {snippet}
          </p>
          <p className="text-[10px] text-stone-400 mt-2">
            Best-match snippet around the keywords from this item. Open the full meeting for the complete transcript.
          </p>
        </section>
      )}

      {/* Sibling items */}
      {actions.length > 1 && (
        <section className="rounded-xl border border-stone-200 bg-white overflow-hidden mb-8">
          <header className="bg-stone-50 border-b border-stone-200 px-5 py-3 inline-flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-800">
              Other commitments from this meeting ({actions.length - 1})
            </h2>
          </header>
          <ul className="divide-y divide-stone-100">
            {actions.map((text, idx) => {
              if (idx === itemIndex) return null
              return (
                <li key={idx}>
                  <Link
                    href={`/picc/action-items/${meetingId}/${idx}`}
                    className="block px-5 py-3 hover:bg-stone-50 transition-colors text-sm text-stone-700"
                  >
                    {text}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
