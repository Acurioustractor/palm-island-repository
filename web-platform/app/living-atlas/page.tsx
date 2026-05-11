/**
 * /living-atlas — Palm Island Living Atlas (preview).
 *
 * Parallel surface to /picc/constellation. Same data feed, same stage —
 * but framed as the public-facing Atlas rather than the workshop hero.
 *
 * Per plan (i-want-to-lock-zesty-mochi.md, "Decisions locked"):
 *   - /picc/constellation stays frozen for the 13 May workshop.
 *   - /living-atlas is the preview Rachel & Narelle see the direction of.
 *   - Both routes mount the same <Constellation> component.
 *
 * Stages 1+ progressively reshape this route into the seven-lens Atlas
 * (Now · Services · Projects · Elders · Stories · Reports · Futures).
 */

import Constellation from '../picc/constellation/Constellation'
import { loadConstellation } from '@/lib/constellation/queries'

export const metadata = {
  title: 'Palm Island Living Atlas',
  description:
    'One borderless map of Palm Island storytelling — every face consented, every theme named by community. Touch any service, year, person, or place to enter.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

function nf(n: number): string {
  return n.toLocaleString()
}

export default async function LivingAtlasPage() {
  const data = await loadConstellation()
  const hasData = data.faces.length > 0

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <header className="mb-4 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-1">
              Preview · Atlas direction
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal">
              Palm Island Living Atlas
            </h1>
          </div>
          <div className="text-xs text-stone-600 max-w-md leading-relaxed">
            One borderless surface — people, services, projects, places,
            years, visions. Every face passed an explicit consent gate.
            Every quote was validator-flagged.
          </div>
        </header>

        {hasData ? (
          <div className="rounded-xl border border-stone-200 bg-white shadow-md overflow-hidden">
            <Constellation data={data} />
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-amber-900">
            <div className="font-serif text-lg mb-2">No faces returned</div>
            <p className="text-sm">
              Check <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">EL_V2_API_URL</code> and{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">EL_V2_API_KEY</code>.
            </p>
          </div>
        )}

        {/* Compact stats row */}
        <div className="mt-4 grid grid-cols-3 md:grid-cols-7 gap-2 text-xs">
          <Pill value={nf(data.faces.length)} label="people" />
          <Pill value={nf(data.services.length)} label="services" />
          <Pill value={nf(data.projects.length)} label="projects" />
          <Pill value={nf(data.named_elders.length)} label="named elders" />
          <Pill value={nf(data.annual_reports.length)} label="annual reports" />
          <Pill value={nf(data.stats.voices_validated_elder + data.stats.voices_extracted)} label="quotes" />
          <Pill value={nf(data.bwgcolman.language_groups)} label="language groups" />
        </div>

        <p className="mt-6 text-xs text-stone-500 italic max-w-3xl">
          Preview surface. The workshop demo lives at /picc/constellation —
          this route is where the post-workshop seven-lens Atlas takes shape
          (Now · Services · Projects · Elders · Stories · Reports · Futures).
        </p>
      </div>
    </div>
  )
}

function Pill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-stone-200 bg-white px-3 py-1.5">
      <div
        className="font-serif text-base leading-none"
        style={{ color: '#2D5F4F' }}
      >
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wide text-stone-500 mt-1">
        {label}
      </div>
    </div>
  )
}
