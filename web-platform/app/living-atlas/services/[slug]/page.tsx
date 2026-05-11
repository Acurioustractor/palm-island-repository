/**
 * /living-atlas/services/[slug] — service detail page.
 *
 * For any of the 29 PICC services, surface:
 *   - hero (EL v2 image_url)
 *   - name, category, description
 *   - linked storytellers (via service_slugs) with their faces
 *   - quotes attributed to those storytellers, pulled from the Atlas
 *     speaker map
 *   - location pin (if lat/long set)
 *
 * Closes the loop on the Services tab: clicking a service now leads to a
 * proper service profile, not just a right-rail card.
 */

import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import { notFound } from 'next/navigation'
import { loadConstellation } from '@/lib/constellation/queries'
import { getCanonicalPhotosForService } from '@/lib/media/el-photos'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await loadConstellation()
  const service = data.services.find((s) => s.slug === slug)
  return {
    title: service
      ? `${service.name} — Palm Island Living Atlas`
      : 'Service — Palm Island Living Atlas',
    description: service?.description ?? 'PICC service profile.',
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await loadConstellation()
  const service = data.services.find((s) => s.slug === slug)
  if (!service) notFound()

  // Linked storytellers — faces whose service_slugs include this service.
  const linked = data.faces.filter((f) => f.service_slugs.includes(slug))

  // Service photos via EL v2's canonical service_galleries chain.
  const gallery = await getCanonicalPhotosForService(slug, 24)

  // Quotes attributed to linked storytellers — look up by last-name token.
  function lastTok(s: string | null) {
    if (!s) return ''
    return s.trim().toLowerCase().split(/\s+/).pop() ?? ''
  }
  const linkedQuotes: Array<{
    speaker: string
    text: string
    theme: string | null
    suggested: boolean
  }> = []
  const seen = new Set<string>()
  for (const f of linked) {
    const token = lastTok(f.name)
    if (!token || seen.has(token)) continue
    seen.add(token)
    const list = data.quotes_by_speaker[token] ?? []
    for (const q of list.slice(0, 2)) {
      linkedQuotes.push({
        speaker: f.name ?? token,
        text: q.text,
        theme: q.theme,
        suggested: q.suggested,
      })
    }
  }

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
            Service · {service.category ?? 'PICC'}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-2">
            {service.name}
          </h1>
        </header>

        {/* Hero image */}
        {service.image_url && (
          <img
            src={service.image_url}
            alt=""
            className="w-full rounded-2xl shadow-md object-cover mb-6"
            style={{ maxHeight: 420 }}
          />
        )}

        {/* Description */}
        {service.description && (
          <section className="mb-6">
            <p className="text-stone-700 leading-relaxed text-base">
              {service.description}
            </p>
          </section>
        )}

        {/* Location */}
        {service.latitude != null && service.longitude != null && (
          <section className="mb-6 rounded-xl border border-stone-200 bg-white p-4 flex items-start gap-3">
            <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#2D5F4F' }} />
            <div className="text-sm text-stone-700">
              <div className="font-semibold">On Country</div>
              <div className="text-[11.5px] text-stone-500 mt-0.5">
                {service.latitude.toFixed(4)}, {service.longitude.toFixed(4)}
                {service.latitude > -19.0 && service.latitude < -18.5 && ' — Great Palm Island'}
              </div>
            </div>
          </section>
        )}

        {/* Linked storytellers */}
        {linked.length > 0 && (
          <section className="mb-6">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
              People · {linked.length} linked to this service
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {linked.slice(0, 12).map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-stone-200 bg-white p-3 text-center"
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
                    <div className="text-[10.5px] text-stone-600 mt-0.5">
                      {f.role}
                    </div>
                  )}
                  {f.is_elder && (
                    <div
                      className="inline-block mt-1 text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: '#FCEEDF', color: '#8B6F47' }}
                    >
                      Elder
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Linked quotes */}
        {linkedQuotes.length > 0 && (
          <section className="mb-6">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
              Voices on this service ({linkedQuotes.length})
            </div>
            <div className="space-y-3">
              {linkedQuotes.slice(0, 8).map((q, i) => (
                <blockquote
                  key={i}
                  className="rounded-xl border border-stone-200 bg-white p-4"
                >
                  <div className="font-serif italic leading-snug text-stone-800">
                    “{q.text.length > 280 ? q.text.slice(0, 280) + '…' : q.text}”
                  </div>
                  <div className="text-[11px] text-stone-600 mt-2 flex items-center gap-2 flex-wrap">
                    <span>— {q.speaker}</span>
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
                  </div>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* Service gallery — EL v2 canonical photos */}
        {gallery.all.length > 0 && (
          <section className="mb-6">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
              Gallery · {gallery.all.length} photo
              {gallery.all.length === 1 ? '' : 's'} on file
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {gallery.all.slice(0, 12).map((p) => (
                <img
                  key={p.id}
                  src={p.thumbnail_url ?? p.url}
                  alt={p.alt_text ?? ''}
                  className="w-full aspect-square rounded-md object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {linked.length === 0 && linkedQuotes.length === 0 && gallery.all.length === 0 && (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <div className="font-serif text-base mb-1">
              No linked content yet
            </div>
            <p className="text-sm leading-relaxed">
              This service hasn&rsquo;t been tagged to storytellers or photos
              in EL v2 yet. As more content is tagged via{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">
                /admin/picc-tagging
              </code>
              , it will surface here automatically.
            </p>
          </section>
        )}

        {/* Other services */}
        <section className="mt-8 rounded-xl border border-stone-200 bg-white p-5">
          <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
            Other services
          </div>
          <div className="flex flex-wrap gap-2">
            {data.services
              .filter((s) => s.slug !== slug)
              .slice(0, 14)
              .map((s) => (
                <Link
                  key={s.slug}
                  href={`/living-atlas/services/${s.slug}`}
                  className="inline-flex items-center gap-1 text-sm rounded-full px-3 py-1 border border-stone-200 hover:bg-stone-50"
                >
                  {s.name}
                  {s.photo_ids.length > 0 && (
                    <span className="text-stone-500 text-xs">
                      ·{s.photo_ids.length}
                    </span>
                  )}
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}
