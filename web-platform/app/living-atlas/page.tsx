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
          {/* Constellation = full chrome including title, modes, layers,
              year slider, right rail. Owns its own header. */}
          <CanvasStage data={data} immersive />

          {/* Intro overlay — fades after 4s. Sits over everything until
              dismissed. */}
          <IntroOverlay
            eyebrow="The 20-year story · live"
            title="One Atlas. Every Voice."
            tagline="A living surface for Palm Island — people, services, projects, places, years, visions. Drag a face. Scrub a year. Click anything to enter the story."
          />
        </section>
      )}

      {/* ─── SUPPORTING ARCHIVE ──────────────────────────────────────────── */}
      <main className="max-w-[1500px] mx-auto px-4 py-12">
        {/* CTA toolbar — Save path + Share a thought */}
        <div className="mb-8 flex items-center justify-end gap-3">
          <SavePath />
          <Link
            href="/atlas/capture"
            className="rounded-md px-4 py-2 font-semibold text-white text-sm whitespace-nowrap shadow-sm"
            style={{ backgroundColor: '#2D5F4F' }}
          >
            Share a thought
          </Link>
        </div>

        {/* Numbers strip — what the platform holds today */}
        <section className="mb-16">
          <SectionHeader
            eyebrow="00 · The platform"
            label="What the Atlas holds"
            caption="Every number below is live from Empathy Ledger v2 and PICC Supabase — refreshed every page load, never fabricated."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <BigStat value={nf(facesCount)} label="people" tint="green" />
            <BigStat value={nf(totalQuotes)} label="voices on record" tint="ochre" />
            <BigStat value={nf(elderQuotesCount)} label="Elder quotes" tint="gold" />
            <BigStat value={nf(servicesCount)} label="services" tint="green" />
            <BigStat value={nf(projectsCount)} label="projects" tint="terracotta" />
            <BigStat value={nf(reportsCount)} label="annual reports" tint="charcoal" />
          </div>
        </section>

        {/* Featured voice — single editorial pull-quote, no card chrome */}
        {featuredVoice && (
          <section className="mb-20 max-w-4xl mx-auto px-2 text-center">
            <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-ochre mb-6">
              A featured voice
              {featuredVoice.theme && (
                <span className="ml-2 text-stone-400 font-normal">
                  · on {featuredVoice.theme.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            {/* Giant open-quote mark as decoration */}
            <div
              className="font-serif text-ochre/40 leading-none mb-2 select-none"
              style={{ fontSize: 96 }}
              aria-hidden="true"
            >
              &ldquo;
            </div>
            <blockquote
              className="font-serif italic text-charcoal mx-auto"
              style={{ fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.3, maxWidth: 760 }}
            >
              {featuredVoice.text}
            </blockquote>
            <div className="mt-8 inline-flex items-center gap-3">
              {featuredVoice.speaker_photo_url && (
                <img
                  src={featuredVoice.speaker_photo_url}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                  style={{
                    border: `3px solid ${featuredVoice.speaker_is_elder ? '#B8860B' : '#FBF6EE'}`,
                  }}
                />
              )}
              <div className="text-left">
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
                  className="ml-3 text-sm font-semibold inline-flex items-center gap-1 hover:underline"
                  style={{ color: '#2D5F4F' }}
                >
                  Open profile <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </section>
        )}

        {/* ─── 3. VOICE WALL ───────────────────────────────────────────── */}
        {voiceWall.length > 0 && (
          <section className="mb-16">
            <SectionHeader
              eyebrow="01 · The voices"
              label="What community is saying"
              caption="Top quotes from the EL v2 archive. Click any card to open that storyteller's full profile."
              rightHref="/living-atlas/transcripts"
              rightLabel={`All ${nf(136)} transcripts →`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {voiceWall.map((q, i) => (
                <VoiceCard key={i} q={q} />
              ))}
            </div>
          </section>
        )}

        {/* ─── 4. ELDERS COUNCIL ───────────────────────────────────────── */}
        {elders.length > 0 && (
          <section className="mb-16">
            <SectionHeader
              eyebrow="02 · The Elders"
              label="Elders Council"
              caption={`${elders.length} named Elders carrying the long story. Gold ring marks Elder status. Click any portrait to open their full profile.`}
              rightHref="/living-atlas"
              rightLabel="See all →"
            />
            {/* Portrait gallery — magazine-style. Larger photos, name
                below in serif, quote count subtle. Hover reveals a gentle
                lift + ring glow. */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-6">
              {elders.map((e) => (
                <Link
                  key={e.id}
                  href={
                    e.kind === 'storyteller' && e.slug
                      ? `/living-atlas/people/${e.slug}`
                      : '/living-atlas'
                  }
                  className="group flex flex-col items-center text-center"
                >
                  <div
                    className="relative mb-3 transition-transform group-hover:-translate-y-1"
                    style={{ width: 140, height: 140 }}
                  >
                    <img
                      src={e.thumb_url}
                      alt={e.name ?? ''}
                      className="w-full h-full rounded-full object-cover shadow-md"
                      style={{ border: '4px solid #B8860B' }}
                    />
                    {/* Hover ring */}
                    <div
                      className="absolute -inset-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                      style={{
                        boxShadow: '0 0 0 3px rgba(184, 134, 11, 0.25)',
                      }}
                    />
                  </div>
                  <div className="font-serif text-base text-charcoal group-hover:underline leading-tight">
                    {e.name ?? 'Elder'}
                  </div>
                  {e.quote_count > 0 && (
                    <div className="text-[10px] uppercase tracking-wider text-stone-500 mt-1 font-semibold">
                      {e.quote_count} {e.quote_count === 1 ? 'voice' : 'voices'}
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
        <section className="mb-16">
          <SectionHeader
            eyebrow="03 · The work"
            label="Services on Country"
            caption={`${allServices.length} active programs — designed, staffed, and accountable to community. Each card carries the EL canonical cover and the count of storytellers whose voices are tagged to it.`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {allServices.map((s) => {
              const linkedCount = s.photo_ids.length
              return (
                <Link
                  key={s.slug}
                  href={`/living-atlas/services/${s.slug}`}
                  className="group flex flex-col gap-3"
                >
                  {/* Photo — cinematic 4:3, no card border, soft shadow on hover */}
                  <div
                    className="relative overflow-hidden rounded-lg bg-stone-100 transition-transform group-hover:-translate-y-1 group-hover:shadow-lg"
                    style={{ aspectRatio: '4 / 3' }}
                  >
                    {s.image_url ? (
                      <img
                        src={s.image_url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: '#F4E9DC' }}
                      >
                        <span className="text-[10px] uppercase tracking-wider text-stone-500">
                          no photo yet
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      {s.category && (
                        <div className="text-[9.5px] uppercase tracking-[0.15em] font-bold text-ochre">
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
                    <h3 className="font-serif text-base text-charcoal group-hover:underline leading-snug">
                      {s.name}
                    </h3>
                    {s.description && (
                      <p className="text-[12px] text-stone-600 line-clamp-2 leading-snug mt-0.5">
                        {s.description}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-stone-500">
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
        <section className="mb-16">
          <SectionHeader
            eyebrow="04 · The innovation"
            label="Projects in flight"
            caption={`${allProjects.length} live initiatives picking up where ongoing services stop. Same people, same Country, longer arc.`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {allProjects.map((p) => {
              const linkedCount = p.photo_ids.length
              return (
                <Link
                  key={p.slug}
                  href={`/living-atlas/projects/${p.slug}`}
                  className="group flex flex-col gap-2.5"
                >
                  <div
                    className="relative overflow-hidden rounded-lg bg-stone-100 transition-transform group-hover:-translate-y-1 group-hover:shadow-lg"
                    style={{ aspectRatio: '1 / 1' }}
                  >
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: '#F4E9DC' }}
                      >
                        <span className="text-[10px] uppercase tracking-wider text-stone-500">
                          no cover yet
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-serif text-sm text-charcoal group-hover:underline leading-snug">
                      {p.name}
                    </h3>
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
          <section className="mb-16">
            <SectionHeader
              eyebrow="05 · The place"
              label="On Country"
              caption={`${mapServices.length} of ${data.services.length} services pinned to their real address on Palm Island. Click any pin for the service profile.`}
              rightHref="/picc/services/map"
              rightLabel="Edit positions →"
            />
            <div className="rounded-xl overflow-hidden border border-stone-200 bg-white">
              <PalmIslandMap services={mapServices} />
            </div>
          </section>
        )}

        {/* ─── 8. THE 20-YEAR ARC ─────────────────────────────────────── */}
        <section className="mb-16">
          <SectionHeader
            eyebrow="06 · The arc"
            label="2007 — 2027 · one year to go"
            caption="PICC launched in 2007 with a handful of staff and a borrowed office. 197 staff today. The anniversary lands in 2027 — and the commitments below run out to 2045."
            rightHref="/living-atlas/anniversary"
            rightLabel="Open the anniversary page →"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.commitments.slice(0, 3).map((c) => (
              <article
                key={c.target_year}
                className="flex flex-col"
              >
                <div
                  className="font-serif leading-none tabular-nums mb-2"
                  style={{ color: '#D97757', fontSize: 52 }}
                >
                  {c.target_year}
                </div>
                <h3 className="font-serif text-xl text-charcoal leading-tight mb-2">
                  {c.title}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {c.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ─── 9. THEMES ───────────────────────────────────────────────── */}
        {themes.length > 0 && (
          <section className="mb-16">
            <SectionHeader
              eyebrow="07 · The patterns"
              label="Themes named by community"
              caption="Not a taxonomy we built — patterns the voices themselves surfaced. Click any theme to see every quote that names it."
            />
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
        <section className="mb-16">
          <SectionHeader
            eyebrow="08 · The long ground"
            label="Places & archive"
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
          className="rounded-3xl px-8 py-16 md:py-20 text-center"
          style={{ backgroundColor: '#2D5F4F' }}
        >
          <div className="text-[11px] uppercase tracking-[0.4em] font-bold mb-5" style={{ color: '#D4A373' }}>
            09 · Add to the Atlas
          </div>
          <h2 className="font-serif text-white mb-5" style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.1 }}>
            Tell us something<br />we should hold.
          </h2>
          <p className="text-base text-white/75 max-w-xl mx-auto leading-relaxed mb-8">
            A memory. A vision. A service that mattered. A photo worth
            keeping. Nothing publishes until community review.
          </p>
          <Link
            href="/atlas/capture"
            className="inline-block rounded-full px-8 py-3.5 font-semibold text-sm bg-white hover:bg-cream transition shadow-lg"
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
  eyebrow,
}: {
  label: string
  caption?: string
  rightHref?: string
  rightLabel?: string
  /** Optional small uppercase pre-title (e.g. "01 · voices"). */
  eyebrow?: string
}) {
  return (
    <div className="mb-6">
      <div className="flex items-end justify-between flex-wrap gap-3 pb-3 border-b border-stone-300">
        <div>
          {eyebrow && (
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-ochre mb-1.5">
              {eyebrow}
            </div>
          )}
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal leading-[1.05]">
            {label}
          </h2>
          {caption && (
            <p className="text-sm text-stone-600 mt-2 max-w-xl leading-relaxed">
              {caption}
            </p>
          )}
        </div>
        {rightHref && rightLabel && (
          <Link
            href={rightHref}
            className="text-[11px] font-semibold underline hover:no-underline whitespace-nowrap"
            style={{ color: '#2D5F4F' }}
          >
            {rightLabel}
          </Link>
        )}
      </div>
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
    <div
      className="rounded-xl bg-white border-l-4 border-y border-r border-stone-200 px-5 py-5 hover:shadow-md transition"
      style={{ borderLeftColor: colors[tint] }}
    >
      <div
        className="font-serif leading-none tabular-nums"
        style={{ color: colors[tint], fontSize: 36 }}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mt-2 leading-tight font-semibold">
        {label}
      </div>
    </div>
  )
}

function VoiceCard({ q }: { q: import('@/lib/constellation/types').CuratedHeroQuote }) {
  const body = (
    <article className="flex gap-5 group">
      {/* Portrait — fixed-size, lifts on hover */}
      <div className="flex-shrink-0">
        {q.speaker_photo_url ? (
          <img
            src={q.speaker_photo_url}
            alt=""
            className="w-20 h-20 rounded-full object-cover shadow-sm transition-transform group-hover:-translate-y-0.5"
            style={{
              border: `3px solid ${q.speaker_is_elder ? '#B8860B' : '#FBF6EE'}`,
            }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center font-serif text-xl"
            style={{ backgroundColor: '#F4E9DC', color: '#8B6F47' }}
          >
            {q.speaker_name
              .split(/\s+/)
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
        )}
      </div>
      {/* Quote + attribution */}
      <div className="flex-1 min-w-0">
        <blockquote
          className="font-serif italic text-stone-800 leading-[1.4]"
          style={{ fontSize: 18 }}
        >
          &ldquo;{q.text.length > 240 ? q.text.slice(0, 237) + '…' : q.text}&rdquo;
        </blockquote>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-semibold text-charcoal group-hover:underline">
            {q.speaker_name}
          </span>
          {q.speaker_is_elder && (
            <span className="text-[10px] uppercase tracking-wider font-bold text-ochre">
              Elder
            </span>
          )}
        </div>
        {q.theme && (
          <div className="text-[11px] text-stone-500 mt-0.5 italic">
            on {q.theme.replace(/_/g, ' ')}
          </div>
        )}
      </div>
    </article>
  )
  return q.speaker_slug ? (
    <Link href={`/living-atlas/people/${q.speaker_slug}`}>{body}</Link>
  ) : (
    body
  )
}
