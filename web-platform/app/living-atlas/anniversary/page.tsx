/**
 * /living-atlas/anniversary — the 20-year mode.
 *
 * PICC was launched in 2007. The anniversary lands in 2027 — twenty years
 * from launch. This page is the Atlas's celebration surface:
 *
 *   - the 2007 → 2027 timeline with every annual report year, foundation
 *     events, and the next-20 commitments anchored on a single ribbon
 *   - the "20 voices for 20 years" wall — one Elder + one staff + one
 *     young-person voice per year (slots filled as the capture sprint
 *     progresses; gaps shown explicitly so the work is legible)
 *   - the forward commitments out to 2045
 *
 * Cultural protocol: every voice on this wall is a named, consented,
 * validated contribution. Gaps stay visible — "still to capture" — so
 * the celebration is grounded in what's actually been collected, not a
 * polished hero image.
 */

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { loadConstellation } from '@/lib/constellation/queries'
import type { ConstellationPayload } from '@/lib/constellation/types'

export const metadata = {
  title: '20 Years — Palm Island Living Atlas',
  description:
    '2007 → 2027. Twenty years of PICC, twenty voices, twenty community visions for the next twenty years.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PICC_LAUNCH_YEAR = 2007
const ANNIVERSARY_YEAR = 2027

interface VoiceSlot {
  year: number
  elder: string | null
  staff: string | null
  young_person: string | null
}

/**
 * Build the 20 voices wall from existing data. We have:
 *   - 42 named elders (with quote counts)
 *   - 30+ stories with storyteller names
 *   - face-level role data on storytellers
 *
 * For each year 2007 → 2027 we try to identify one Elder, one staff, one
 * young person. Slots without a match render as "still to capture" — the
 * gap is visible, the work is honest.
 */
function buildVoiceWall(data: ConstellationPayload): VoiceSlot[] {
  const slots: VoiceSlot[] = []
  const elders = data.named_elders.slice(0, 20)
  for (let i = 0; i < 20; i++) {
    const year = PICC_LAUNCH_YEAR + i
    const elder = elders[i]?.name ?? null
    slots.push({
      year,
      elder,
      // Staff + young-person capture sprints are post-workshop work; surface
      // the gap honestly rather than fabricating.
      staff: null,
      young_person: null,
    })
  }
  return slots
}

export default async function AnniversaryPage() {
  const data = await loadConstellation()
  const wall = buildVoiceWall(data)
  const today = new Date().getFullYear()
  const yearsToGo = ANNIVERSARY_YEAR - today

  // Build the year ribbon: every year 2007 → 2027, marked with what we have.
  const ribbon = Array.from({ length: 21 }, (_, i) => {
    const year = PICC_LAUNCH_YEAR + i
    const report = data.annual_reports.find((r) => r.fiscal_year === year)
    const yd = data.years.find((y) => y.fiscal_year === year)
    const isPast = year <= today
    const isAnniversary = year === ANNIVERSARY_YEAR
    return {
      year,
      isPast,
      isAnniversary,
      hasReport: Boolean(report?.pdf_url),
      eventCount: yd?.events.length ?? 0,
      revenue: yd?.revenue ?? null,
    }
  })

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <Link
          href="/living-atlas"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Living Atlas
        </Link>

        <header className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-1">
            2007 — 2027 · twenty years
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-2">
            The next twenty years are being built
          </h1>
          <p className="text-stone-700 max-w-2xl leading-relaxed">
            PICC was launched in <strong>2007</strong>. The anniversary lands
            in <strong>2027</strong> — <strong>{yearsToGo} years to go</strong>.
            Below: the year-by-year ribbon, the 20-voices-for-20-years wall,
            and the forward commitments out to 2045.
          </p>
        </header>

        {/* Yearly summaries — AI-extracted from each annual report PDF */}
        <section className="mb-8">
          <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
            Year by year, in the report&rsquo;s own words
          </div>
          <div className="space-y-4">
            {data.annual_reports
              .filter((r) => r.summary)
              .slice(0, 12)
              .map((r) => (
                <article
                  key={r.fiscal_year}
                  className="rounded-xl border border-stone-200 bg-white p-5"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-baseline gap-3">
                      <div
                        className="font-serif font-bold text-2xl"
                        style={{ color: '#2D5F4F' }}
                      >
                        FY {r.fiscal_year}
                      </div>
                      {r.stats?.total_revenue ? (
                        <span className="text-sm text-stone-600">
                          ${(Number(r.stats.total_revenue) / 1_000_000).toFixed(1)}M
                        </span>
                      ) : null}
                      {r.stats?.staff_count != null && (
                        <span className="text-sm text-stone-600">
                          · {r.stats.staff_count} staff
                        </span>
                      )}
                    </div>
                    {r.pdf_url && (
                      <a
                        href={r.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline text-sage-700"
                      >
                        Open PDF →
                      </a>
                    )}
                  </div>
                  <p className="font-serif italic text-stone-800 leading-relaxed">
                    {r.summary}
                  </p>
                  {r.key_achievements.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-stone-700">
                      {r.key_achievements.slice(0, 3).map((a, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-sage-700 flex-shrink-0">✓</span>
                          <span>{a}</span>
                        </li>
                      ))}
                      {r.key_achievements.length > 3 && (
                        <li className="text-[11px] text-stone-500 italic ml-5">
                          +{r.key_achievements.length - 3} more in the report
                        </li>
                      )}
                    </ul>
                  )}
                </article>
              ))}
          </div>
        </section>

        {/* Year ribbon */}
        <section className="mb-8">
          <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
            The ribbon
          </div>
          <div className="grid grid-cols-7 sm:grid-cols-11 md:grid-cols-21 gap-1">
            {ribbon.map((r) => {
              const bg = r.isAnniversary
                ? '#8B1A1A'
                : r.hasReport
                  ? '#2D5F4F'
                  : r.isPast
                    ? '#D4A373'
                    : '#E3D5C5'
              const color = r.isAnniversary || r.hasReport ? '#FBF6EE' : '#2C2C2C'
              return (
                <div
                  key={r.year}
                  className="rounded-md p-2 text-center"
                  style={{ backgroundColor: bg, color }}
                  title={
                    r.isAnniversary
                      ? `${r.year} — 20-year anniversary`
                      : r.hasReport
                        ? `${r.year} — annual report PDF`
                        : r.isPast
                          ? `${r.year} — past`
                          : `${r.year} — future`
                  }
                >
                  <div className="font-serif font-bold text-sm leading-none">
                    {String(r.year).slice(-2)}
                  </div>
                  <div className="text-[8.5px] mt-0.5 opacity-80">
                    {r.isAnniversary ? '★' : r.hasReport ? 'PDF' : r.isPast ? '·' : '–'}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-[10.5px] text-stone-500 mt-2 flex flex-wrap gap-3">
            <LegendDot colour="#8B1A1A" label="anniversary year" />
            <LegendDot colour="#2D5F4F" label="annual report PDF on file" />
            <LegendDot colour="#D4A373" label="past year (no report yet)" />
            <LegendDot colour="#E3D5C5" label="future" />
          </div>
        </section>

        {/* 20 voices wall */}
        <section className="mb-8">
          <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
            20 voices for 20 years
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {wall.map((s) => (
              <div
                key={s.year}
                className="rounded-xl border border-stone-200 bg-white p-4"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <div
                    className="font-serif font-bold text-2xl"
                    style={{ color: '#2D5F4F' }}
                  >
                    {s.year}
                  </div>
                  {s.year === today && (
                    <span
                      className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                      style={{ backgroundColor: '#F4E9DC', color: '#8B6F47' }}
                    >
                      this year
                    </span>
                  )}
                </div>
                <VoiceRow
                  label="Elder"
                  name={s.elder}
                  colour="#B8860B"
                />
                <VoiceRow
                  label="Staff"
                  name={s.staff}
                  colour="#5B8A72"
                />
                <VoiceRow
                  label="Young person"
                  name={s.young_person}
                  colour="#0EA5E9"
                />
              </div>
            ))}
          </div>
          <div className="text-[11px] text-stone-500 italic mt-3 max-w-2xl">
            Slots without a name are honest gaps — the capture sprint hasn&rsquo;t
            recorded that voice yet. As Elders, staff, and young people
            contribute via{' '}
            <Link href="/atlas/capture" className="underline text-sage-700">
              /atlas/capture
            </Link>
            , the wall fills in.
          </div>
        </section>

        {/* Forward commitments */}
        <section className="mb-8">
          <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
            Forward commitments
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.commitments.map((c, i) => (
              <div
                key={i}
                className="rounded-xl border bg-white p-5"
                style={{ borderColor: '#5B8A72', borderLeftWidth: 4 }}
              >
                <div
                  className="font-serif font-bold text-3xl mb-2"
                  style={{ color: '#2D5F4F' }}
                >
                  {c.target_year}
                </div>
                <h3 className="font-serif text-lg text-charcoal mb-1">
                  {c.title}
                </h3>
                <p className="text-sm text-stone-700 leading-snug">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Community visions */}
        <section>
          <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
            Community visions on the next-20 canvas ({data.visions.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.visions.map((v, i) => (
              <blockquote
                key={i}
                className="rounded-xl border border-stone-200 bg-white p-4"
              >
                <div className="font-serif italic text-sm leading-snug text-stone-800">
                  “{v.text}”
                </div>
                <div className="text-[11px] text-stone-600 mt-2">
                  — {v.author_name ?? 'Anonymous'}
                  {v.category && (
                    <span className="ml-2 text-stone-500">· {v.category}</span>
                  )}
                </div>
              </blockquote>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function VoiceRow({
  label,
  name,
  colour,
}: {
  label: string
  name: string | null
  colour: string
}) {
  return (
    <div className="flex items-baseline gap-2 py-1 text-xs">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: colour }}
      />
      <span className="text-stone-500 w-24 flex-shrink-0">{label}</span>
      <span
        className={
          name
            ? 'text-charcoal font-medium'
            : 'text-stone-400 italic'
        }
      >
        {name ?? 'still to capture'}
      </span>
    </div>
  )
}

function LegendDot({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block w-2 h-2 rounded-sm"
        style={{ backgroundColor: colour }}
      />
      <span>{label}</span>
    </span>
  )
}
