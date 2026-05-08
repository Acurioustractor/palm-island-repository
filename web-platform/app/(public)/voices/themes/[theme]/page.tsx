/**
 * Per-theme voices view — every quote tagged with the given theme,
 * pulled from EL canonical (extracted_quotes + storyteller_quotes
 * merged server-side at /api/picc/themes?theme=).
 *
 * Each quote can deep-link to the storyteller's profile when the
 * attribution resolves to a known PICC storyteller.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTheme } from '@/lib/empathy-ledger/el-themes'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 1800

interface PageProps {
  params: Promise<{ theme: string }>
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

  const detail = await getTheme(theme)
  const quotes = detail.quotes

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      <section
        className="px-6 md:px-12 py-16 md:py-20"
        style={{ backgroundColor: C.shell }}
      >
        <div className="max-w-5xl mx-auto">
          <Link
            href="/voices/themes"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80"
            style={{ color: C.driftwood }}
          >
            ← All themes
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

      {/* Cross-org link — show how this theme plays beyond Palm */}
      {quotes.length > 0 && (() => {
        const elBase = process.env.NEXT_PUBLIC_EL_V2_URL?.replace(/\/$/, '') || 'https://picc.empathyledger.com'
        const themeSlug = theme.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        return (
          <section
            className="px-6 md:px-12 py-10"
            style={{ backgroundColor: C.shell, borderTop: '1px solid #E8DEC5', borderBottom: '1px solid #E8DEC5' }}
          >
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div
                  className="uppercase font-bold mb-2"
                  style={{ color: C.ochre, fontSize: 10, letterSpacing: '0.3em' }}
                >
                  Beyond Palm
                </div>
                <p
                  className="font-fraunces leading-snug"
                  style={{ color: C.ocean, fontSize: 'clamp(17px, 2vw, 22px)' }}
                >
                  This theme is named by storytellers across the Empathy Ledger, not just Palm. See how other communities carry it.
                </p>
              </div>
              <a
                href={`${elBase}/themes/${themeSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-md font-semibold whitespace-nowrap hover:opacity-90 transition self-start md:self-center"
                style={{ backgroundColor: C.ocean, color: '#FBF8EE', fontSize: 13 }}
              >
                Cross-org view →
              </a>
            </div>
          </section>
        )
      })()}

      <section className="px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-5">
          {quotes.length === 0 ? (
            <div className="text-center py-12">
              <p
                className="font-fraunces"
                style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.6 }}
              >
                No voices yet for the theme &ldquo;{theme}&rdquo;. The
                Empathy Ledger archive may not have tagged this theme on
                Palm voices specifically — try a different theme, or read
                voices unfiltered.
              </p>
              <Link
                href="/voices"
                className="inline-block mt-6 px-5 py-3 rounded-md font-semibold hover:opacity-90 transition"
                style={{ backgroundColor: C.ocean, color: '#FBF8EE', fontSize: 13 }}
              >
                Read all voices →
              </Link>
            </div>
          ) : (
            quotes.map((q) => (
              <article
                key={q.id}
                className="rounded-md p-6 flex gap-5 items-start"
                style={{ backgroundColor: C.sand }}
              >
                {q.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={q.photo_url}
                    alt={q.attribution || ''}
                    className="hidden sm:block w-16 h-16 rounded-full object-cover flex-shrink-0"
                    style={{ border: `2px solid ${q.is_elder ? C.starGold : C.shell}` }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <blockquote
                    className="font-fraunces italic leading-snug"
                    style={{ color: C.earth, fontSize: 'clamp(17px, 2vw, 22px)' }}
                  >
                    &ldquo;{q.quote}&rdquo;
                  </blockquote>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {q.storyteller_slug ? (
                      <Link
                        href={`/voices/${q.storyteller_slug}`}
                        className="font-semibold hover:underline"
                        style={{ color: C.ocean, fontSize: 13 }}
                      >
                        {q.attribution || 'Storyteller'}
                      </Link>
                    ) : (
                      <span
                        className="font-semibold"
                        style={{ color: C.ocean, fontSize: 13 }}
                      >
                        {q.attribution || 'Community Member'}
                      </span>
                    )}
                    {q.is_elder && (
                      <span
                        className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: C.starGold,
                          color: C.midnight,
                          letterSpacing: '0.15em',
                        }}
                      >
                        Elder
                      </span>
                    )}
                    {q.source === 'curated' && (
                      <span
                        className="text-[10px] uppercase font-bold tracking-widest"
                        style={{ color: C.ochre, letterSpacing: '0.2em' }}
                      >
                        · Editor pick
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
