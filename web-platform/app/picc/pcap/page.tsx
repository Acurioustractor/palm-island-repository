import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Shield, Eye, Lock, CheckCircle2, ArrowRight, Mic, BookOpen, Users } from 'lucide-react'

const EL_URL = 'https://yvnuayzslukamizrlhwb.supabase.co'
const PICC_ORG_ID = '084f851c-72e0-41fb-b5ba-f3088f44862d'

export const metadata = {
  title: 'The Sovereignty of Care — PICC owns its story',
  description: 'PCAP — Protection, Consent, Access & Possession. The Empathy Ledger powers community-owned data sovereignty for Palm Island Community Company.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 300

// ---------------------------------------------------------------------------
// Data fetching from Empathy Ledger
// ---------------------------------------------------------------------------

async function getELData() {
  const elKey = process.env.EMPATHY_LEDGER_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!elKey) return null

  // Also pull PICC services from PICC Supabase
  const piccUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const piccKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const piccSupabase = createClient(piccUrl, piccKey)
  const { data: piccServices } = await piccSupabase
    .from('organization_services')
    .select('name, slug, description')
    .order('name')

  const supabase = createClient(EL_URL, elKey)

  const [
    quotesRes,
    transcriptsRes,
    storiesRes,
    storytellersRes,
    projectsRes,
    galleriesRes,
    mediaRes,
  ] = await Promise.all([
    supabase
      .from('extracted_quotes')
      .select('id, quote_text, author_name, themes, sentiment, impact_score, approval_status, source_id, project_id', { count: 'exact' })
      .eq('organization_id', PICC_ORG_ID)
      .order('impact_score', { ascending: false })
      .limit(2000),
    supabase
      .from('transcripts')
      .select('id, title, ai_processing_status, word_count, themes, ai_summary, storyteller_id, project_id', { count: 'exact' })
      .eq('organization_id', PICC_ORG_ID)
      .limit(500),
    supabase
      .from('stories')
      .select('id, title, status, cultural_sensitivity_level, requires_elder_review, elder_review_status', { count: 'exact' })
      .eq('organization_id', PICC_ORG_ID)
      .limit(500),
    supabase
      .from('storytellers')
      .select('id, display_name, profile_id, location')
      .ilike('location', '%palm%')
      .limit(200),
    supabase
      .from('projects')
      .select('id, name, slug')
      .eq('organization_id', PICC_ORG_ID),
    supabase
      .from('galleries')
      .select('id, title', { count: 'exact' })
      .eq('organization_id', PICC_ORG_ID),
    supabase
      .from('media_assets')
      .select('id, cultural_sensitivity_level, consent_obtained, elder_approved', { count: 'exact' })
      .eq('organization_id', PICC_ORG_ID)
      .limit(3000),
  ])

  return {
    quotes: quotesRes.data || [],
    quotesCount: quotesRes.count || 0,
    transcripts: transcriptsRes.data || [],
    transcriptsCount: transcriptsRes.count || 0,
    stories: storiesRes.data || [],
    storiesCount: storiesRes.count || 0,
    storytellers: storytellersRes.data || [],
    projects: projectsRes.data || [],
    galleries: galleriesRes.data || [],
    galleriesCount: galleriesRes.count || 0,
    media: mediaRes.data || [],
    mediaCount: mediaRes.count || 0,
    piccServices: piccServices || [],
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PCAPPage() {
  const data = await getELData()

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <p className="text-stone-500">Empathy Ledger connection unavailable.</p>
      </div>
    )
  }

  // Compute storyteller leaderboard — normalize anonymous voices
  const quotesByAuthor = new Map<string, number>()
  for (const q of data.quotes) {
    const raw = (q.author_name || '').trim()
    const name = !raw || raw.toLowerCase() === 'unknown' ? 'Community Member' : raw
    quotesByAuthor.set(name, (quotesByAuthor.get(name) || 0) + 1)
  }
  const topStorytellers = Array.from(quotesByAuthor.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  // Compute theme distribution
  const themeCount = new Map<string, number>()
  for (const q of data.quotes) {
    for (const t of (q.themes || [])) {
      themeCount.set(t, (themeCount.get(t) || 0) + 1)
    }
  }
  const topThemes = Array.from(themeCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)

  // Approval status
  const approved = data.quotes.filter(q => q.approval_status === 'approved').length
  const pending = data.quotes.filter(q => q.approval_status === 'pending').length

  // Transcript analysis status
  const analyzed = data.transcripts.filter(t => t.ai_processing_status === 'analyzed').length

  // Highlight quote — Rachel
  const heroQuote = data.quotes.find(q =>
    q.author_name === 'Rachel Atkinson' && (q.quote_text || '').includes('communities')
  )

  return (
    <div className="min-h-screen bg-[#FAF8F5]">

      {/* ─── HERO ─── */}
      <section className="relative px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            PCAP · Data Sovereignty
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-stone-800 leading-[1.1] italic mb-8">
            The community owns its story.
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl leading-relaxed mb-12">
            For 50 years Palm Island was researched, reported on, and represented by outsiders.
            Today PICC owns the narrative. {data.quotesCount} community voices captured by community,
            for community, governed by community — through the Empathy Ledger.
          </p>

          {/* Big numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-stone-200">
            <div>
              <div className="font-serif text-5xl text-[#0B4F6C]">{data.quotesCount}</div>
              <div className="text-xs text-stone-400 mt-2 tracking-wide">Community voices</div>
            </div>
            <div>
              <div className="font-serif text-5xl text-[#0B4F6C]">{data.transcriptsCount}</div>
              <div className="text-xs text-stone-400 mt-2 tracking-wide">Transcripts</div>
            </div>
            <div>
              <div className="font-serif text-5xl text-[#0B4F6C]">{data.mediaCount.toLocaleString()}</div>
              <div className="text-xs text-stone-400 mt-2 tracking-wide">Media assets</div>
            </div>
            <div>
              <div className="font-serif text-5xl text-picc-ochre">100%</div>
              <div className="text-xs text-stone-400 mt-2 tracking-wide">Community-controlled</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HERO QUOTE ─── */}
      {heroQuote && (
        <section className="px-6 py-20" style={{ backgroundColor: '#0B4F6C' }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-picc-ochre mb-6">
              The principle
            </p>
            <blockquote className="font-serif italic text-2xl md:text-3xl text-white leading-relaxed mb-4">
              &ldquo;{heroQuote.quote_text}&rdquo;
            </blockquote>
            <p className="text-white/60 text-sm">— {heroQuote.author_name}</p>
          </div>
        </section>
      )}

      {/* ─── STORYTELLERS ─── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            The voices
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-3">
            Every voice belongs to its speaker
          </h2>
          <p className="text-stone-500 mb-12 max-w-2xl">
            {data.storytellers.length}+ Palm Island storytellers have contributed.
            Each person controls how their voice is shared, with whom, and when.
          </p>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            {topStorytellers.map(([name, count], i) => (
              <div key={name} className="flex items-baseline justify-between border-b border-stone-200 pb-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs text-stone-300 font-mono w-6">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-stone-800 font-medium">{name}</span>
                </div>
                <span className="text-sm text-picc-ochre">{count} quotes</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ANALYSIS PIPELINE ─── */}
      <section className="px-6 py-20 bg-[#F0EEEB]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            The pipeline
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-3">
            From voice to sovereign data
          </h2>
          <p className="text-stone-500 mb-12 max-w-2xl">
            Every transcript is analyzed by MiniMax AI, themes extracted, quotes verified,
            and stored in the Empathy Ledger with full provenance.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-stone-200">
              <Mic className="w-5 h-5 text-picc-ochre mb-4" />
              <div className="text-3xl font-serif text-stone-800">{data.transcriptsCount}</div>
              <div className="text-sm text-stone-500 mt-1">Transcripts captured</div>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-stone-200">
              <CheckCircle2 className="w-5 h-5 text-green-600 mb-4" />
              <div className="text-3xl font-serif text-stone-800">{analyzed}</div>
              <div className="text-sm text-stone-500 mt-1">AI-analyzed</div>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-stone-200">
              <BookOpen className="w-5 h-5 text-[#0B4F6C] mb-4" />
              <div className="text-3xl font-serif text-stone-800">{data.quotesCount}</div>
              <div className="text-sm text-stone-500 mt-1">Quotes extracted</div>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-stone-200">
              <Shield className="w-5 h-5 text-picc-ochre mb-4" />
              <div className="text-3xl font-serif text-stone-800">{themeCount.size}</div>
              <div className="text-sm text-stone-500 mt-1">Distinct themes</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THEMES ─── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            What community talks about
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-12">
            Themes emerging from the voices
          </h2>

          <div className="flex flex-wrap gap-3">
            {topThemes.map(([theme, count]) => {
              const size = Math.min(28, Math.max(12, 12 + count / 2))
              return (
                <div
                  key={theme}
                  className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-700"
                  style={{ fontSize: size }}
                >
                  <span className="font-medium">{theme}</span>
                  <span className="ml-2 text-stone-400 text-xs">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="px-6 py-20 bg-[#F0EEEB]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            Sovereignty in action
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-3">
            {data.piccServices.length} community-controlled services
          </h2>
          <p className="text-stone-500 mb-12 max-w-2xl">
            From First 1,000 Days through Elder Support — every PICC service operates
            under community governance with full data sovereignty.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.piccServices.map((s: any) => (
              <div
                key={s.slug}
                className="p-5 rounded-xl bg-white border border-stone-200 text-sm font-medium text-stone-700 hover:border-picc-ochre transition-colors"
              >
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PCAP PRINCIPLES ─── */}
      <section className="px-6 py-24" style={{ backgroundColor: '#0B4F6C' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            PCAP
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-3">
            Four principles. One commitment.
          </h2>
          <p className="text-white/60 mb-16 max-w-2xl">
            Protection. Consent. Access. Possession. PCAP is not compliance —
            it is self-determination encoded into the platform itself.
          </p>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-12">
            {[
              {
                letter: 'P',
                name: 'Protection',
                desc: 'Cultural knowledge and sensitive content is flagged, gated, and requires elder approval before sharing. Sacred stories never leave community control.',
                icon: Shield,
              },
              {
                letter: 'C',
                name: 'Consent',
                desc: 'Every quote, story, and interview tracks explicit consent status. The Empathy Ledger refuses to share content without validated permission.',
                icon: CheckCircle2,
              },
              {
                letter: 'A',
                name: 'Access',
                desc: 'The community decides who sees what — public, community-only, or restricted. Permission flows from speaker to listener, not the other way around.',
                icon: Eye,
              },
              {
                letter: 'P',
                name: 'Possession',
                desc: 'All data lives in community-controlled infrastructure. The Empathy Ledger ensures the community owns the database, the model, and the narrative.',
                icon: Lock,
              },
            ].map((p) => (
              <div key={p.name} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-picc-ochre/15 flex items-center justify-center">
                    <span className="font-serif text-3xl text-picc-ochre">{p.letter}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-white mb-2">{p.name}</h3>
                  <p className="text-white/60 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HISTORY ARC ─── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            The arc
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-12">
            From extraction to ownership
          </h2>

          <div className="space-y-0">
            {[
              {
                year: '1918',
                title: 'Hull River',
                desc: 'Cyclone destroys the mission. Survivors are forcibly relocated to Palm Island.',
              },
              {
                year: '1957',
                title: 'The Strike',
                desc: 'Palm Island workers strike against the Aborigines Protection Act. Seven men exiled.',
              },
              {
                year: '2007',
                title: 'PICC founded',
                desc: 'Tri-partisan initiative. Government, Council, and community begin building a new model.',
              },
              {
                year: '2021',
                title: 'Community control',
                desc: 'PICC becomes 100% Aboriginal Community Controlled. Government transfers shareholding.',
              },
              {
                year: '2023',
                title: 'Bwgcolman Way',
                desc: 'First ACCO in Queensland granted Delegated Authority for child protection. $107.8M over four years.',
              },
              {
                year: '2026',
                title: 'Sovereign data',
                desc: `${data.quotesCount} community voices captured in the Empathy Ledger. PCAP enforcement is live.`,
                active: true,
              },
              {
                year: '2027',
                title: '20th anniversary',
                desc: 'PICC celebrates 20 years as the most innovative community-controlled organisation in Australia.',
              },
            ].map((era) => (
              <div
                key={era.year}
                className={`grid grid-cols-[100px_1fr] gap-8 py-6 border-t ${
                  era.active ? 'border-picc-ochre bg-picc-ochre/5 -mx-4 px-4' : 'border-stone-200'
                }`}
              >
                <div className={`font-serif text-3xl ${era.active ? 'text-picc-ochre' : 'text-stone-300'}`}>
                  {era.year}
                </div>
                <div>
                  <h3 className={`font-semibold mb-1 ${era.active ? 'text-stone-900' : 'text-stone-700'}`}>
                    {era.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{era.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 py-20 bg-[#F0EEEB]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            Explore the platform
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-12">
            Sovereignty in practice
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { href: '/elders', label: 'Our Elders', sub: '8 voices' },
              { href: '/stories', label: 'Our Stories', sub: '92 stories' },
              { href: '/picc/elders-room', label: 'Elders Room', sub: 'Elder-controlled' },
              { href: '/picc/reports/builder', label: 'Report Builder', sub: 'Voice-led reports' },
              { href: '/20-years/strategy', label: 'Strategy 2027', sub: 'Five pillars' },
              { href: '/chat', label: 'Ask Palm AI', sub: 'Community knowledge' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group p-5 rounded-xl bg-white border border-stone-200 hover:border-picc-ochre transition-colors flex items-center justify-between"
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
      <section className="px-6 py-16 bg-[#2D2319] text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
          Powered by
        </p>
        <h3 className="font-serif italic text-2xl text-white mb-2">The Empathy Ledger</h3>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          Sovereign data infrastructure for community-controlled organisations.
          Built in partnership with A Curious Tractor.
        </p>
      </section>
    </div>
  )
}
