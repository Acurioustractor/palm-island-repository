/**
 * /living-atlas/themes/[key] — cross-year theme cut.
 *
 * For a given theme (culture, resilience, history, etc.), surface every
 * quote in the corpus that names it, grouped by the year the quote was
 * extracted from (parsed out of elder_quotes.category strings like
 * "ai-extraction-v2 (2014-15)") OR by extracted_quotes.theme.
 *
 * This is the Stage 2 cross-cut promise made concrete without needing
 * EL v2's full report-decomposition pipeline — we use what's already in
 * PICC's own tables.
 */

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/client'
import { loadConstellation } from '@/lib/constellation/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PICC_ORG_ID = '3c2011b9-f80d-4289-b300-0cd383cff479'

interface YearGroup {
  year: number | null
  /** Quote rows for this year, sorted with named-speaker first. */
  quotes: Array<{
    text: string
    speaker: string | null
    theme: string | null
    suggested: boolean
    source: 'elder_quotes' | 'extracted_quotes'
  }>
}

function parseYearFromCategory(cat: string | null): number | null {
  if (!cat) return null
  // categories shaped like "ai-extraction-v2 (2014-15)" — take the
  // ending year of the fiscal range as a proxy.
  const m = /\((\d{4})-(\d{2,4})\)/.exec(cat)
  if (!m) return null
  const start = parseInt(m[1], 10)
  return start + 1
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params
  const label = key.charAt(0).toUpperCase() + key.slice(1)
  return {
    title: `${label} across the years — Palm Island Living Atlas`,
    description: `Every community voice on the theme of ${label}, grouped by year.`,
  }
}

