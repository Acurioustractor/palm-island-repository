/**
 * Public design-system showcase — the brand demonstrating itself.
 *
 * This page is the proof: every section uses the live tokens, real
 * photos from EL v2, real bespoke icons from public/icons/bespoke,
 * and real voices from extracted_quotes. If anything here looks
 * generic, the system isn't being used right.
 *
 * Companion to BRAND.md at the repo root. Open this page when
 * onboarding designers, briefing AI agents, or sanity-checking
 * that a new surface is on-brand.
 */
import Link from 'next/link'
import Image from 'next/image'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'
import { createServerSupabase } from '@/lib/supabase/client'
import { getPhotosForSlots, getPhotoForSlots, getAnyConsentedPhotos } from '@/lib/media/el-photos'
import { BespokeIcon, type BespokeIconName } from '@/components/ui/BespokeIcon'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export const metadata = {
  title: 'Design system — Saltwater & Earth · PICC',
  description:
    'How PICC looks, sounds and moves. Saltwater & Earth v2.0 — the recipe behind every Palm Island Community Company surface.',
}

interface QuoteRow {
  id: string
  quote_text: string
  attribution: string | null
  theme: string | null
}

const CORE_SWATCHES: Array<{ name: string; token: keyof typeof C; role: string }> = [
  { name: 'Ocean', token: 'ocean', role: 'Primary · headings, borders, trust' },
  { name: 'Ochre', token: 'ochre', role: 'Accent · the signature PICC colour' },
  { name: 'Earth', token: 'earth', role: 'Anchor · deepest text, hero base' },
]

const SUPPORTING_SWATCHES: Array<{ name: string; token: keyof typeof C; role: string }> = [
  { name: 'Reef', token: 'reef', role: 'Links, interactive highlights' },
  { name: 'Mangrove', token: 'mangrove', role: 'Health, growth, success' },
  { name: 'Coral', token: 'coral', role: 'Justice, energy, action' },
  { name: 'Star Gold', token: 'starGold', role: 'Celebration, milestones' },
]

const CULTURAL_SWATCHES: Array<{ name: string; token: keyof typeof C; role: string }> = [
  { name: 'Turtle Red', token: 'turtleRed', role: 'Cultural ceremony, Elder borders' },
  { name: 'Sand', token: 'sand', role: 'Community-voices backgrounds' },
  { name: 'Midnight', token: 'midnight', role: 'Dark heroes, back covers' },
]

const SECTION_MAP: Array<{ name: string; key: keyof typeof SECTION_COLOURS; label: string }> = [
  { name: 'Children & Families', key: 'childrenFamilies', label: 'Ochre' },
  { name: 'Health & Wellbeing', key: 'healthWellbeing', label: 'Mangrove' },
  { name: 'Justice & Safety', key: 'justiceSafety', label: 'Coral' },
  { name: 'Youth', key: 'youth', label: 'Reef' },
  { name: 'Economic', key: 'economic', label: 'Star Gold' },
  { name: 'Education & Community', key: 'educationCommunity', label: 'Ocean' },
  { name: 'Governance', key: 'governance', label: 'Turtle Red' },
]

const TYPE_SAMPLES: Array<{ label: string; sample: string; cls: string; family: string }> = [
  {
    label: 'Display · Fraunces 700',
    sample: 'PICC belongs to the community.',
    cls: 'font-fraunces font-bold leading-tight',
    family: 'fraunces',
  },
  {
    label: 'H1 · Fraunces 700',
    sample: 'The next 20 years are a design choice.',
    cls: 'font-fraunces font-bold leading-tight',
    family: 'fraunces',
  },
  {
    label: 'Lead body · Fraunces 400',
    sample:
      'Working with the community, not for the community. Most of every PICC dollar pays a Palm Islander to deliver a service to another Palm Islander.',
    cls: 'font-fraunces',
    family: 'fraunces',
  },
  {
    label: 'Body · Inter 400',
    sample:
      'Auspiced since 2008. Six staff. ~120 community members supported a year. Bwgcolman Way begins here.',
    cls: 'font-sans',
    family: 'inter',
  },
  {
    label: 'Caption · Inter 700 11px / 0.3em',
    sample: 'COMMUNITY VOICE · ELDER REVIEW · FY 2024–25',
    cls: 'font-sans font-bold uppercase tracking-[0.3em] text-[11px]',
    family: 'inter',
  },
]

