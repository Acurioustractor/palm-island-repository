/**
 * /picc/almanac/services-coverage — one row per service, traffic-light
 * view of coverage. Pulls per-service rollup from EL v2 (one round
 * trip) so editors see total + publishable (consent-cleared) photo
 * counts, story count, quote count, plus any flags + new-voice work.
 */
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase/server'
import { getServicesCoverage, type ServiceCoverage } from '@/lib/services/el-coverage'

export const metadata = {
  title: 'Services Coverage — PICC Admin',
  description: 'Per-service coverage check: photos, voices, copy.',
}

export const dynamic = 'force-dynamic'

interface Row extends ServiceCoverage {
  flaggedPhotos: number
  newVoices: number
  signal: 'red' | 'amber' | 'green'
  signalReason: string
}

function rate(r: Omit<Row, 'signal' | 'signalReason'>): { signal: Row['signal']; signalReason: string } {
  if (!r.has_description) return { signal: 'red', signalReason: 'no description' }
  if (r.photos_publishable === 0 && r.photos_total === 0) return { signal: 'red', signalReason: 'no photos at all' }
  if (r.photos_publishable === 0 && r.photos_total > 0) return { signal: 'amber', signalReason: `${r.photos_total} photos await consent review` }
  if (r.flaggedPhotos > 0) return { signal: 'amber', signalReason: `${r.flaggedPhotos} flagged photos` }
  if (r.photos_publishable < 3) return { signal: 'amber', signalReason: 'few publishable photos' }
  if (r.quotes === 0 && r.newVoices === 0) return { signal: 'amber', signalReason: 'no voice quotes' }
  return { signal: 'green', signalReason: 'ready' }
}

async function loadRows(): Promise<Row[]> {
  const supabase = await createServerComponentClient()
  const coverage = await getServicesCoverage()

  // Local data: voices in sprint + flagged service photos
  const [{ data: voices }, { data: flags }] = await Promise.all([
    (supabase as any).from('almanac_voices').select('service_slug, status'),
    (supabase as any).from('almanac_photo_flags').select('slot_id, flag_type, resolved_at'),
  ])

  const voiceCount: Record<string, number> = {}
  for (const v of voices ?? []) {
    if (v.status === 'declined' || !v.service_slug) continue
    voiceCount[v.service_slug] = (voiceCount[v.service_slug] ?? 0) + 1
  }
  const flagCount: Record<string, number> = {}
  for (const f of flags ?? []) {
    if (f.flag_type === 'approved' || f.resolved_at) continue
    const m = /^service-(.+)$/.exec(f.slot_id)
    if (m) flagCount[m[1]] = (flagCount[m[1]] ?? 0) + 1
  }

  const rows: Row[] = coverage.map((c) => {
    const partial = {
      ...c,
      flaggedPhotos: flagCount[c.slug] ?? 0,
      newVoices: voiceCount[c.slug] ?? 0,
    }
    return { ...partial, ...rate(partial) }
  })

  rows.sort((a, b) => {
    const order = { red: 0, amber: 1, green: 2 } as const
    if (order[a.signal] !== order[b.signal]) return order[a.signal] - order[b.signal]
    return a.name.localeCompare(b.name)
  })

  return rows
}

const SIGNAL_STYLE: Record<Row['signal'], { dot: string; bg: string }> = {
  red:   { dot: 'bg-red-500',     bg: 'bg-red-50/50' },
  amber: { dot: 'bg-amber-500',   bg: 'bg-amber-50/30' },
  green: { dot: 'bg-emerald-500', bg: '' },
}

