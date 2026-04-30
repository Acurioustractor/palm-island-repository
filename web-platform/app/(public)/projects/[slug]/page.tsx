/**
 * /projects/<slug> — public project detail page.
 *
 * Reads from PICC's projects table (admin lives at /picc/projects/<slug>;
 * this is the public-facing view). Surfaces:
 *   - Hero with cover photo + tagline
 *   - Description
 *   - Status / dates / project lead
 *   - Photo gallery via EL v2 picc:slot:project-<slug>
 *   - Bespoke community art tagged related:<slug>
 *
 * Only renders projects where is_public = true. Anything else 404s.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase/client'
import { getPhotosForSlot, type ELPhoto } from '@/lib/media/el-photos'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 1800

interface PageProps {
  params: Promise<{ slug: string }>
}

interface ProjectRow {
  id: string
  name: string | null
  slug: string
  tagline: string | null
  description: string | null
  status: string | null
  project_type: string | null
  start_date: string | null
  target_completion_date: string | null
  impact_areas: string[] | null
  hero_image_url: string | null
  logo_url: string | null
  project_lead: string | null
  is_public: boolean | null
  featured: boolean | null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('projects')
    .select('name, tagline, description')
    .eq('slug', slug)
    .eq('is_public', true)
    .maybeSingle()
  if (!data) return { title: 'Project — PICC' }
  return {
    title: `${data.name ?? slug} — Projects · PICC`,
    description: data.tagline || data.description?.slice(0, 160) || undefined,
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createServerSupabase()

  const [{ data: project }, slotPhotos, { data: bespokeRows }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, slug, tagline, description, status, project_type, start_date, target_completion_date, impact_areas, hero_image_url, logo_url, project_lead, is_public, featured')
      .eq('slug', slug)
      .eq('is_public', true)
      .maybeSingle(),
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
  ])

  if (!project) notFound()
  const proj = project as ProjectRow
  const photos = slotPhotos as ELPhoto[]
  const bespokeArt = (bespokeRows || []) as Array<{
    id: string
    public_url: string
    title: string | null
    caption: string | null
    attribution: string | null
  }>

  const heroPhoto = proj.hero_image_url || photos[0]?.url || null
  const galleryPhotos = proj.hero_image_url ? photos.slice(0, 8) : photos.slice(1, 9)

  const startYear = proj.start_date ? new Date(proj.start_date).getFullYear() : null
  const targetYear = proj.target_completion_date
    ? new Date(proj.target_completion_date).getFullYear()
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
          {proj.project_lead && (
            <Stat label="Lead" value={proj.project_lead} tint={C.ochre} />
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
