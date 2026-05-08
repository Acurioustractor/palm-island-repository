/**
 * ServiceConnections — appended to /services/[slug] to surface the
 * web of relationships around a service: storytellers who deliver or
 * use it, and projects that share its frontline.
 *
 * Soft-linkage by design: projects connect via shared storytellers
 * (storyteller.service_slugs ∩ storyteller.project_slugs), since EL
 * doesn't yet model service ↔ project as a first-class join. Surfaces
 * real human bridges without requiring schema work.
 */
import Link from 'next/link'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export interface ConnectedStoryteller {
  id: string
  slug: string
  display_name: string
  role: string | null
  photo_url: string | null
  is_elder: boolean
  quote_count: number
}

export interface ConnectedProject {
  slug: string
  name: string
  description: string | null
  cover_image_url: string | null
  status: string
  shared_storyteller_count: number
}

interface Props {
  serviceSlug: string
  serviceName: string
  serviceColour?: string
  storytellers: ConnectedStoryteller[]
  projects: ConnectedProject[]
}

export function ServiceConnections({
  serviceSlug: _serviceSlug,
  serviceName,
  serviceColour = C.ocean,
  storytellers,
  projects,
}: Props) {
  if (storytellers.length === 0 && projects.length === 0) return null

  return (
    <section className="px-6 md:px-12 py-16" style={{ backgroundColor: C.shell }}>
      <div className="max-w-6xl mx-auto">
        <div
          className="uppercase font-bold mb-3"
          style={{ color: serviceColour, fontSize: 11, letterSpacing: '0.3em' }}
        >
          Connected to {serviceName}
        </div>
        <h2
          className="font-fraunces font-bold leading-tight mb-10"
          style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 44px)' }}
        >
          The people and the work, woven.
        </h2>

        {storytellers.length > 0 && (
          <div className="mb-12">
            <div
              className="uppercase font-bold mb-4"
              style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.3em' }}
            >
              {storytellers.length} {storytellers.length === 1 ? 'storyteller' : 'storytellers'}
            </div>
            <div className="flex flex-wrap gap-3">
              {storytellers.slice(0, 12).map((s) => (
                <Link
                  key={s.id}
                  href={`/voices/${s.slug}`}
                  className="group flex items-center gap-3 px-3 py-2 rounded-full bg-white border hover:shadow-sm transition"
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
                      style={{ backgroundColor: serviceColour + '22', color: serviceColour }}
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
                    <div
                      className="font-semibold leading-tight"
                      style={{ color: C.ocean, fontSize: 13 }}
                    >
                      {s.display_name}
                    </div>
                    {(s.role || s.is_elder) && (
                      <div
                        className="text-[10px] uppercase font-bold tracking-widest leading-none mt-0.5"
                        style={{ color: s.is_elder ? C.ochre : C.driftwood, letterSpacing: '0.15em' }}
                      >
                        {s.is_elder ? 'Elder' : s.role}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {storytellers.length > 12 && (
              <div className="mt-4">
                <Link
                  href={`/voices?service=${encodeURIComponent(_serviceSlug)}`}
                  className="text-xs uppercase font-bold tracking-widest hover:opacity-80"
                  style={{ color: serviceColour, letterSpacing: '0.2em' }}
                >
                  See all {storytellers.length} →
                </Link>
              </div>
            )}
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <div
              className="uppercase font-bold mb-4"
              style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.3em' }}
            >
              {projects.length} connected {projects.length === 1 ? 'project' : 'projects'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map((p) => (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className="group block rounded-2xl overflow-hidden border bg-white hover:shadow-md transition"
                  style={{ borderColor: C.border }}
                >
                  {p.cover_image_url ? (
                    <div className="aspect-[16/10] relative" style={{ backgroundColor: C.shell }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.cover_image_url}
                        alt={p.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div
                      className="aspect-[16/10] flex items-center justify-center p-4 text-center"
                      style={{ backgroundColor: serviceColour + '15' }}
                    >
                      <div
                        className="font-fraunces font-bold leading-tight"
                        style={{ color: serviceColour, fontSize: 18 }}
                      >
                        {p.name}
                      </div>
                    </div>
                  )}
                  <div className="p-5">
                    <div
                      className="text-[10px] uppercase font-bold mb-2"
                      style={{ color: serviceColour, letterSpacing: '0.2em' }}
                    >
                      {p.shared_storyteller_count} shared {p.shared_storyteller_count === 1 ? 'voice' : 'voices'}
                    </div>
                    <h3
                      className="font-fraunces font-bold leading-tight mb-2"
                      style={{ color: C.ocean, fontSize: 18 }}
                    >
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-sm" style={{ color: C.driftwood, lineHeight: 1.5 }}>
                        {p.description.slice(0, 140)}
                        {p.description.length > 140 ? '…' : ''}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
