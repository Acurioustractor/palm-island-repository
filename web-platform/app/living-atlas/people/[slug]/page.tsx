/**
 * /living-atlas/people/[slug] — storyteller detail page.
 *
 * For any storyteller face on the canvas, surface their full profile:
 *   - hero (photo_url) + name + role + cultural background + Elder/featured badges
 *   - bio if available (we don't have it on the constellation payload —
 *     fall back to attribution + service links)
 *   - every quote attributed to them, via quotes_by_speaker
 *   - linked services + projects (via service_slugs / project_slugs)
 *   - photo gallery via EL v2 getPhotosForStoryteller (separate fetch)
 *
 * Closes the loop on the Elders rail: clicking opens their full page.
 */

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { loadConstellation } from '@/lib/constellation/queries'
import { getPhotosForStoryteller } from '@/lib/media/el-photos'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await loadConstellation()
  const face = data.faces.find((f) => f.slug === slug && f.kind === 'storyteller')
  return {
    title: face
      ? `${face.name ?? 'Storyteller'} — Palm Island Living Atlas`
      : 'Storyteller — Palm Island Living Atlas',
    description:
      face?.role ?? 'A community voice on the Palm Island Living Atlas.',
  }
}

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await loadConstellation()
  const face = data.faces.find(
    (f) => f.slug === slug && f.kind === 'storyteller',
  )
  if (!face) notFound()

  // Quotes by last-name token (same scheme used everywhere else).
  const lastName = (face.name ?? '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .pop() ?? ''
  const quotes = data.quotes_by_speaker[lastName] ?? []

  // Linked services + projects (data.services / data.projects know the slug list)
  const linkedServices = data.services.filter((s) =>
    face.service_slugs.includes(s.slug),
  )
  const linkedProjects = data.projects.filter((p) =>
    face.project_slugs.includes(p.slug),
  )

  // EL v2 gallery (separate fetch, only this person's tagged photos)
  // face.id has prefix "storyteller:" — strip it for the EL endpoint.
  const storytellerId = face.id.replace(/^storyteller:/, '')
  const gallery = await getPhotosForStoryteller(storytellerId, 12)

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

        <header className="mb-6 flex items-start gap-5 flex-wrap">
          <img
            src={face.avatar_url}
            alt=""
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-md flex-shrink-0"
            style={{
              border: `4px solid ${face.is_elder ? '#B8860B' : '#FBF6EE'}`,
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-1">
              Voice
              {face.is_elder && ' · Elder'}
              {face.is_featured && !face.is_elder && ' · Featured'}
            </div>
            <h1 className="font-serif text-4xl text-charcoal mb-1">
              {face.name ?? 'Storyteller'}
            </h1>
            {face.role && (
              <div className="text-stone-700 mb-1">{face.role}</div>
            )}
            {face.cultural_background && (
              <div className="text-stone-600 italic text-sm">
                {face.cultural_background}
              </div>
            )}
            <div className="text-[11px] text-stone-500 mt-3 flex gap-3 flex-wrap">
              <span>
                <strong>{quotes.length}</strong> quotes on file
              </span>
              <span>
                <strong>{linkedServices.length}</strong> service
                {linkedServices.length === 1 ? '' : 's'}
              </span>
              <span>
                <strong>{linkedProjects.length}</strong> project
                {linkedProjects.length === 1 ? '' : 's'}
              </span>
              {gallery.length > 0 && (
                <span>
                  <strong>{gallery.length}</strong> photo
                  {gallery.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Quotes */}
        {quotes.length > 0 && (
          <section className="mb-6">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
              In their own words
            </div>
            <div className="space-y-3">
              {quotes.slice(0, 12).map((q, i) => (
                <blockquote
                  key={i}
                  className="rounded-xl border border-stone-200 bg-white p-4"
                >
                  <div className="font-serif italic text-base leading-relaxed text-stone-800">
                    “{q.text}”
                  </div>
                  <div className="text-[11px] text-stone-600 mt-2 flex items-center gap-2 flex-wrap">
                    {q.theme && (
                      <Link
                        href={`/living-atlas/themes/${q.theme}`}
                        className="text-stone-500 hover:underline"
                      >
                        theme: {q.theme}
                      </Link>
                    )}
                    {q.suggested && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
                        style={{ backgroundColor: '#E7EFE4', color: '#2D5F4F' }}
                      >
                        report-ready
                      </span>
                    )}
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-500">
                      {q.source.replace('_', ' ')}
                    </span>
                  </div>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* Linked services */}
        {linkedServices.length > 0 && (
          <section className="mb-6">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
              Linked services
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {linkedServices.map((s) => (
                <Link
                  key={s.slug}
                  href={`/living-atlas/services/${s.slug}`}
                  className="rounded-xl border border-stone-200 bg-white p-4 hover:shadow-md transition group flex items-center gap-3"
                >
                  {s.image_url && (
                    <img
                      src={s.image_url}
                      alt=""
                      className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-base text-charcoal group-hover:underline truncate">
                      {s.name}
                    </div>
                    {s.category && (
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {s.category}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Linked projects */}
        {linkedProjects.length > 0 && (
          <section className="mb-6">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
              Linked projects
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {linkedProjects.map((p) => (
                <Link
                  key={p.slug}
                  href={`/living-atlas/projects/${p.slug}`}
                  className="rounded-xl border border-stone-200 bg-white p-4 hover:shadow-md transition group flex items-center gap-3"
                >
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt=""
                      className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-base text-charcoal group-hover:underline truncate">
                      {p.name}
                    </div>
                    {p.tagline && (
                      <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                        {p.tagline}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="mb-6">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
              Photos
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {gallery.map((p) => (
                <img
                  key={p.id}
                  src={p.thumbnail_url ?? p.url}
                  alt={p.alt_text ?? ''}
                  loading="lazy"
                  className="w-full aspect-square rounded-md object-cover"
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state if absolutely nothing */}
        {quotes.length === 0 &&
          linkedServices.length === 0 &&
          linkedProjects.length === 0 &&
          gallery.length === 0 && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <div className="font-serif text-base mb-1">
                Only the photo is on file
              </div>
              <p className="text-sm leading-relaxed">
                {face.name ?? 'This storyteller'} has a consented photo on the
                Atlas but no quotes, services, or projects tagged to them yet.
                As more content is captured + linked, it surfaces here.
              </p>
            </section>
          )}

        {/* Other Elders */}
        <section className="mt-8 rounded-xl border border-stone-200 bg-white p-5">
          <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
            Other voices on the canvas
          </div>
          <div className="flex flex-wrap gap-2">
            {data.faces
              .filter((f) => f.kind === 'storyteller' && f.slug !== slug)
              .slice(0, 12)
              .map((f) => (
                <Link
                  key={f.id}
                  href={`/living-atlas/people/${f.slug}`}
                  className="inline-flex items-center gap-2 text-sm rounded-full px-3 py-1 border border-stone-200 hover:bg-stone-50"
                >
                  <img
                    src={f.thumb_url}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>{f.name ?? 'Storyteller'}</span>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}
