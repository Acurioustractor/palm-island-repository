/**
 * /picc/almanac/services-coverage — one row per service, traffic-light
 * view of coverage. Quick read on which services are under-resourced
 * (no photos, no voices, no body copy) before publish.
 */
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase/server'
import { getPiccServices } from '@/lib/services/el-services'
import { getCanonicalPhotosForService } from '@/lib/media/el-photos'

export const metadata = {
  title: 'Services Coverage — PICC Admin',
  description: 'Per-service coverage check: photos, voices, copy.',
}

export const dynamic = 'force-dynamic'

interface Row {
  slug: string
  name: string
  hasDescription: boolean
  photoCount: number
  flaggedPhotos: number
  voiceCount: number
  signal: 'red' | 'amber' | 'green'
}

function rateSignal(r: Omit<Row, 'signal'>): Row['signal'] {
  if (!r.hasDescription || r.photoCount === 0) return 'red'
  if (r.flaggedPhotos > 0 || r.voiceCount === 0 || r.photoCount < 3) return 'amber'
  return 'green'
}

async function loadRows(): Promise<Row[]> {
  const supabase = await createServerComponentClient()
  const services = await getPiccServices().catch(() => [])

  // Voices grouped by service
  const { data: voices } = await (supabase as any)
    .from('almanac_voices')
    .select('service_slug, status')
  const voicesBySlug: Record<string, number> = {}
  for (const v of voices ?? []) {
    if (v.status === 'declined') continue
    if (!v.service_slug) continue
    voicesBySlug[v.service_slug] = (voicesBySlug[v.service_slug] ?? 0) + 1
  }

  // Flag counts indexed by slot_id (slot_id of form `service-<slug>` from AlmanacPhotos)
  const { data: flags } = await (supabase as any)
    .from('almanac_photo_flags')
    .select('slot_id, flag_type, resolved_at')
  const flagsBySlug: Record<string, number> = {}
  for (const f of flags ?? []) {
    if (f.flag_type === 'approved' || f.resolved_at) continue
    const m = /^service-(.+)$/.exec(f.slot_id)
    if (m) flagsBySlug[m[1]] = (flagsBySlug[m[1]] ?? 0) + 1
  }

  // Photo counts (sequential — keep it simple, ~26 services)
  const rows: Row[] = []
  for (const svc of services) {
    let photoCount = 0
    try {
      const { all } = await getCanonicalPhotosForService(svc.slug)
      photoCount = all.length
    } catch {
      photoCount = 0
    }
    const partial = {
      slug: svc.slug,
      name: svc.name,
      hasDescription: !!(svc as any).description?.trim?.(),
      photoCount,
      flaggedPhotos: flagsBySlug[svc.slug] ?? 0,
      voiceCount: voicesBySlug[svc.slug] ?? 0,
    }
    rows.push({ ...partial, signal: rateSignal(partial) })
  }

  rows.sort((a, b) => {
    const order = { red: 0, amber: 1, green: 2 } as const
    if (order[a.signal] !== order[b.signal]) return order[a.signal] - order[b.signal]
    return a.name.localeCompare(b.name)
  })

  return rows
}

const SIGNAL_STYLE: Record<Row['signal'], { dot: string; bg: string; label: string }> = {
  red:   { dot: 'bg-red-500',     bg: 'bg-red-50/50',     label: 'needs work' },
  amber: { dot: 'bg-amber-500',   bg: 'bg-amber-50/30',   label: 'partial' },
  green: { dot: 'bg-emerald-500', bg: '',                 label: 'ready' },
}

export default async function ServicesCoveragePage() {
  const rows = await loadRows()
  const counts = {
    red: rows.filter((r) => r.signal === 'red').length,
    amber: rows.filter((r) => r.signal === 'amber').length,
    green: rows.filter((r) => r.signal === 'green').length,
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Internal · Almanac · Coverage
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-stone-800 italic mb-3">
          Services Coverage
        </h1>
        <p className="text-stone-600 max-w-2xl leading-relaxed">
          One row per service. Red = missing description or no photos. Amber =
          partial coverage. Green = ready. Click through to fix.
        </p>
      </div>

      <div className="flex gap-6 text-sm">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> {counts.red} need work</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> {counts.amber} partial</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> {counts.green} ready</span>
      </div>

      <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-center">Copy</th>
              <th className="px-4 py-3 text-center">Photos</th>
              <th className="px-4 py-3 text-center">Flagged</th>
              <th className="px-4 py-3 text-center">Voices</th>
              <th className="px-4 py-3 text-right">Fix</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const style = SIGNAL_STYLE[r.signal]
              return (
                <tr key={r.slug} className={`border-t border-stone-100 ${style.bg}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} title={style.label} />
                      <div>
                        <div className="font-serif text-stone-800">{r.name}</div>
                        <code className="text-[10px] text-stone-400 font-mono">{r.slug}</code>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.hasDescription
                      ? <span className="text-emerald-700">✓</span>
                      : <span className="text-red-600 font-semibold">missing</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={r.photoCount === 0 ? 'text-red-700 font-semibold' : r.photoCount < 3 ? 'text-amber-700' : 'text-stone-700'}>
                      {r.photoCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.flaggedPhotos > 0
                      ? <span className="text-red-700 font-semibold">{r.flaggedPhotos}</span>
                      : <span className="text-stone-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={r.voiceCount === 0 ? 'text-amber-700' : 'text-stone-700'}>
                      {r.voiceCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs space-x-3">
                    <Link
                      href={`/picc/almanac/photos`}
                      className="text-picc-ochre hover:underline"
                    >
                      Photos →
                    </Link>
                    <Link
                      href={`/picc/almanac/voices`}
                      className="text-picc-ochre hover:underline"
                    >
                      Voices →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
