/**
 * /voices/this-month — what the community has added this month.
 *
 * The "always-on" answer. Annual reports happen once a year; this is
 * what the year LOOKS LIKE in motion. Counts + recent items across
 * every contribution shape, scoped to the current calendar month.
 *
 * Re-renders fresh on every request (force-dynamic). Bookmarkable as
 * a month-by-month archive: ?month=2026-04 viewport.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import { Mic, BookOpen, HelpCircle, StickyNote, Image as ImageIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 600 // 10 minutes — feels fresh without hammering

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface PageProps {
  searchParams: Promise<{ month?: string }>
}

interface QuoteRow {
  id: string
  quote_text: string
  attribution: string | null
  theme: string | null
  created_at: string
}

interface StoryRow {
  id: string
  title: string | null
  content: string | null
  category: string | null
  metadata: Record<string, any> | null
  created_at: string
}

interface ArtRow {
  id: string
  public_url: string
  title: string | null
  attribution: string | null
  created_at: string
}

export const metadata = {
  title: 'This month — Palm Island Community Company',
  description: 'What the community has added in the past month — voices, art, stories, questions, notes.',
}

function monthRange(monthParam?: string): { start: Date; end: Date; label: string; key: string } {
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() // 0-indexed
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split('-').map(Number)
    if (y >= 2020 && y <= 2100 && m >= 1 && m <= 12) {
      year = y
      month = m - 1
    }
  }
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 1)
  const key = `${year}-${String(month + 1).padStart(2, '0')}`
  return {
    start,
    end,
    label: `${MONTH_NAMES[month]} ${year}`,
    key,
  }
}

export default async function ThisMonthPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { start, end, label, key } = monthRange(params.month)
  const startIso = start.toISOString()
  const endIso = end.toISOString()

  const supabase = createServerSupabase()

  const [
    quotesResult,
    storiesResult,
    artResult,
    answeredResult,
    notesResult,
  ] = await Promise.all([
    supabase
      .from('extracted_quotes')
      .select('id, quote_text, attribution, theme, created_at')
      .or('is_validated.eq.true,suggested_for_report.eq.true')
      .gte('created_at', startIso)
      .lt('created_at', endIso)
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('stories')
      .select('id, title, content, category, metadata, created_at')
      .eq('is_public', true)
      .or('metadata->>is_question.is.null,metadata->>is_question.eq.false')
      .or('metadata->>is_note.is.null,metadata->>is_note.eq.false')
      .gte('created_at', startIso)
      .lt('created_at', endIso)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('media_files')
      .select('id, public_url, title, attribution, created_at')
      .eq('page_context', 'community-art')
      .eq('is_public', true)
      .gte('created_at', startIso)
      .lt('created_at', endIso)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('stories')
      .select('id, content, metadata, created_at')
      .filter('metadata->>is_question', 'eq', 'true')
      .filter('metadata->>question_status', 'eq', 'answered')
      .eq('is_public', true)
      .gte('updated_at', startIso)
      .lt('updated_at', endIso)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(6),
    supabase
      .from('stories')
      .select('id, content, metadata, created_at')
      .filter('metadata->>is_note', 'eq', 'true')
      .eq('is_public', true)
      .gte('created_at', startIso)
      .lt('created_at', endIso)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const quotes = (quotesResult.data || []) as QuoteRow[]
  const stories = (storiesResult.data || []) as StoryRow[]
  const art = (artResult.data || []) as ArtRow[]
  const answered = (answeredResult.data || []) as StoryRow[]
  const notes = (notesResult.data || []) as StoryRow[]

  const total = quotes.length + stories.length + art.length + answered.length + notes.length

  // Top theme this month
  const themeCounts: Record<string, number> = {}
  for (const q of quotes) {
    if (q.theme) themeCounts[q.theme.toLowerCase()] = (themeCounts[q.theme.toLowerCase()] || 0) + 1
  }
  const topTheme = Object.entries(themeCounts).sort((a, b) => b[1] - a[1])[0]

  // Prev/next month nav
  const prev = new Date(start.getFullYear(), start.getMonth() - 1, 1)
  const next = new Date(start.getFullYear(), start.getMonth() + 1, 1)
  const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
  const nextKey = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
  const isCurrent = key === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero */}
      <section className="px-6 md:px-12 py-16 md:py-20" style={{ backgroundColor: C.ocean }}>
        <div className="max-w-5xl mx-auto">
          <Link
            href="/voices"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            ← Voices
          </Link>
          <div
            className="uppercase font-bold mt-8 mb-4"
            style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
          >
            {isCurrent ? 'In progress' : 'Archive'} · {total} contributions this month
          </div>
          <h1
            className="font-fraunces font-bold leading-tight text-white"
            style={{ fontSize: 'clamp(40px, 7vw, 80px)' }}
          >
            {label}.
          </h1>
          <p className="mt-6 leading-relaxed text-white/85 max-w-2xl" style={{ fontSize: 16 }}>
            What the Bwgcolman community has added this month — voices, art, questions
            answered, notes left, stories told. The annual report is a slice; this is
            the river.
          </p>

          {/* Month nav */}
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
            <Link
              href={`/voices/this-month?month=${prevKey}`}
              className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              ← {MONTH_NAMES[prev.getMonth()]} {prev.getFullYear()}
            </Link>
            {!isCurrent && (
              <Link
                href="/voices/this-month"
                className="px-4 py-2 rounded-full bg-starGold text-midnight hover:opacity-90 font-bold uppercase tracking-widest"
                style={{
                  backgroundColor: C.starGold,
                  color: C.midnight,
                  fontSize: 11,
                  letterSpacing: '0.2em',
                }}
              >
                This month
              </Link>
            )}
            {next <= new Date() && (
              <Link
                href={`/voices/this-month?month=${nextKey}`}
                className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                {MONTH_NAMES[next.getMonth()]} {next.getFullYear()} →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Counts + top theme */}
      <section className="px-6 md:px-12 py-12" style={{ backgroundColor: C.shell }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
          <CountCard label="Voices" count={quotes.length} icon={Mic} tint={C.ochre} />
          <CountCard label="Stories" count={stories.length} icon={BookOpen} tint={C.coral} />
          <CountCard label="Art" count={art.length} icon={ImageIcon} tint={C.mangrove} />
          <CountCard label="Q&A" count={answered.length} icon={HelpCircle} tint={C.reef} />
          <CountCard label="Notes" count={notes.length} icon={StickyNote} tint={C.starGold} />
        </div>
        {topTheme && (
          <p className="mt-8 text-center font-fraunces italic" style={{ color: C.earth, fontSize: 18 }}>
            Top theme this month:{' '}
            <Link
              href={`/voices/themes/${encodeURIComponent(topTheme[0])}`}
              className="underline capitalize"
              style={{ color: C.ochre }}
            >
              {topTheme[0]}
            </Link>{' '}
            <span className="text-sm" style={{ color: C.muted }}>· {topTheme[1]} mentions</span>
          </p>
        )}
      </section>

      {total === 0 && (
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-fraunces italic" style={{ color: C.driftwood, fontSize: 18 }}>
              Quiet month. {isCurrent ? 'Be the first to add to it.' : 'Nothing recorded this month.'}
            </p>
            {isCurrent && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <CTA href="/share-voice" label="Share a voice" />
                <CTA href="/share-art" label="Share artwork" />
                <CTA href="/voices/ask" label="Ask a question" />
                <CTA href="/share-note" label="Leave a note" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recent voices */}
      {quotes.length > 0 && (
        <Section eyebrow="New voices" tint={C.ochre} title="What people said.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {quotes.map((q) => (
              <article
                key={q.id}
                className="rounded-md p-5"
                style={{ backgroundColor: C.sand }}
              >
                <blockquote
                  className="font-fraunces italic leading-snug"
                  style={{ color: C.earth, fontSize: 17 }}
                >
                  &ldquo;{q.quote_text}&rdquo;
                </blockquote>
                <div className="mt-3 text-xs flex items-center gap-2" style={{ color: C.driftwood }}>
                  <span className="font-semibold" style={{ color: C.ocean }}>
                    {q.attribution || 'Community member'}
                  </span>
                  {q.theme && (
                    <>
                      <span>·</span>
                      <span className="capitalize">{q.theme}</span>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}

      {/* Recent art */}
      {art.length > 0 && (
        <Section eyebrow="New art" tint={C.mangrove} title="Approved this month." bgShell>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {art.map((a) => (
              <figure
                key={a.id}
                className="rounded-md overflow-hidden"
                style={{ backgroundColor: '#FBF8EE' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.public_url}
                  alt={a.title || ''}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <figcaption className="p-3">
                  {a.title && (
                    <div className="font-fraunces font-bold text-sm" style={{ color: C.ocean }}>
                      {a.title}
                    </div>
                  )}
                  <div className="text-xs mt-1" style={{ color: C.ochre, fontWeight: 600 }}>
                    {a.attribution || 'Anonymous'}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      {/* Recent answered Q&A */}
      {answered.length > 0 && (
        <Section eyebrow="Answered" tint={C.reef} title="Questions met.">
          <div className="flex flex-col gap-4">
            {answered.map((q) => {
              const answer = q.metadata?.answer as string | undefined
              const askerName = q.metadata?.anonymous
                ? 'Community member'
                : q.metadata?.asker_name || 'Community member'
              return (
                <article
                  key={q.id}
                  className="rounded-md p-5"
                  style={{ backgroundColor: C.shell }}
                >
                  <p className="font-fraunces italic" style={{ color: C.earth, fontSize: 17 }}>
                    &ldquo;{q.content}&rdquo;
                  </p>
                  <div className="mt-2 text-xs" style={{ color: C.muted }}>
                    {askerName}
                  </div>
                  {answer && (
                    <p
                      className="mt-3 pt-3 leading-relaxed"
                      style={{ color: C.earth, fontSize: 14, borderTop: `1px solid ${C.border}` }}
                    >
                      <span className="uppercase font-bold" style={{ color: C.ocean, fontSize: 10, letterSpacing: '0.2em' }}>
                        PICC team:{' '}
                      </span>
                      {answer}
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        </Section>
      )}

      {/* Recent notes */}
      {notes.length > 0 && (
        <Section eyebrow="Notes" tint={C.starGold} title="Half-thoughts." bgShell>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((n) => (
              <article
                key={n.id}
                className="rounded-md p-4"
                style={{ backgroundColor: C.sand }}
              >
                <p className="leading-relaxed" style={{ color: C.earth, fontSize: 14 }}>
                  {n.content}
                </p>
              </article>
            ))}
          </div>
        </Section>
      )}

      {/* Recent stories */}
      {stories.length > 0 && (
        <Section eyebrow="Stories told" tint={C.coral} title="In their own words.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.map((s) => (
              <article
                key={s.id}
                className="rounded-md p-5"
                style={{ backgroundColor: C.shell }}
              >
                <h3 className="font-fraunces font-bold leading-tight" style={{ color: C.ocean, fontSize: 18 }}>
                  {s.title || 'Untitled'}
                </h3>
                {s.content && (
                  <p className="mt-2 leading-relaxed line-clamp-3" style={{ color: C.driftwood, fontSize: 14 }}>
                    {s.content}
                  </p>
                )}
              </article>
            ))}
          </div>
        </Section>
      )}

      {/* Footer CTA */}
      <section className="px-6 md:px-12 py-16 md:py-20 text-center" style={{ backgroundColor: C.midnight }}>
        <div className="max-w-2xl mx-auto">
          <h2
            className="font-fraunces font-bold"
            style={{ color: C.starGold, fontSize: 'clamp(28px, 4.5vw, 42px)' }}
          >
            Add to the month.
          </h2>
          <p className="mt-4 text-white/85 leading-relaxed">
            Voices, art, questions, notes — every contribution shapes how next month
            looks.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <CTA href="/share-voice" label="Share a voice" filled />
            <CTA href="/share-art" label="Share artwork" />
            <CTA href="/voices/ask" label="Ask a question" />
            <CTA href="/share-note" label="Leave a note" />
          </div>
        </div>
      </section>
    </main>
  )
}

function CountCard({
  label,
  count,
  icon: Icon,
  tint,
}: {
  label: string
  count: number
  icon: React.ComponentType<{ className?: string }>
  tint: string
}) {
  return (
    <div className="bg-white rounded-md p-4 flex flex-col gap-1 border" style={{ borderColor: C.border }}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest font-bold" style={{ color: C.driftwood }}>
          {label}
        </span>
      </div>
      <span className="font-fraunces font-bold" style={{ color: tint, fontSize: 36 }}>
        {count}
      </span>
    </div>
  )
}

function Section({
  eyebrow,
  title,
  tint,
  children,
  bgShell,
}: {
  eyebrow: string
  title: string
  tint: string
  children: React.ReactNode
  bgShell?: boolean
}) {
  return (
    <section
      className="px-6 md:px-12 py-12 md:py-16"
      style={{ backgroundColor: bgShell ? C.shell : '#FBF8EE' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: tint, fontSize: 11, letterSpacing: '0.3em' }}
          >
            {eyebrow}
          </div>
          <h2
            className="font-fraunces font-bold leading-tight"
            style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 42px)' }}
          >
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  )
}

function CTA({ href, label, filled }: { href: string; label: string; filled?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-5 py-2.5 rounded-full font-bold uppercase tracking-widest hover:opacity-90 ${filled ? '' : 'border'}`}
      style={
        filled
          ? { backgroundColor: C.starGold, color: C.midnight, fontSize: 11, letterSpacing: '0.2em' }
          : { color: C.starGold, borderColor: C.starGold, fontSize: 11, letterSpacing: '0.2em' }
      }
    >
      {label}
    </Link>
  )
}
