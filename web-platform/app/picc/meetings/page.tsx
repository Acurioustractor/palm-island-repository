/**
 * /picc/meetings — meeting hub.
 *
 * Single entry point for the bi-monthly capture cadence:
 *   1. Process recording   → audio → transcript → themes + action items
 *   2. Browse meetings     → Elders Group, search, expand
 *   3. Action items ledger → cross-meeting accountability view
 */
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight, Mic, BookOpen, ListChecks, Lock, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Meetings · PICC Admin',
  description: 'Capture cadence — record, browse, track.',
}

interface Counts {
  total: number
  elders: number
  withActions: number
  totalActions: number
  pendingApproval: number
  phase2Enabled: boolean
  doneCount: number
  inProgressCount: number
}

function isMissingTableError(err: any): boolean {
  const msg = String(err?.message || '')
  const code = String(err?.code || '')
  return code === '42P01' || /relation .* does not exist/i.test(msg)
}

async function getCounts(): Promise<Counts> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('no creds')
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

    const [allRes, eldersRes, actionsRes] = await Promise.all([
      supabase.from('meeting_notes').select('id', { count: 'exact', head: true }),
      supabase.from('meeting_notes').select('id', { count: 'exact', head: true }).eq('group_name', 'Elders Group'),
      supabase
        .from('meeting_notes')
        .select('action_items, metadata, is_sensitive')
        .limit(500),
    ])

    const meetings = actionsRes.data || []
    let totalActions = 0
    let withActions = 0
    let pendingApproval = 0
    for (const m of meetings) {
      const acts = Array.isArray(m.action_items) ? m.action_items.length : 0
      totalActions += acts
      if (acts > 0) withActions += 1
      if ((m as any).metadata?.requires_elder_approval) pendingApproval += 1
    }

    // Phase 2 detection — count done + in_progress when table exists
    let phase2Enabled = true
    let doneCount = 0
    let inProgressCount = 0
    try {
      const statesRes = await supabase
        .from('action_item_states')
        .select('status')
      if (statesRes.error) {
        if (isMissingTableError(statesRes.error)) phase2Enabled = false
        else throw statesRes.error
      } else {
        for (const s of statesRes.data || []) {
          if (s.status === 'done') doneCount += 1
          else if (s.status === 'in_progress') inProgressCount += 1
        }
      }
    } catch (err) {
      if (isMissingTableError(err)) phase2Enabled = false
    }

    return {
      total: allRes.count || 0,
      elders: eldersRes.count || 0,
      withActions,
      totalActions,
      pendingApproval,
      phase2Enabled,
      doneCount,
      inProgressCount,
    }
  } catch {
    return { total: 0, elders: 0, withActions: 0, totalActions: 0, pendingApproval: 0, phase2Enabled: false, doneCount: 0, inProgressCount: 0 }
  }
}

