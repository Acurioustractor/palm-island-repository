/**
 * /picc/constellation — Bwgcolman Constellation.
 *
 * Page is a thin shell: a tight header above the viz, the viz itself
 * (with its own left/right rails), and below it a single content row
 * with foundation + commitments + visions for offline reading.
 *
 * The viz contains its own controls + present-full-screen button — the
 * page above is just framing.
 */

import Constellation from './Constellation'
import { loadConstellation } from '@/lib/constellation/queries'

export const metadata = {
  title: 'Bwgcolman Constellation | PICC',
  description:
    'A living, force-directed map of Palm Island storytelling — every face consented, every theme named by community.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

function nf(n: number): string {
  return n.toLocaleString()
}

export default async function ConstellationPage() {
  const data = await loadConstellation()
  const hasData = data.faces.length > 0

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Slim page header */}
        <header className="mb-4 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-1">
              Workshop hero · 13 May 2026
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal">
              Bwgcolman Constellation
            </h1>
          </div>
          <div className="text-xs text-stone-600 max-w-md leading-relaxed">
            Five layers — foundation, faces, themes, years, visions — drawn
            live from PICC and Empathy Ledger v2. Every face passed an
            explicit consent gate. Every quote was validator-flagged.
          </div>
        </header>

        {/* Stage */}
        {hasData ? (
          <div className="rounded-xl border border-stone-200 bg-white shadow-md overflow-hidden">
            <Constellation data={data} />
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-amber-900">
            <div className="font-serif text-lg mb-2">No faces returned</div>
            <p className="text-sm">
              The constellation needs at least one EL v2 consented photo to
              render. Check{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">
                EL_V2_API_URL
              </code>{' '}
              and{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">
                EL_V2_API_KEY
              </code>
              .
            </p>
          </div>
        )}

        {/* Stats strip — one tight row, no clutter */}
        <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          <Pill value={nf(data.stats.faces_consented)} label="faces" />
          <Pill value={nf(data.stats.voices_validated_elder)} label="elder quotes" />
          <Pill value={nf(data.stats.voices_extracted)} label="voices" />
          <Pill value={nf(data.stats.stories)} label="stories" />
          <Pill value={nf(data.stats.governance_achievements)} label="milestones" />
          <Pill value={nf(data.stats.board_members)} label="board" />
        </div>

        {/* Reading row — foundation + commitments + visions for those who want detail */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="rounded-lg border p-4"
            style={{ background: '#F4E9DC', borderColor: '#C7A87E' }}
          >
            <div
              className="text-[10px] uppercase tracking-wide font-semibold mb-2"
              style={{ color: '#8B6F47' }}
            >
              Foundation · pre-2008
            </div>
            <ul className="text-xs text-stone-800 space-y-1.5">
              {data.foundation.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-serif font-bold w-12 flex-shrink-0">
                    {f.year}
                  </span>
                  <span>
                    {f.title}
                    {f.significance >= 9 && (
                      <span className="ml-1 text-stone-500">★</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-lg border p-4"
            style={{ background: '#E7EFE4', borderColor: '#5B8A72' }}
          >
            <div
              className="text-[10px] uppercase tracking-wide font-semibold mb-2"
              style={{ color: '#2D5F4F' }}
            >
              Next 20 years
            </div>
            <ul className="text-xs text-stone-800 space-y-2">
              {data.commitments.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span
                    className="font-serif font-bold w-12 flex-shrink-0"
                    style={{ color: '#2D5F4F' }}
                  >
                    {c.target_year}
                  </span>
                  <span>
                    <span className="font-semibold">{c.title}</span>
                    <span className="block text-[11px] text-stone-700 mt-0.5">
                      {c.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
              Themes named by community
            </div>
            <ul className="text-xs text-stone-700 space-y-1">
              {data.themes.slice(0, 8).map((t) => (
                <li key={t.key} className="flex justify-between">
                  <span>{t.label}</span>
                  <span className="text-stone-500">{t.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

function Pill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-stone-200 bg-white px-3 py-1.5">
      <div className="font-serif text-base leading-none" style={{ color: '#2D5F4F' }}>
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wide text-stone-500 mt-1">
        {label}
      </div>
    </div>
  )
}
