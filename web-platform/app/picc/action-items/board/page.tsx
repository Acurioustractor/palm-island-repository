/**
 * /picc/action-items/board — kanban view of every action item.
 *
 * Four columns (Open · In progress · Done · Cancelled). Native HTML5
 * drag-and-drop — drag a card between columns to update status.
 * Click a card to open the per-item detail page.
 */
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft } from 'lucide-react'
import BoardClient, { type BoardItem } from './BoardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Action Items Kanban · PICC Admin',
  description: 'Drag to move tasks across columns',
}

interface MeetingRow {
  id: string
  title: string
  meeting_date: string
  group_name: string
  action_items: string[] | null
  metadata: Record<string, unknown> | null
}

interface StateRow {
  meeting_id: string
  item_index: number
  status: 'open' | 'in_progress' | 'done' | 'cancelled'
  assignee: string | null
  due_date: string | null
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

async function fetchAll({ group }: { group?: string } = {}): Promise<{
  items: BoardItem[]
  phase2Enabled: boolean
}> {
  const supabase = getSupabase()

  let q = supabase
    .from('meeting_notes')
    .select('id, title, meeting_date, group_name, action_items, metadata')
    .order('meeting_date', { ascending: false })
    .limit(200)
  if (group) q = q.eq('group_name', group)

  const meetingsRes = await q
  if (meetingsRes.error) throw meetingsRes.error
  const meetings: MeetingRow[] = meetingsRes.data || []

  let phase2Enabled = true
  const states = new Map<string, StateRow>()
  try {
    const statesRes = await supabase
      .from('action_item_states')
      .select('meeting_id, item_index, status, assignee, due_date')
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

  const items: BoardItem[] = []
  for (const m of meetings) {
    const actions = Array.isArray(m.action_items) ? m.action_items : []
    actions.forEach((text, index) => {
      if (typeof text !== 'string' || !text.trim()) return
      const state = states.get(`${m.id}::${index}`)
      items.push({
        meeting_id: m.id,
        item_index: index,
        text: text.trim(),
        meeting_title: m.title,
        meeting_date: m.meeting_date,
        group_name: m.group_name,
        status: state?.status || 'open',
        assignee: state?.assignee || null,
        due_date: state?.due_date || null,
        requires_elder_approval: Boolean((m.metadata as any)?.requires_elder_approval),
      })
    })
  }

  return { items, phase2Enabled }
}

export default async function ActionItemsBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>
}) {
  const params = await searchParams
  const groupFilter = params?.group?.trim() || undefined

  let payload
  try {
    payload = await fetchAll({ group: groupFilter })
  } catch (err: any) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-900">Failed to load board</p>
          <p className="text-sm text-red-800 mt-1">{err?.message || 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <Link
        href="/picc/action-items"
        className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to ledger
      </Link>

      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
            Kanban · drag to move
          </p>
          <h1 className="font-serif text-3xl text-stone-800 italic">Action items board</h1>
          <p className="text-stone-600 mt-2 max-w-2xl leading-relaxed">
            Drag a card across columns to update status. Click a card to open its detail page —
            full meeting context, transcript snippet, sibling items.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/picc/action-items"
            className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium"
          >
            Grouped view
          </Link>
          <span className="px-3 py-1.5 rounded-full bg-picc-ochre text-white font-medium">
            Board
          </span>
        </div>
      </div>

      <BoardClient initialItems={payload.items} phase2Enabled={payload.phase2Enabled} />
    </div>
  )
}
