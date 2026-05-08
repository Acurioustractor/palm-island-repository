/**
 * Themes index — landing for /voices/themes.
 *
 * Pulls from EL canonical (/api/picc/themes) — merges extracted_quotes
 * and storyteller_quotes server-side. Featured themes are still PICC
 * editor-curated (featured_themes table).
 *
 * Each tile links to /voices/themes/<theme>.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { getThemesIndex } from '@/lib/empathy-ledger/el-themes'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 1800

import { ogMeta } from '@/lib/seo/og'

export const metadata = ogMeta({
  title: 'Themes — Voices · PICC',
  description:
    'Themes the Palm Island community has been speaking to — featured and emerging.',
  path: '/voices/themes',
})

interface FeaturedTheme {
  theme: string
  curator_note: string | null
  fiscal_year: string | null
  display_order: number
}

// Stable colour wheel for theme tiles (Saltwater & Earth families).
const TILE_PALETTE = [
  SECTION_COLOURS.healthWellbeing,
  SECTION_COLOURS.educationCommunity,
  SECTION_COLOURS.governance,
  SECTION_COLOURS.justiceSafety,
  SECTION_COLOURS.economic,
]
function colourFor(theme: string): string {
  let hash = 0
  for (let i = 0; i < theme.length; i++) hash = (hash * 31 + theme.charCodeAt(i)) & 0xfffffff
  return TILE_PALETTE[hash % TILE_PALETTE.length]
}

export default async function ThemesIndexPage() {
  const supabase = createServerSupabase()

  const [{ data: featured }, themesIndex] = await Promise.all([
    supabase
      .from('featured_themes')
      .select('theme, curator_note, fiscal_year, display_order')
      .eq('is_active', true)
      .order('display_order')
      .limit(12),
    getThemesIndex(),
  ])

  const featuredThemes = (featured || []) as FeaturedTheme[]
  const featuredKeys = new Set(featuredThemes.map((f) => f.theme.toLowerCase().trim()))

  // Quality filter — themes with only one tagged quote are mostly
  // noise (typos, one-off quote tags). Surface only themes the
  // community has named at least twice. The total count strip still
  // reflects every theme in the archive (transparency); the
  // browseable grid is the curated cut.
  const MIN_COUNT = 2
  const ranked = themesIndex.themes
    .filter((t) => !featuredKeys.has(t.theme))
    .filter((t) => t.count >= MIN_COUNT)

  // Top tier (large tiles, top 6 by count)
  const top = ranked.slice(0, 6)
  const rest = ranked.slice(6, 60)

  const totalCount = themesIndex.total_tagged
  const totalThemes = themesIndex.total_themes
  const browseableCount = featuredThemes.length + ranked.length
  const longTailCount = themesIndex.total_themes - browseableCount

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
            {longTailCount > 0 && (
              <span style={{ opacity: 0.6 }}>
                {' '}· browsing {browseableCount} most-named
              </span>
            )}
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

      {top.length > 0 && (
        <section className="px-6 md:px-12 py-8">
          <div className="max-w-6xl mx-auto">
            <h2
              className="font-fraunces font-bold mb-6"
              style={{ color: C.ocean, fontSize: 28 }}
            >
              Strongest threads right now
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {top.map((t) => {
                const c = colourFor(t.theme)
                return (
                  <Link
                    key={t.theme}
                    href={`/voices/themes/${encodeURIComponent(t.theme)}`}
                    className="block p-6 rounded-2xl hover:shadow-md transition group"
                    style={{ backgroundColor: c + '15', border: `1px solid ${c}33` }}
                  >
                    <div
                      className="uppercase font-bold mb-3"
                      style={{ color: c, fontSize: 10, letterSpacing: '0.3em' }}
                    >
                      {t.count} {t.count === 1 ? 'voice' : 'voices'}
                    </div>
                    <div
                      className="font-fraunces font-bold capitalize leading-tight"
                      style={{ color: C.ocean, fontSize: 26 }}
                    >
                      {t.theme}
                    </div>
                    <div
                      className="mt-4 text-xs uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition"
                      style={{ color: c, letterSpacing: '0.2em' }}
                    >
                      Read voices →
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="px-6 md:px-12 py-12">
          <div className="max-w-5xl mx-auto">
            <h2
              className="font-fraunces font-bold mb-6"
              style={{ color: C.ocean, fontSize: 24 }}
            >
              Every other thread
            </h2>
            <div className="flex flex-wrap gap-2">
              {rest.map((t) => (
                <Link
                  key={t.theme}
                  href={`/voices/themes/${encodeURIComponent(t.theme)}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm hover:shadow-sm transition"
                  style={{ borderColor: C.driftwood, color: C.ocean, backgroundColor: '#fff' }}
                >
                  <span className="capitalize">{t.theme}</span>
                  <span className="text-xs" style={{ color: C.driftwood }}>
                    {t.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {ranked.length === 0 && featuredThemes.length === 0 && (
        <section className="px-6 md:px-12 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <p
              className="font-fraunces"
              style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.6 }}
            >
              Themes will appear here once voices are validated and tagged
              in the Empathy Ledger archive. Check back soon.
            </p>
            <Link
              href="/voices"
              className="inline-block mt-6 px-5 py-3 rounded-md font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: C.ocean, color: '#FBF8EE', fontSize: 13 }}
            >
              Read voices instead →
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}
