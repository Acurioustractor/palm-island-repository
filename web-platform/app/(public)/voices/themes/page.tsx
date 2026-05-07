/**
 * Themes index — landing for /voices/themes (no theme).
 *
 * Two sections:
 *   1. Featured this year — editor-curated `featured_themes` table.
 *   2. All themes — top themes by quote count from `extracted_quotes`.
 *
 * Each tile links to /voices/themes/<theme>.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 1800

export const metadata = {
  title: 'Themes — Voices · PICC',
  description:
    'Themes the Palm Island community has been speaking to — featured and emerging.',
}

interface FeaturedTheme {
  theme: string
  curator_note: string | null
  fiscal_year: string | null
  display_order: number
}

interface QuoteThemes {
  theme: string | null
  themes: string[] | null
}

export default async function ThemesIndexPage() {
  const supabase = createServerSupabase()

  const [{ data: featured }, { data: quoteThemes }] = await Promise.all([
    supabase
      .from('featured_themes')
      .select('theme, curator_note, fiscal_year, display_order')
      .eq('is_active', true)
      .order('display_order')
      .limit(12),
    supabase
      .from('extracted_quotes')
      .select('theme, themes')
      .or('is_validated.eq.true,suggested_for_report.eq.true')
      .limit(2000),
  ])

  const featuredThemes = (featured || []) as FeaturedTheme[]

  // Tally theme frequency across both the singular `theme` column and the
  // multi-tag `themes` array, normalised to lowercase.
  const counts = new Map<string, number>()
  for (const row of (quoteThemes || []) as QuoteThemes[]) {
    const tags = new Set<string>()
    if (row.theme) tags.add(row.theme.toLowerCase().trim())
    for (const t of row.themes || []) {
      if (t) tags.add(t.toLowerCase().trim())
    }
    Array.from(tags).forEach((t) => {
      if (!t) return
      counts.set(t, (counts.get(t) || 0) + 1)
    })
  }

  const featuredKeys = new Set(featuredThemes.map((f) => f.theme.toLowerCase().trim()))
  const ranked = Array.from(counts.entries())
    .filter(([t]) => !featuredKeys.has(t))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 36)

  const totalCount = Array.from(counts.values()).reduce((a, b) => a + b, 0)
  const totalThemes = counts.size

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      <section
        className="px-6 md:px-12 py-16 md:py-20"
        style={{ backgroundColor: C.shell }}
      >
        <div className="max-w-5xl mx-auto">
          <Link
            href="/voices"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80"
            style={{ color: C.driftwood }}
          >
            ← Voices
          </Link>
          <div
            className="uppercase font-bold mt-8 mb-3"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            {totalThemes.toLocaleString()} themes · {totalCount.toLocaleString()} tagged voices
          </div>
          <h1
            className="font-fraunces font-bold leading-tight"
            style={{ color: C.ocean, fontSize: 'clamp(36px, 6vw, 64px)' }}
          >
            Themes
          </h1>
          <p
            className="font-fraunces mt-4 max-w-2xl"
            style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.6 }}
          >
            What the community has been speaking to. Featured themes are
            chosen by editors with Elder review; the wider grid is everything
            else surfacing across our validated voices archive.
          </p>
        </div>
      </section>

      {featuredThemes.length > 0 && (
        <section className="px-6 md:px-12 py-12">
          <div className="max-w-5xl mx-auto">
            <h2
              className="font-fraunces font-bold mb-6"
              style={{ color: C.ocean, fontSize: 28 }}
            >
              Featured this year
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredThemes.map((f) => (
                <Link
                  key={f.theme}
                  href={`/voices/themes/${encodeURIComponent(f.theme)}`}
                  className="block p-5 rounded-md border hover:shadow-sm transition"
                  style={{ borderColor: C.driftwood, backgroundColor: '#fff' }}
                >
                  <div
                    className="uppercase font-bold mb-2"
                    style={{ color: C.turtleRed, fontSize: 10, letterSpacing: '0.3em' }}
                  >
                    {f.fiscal_year || 'Featured'}
                  </div>
                  <div
                    className="font-fraunces font-bold capitalize"
                    style={{ color: C.ocean, fontSize: 22 }}
                  >
                    {f.theme}
                  </div>
                  {f.curator_note && (
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: C.driftwood }}>
                      {f.curator_note}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {ranked.length > 0 && (
        <section className="px-6 md:px-12 py-12">
          <div className="max-w-5xl mx-auto">
            <h2
              className="font-fraunces font-bold mb-6"
              style={{ color: C.ocean, fontSize: 28 }}
            >
              All themes
            </h2>
            <div className="flex flex-wrap gap-2">
              {ranked.map(([theme, count]) => (
                <Link
                  key={theme}
                  href={`/voices/themes/${encodeURIComponent(theme)}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm hover:shadow-sm transition"
                  style={{ borderColor: C.driftwood, color: C.ocean, backgroundColor: '#fff' }}
                >
                  <span className="capitalize">{theme}</span>
                  <span
                    className="text-xs"
                    style={{ color: C.driftwood }}
                  >
                    {count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {ranked.length === 0 && featuredThemes.length === 0 && (
        <section className="px-6 md:px-12 py-12">
          <div className="max-w-5xl mx-auto text-center" style={{ color: C.driftwood }}>
            No themes tagged yet. Once voices are validated, themes will surface here.
          </div>
        </section>
      )}
    </main>
  )
}
