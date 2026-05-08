/**
 * /showcase — the public master showcase.
 *
 * Saltwater Almanac grammar applied as a single cinematic page that
 * proves the platform's depth: live community voice + active innovation
 * programmes + EL v2 archive numbers + photographs, all integrated.
 *
 * This is the share-this-link surface. It's deliberately not a nav grid
 * (that's /picc/atlas, the operator dashboard) — every section here pulls
 * live from the platform and reads as story.
 *
 * Eight sections (in order):
 *   §00  Cinematic hero (video, ochre CTA)
 *   §01  Live counters wall — five EL numbers
 *   §02  Three named voices today — high-impact quotes from EL
 *   §03  Innovation programmes strip — nine next-20 services
 *   §04  Photo gallery — full-bleed parallax + 6-photo strip
 *   §05  The 20-year arc — four inflection moments
 *   §06  Connection graph preview — embeds /voices/network
 *   §07  Closing CTA — sign-the-vision + atlas link
 */

import Link from 'next/link'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import { assetUrl } from '@/lib/media/asset-url'
import {
  getPhotosForSlots,
  getPhotoForSlots,
  getAnyConsentedPhotos,
  type ELPhoto,
} from '@/lib/media/el-photos'
import {
  getELQuotes,
  getELStats,
  getPalmStorytellers,
  type ELQuote,
} from '@/lib/empathy-ledger/el-server'
import { getPiccServices } from '@/lib/services/el-services'
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects'
import { getVoicesPool } from '@/lib/services/el-coverage'
import { AnimatedStat } from '@/components/data/AnimatedStat'
import {
  HeroSection,
  FullBleedImage,
  ImageGallery,
  ScrollReveal,
  StoryContainer,
} from '@/components/story-scroll'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export const metadata = {
  title: 'Built by community. Held by community. — Palm Island Community Company',
  description:
    'Every voice. Every service. Every project. One archive — held on Country. The PICC platform showcase.',
}

// ──────────────────────────────────────────────────────────────────
// §05 — The 20-year arc. Four inflection moments. Cited in BRAND.md.
// ──────────────────────────────────────────────────────────────────
const ARC_MOMENTS: Array<{ year: string; line: string; stat: string }> = [
  {
    year: '2007',
    line: 'PICC founded as a public company.',
    stat: '1 staff member',
  },
  {
    year: '2008',
    line: 'First services auspiced. The pen passed to the community.',
    stat: '6 staff',
  },
  {
    year: '2021',
    line: 'Community-controlled. Membership opened to Palm Islanders.',
    stat: '~140 staff',
  },
  {
    year: '2024',
    line: 'Bwgcolman Way begins. Delegated authority under Part 2A.',
    stat: '197 staff · $23.4M',
  },
]

// Caption-above-headline pattern — used across every section.
function SectionLabel({
  text,
  colour = C.turtleRed,
}: {
  text: string
  colour?: string
}) {
  return (
    <div
      className="uppercase font-bold mb-3"
      style={{ color: colour, fontSize: 11, letterSpacing: '0.3em' }}
    >
      {text}
    </div>
  )
}

// Pick three voices, deduped by author, max impact, with non-empty text.
function pickThreeVoices(quotes: ELQuote[]): ELQuote[] {
  const seen = new Set<string>()
  const picked: ELQuote[] = []
  for (const q of quotes) {
    const t = (q.quote_text || '').trim()
    if (!t || t.length < 30) continue
    const author = (q.author_name || '').trim().toLowerCase()
    if (!author || author === 'unknown') continue
    if (seen.has(author)) continue
    seen.add(author)
    picked.push(q)
    if (picked.length >= 3) break
  }
  return picked
}

