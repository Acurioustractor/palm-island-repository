/**
 * /picc/trips — index of trips. Read from DB, fall back to seed list when
 * the trips table hasn't been migrated yet.
 */
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, MapPin, Calendar, Plus } from 'lucide-react'
import { ATHERTON_TABLELANDS_SEED, type Trip } from '@/lib/trips/seed'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Trips · PICC Admin',
  description: 'Continuous trip planning with the Elders Group.',
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

async function fetchTrips(): Promise<{ trips: Trip[]; degraded: boolean }> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('target_start', { ascending: true })
    if (error) {
      if (isMissingTableError(error)) {
        return { trips: [ATHERTON_TABLELANDS_SEED], degraded: true }
      }
      throw error
    }
    if (!data || data.length === 0) {
      return { trips: [ATHERTON_TABLELANDS_SEED], degraded: true }
    }
    return { trips: data as Trip[], degraded: false }
  } catch {
    return { trips: [ATHERTON_TABLELANDS_SEED], degraded: true }
  }
}

const STATUS_PALETTE: Record<Trip['status'], string> = {
  planning: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-sky-50 text-sky-800 border-sky-200',
  in_progress: 'bg-picc-ochre/10 text-picc-ochre border-picc-ochre/30',
  completed: 'bg-green-50 text-green-800 border-green-200',
  cancelled: 'bg-stone-100 text-stone-500 border-stone-200',
}

function formatRange(start: string | null, end: string | null) {
  if (!start && !end) return 'Dates TBD'
  const fmt = (d: string | null) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  if (start && end) return `${fmt(start)} → ${fmt(end)}`
  return fmt(start || end)
}

export default async function TripsIndexPage() {
  const { trips, degraded } = await fetchTrips()

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Link
        href="/picc/meetings"
        className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Meetings hub
      </Link>

      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Continuous planning · with Elders + community
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-stone-800 italic mb-2">Trips</h1>
        <p className="text-stone-600 max-w-2xl leading-relaxed">
          Trips that originate in meetings get their own continuous planning surface here. Milestones,
          budget, ideas and notes carry forward visit to visit so nothing has to be re-explained.
        </p>
      </header>

      {degraded && (
        <div className="mb-6 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-4 text-sm text-amber-800">
          <strong>Read-only preview.</strong> Apply <code className="bg-white/70 px-1 rounded text-xs">supabase/migrations/20260512_trips.sql</code>
          {' '}to enable persistence (edits + new trips).
        </div>
      )}

      <div className="space-y-3">
        {trips.map((trip) => (
          <Link
            key={trip.slug}
            href={`/picc/trips/${trip.slug}`}
            className="group block rounded-xl border border-stone-200 bg-white p-5 hover:border-picc-ochre/50 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-xl text-stone-800 italic group-hover:text-picc-ochre transition-colors mb-1">
                  {trip.name}
                </h2>
                {trip.description && (
                  <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed mb-2">{trip.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  {trip.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {trip.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatRange(trip.target_start, trip.target_end)}
                  </span>
                </div>
              </div>
              <span className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_PALETTE[trip.status]}`}>
                {trip.status.replace('_', ' ')}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
              <Counter label="Milestones" value={trip.data.milestones.length} done={trip.data.milestones.filter((m) => m.status === 'done').length} />
              <Counter label="Budget rows" value={trip.data.budget.length} />
              <Counter label="Ideas" value={trip.data.ideas.length} />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          disabled
          title={degraded ? 'Apply migration to enable creating trips' : 'Coming soon'}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-stone-300 text-stone-400 text-sm"
        >
          <Plus className="w-4 h-4" />
          New trip {degraded && '(needs migration)'}
        </button>
      </div>
    </div>
  )
}

function Counter({ label, value, done }: { label: string; value: number; done?: number }) {
  return (
    <div className="rounded-lg bg-stone-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="text-lg font-serif italic text-stone-800">
        {value}
        {done !== undefined && done > 0 && (
          <span className="text-xs text-green-700 ml-1.5">({done} done)</span>
        )}
      </p>
    </div>
  )
}
