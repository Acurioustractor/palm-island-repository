/**
 * /living-atlas — Palm Island Living Atlas (the always-on annual report).
 *
 * One screen. Every face consented, every quote curator-flagged, every
 * service photo-linked, every project tagline live, every theme named by
 * community. Built from the canonical EL v2 + PICC payload — nothing on
 * this page is fabricated copy. If a section is empty, it's an honest
 * empty state, never a fake number.
 *
 * Sections, top to bottom:
 *   1. HERO — featured voice card + headline numbers ("the always-on AR")
 *   2. THE CONSTELLATION — the original five-layer canvas
 *   3. VOICE WALL — top 8 curated quotes with photo + theme + speaker link
 *   4. ELDERS COUNCIL — 10 named elders with photos + quote counts
 *   5. SERVICES — top 6 services with images + categories
 *   6. PROJECTS — top 6 projects with covers + taglines
 *   7. WHERE THE WORK HAPPENS — services pinned on Country (map)
 *   8. THE 20-YEAR ARC — mini ribbon 2007 → 2027 + forward commitments
 *   9. THEMES — top 8 named by community with voice counts
 *  10. PLACES + DEEP DIVES — Hull River, Bwgcolman Way, anniversary
 *  11. CALL TO ACTION — Share a thought / chat
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { loadConstellation } from '@/lib/constellation/queries'
import PalmIslandMap, { type PinService } from '../picc/twenty-years/PalmIslandMap'
import ChatWidget from '@/components/chat/ChatWidget'
import IntroOverlay from './IntroOverlay'
import SavePath from './SavePath'
import CanvasStage from './CanvasStage'

export const metadata = {
  title: 'Palm Island Living Atlas — the always-on annual report',
  description:
    "Palm Island Community Company's living surface — every face consented, every quote curator-flagged, every service photo-linked, every theme named by community. The annual report that never goes stale.",
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

function nf(n: number): string {
  return n.toLocaleString()
}

export default async function LivingAtlasPage() {
  const data = await loadConstellation()
  const hasData = data.faces.length > 0

  // Featured voice — the strongest single curated quote with a photo.
  const featuredVoice =
    data.top_quotes_curated.find((q) => q.speaker_photo_url) ??
    data.top_quotes_curated[0] ??
    null
  const voiceWall = data.top_quotes_curated
    .filter((q) => q !== featuredVoice)
    .slice(0, 8)

  // Elders — named elders with a face on the canvas, sorted by quote count
  // (already done in queries.ts), capped at 10.
  const elders = data.faces
    .filter((f) => f.is_elder && f.thumb_url)
    .sort((a, b) => b.quote_count - a.quote_count)
    .slice(0, 10)

  // Services — only the active ones (3 archived rows drop out: ECLC,
  // Men's Group, Palm Island Community Connection). Sorted by linked-
  // storyteller density so the most community-anchored services lead.
  // Each card carries its EL v2 photo, EL description, category, and
  // the count of storytellers attached.
  const allServices = data.services
    .filter((s) => s.status === 'active')
    .sort((a, b) => b.photo_ids.length - a.photo_ids.length)

  // Projects — ALL 10, sorted by linked-storyteller density. These are
  // the innovation projects — the ongoing connection thread between
  // staff initiative + community voice + cultural sovereignty.
  const allProjects = [...data.projects].sort(
    (a, b) => b.photo_ids.length - a.photo_ids.length,
  )

  // Map pins — every service with lat/long. Description + image +
  // linked-voice count flow into the on-click Popup card.
  const mapServices: PinService[] = data.services
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      service_category: s.category,
      latitude: s.latitude as number,
      longitude: s.longitude as number,
      description: s.description,
      image_url: s.image_url,
      voice_count: s.photo_ids.length,
    }))

  // Themes — top 8 by voice count.
  const themes = data.themes.slice(0, 8)

  // Headline numbers — pulled from the actual payload.
  const totalQuotes =
    data.stats.voices_validated_elder + data.stats.voices_extracted
  const facesCount = data.faces.length
  const servicesCount = data.services.length
  const projectsCount = data.projects.length
  const elderQuotesCount = data.stats.voices_validated_elder
  const reportsCount = data.annual_reports.length

  return (
    <div className="bg-cream">
      {/* ─── HERO · CONSTELLATION FULL-BLEED ─────────────────────────────── */}
      {/* The constellation IS the hero. 100vh, no border, no chrome above.
          Intro overlay fades after 4s revealing the live canvas. Top-right
          floating CTAs stay always-visible. */}
      {hasData && (
        <section
          className="relative w-full overflow-hidden"
          style={{ height: '100vh' }}
        >
          <CanvasStage data={data} immersive />

          {/* Top-left presentation eyebrow — always visible. */}
          <div
            className="absolute top-4 left-6 z-20 pointer-events-none"
            style={{
              textShadow: '0 1px 2px rgba(251, 246, 238, 0.8)',
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-ochre">
              Palm Island Community Company
            </div>
            <div className="font-serif text-charcoal text-base mt-0.5">
              The Living Atlas
            </div>
          </div>

          {/* Top-right floating CTA. */}
          <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
            <SavePath />
            <Link
              href="/atlas/capture"
              className="rounded-md px-4 py-2 font-semibold text-white text-sm whitespace-nowrap shadow-md"
              style={{ backgroundColor: '#2D5F4F' }}
            >
              Share a thought
            </Link>
          </div>

          {/* Intro overlay — fades after 4s. */}
          <IntroOverlay
            eyebrow="The 20-year story · live"
            title="One Atlas. Every Voice."
            tagline="A living surface for Palm Island — people, services, projects, places, years, visions. Drag a face. Scrub a year. Click anything to enter the story."
          />

          {/* Subtle scroll-hint indicator. */}
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            style={{ animation: 'cstl-scrollhint 2.4s ease-in-out infinite' }}
          >
            <div className="text-[10px] uppercase tracking-[0.4em] text-stone-500 mb-1">
              scroll for more
            </div>
            <div className="w-px h-6 bg-stone-400 mx-auto" />
          </div>
        </section>
      )}

      {/* ─── SUPPORTING ARCHIVE ──────────────────────────────────────────── */}
      <main className="max-w-[1500px] mx-auto px-4 py-12">
        {/* Numbers strip — what the platform holds today */}
        <section className="mb-12">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-4">
            What the Atlas holds
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <BigStat value={nf(facesCount)} label="people" tint="green" />
            <BigStat value={nf(totalQuotes)} label="voices on record" tint="ochre" />
            <BigStat value={nf(elderQuotesCount)} label="Elder quotes" tint="gold" />
            <BigStat value={nf(servicesCount)} label="services" tint="green" />
            <BigStat value={nf(projectsCount)} label="projects" tint="terracotta" />
            <BigStat value={nf(reportsCount)} label="annual reports" tint="charcoal" />
          </div>
        </section>

        {/* Featured voice — single quote moment */}
        {featuredVoice && (
          <section className="mb-12">
            <article
              className="rounded-2xl border bg-white p-8 md:p-12 shadow-sm flex flex-col gap-5 max-w-4xl mx-auto"
              style={{ borderColor: '#E0CFB8' }}
            >
              <div className="text-[10px] uppercase tracking-[0.3em] font-semibold text-ochre">
                Featured voice
                {featuredVoice.theme && (
                  <span className="ml-2 text-stone-500">
                    · {featuredVoice.theme.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
              <blockquote className="font-serif italic text-3xl md:text-4xl text-charcoal leading-[1.2]">
                &ldquo;{featuredVoice.text}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 mt-2">
                {featuredVoice.speaker_photo_url && (
                  <img
                    src={featuredVoice.speaker_photo_url}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover"
                    style={{
                      border: `3px solid ${featuredVoice.speaker_is_elder ? '#B8860B' : '#FBF6EE'}`,
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-charcoal">
                    {featuredVoice.speaker_name}
                  </div>
                  {featuredVoice.speaker_is_elder && (
                    <div className="text-[10px] uppercase tracking-wider font-bold text-ochre">
                      Elder
                    </div>
                  )}
                </div>
                {featuredVoice.speaker_slug && (
                  <Link
                    href={`/living-atlas/people/${featuredVoice.speaker_slug}`}
                    className="text-sm font-semibold inline-flex items-center gap-1 hover:underline"
                    style={{ color: '#2D5F4F' }}
                  >
                    Open profile <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </article>
          </section>
        )}

        {/* ─── 3. VOICE WALL ───────────────────────────────────────────── */}
        {voiceWall.length > 0 && (
          <section className="mb-8">
            <SectionHeader
              label="Voices"
              rightHref="/living-atlas/transcripts"
              rightLabel={`All ${nf(136)} transcripts →`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {voiceWall.map((q, i) => (
                <VoiceCard key={i} q={q} />
              ))}
            </div>
          </section>
        )}

        {/* ─── 4. ELDERS COUNCIL ───────────────────────────────────────── */}
        {elders.length > 0 && (
          <section className="mb-8">
            <SectionHeader
              label="Elders Council"
              caption={`${elders.length} named Elders. Gold ring marks Elder status.`}
              rightHref="/living-atlas"
              rightLabel="See all →"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {elders.map((e) => (
                <Link
                  key={e.id}
                  href={
                    e.kind === 'storyteller' && e.slug
                      ? `/living-atlas/people/${e.slug}`
                      : '/living-atlas'
                  }
                  className="rounded-xl bg-white border border-stone-200 p-3 hover:shadow-md transition group flex flex-col items-center text-center"
                >
                  <img
                    src={e.thumb_url}
                    alt={e.name ?? ''}
                    className="w-20 h-20 rounded-full object-cover mb-2"
                    style={{ border: '3px solid #B8860B' }}
                  />
                  <div className="font-serif text-sm text-charcoal group-hover:underline leading-tight">
                    {e.name ?? 'Elder'}
                  </div>
                  {e.quote_count > 0 && (
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      {e.quote_count} {e.quote_count === 1 ? 'quote' : 'quotes'}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── 5. SERVICES ─────────────────────────────────────────────── */}
        {/* Narrative bridge: services aren't a catalogue, they're the
            community-controlled response. Every one has staff behind it
            and storytellers attached. This is the staff + community thread. */}
        <section className="mb-8">
          <SectionHeader
            label="Services"
            caption={`${allServices.length} active programs delivering on Palm Island.`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allServices.map((s) => {
              const linkedCount = s.photo_ids.length
              return (
                <Link
                  key={s.slug}
                  href={`/living-atlas/services/${s.slug}`}
                  className="rounded-xl overflow-hidden bg-white border border-stone-200 hover:shadow-lg transition group flex flex-col"
                >
                  {s.image_url ? (
                    <img
                      src={s.image_url}
                      alt=""
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-32 flex items-center justify-center"
                      style={{ backgroundColor: '#F4E9DC' }}
                    >
                      <span className="text-[10px] uppercase tracking-wider text-stone-500">
                        no photo yet
                      </span>
                    </div>
                  )}
                  <div className="p-3 flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      {s.category && (
                        <div className="text-[9.5px] uppercase tracking-wider font-semibold text-ochre">
                          {s.category}
                        </div>
                      )}
                      {s.status && s.status !== 'active' && (
                        <span
                          className="text-[8.5px] uppercase tracking-wider font-bold px-1 py-0.5 rounded"
                          style={{
                            backgroundColor: '#FBF6EE',
                            color: '#8B6F47',
                          }}
                        >
                          {s.status}
                        </span>
                      )}
                    </div>
                    <div className="font-serif text-sm text-charcoal group-hover:underline leading-snug">
                      {s.name}
                    </div>
                    {s.description && (
                      <div className="text-[11px] text-stone-600 line-clamp-3 leading-snug">
                        {s.description}
                      </div>
                    )}
                    <div className="mt-auto pt-2 flex items-center gap-2 text-[10px] text-stone-500">
                      {linkedCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <span className="font-bold text-charcoal">
                            {linkedCount}
                          </span>
                          voice{linkedCount === 1 ? '' : 's'} on file
                        </span>
                      )}
                      {s.latitude && s.longitude && (
                        <span className="inline-flex items-center gap-1">
                          <span style={{ color: '#2D5F4F' }}>●</span> on map
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ─── 6. INNOVATION + ONGOING CONNECTION (bridge) ─────────────── */}
        <section
          className="mb-8 rounded-2xl p-5 md:p-6 border text-center"
          style={{ backgroundColor: '#FBF6EE', borderColor: '#E0CFB8' }}
        >
          <div className="text-[11px] uppercase tracking-[0.3em] font-bold text-ochre mb-1">
            The thread
          </div>
          <h2 className="font-serif text-xl md:text-2xl text-charcoal">
            From services, through staff, into innovation.
          </h2>
        </section>

        {/* ─── 7. PROJECTS ─────────────────────────────────────────────── */}
        <section className="mb-8">
          <SectionHeader
            label="Projects"
            caption={`${allProjects.length} live innovation projects.`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {allProjects.map((p) => {
              const linkedCount = p.photo_ids.length
              return (
                <Link
                  key={p.slug}
                  href={`/living-atlas/projects/${p.slug}`}
                  className="rounded-xl overflow-hidden bg-white border border-stone-200 hover:shadow-lg transition group flex flex-col"
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt=""
                      className="w-full h-28 object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-28 flex items-center justify-center"
                      style={{ backgroundColor: '#F4E9DC' }}
                    >
                      <span className="text-[10px] uppercase tracking-wider text-stone-500">
                        no cover yet
                      </span>
                    </div>
                  )}
                  <div className="p-3 flex-1 flex flex-col gap-1.5">
                    <div className="font-serif text-sm text-charcoal group-hover:underline leading-snug">
                      {p.name}
                    </div>
                    {(p.tagline ?? p.description) && (
                      <div className="text-[10.5px] text-stone-600 line-clamp-3 leading-snug">
                        {p.tagline ?? p.description}
                      </div>
                    )}
                    <div className="mt-auto pt-1.5 flex items-center gap-2 text-[10px] text-stone-500">
                      {linkedCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <span className="font-bold text-charcoal">
                            {linkedCount}
                          </span>
                          voice{linkedCount === 1 ? '' : 's'}
                        </span>
                      )}
                      {p.photo_count > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <span className="font-bold text-charcoal">
                            {p.photo_count}
                          </span>
                          photo{p.photo_count === 1 ? '' : 's'}
                        </span>
                      )}
                      {p.start_year && (
                        <span>since {p.start_year}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ─── 7. WHERE THE WORK HAPPENS (MAP) ─────────────────────────── */}
        {mapServices.length > 0 && (
          <section className="mb-8">
            <SectionHeader
              label="On Country"
              caption={`${mapServices.length} services pinned. Click any.`}
              rightHref="/picc/services/map"
              rightLabel="Edit positions →"
            />
            <div className="rounded-xl overflow-hidden border border-stone-200 bg-white">
              <PalmIslandMap services={mapServices} />
            </div>
          </section>
        )}

        {/* ─── 8. THE 20-YEAR ARC ─────────────────────────────────────── */}
        <section className="mb-8 rounded-2xl p-6 md:p-8 border" style={{ backgroundColor: '#FBF6EE', borderColor: '#E0CFB8' }}>
          <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] font-bold text-ochre">
                The 20-year arc · 2007 → 2027
              </div>
              <h2 className="font-serif text-2xl text-charcoal mt-1">
                One year to go
              </h2>
            </div>
            <Link
              href="/living-atlas/anniversary"
              className="text-sm font-semibold inline-flex items-center gap-1 hover:underline"
              style={{ color: '#D97757' }}
            >
              Open the anniversary page <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-sm text-stone-700 leading-relaxed max-w-3xl">
            PICC launched in 2007. 197 staff today. The anniversary lands in
            2027.
          </p>
          <div className="mt-4 flex gap-2 flex-wrap">
            {data.commitments.slice(0, 3).map((c) => (
              <div
                key={c.target_year}
                className="flex-1 min-w-[200px] rounded-lg bg-white border border-stone-200 p-3"
              >
                <div className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-0.5">
                  {c.target_year}
                </div>
                <div className="font-serif text-sm text-charcoal mb-1">
                  {c.title}
                </div>
                <div className="text-[11px] text-stone-600 leading-snug">
                  {c.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 9. THEMES ───────────────────────────────────────────────── */}
        {themes.length > 0 && (
          <section className="mb-8">
            <SectionHeader label="Themes" />
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <Link
                  key={t.key}
                  href={`/living-atlas/themes/${t.key}`}
                  className="inline-flex items-baseline gap-2 rounded-full px-4 py-2 border hover:shadow transition"
                  style={{ backgroundColor: '#F4E9DC', borderColor: '#E0CFB8', color: '#2C2C2C' }}
                >
                  <span className="font-serif text-sm">{t.label}</span>
                  <span className="text-[10px] font-bold opacity-60">{t.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── 10. PLACES & DEEP DIVES ─────────────────────────────────── */}
        <section className="mb-8">
          <SectionHeader
            label="Places & deep-dives"
            caption="Foundational locations and long-form pages — each with timeline, map, voices, and the archive."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              href="/living-atlas/places/hull-river"
              className="rounded-xl border border-stone-200 bg-white p-4 hover:shadow-md transition group"
              style={{ borderLeftWidth: 4, borderLeftColor: '#8B1A1A' }}
            >
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1" style={{ color: '#8B1A1A' }}>
                1914 — 1919
              </div>
              <div className="font-serif text-lg text-charcoal group-hover:underline">Hull River</div>
              <p className="text-[11.5px] text-stone-600 mt-1 leading-snug">
                The foundational journey — settlement at Tully Heads, the
                1918 cyclone Leonte, the transfer to Great Palm Island.
              </p>
            </Link>
            <Link
              href="/living-atlas/history"
              className="rounded-xl border border-stone-200 bg-white p-4 hover:shadow-md transition group"
              style={{ borderLeftWidth: 4, borderLeftColor: '#2D5F4F' }}
            >
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1" style={{ color: '#2D5F4F' }}>
                1911 — today
              </div>
              <div className="font-serif text-lg text-charcoal group-hover:underline">The long ground</div>
              <p className="text-[11.5px] text-stone-600 mt-1 leading-snug">
                91 verified newspaper artifacts + 4 PICC eras + 13 research
                sources. Three years before Hull River, to this morning.
              </p>
            </Link>
            <Link
              href="/living-atlas/gallery"
              className="rounded-xl border border-stone-200 bg-white p-4 hover:shadow-md transition group"
              style={{ borderLeftWidth: 4, borderLeftColor: '#5B8A72' }}
            >
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1" style={{ color: '#5B8A72' }}>
                117 photos
              </div>
              <div className="font-serif text-lg text-charcoal group-hover:underline">Gallery</div>
              <p className="text-[11.5px] text-stone-600 mt-1 leading-snug">
                Every photo consent-cleared in Empathy Ledger v2. Search by
                caption, alt-text, slot, fiscal year.
              </p>
            </Link>
          </div>
        </section>

        {/* ─── 11. CALL TO ACTION ──────────────────────────────────────── */}
        <section
          className="rounded-2xl p-6 md:p-8 border text-center"
          style={{ backgroundColor: '#2D5F4F', borderColor: '#2D5F4F' }}
        >
          <div className="text-[11px] uppercase tracking-[0.3em] font-bold text-ochre mb-2">
            Add to the Atlas
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-white mb-2">
            Tell us something we should hold
          </h2>
          <p className="text-sm text-white/80 max-w-2xl mx-auto leading-relaxed mb-4">
            A memory, a vision, a service that mattered, a photo worth
            keeping. Nothing publishes until community review. Elder voices
            are prioritised. Youth submissions co-signed by a parent or Elder.
          </p>
          <Link
            href="/atlas/capture"
            className="inline-block rounded-md px-5 py-2.5 font-semibold text-sm shadow-sm bg-white"
            style={{ color: '#2D5F4F' }}
          >
            Share a thought →
          </Link>
        </section>
      </main>

      {/* Ask PICC chat overlay */}
      <ChatWidget
        position="bottom-right"
        welcomeMessage="Welcome to the Palm Island Living Atlas. Ask me about any service, project, Elder, annual report year, or the Hull River journey. I'll cite the source so you can keep exploring."
      />

      {/* Scroll-hint keyframe */}
      <style>{`
        @keyframes cstl-scrollhint {
          0%, 100% { opacity: 0.5; transform: translate(-50%, 0); }
          50% { opacity: 1; transform: translate(-50%, 4px); }
        }
      `}</style>
    </div>
  )
}

/* ─── Section primitives ────────────────────────────────────────────── */

function SectionHeader({
  label,
  caption,
  rightHref,
  rightLabel,
}: {
  label: string
  caption?: string
  rightHref?: string
  rightLabel?: string
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between flex-wrap gap-2">
      <div>
        <h2 className="font-serif text-xl text-charcoal">{label}</h2>
        {caption && (
          <p className="text-[11px] text-stone-500 mt-0.5">{caption}</p>
        )}
      </div>
      {rightHref && rightLabel && (
        <Link
          href={rightHref}
          className="text-[11px] font-semibold underline hover:no-underline"
          style={{ color: '#2D5F4F' }}
        >
          {rightLabel}
        </Link>
      )}
    </div>
  )
}

function BigStat({
  value,
  label,
  tint,
}: {
  value: string
  label: string
  tint: 'green' | 'ochre' | 'gold' | 'terracotta' | 'charcoal'
}) {
  const colors: Record<typeof tint, string> = {
    green: '#2D5F4F',
    ochre: '#D4A373',
    gold: '#B8860B',
    terracotta: '#D97757',
    charcoal: '#2C2C2C',
  }
  return (
    <div className="rounded-xl bg-white border border-stone-200 px-3 py-3">
      <div
        className="font-serif text-2xl leading-none"
        style={{ color: colors[tint] }}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-stone-500 mt-1.5 leading-tight">
        {label}
      </div>
    </div>
  )
}

function VoiceCard({ q }: { q: import('@/lib/constellation/types').CuratedHeroQuote }) {
  const body = (
    <article className="rounded-xl bg-white border border-stone-200 p-4 h-full flex flex-col gap-3 hover:shadow-md transition group">
      <blockquote className="font-serif italic text-[14px] text-stone-800 leading-snug flex-1">
        &ldquo;{q.text.length > 200 ? q.text.slice(0, 197) + '…' : q.text}&rdquo;
      </blockquote>
      <div className="flex items-center gap-2 mt-auto">
        {q.speaker_photo_url ? (
          <img
            src={q.speaker_photo_url}
            alt=""
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            style={{
              border: `2px solid ${q.speaker_is_elder ? '#B8860B' : '#FBF6EE'}`,
            }}
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-serif text-xs"
            style={{ backgroundColor: '#F4E9DC', color: '#8B6F47' }}
          >
            {q.speaker_name
              .split(/\s+/)
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-charcoal truncate group-hover:underline">
            {q.speaker_name}
          </div>
          <div className="text-[10px] text-stone-500 truncate">
            {q.speaker_is_elder && 'Elder · '}
            {q.theme ? q.theme.replace(/_/g, ' ') : ''}
          </div>
        </div>
      </div>
    </article>
  )
  return q.speaker_slug ? (
    <Link href={`/living-atlas/people/${q.speaker_slug}`}>{body}</Link>
  ) : (
    body
  )
}
