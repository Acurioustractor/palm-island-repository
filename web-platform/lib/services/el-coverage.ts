/**
 * EL v2 coverage + voices-pool clients. Used by the almanac admin
 * pages to surface what data exists in EL v2 right now.
 */

const base = () => process.env.EL_V2_API_URL?.replace(/\/$/, '')
const key = () => process.env.EL_V2_API_KEY

async function call<T>(path: string): Promise<T | null> {
  const b = base()
  const k = key()
  if (!b || !k) return null
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 15_000)
  try {
    const res = await fetch(`${b}${path}`, {
      headers: { 'x-picc-api-key': k },
      cache: 'no-store',
      signal: ctrl.signal,
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

export interface ServiceCoverage {
  slug: string
  name: string
  status: string
  has_description: boolean
  gallery_id: string | null
  photos_total: number
  photos_publishable: number
  stories: number
  quotes: number
}

export async function getServicesCoverage(): Promise<ServiceCoverage[]> {
  const r = await call<{ services: ServiceCoverage[] }>(`/api/picc/coverage`)
  return r?.services ?? []
}

export interface PoolVoice {
  id: string
  quote: string
  speaker_name: string
  speaker_role: string | null
  storyteller_id: string
  service_slugs: string[]
  photo_url: string | null
  recorded_at: string | null
}

export async function getVoicesPool(serviceSlug?: string): Promise<PoolVoice[]> {
  const path = serviceSlug
    ? `/api/picc/voices-pool?service=${encodeURIComponent(serviceSlug)}`
    : `/api/picc/voices-pool`
  const r = await call<{ voices: PoolVoice[] }>(path)
  return r?.voices ?? []
}
