/**
 * /living-atlas/places/hull-river — the foundational journey.
 *
 * Three panels:
 *   1. The map — Tully Heads ↔ Great Palm Island, the 1918 transfer route.
 *   2. The timeline — 1914 settlement → 1918 cyclone → 1918 transfer →
 *      1919 Reserve gazette, sourced from PICC timeline_events.
 *   3. The voices — every quote in the corpus naming Hull River, the
 *      cyclone, Mission Beach, or Leonte.
 *
 * Cultural protocol note: this is foundation-of-community material. It
 * sits behind the Bwgcolman tab and as its own place-page so visitors
 * always have a route back to where the story began.
 */

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import HullRiverMap from './HullRiverMap'
import { loadConstellation } from '@/lib/constellation/queries'

export const metadata = {
  title: 'Hull River — Palm Island Living Atlas',
  description:
    'The foundational journey: 1914 settlement, 1918 cyclone, the transfer to Great Palm Island, and the Bwgcolman community that formed.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HullRiverPage() {
  const data = await loadConstellation()
  // Foundation events 1914–1919 specifically.
  const foundingEvents = data.foundation
    .filter((f) => f.year >= 1914 && f.year <= 1925)
    .sort((a, b) => a.year - b.year)

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Back-to-atlas link */}
        <Link
          href="/living-atlas"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Living Atlas
        </Link>

        <header className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-1">
            Foundation · 1914 – 1919
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">
            Hull River — the journey
          </h1>
          <p className="text-stone-600 max-w-2xl leading-relaxed">
            The Hull River Aboriginal Settlement was established at the mouth
            of the Hull River, near present-day Tully Heads, in 1914. In{' '}
            <strong>March 1918, the cyclone Leonte destroyed it</strong>. The
            survivors and successive forced removals across decades were
            transferred to Great Palm Island, where forty-plus language
            groups became one people — Bwgcolman.
          </p>
        </header>

        {/* Map */}
        <HullRiverMap />

        {/* Timeline + Voices side-by-side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Timeline */}
          <section className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-3">
              The foundational sequence
            </div>
            <ol className="space-y-3">
              {foundingEvents.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <div
                    className="font-serif font-bold text-lg w-14 flex-shrink-0"
                    style={{ color: '#2D5F4F' }}
                  >
                    {e.year}
                  </div>
                  <div className="flex-1">
                    <div className="font-serif text-base text-charcoal">
                      {e.title}
                      {e.significance >= 9 && (
                        <span className="ml-2 text-stone-500">★</span>
                      )}
                    </div>
                    {e.description && (
                      <p className="text-[11.5px] text-stone-600 mt-0.5 leading-snug">
                        {e.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <div className="text-[10px] text-stone-500 italic mt-4">
              From PICC timeline_events, significance ≥ 7.
            </div>
          </section>

          {/* Voices */}
          <section className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-3">
              Voices on Hull River ({data.hull_river_voices.length})
            </div>
            {data.hull_river_voices.length === 0 ? (
              <div className="text-xs text-stone-500 italic">
                No Hull River voices in the corpus yet. As more Elder
                conversations are captured and validated, they appear here.
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {data.hull_river_voices.map((v, i) => (
                  <blockquote
                    key={i}
                    className="border-l-2 border-ochre/60 pl-3"
                  >
                    <div className="font-serif text-sm italic leading-snug">
                      “{v.text}”
                    </div>
                    {v.speaker && (
                      <div className="text-[11px] text-stone-600 mt-1">
                        — {v.speaker}
                      </div>
                    )}
                  </blockquote>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* What it means today */}
        <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5">
          <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
            What it means today
          </div>
          <p className="text-sm text-stone-700 leading-relaxed">
            Every Bwgcolman community member alive today carries the memory
            of this journey. PICC's work — Bwgcolman Way, the Healing
            Service, the language groups acknowledgement that opens every
            annual report — all return to this point. The Atlas treats Hull
            River as the foundation pole on every other surface; this page
            is the long form.
          </p>
          <div className="mt-3 text-[11px] text-stone-500 italic">
            Manbarra people are the Traditional Owners of Great Palm Island.
            Bwgcolman is the composite name the relocated people gave
            themselves.
          </div>
        </section>
      </div>
    </div>
  )
}
