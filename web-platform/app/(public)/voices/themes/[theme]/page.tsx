/**
 * Per-theme voices view — renders every validated quote tagged with a
 * given theme. Linked from /voices/pulse and any future "filter by
 * theme" surface.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/client'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 1800

interface PageProps {
  params: Promise<{ theme: string }>
}

interface QuoteRow {
  id: string
  quote_text: string
  attribution: string | null
  theme: string | null
  sentiment: string | null
  impact_score: number | null
  created_at: string
}

export async function generateMetadata({ params }: PageProps) {
  const { theme } = await params
  const decoded = decodeURIComponent(theme)
  return {
    title: `${decoded[0]?.toUpperCase()}${decoded.slice(1)} — Voices · PICC`,
    description: `Community voices on the theme of ${decoded}.`,
  }
}

export default async function ThemeVoicesPage({ params }: PageProps) {
  const { theme: rawTheme } = await params
  const theme = decodeURIComponent(rawTheme).toLowerCase()
  if (!theme || theme.length > 60) notFound()

  const supabase = createServerSupabase()

  // Match in either the singular `theme` column or the multi-tag `themes` array.
  const { data } = await supabase
    .from('extracted_quotes')
    .select('id, quote_text, attribution, theme, sentiment, impact_score, themes, created_at')
    .or('is_validated.eq.true,suggested_for_report.eq.true')
    .or(`theme.ilike.${theme},themes.cs.{${theme}}`)
    .order('impact_score', { ascending: false, nullsFirst: false })
    .limit(200)

  const quotes = (data || []) as QuoteRow[]

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      <section
        className="px-6 md:px-12 py-16 md:py-20"
        style={{ backgroundColor: C.shell }}
      >
        <div className="max-w-5xl mx-auto">
          <Link
            href="/voices/pulse"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80"
            style={{ color: C.driftwood }}
          >
            ← Community pulse
          </Link>
          <div
            className="uppercase font-bold mt-8 mb-3"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Theme · {quotes.length.toLocaleString()} {quotes.length === 1 ? 'voice' : 'voices'}
          </div>
          <h1
            className="font-fraunces font-bold leading-tight capitalize"
            style={{ color: C.ocean, fontSize: 'clamp(36px, 6vw, 64px)' }}
          >
            {theme}
          </h1>
        </div>
      </section>

      <section className="px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-5">
          {quotes.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 16 }}>
              No validated voices yet for the theme &ldquo;{theme}&rdquo;.
            </p>
          ) : (
            quotes.map((q) => (
              <article
                key={q.id}
                className="rounded-md p-6"
                style={{ backgroundColor: C.sand }}
              >
                <blockquote
                  className="font-fraunces italic leading-snug"
                  style={{ color: C.earth, fontSize: 'clamp(17px, 2vw, 22px)' }}
                >
                  &ldquo;{q.quote_text}&rdquo;
                </blockquote>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span
                    className="font-semibold"
                    style={{ color: C.ocean, fontSize: 13 }}
                  >
                    {q.attribution || 'Community Member'}
                  </span>
                  {q.sentiment && (
                    <span
                      className="capitalize"
                      style={{ color: C.driftwood, fontSize: 12 }}
                    >
                      · {q.sentiment}
                    </span>
                  )}
                  {q.impact_score != null && (
                    <span
                      className="ml-auto uppercase font-bold"
                      style={{ color: C.ochre, fontSize: 10, letterSpacing: '0.2em' }}
                    >
                      Impact {q.impact_score}
                    </span>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
