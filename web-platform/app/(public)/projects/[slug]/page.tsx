/**
 * /projects/<slug> — public project detail page.
 *
 * Reads canonical project data from Empathy Ledger v2 via getPiccProject
 * (Phase 1 of the canonical migration — see
 * thoughts/shared/plans/2026-05-08-el-canonical-migration.md). Bespoke
 * community-art tagged `related:<slug>` is still PICC `media_files`
 * (operational asset library — stays on PICC).
 *
 * Surfaces:
 *   - Hero with cover photo + tagline
 *   - Description
 *   - Status / dates
 *   - Photo gallery via EL v2 picc:slot:project-<slug>
 *   - Bespoke community art tagged related:<slug>
 *
 * 404s if EL has no matching project (or status='cancelled').
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase/client'
import { getPhotosForSlot, type ELPhoto } from '@/lib/media/el-photos'
import { getPiccProject } from '@/lib/empathy-ledger/el-projects'
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'
import { getPiccServices } from '@/lib/services/el-services'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 1800

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getPiccProject(slug)
  if (!project || project.status === 'cancelled') return { title: 'Project — PICC' }
  return {
    title: `${project.name ?? slug} — Projects · PICC`,
    description: project.tagline || project.description?.slice(0, 160) || undefined,
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createServerSupabase()

  const [project, slotPhotos, { data: bespokeRows }, allStorytellers, elServices] = await Promise.all([
    getPiccProject(slug),
    getPhotosForSlot(`project-${slug}`, 24),
    supabase
      .from('media_files')
      .select('id, public_url, title, caption, attribution')
      .eq('page_context', 'community-art')
      .eq('is_public', true)
      .is('deleted_at', null)
      .contains('tags', [`related:${slug}`])
      .order('created_at', { ascending: false })
      .limit(12),
    getPiccStorytellers({ limit: 500 }).catch(() => []),
    getPiccServices({ status: 'active' }).catch(() => []),
  ])

  if (!project || project.status === 'cancelled') notFound()
  const photos = slotPhotos as ELPhoto[]
  const bespokeArt = (bespokeRows || []) as Array<{
    id: string
    public_url: string
    title: string | null
    caption: string | null
    attribution: string | null
  }>

  // Map EL canonical fields onto the local view-model. EL `cover_image_url`
  // is the canonical hero; EL `themes[]` doubles as both the legacy `tags`
  // and `impact_areas` PICC arrays (the matcher in /innovation reads both).
  // EL drops `project_lead` / `target_completion_date` / `logo_url` — those
  // PICC-only fields just don't render on this page.
  const proj = {
    id: project.id,
    name: project.name,
    slug: project.slug,
    tagline: project.tagline,
    description: project.description,
    status: project.status,
    project_type: project.project_type,
    start_date: project.start_date,
    end_date: project.end_date,
    impact_areas: project.themes,
    hero_image_url: project.cover_image_url,
  }

  const heroPhoto = proj.hero_image_url || photos[0]?.url || null
  const galleryPhotos = proj.hero_image_url ? photos.slice(0, 8) : photos.slice(1, 9)

  // Connected storytellers — those whose project_slugs include this slug.
  const connectedStorytellers = allStorytellers.filter((s) =>
    (s.project_slugs ?? []).includes(slug),
  )

  // Connected services — derived from shared storytellers' service_slugs.
  // Surfaces the human bridge between programmes and the projects they
  // make possible, without requiring a service↔project schema.
  const serviceShareCount = new Map<string, number>()
  for (const st of connectedStorytellers) {
    for (const svcSlug of st.service_slugs ?? []) {
      serviceShareCount.set(svcSlug, (serviceShareCount.get(svcSlug) || 0) + 1)
    }
  }
  const connectedServices = Array.from(serviceShareCount.entries())
    .map(([svcSlug, share]) => {
      const meta = elServices.find((s) => s.slug === svcSlug)
      if (!meta) return null
      return {
        slug: svcSlug,
        name: meta.name,
        share,
        image_url: meta.image_url,
      }
    })
    .filter((x): x is { slug: string; name: string; share: number; image_url: string | null } => !!x)
    .sort((a, b) => b.share - a.share)
    .slice(0, 6)

  const startYear = proj.start_date ? new Date(proj.start_date).getFullYear() : null
  const targetYear = proj.end_date
    ? new Date(proj.end_date).getFullYear()
    : null

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero */}
      <section
        className="relative px-6 md:px-12 py-20 md:py-28"
        style={{
          backgroundColor: heroPhoto ? '#1a1a2e' : C.ocean,
          backgroundImage: heroPhoto
            ? `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%), url(${heroPhoto})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '60vh',
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col justify-end h-full" style={{ minHeight: '50vh' }}>
          <Link
            href="/projects"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            ← All projects
          </Link>
          {proj.project_type && (
            <div
              className="uppercase font-bold mt-8 mb-3"
              style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
            >
              {proj.project_type.replace(/_/g, ' ')}
            </div>
          )}
          <h1
            className="font-fraunces font-bold leading-tight text-white"
            style={{ fontSize: 'clamp(40px, 7vw, 80px)' }}
          >
            {proj.name}
          </h1>
          {proj.tagline && (
            <p
              className="mt-6 leading-relaxed text-white/85 max-w-2xl"
              style={{ fontSize: 18 }}
            >
              {proj.tagline}
            </p>
          )}
        </div>
      </section>

      {/* Meta strip */}
      <section className="px-6 md:px-12 py-8" style={{ backgroundColor: C.shell }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {proj.status && (
            <Stat label="Status" value={proj.status.replace(/_/g, ' ')} tint={C.mangrove} />
          )}
          {(startYear || targetYear) && (
            <Stat
              label="Timeline"
              value={
                startYear && targetYear
                  ? `${startYear}–${targetYear}`
                  : startYear
                    ? `From ${startYear}`
                    : `Target ${targetYear}`
              }
              tint={C.ocean}
            />
          )}
          {proj.impact_areas && proj.impact_areas.length > 0 && (
            <Stat
              label="Impact areas"
              value={proj.impact_areas.slice(0, 3).join(' · ')}
              tint={C.coral}
            />
          )}
        </div>
      </section>

      {/* Description */}
      {proj.description && (
        <section className="px-6 md:px-12 py-16 md:py-20">
          <div className="max-w-3xl mx-auto">
            <div
              className="uppercase font-bold mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              About this project
            </div>
            <div
              className="leading-relaxed whitespace-pre-wrap"
              style={{ color: C.earth, fontSize: 16, lineHeight: 1.75 }}
            >
              {proj.description}
            </div>
          </div>
        </section>
      )}

      {/* Photo gallery */}
      {galleryPhotos.length > 0 && (
        <section className="px-6 md:px-12 py-16 md:py-20" style={{ backgroundColor: C.shell }}>
          <div className="max-w-6xl mx-auto">
            <div
              className="uppercase font-bold mb-3"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Project gallery
            </div>
            <h2
              className="font-fraunces font-bold leading-tight mb-8"
              style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 42px)' }}
            >
              How it&rsquo;s unfolding.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {galleryPhotos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={p.url}
                  alt={p.alt_text || p.caption || proj.name || ''}
                  className="w-full h-48 md:h-56 object-cover rounded-md"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bespoke art */}
      {bespokeArt.length > 0 && (
        <section className="px-6 md:px-12 py-16 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div
              className="uppercase font-bold mb-3"
              style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Community art
            </div>
            <h2
              className="font-fraunces font-bold leading-tight mb-8"
              style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 42px)' }}
            >
              Pieces about this project.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bespokeArt.map((art) => (
                <figure
                  key={art.id}
                  className="rounded-md overflow-hidden flex flex-col"
                  style={{ backgroundColor: C.shell }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={art.public_url}
                    alt={art.title || ''}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <figcaption className="p-4 flex flex-col gap-1 flex-grow">
                    {art.title && (
                      <div className="font-fraunces font-bold leading-tight" style={{ color: C.ocean, fontSize: 16 }}>
                        {art.title}
                      </div>
                    )}
                    {art.caption && (
                      <p className="leading-relaxed line-clamp-2" style={{ color: C.driftwood, fontSize: 12 }}>
                        {art.caption}
                      </p>
                    )}
                    <div className="font-bold mt-auto pt-1" style={{ color: C.ochre, fontSize: 11 }}>
                      {art.attribution || 'Anonymous'}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="italic text-center mt-6" style={{ color: C.muted, fontSize: 13 }}>
              Want to add a piece?{' '}
              <Link href="/share-art" className="underline" style={{ color: C.ochre }}>
                Submit one
              </Link>
              .
            </p>
          </div>
        </section>
      )}

      {/* Connected storytellers + services */}
      {(connectedStorytellers.length > 0 || connectedServices.length > 0) && (
        <section className="px-6 md:px-12 py-16" style={{ backgroundColor: C.shell }}>
          <div className="max-w-6xl mx-auto">
            <div
              className="uppercase font-bold mb-3"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Connected to {proj.name}
            </div>
            <h2
              className="font-fraunces font-bold leading-tight mb-10"
              style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 44px)' }}
            >
              The people, and the services this work runs through.
            </h2>

            {connectedStorytellers.length > 0 && (
              <div className="mb-12">
                <div
                  className="uppercase font-bold mb-4"
                  style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.3em' }}
                >
                  {connectedStorytellers.length} {connectedStorytellers.length === 1 ? 'storyteller' : 'storytellers'}
                </div>
                <div className="flex flex-wrap gap-3">
                  {connectedStorytellers.slice(0, 12).map((s) => (
                    <Link
                      key={s.id}
                      href={`/voices/${s.slug}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-full bg-white border hover:shadow-sm transition"
                      style={{ borderColor: s.is_elder ? C.starGold : C.border }}
                    >
                      {s.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.photo_url}
                          alt={s.display_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: C.ocean + '22', color: C.ocean }}
                        >
                          {s.display_name
                            .split(' ')
                            .map((p) => p[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join('')}
                        </div>
                      )}
                      <div className="pr-1">
                        <div className="font-semibold leading-tight" style={{ color: C.ocean, fontSize: 13 }}>
                          {s.display_name}
                        </div>
                        {s.is_elder && (
                          <div
                            className="text-[10px] uppercase font-bold tracking-widest leading-none mt-0.5"
                            style={{ color: C.ochre, letterSpacing: '0.15em' }}
                          >
                            Elder
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {connectedServices.length > 0 && (
              <div>
                <div
                  className="uppercase font-bold mb-4"
                  style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.3em' }}
                >
                  {connectedServices.length} connected {connectedServices.length === 1 ? 'service' : 'services'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connectedServices.map((svc) => (
                    <Link
                      key={svc.slug}
                      href={`/services/${svc.slug}`}
                      className="group block rounded-2xl overflow-hidden border bg-white hover:shadow-md transition"
                      style={{ borderColor: C.border }}
                    >
                      {svc.image_url ? (
                        <div className="aspect-[16/10] relative" style={{ backgroundColor: C.shell }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={svc.image_url}
                            alt={svc.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div
                          className="aspect-[16/10] flex items-center justify-center p-4 text-center"
                          style={{ backgroundColor: C.ocean + '15' }}
                        >
                          <div
                            className="font-fraunces font-bold leading-tight"
                            style={{ color: C.ocean, fontSize: 18 }}
                          >
                            {svc.name}
                          </div>
                        </div>
                      )}
                      <div className="p-5">
                        <div
                          className="text-[10px] uppercase font-bold mb-2"
                          style={{ color: C.ocean, letterSpacing: '0.2em' }}
                        >
                          {svc.share} shared {svc.share === 1 ? 'voice' : 'voices'}
                        </div>
                        <h3
                          className="font-fraunces font-bold leading-tight"
                          style={{ color: C.ocean, fontSize: 18 }}
                        >
                          {svc.name}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="px-6 md:px-12 py-16 md:py-20 text-center" style={{ backgroundColor: C.midnight }}>
        <div className="max-w-xl mx-auto">
          <h2
            className="font-fraunces font-bold"
            style={{ color: C.starGold, fontSize: 'clamp(28px, 4.5vw, 42px)' }}
          >
            Have something to share?
          </h2>
          <p className="mt-4 text-white/85 leading-relaxed">
            Stories, voices, photos, art — every contribution helps shape how this project lands.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/share-voice"
              className="px-5 py-2.5 rounded-full font-bold uppercase tracking-widest hover:opacity-90"
              style={{
                backgroundColor: C.starGold,
                color: C.midnight,
                fontSize: 11,
                letterSpacing: '0.2em',
              }}
            >
              Share a voice
            </Link>
            <Link
              href="/share-art"
              className="px-5 py-2.5 rounded-full font-bold uppercase tracking-widest border hover:opacity-90"
              style={{
                color: C.starGold,
                borderColor: C.starGold,
                fontSize: 11,
                letterSpacing: '0.2em',
              }}
            >
              Share artwork
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function Stat({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="uppercase font-bold"
        style={{ color: tint, fontSize: 10, letterSpacing: '0.2em' }}
      >
        {label}
      </div>
      <div className="font-fraunces capitalize" style={{ color: C.ocean, fontSize: 16 }}>
        {value}
      </div>
    </div>
  )
}
