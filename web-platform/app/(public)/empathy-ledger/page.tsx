/**
 * The Empathy Ledger — Public Showcase
 *
 * A live demonstration of the sovereign data system powering PICC.
 * Shows what AI analysis looks like at scale: themes, voices, transcripts,
 * cultural protocols, and the depth of meaning extracted from every story.
 */

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  Sparkles,
  Mic,
  BookOpen,
  Shield,
  Quote,
  TrendingUp,
  Users,
  Globe,
  ArrowRight,
  CheckCircle2,
  Brain,
  Heart,
  Zap,
} from 'lucide-react'
import {
  getELQuotes,
  getELTranscripts,
  getELStats,
  groupQuotesByAuthor,
  PICC_ORG_ID,
} from '@/lib/empathy-ledger/el-server'

const EL_URL = 'https://yvnuayzslukamizrlhwb.supabase.co'

export const metadata = {
  title: 'The Empathy Ledger — Sovereign Voice Analysis | PICC',
  description:
    'How Palm Island Community Company captures, analyses, and protects 600+ community voices through sovereign data infrastructure. The Third Reality in practice.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 300

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getShowcaseData() {
  const elKey =
    process.env.EMPATHY_LEDGER_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!elKey) return null

  const client = createClient(EL_URL, elKey)

  const [quotes, transcripts, stats, projects] = await Promise.all([
    getELQuotes({ limit: 1500 }),
    getELTranscripts({ limit: 200, analyzedOnly: true }),
    getELStats(),
    client
      .from('projects')
      .select('id, name, slug')
      .eq('organization_id', PICC_ORG_ID),
  ])

  // Theme frequency analysis
  const themeMap = new Map<string, number>()
  for (const q of quotes) {
    for (const t of q.themes || []) {
      themeMap.set(t, (themeMap.get(t) || 0) + 1)
    }
  }
  const topThemes = Array.from(themeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([name, count]) => ({ name, count }))

  // Author leaderboard
  const grouped = groupQuotesByAuthor(quotes)
  const topAuthors = Array.from(grouped.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 12)
    .map(([name, qs]) => ({
      name,
      count: qs.length,
      topQuote: qs.sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))[0],
    }))

  // Sentiment / emotional tone breakdown
  const sentimentMap = new Map<string, number>()
  for (const q of quotes) {
    const tone = q.sentiment || 'unspecified'
    sentimentMap.set(tone, (sentimentMap.get(tone) || 0) + 1)
  }
  const positiveCount = Array.from(sentimentMap.entries())
    .filter(([k]) =>
      /positive|hope|inspiring|joy|grateful|warm|proud|reverent|celebratory/i.test(k)
    )
    .reduce((sum, [, v]) => sum + v, 0)

  // Category breakdown
  const categoryMap = new Map<string, number>()
  for (const q of quotes) {
    if (q.category) categoryMap.set(q.category, (categoryMap.get(q.category) || 0) + 1)
  }
  const topCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  // Pick 3 transcripts with rich analysis to feature
  const featuredTranscripts = transcripts
    .filter(
      (t) =>
        t.ai_summary &&
        t.ai_summary.length > 100 &&
        Array.isArray(t.themes) &&
        t.themes.length > 2
    )
    .slice(0, 3)

  // Highest-impact quotes for the hero
  const heroQuotes = quotes
    .filter(
      (q) =>
        q.quote_text &&
        q.quote_text.length > 50 &&
        q.quote_text.length < 220 &&
        (q.impact_score || 0) >= 70
    )
    .slice(0, 3)

  return {
    stats,
    quotes,
    transcripts,
    projects: projects.data || [],
    topThemes,
    topAuthors,
    topCategories,
    sentimentMap,
    positiveCount,
    featuredTranscripts,
    heroQuotes,
    totalAnalyzed: transcripts.length,
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function EmpathyLedgerShowcase() {
  const data = await getShowcaseData()

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <p className="text-stone-500">Empathy Ledger unavailable.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* ─── HERO ─── */}
      <section className="relative px-6 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B4F6C]/5 via-transparent to-[#C8963E]/5" />
        <div className="relative max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            The Empathy Ledger · A Curious Tractor × PICC
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-stone-800 leading-[1.05] italic mb-8">
            Every voice,<br />sovereign and seen.
          </h1>
          <p className="text-xl text-stone-600 max-w-3xl leading-relaxed mb-12">
            The Empathy Ledger is PICC's sovereign data infrastructure. It captures
            community voices, analyses them with AI, protects them with cultural protocols,
            and gives community absolute control over how their stories are shared.
            This is what it looks like in practice.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-stone-200">
            <div>
              <div className="font-serif text-5xl text-[#0B4F6C]">{data.stats.quotes}</div>
              <div className="text-xs text-stone-400 mt-2 tracking-wide uppercase">Voices analysed</div>
            </div>
            <div>
              <div className="font-serif text-5xl text-[#0B4F6C]">{data.stats.transcripts}</div>
              <div className="text-xs text-stone-400 mt-2 tracking-wide uppercase">Transcripts</div>
            </div>
            <div>
              <div className="font-serif text-5xl text-[#0B4F6C]">{data.topAuthors.length > 0 ? Array.from(groupQuotesByAuthor(data.quotes).keys()).length : 0}</div>
              <div className="text-xs text-stone-400 mt-2 tracking-wide uppercase">Storytellers</div>
            </div>
            <div>
              <div className="font-serif text-5xl text-picc-ochre">{data.topThemes.length}+</div>
              <div className="text-xs text-stone-400 mt-2 tracking-wide uppercase">Themes</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS — THE PIPELINE ─── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            The pipeline
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-3">
            How a community voice becomes sovereign data
          </h2>
          <p className="text-stone-500 mb-12 max-w-2xl">
            Every interview moves through five stages — from raw voice to verified,
            culturally-protected, AI-analysed insight that the community owns.
          </p>

          <div className="grid md:grid-cols-5 gap-6 relative">
            {[
              { num: '01', icon: Mic, title: 'Capture', desc: 'Audio or video interview, with explicit consent' },
              { num: '02', icon: BookOpen, title: 'Transcribe', desc: 'Full text transcript stored sovereignly' },
              { num: '03', icon: Brain, title: 'Analyse', desc: 'MiniMax AI extracts themes, sentiment, impact' },
              { num: '04', icon: Shield, title: 'Protect', desc: 'PCAP protocols, elder approval, cultural gates' },
              { num: '05', icon: Sparkles, title: 'Share', desc: 'Surfaced on PICC pages with provenance' },
            ].map((step) => (
              <div key={step.num} className="relative">
                <div className="text-xs font-mono text-stone-300 mb-3">{step.num}</div>
                <div className="w-12 h-12 rounded-2xl bg-picc-ochre/10 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-picc-ochre" />
                </div>
                <h3 className="font-semibold text-stone-800 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE LEDGER STATE — embedded from EL v2 ─── */}
      <section className="px-6 py-20 bg-[#FAF8F5] border-t border-stone-200">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            The ledger right now
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-3">
            Live, never frozen
          </h2>
          <p className="text-stone-500 mb-8 max-w-2xl">
            Counts below come straight from the Empathy Ledger over a secure
            channel. They refresh on every page load. No caching, no spin.
            When a new transcript clears the anti-fabrication grader, the
            number ticks up.
          </p>
          {(() => {
            const elBase = process.env.NEXT_PUBLIC_EL_V2_URL?.replace(/\/$/, '') || 'https://empathy-ledger-v2.vercel.app'
            return (
              <div className="bg-white border border-stone-200 rounded-md overflow-hidden shadow-sm">
                <iframe
                  src={`${elBase}/embed/palm-island-community-company/counter?tone=cream`}
                  width="100%"
                  height={210}
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  title="PICC live counts · Empathy Ledger"
                />
              </div>
            )
          })()}
          <p className="text-xs text-stone-400 mt-4 italic">
            Storytellers · voices that have passed an anti-fabrication grader · themes carried in their own words · total mentions across the corpus.
          </p>
        </div>
      </section>

      {/* ─── HERO QUOTES — show what's been captured ─── */}
      {data.heroQuotes.length > 0 && (
        <section className="px-6 py-24 bg-gradient-to-br from-[#0B4F6C] via-[#0a3f57] to-[#082a3a] text-white">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-12 text-center">
              Voices in the ledger
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {data.heroQuotes.map((q, i) => (
                <div key={i} className="relative">
                  <div className="text-picc-ochre/30 text-7xl font-serif leading-none mb-2">&ldquo;</div>
                  <blockquote className="font-serif italic text-lg leading-relaxed -mt-3 mb-4">
                    {q.quote_text}
                  </blockquote>
                  <p className="text-sm font-semibold text-picc-ochre">— {q.author_name || 'Community Member'}</p>
                  {q.themes && q.themes[0] && (
                    <p className="text-xs text-white/40 mt-1 capitalize">
                      {q.themes[0].replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── TRANSCRIPT DEEP DIVE — show analysis depth ─── */}
      {data.featuredTranscripts.length > 0 && (
        <section className="px-6 py-24 bg-white">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
              Analysis in action
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-3">
              What MiniMax AI extracts from every interview
            </h2>
            <p className="text-stone-500 mb-12 max-w-2xl">
              Here are real PICC transcripts analysed by the Empathy Ledger.
              Each one yields a summary, themes, key quotes, sentiment, and impact dimensions.
            </p>

            <div className="space-y-8">
              {data.featuredTranscripts.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-stone-200 bg-[#FAF8F5] p-8 md:p-10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-serif text-2xl text-stone-800 mb-2">
                        {t.title || 'Untitled Interview'}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-stone-400">
                        <span>{t.word_count?.toLocaleString() || '?'} words</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          Analysed by {t.ai_model_version || 'MiniMax-M2.7'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {t.ai_summary && (
                    <div className="mb-6">
                      <p className="text-xs font-semibold tracking-wider uppercase text-picc-ochre mb-2">
                        Summary
                      </p>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        {t.ai_summary.substring(0, 380)}
                        {t.ai_summary.length > 380 && '...'}
                      </p>
                    </div>
                  )}

                  {t.themes && t.themes.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-semibold tracking-wider uppercase text-picc-ochre mb-2">
                        Themes extracted
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {t.themes.slice(0, 8).map((theme) => (
                          <span
                            key={theme}
                            className="px-3 py-1 rounded-full bg-picc-ochre/10 text-picc-ochre text-xs font-medium capitalize"
                          >
                            {theme.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {t.key_quotes && t.key_quotes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold tracking-wider uppercase text-picc-ochre mb-2">
                        Key quotes ({t.key_quotes.length} extracted)
                      </p>
                      <ul className="space-y-2">
                        {t.key_quotes.slice(0, 2).map((q, i) => (
                          <li
                            key={i}
                            className="text-sm font-serif italic text-stone-600 pl-4 border-l-2 border-picc-ochre/40"
                          >
                            &ldquo;{q.length > 200 ? q.substring(0, 200) + '...' : q}&rdquo;
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── THEME LANDSCAPE ─── */}
      <section className="px-6 py-24 bg-[#F0EEEB]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            Theme landscape
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-3">
            What the community is talking about
          </h2>
          <p className="text-stone-500 mb-12 max-w-2xl">
            {data.topThemes.length}+ distinct themes have emerged from {data.stats.quotes} voices.
            Size shows frequency. This is the community telling its own story.
          </p>

          <div className="flex flex-wrap gap-3 items-baseline">
            {data.topThemes.slice(0, 30).map(({ name, count }) => {
              const size = Math.min(32, Math.max(12, 12 + count * 1.5))
              const opacity = Math.min(1, 0.5 + count / 20)
              return (
                <span
                  key={name}
                  className="px-4 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 capitalize"
                  style={{ fontSize: size, opacity }}
                >
                  {name.replace(/_/g, ' ')}
                  <span className="ml-2 text-stone-300 text-xs">{count}</span>
                </span>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── STORYTELLER LEADERBOARD ─── */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            The voices
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-3">
            Who speaks in the ledger
          </h2>
          <p className="text-stone-500 mb-12 max-w-2xl">
            Every voice belongs to its speaker. PICC storytellers control how their stories
            are shared, who can access them, and how they appear in reports.
          </p>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            {data.topAuthors.map((author, i) => (
              <div
                key={author.name}
                className="flex items-baseline justify-between border-b border-stone-200 pb-3"
              >
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="text-xs text-stone-300 font-mono w-6">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-stone-800 font-medium truncate">{author.name}</span>
                </div>
                <span className="text-sm text-picc-ochre flex-shrink-0">{author.count} quotes</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT MAKES THIS DIFFERENT ─── */}
      <section className="px-6 py-24 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            What makes this different
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-12">
            Sovereignty isn&apos;t a feature. It&apos;s the architecture.
          </h2>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-12">
            {[
              {
                icon: Shield,
                title: 'Community owns the database',
                desc: 'The Empathy Ledger runs on community-controlled infrastructure. Not a vendor cloud. Not a research institution. PICC owns the database, the model, and the narrative.',
              },
              {
                icon: CheckCircle2,
                title: 'Consent is permanent and revocable',
                desc: 'Every voice carries explicit consent metadata. Storytellers can change their mind at any time and content is honoured immediately — across all surfaces, reports, and AI responses.',
              },
              {
                icon: Brain,
                title: 'AI analyses voices, not extracts them',
                desc: 'MiniMax AI extracts themes, sentiment, and impact from each voice — but the voice stays whole. No paraphrasing, no rewording. The community speaks for itself.',
              },
              {
                icon: Users,
                title: 'Elders hold cultural authority',
                desc: 'Sacred or sensitive content requires elder approval before sharing. The system mathematically enforces what the community decides is theirs alone.',
              },
              {
                icon: TrendingUp,
                title: 'Annual reports write themselves',
                desc: 'Instead of external consultants writing PICC&rsquo;s story, reports are generated from community voices in the ledger. Every claim has a person behind it.',
              },
              {
                icon: Globe,
                title: 'Built to be replicated',
                desc: 'The Empathy Ledger isn&rsquo;t just for PICC. It&rsquo;s a model for how every community-controlled organisation can own its data and tell its own story.',
              },
            ].map((principle) => (
              <div key={principle.title} className="flex gap-5">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-picc-ochre/15 flex items-center justify-center">
                    <principle.icon className="w-5 h-5 text-picc-ochre" />
                  </div>
                </div>
                <div>
                  <h3 className="font-serif text-xl text-stone-800 mb-2">{principle.title}</h3>
                  <p className="text-stone-500 leading-relaxed text-sm">{principle.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHERE THIS SHOWS UP ─── */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            See it across the platform
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-3">
            The Empathy Ledger is everywhere
          </h2>
          <p className="text-stone-500 mb-12 max-w-2xl">
            Every page on the PICC platform now reads from the sovereign archive.
            Voices appear contextually, with attribution, with consent, with provenance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { href: '/', label: 'Home', sub: '6 voices in the hero band' },
              { href: '/services', label: 'Services', sub: '1 quote per service card' },
              { href: '/elders', label: 'Elders', sub: 'Each elder linked to their voice library' },
              { href: '/stories', label: 'Stories', sub: 'Top 8 storytellers showcased' },
              { href: '/impact', label: 'Impact', sub: 'Voices wrapped around the metrics' },
              { href: '/innovation', label: 'Innovation', sub: 'Voices of community innovation' },
              { href: '/20-years', label: '20 Years', sub: "Rachel's vision quote in full bleed" },
              { href: '/20-years/strategy', label: 'Strategy 2027', sub: 'The Sovereignty of Care deck' },
              { href: '/picc/pcap', label: 'Data Sovereignty', sub: 'PCAP dashboard' },
              { href: '/chat', label: 'Ask Palm AI', sub: 'RAG queries the ledger' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between p-5 rounded-xl border border-stone-200 hover:border-picc-ochre transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold text-stone-800 group-hover:text-picc-ochre transition-colors">
                    {link.label}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">{link.sub}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-picc-ochre transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <section className="px-6 py-20 bg-[#2D2319] text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
          A Curious Tractor × Palm Island Community Company
        </p>
        <h3 className="font-serif italic text-3xl text-white mb-4">
          The Empathy Ledger
        </h3>
        <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
          Sovereign data infrastructure for community-controlled organisations.
          Built for PICC. Designed to be replicated.
        </p>
      </section>
    </div>
  )
}
