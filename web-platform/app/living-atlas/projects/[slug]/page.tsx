/**
 * /living-atlas/projects/[slug] — project detail page.
 *
 * Symmetric with /services/[slug]. For any project, surface:
 *   - hero (EL v2 cover_image_url) + name + tagline + status
 *   - description
 *   - linked storytellers (via project_slugs)
 *   - tagged photos (via EL v2 getPiccProjectWithPhotos)
 *   - other projects strip
 */

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { loadConstellation } from '@/lib/constellation/queries'
import { getPiccProjectWithPhotos } from '@/lib/empathy-ledger/el-projects'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await loadConstellation()
  const project = data.projects.find((p) => p.slug === slug)
  return {
    title: project
      ? `${project.name} — Palm Island Living Atlas`
      : 'Project — Palm Island Living Atlas',
    description: project?.description ?? 'PICC project profile.',
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await loadConstellation()
  const project = data.projects.find((p) => p.slug === slug)
  if (!project) notFound()

  const linked = data.faces.filter((f) => f.project_slugs.includes(slug))
  const photoSet = await getPiccProjectWithPhotos(slug)
  const photos = photoSet?.photos ?? []

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link
          href="/living-atlas"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Living Atlas
        </Link>

        <header className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-1">
            Project · {project.status ?? 'live'}
            {project.start_year && ` · from ${project.start_year}`}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-2">
            {project.name}
          </h1>
          {project.tagline && (
            <p className="font-serif italic text-stone-700 text-lg">
              {project.tagline}
            </p>
          )}
        </header>

        {project.image_url && (
          <img
            src={project.image_url}
            alt=""
            className="w-full rounded-2xl shadow-md object-cover mb-6"
            style={{ maxHeight: 420 }}
          />
        )}

        {project.description && (
          <section className="mb-6">
            <p className="text-stone-700 leading-relaxed">
              {project.description}
            </p>
          </section>
        )}

        {linked.length > 0 && (
          <section className="mb-6">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
              People · {linked.length} linked to this project
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {linked.slice(0, 12).map((f) => (
                <Link
                  key={f.id}
                  href={`/living-atlas/people/${f.slug}`}
                  className="rounded-xl border border-stone-200 bg-white p-3 text-center hover:shadow-md transition"
                >
                  <img
                    src={f.thumb_url}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                    style={{
                      border: `2px solid ${f.is_elder ? '#B8860B' : '#E3D5C5'}`,
                    }}
                  />
                  <div className="font-serif text-sm text-charcoal leading-tight">
                    {f.name ?? 'Storyteller'}
                  </div>
                  {f.role && (
                    <div className="text-[10.5px] text-stone-600 mt-0.5 line-clamp-1">
                      {f.role}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {photos.length > 0 && (
          <section className="mb-6">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
              Photos · {photos.length} tagged
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {photos.slice(0, 12).map((p) => (
                <img
                  key={p.id}
                  src={(p as any).thumbnail_url ?? (p as any).url ?? ''}
                  alt={(p as any).alt_text ?? ''}
                  loading="lazy"
                  className="w-full aspect-square rounded-md object-cover"
                />
              ))}
            </div>
          </section>
        )}

        {linked.length === 0 && photos.length === 0 && (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <div className="font-serif text-base mb-1">
              No linked content yet
            </div>
            <p className="text-sm leading-relaxed">
              This project hasn&rsquo;t been tagged to storytellers or photos
              in EL v2 yet. As more content is tagged, it surfaces here.
            </p>
          </section>
        )}

        <section className="mt-8 rounded-xl border border-stone-200 bg-white p-5">
          <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
            Other projects
          </div>
          <div className="flex flex-wrap gap-2">
            {data.projects
              .filter((p) => p.slug !== slug)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/living-atlas/projects/${p.slug}`}
                  className="inline-flex items-center gap-1 text-sm rounded-full px-3 py-1 border border-stone-200 hover:bg-stone-50"
                >
                  {p.name}
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}
