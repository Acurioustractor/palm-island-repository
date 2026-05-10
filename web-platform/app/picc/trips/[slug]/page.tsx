/**
 * /picc/trips/[slug] — the planner. Read trip from DB or static seed.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, MapPin, Calendar, Lock, AlertTriangle } from 'lucide-react'
import { ATHERTON_TABLELANDS_SEED, type Trip } from '@/lib/trips/seed'
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'
import { PICC_STAFF_OVERRIDES } from '@/lib/staff/picc-staff'
import TripPlannerClient from './TripPlannerClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
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

async function fetchTrip(slug: string): Promise<{ trip: Trip | null; degraded: boolean }> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    if (error) {
      if (isMissingTableError(error)) {
        if (slug === ATHERTON_TABLELANDS_SEED.slug) {
          return { trip: ATHERTON_TABLELANDS_SEED, degraded: true }
        }
        return { trip: null, degraded: true }
      }
      throw error
    }
    if (!data && slug === ATHERTON_TABLELANDS_SEED.slug) {
      return { trip: ATHERTON_TABLELANDS_SEED, degraded: true }
    }
    return { trip: (data as Trip) || null, degraded: false }
  } catch {
    if (slug === ATHERTON_TABLELANDS_SEED.slug) {
      return { trip: ATHERTON_TABLELANDS_SEED, degraded: true }
    }
    return { trip: null, degraded: false }
  }
}

export default async function TripPlannerPage({ params }: Props) {
  const { slug } = await params
  const { trip, degraded } = await fetchTrip(slug)
  if (!trip) notFound()

  // Pull origin meeting if linked
  let originMeeting: { id: string; title: string; meeting_date: string } | null = null
  if (trip.origin_meeting_id) {
    try {
      const { data } = await getSupabase()
        .from('meeting_notes')
        .select('id, title, meeting_date')
        .eq('id', trip.origin_meeting_id)
        .maybeSingle()
      if (data) originMeeting = data
    } catch { /* ignore */ }
  }

  // Resolve attendee names against EL + staff overrides for rich profile cards
  const storytellers = await getPiccStorytellers({ limit: 500 }).catch(() => [])
  const elderByName = new Map<string, any>()
  for (const s of storytellers) {
    elderByName.set(s.display_name.toLowerCase().trim(), {
      slug: s.slug,
      photo_url: s.photo_url,
      role: s.role,
      is_elder: s.is_elder,
    })
  }
  for (const so of PICC_STAFF_OVERRIDES) {
    elderByName.set(so.name.toLowerCase().trim(), {
      slug: so.slug || so.id,
      photo_url: so.photo_url,
      role: so.role,
      is_elder: false,
    })
    for (const a of so.aliases) {
      elderByName.set(a.toLowerCase().trim(), {
        slug: so.slug || so.id,
        photo_url: so.photo_url,
        role: so.role,
        is_elder: false,
      })
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Link
        href="/picc/trips"
        className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Trips
      </Link>

      <header className="mb-6">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Trip planner · {trip.status.replace('_', ' ')}
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-stone-800 italic mb-2">{trip.name}</h1>
        {trip.description && (
          <p className="text-stone-600 max-w-3xl leading-relaxed mb-3">{trip.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
          {trip.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {trip.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {trip.target_start && trip.target_end
              ? `${new Date(trip.target_start + 'T00:00:00').toLocaleDateString('en-AU', { month: 'long', day: 'numeric' })} → ${new Date(trip.target_end + 'T00:00:00').toLocaleDateString('en-AU', { month: 'long', day: 'numeric', year: 'numeric' })}`
              : 'Dates TBD'}
          </span>
          {originMeeting && (
            <Link href="/picc/elders/meetings" className="inline-flex items-center gap-1.5 text-picc-ochre hover:underline">
              From: {originMeeting.title}
            </Link>
          )}
        </div>
      </header>

      {degraded && (
        <div className="mb-6 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-900">Read-only preview</p>
            <p className="text-amber-800 mt-1">
              Edits won&apos;t persist until <code className="bg-white/80 px-1 rounded text-xs">supabase/migrations/20260512_trips.sql</code> is applied.
              The page will keep working — saves come back when the table exists.
            </p>
          </div>
        </div>
      )}

      <TripPlannerClient
        slug={trip.slug}
        initial={trip}
        elderByName={Object.fromEntries(elderByName)}
        canEdit={!degraded}
      />
    </div>
  )
}
