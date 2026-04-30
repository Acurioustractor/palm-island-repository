/**
 * /projects — public projects index.
 *
 * Lists every is_public = true project. Featured projects render in a
 * larger hero strip; the rest fill a grid below. Each card links to
 * /projects/<slug>.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 1800

export const metadata = {
  title: 'Projects — Palm Island Community Company',
  description: 'PICC projects shaping the next 20 years.',
}

interface ProjectListRow {
  id: string
  name: string | null
  slug: string
  tagline: string | null
  status: string | null
  project_type: string | null
  hero_image_url: string | null
  featured: boolean | null
  start_date: string | null
}

export default async function ProjectsIndexPage() {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('projects')
    .select('id, name, slug, tagline, status, project_type, hero_image_url, featured, start_date')
    .eq('is_public', true)
    .order('featured', { ascending: false, nullsFirst: false })
    .order('start_date', { ascending: false, nullsFirst: false })
    .limit(40)

  const projects = (data || []) as ProjectListRow[]
  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero */}
      <section className="px-6 md:px-12 py-16 md:py-20" style={{ backgroundColor: C.ocean }}>
        <div className="max-w-5xl mx-auto">
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Projects · {projects.length}
          </div>
          <h1
            className="font-fraunces font-bold leading-tight text-white"
            style={{ fontSize: 'clamp(40px, 7vw, 80px)' }}
          >
            What we&rsquo;re building.
          </h1>
          <p className="mt-6 leading-relaxed text-white/85 max-w-2xl" style={{ fontSize: 16 }}>
            Bwgcolman-led projects shaping the next twenty years. Each carries its own
            story, its own gallery, and its own community art.
          </p>
        </div>
      </section>

      {projects.length === 0 ? (
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-3xl mx-auto rounded-md p-6" style={{ backgroundColor: C.shell }}>
            <p style={{ color: C.driftwood, fontSize: 15 }}>
              No public projects yet. Check back soon — work in progress.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Featured strip */}
          {featured.length > 0 && (
            <section className="px-6 md:px-12 py-12 md:py-16">
              <div className="max-w-6xl mx-auto">
                <div
                  className="uppercase font-bold mb-6"
                  style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
                >
                  Featured
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featured.map((p) => (
                    <FeaturedCard key={p.id} project={p} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <section className="px-6 md:px-12 py-12 md:py-16" style={{ backgroundColor: C.shell }}>
              <div className="max-w-6xl mx-auto">
                <div
                  className="uppercase font-bold mb-6"
                  style={{ color: C.driftwood, fontSize: 11, letterSpacing: '0.3em' }}
                >
                  All projects
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rest.map((p) => (
                    <CompactCard key={p.id} project={p} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}

function FeaturedCard({ project }: { project: ProjectListRow }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-md overflow-hidden"
      style={{ backgroundColor: C.shell }}
    >
      <div
        className="relative bg-stone-200"
        style={{
          aspectRatio: '16 / 9',
          backgroundImage: project.hero_image_url
            ? `linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 100%), url(${project.hero_image_url})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!project.hero_image_url && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: C.ocean }}>
            <div className="font-fraunces text-white" style={{ fontSize: 56, opacity: 0.4 }}>
              {project.name?.[0] || '?'}
            </div>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col gap-2">
        {project.project_type && (
          <div className="uppercase font-bold" style={{ color: C.ochre, fontSize: 10, letterSpacing: '0.2em' }}>
            {project.project_type.replace(/_/g, ' ')}
          </div>
        )}
        <h3 className="font-fraunces font-bold leading-tight group-hover:underline" style={{ color: C.ocean, fontSize: 24 }}>
          {project.name}
        </h3>
        {project.tagline && (
          <p className="leading-relaxed" style={{ color: C.driftwood, fontSize: 14 }}>
            {project.tagline}
          </p>
        )}
      </div>
    </Link>
  )
}

function CompactCard({ project }: { project: ProjectListRow }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-md p-5 flex flex-col gap-2"
      style={{ backgroundColor: '#FBF8EE' }}
    >
      {project.project_type && (
        <div className="uppercase font-bold" style={{ color: C.ochre, fontSize: 10, letterSpacing: '0.2em' }}>
          {project.project_type.replace(/_/g, ' ')}
        </div>
      )}
      <h3 className="font-fraunces font-bold leading-tight group-hover:underline" style={{ color: C.ocean, fontSize: 18 }}>
        {project.name}
      </h3>
      {project.tagline && (
        <p className="leading-relaxed line-clamp-2" style={{ color: C.driftwood, fontSize: 13 }}>
          {project.tagline}
        </p>
      )}
      {project.status && (
        <div className="mt-auto pt-2 uppercase capitalize" style={{ color: C.muted, fontSize: 10, letterSpacing: '0.15em' }}>
          {project.status.replace(/_/g, ' ')}
        </div>
      )}
    </Link>
  )
}
