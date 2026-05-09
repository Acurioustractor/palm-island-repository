/**
 * ServicesGrid — public-facing services grid with category filter +
 * sort. Brand-polished cards, EL canonical quote pull-out, photo/
 * video badges, hover lift, Saltwater & Earth tokens throughout.
 *
 * Server component renders the page shell, this island handles the
 * interaction (filter chips, sort, scroll into view on selection).
 */
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Camera, Film, Users, Activity, Quote as QuoteIcon, ArrowRight, ListFilter } from 'lucide-react'
import { BespokeIcon } from '@/components/ui/BespokeIcon'
import { getServiceIcon } from '@/lib/services/service-icons'

export interface ServiceCardData {
  id: string
  slug: string
  name: string
  description: string | null
  service_category: string | null
  staff_count: number | null
  clients_served: number | null
  cover_photo: { public_url: string; alt_text: string | null } | null
  photo_count: number
  has_video: boolean
  el_quote: { text: string; author: string } | null
}

const CATEGORY_LABELS: Record<string, string> = {
  health: 'Health & healing',
  family: 'Family & children',
  justice: 'Justice & safety',
  youth: 'Youth & education',
  education: 'Education',
  community: 'Community',
  economic: 'Economic',
  governance: 'Governance',
}

const CATEGORY_COLOURS: Record<string, string> = {
  health: '#C8963E',
  family: '#A67C6D',
  justice: '#8B1A1A',
  youth: '#0EA5E9',
  education: '#0B4F6C',
  community: '#0B4F6C',
  economic: '#F5A623',
  governance: '#8B1A1A',
}

function categoryColour(cat: string | null): string {
  return cat ? CATEGORY_COLOURS[cat] || '#6B6560' : '#6B6560'
}

function categoryLabel(cat: string | null): string {
  if (!cat) return 'Other'
  return CATEGORY_LABELS[cat] || cat
}

type Sort = 'name' | 'photos' | 'staff'