export default async function MeetingsHubPage() {
  const counts = await getCounts()

  const STAGES = [
    {
      n: '01',
      icon: <Mic className="w-5 h-5" />,
      label: 'Capture',
      blurb: 'Record on phone → upload here → Whisper transcribes → Claude extracts summary, themes, and action items. Cultural protocol flags default-on for Elders Group.',
      primary: { href: '/picc/meetings/process?group=Elders%20Group', label: 'Process recording' },
      sub: [
        { href: '/picc/meetings/process', label: 'Process meeting (any group)' },
      ],
      colour: 'text-picc-ochre',
      bg: 'bg-picc-ochre/10',
    },
    {
      n: '02',
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Browse',
      blurb: `Every meeting recorded — Elders Group plus other groups. Full transcripts, summaries, themes, and the original audio context.`,
      primary: { href: '/picc/elders/meetings', label: 'Elders meetings', live: `${counts.elders} recorded` },
      sub: [],
      colour: 'text-picc-ochre',
      bg: 'bg-picc-ochre/10',
    },
    {
      n: '03',
      icon: <ListChecks className="w-5 h-5" />,
      label: 'Track',
      blurb: 'Cross-meeting accountability. Every commitment in one place — Phase 1 read-only ledger today, Phase 2 ships per-item status, assignee and due date once the action_item_states migration is applied.',
      primary: { href: '/picc/action-items', label: 'Action items ledger', live: `${counts.totalActions} commitments` },
      sub: [
        { href: '/picc/action-items/board', label: 'Kanban board view' },
        { href: '/picc/action-items?group=Elders%20Group', label: 'Elders Group only' },
      ],
      colour: 'text-picc-ochre',
      bg: 'bg-picc-ochre/10',
    },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Bi-monthly capture cadence
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-stone-800 italic mb-3">Meetings</h1>
        <p className="text-stone-600 max-w-3xl leading-relaxed">
          Three moves: record → browse → track. The cadence runs on every island visit. Every commitment goes
          through the cultural protocol gate before anything is published. Nothing slips between visits.
        </p>
      </header>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat label="Meetings recorded" value={counts.total} />
        <Stat label="Elders Group" value={counts.elders} />
        <Stat label="Total commitments" value={counts.totalActions} />
        <Stat label="Awaiting Elder approval" value={counts.pendingApproval} accent={counts.pendingApproval > 0} />
      </div>

      {/* Three stages */}
      <div className="space-y-5">
        {STAGES.map((s) => (
          <section
            key={s.n}
            className="rounded-2xl border border-stone-200 bg-white p-6 md:p-7"
          >
            <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.colour}`}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                  <span className="text-[11px] font-bold tracking-[0.2em] text-stone-400">
                    {s.n}
                  </span>
                  <h2 className="font-serif text-2xl text-stone-800 italic">{s.label}</h2>
                </div>
                <p className="text-stone-600 leading-relaxed">{s.blurb}</p>
                {s.primary.live && (
                  <div className="mt-2 inline-flex items-center gap-2 text-[11px] font-mono text-stone-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-picc-ochre" />
                    {s.primary.live}
                  </div>
                )}
              </div>
              <Link
                href={s.primary.href}
                className="px-4 py-2.5 rounded-md font-bold uppercase text-xs whitespace-nowrap inline-flex items-center gap-2 flex-shrink-0 bg-picc-ochre text-white hover:bg-picc-ochre/90"
                style={{ letterSpacing: '0.15em' }}
              >
                {s.primary.label}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {s.sub.length > 0 && (
              <div className="mt-4 pl-15 ml-15 flex flex-wrap gap-2">
                {s.sub.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-xs text-stone-500 hover:text-picc-ochre underline"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Phase 2 status banner — only show until migration is applied */}
      {!counts.phase2Enabled ? (
        <div className="mt-10 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900 mb-1">Phase 2 ready to enable</p>
              <p className="text-sm text-amber-800 leading-relaxed mb-3">
                Status tracking (open · in progress · done · cancelled), assignee, due date and completion notes
                are coded and waiting on a Supabase migration: <code className="bg-white/80 px-1 py-0.5 rounded text-xs">supabase/migrations/20260511_action_item_states.sql</code>.
                The UI degrades cleanly to read-only until the migration is applied — nothing breaks.
              </p>
              <p className="text-xs text-amber-700 font-mono">
                Apply via: Supabase MCP <code>apply_migration</code> · or <code>npx supabase db push</code>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-green-200 bg-green-50/50 p-5">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
              <span className="block w-2 h-2 rounded-full bg-white" />
            </span>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-green-900 mb-1">Phase 2 active</p>
              <p className="text-green-800 leading-relaxed">
                Status tracking is live. {counts.doneCount} done · {counts.inProgressCount} in progress · {counts.totalActions - counts.doneCount - counts.inProgressCount} open or cancelled.
                Edit any item from <Link href="/picc/action-items" className="underline">the ledger</Link> or drag cards on <Link href="/picc/action-items/board" className="underline">the board</Link>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cadence callout */}
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-picc-ochre shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-stone-800 mb-1">Bi-monthly cadence</p>
            <p className="text-sm text-stone-600 leading-relaxed">
              Each Ben-on-island visit feeds this system: Elders Group meeting · staff interviews · community
              conversations. Every recording becomes a meeting record. Every commitment becomes an action item.
              Status carries forward visit to visit, so the next session opens with: <em>&ldquo;here&apos;s what we said
              last time, here&apos;s what got done.&rdquo;</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent && value > 0 ? 'border-amber-300 bg-amber-50' : 'border-stone-200 bg-white'}`}>
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-serif text-3xl italic ${accent && value > 0 ? 'text-amber-900' : 'text-stone-800'}`}>{value}</p>
    </div>
  )
}
