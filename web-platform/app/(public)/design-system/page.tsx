/**
 * /design-system — public brand showcase.
 *
 * Saltwater Almanac grammar applied to itself: full-bleed photos,
 * big Fraunces displays, caption-above-headline, scroll-driven motion,
 * voices heard not described. The page IS the brand it describes.
 */
import Link from 'next/link'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'
import { createServerSupabase } from '@/lib/supabase/client'
import {
  getPhotosForSlots,
  getPhotoForSlots,
  getAnyConsentedPhotos,
} from '@/lib/media/el-photos'
import { assetUrl } from '@/lib/media/asset-url'
import {
  HeroSection,
  QuoteSection,
  FullBleedImage,
  ImageGallery,
  ScrollReveal,
  StoryContainer,
} from '@/components/story-scroll'
import { BespokeIcon, type BespokeIconName } from '@/components/ui/BespokeIcon'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export const metadata = {
  title: 'Saltwater & Earth — how PICC looks, sounds and moves',
  description:
    'PICC has its own voice. This is how it sounds, looks, and moves. Saltwater & Earth v2.0 — the design DNA of every Palm Island Community Company surface.',
}

interface QuoteRow {
  id: string
  quote_text: string
  attribution: string | null
  theme: string | null
}

const COUNTRY_COLOURS: Array<{
  name: string
  hex: string
  line: string
  fg: string // text colour for legibility on the swatch
}> = [
  {
    name: 'Ocean',
    hex: C.ocean,
    line: 'The deep waters around Palm Island. Trust, gravity, primary.',
    fg: '#fff',
  },
  {
    name: 'Ochre',
    hex: C.ochre,
    line: 'Golden warmth from the logo. Heritage. The signature.',
    fg: C.midnight,
  },
  {
    name: 'Earth',
    hex: C.earth,
    line: 'Near-black anchor. The deepest text, the hero gradient base.',
    fg: '#fff',
  },
  {
    name: 'Mangrove',
    hex: C.mangrove,
    line: 'Where health and growth take root.',
    fg: '#fff',
  },
  {
    name: 'Coral',
    hex: C.coral,
    line: 'Justice and community action — energy where it is needed.',
    fg: '#fff',
  },
  {
    name: 'Turtle Red',
    hex: C.turtleRed,
    line: 'Ceremony. Cultural significance. Used sparingly, with consent.',
    fg: '#fff',
  },
]

const ICONS_IN_CONTEXT: Array<{
  name: BespokeIconName
  label: string
  bg: string
  fg: string
}> = [
  { name: 'children', label: 'Children', bg: C.ochre, fg: C.midnight },
  { name: 'health', label: 'Health & Wellbeing', bg: C.mangrove, fg: '#fff' },
  { name: 'family', label: 'Family', bg: C.coral, fg: '#fff' },
  { name: 'youth', label: 'Youth', bg: C.reef, fg: '#fff' },
  { name: 'aged-care', label: 'Aged Care', bg: C.starGold, fg: C.midnight },
  { name: 'governance', label: 'Governance', bg: C.turtleRed, fg: '#fff' },
  { name: 'economic', label: 'Economic', bg: C.ocean, fg: '#fff' },
  { name: 'education', label: 'Education', bg: C.driftwood, fg: '#fff' },
]

const TYPOGRAPHY_SAMPLES = [
  {
    label: 'Display · Fraunces',
    text: 'PICC belongs to the community.',
    cls: 'font-fraunces font-bold leading-[1.05]',
    sizeStyle: { fontSize: 'clamp(40px, 7vw, 88px)', color: C.ocean },
  },
  {
    label: 'Heading · Fraunces',
    text: 'They are our ancestors of tomorrow.',
    cls: 'font-fraunces font-bold leading-tight',
    sizeStyle: { fontSize: 'clamp(28px, 4.5vw, 48px)', color: C.ocean },
  },
  {
    label: 'Lead body · Fraunces',
    text: 'Most of every PICC dollar pays a Palm Islander to deliver a service to another Palm Islander.',
    cls: 'font-fraunces',
    sizeStyle: { fontSize: 22, lineHeight: 1.5, color: C.driftwood },
  },
  {
    label: 'Body · Inter',
    text: 'Auspiced since 2008. Six staff. ~120 community members supported a year. Bwgcolman Way begins here.',
    cls: 'font-sans',
    sizeStyle: { fontSize: 16, lineHeight: 1.6, color: C.ocean },
  },
  {
    label: 'Caption · Inter 700 / 0.3em',
    text: 'COMMUNITY VOICE · ELDER REVIEW · FY 2024–25',
    cls: 'font-sans font-bold uppercase',
    sizeStyle: { fontSize: 11, letterSpacing: '0.3em', color: C.turtleRed },
  },
]