export default function ServicesGrid({ services }: { services: ServiceCardData[] }) {
  const [activeCat, setActiveCat] = useState<string>('all')
  const [sort, setSort] = useState<Sort>('name')

  // Group + count
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: services.length }
    for (const s of services) {
      const k = s.service_category || 'other'
      c[k] = (c[k] || 0) + 1
    }
    return c
  }, [services])

  const filtered = useMemo(() => {
    let list = services
    if (activeCat !== 'all') {
      list = list.filter((s) => (s.service_category || 'other') === activeCat)
    }
    return [...list].sort((a, b) => {
      if (sort === 'photos') return b.photo_count - a.photo_count || a.name.localeCompare(b.name)
      if (sort === 'staff') return (b.staff_count || 0) - (a.staff_count || 0) || a.name.localeCompare(b.name)
      return a.name.localeCompare(b.name)
    })
  }, [services, activeCat, sort])

  // Categories present in dataset, ordered
  const categories = useMemo(() => {
    const order = ['health', 'family', 'justice', 'youth', 'education', 'community', 'economic', 'governance']
    return order.filter((c) => counts[c])
  }, [counts])

  return (
    <section className="py-16 md:py-20" id="services-grid">
      <div className="max-w-7xl mx-auto px-6">
        {/* Filter bar */}
        <div className="mb-10">
          <div className="flex items-baseline justify-between gap-4 flex-wrap mb-4">
            <div>
              <p
                className="uppercase font-bold mb-2"
                style={{ color: '#8B1A1A', fontSize: 11, letterSpacing: '0.3em' }}
              >
                Every active service · EL canonical
              </p>
              <h2
                className="font-fraunces font-bold leading-tight"
                style={{ color: '#0B4F6C', fontSize: 'clamp(28px, 4vw, 40px)' }}
              >
                The full roster.
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: '#6B6560' }}>
              <ListFilter className="w-4 h-4" />
              <span>{filtered.length} of {services.length}</span>
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Chip
              active={activeCat === 'all'}
              onClick={() => setActiveCat('all')}
              colour="#0B4F6C"
              label={`All ${counts.all}`}
            />
            {categories.map((cat) => (
              <Chip
                key={cat}
                active={activeCat === cat}
                onClick={() => setActiveCat(cat)}
                colour={categoryColour(cat)}
                label={`${categoryLabel(cat)} ${counts[cat]}`}
              />
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3 text-xs" style={{ color: '#6B6560' }}>
            <span className="uppercase font-bold tracking-widest" style={{ letterSpacing: '0.2em' }}>
              Sort
            </span>
            <div className="inline-flex rounded-md overflow-hidden" style={{ border: '1px solid #E8E6E3' }}>
              {(
                [
                  ['name', 'A → Z'],
                  ['photos', 'Most photos'],
                  ['staff', 'Most staff'],
                ] as const
              ).map(([key, label], i) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSort(key)}
                  className={`px-3 py-1.5 transition ${i > 0 ? 'border-l' : ''}`}
                  style={{
                    backgroundColor: sort === key ? '#0B4F6C' : '#fff',
                    color: sort === key ? '#FBF8EE' : '#6B6560',
                    borderColor: '#E8E6E3',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ border: '1px solid #E8E6E3', backgroundColor: '#F7F6F4' }}
          >
            <p className="text-sm" style={{ color: '#6B6560' }}>
              No services in this category yet. Try another filter.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ── COMPONENTS ────────────────────────────────────────────────────────

function Chip({ active, onClick, colour, label }: { active: boolean; onClick: () => void; colour: string; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition hover:shadow-sm"
      style={{
        backgroundColor: active ? colour : '#fff',
        color: active ? '#FBF8EE' : colour,
        border: `1px solid ${colour}`,
        letterSpacing: '0.15em',
      }}
    >
      {label}
    </button>
  )
}

function ServiceCard({ service }: { service: ServiceCardData }) {
  const colour = categoryColour(service.service_category)
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group block"
    >
      <article
        className="rounded-2xl bg-white overflow-hidden transition hover:shadow-md flex flex-col h-full"
        style={{ border: '1px solid #E8E6E3' }}
      >
        {/* Cover */}
        <div className="aspect-[16/9] relative overflow-hidden" style={{ backgroundColor: '#F7F6F4' }}>
          {service.cover_photo ? (
            <>
              <Image
                src={service.cover_photo.public_url}
                alt={service.cover_photo.alt_text || service.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.45) 100%)' }} />
              {/* Category pill (top-left) */}
              {service.service_category && (
                <div className="absolute top-3 left-3">
                  <span
                    className="inline-block text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full backdrop-blur-sm"
                    style={{
                      backgroundColor: '#FBF8EEE0',
                      color: colour,
                      letterSpacing: '0.2em',
                    }}
                  >
                    {categoryLabel(service.service_category)}
                  </span>
                </div>
              )}
              {/* Photo/video badges (bottom-right) */}
              <div className="absolute bottom-3 right-3 flex gap-2">
                {service.photo_count > 0 && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
                  >
                    <Camera className="w-3 h-3" />
                    {service.photo_count}
                  </span>
                )}
                {service.has_video && (
                  <span
                    className="inline-flex items-center justify-center px-2 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
                  >
                    <Film className="w-3 h-3" />
                  </span>
                )}
              </div>
            </>
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center p-6 gap-3"
              style={{ backgroundColor: colour + '12' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: colour }}
              >
                <BespokeIcon name={getServiceIcon(service.slug)} size={28} darkMode />
              </div>
              <span
                className="font-fraunces font-bold text-center leading-tight"
                style={{ color: colour, fontSize: 18 }}
              >
                {service.name}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 flex-1 flex flex-col">
          <h3
            className="font-fraunces font-bold leading-tight mb-3 transition-colors"
            style={{ color: '#0B4F6C', fontSize: 22 }}
          >
            {service.name}
          </h3>

          <p
            className="text-sm leading-relaxed mb-4 line-clamp-3"
            style={{ color: '#2D2319' }}
          >
            {service.description || `Supporting the Palm Island community through ${categoryLabel(service.service_category).toLowerCase()} programs.`}
          </p>

          {/* EL quote pull-out */}
          {service.el_quote && (
            <div
              className="mb-4 pl-3 py-1"
              style={{ borderLeft: `2px solid ${colour}66` }}
            >
              <p
                className="italic text-xs leading-relaxed line-clamp-2"
                style={{ color: '#6B6560', fontFamily: 'Fraunces, Georgia, serif' }}
              >
                &ldquo;{service.el_quote.text}&rdquo;
              </p>
              <p
                className="text-[10px] mt-1 font-bold uppercase tracking-widest"
                style={{ color: colour, letterSpacing: '0.15em' }}
              >
                — {service.el_quote.author}
              </p>
            </div>
          )}

          {/* Footer — staff/clients + read CTA */}
          <div
            className="mt-auto pt-4 flex items-center justify-between text-sm"
            style={{ borderTop: '1px solid #E8E6E3' }}
          >
            <div className="flex items-center gap-3">
              {service.staff_count != null && service.staff_count > 0 && (
                <span className="flex items-center gap-1" style={{ color: colour }}>
                  <Users className="w-3.5 h-3.5" />
                  <span className="font-mono text-xs">{service.staff_count}</span>
                </span>
              )}
              {service.clients_served != null && service.clients_served > 0 && (
                <span className="flex items-center gap-1" style={{ color: '#6B6560' }}>
                  <Activity className="w-3.5 h-3.5" />
                  <span className="font-mono text-xs">{service.clients_served.toLocaleString()}</span>
                </span>
              )}
              {service.el_quote && (
                <span className="flex items-center gap-1" style={{ color: '#6B6560' }}>
                  <QuoteIcon className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <span
              className="text-[10px] uppercase font-bold tracking-widest inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5"
              style={{ color: colour, letterSpacing: '0.2em' }}
            >
              Read
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
