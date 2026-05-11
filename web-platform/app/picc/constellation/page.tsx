/**
 * /picc/constellation — Bwgcolman Constellation.
 *
 * The hero visualization for the workshop. A living, force-directed map of
 * Palm Island's storytelling culture — faces drift, themes anchor, time
 * scrubs.
 *
 * Internal admin route. Designed as the screen Rachel and Narelle return to
 * during the workshop whenever a decision risks slipping into glossy-
 * brochure language. Every fact on the page is consent-cleared at source.
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

export default async function ConstellationPage() {
  const data = await loadConstellation()
  const hasData = data.faces.length > 0

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-wide text-ochre font-semibold mb-2">
            Workshop hero · 13 May 2026
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-2">
            Bwgcolman Constellation
          </h1>
          <p className="text-stone-600 max-w-2xl">
            Faces drift. Themes hold. Time moves. This is the report writing
            itself — every voice consented at source, every theme named by
            community.
          </p>
        </header>

        {hasData ? (
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <Constellation data={data} />
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-900">
            <div className="font-serif text-lg mb-2">No faces returned</div>
            <p className="text-sm">
              The constellation needs at least one EL v2 consented photo to
              render. Check that{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">
                EL_V2_API_URL
              </code>{' '}
              and{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">
                EL_V2_API_KEY
              </code>{' '}
              are set, or seed the EL v2 photos table for PICC.
            </p>
          </div>
        )}

        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-ochre font-semibold mb-2">
              How to use this in the workshop
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              Every workshop decision can be reframed as <em>how does this
              show up in the constellation?</em> Voice capture, story
              consent, time anchors — they all land here.
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-ochre font-semibold mb-2">
              Themes named by community
            </div>
            <ul className="text-sm text-stone-700 space-y-1">
              {data.themes.slice(0, 6).map((t) => (
                <li key={t.key} className="flex justify-between">
                  <span>{t.label}</span>
                  <span className="text-stone-500">{t.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-ochre font-semibold mb-2">
              Historical anchors
            </div>
            <ul className="text-sm text-stone-700 space-y-1">
              {data.years.slice(-5).map((y) => (
                <li key={y.fiscal_year} className="flex justify-between">
                  <span>FY {y.fiscal_year}</span>
                  <span className="text-stone-500 truncate ml-2 max-w-[140px]">
                    {y.title ?? '—'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
