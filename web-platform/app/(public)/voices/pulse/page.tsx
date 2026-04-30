/**
 * Community pulse — public-facing aggregation of what the community
 * has been saying.
 *
 * Reads validated extracted_quotes from PICC's local supabase and
 * surfaces:
 *   - Top 12 themes by quote count
 *   - Sentiment distribution
 *   - Voices contributed per month over the last 12 months
 *   - Top 5 quotes by impact_score this month
 *
 * Linked from /voices via the storyteller index strip. Public — no
 * auth required. All quotes shown are is_validated = true OR
 * suggested_for_report = true.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { getPalmStorytellers } from '@/lib/empathy-ledger/el-server'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normaliseName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const dynamic = 'force-dynamic'
export const revalidate = 1800

export const metadata = {
  title: 'Community Pulse — Palm Island Community Company',
  description:
    'What the Palm Island community has been saying — themes, sentiment, and the voices behind the work.',
}

interface QuoteRow {
  id: string
  quote_text: string
  attribution: string | null
  theme: string | null
  sentiment: string | null
  impact_score: number | null
  themes: string[] | null
  created_at: string
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const SENTIMENT_TINTS: Record<string, string> = {
  positive: C.mangrove,
  inspiring: C.starGold,
  reflective: C.driftwood,
  grateful: C.ochre,
  hopeful: C.reef,
  determined: C.coral,
  proud: C.turtleRed,
}

export default async function CommunityPulsePage() {
  const supabase = createServerSupabase()

  const [{ data }, storytellers, { data: featuredData }] = await Promise.all([
    supabase
      .from('extracted_quotes')
      .select('id, quote_text, attribution, theme, sentiment, impact_score, themes, created_at')
      .or('is_validated.eq.true,suggested_for_report.eq.true')
      .order('created_at', { ascending: false })
      .limit(2000),
    getPalmStorytellers(),
    supabase
      .from('featured_themes')
      .select('theme, curator_note, fiscal_year, display_order')
      .eq('is_active', true)
      .order('display_order')
      .limit(8),
  ])

  const featuredThemes = (featuredData || []) as Array<{
    theme: string
    curator_note: string | null
    fiscal_year: string | null
    display_order: number
  }>

  const quotes = (data || []) as QuoteRow[]

  // Build name → /voices/<slug> lookup so top-impact quote attributions
  // can link to a real storyteller profile when one matches.
  const nameToSlug: Record<string, string> = {}
  for (const t of storytellers) {
    nameToSlug[normaliseName(t.display_name)] = slugifyName(t.display_name)
  }

  // Theme counts (theme + multi-tag themes[])
  const themeCounts: Record<string, number> = {}
  for (const q of quotes) {
    const tags: Record<string, true> = {}
    if (q.theme) tags[q.theme.toLowerCase()] = true
    for (const t of q.themes || []) tags[t.toLowerCase()] = true
    for (const t of Object.keys(tags)) themeCounts[t] = (themeCounts[t] || 0) + 1
  }
  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
  const themeMax = topThemes[0]?.[1] || 1

  // Sentiment distribution
  const sentimentCounts: Record<string, number> = {}
  for (const q of quotes) {
    if (q.sentiment) {
      sentimentCounts[q.sentiment] = (sentimentCounts[q.sentiment] || 0) + 1
    }
  }
  const sentiments = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])
  const sentimentTotal = sentiments.reduce((sum, [, n]) => sum + n, 0) || 1

  // Time series — last 12 months
  const now = new Date()
  const months: { key: string; label: string; count: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.push({ key, label: MONTH_NAMES[d.getMonth()], count: 0 })
  }
  for (const q of quotes) {
    const d = new Date(q.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const m = months.find((x) => x.key === key)
    if (m) m.count++
  }
  const monthMax = Math.max(...months.map((m) => m.count), 1)

  // Top 5 by impact this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const topThisMonth = [...quotes]
    .filter((q) => new Date(q.created_at) >= monthStart && q.impact_score != null)
    .sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))
    .slice(0, 5)

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero */}
      <section
        className="px-6 md:px-12 py-20 md:py-28"
        style={{ backgroundColor: C.ocean }}
      >
        <div className="max-w-5xl mx-auto">
          <Link
            href="/voices"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            ← Voices wall
          </Link>
          <div
            className="uppercase font-bold mt-8 mb-4"
            style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Community pulse · {quotes.length.toLocaleString()} validated voices
          </div>
          <h1
            className="font-fraunces font-bold leading-tight text-white"
            style={{ fontSize: 'clamp(40px, 7vw, 80px)' }}
          >
            What we&rsquo;ve heard.
          </h1>
          <p
            className="mt-6 leading-relaxed text-white/85 max-w-2xl"
            style={{ fontSize: 16 }}
          >
            A living read of the themes, the feelings, and the rhythm of community voices gathered through Empathy Ledger. Every voice is recorded with consent and validated before it lands here.
          </p>
        </div>
      </section>

      {/* Featured themes — admin-curated. Only renders when there's at
          least one active featured theme; otherwise the page goes
          straight to the live aggregation below. */}
      {featuredThemes.length > 0 && (
        <section className="px-6 md:px-12 py-16 md:py-20" style={{ backgroundColor: C.sand }}>
          <div className="max-w-5xl mx-auto">
            <SectionEyebrow tint={C.turtleRed}>Featured this period</SectionEyebrow>
            <SectionTitle>What we&rsquo;re holding to.</SectionTitle>
            <p className="mt-3 italic" style={{ color: C.driftwood, fontSize: 14 }}>
              Curated lift, not algorithmic — the wider live aggregation continues below.
            </p>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
              {featuredThemes.map((f) => {
                const count = themeCounts[f.theme.toLowerCase()] || 0
                return (
                  <Link
                    key={f.theme}
                    href={`/voices/themes/${encodeURIComponent(f.theme)}`}
                    className="group rounded-md p-5 hover:opacity-95 transition-opacity"
                    style={{ backgroundColor: '#FBF8EE', borderLeft: `3px solid ${C.ochre}` }}
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <h3
                        className="font-fraunces font-bold leading-tight capitalize group-hover:underline"
                        style={{ color: C.ocean, fontSize: 22 }}
                      >
                        {f.theme}
                      </h3>
                      <span
                        className="text-xs font-mono whitespace-nowrap"
                        style={{ color: C.muted }}
                      >
                        {count} {count === 1 ? 'voice' : 'voices'}
                      </span>
                    </div>
                    {f.curator_note && (
                      <p
                        className="leading-relaxed italic"
                        style={{ color: C.earth, fontSize: 14 }}
                      >
                        {f.curator_note}
                      </p>
                    )}
                    {f.fiscal_year && (
                      <div className="mt-3 uppercase font-bold" style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.2em' }}>
                        FY {f.fiscal_year}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Top themes */}
      <section className="px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <SectionEyebrow tint={C.turtleRed}>Top 12 themes</SectionEyebrow>
          <SectionTitle>What&rsquo;s in the air.</SectionTitle>
          <div className="mt-10 flex flex-col gap-3">
            {topThemes.length === 0 ? (
              <EmptyState>No themes yet.</EmptyState>
            ) : (
              topThemes.map(([theme, count]) => (
                <Link
                  key={theme}
                  href={`/voices/themes/${encodeURIComponent(theme)}`}
                  className="group flex items-center gap-4"
                >
                  <div
                    className="w-32 md:w-44 capitalize font-fraunces"
                    style={{ color: C.ocean, fontSize: 18 }}
                  >
                    {theme}
                  </div>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: C.shell }}>
                    <div
                      className="h-full rounded-full group-hover:opacity-90 transition-opacity"
                      style={{
                        width: `${(count / themeMax) * 100}%`,
                        backgroundColor: C.ochre,
                      }}
                    />
                  </div>
                  <div
                    className="w-12 text-right font-mono"
                    style={{ color: C.driftwood, fontSize: 13 }}
                  >
                    {count}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Sentiment + monthly time series — side by side on desktop */}
      <section className="px-6 md:px-12 py-16 md:py-20" style={{ backgroundColor: C.shell }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Sentiment */}
          <div>
            <SectionEyebrow tint={C.turtleRed}>Sentiment</SectionEyebrow>
            <SectionTitle>How it lands.</SectionTitle>
            <div className="mt-8 flex flex-col gap-3">
              {sentiments.length === 0 ? (
                <EmptyState>No sentiment data yet.</EmptyState>
              ) : (
                sentiments.map(([sentiment, count]) => {
                  const pct = (count / sentimentTotal) * 100
                  const tint = SENTIMENT_TINTS[sentiment] || C.driftwood
                  return (
                    <div key={sentiment} className="flex items-center gap-3">
                      <div
                        className="w-24 capitalize"
                        style={{ color: C.earth, fontSize: 13 }}
                      >
                        {sentiment}
                      </div>
                      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#FBF8EE' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: tint,
                          }}
                        />
                      </div>
                      <div
                        className="w-14 text-right font-mono"
                        style={{ color: C.driftwood, fontSize: 12 }}
                      >
                        {pct.toFixed(0)}%
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Monthly */}
          <div>
            <SectionEyebrow tint={C.turtleRed}>Last 12 months</SectionEyebrow>
            <SectionTitle>The rhythm.</SectionTitle>
            <div className="mt-8 flex items-end gap-2 h-40">
              {months.map((m) => (
                <div key={m.key} className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${(m.count / monthMax) * 100}%`,
                        backgroundColor: C.mangrove,
                        minHeight: m.count > 0 ? 4 : 0,
                      }}
                      title={`${m.count} voices`}
                    />
                  </div>
                  <div
                    className="text-center"
                    style={{ color: C.driftwood, fontSize: 10 }}
                  >
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top quotes this month */}
      <section className="px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <SectionEyebrow tint={C.turtleRed}>This month · highest impact</SectionEyebrow>
          <SectionTitle>Voices carrying the conversation.</SectionTitle>
          <div className="mt-10 flex flex-col gap-6">
            {topThisMonth.length === 0 ? (
              <EmptyState>No high-impact voices yet this month.</EmptyState>
            ) : (
              topThisMonth.map((q) => (
                <article
                  key={q.id}
                  className="rounded-md p-6"
                  style={{ backgroundColor: C.sand }}
                >
                  <blockquote
                    className="font-fraunces italic leading-snug"
                    style={{ color: C.earth, fontSize: 'clamp(18px, 2.2vw, 24px)' }}
                  >
                    &ldquo;{q.quote_text}&rdquo;
                  </blockquote>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {(() => {
                      const name = q.attribution || 'Community Member'
                      const slug = q.attribution ? nameToSlug[normaliseName(q.attribution)] : null
                      return slug ? (
                        <Link
                          href={`/voices/${slug}`}
                          className="font-semibold hover:underline"
                          style={{ color: C.ocean, fontSize: 13 }}
                        >
                          {name}
                        </Link>
                      ) : (
                        <span
                          className="font-semibold"
                          style={{ color: C.ocean, fontSize: 13 }}
                        >
                          {name}
                        </span>
                      )
                    })()}
                    {q.theme && (
                      <span
                        className="capitalize"
                        style={{ color: C.driftwood, fontSize: 12 }}
                      >
                        · {q.theme}
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
        </div>
      </section>

      {/* Add your voice CTA */}
      <section
        className="px-6 md:px-12 py-20 md:py-24 text-center"
        style={{ backgroundColor: C.midnight }}
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <h2
            className="font-fraunces font-bold leading-none"
            style={{ color: C.starGold, fontSize: 'clamp(36px, 5.5vw, 56px)' }}
          >
            Add your voice.
          </h2>
          <p className="text-white/85 leading-relaxed mx-auto" style={{ fontSize: 16, maxWidth: 480 }}>
            Have a memory, a question, a piece of country to share? Every voice helps shape the next year of work.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/share-voice"
              className="px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:opacity-90"
              style={{
                backgroundColor: C.starGold,
                color: C.midnight,
                fontSize: 11,
                letterSpacing: '0.2em',
              }}
            >
              Share a voice
            </Link>
            <Link
              href="/share-story"
              className="px-6 py-3 rounded-full font-bold uppercase tracking-widest border hover:opacity-90"
              style={{
                color: C.starGold,
                borderColor: C.starGold,
                fontSize: 11,
                letterSpacing: '0.2em',
              }}
            >
              Share a story
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function SectionEyebrow({ children, tint }: { children: React.ReactNode; tint: string }) {
  return (
    <div
      className="uppercase font-bold"
      style={{ color: tint, fontSize: 11, letterSpacing: '0.3em' }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-fraunces font-bold leading-tight mt-3"
      style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 42px)' }}
    >
      {children}
    </h2>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="italic"
      style={{ color: C.muted, fontSize: 14 }}
    >
      {children}
    </div>
  )
}
