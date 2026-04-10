/**
 * Bwgcolman Way — public case study page
 *
 * The 20-year anchor story. Experience #2 from the master brief
 * (vault doc #7). Pulls live from PICC Supabase:
 *   - The story body from `stories` (the canonical PICC voice)
 *   - The service metadata from `organization_services` (funding,
 *     blueprint, legislation)
 *   - The governance achievements arc from `governance_achievements`
 *   - The connected services (Safe House, Family Care, etc) from
 *     `organization_services`
 *
 * Public route at /bwgcolman. Matches the /elders, /20-years pattern.
 * Honours cultural protocol — only published, public-access stories.
 */

import { createServerSupabase } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Quote,
  Users,
  Heart,
  Shield,
  Scale,
  Calendar,
  ArrowRight,
  BookOpen,
  Sparkles,
  Award,
} from 'lucide-react'

export const metadata = {
  title: 'Bwgcolman Way — Empowered and Resilient | Palm Island Community Company',
  description: 'Bwgcolman means "many tribes, one people." PICC is the first ATSICCO in Queensland granted Delegated Authority for child protection. Decades in the making.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 300

interface Story {
  id: string
  title: string
  content: string | null
  quote_text: string | null
  featured_image_url: string | null
  storyteller_name: string | null
}

interface ServiceMeta {
  metadata: {
    funding?: string
    launched?: string
    blueprint?: string
    milestone?: string
    legislation?: string
    staff_count?: number
  } | null
  description: string | null
}

interface GovernanceItem {
  achievement_text: string
  fiscal_year: number | null
  category: string | null
}

interface ConnectedService {
  slug: string
  name: string
  description: string | null
}

export default async function BwgcolmanPage() {
  const supabase = createServerSupabase()

  // Get the canonical story
  const { data: storyData } = await supabase
    .from('stories')
    .select('id, title, content, quote_text, featured_image_url, storyteller:profiles(full_name)')
    .ilike('title', '%bwgcolman way%')
    .eq('status', 'published')
    .eq('access_level', 'public')
    .limit(1)
    .maybeSingle()

  const story: Story | null = storyData
    ? {
        id: storyData.id,
        title: storyData.title,
        content: storyData.content,
        quote_text: storyData.quote_text,
        featured_image_url: storyData.featured_image_url,
        storyteller_name:
          (Array.isArray(storyData.storyteller)
            ? (storyData.storyteller[0] as any)?.full_name
            : (storyData.storyteller as any)?.full_name) || null,
      }
    : null

  // Get service metadata
  const { data: serviceData } = await supabase
    .from('organization_services')
    .select('metadata, description')
    .eq('slug', 'bwgcolman-way')
    .maybeSingle()

  const service: ServiceMeta | null = serviceData as any

  // Get the governance achievements arc
  const { data: govData } = await supabase
    .from('governance_achievements')
    .select('achievement_text, fiscal_year, category')
    .or('achievement_text.ilike.%delegated authority%,achievement_text.ilike.%bwgcolman way%,achievement_text.ilike.%community-controlled%,achievement_text.ilike.%PINCL%')
    .order('fiscal_year', { ascending: true, nullsFirst: false })

  const governance: GovernanceItem[] = (govData || []) as GovernanceItem[]

  // Get connected services
  const { data: connectedData } = await supabase
    .from('organization_services')
    .select('slug, name, description')
    .in('slug', [
      'safe-house',
      'family-care-service',
      'family-participation-program',
      'children-and-family-centre',
      'sewb-service',
      'bwgcolman-healing',
    ])
    .eq('is_active', true)
    .order('name')

  const connected: ConnectedService[] = (connectedData || []) as ConnectedService[]

  // Parse the story content into paragraphs
  const paragraphs = (story?.content || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="relative bg-[#0B4F6C] text-white">
        {story?.featured_image_url && (
          <div
            className="absolute inset-0 opacity-25 bg-cover bg-center"
            style={{ backgroundImage: `url(${story.featured_image_url})` }}
          />
        )}
        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-picc-ochre mb-4">
            Bwgcolman Way · Empowered and Resilient
          </p>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] mb-6">
            Bwgcolman means<br />
            <em className="text-picc-ochre">&ldquo;many tribes, one people.&rdquo;</em>
          </h1>
          <p className="text-xl md:text-2xl text-white/85 max-w-3xl leading-relaxed font-light">
            PICC is the first Aboriginal and Torres Strait Islander Community Controlled
            Organisation in Queensland granted Delegated Authority for child protection.
            Decisions about Palm Island children are now made by Palm Island people.
          </p>
          <p className="text-sm text-white/60 mt-8">
            This change has been decades in the making.
          </p>
        </div>
      </section>

      {/* ── KEY METADATA STRIP ── */}
      {service?.metadata && (
        <section className="bg-[#FAF8F5] border-b border-stone-200">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {service.metadata.milestone && (
                <MetaItem icon={<Award className="w-4 h-4" />} label="Sector first" value={service.metadata.milestone} />
              )}
              {service.metadata.funding && (
                <MetaItem icon={<Sparkles className="w-4 h-4" />} label="Funding" value={service.metadata.funding} />
              )}
              {service.metadata.blueprint && (
                <MetaItem icon={<BookOpen className="w-4 h-4" />} label="Blueprint" value={`"${service.metadata.blueprint}"`} sub={service.metadata.launched ? `Launched ${service.metadata.launched}` : undefined} />
              )}
              {service.metadata.legislation && (
                <MetaItem icon={<Scale className="w-4 h-4" />} label="Legislation" value={service.metadata.legislation} />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── THE STORY (PICC voice) ── */}
      {story && paragraphs.length > 0 && (
        <section className="bg-white">
          <div className="max-w-3xl mx-auto px-6 py-20">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-picc-ochre mb-4">
              In PICC&apos;s words
            </p>
            <h2 className="font-serif italic text-3xl md:text-4xl text-stone-800 mb-10 leading-tight">
              {story.title}
            </h2>
            <div className="prose prose-stone prose-lg max-w-none">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? 'text-2xl text-stone-700 leading-relaxed font-light first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-picc-ochre first-letter:mr-2 first-letter:float-left first-letter:leading-none'
                      : 'text-lg text-stone-700 leading-relaxed mb-6'
                  }
                >
                  {p}
                </p>
              ))}
            </div>
            {story.storyteller_name && (
              <p className="text-sm text-stone-500 mt-8 italic">
                — Captured with {story.storyteller_name}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── PULL QUOTE ── */}
      <section className="bg-[#0B4F6C] text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <Quote className="w-10 h-10 text-picc-ochre mx-auto mb-6 opacity-80" />
          <p className="font-serif italic text-3xl md:text-4xl leading-snug mb-6">
            We are empowered by our grandparents, the struggles and hardships they faced,
            and we continue to be resilient because we&apos;re still here, fighting for a
            better future for our kids.
          </p>
          <p className="text-sm text-white/60 tracking-wide uppercase">
            From Bwgcolman Way: Community Control for Our Children
          </p>
        </div>
      </section>

      {/* ── DECADES IN THE MAKING (TIMELINE) ── */}
      <section className="bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-picc-ochre mb-4 text-center">
            The arc
          </p>
          <h2 className="font-serif italic text-3xl md:text-4xl text-stone-800 mb-12 text-center">
            Decades in the making
          </h2>
          <div className="space-y-6">
            <TimelineCard
              year="1914-1972"
              title="The history that made this necessary"
              body="Palm Island gazetted as an Aboriginal reserve. People forcibly removed here from more than 70 Nations. Children taken from family. Decisions made about Palm Island people by people who never set foot on Palm Island."
            />
            <TimelineCard
              year="2007"
              title="PICC founded"
              body="Palm Island Community Company launches 17 October 2007 as a hybrid public company. Rachel Atkinson becomes CEO and remains in the role to this day."
            />
            <TimelineCard
              year="Sep 2021"
              title="Community control achieved"
              body="Services, workforce and assets transfer to a new community-controlled entity on 30 September 2021. Members are now Palm Islanders only. The structural foundation for what comes next."
            />
            <TimelineCard
              year="2023"
              title="The work begins"
              body="PICC commences the Delegated Authority project. The Bwgcolman Way blueprint Reclaiming our Storyline is launched in April 2023."
              highlight
            />
            <TimelineCard
              year="2024"
              title="Bwgcolman Way is real"
              body="Delegated Authority is implemented. PICC becomes the first ATSICCO in Queensland with the legal power to decide care arrangements for children in care. $107.8M committed over four years (2023-2028) by the Queensland Government."
              highlight
            />
            <TimelineCard
              year="The next 20"
              title="Where it goes from here"
              body="The Bwgcolman Way model is the foundation for further community control across health, justice, and education. The 20-year celebration is the moment to tell the world."
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS LEGALLY ── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-picc-ochre mb-4 text-center">
            How it works
          </p>
          <h2 className="font-serif italic text-3xl md:text-4xl text-stone-800 mb-12 text-center">
            The legal precision behind community authority
          </h2>
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">
              Bwgcolman Way sits under <strong>Part 2A of Queensland&apos;s Child Protection Act 1999</strong>.
              The Act allows the chief executive to delegate certain functions or powers for an
              Aboriginal or Torres Strait Islander child to a prescribed delegate — but only if
              that person is an Aboriginal or Torres Strait Islander person, is the CEO of an
              appropriate entity, holds a working-with-children authority, and is considered
              suitable and appropriately qualified.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mb-6">
              For Palm Island, <strong>the sole person delegated by the Director-General is
              PICC&apos;s CEO</strong>. Decisions are made collaboratively with children and
              families and in partnership with Child Safety Services. Delegations are made
              <strong> child by child</strong>, not as a blanket transfer. Children retain
              legal review rights.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              The statewide blueprint — <em>Reclaiming our Storyline</em>, co-developed by
              QATSICPP and the Queensland department — ties delegated authority explicitly to
              healing, breaking cycles of trauma, honest truth-telling, and reconnecting
              children and families to culture and community. Bwgcolman Way is Palm Island&apos;s
              local expression of that blueprint.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <WhyCard
              icon={<Shield className="w-5 h-5" />}
              title="A legal first"
              body="Part 2A of the Child Protection Act 1999 (Qld). PICC is the first ATSICCO in Queensland granted this delegation. The prescribed-delegate criteria ensure the power sits with Aboriginal and Torres Strait Islander leadership, not with a third party."
            />
            <WhyCard
              icon={<Heart className="w-5 h-5" />}
              title="A healing model"
              body="Bwgcolman Way is not just administrative delegation — it inherits the Reclaiming our Storyline healing frame. Truth-telling, cultural reconnection, and breaking cycles of trauma are structural features, not add-ons. PICC's community voices site says: 'our cultural authority is recognised alongside the law.'"
            />
            <WhyCard
              icon={<Users className="w-5 h-5" />}
              title="A model for the sector"
              body="Rachel Atkinson has presented Bwgcolman Way at the 2025 ECA Reconciliation Symposium, SNAICC 2025, and the KWY Summit 2026 — positioning it as a broader example of community-controlled systems change, not just a local program."
            />
          </div>
        </div>
      </section>

      {/* ── STATEWIDE CONTEXT ── */}
      <section className="bg-[#FAF8F5] border-y border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-picc-ochre mb-4 text-center">
            Bwgcolman Way in context
          </p>
          <p className="text-stone-600 max-w-3xl mx-auto text-center mb-10 leading-relaxed">
            Palm Island is one site in a statewide delegated-authority movement. By December
            2025, 16 Aboriginal and Torres Strait Islander entities were delivering 21
            delegated-authority services supporting 439 First Nations children across
            Queensland. Bwgcolman Way is PICC&apos;s expression of that movement — shaped by
            Palm Island&apos;s own history, culture, and community infrastructure.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl bg-white border border-stone-200 p-6 text-center">
              <p className="text-3xl font-bold text-picc-earth">439</p>
              <p className="text-xs text-stone-500 mt-1">First Nations children supported statewide (Dec 2025)</p>
            </div>
            <div className="rounded-xl bg-white border border-stone-200 p-6 text-center">
              <p className="text-3xl font-bold text-picc-earth">16</p>
              <p className="text-xs text-stone-500 mt-1">ATSICCO entities delivering DA services</p>
            </div>
            <div className="rounded-xl bg-white border border-stone-200 p-6 text-center">
              <p className="text-3xl font-bold text-picc-earth">2027</p>
              <p className="text-xs text-stone-500 mt-1">Current DA funding extends to 30 June 2027</p>
            </div>
          </div>
          <p className="text-[11px] text-stone-400 mt-6 text-center leading-relaxed">
            Statewide figures from QFCC reporting. Palm-specific outcome data is not yet in the
            public record — the Narelle interview Part D7-D8 is designed to capture it.
            The $107.8M figure in PICC&apos;s annual report is the statewide DA investment
            envelope, not a Palm-only contract value. Public Queensland expenditure datasets
            show PICC line items labelled &ldquo;Delegated Authority - Palm Island&rdquo; in
            2023-24 and 2024-25.
          </p>
        </div>
      </section>

      {/* ── THE SYSTEM AROUND IT ── */}
      <section className="bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-picc-ochre mb-4 text-center">
            The system around it
          </p>
          <h2 className="font-serif italic text-3xl md:text-4xl text-stone-800 mb-4 text-center">
            Bwgcolman Way doesn&apos;t stand alone
          </h2>
          <p className="text-stone-600 max-w-3xl mx-auto text-center mb-12 leading-relaxed">
            Delegated Authority works because PICC has built the integrated services that
            wrap around children and families on Palm Island. Each of these services is
            part of how Bwgcolman Way actually delivers.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {connected.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="block rounded-2xl border border-stone-200 bg-white p-6 hover:border-picc-ochre/50 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-stone-800 mb-2 group-hover:text-picc-ochre">
                  {s.name}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed line-clamp-3 mb-3">
                  {s.description}
                </p>
                <span className="text-xs text-picc-ochre inline-flex items-center gap-1 font-medium">
                  Read more
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOVERNANCE ACHIEVEMENTS (live) ── */}
      {governance.length > 0 && (
        <section className="bg-white border-t border-stone-100">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-picc-ochre mb-4 text-center">
              The record · live from governance_achievements
            </p>
            <h2 className="font-serif italic text-3xl md:text-4xl text-stone-800 mb-12 text-center">
              What&apos;s actually documented
            </h2>
            <div className="space-y-3 max-w-3xl mx-auto">
              {governance.map((g, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-stone-200 bg-[#FAF8F5] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="font-mono text-xs font-bold text-picc-ochre flex-shrink-0 w-20">
                      {g.fiscal_year ? `${g.fiscal_year - 1}-${String(g.fiscal_year).slice(-2)}` : '—'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-stone-700 leading-relaxed">
                        {g.achievement_text}
                      </p>
                      {g.category && (
                        <p className="text-[10px] text-stone-400 uppercase tracking-wide mt-1.5">
                          {g.category.replace(/\s*\(ai-extraction-v2\)\s*/, '')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CALL TO ACTION ── */}
      <section className="bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <Calendar className="w-10 h-10 text-picc-ochre mx-auto mb-6" />
          <h2 className="font-serif italic text-3xl md:text-4xl mb-6">
            Walk with the next 20 years
          </h2>
          <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
            Bwgcolman Way is the proof point of what PICC can build when given the legal
            power and the community trust to do it. The 20-year celebration is the moment
            to tell the world. The next 20 years are the moment to scale it.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/20-years"
              className="inline-flex items-center gap-2 px-6 py-3 bg-picc-ochre text-white rounded-full font-semibold hover:bg-picc-ochre/90 transition-colors"
            >
              17-year history
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/services/bwgcolman-way"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-colors"
            >
              Service detail page
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-colors"
            >
              About PICC
            </Link>
          </div>
        </div>
      </section>

      {/* ── SOURCE FOOTER ── */}
      <section className="bg-[#FAF8F5] border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-[11px] text-stone-500 leading-relaxed text-center">
            Story content from <code className="text-xs bg-white px-1 py-0.5 rounded">stories</code>
            {' · '}
            metadata from <code className="text-xs bg-white px-1 py-0.5 rounded">organization_services</code>
            {' · '}
            achievements arc from <code className="text-xs bg-white px-1 py-0.5 rounded">governance_achievements</code>
            {' · '}
            connected services live from <code className="text-xs bg-white px-1 py-0.5 rounded">organization_services</code>.
            All sourced from PICC&apos;s own database. The story body is PICC&apos;s own
            words — never rewritten.
          </p>
        </div>
      </section>
    </div>
  )
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────

function MetaItem({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-picc-ochre mb-1">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-semibold text-stone-800 leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-stone-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function TimelineCard({
  year,
  title,
  body,
  highlight = false,
}: {
  year: string
  title: string
  body: string
  highlight?: boolean
}) {
  return (
    <div
      className={`flex items-start gap-6 p-6 rounded-2xl border ${
        highlight
          ? 'border-picc-ochre/40 bg-white shadow-sm'
          : 'border-stone-200 bg-white'
      }`}
    >
      <div className="flex-shrink-0 w-24">
        <p
          className={`font-mono text-sm font-bold ${
            highlight ? 'text-picc-ochre' : 'text-stone-400'
          }`}
        >
          {year}
        </p>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-stone-800 mb-2">{title}</h3>
        <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

function WhyCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-[#FAF8F5] p-6">
      <div className="text-picc-ochre mb-3">{icon}</div>
      <h3 className="font-semibold text-stone-800 mb-3">{title}</h3>
      <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
    </div>
  )
}