const ANTI_PATTERNS = [
  'We do not use purple gradients.',
  'We do not say "we helped" or "we provided" — PICC is the community delivering to itself.',
  'We do not treat Elders as decoration.',
  'We do not put numbers on the page without provenance.',
  'We do not use cultural language as decoration.',
  'We do not let anyone else hold our pen.',
]

export default async function DesignSystemPage() {
  const supabase = createServerSupabase()

  const [{ data: quoteData }, heroPhoto, galleryPhotos, ancestorPhoto] = await Promise.all([
    supabase
      .from('extracted_quotes')
      .select('id, quote_text, attribution, theme')
      .or('is_validated.eq.true,suggested_for_report.eq.true')
      .order('impact_score', { ascending: false, nullsFirst: false })
      .limit(3),
    // Cinematic hero — try cover, then big slots
    getPhotoForSlots(['cover', 'gallery', 'voices-wall', 'elders-on-country']),
    // Photo gallery section — pull a wide set
    getPhotosForSlots(['voices-wall', 'gallery', 'elders-on-country'], 8),
    // Smaller ancestor photo for the closer
    getPhotoForSlots(['elders-on-country', 'voices-wall', 'cover']),
  ])

  const galleryFinal =
    galleryPhotos.length > 0 ? galleryPhotos : await getAnyConsentedPhotos(8)
  const quotes = (quoteData || []) as QuoteRow[]

  return (
    <StoryContainer>
      {/* §00 — Cinematic hero */}
      <HeroSection
        title="PICC has its own voice."
        subtitle="This is how it sounds, looks, and moves."
        backgroundImage={heroPhoto?.url || undefined}
        backgroundVideo={!heroPhoto?.url ? assetUrl('/hero-assets/clips/palm-island-sunset.mp4') : undefined}
        height="screen"
        overlay="gradient"
        textPosition="center"
      >
        <div className="mt-8 flex flex-col items-center gap-3">
          <div
            className="uppercase font-bold"
            style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Saltwater & Earth · v2.0
          </div>
          <Link
            href="/sign-the-vision"
            className="px-6 py-3 rounded-md font-bold uppercase tracking-widest"
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

      {/* §01 — The voice, heard not described. Three real registers. */}
      <QuoteSection
        quote="Working with the community, not for the community."
        author="Rachel Atkinson"
        role="CEO since 2007"
        backgroundColor=""
        textColor="text-white"
        size="large"
      />
      {/* The QuoteSection above takes a backgroundColor className; we wrap
          it ourselves to ensure the shell is on-brand */}
      <style>{`
        section.bg-gradient-to-br { background: ${C.ocean} !important; }
      `}</style>

      <section
        className="px-6 md:px-12 py-24 md:py-32 relative"
        style={{ backgroundColor: C.shell }}
      >
        <ScrollReveal direction="up">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className="uppercase font-bold mb-6"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Luella · Chair · public-record cadence
            </div>
            <blockquote
              className="font-fraunces font-bold leading-tight mb-6"
              style={{ color: C.ocean, fontSize: 'clamp(36px, 6vw, 64px)' }}
            >
              "PICC belongs to the community."
            </blockquote>
            <p
              className="font-fraunces"
              style={{ color: C.driftwood, fontSize: 22, lineHeight: 1.5 }}
            >
              Sharper. Shorter. More public. Lines that close on emphasis.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <section
        className="px-6 md:px-12 py-24 md:py-32"
        style={{ backgroundColor: C.mangrove, color: '#fff' }}
      >
        <ScrollReveal direction="up">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className="uppercase font-bold mb-6"
              style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Service · operations · staff would own every word
            </div>
            <blockquote
              className="font-fraunces font-bold leading-snug mb-6"
              style={{ fontSize: 'clamp(28px, 5vw, 56px)' }}
            >
              "Auspiced since 2008. Six staff. About 120 community members
              supported a year."
            </blockquote>
            <p
              className="font-fraunces"
              style={{ color: 'rgba(255,255,255,0.85)', fontSize: 22, lineHeight: 1.5 }}
            >
              Specific. Short. Cited in the order staff would cite them.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* §02 — Colour as Country. Six full-bleed colour-blocks. */}
      <section className="py-20" style={{ backgroundColor: '#FBF8EE' }}>
        <ScrollReveal direction="up">
          <div className="max-w-3xl mx-auto px-6 mb-12 text-center">
            <div
              className="uppercase font-bold mb-3"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Colour · Saltwater & Earth
            </div>
            <h2
              className="font-fraunces font-bold leading-tight"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)' }}
            >
              Every colour comes from somewhere on the island.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2">
          {COUNTRY_COLOURS.map((c) => (
            <div
              key={c.name}
              className="aspect-[3/2] md:aspect-[5/3] flex flex-col justify-end p-8 md:p-12"
              style={{ backgroundColor: c.hex, color: c.fg }}
            >
              <div
                className="uppercase font-bold mb-2"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.3em',
                  opacity: 0.7,
                }}
              >
                {c.hex}
              </div>
              <div
                className="font-fraunces font-bold leading-none mb-3"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
              >
                {c.name}
              </div>
              <p
                className="font-fraunces max-w-md"
                style={{ fontSize: 18, lineHeight: 1.5 }}
              >
                {c.line}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* §03 — Typography lived. Real lines at real size. */}
      <section className="py-24 md:py-32 px-6 md:px-12" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal direction="up">
            <div
              className="uppercase font-bold mb-3"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Typography
            </div>
            <h2
              className="font-fraunces font-bold leading-tight mb-3"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)' }}
            >
              Fraunces displays. Inter speaks.
            </h2>
            <p
              className="font-fraunces mb-16 max-w-2xl"
              style={{ color: C.driftwood, fontSize: 20 }}
            >
              The cadence below is the brand. Read each line aloud — it should
              sound like the person it came from.
            </p>
          </ScrollReveal>

          <div className="space-y-12">
            {TYPOGRAPHY_SAMPLES.map((t) => (
              <ScrollReveal direction="up" key={t.label}>
                <div className="border-t pt-8" style={{ borderColor: C.border }}>
                  <div
                    className="uppercase font-bold mb-4"
                    style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.3em' }}
                  >
                    {t.label}
                  </div>
                  <div className={t.cls} style={t.sizeStyle}>
                    {t.text}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* §04 — The mark. Icons in context, doing their job. */}
      <section className="py-20" style={{ backgroundColor: C.shell }}>
        <ScrollReveal direction="up">
          <div className="max-w-3xl mx-auto px-6 mb-12 text-center">
            <div
              className="uppercase font-bold mb-3"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              The mark
            </div>
            <h2
              className="font-fraunces font-bold leading-tight"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)' }}
            >
              44 icons drawn for PICC, not picked from a stock set.
            </h2>
            <p
              className="font-fraunces mt-4"
              style={{ color: C.driftwood, fontSize: 18 }}
            >
              Each one drawn so a Palm Islander can recognise themselves in
              the symbol.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 max-w-6xl mx-auto px-6 gap-4">
          {ICONS_IN_CONTEXT.map((i) => (
            <div
              key={i.name}
              className="aspect-square rounded-2xl p-6 flex flex-col items-center justify-center"
              style={{ backgroundColor: i.bg, color: i.fg }}
            >
              <BespokeIcon name={i.name} size={88} darkMode={i.fg === '#fff'} />
              <div
                className="mt-4 uppercase font-bold text-center"
                style={{ fontSize: 11, letterSpacing: '0.2em' }}
              >
                {i.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* §05 — The people. Photos, full bleed, named. */}
      {heroPhoto?.url && (
        <FullBleedImage
          imageUrl={heroPhoto.url}
          alt={heroPhoto.alt_text || 'Palm Island'}
          caption={heroPhoto.caption || heroPhoto.alt_text || undefined}
          height="tall"
          parallax
        />
      )}

      <section className="py-20 px-6 md:px-12">
        <ScrollReveal direction="up">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <div
              className="uppercase font-bold mb-3"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Photographs · Empathy Ledger v2
            </div>
            <h2
              className="font-fraunces font-bold leading-tight"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)' }}
            >
              Real people. Real island. Consent at the source.
            </h2>
            <p
              className="font-fraunces mt-4"
              style={{ color: C.driftwood, fontSize: 18 }}
            >
              Live from the community-controlled archive. Reviewed before it
              surfaces, named where named.
            </p>
          </div>
        </ScrollReveal>
        <div className="max-w-6xl mx-auto">
          {galleryFinal.length > 0 && (
            <ImageGallery
              images={galleryFinal.slice(0, 6).map((p) => ({
                url: p.url,
                alt: p.alt_text || 'PICC community photograph',
                caption: p.caption || p.alt_text || undefined,
              }))}
              columns={3}
            />
          )}
        </div>
      </section>

      {/* §06 — Voice in the wild. Three real archive quotes. */}
      {quotes.length > 0 && (
        <section
          className="py-24 md:py-32 px-6 md:px-12"
          style={{ backgroundColor: C.sand }}
        >
          <div className="max-w-4xl mx-auto">
            <ScrollReveal direction="up">
              <div
                className="uppercase font-bold mb-3"
                style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
              >
                Voice in the wild
              </div>
              <h2
                className="font-fraunces font-bold leading-tight mb-12"
                style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)' }}
              >
                Validated, attributed, ready for public lift.
              </h2>
            </ScrollReveal>
            <div className="space-y-12">
              {quotes.map((q) => (
                <ScrollReveal direction="up" key={q.id}>
                  <figure>
                    <blockquote
                      className="font-fraunces italic leading-snug"
                      style={{ color: C.ocean, fontSize: 'clamp(24px, 3.5vw, 40px)' }}
                    >
                      &ldquo;{q.quote_text}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4 text-sm" style={{ color: C.driftwood }}>
                      — {q.attribution || 'Anonymous'}
                      {q.theme && (
                        <span className="ml-2 capitalize">· {q.theme}</span>
                      )}
                    </figcaption>
                  </figure>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* §07 — What we never do. Manifesto on midnight. */}
      <section
        className="py-24 md:py-32 px-6 md:px-12"
        style={{ backgroundColor: C.midnight, color: '#fff' }}
      >
        <div className="max-w-4xl mx-auto">
          <ScrollReveal direction="up">
            <div
              className="uppercase font-bold mb-4"
              style={{ color: C.coral, fontSize: 11, letterSpacing: '0.3em' }}
            >
              What we never do
            </div>
            <h2
              className="font-fraunces font-bold leading-tight mb-12"
              style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
            >
              Six lines that hold the brand.
            </h2>
          </ScrollReveal>
          <ul className="space-y-6">
            {ANTI_PATTERNS.map((p) => (
              <ScrollReveal direction="up" key={p}>
                <li
                  className="font-fraunces leading-tight border-l-4 pl-5"
                  style={{
                    borderLeftColor: C.coral,
                    fontSize: 'clamp(20px, 2.5vw, 28px)',
                    color: 'rgba(255,255,255,0.95)',
                  }}
                >
                  {p}
                </li>
              </ScrollReveal>
            ))}
          </ul>
        </div>
      </section>

      {/* §08 — The closer. Sunset + 20-year line + sign-the-vision. */}
      {ancestorPhoto?.url && (
        <FullBleedImage
          imageUrl={ancestorPhoto.url}
          alt={ancestorPhoto.alt_text || 'Palm Island'}
          height="medium"
          parallax
        />
      )}

      <section className="py-24 md:py-32 px-6 md:px-12 text-center" style={{ backgroundColor: C.shell }}>
        <ScrollReveal direction="up">
          <div className="max-w-3xl mx-auto">
            <div
              className="uppercase font-bold mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Why all of this exists
            </div>
            <h2
              className="font-fraunces font-bold leading-tight mb-6"
              style={{ color: C.ocean, fontSize: 'clamp(40px, 7vw, 80px)' }}
            >
              The next 20 years are a design choice, not a forecast.
            </h2>
            <p
              className="font-fraunces mb-10"
              style={{ color: C.driftwood, fontSize: 22, lineHeight: 1.5 }}
            >
              The brand is in service of one story — and the community holds the pen.
            </p>
            <Link
              href="/sign-the-vision"
              className="inline-block px-10 py-5 rounded-md font-bold uppercase"
              style={{
                backgroundColor: C.ocean,
                color: '#fff',
                fontSize: 13,
                letterSpacing: '0.2em',
              }}
            >
              Sign the next 20 years →
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </StoryContainer>
  )
}
