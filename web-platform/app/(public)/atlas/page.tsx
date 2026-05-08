/**
 * /atlas — public master directory.
 *
 * One page that routes visitors to every domain on PICC's platform.
 * Mirrors /picc/atlas in structure but stripped of admin chrome — no
 * operator triad, no QR for the meeting, no admin badges. Designed
 * for a CEO walk-through and for any new visitor needing to find
 * their way around.
 *
 * Sections (each is a domain card with hero copy + preview tiles +
 * deep links):
 *   01 Voices · 02 Services · 03 Projects · 04 Elders ·
 *   05 20-year story · 06 Brand & impact · 07 Get involved
 *
 * Live data via the canonical EL endpoints — same helpers the rest
 * of the platform uses, so the counts here always match the rest of
 * the site.
 */
import Link from 'next/link'
import Image from 'next/image'
import {
  Mic,
  Users,
  Sparkles,
  Compass,
  Tv2,
  Camera,
  PenLine,
  ArrowRight,
} from 'lucide-react'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'
import { createServerSupabase } from '@/lib/supabase/client'
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'
import { getPiccServices } from '@/lib/services/el-services'
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects'
import { getELStats } from '@/lib/empathy-ledger/el-server'
import { getPhotosForSlots } from '@/lib/media/el-photos'
import AnimatedStat from '@/components/data/AnimatedStat'
import { ScrollReveal } from '@/components/story-scroll'
import AtlasPublicSearch from './AtlasPublicSearch'
import { ogMeta } from '@/lib/seo/og'

export const metadata = ogMeta({
  title: 'Atlas — every part of the platform · PICC',
  description:
    'One page that connects every voice, every service, every project, every photograph in the Palm Island Community Company archive.',
  path: '/atlas',
})

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SurfaceTile {
  title: string
  description: string
  href: string
  cover?: string | null
  badge?: string
}

interface DomainSection {
  id: string
  label: string
  blurb: string
  colour: string
  icon: React.ReactNode
  cta: { href: string; label: string }
  tiles: SurfaceTile[]
}