export default async function ThemeCrossCutPage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params
  const themeKey = key.toLowerCase()
  const label = themeKey.charAt(0).toUpperCase() + themeKey.slice(1)

  const supabase = createServerSupabase()
  const data = await loadConstellation()

  // Confirm the theme exists in our active corpus.
  const themeRow = data.themes.find((t) => t.key === themeKey)
  if (!themeRow) {
    // Allow rendering anyway, but flag as 'unknown'.
  }

  // Fetch all matching quotes.
  const [eqRes, equRes] = await Promise.all([
    // elder_quotes — match on theme column OR category prefix
    supabase
      .from('elder_quotes')
      .select('text, speaker_name, theme, category, permission_level, cultural_sensitivity')
      .eq('organization_id', PICC_ORG_ID)
      .eq('is_validated', true)
      .eq('permission_level', 'public')
      .or(`theme.eq.${themeKey},category.ilike.${themeKey}%`),
    // extracted_quotes — match on theme
    supabase
      .from('extracted_quotes')
      .select('quote_text, attribution, theme, suggested_for_report')
      .eq('theme', themeKey),
  ])

  type Row = YearGroup['quotes'][number]
  const rows: Row[] = []

  for (const r of eqRes.data ?? []) {
    if (r.cultural_sensitivity && r.cultural_sensitivity !== 'standard' && r.cultural_sensitivity !== 'public') {
      continue
    }
    const text = (r.text as string | null)?.trim()
    if (!text) continue
    rows.push({
      text,
      speaker: (r.speaker_name as string | null) ?? null,
      theme: (r.theme as string | null) ?? themeKey,
      suggested: false,
      source: 'elder_quotes',
    })
  }
  for (const r of equRes.data ?? []) {
    const text = (r.quote_text as string | null)?.trim()
    if (!text) continue
    rows.push({
      text,
      speaker: (r.attribution as string | null) ?? null,
      theme: (r.theme as string | null) ?? themeKey,
      suggested: Boolean(r.suggested_for_report),
      source: 'extracted_quotes',
    })
  }

  // Group by year (parsed from elder_quotes.category). extracted_quotes
  // rows have no year context — they land in "year unknown".
  const byYear = new Map<number | null, Row[]>()
  for (const r of rows) {
    let year: number | null = null
    if (r.source === 'elder_quotes') {
      // category was the source of year info — re-fetch the parsed value
      // from the original row. For simplicity, we left it on the row.
    }
    const list = byYear.get(year) ?? []
    list.push(r)
    byYear.set(year, list)
  }

  // Try a second pass with the original elder_quotes rows to populate year.
  const yearByText = new Map<string, number | null>()
  for (const r of eqRes.data ?? []) {
    const text = (r.text as string | null)?.trim()
    if (!text) continue
    yearByText.set(text, parseYearFromCategory(r.category as string | null))
  }

  const grouped = new Map<number | null, Row[]>()
  for (const r of rows) {
    const yr = yearByText.get(r.text) ?? null
    const list = grouped.get(yr) ?? []
    list.push(r)
    grouped.set(yr, list)
  }

  const years = Array.from(grouped.keys()).sort((a, b) => {
    if (a === null) return 1
    if (b === null) return -1
    return b - a
  })

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link
          href="/living-atlas"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Living Atlas
        </Link>

        <header className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-1">
            Theme across the years
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-2">
            {label}
          </h1>
          <p className="text-stone-600 max-w-2xl">
            Every community voice in the corpus that names <strong>{label}</strong>.
            Grouped by the year the quote was captured. Older voices show what
            was named first; newer ones show what the theme means today.
          </p>
          <div className="mt-3 flex gap-4 text-[11px] text-stone-600">
            <span>
              <strong>{rows.length}</strong> quotes total
            </span>
            <span>
              <strong>{years.filter((y) => y !== null).length}</strong> years
              with attributable quotes
            </span>
            {themeRow && (
              <span>
                <strong>{themeRow.count}</strong> theme tags in the live corpus
              </span>
            )}
          </div>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <div className="font-serif text-lg mb-1">No quotes on file yet.</div>
            <p className="text-sm text-stone-600">
              As more community voices are captured and validated under this
              theme, they appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {years.map((year) => {
              const list = grouped.get(year) ?? []
              const yrLabel = year === null ? 'Year not on record' : `FY ${year}`
              return (
                <section key={String(year)}>
                  <div className="flex items-baseline gap-3 mb-3">
                    <h2
                      className="font-serif text-2xl"
                      style={{ color: year ? '#2D5F4F' : '#8B6F47' }}
                    >
                      {yrLabel}
                    </h2>
                    <span className="text-[11px] text-stone-500">
                      {list.length} quote{list.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {list.slice(0, 12).map((q, i) => (
                      <blockquote
                        key={i}
                        className="rounded-md border border-stone-200 bg-white p-4"
                      >
                        <div className="font-serif italic leading-snug text-stone-800">
                          “{q.text.length > 320 ? q.text.slice(0, 320) + '…' : q.text}”
                        </div>
                        <div className="text-[11px] text-stone-600 mt-2 flex items-center gap-2 flex-wrap">
                          {q.speaker && <span>— {q.speaker}</span>}
                          {q.suggested && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
                              style={{ backgroundColor: '#E7EFE4', color: '#2D5F4F' }}
                            >
                              report-ready
                            </span>
                          )}
                          <span className="text-stone-400">·</span>
                          <span className="text-stone-500">{q.source.replace('_', ' ')}</span>
                        </div>
                      </blockquote>
                    ))}
                    {list.length > 12 && (
                      <div className="text-[10.5px] text-stone-500 italic">
                        +{list.length - 12} more in the archive
                      </div>
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        <section className="mt-8 rounded-xl border border-stone-200 bg-white p-5">
          <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
            Other themes in the corpus
          </div>
          <div className="flex flex-wrap gap-2">
            {data.themes
              .filter((t) => t.key !== themeKey)
              .map((t) => (
                <Link
                  key={t.key}
                  href={`/living-atlas/themes/${t.key}`}
                  className="inline-flex items-center gap-1 text-sm rounded-full px-3 py-1 border border-stone-200 hover:bg-stone-50"
                >
                  {t.label}
                  <span className="text-stone-500 text-xs">·{t.count}</span>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}
