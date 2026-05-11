/**
 * /picc/constellation — Bwgcolman Constellation.
 *
 * The workshop hero. Five layers (foundation → field → themes → years →
 * future) merged from PICC's own Supabase + EL v2's consented photo feed.
 *
 * Internal admin route. The screen Rachel and Narelle keep returning to
 * during the 13 May workshop, because every decision can be reframed as
 * "how does this show up in the constellation?".
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
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-[0.3em] text-ochre font-bold mb-2">
            Workshop hero · 13 May 2026
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-3">
            Bwgcolman Constellation
          </h1>
          <p className="text-stone-600 max-w-3xl text-lg leading-relaxed">
            A living map of Palm Island storytelling — five layers, one
            community. Faces drift. Themes hold. Years move. Foundation anchors
            on the left, the next twenty years on the right. Every voice on
            this page passed an explicit consent gate.
          </p>
        </header>

        {/* Stats banner — what the constellation is built from */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-6">
          <Pill value={nf(data.stats.faces_consented)} label="faces consented" />
          <Pill
            value={nf(data.stats.voices_validated_elder)}
            label="elder quotes"
          />
          <Pill
            value={nf(data.stats.voices_extracted)}
            label="voices extracted"
          />
          <Pill value={nf(data.stats.stories)} label="stories" />
          <Pill
            value={nf(data.stats.governance_achievements)}
            label="governance milestones"
          />
          <Pill value={nf(data.stats.board_members)} label="board members" />
          <Pill
            value={nf(data.stats.knowledge_entries)}
            label="knowledge entries"
          />
        </div>

        {hasData ? (
          <div className="rounded-2xl border border-stone-200 bg-white shadow-md overflow-hidden">
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
              are set.
            </p>
          </div>
        )}

        {/* Workshop usage + content cards */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-ochre font-semibold mb-2">
              How to use this in the workshop
            </div>
            <ol className="text-sm text-stone-700 space-y-1.5 list-decimal list-inside">
              <li>Open in The Field — let it breathe.</li>
              <li>Click a theme well — a community quote appears.</li>
              <li>Scrub a year — see revenue, achievements, events.</li>
              <li>Switch to Visions — faces drift toward 2045.</li>
              <li>
                Every decision: <em>how does this show up here?</em>
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-ochre font-semibold mb-2">
              Themes named by community
            </div>
            <ul className="text-sm text-stone-700 space-y-1">
              {data.themes.slice(0, 8).map((t) => (
                <li key={t.key} className="flex justify-between">
                  <span>{t.label}</span>
                  <span className="text-stone-500">{t.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-ochre font-semibold mb-2">
              The years on the scrubber
            </div>
            <ul className="text-sm text-stone-700 space-y-1">
              {data.years.slice(-6).map((y) => (
                <li key={y.fiscal_year} className="flex justify-between">
                  <span>FY {y.fiscal_year}</span>
                  <span className="text-stone-500 truncate ml-2 max-w-[160px]">
                    {y.report_title ?? `${y.events.length} events`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Foundation + Future cards */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="rounded-xl border p-5"
            style={{ background: '#F4E9DC', borderColor: '#C7A87E' }}
          >
            <div className="text-xs uppercase tracking-wide font-semibold mb-3"
              style={{ color: '#8B6F47' }}>
              Foundation · pre-2008 anchors
            </div>
            <ul className="text-sm text-stone-800 space-y-2">
              {data.foundation.map((f, i) => (
                <li key={i} className="flex gap-3">
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
            <div className="text-xs text-stone-600 mt-3 italic">
              From timeline_events — Hull River, Reserve gazette, removals,
              2004 death in custody — the ground PICC stands on.
            </div>
          </div>

          <div
            className="rounded-xl border p-5"
            style={{ background: '#E7EFE4', borderColor: '#5B8A72' }}
          >
            <div className="text-xs uppercase tracking-wide font-semibold mb-3"
              style={{ color: '#2D5F4F' }}>
              Next 20 years · forward commitments
            </div>
            <ul className="text-sm text-stone-800 space-y-3">
              {data.commitments.map((c, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-serif font-bold w-12 flex-shrink-0"
                    style={{ color: '#2D5F4F' }}>
                    {c.target_year}
                  </span>
                  <span>
                    <span className="font-semibold">{c.title}</span>
                    <span className="block text-xs text-stone-700 mt-0.5">
                      {c.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="text-xs text-stone-600 mt-3 italic">
              Sourced verbatim from PICC-20-Year-Launchpad-Plan.md so the
              workshop canvas and the constellation tell the same story.
            </div>
          </div>
        </section>

        {/* Community visions strip */}
        {data.visions.length > 0 && (
          <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-ochre font-semibold mb-3">
              Community visions on the canvas — {data.visions.length} approved
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.visions.slice(0, 6).map((v, i) => (
                <div
                  key={i}
                  className="border-l-2 border-ochre/60 pl-3 text-sm text-stone-700"
                >
                  <div className="font-serif italic leading-snug">
                    “{v.text.length > 140 ? v.text.slice(0, 140) + '…' : v.text}”
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    — {v.author_name ?? 'Anonymous'}
                    {v.category && (
                      <span className="ml-2 text-stone-400">· {v.category}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-stone-500 mt-4 italic">
              Awaiting Narelle &amp; Rachel review in the 13 May workshop —
              replace each placeholder author with a named Bwgcolman voice from
              the 20-voices sprint.
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function Pill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
      <div
        className="font-serif text-lg leading-none"
        style={{ color: '#2D5F4F' }}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-stone-500 mt-1">
        {label}
      </div>
    </div>
  )
}
