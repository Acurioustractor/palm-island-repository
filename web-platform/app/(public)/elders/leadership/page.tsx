/**
 * /elders/leadership — what the Elders teach.
 *
 * Centralised page about Elder leadership — governance, kinship,
 * teaching, sovereignty. Pulls Elder voices (filtered, validated,
 * permission-cleared) and clusters them by theme. The visual
 * grammar deliberately slows down: sand bg, Caveat handwriting,
 * Lantern treatments, consent woven in.
 *
 * This is the canonical answer to: "what do the Elders teach PICC
 * about how to lead?"
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { getPhotosForSlot, type ELPhoto } from '@/lib/media/el-photos'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 1800

export const metadata = {
  title: 'What the Elders teach — Palm Island Community Company',
  description:
    'Governance, kinship, sovereignty — Elder leadership in the Bwgcolman way.',
}

interface ElderQuoteRow {
  id: string
  text: string | null
  speaker_name: string | null
  speaker_role: string | null
  theme: string | null
  category: string | null
  source_story_id: string | null
}

const GOVERNANCE_THEMES = ['governance', 'leadership', 'decisions', 'authority', 'self-determination']
const TEACHING_THEMES = ['knowledge', 'culture', 'language', 'kinship', 'teaching', 'tradition']
const COUNTRY_THEMES = ['country', 'land', 'sovereignty', 'connection', 'place']

function quotesForThemes(quotes: ElderQuoteRow[], themes: string[]): ElderQuoteRow[] {
  const wanted = themes.map((t) => t.toLowerCase())
  return quotes.filter((q) => {
    const t = (q.theme || q.category || '').toLowerCase()
    return wanted.includes(t) || wanted.some((w) => t.includes(w))
  })
}

export default async function EldersLeadershipPage() {
  const supabase = createServerSupabase()

  const [{ data: quotesData }, photos] = await Promise.all([
    supabase
      .from('elder_quotes')
      .select('id, text, speaker_name, speaker_role, theme, category, cultural_sensitivity, permission_level, source_story_id')
      .in('permission_level', ['public', 'community'])
      .neq('cultural_sensitivity', 'restricted')
      .limit(200),
    getPhotosForSlot('elders-on-country', 8),
  ])

  const quotes = (quotesData || []) as ElderQuoteRow[]

  // Cluster by theme
  const governance = quotesForThemes(quotes, GOVERNANCE_THEMES).slice(0, 6)
  const teaching = quotesForThemes(quotes, TEACHING_THEMES).slice(0, 6)
  const country = quotesForThemes(quotes, COUNTRY_THEMES).slice(0, 6)
  // Theme aggregation across all elder quotes (top 12)
  const themeCounts: Record<string, number> = {}
  for (const q of quotes) {
    const t = (q.theme || q.category || '').toLowerCase()
    if (t) themeCounts[t] = (themeCounts[t] || 0) + 1
  }
  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero — sand bg, contemplative */}
      <section
        className="px-6 md:px-12 py-20 md:py-28"
        style={{ backgroundColor: C.sand }}
      >
        <div className="max-w-4xl mx-auto">
          <Link
            href="/elders"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80"
            style={{ color: C.driftwood }}
          >
            ← Elders
          </Link>
          <div
            className="uppercase font-bold mt-8 mb-4"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Elder leadership · {quotes.length} voices · with consent
          </div>
          <h1
            className="font-fraunces font-bold leading-tight"
            style={{ color: C.ocean, fontSize: 'clamp(40px, 7vw, 80px)' }}
          >
            What the Elders teach.
          </h1>
          <p
            className="mt-8 font-fraunces italic leading-relaxed max-w-2xl"
            style={{ color: C.earth, fontSize: 'clamp(18px, 2.2vw, 24px)' }}
          >
            Governance, kinship, language, Country — the Elders carry the lessons
            PICC leads by. Every quote on this page was recorded with consent, validated
            through Empathy Ledger, and shared with the speaker&rsquo;s permission.
          </p>
          <div
            className="mt-6 font-caveat italic"
            style={{ color: C.ochre, fontSize: 22 }}
          >
            The Bwgcolman way — many tribes, one people.
          </div>
        </div>
      </section>

      {/* The hush — single Lantern-style featured quote (highest impact) */}
      {quotes[0] && (
        <section className="px-6 md:px-12 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="font-fraunces"
              style={{ color: C.turtleRed, fontSize: 64, lineHeight: 1, opacity: 0.6 }}
              aria-hidden
            >
              &ldquo;
            </div>
            <blockquote
              className="font-fraunces italic font-medium leading-snug mt-4"
              style={{ color: C.earth, fontSize: 'clamp(22px, 3vw, 36px)' }}
            >
              {quotes[0].text}
            </blockquote>
            <div
              className="mt-6 font-caveat italic"
              style={{ color: C.ochre, fontSize: 22 }}
            >
              — {quotes[0].speaker_name || 'Bwgcolman Elder'}
              {quotes[0].speaker_role && ` · ${quotes[0].speaker_role}`}
            </div>
            <div
              className="mt-8 mx-auto"
              style={{ width: 60, height: 1, backgroundColor: C.ochre, opacity: 0.5 }}
              aria-hidden
            />
            <div
              className="mt-6 uppercase"
              style={{ color: C.muted, fontSize: 10, letterSpacing: '0.3em' }}
            >
              Recorded with consent · Validated · Empathy Ledger
            </div>
          </div>
        </section>
      )}

      {/* Photos — Elders on Country */}
      {photos.length > 0 && (
        <section
          className="px-6 md:px-12 py-16 md:py-20"
          style={{ backgroundColor: C.shell }}
        >
          <div className="max-w-6xl mx-auto">
            <SectionEyebrow tint={C.ochre}>Elders on Country</SectionEyebrow>
            <SectionTitle>Where the teaching happens.</SectionTitle>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {photos.slice(0, 8).map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={p.url}
                  alt={p.alt_text || 'Elder on Country'}
                  className="w-full h-48 md:h-56 object-cover rounded-md"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Three thematic clusters: governance / teaching / country */}
      <ElderCluster
        eyebrow="How they lead"
        title="Governance, decisions, authority."
        intro="The Elders speak first when PICC has a hard call to make. These voices show what that looks like in practice."
        quotes={governance}
        tint={C.ocean}
      />

      <ElderCluster
        eyebrow="How they teach"
        title="Kinship, language, knowledge."
        intro="Cultural transmission is governance too — passing on names, names, places, ways of being."
        quotes={teaching}
        tint={C.ochre}
        bgVariant="sand"
      />

      <ElderCluster
        eyebrow="How they hold Country"
        title="Land, sovereignty, place."
        intro="The relationship to Palm Island and the broader saltwater country PICC sits within."
        quotes={country}
        tint={C.mangrove}
      />

      {/* Theme cloud — what Elders speak about */}
      {topThemes.length > 0 && (
        <section
          className="px-6 md:px-12 py-16 md:py-20"
          style={{ backgroundColor: C.midnight }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <SectionEyebrow tint={C.starGold}>What the Elders speak about</SectionEyebrow>
            <h2
              className="font-fraunces font-bold leading-tight mt-3 text-white"
              style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
            >
              {topThemes.length} themes. {quotes.length} voices.
            </h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 gap-y-4">
              {topThemes.map(([theme, count]) => {
                const size = 14 + Math.min(count, 20)
                return (
                  <Link
                    key={theme}
                    href={`/voices/themes/${encodeURIComponent(theme)}`}
                    className="capitalize hover:opacity-80 transition-opacity"
                    style={{
                      color: C.starGold,
                      fontSize: size,
                      fontFamily: 'Fraunces, serif',
                      fontWeight: 700,
                    }}
                  >
                    {theme}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA — back to wider voices */}
      <section
        className="px-6 md:px-12 py-16 md:py-20 text-center"
        style={{ backgroundColor: C.sand }}
      >
        <div className="max-w-xl mx-auto">
          <h2
            className="font-fraunces font-bold"
            style={{ color: C.ocean, fontSize: 'clamp(28px, 4.5vw, 42px)' }}
          >
            Listen further.
          </h2>
          <p className="mt-4 leading-relaxed" style={{ color: C.driftwood, fontSize: 16 }}>
            Every Elder voice belongs to a person. Visit a profile to read their full story,
            see their photos, and find which services they shape.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/voices"
              className="px-5 py-2.5 rounded-full font-bold uppercase tracking-widest hover:opacity-90"
              style={{
                backgroundColor: C.ochre,
                color: 'white',
                fontSize: 11,
                letterSpacing: '0.2em',
              }}
            >
              Voices wall →
            </Link>
            <Link
              href="/voices/pulse"
              className="px-5 py-2.5 rounded-full font-bold uppercase tracking-widest border hover:opacity-90"
              style={{
                color: C.ochre,
                borderColor: C.ochre,
                fontSize: 11,
                letterSpacing: '0.2em',
              }}
            >
              Community pulse →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function ElderCluster({
  eyebrow,
  title,
  intro,
  quotes,
  tint,
  bgVariant = 'paper',
}: {
  eyebrow: string
  title: string
  intro: string
  quotes: ElderQuoteRow[]
  tint: string
  bgVariant?: 'paper' | 'sand'
}) {
  if (quotes.length === 0) return null
  const bg = bgVariant === 'sand' ? C.sand : '#FBF8EE'
  return (
    <section className="px-6 md:px-12 py-16 md:py-20" style={{ backgroundColor: bg }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <SectionEyebrow tint={tint}>{eyebrow}</SectionEyebrow>
          <SectionTitle>{title}</SectionTitle>
          <p
            className="mt-4 leading-relaxed mx-auto"
            style={{ color: C.driftwood, fontSize: 15, maxWidth: 580 }}
          >
            {intro}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quotes.map((q) => (
            <article
              key={q.id}
              className="rounded-md p-6 flex flex-col gap-4"
              style={{ backgroundColor: C.shell, borderLeft: `3px solid ${tint}` }}
            >
              <blockquote
                className="font-fraunces italic leading-snug"
                style={{ color: C.earth, fontSize: 18 }}
              >
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <div className="flex items-center justify-between gap-3 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
                <div>
                  <div className="font-semibold" style={{ color: C.ocean, fontSize: 13 }}>
                    {q.speaker_name || 'Bwgcolman Elder'}
                  </div>
                  {q.speaker_role && (
                    <div className="text-xs italic" style={{ color: C.driftwood }}>
                      {q.speaker_role}
                    </div>
                  )}
                </div>
                <span className="uppercase" style={{ color: C.muted, fontSize: 9, letterSpacing: '0.2em' }}>
                  Elder · with consent
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
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
      style={{ color: C.ocean, fontSize: 'clamp(28px, 4.5vw, 48px)' }}
    >
      {children}
    </h2>
  )
}