export default async function ServicesCoveragePage() {
  const rows = await loadRows()
  const counts = {
    red: rows.filter((r) => r.signal === 'red').length,
    amber: rows.filter((r) => r.signal === 'amber').length,
    green: rows.filter((r) => r.signal === 'green').length,
  }
  const totals = rows.reduce(
    (acc, r) => ({
      photos_total: acc.photos_total + r.photos_total,
      photos_publishable: acc.photos_publishable + r.photos_publishable,
      stories: acc.stories + r.stories,
      quotes: acc.quotes + r.quotes,
    }),
    { photos_total: 0, photos_publishable: 0, stories: 0, quotes: 0 },
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Internal · Almanac · Coverage
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-stone-800 italic mb-3">
          Services Coverage
        </h1>
        <p className="text-stone-600 max-w-3xl leading-relaxed">
          Per-service rollup from EL v2 — what photos / stories / quotes already
          exist, and which need consent review. Click through to fix.
        </p>
      </div>

      {/* ── Aggregate ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <Pill label="Need work" value={counts.red} tone="red" />
        <Pill label="Partial" value={counts.amber} tone="amber" />
        <Pill label="Ready" value={counts.green} tone="green" />
        <Pill label="Photos in EL v2" value={totals.photos_total} sub={`${totals.photos_publishable} publishable`} />
        <Pill label="Stories · quotes" value={`${totals.stories} · ${totals.quotes}`} />
      </div>

      <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-center">Copy</th>
              <th className="px-4 py-3 text-center">Photos<br/><span className="font-normal text-[10px] normal-case text-stone-400">pub / total</span></th>
              <th className="px-4 py-3 text-center">Flagged</th>
              <th className="px-4 py-3 text-center">Stories</th>
              <th className="px-4 py-3 text-center">Quotes</th>
              <th className="px-4 py-3 text-center">New<br/>voices</th>
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
                      <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} title={r.signalReason} />
                      <div>
                        <div className="font-serif text-stone-800">{r.name}</div>
                        <code className="text-[10px] text-stone-400 font-mono">{r.slug}</code>
                        {r.signal !== 'green' && (
                          <div className="text-[10px] text-stone-500 italic mt-0.5">{r.signalReason}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.has_description
                      ? <span className="text-emerald-700">✓</span>
                      : <span className="text-red-600 font-semibold">missing</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={r.photos_publishable === 0 ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                      {r.photos_publishable}
                    </span>
                    <span className="text-stone-400"> / {r.photos_total}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.flaggedPhotos > 0
                      ? <span className="text-red-700 font-semibold">{r.flaggedPhotos}</span>
                      : <span className="text-stone-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={r.stories === 0 ? 'text-stone-400' : 'text-stone-700'}>{r.stories}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={r.quotes === 0 ? 'text-stone-400' : 'text-stone-700'}>{r.quotes}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={r.newVoices === 0 ? 'text-stone-400' : 'text-stone-700'}>{r.newVoices}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs space-x-3">
                    <Link href="/picc/almanac/photos" className="text-picc-ochre hover:underline">Photos →</Link>
                    <Link href="/picc/almanac/voices" className="text-picc-ochre hover:underline">Voices →</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-stone-500 leading-relaxed border-t border-stone-100 pt-4">
        <strong>Reading the photo column:</strong> <span className="text-emerald-700 font-semibold">publishable</span>
        {' '}/ total. Total counts every photo linked to the service gallery in EL v2.
        Publishable counts only photos with both <code>elder_approved</code> and{' '}
        <code>consent_obtained</code> set. Amber = consent review is the bottleneck;
        red = no photos at all.
      </div>
    </div>
  )
}

function Pill({ label, value, sub, tone }: { label: string; value: number | string; sub?: string; tone?: 'red' | 'amber' | 'green' }) {
  const dot =
    tone === 'red' ? 'bg-red-500' :
    tone === 'amber' ? 'bg-amber-500' :
    tone === 'green' ? 'bg-emerald-500' :
    'bg-stone-300'
  return (
    <div className="rounded-lg bg-white border border-stone-200 px-3 py-2.5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500">
        {tone && <span className={`w-2 h-2 rounded-full ${dot}`} />}
        {label}
      </div>
      <div className="font-serif text-2xl text-stone-800 mt-0.5">{value}</div>
      {sub && <div className="text-[11px] text-stone-500">{sub}</div>}
    </div>
  )
}