const ANTI_PATTERNS = [
  '"We helped / provided / delivered" — PICC is the community delivering to itself',
  'Generic service descriptions that fit any ATSICCO',
  'Cultural language used decoratively (Bwgcolman is not a brand element)',
  'Photos that treat Elders as decoration',
  'Numbers without provenance',
  'Purple gradients, generic SaaS chrome',
  'Cherry-picking heroic stories and hiding the floods',
  'Cookie-cutter layouts that look like another startup',
]

const SERVICE_ICONS: BespokeIconName[] = [
  'aged-care',
  'children',
  'community',
  'culture',
  'disability',
  'economic',
  'education',
  'family',
]

export default async function DesignSystemPage() {
  const supabase = createServerSupabase()

  const [{ data: quoteData }, heroPhoto, voicePhotosPrimary] = await Promise.all([
    supabase
      .from('extracted_quotes')
      .select('id, quote_text, attribution, theme')
      .or('is_validated.eq.true,suggested_for_report.eq.true')
      .order('impact_score', { ascending: false, nullsFirst: false })
      .limit(3),
    // Hero — try cover first (the canonical hero), then any large slot
    getPhotoForSlots(['cover', 'gallery', 'voices-wall', 'elders-on-country']),
    // Photo strip — try voices-wall (25), then gallery (15), then elders, then any
    getPhotosForSlots(['voices-wall', 'gallery', 'elders-on-country'], 6),
  ])

  // If even the slot fallback chain is empty, pull any consented photos so
  // the page never shows an empty state. EL v2 already filtered for consent;
  // there is no path that surfaces an unreviewed photo here.
  const photoStrip =
    voicePhotosPrimary.length > 0 ? voicePhotosPrimary : await getAnyConsentedPhotos(6)
  const quotes = (quoteData || []) as QuoteRow[]

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ backgroundColor: C.midnight }}>
        {heroPhoto?.url && (
          <div className="absolute inset-0 opacity-50">
            <Image
              src={heroPhoto.url}
              alt={heroPhoto.alt_text || 'Palm Island'}
              fill
              priority
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
        <div className="relative px-6 md:px-12 py-24 md:py-32 max-w-5xl mx-auto" style={{ color: '#fff' }}>
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Saltwater & Earth · v2.0
          </div>
          <h1
            className="font-fraunces font-bold leading-tight mb-6"
            style={{ fontSize: 'clamp(40px, 7vw, 72px)' }}
          >
            How PICC looks, sounds and moves.
          </h1>
          <p
            className="font-fraunces max-w-2xl"
            style={{ fontSize: 22, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}
          >
            The brand is the ocean around Palm Island, the earth under it, the night sky above. Every colour, every line of type, every photo on this site obeys the system below. This page is the proof.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link
              href="/sign-the-vision"
              className="px-5 py-3 rounded-md font-bold uppercase tracking-widest"
              style={{ backgroundColor: C.ochre, color: C.midnight, fontSize: 12, letterSpacing: '0.2em' }}
            >
              Sign the next 20 years →
            </Link>
            <a
              href="https://github.com/Acurioustractor/palm-island-repository/blob/main/BRAND.md"
              className="px-5 py-3 rounded-md font-bold uppercase tracking-widest border"
              style={{ borderColor: C.ochre, color: '#fff', fontSize: 12, letterSpacing: '0.2em' }}
            >
              BRAND.md (recipe)
            </a>
          </div>
        </div>
      </section>

      {/* ONE-BREATH IDENTITY */}
      <section className="px-6 md:px-12 py-16 md:py-20" style={{ backgroundColor: C.shell }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            01 · Identity, in one breath
          </div>
          <p
            className="font-fraunces leading-snug mb-6"
            style={{ color: C.ocean, fontSize: 'clamp(28px, 4.5vw, 40px)' }}
          >
            Community-controlled, not community-engaged. Year 17 of a 20-year vision. 197 staff, $23.4M revenue, all run from one island.
          </p>
          <div className="space-y-3 font-fraunces" style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.6 }}>
            <p>“PICC belongs to the community.” — Luella</p>
            <p>“Working with the community, not for the community.” — Rachel</p>
            <p>“Most of every PICC dollar pays a Palm Islander to deliver a service to another Palm Islander.”</p>
          </div>
          <p className="mt-6 text-sm" style={{ color: C.driftwood }}>
            If output doesn&apos;t sound like that, rewrite it.
          </p>
        </div>
      </section>

      {/* VOICE REGISTERS */}
      <section className="px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            02 · Voice — three registers
          </div>
          <h2
            className="font-fraunces font-bold mb-10"
            style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            Every line of copy fits one of these. If it fits none, it&apos;s wrong.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: 'A · Rachel',
                role: 'CEO, Chair messages, frontmatter',
                tone: 'Plain-spoken, Australian. Closes lines that would land in a meeting.',
                line: '“They are our ancestors of tomorrow.”',
                colour: C.ocean,
              },
              {
                label: 'B · Luella',
                role: 'Chair, governance, declaratives',
                tone: 'Public-record cadence. Sharper, shorter, more public.',
                line: '“We do not move on these numbers. They are the point.”',
                colour: C.turtleRed,
              },
              {
                label: 'C · Service / Operations',
                role: 'Service descriptions, captions, infographic numbers',
                tone: 'Specific. Short. Cited in the order staff would cite them.',
                line: '“Auspiced since 2008. Six staff. ~120 community members a year.”',
                colour: C.mangrove,
              },
            ].map((v) => (
              <div
                key={v.label}
                className="p-6 rounded-md border-l-4"
                style={{ borderLeftColor: v.colour, backgroundColor: '#fff' }}
              >
                <div
                  className="uppercase font-bold mb-2"
                  style={{ color: v.colour, fontSize: 10, letterSpacing: '0.3em' }}
                >
                  {v.label}
                </div>
                <div className="text-sm font-bold mb-3" style={{ color: C.ocean }}>
                  {v.role}
                </div>
                <p className="text-sm mb-4" style={{ color: C.driftwood, lineHeight: 1.6 }}>
                  {v.tone}
                </p>
                <p className="font-fraunces italic" style={{ color: C.ocean, fontSize: 17, lineHeight: 1.4 }}>
                  {v.line}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm" style={{ color: C.driftwood }}>
            <strong style={{ color: C.ocean }}>Authenticity test:</strong> would the lead person on this service read this aloud and recognise it? If no, rewrite.
          </p>
        </div>
      </section>

      {/* COLOUR */}
      <section className="px-6 md:px-12 py-16 md:py-20" style={{ backgroundColor: C.shell }}>
        <div className="max-w-5xl mx-auto">
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            03 · Colour — Saltwater & Earth
          </div>
          <h2
            className="font-fraunces font-bold mb-3"
            style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            The palette is drawn from Palm Island itself.
          </h2>
          <p className="mb-10 font-fraunces" style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.6 }}>
            Ocean, ochre, earth. Reef, mangrove, coral. Every colour has a reason rooted in place.
          </p>

          <div className="space-y-10">
            {[
              { title: 'Core (these three are the brand)', list: CORE_SWATCHES },
              { title: 'Supporting (functional)', list: SUPPORTING_SWATCHES },
              { title: 'Cultural (sparingly) + anchor', list: CULTURAL_SWATCHES },
            ].map((group) => (
              <div key={group.title}>
                <h3
                  className="uppercase font-bold mb-4"
                  style={{ color: C.driftwood, fontSize: 11, letterSpacing: '0.3em' }}
                >
                  {group.title}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {group.list.map((s) => (
                    <div
                      key={s.token}
                      className="rounded-md overflow-hidden border"
                      style={{ borderColor: C.border }}
                    >
                      <div
                        className="h-28"
                        style={{ backgroundColor: C[s.token] }}
                        aria-hidden
                      />
                      <div className="p-4 bg-white">
                        <div
                          className="font-fraunces font-bold mb-1"
                          style={{ color: C.ocean, fontSize: 18 }}
                        >
                          {s.name}
                        </div>
                        <div
                          className="text-xs font-mono mb-2"
                          style={{ color: C.driftwood }}
                        >
                          {C[s.token]} · <code>{s.token}</code>
                        </div>
                        <div className="text-xs" style={{ color: C.driftwood, lineHeight: 1.5 }}>
                          {s.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Section colour map */}
          <div className="mt-12">
            <h3
              className="uppercase font-bold mb-4"
              style={{ color: C.driftwood, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Section colours
            </h3>
            <div className="flex flex-wrap gap-2">
              {SECTION_MAP.map((s) => (
                <div
                  key={s.key}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm border"
                  style={{ borderColor: C.border, backgroundColor: '#fff' }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: SECTION_COLOURS[s.key] }}
                    aria-hidden
                  />
                  <span style={{ color: C.ocean }}>{s.name}</span>
                  <span style={{ color: C.driftwood }} className="text-xs">
                    → {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TYPOGRAPHY */}
      <section className="px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            04 · Typography
          </div>
          <h2
            className="font-fraunces font-bold mb-3"
            style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            Fraunces displays. Inter speaks.
          </h2>
          <p className="mb-10 font-fraunces" style={{ color: C.driftwood, fontSize: 18 }}>
            Captions are uppercase 11px Inter 700, letter-spaced 0.3em. That cadence is the brand.
          </p>

          <div className="space-y-8">
            {TYPE_SAMPLES.map((t) => (
              <div
                key={t.label}
                className="border-t pt-6"
                style={{ borderColor: C.border }}
              >
                <div
                  className="uppercase font-bold mb-3"
                  style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.3em' }}
                >
                  {t.label}
                </div>
                <div
                  className={t.cls}
                  style={{
                    color: C.ocean,
                    fontSize:
                      t.label.startsWith('Display')
                        ? 'clamp(40px, 7vw, 64px)'
                        : t.label.startsWith('H1')
                        ? 'clamp(32px, 5vw, 48px)'
                        : t.label.startsWith('Lead body')
                        ? 20
                        : t.label.startsWith('Body')
                        ? 16
                        : 11,
                  }}
                >
                  {t.sample}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ICONS */}
      <section className="px-6 md:px-12 py-16 md:py-20" style={{ backgroundColor: C.shell }}>
        <div className="max-w-5xl mx-auto">
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            05 · Icons — bespoke set
          </div>
          <h2
            className="font-fraunces font-bold mb-3"
            style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            44 service icons, drawn for PICC.
          </h2>
          <p className="mb-10 font-fraunces" style={{ color: C.driftwood, fontSize: 18 }}>
            Lucide is for UI utility. PICC services use the bespoke set — drawn so a Palm Islander can recognise themselves in the symbol.
          </p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {SERVICE_ICONS.map((slug) => (
              <div
                key={slug}
                className="aspect-square rounded-md border p-3 flex flex-col items-center justify-center bg-white"
                style={{ borderColor: C.border }}
              >
                <BespokeIcon name={slug} size={64} />
                <div className="mt-2 text-[10px] uppercase font-bold tracking-wider text-center" style={{ color: C.driftwood }}>
                  {slug.replace(/-/g, ' ')}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs" style={{ color: C.driftwood }}>
            Served from Supabase Storage <code>platform-icons</code> bucket via <code>assetUrl()</code>. Full set: 44 service icons + white variants.
          </p>
        </div>
      </section>

      {/* PHOTOS */}
      <section className="px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            06 · Photographs — Empathy Ledger v2
          </div>
          <h2
            className="font-fraunces font-bold mb-3"
            style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            Real people. Real island. Consent at the source.
          </h2>
          <p className="mb-10 font-fraunces" style={{ color: C.driftwood, fontSize: 18 }}>
            Live from Empathy Ledger v2 via{' '}
            <code className="text-base">lib/media/el-photos.ts</code>. Slot-tagged, consent-cleared, named where named. The page tries{' '}
            <code className="text-sm">voices-wall</code> →{' '}
            <code className="text-sm">gallery</code> →{' '}
            <code className="text-sm">elders-on-country</code> in order; if every slot is empty it still surfaces consented photos so the showcase never shows a blank.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photoStrip.map((p) => (
              <div
                key={p.id}
                className="aspect-[4/5] rounded-md overflow-hidden border relative"
                style={{ borderColor: C.border }}
              >
                {p.url && (
                  <Image
                    src={p.url}
                    alt={p.alt_text || 'PICC community photograph'}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    style={{ objectFit: 'cover' }}
                  />
                )}
                {(p.caption || p.alt_text) && (
                  <div
                    className="absolute bottom-0 left-0 right-0 p-3 text-[11px]"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                      color: '#fff',
                    }}
                  >
                    {p.caption || p.alt_text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY VOICES */}
      {quotes.length > 0 && (
        <section className="px-6 md:px-12 py-16 md:py-20" style={{ backgroundColor: C.sand }}>
          <div className="max-w-4xl mx-auto">
            <div
              className="uppercase font-bold mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              07 · Voice in the wild
            </div>
            <h2
              className="font-fraunces font-bold mb-10"
              style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 40px)' }}
            >
              Quotes pulled live from <code className="text-base">extracted_quotes</code>, validated for public lift.
            </h2>
            <div className="space-y-8">
              {quotes.map((q) => (
                <figure key={q.id}>
                  <blockquote
                    className="font-fraunces italic leading-snug"
                    style={{ color: C.ocean, fontSize: 'clamp(22px, 3vw, 32px)' }}
                  >
                    “{q.quote_text}”
                  </blockquote>
                  <figcaption className="mt-3 text-sm" style={{ color: C.driftwood }}>
                    — {q.attribution || 'Anonymous'}
                    {q.theme && <span className="ml-2 capitalize">· {q.theme}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ANTI-PATTERNS */}
      <section className="px-6 md:px-12 py-16 md:py-20" style={{ backgroundColor: C.midnight, color: '#fff' }}>
        <div className="max-w-4xl mx-auto">
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.coral, fontSize: 11, letterSpacing: '0.3em' }}
          >
            08 · Never do these
          </div>
          <h2
            className="font-fraunces font-bold mb-8"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            The anti-patterns. If your output does any of these, rewrite.
          </h2>
          <ul className="space-y-3">
            {ANTI_PATTERNS.map((p) => (
              <li
                key={p}
                className="font-fraunces flex items-start gap-3"
                style={{ fontSize: 18, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)' }}
              >
                <span style={{ color: C.coral }} aria-hidden>
                  ✕
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* THE 20-YEAR STORY */}
      <section className="px-6 md:px-12 py-20 md:py-24" style={{ backgroundColor: C.shell }}>
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            09 · Why all of this exists
          </div>
          <h2
            className="font-fraunces font-bold leading-tight mb-6"
            style={{ color: C.ocean, fontSize: 'clamp(36px, 6vw, 56px)' }}
          >
            The next 20 years are a design choice, not a forecast.
          </h2>
          <p className="font-fraunces mb-8" style={{ color: C.driftwood, fontSize: 20, lineHeight: 1.5 }}>
            Twenty years of community control. Bwgcolman Way as proof. The next 20 as canvas. The brand is in service of one story — and the community holds the pen.
          </p>
          <Link
            href="/sign-the-vision"
            className="inline-block px-8 py-4 rounded-md font-bold uppercase tracking-widest"
            style={{ backgroundColor: C.ocean, color: '#fff', fontSize: 13, letterSpacing: '0.2em' }}
          >
            Sign the next 20 years →
          </Link>
        </div>
      </section>
    </main>
  )
}