export default async function PublicAtlasPage() {
  const [storytellers, services, projects, elStats, approvedVisionsRes, voicesWallPhotos] =
    await Promise.all([
      getPiccStorytellers({ limit: 500 }).catch(() => []),
      getPiccServices({ status: 'active' }).catch(() => []),
      getPiccProjects({ status: 'all' }).catch(() => []),
      getELStats().catch(() => ({ quotes: 0, transcripts: 0, stories: 0, media: 0 })),
      createServerSupabase()
        .from('community_visions')
        .select('id', { count: 'exact', head: true })
        .eq('is_approved', true),
      getPhotosForSlots(['voices-wall', 'gallery', 'elders-on-country'], 6).catch(() => []),
    ])

  const totalServices = services.length
  const totalStorytellers = storytellers.length
  const totalProjects = projects.filter((p) => p.status !== 'cancelled').length
  const totalApprovedVisions = approvedVisionsRes.count ?? 0
  const totalElders = storytellers.filter((s) => s.is_elder).length
  const totalQuotes = elStats.quotes

  // Featured tiles per domain — pick the rows with covers + photos so the
  // preview never shows a broken image.
  const featuredServices: SurfaceTile[] = services
    .filter((s) => s.image_url)
    .slice(0, 4)
    .map((s) => ({
      title: s.name,
      description: (s.description || '').slice(0, 90),
      href: `/services/${s.slug}`,
      cover: s.image_url,
    }))

  const featuredProjects: SurfaceTile[] = projects
    .filter((p) => p.cover_image_url && p.status !== 'cancelled')
    .slice(0, 3)
    .map((p) => ({
      title: p.name,
      description: p.tagline || (p.description || '').slice(0, 90),
      href: `/projects/${p.slug}`,
      cover: p.cover_image_url,
    }))

  const featuredVoices: SurfaceTile[] = storytellers
    .filter((s) => s.photo_url && s.is_elder)
    .slice(0, 4)
    .map((s) => ({
      title: s.display_name,
      description: s.role || 'Elder · Palm Island',
      href: `/voices/${s.slug}`,
      cover: s.photo_url,
      badge: 'Elder',
    }))

  const sections: DomainSection[] = [
    {
      id: 'voices',
      label: 'Voices',
      blurb:
        'Every named storyteller, every theme, every quote — one community-controlled archive of who has spoken and what they said.',
      colour: SECTION_COLOURS.youth,
      icon: <Mic className="w-5 h-5" />,
      cta: { href: '/voices', label: 'Open the voices wall →' },
      tiles: featuredVoices.length > 0
        ? featuredVoices
        : [
            {
              title: 'Bento mosaic',
              description: `${totalStorytellers} storytellers · ${totalElders} elders · faces with overlays`,
              href: '/voices',
            },
            {
              title: 'Connection map',
              description: 'Force-graph of who appears alongside whom — shared photos, shared themes',
              href: '/voices/network',
            },
            {
              title: 'Themes',
              description: 'Featured themes-of-the-year + every tag in the archive',
              href: '/voices/themes',
            },
          ],
    },
    {
      id: 'services',
      label: 'Services',
      blurb:
        'Twenty-six services PICC delivers across family, health, justice, youth, economic, community and education — every one with photos, voices, and the people who run them.',
      colour: SECTION_COLOURS.educationCommunity,
      icon: <Users className="w-5 h-5" />,
      cta: { href: '/services', label: `Open all ${totalServices} services →` },
      tiles: featuredServices,
    },
    {
      id: 'projects',
      label: 'Projects on Country',
      blurb:
        'Every project is an innovation project — discrete pieces of work that drive the next twenty years. Live from the community-controlled archive.',
      colour: SECTION_COLOURS.economic,
      icon: <Sparkles className="w-5 h-5" />,
      cta: { href: '/projects', label: `Open all ${totalProjects} projects →` },
      tiles: featuredProjects,
    },
    {
      id: 'elders',
      label: 'Elders',
      blurb:
        'Cultural authority. Named, consented, never decoration. Trip stories, leadership themes, and the kinship lines being mapped with care.',
      colour: SECTION_COLOURS.governance,
      icon: <Compass className="w-5 h-5" />,
      cta: { href: '/elders', label: `Open the elders directory →` },
      tiles: [
        {
          title: 'Elders directory',
          description: `${totalElders} named elders with bio, portrait, role`,
          href: '/elders',
        },
        {
          title: 'What the Elders teach',
          description: 'Leadership themes from validated voices',
          href: '/elders/leadership',
        },
        {
          title: 'Connection map',
          description: 'Family-tree threads · shared themes · shared services',
          href: '/voices/network',
        },
      ],
    },
    {
      id: 'twenty',
      label: '20-year story',
      blurb:
        'Twenty years of community control. Bwgcolman Way as proof. The next twenty as a design choice — and the community holds the pen.',
      colour: SECTION_COLOURS.all,
      icon: <Tv2 className="w-5 h-5" />,
      cta: { href: '/20-years', label: 'Open the 17-year journey →' },
      tiles: [
        {
          title: '17-year journey',
          description: 'Year-by-year scroll · growth chart · milestones',
          href: '/20-years',
        },
        {
          title: 'Bwgcolman Way',
          description: 'Delegated authority · Part 2A · 439 children statewide',
          href: '/bwgcolman',
        },
        {
          title: 'Sign the next 20',
          description: 'Endorse a vision or add your own — visions reviewed by Elders',
          href: '/sign-the-vision',
          badge: `${totalApprovedVisions} signed`,
        },
      ],
    },
    {
      id: 'brand',
      label: 'Brand & showcase',
      blurb:
        'Saltwater & Earth — how PICC looks, sounds and moves. The brand DNA in one cinematic page, plus the wider showcase.',
      colour: SECTION_COLOURS.justiceSafety,
      icon: <Camera className="w-5 h-5" />,
      cta: { href: '/showcase', label: 'Open the showcase →' },
      tiles: [
        {
          title: 'Public showcase',
          description: 'Cinematic hero · counters · innovation projects · voice in the wild',
          href: '/showcase',
        },
        {
          title: 'Design system',
          description: 'Saltwater & Earth · voice registers · type · the manifesto',
          href: '/design-system',
        },
      ],
    },
    {
      id: 'capture',
      label: 'Get involved',
      blurb:
        'Add your voice. The community-controlled archive grows when more people sign their name to it.',
      colour: SECTION_COLOURS.economic,
      icon: <PenLine className="w-5 h-5" />,
      cta: { href: '/sign-the-vision', label: 'Sign the next 20 years →' },
      tiles: [
        {
          title: 'Sign the vision',
          description: 'Endorse one of six visions or add your own',
          href: '/sign-the-vision',
        },
        {
          title: 'Leave a note',
          description: 'Free-form note for the public archive',
          href: '/share-note',
        },
      ],
    },
  ]

  // Flat search index — every tile + a synthetic "section open" entry
  const flatTiles = sections.flatMap((s) => [
    {
      title: `Open ${s.label}`,
      description: s.blurb,
      href: s.cta.href,
      group: s.label,
      groupColour: s.colour,
    },
    ...s.tiles.map((t) => ({
      title: t.title,
      description: t.description,
      href: t.href,
      group: s.label,
      groupColour: s.colour,
    })),
  ])

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero with search */}
      <section className="px-6 md:px-12 pt-16 md:pt-20 pb-8" style={{ backgroundColor: C.shell }}>
        <div className="max-w-6xl mx-auto">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Atlas · the public directory
          </div>
          <h1
            className="font-fraunces font-bold leading-[1.05] mb-5"
            style={{ color: C.ocean, fontSize: 'clamp(40px, 7vw, 84px)' }}
          >
            One page. Every part of the platform.
          </h1>
          <p
            className="font-fraunces max-w-2xl mb-8"
            style={{ color: C.driftwood, fontSize: 20, lineHeight: 1.5 }}
          >
            Voices, services, projects, elders, history, the 20-year canvas, and ways to add your own — all in one place, all driven by the community-controlled archive.
          </p>
          <AtlasPublicSearch tiles={flatTiles} />
        </div>
      </section>

      {/* Live counter strip */}
      <section className="px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            <AnimatedStat value={totalServices} label="Active services" colour="ocean" size="md" provenance="Empathy Ledger" />
            <AnimatedStat value={totalStorytellers} label="Named storytellers" colour="ochre" size="md" provenance="Empathy Ledger" />
            <AnimatedStat value={totalQuotes} label="Voices in archive" colour="mangrove" size="md" provenance="Empathy Ledger" />
            <AnimatedStat value={totalProjects} label="Public projects" colour="coral" size="md" provenance="Empathy Ledger" />
            <AnimatedStat value={totalApprovedVisions} label="Visions signed" colour="turtleRed" size="md" provenance="Community canvas" delay={400} />
          </div>
        </div>
      </section>

      {/* Domain sections */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-6xl mx-auto space-y-16">
          {sections.map((sec) => (
            <ScrollReveal direction="up" key={sec.id}>
              <div>
                <div className="flex items-baseline justify-between flex-wrap gap-3 mb-5">
                  <div className="flex items-center gap-3" style={{ color: sec.colour }}>
                    {sec.icon}
                    <h2
                      className="font-fraunces font-bold"
                      style={{ color: sec.colour, fontSize: 'clamp(26px, 3.5vw, 36px)' }}
                    >
                      {sec.label}
                    </h2>
                  </div>
                  <Link
                    href={sec.cta.href}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
                    style={{ color: C.ocean, letterSpacing: '0.2em' }}
                  >
                    {sec.cta.label}
                  </Link>
                </div>
                <p
                  className="font-fraunces max-w-3xl mb-6"
                  style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.55 }}
                >
                  {sec.blurb}
                </p>
                {sec.tiles.length > 0 && (
                  <div
                    className={
                      sec.tiles.some((t) => t.cover)
                        ? 'grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4'
                        : 'grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4'
                    }
                  >
                    {sec.tiles.map((t) => (
                      <Link
                        key={t.href + t.title}
                        href={t.href}
                        className="group block rounded-2xl overflow-hidden border transition hover:shadow-md"
                        style={{ borderColor: C.border, backgroundColor: '#fff' }}
                      >
                        {t.cover ? (
                          <div className="aspect-[4/3] relative overflow-hidden">
                            <Image
                              src={t.cover}
                              alt={t.title}
                              fill
                              sizes="(min-width: 768px) 25vw, 50vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {t.badge && (
                              <span
                                className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em]"
                                style={{ backgroundColor: C.starGold, color: C.midnight, letterSpacing: '0.15em' }}
                              >
                                {t.badge}
                              </span>
                            )}
                          </div>
                        ) : null}
                        <div className="p-4">
                          <div
                            className="font-fraunces font-bold leading-tight mb-1"
                            style={{ color: C.ocean, fontSize: 17 }}
                          >
                            {t.title}
                          </div>
                          {t.description && (
                            <p className="text-xs" style={{ color: C.driftwood, lineHeight: 1.5 }}>
                              {t.description}
                            </p>
                          )}
                          {t.badge && !t.cover && (
                            <span
                              className="inline-block mt-2 text-[10px] uppercase font-bold tracking-widest"
                              style={{ color: sec.colour, letterSpacing: '0.2em' }}
                            >
                              {t.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Photo strip — proof of life from EL */}
      {voicesWallPhotos.length > 0 && (
        <section className="pb-16">
          <div
            className="uppercase font-bold mb-4 px-6 md:px-12 max-w-6xl mx-auto"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            From the archive
          </div>
          <div className="px-6 md:px-12 max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-3">
            {voicesWallPhotos.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="aspect-square rounded-md overflow-hidden relative"
                style={{ backgroundColor: C.shell }}
              >
                {p.url && (
                  <Image
                    src={p.url}
                    alt={p.alt_text || 'Palm Island archive'}
                    fill
                    sizes="(min-width: 768px) 16vw, 50vw"
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Closer CTA */}
      <section className="px-6 md:px-12 py-20" style={{ backgroundColor: C.shell }}>
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            The community holds the pen
          </div>
          <h2
            className="font-fraunces font-bold leading-tight mb-6"
            style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)' }}
          >
            The next 20 years are a design choice, not a forecast.
          </h2>
          <Link
            href="/sign-the-vision"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-md font-bold uppercase"
            style={{ backgroundColor: C.ocean, color: '#fff', fontSize: 13, letterSpacing: '0.2em' }}
          >
            Sign the next 20 years
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
