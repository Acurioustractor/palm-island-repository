'use client'

import { useMemo, useState } from 'react'
import { Loader2, MapPin, X } from 'lucide-react'

type ServicePin = {
  id: string
  name: string
  slug?: string
  description?: string | null
  service_category?: string | null
  icon_name?: string | null
  service_color?: string | null
  metadata?: any
}

type ServiceMedia = {
  id: string
  public_url: string
  title?: string | null
  caption?: string | null
  alt_text?: string | null
  tags?: string[] | null
}

export function ServicePinMap({
  services,
  backgroundImage,
}: {
  services: ServicePin[]
  backgroundImage?: string
}) {
  const [activeService, setActiveService] = useState<ServicePin | null>(null)
  const [loading, setLoading] = useState(false)
  const [media, setMedia] = useState<ServiceMedia[]>([])
  const [error, setError] = useState<string | null>(null)

  const pins = useMemo(() => {
    const list = Array.isArray(services) ? services : []
    return list.map((s, index) => {
      const mx = Number(s?.metadata?.map_x)
      const my = Number(s?.metadata?.map_y)
      const hasCoords = Number.isFinite(mx) && Number.isFinite(my)

      // Fallback positions (so it still works even before pin coords are set)
      const angle = (index / Math.max(1, list.length)) * Math.PI * 2
      const fallbackX = 0.5 + 0.28 * Math.cos(angle)
      const fallbackY = 0.5 + 0.22 * Math.sin(angle)

      return {
        service: s,
        x: clamp01(hasCoords ? mx : fallbackX),
        y: clamp01(hasCoords ? my : fallbackY),
      }
    })
  }, [services])

  const open = async (service: ServicePin) => {
    setActiveService(service)
    setLoading(true)
    setError(null)
    setMedia([])

    try {
      const slug = service.slug || service.metadata?.slug || ''
      if (!slug) throw new Error('Service is missing a slug')

      const res = await fetch(`/api/public/service-media?slug=${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to load service photos')

      setMedia((json.media || []) as ServiceMedia[])
    } catch (e: any) {
      setError(e?.message || 'Failed to load service photos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative rounded-3xl border border-gray-200 overflow-hidden bg-gray-50">
      <div className="relative h-[520px]">
        {backgroundImage ? (
          <img src={backgroundImage} alt="Palm Island map" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#2d6a4f]" />
        )}
        <div className="absolute inset-0 bg-black/20" />

        {/* Pins */}
        {pins.map(({ service, x, y }) => (
          <button
            key={service.id}
            type="button"
            onClick={() => open(service)}
            className="absolute -translate-x-1/2 -translate-y-full group"
            style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
          >
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-2 border-white"
                style={{ backgroundColor: service.service_color || '#2563eb' }}
              >
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="absolute top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white text-gray-900 text-xs font-medium px-2 py-1 rounded shadow border border-gray-200 whitespace-nowrap">
                  {service.name}
                </div>
              </div>
            </div>
          </button>
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-2xl border border-white/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-900">Click a pin to explore</div>
              <div className="text-xs text-gray-600 mt-1">
                Pin locations can be set per service using <code className="bg-gray-100 px-1 rounded">metadata.map_x</code> and{' '}
                <code className="bg-gray-100 px-1 rounded">metadata.map_y</code> (0–1).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {activeService && (
        <div className="border-t border-gray-200 bg-white">
          <div className="p-6 flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-bold text-gray-900">{activeService.name}</div>
              <div className="text-sm text-gray-600 mt-1">{activeService.description || 'No description yet.'}</div>
            </div>
            <button
              type="button"
              onClick={() => setActiveService(null)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="px-6 pb-6">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading photos…
              </div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : media.length === 0 ? (
              <div className="text-sm text-gray-600">
                No photos tagged to this service yet. Tag photos with{' '}
                <code className="bg-gray-100 px-1 rounded">service:{activeService.slug || 'service-slug'}</code>.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {media.slice(0, 8).map((m) => (
                  <a
                    key={m.id}
                    href={m.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                  >
                    <img src={m.public_url} alt={m.alt_text || m.title || 'Service photo'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0.5
  return Math.max(0, Math.min(1, value))
}