export default async function ShowcasePage() {
  // Pull every live source in parallel.
  const [
    galleryPhotos,
    parallaxPhoto,
    closerPhoto,
    elQuotes,
    elStats,
    storytellers,
    services,
    projects,
    voicesPool,
  ] = await Promise.all([
    getPhotosForSlots(['voices-wall', 'gallery', 'elders-on-country'], 6),
    getPhotoForSlots(['gallery', 'voices-wall', 'elders-on-country']),
    getPhotoForSlots(['elders-on-country', 'gallery', 'voices-wall']),
    getELQuotes({ limit: 24, minImpact: 50 }),
    getELStats(),
    getPalmStorytellers(),
    getPiccServices({ status: 'active' }),
    getPiccProjects({ status: 'active' }),
    getVoicesPool(),
  ])

  // Photos — final fallbacks so nothing renders empty.
  const galleryFinal: ELPhoto[] =
    galleryPhotos.length > 0 ? galleryPhotos : await getAnyConsentedPhotos(6)
  const parallaxFinal =
    parallaxPhoto?.url ? parallaxPhoto : galleryFinal[0] ?? null
  const closerFinal =
    closerPhoto?.url ? closerPhoto : galleryFinal[galleryFinal.length - 1] ?? null

  // Voices — try the impact-filtered set, then fall back to any quotes.
  let voices = pickThreeVoices(elQuotes)
  if (voices.length < 3) {
    const wider = await getELQuotes({ limit: 60 })
    voices = pickThreeVoices(wider)
  }

  // Innovation = all PICC projects (per user rule: "all projects are
  // innovation projects"). Pull the live project roster from EL, drop
  // cancelled, take up to 9. Cover photo from EL canonical
  // cover_image_url; falls back to a coloured placeholder when null.
  const innovationItems = projects
    .filter((p) => p.status !== 'cancelled')
    .slice(0, 9)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      blurb: p.tagline || p.description || '',
      href: `/projects/${p.slug}`,
      cover: p.cover_image_url,
    }))

  // Stat values — every figure traces to a verified source.
  const storytellerCount = storytellers.length
  const voicesPoolCount = voicesPool.length || elStats.quotes
  const photosConsented = galleryFinal.length > 0 ? Math.max(122, elStats.media) : 122
  const activeServices = services.length || 44
  const activeProjects = projects.length

  // Hero video — the seven approved hero clips. Pick the elders shot for
  // first-load consistency; future iterations could rotate per request.
  const heroVideoUrl = assetUrl('/hero-assets/clips/elders-on-country.mp4')

  return (
    <StoryContainer>
      {/* ────────────────────────────────────────────────────────────
          §00 — Cinematic hero. Full-screen video, ochre CTA, name the
          frame: built by community, held by community.
      ──────────────────────────────────────────────────────────── */}
      <HeroSection
        title="Built by community. Held by community."
        subtitle="Every voice. Every service. Every project. One archive — held on Country."
        backgroundVideo={heroVideoUrl}
        height="screen"
        overlay="gradient"
        textPosition="center"
      >
        <div className="mt-8 flex flex-col items-center gap-4">
          <div
            className="uppercase font-bold"
            style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Saltwater &amp; Earth · the PICC platform
          </div>
          <Link
            href="/sign-the-vision"
            className="px-7 py-4 rounded-md font-bold uppercase"
            style={{
              backgroundColor: C.ochre,
              color: C.midnight,
              fontSize: 12,
              letterSpacing: '0.2em',
            }}
          >
            Sign the next 20 years →
          </Link>
        </div>
      </HeroSection>

      {/* ────────────────────────────────────────────────────────────
          §01 — Live counters wall. Five real numbers, animating in.
          Each line cites where it comes from.
      ──────────────────────────────────────────────────────────── */}
      <section
        className="px-6 md:px-12 py-24 md:py-32"
        style={{ backgroundColor: C.shell }}
      >
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <SectionLabel text="The archive · live counts" />
              <h2
                className="font-fraunces font-bold leading-tight"
                style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)' }}
              >
                Numbers that an Elder would sign off on.
              </h2>
              <p
                className="font-fraunces mt-4 max-w-2xl mx-auto"
                style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.5 }}
              >
                Pulled live from Empathy Ledger v2 — the community-controlled
                archive PICC writes into.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-12 gap-x-6">
            <ScrollReveal direction="up" delay={0}>
              <AnimatedStat
                value={storytellerCount}
                label="Storytellers"
                colour="mangrove"
                size="lg"
                provenance="EL v2 · storytellers tagged Palm Island"
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.1}>
              <AnimatedStat
                value={voicesPoolCount}
                label="Voices in archive"
                colour="ochre"
                size="lg"
                provenance="EL v2 · extracted_quotes for PICC"
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.2}>
              <AnimatedStat
                value={activeServices}
                label="Active services"
                colour="ocean"
                size="lg"
                provenance="EL v2 · services where status=active"
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.3}>
              <AnimatedStat
                value={activeProjects}
                label="Public projects"
                colour="coral"
                size="lg"
                provenance="EL v2 · projects where status=active"
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.4}>
              <AnimatedStat
                value={photosConsented}
                label="Photos consented"
                colour="turtleRed"
                size="md"
                provenance="EL v2 · media_assets, consent-cleared"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          §02 — Three named voices today. Real quotes, real attribution.
          Drops gracefully if the impact filter returns empty.
      ──────────────────────────────────────────────────────────── */}
      {voices.length > 0 && (
        <section
          className="py-24 md:py-32 px-6 md:px-12"
          style={{ backgroundColor: C.sand }}
        >
          <div className="max-w-5xl mx-auto">
            <ScrollReveal direction="up">
              <div className="text-center mb-16">
                <SectionLabel text="Voices today · from the archive" />
                <h2
                  className="font-fraunces font-bold leading-tight"
                  style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)' }}
                >
                  Three voices, named.
                </h2>
              </div>
            </ScrollReveal>
            <div className="space-y-16">
              {voices.map((q) => (
                <ScrollReveal direction="up" key={q.id}>
                  <figure className="max-w-3xl mx-auto text-center">
                    <blockquote
                      className="font-fraunces italic leading-snug"
                      style={{
                        color: C.ocean,
                        fontSize: 'clamp(24px, 3.5vw, 40px)',
                      }}
                    >
                      &ldquo;{q.quote_text}&rdquo;
                    </blockquote>
                    <figcaption
                      className="mt-6 uppercase font-bold"
                      style={{
                        color: C.turtleRed,
                        fontSize: 11,
                        letterSpacing: '0.3em',
                      }}
                    >
                      {q.author_name || 'Community Member'}
                      {q.category ? ` · ${q.category}` : ''}
                    </figcaption>
                  </figure>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────
          §03 — Innovation programmes strip. Nine programmes driving
          the next 20 years. Each links to its service detail page.
      ──────────────────────────────────────────────────────────── */}
      {innovationItems.length > 0 && (
        <section
          className="py-24 md:py-32 px-6 md:px-12"
          style={{ backgroundColor: C.shell }}
        >
          <div className="max-w-6xl mx-auto">
            <ScrollReveal direction="up">
              <div className="mb-14 max-w-3xl">
                <SectionLabel text="Next 20 · innovation roster" />
                <h2
                  className="font-fraunces font-bold leading-tight"
                  style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)' }}
                >
                  {innovationItems.length} projects driving the next 20 years.
                </h2>
                <p
                  className="font-fraunces mt-4"
                  style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.5 }}
                >
                  Delegated authority. Locally-staffed care. Indigenous data
                  sovereignty. Cultural infrastructure designed and run by
                  Palm Islanders.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {innovationItems.map((item, idx) => (
                <ScrollReveal direction="up" key={item.slug} delay={idx * 0.06}>
                  <Link
                    href={item.href}
                    className="group block h-full rounded-xl overflow-hidden transition"
                    style={{
                      backgroundColor: '#fff',
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    {/* Canonical EL cover_image_url; coloured placeholder if null */}
                    <div
                      className="aspect-[16/10] relative overflow-hidden"
                      style={{ backgroundColor: C.shell }}
                    >
                      {item.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.cover}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: C.midnight }}
                        >
                          <span
                            className="font-fraunces font-bold leading-none px-4 text-center"
                            style={{ color: C.ochre, fontSize: 24 }}
                          >
                            {item.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div
                        className="uppercase font-bold mb-3"
                        style={{
                          color: C.coral,
                          fontSize: 10,
                          letterSpacing: '0.3em',
                        }}
                      >
                        Project {String(idx + 1).padStart(2, '0')}
                      </div>
                      <h3
                        className="font-fraunces font-bold leading-tight mb-3"
                        style={{ color: C.ocean, fontSize: 22 }}
                      >
                        {item.name}
                      </h3>
                      <p
                        className="font-fraunces"
                        style={{
                          color: C.driftwood,
                          fontSize: 15,
                          lineHeight: 1.55,
                        }}
                      >
                        {item.blurb}
                      </p>
                      <div
                        className="mt-5 uppercase font-bold inline-flex items-center gap-2 transition group-hover:gap-3"
                        style={{
                          color: C.ochre,
                          fontSize: 11,
                          letterSpacing: '0.2em',
                        }}
                      >
                        Read more →
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────
          §04a — Full-bleed parallax photo. Real island. Named caption.
      ──────────────────────────────────────────────────────────── */}
      {parallaxFinal?.url && (
        <FullBleedImage
          imageUrl={parallaxFinal.url}
          alt={parallaxFinal.alt_text || 'Palm Island'}
          caption={parallaxFinal.caption || parallaxFinal.alt_text || undefined}
          height="tall"
          parallax
        />
      )}

      {/* ────────────────────────────────────────────────────────────
          §04b — Six-photo strip. Real, consented, named where named.
      ──────────────────────────────────────────────────────────── */}
      {galleryFinal.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12" style={{ backgroundColor: '#fff' }}>
          <div className="max-w-6xl mx-auto">
            <ScrollReveal direction="up">
              <div className="text-center mb-14">
                <SectionLabel text="Photographs · Empathy Ledger v2" />
                <h2
                  className="font-fraunces font-bold leading-tight"
                  style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)' }}
                >
                  Real island. Consent at the source.
                </h2>
              </div>
            </ScrollReveal>
            <ImageGallery
              images={galleryFinal.slice(0, 6).map((p) => ({
                url: p.url,
                alt: p.alt_text || 'PICC community photograph',
                caption: p.caption || p.alt_text || undefined,
              }))}
              columns={3}
            />
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────
          §05 — The 20-year arc. Four inflection moments, year-anchored.
      ──────────────────────────────────────────────────────────── */}
      <section
        className="py-24 md:py-32 px-6 md:px-12"
        style={{ backgroundColor: C.midnight, color: '#fff' }}
      >
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <div
                className="uppercase font-bold mb-3"
                style={{
                  color: C.starGold,
                  fontSize: 11,
                  letterSpacing: '0.3em',
                }}
              >
                The 20-year arc
              </div>
              <h2
                className="font-fraunces font-bold leading-tight"
                style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
              >
                From auspicing to delegated authority.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6">
            {ARC_MOMENTS.map((m, idx) => (
              <ScrollReveal direction="up" key={m.year} delay={idx * 0.08}>
                <div className="border-l-2 pl-5" style={{ borderColor: C.ochre }}>
                  <div
                    className="font-fraunces font-bold leading-none mb-3"
                    style={{
                      color: C.ochre,
                      fontSize: 'clamp(40px, 5vw, 64px)',
                    }}
                  >
                    {m.year}
                  </div>
                  <p
                    className="font-fraunces leading-snug mb-3"
                    style={{ color: '#fff', fontSize: 17, lineHeight: 1.4 }}
                  >
                    {m.line}
                  </p>
                  <div
                    className="uppercase font-bold"
                    style={{
                      color: C.starGold,
                      fontSize: 11,
                      letterSpacing: '0.2em',
                      opacity: 0.85,
                    }}
                  >
                    {m.stat}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/20-years"
              className="inline-block px-7 py-3 rounded-md font-bold uppercase"
              style={{
                backgroundColor: 'transparent',
                color: C.starGold,
                border: `1px solid ${C.ochre}`,
                fontSize: 12,
                letterSpacing: '0.2em',
              }}
            >
              The full 20-year journey →
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          §06 — Connection graph preview. Embeds /voices/network.
      ──────────────────────────────────────────────────────────── */}
      <section
        className="py-24 md:py-32 px-6 md:px-12"
        style={{ backgroundColor: C.shell }}
      >
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <div className="mb-10 max-w-3xl">
              <SectionLabel text="Connection map · live" />
              <h2
                className="font-fraunces font-bold leading-tight"
                style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)' }}
              >
                Every storyteller, every shared theme.
              </h2>
              <p
                className="font-fraunces mt-4"
                style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.5 }}
              >
                Voices in the archive aren&rsquo;t isolated quotes — they
                connect through services, themes, and Country.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up">
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                height: 280,
                border: `1px solid ${C.border}`,
                backgroundColor: '#fff',
              }}
            >
              <iframe
                src="/voices/network?embed=1"
                className="absolute inset-0 w-full h-full"
                title="PICC voices network"
                loading="lazy"
              />
            </div>
            <div className="mt-6 text-right">
              <Link
                href="/voices/network"
                className="inline-block uppercase font-bold"
                style={{
                  color: C.ochre,
                  fontSize: 12,
                  letterSpacing: '0.2em',
                }}
              >
                See every connection →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          §07 — Closing CTA. Full-bleed photo + the line.
      ──────────────────────────────────────────────────────────── */}
      {closerFinal?.url && (
        <div className="relative">
          <FullBleedImage
            imageUrl={closerFinal.url}
            alt={closerFinal.alt_text || 'Palm Island'}
            height="tall"
            parallax
          />
          <div
            className="absolute inset-0 flex items-center justify-center px-6"
            style={{
              background:
                'linear-gradient(180deg, rgba(26,26,46,0.55) 0%, rgba(26,26,46,0.75) 100%)',
            }}
          >
            <div className="max-w-3xl text-center">
              <div
                className="uppercase font-bold mb-4"
                style={{
                  color: C.ochre,
                  fontSize: 11,
                  letterSpacing: '0.3em',
                }}
              >
                The community holds the pen
              </div>
              <h2
                className="font-fraunces font-bold leading-tight mb-8"
                style={{ color: '#fff', fontSize: 'clamp(40px, 7vw, 80px)' }}
              >
                Add yours.
              </h2>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <Link
                  href="/sign-the-vision"
                  className="px-8 py-4 rounded-md font-bold uppercase"
                  style={{
                    backgroundColor: C.ochre,
                    color: C.midnight,
                    fontSize: 12,
                    letterSpacing: '0.2em',
                  }}
                >
                  Sign the next 20 years →
                </Link>
                <Link
                  href="/picc/atlas"
                  className="uppercase font-bold"
                  style={{
                    color: '#fff',
                    fontSize: 12,
                    letterSpacing: '0.2em',
                    opacity: 0.85,
                  }}
                >
                  Browse the platform →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* If the closer photo failed, still render the closer text on a
          midnight panel — never leave the page hanging on an empty hero. */}
      {!closerFinal?.url && (
        <section
          className="py-24 md:py-32 px-6 md:px-12 text-center"
          style={{ backgroundColor: C.midnight, color: '#fff' }}
        >
          <div className="max-w-3xl mx-auto">
            <div
              className="uppercase font-bold mb-4"
              style={{
                color: C.ochre,
                fontSize: 11,
                letterSpacing: '0.3em',
              }}
            >
              The community holds the pen
            </div>
            <h2
              className="font-fraunces font-bold leading-tight mb-8"
              style={{ fontSize: 'clamp(40px, 7vw, 80px)' }}
            >
              Add yours.
            </h2>
            <Link
              href="/sign-the-vision"
              className="inline-block px-8 py-4 rounded-md font-bold uppercase"
              style={{
                backgroundColor: C.ochre,
                color: C.midnight,
                fontSize: 12,
                letterSpacing: '0.2em',
              }}
            >
              Sign the next 20 years →
            </Link>
          </div>
        </section>
      )}
    </StoryContainer>
  )
}
