/**
 * Empathy Ledger v2 services client.
 *
 * EL v2 is the canonical roster of PICC services (Narelle-reviewed).
 * This module is the only place PICC fetches services from EL v2.
 * Falls back to local data-2025.ts SERVICES_2025 when EL v2 is
 * unreachable or returns no rows so the almanac always has data.
 *
 * Requires:
 *   EL_V2_API_URL   — e.g. https://empathy-ledger-v2.vercel.app
 *   EL_V2_API_KEY   — shared secret matching EL v2 PICC_API_KEY
 */

import { SERVICES_2025 } from '@/lib/annual-report/data-2025'

export interface ELService {
  id: string                                    // EL v2 row UUID
  slug: string                                  // stable identifier (e.g. 'bwg-way')
  name: string
  description: string | null
  service_type: 'program' | 'service' | 'centre_of_excellence'
  category: string | null                       // family / health / justice / youth / economic / community / education
  status: 'active' | 'inactive' | 'archived'
  image_url: string | null
  gallery_id: string | null
  latitude: number | null
  longitude: number | null
  address: string | null
}

const base = () => process.env.EL_V2_API_URL?.replace(/\/$/, '')
const key = () => process.env.EL_V2_API_KEY

async function callServicesApi(qs: string): Promise<ELService[] | null> {
  const b = base()
  const k = key()
  if (!b || !k) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)
  try {
    const res = await fetch(`${b}/api/picc/services${qs}`, {
      headers: { 'x-picc-api-key': k },
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!res.ok) return null
    const data = (await res.json()) as { services: ELService[] }
    return data.services ?? null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * The PICC-shaped service object the almanac + IslandServiceMap +
 * service-grid components consume. Matches the SERVICES_2025 static
 * fallback shape so callers don't branch.
 */
export interface PiccService {
  /** Stable id — `svc-${slug}` style for the static fallback, or
   *  the EL v2 UUID when fetched live. Use `slug` for stable refs. */
  id: string
  slug: string
  name: string
  description: string | null
  service_category: string | null
  staff_count: number | null
  clients_served_annual: number | null
}

function fromELService(s: ELService): PiccService {
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    description: s.description,
    service_category: s.category,
    staff_count: null,
    clients_served_annual: null,
  }
}

function fromStatic(): PiccService[] {
  return SERVICES_2025.map((s: any) => ({
    id: s.id,
    slug: s.id.replace(/^svc-/, ''),
    name: s.name,
    description: s.description ?? null,
    service_category: s.service_category ?? null,
    staff_count: s.staff_count ?? null,
    clients_served_annual: s.clients_served_annual ?? null,
  }))
}

/**
 * Get all active PICC services from EL v2, falling back to the local
 * static roster if EL v2 isn't reachable. Always returns something.
 */
export async function getPiccServices(opts: { status?: 'active' | 'all'; category?: string } = {}): Promise<PiccService[]> {
  const status = opts.status ?? 'active'
  const params = new URLSearchParams()
  params.set('status', status)
  if (opts.category) params.set('category', opts.category)
  const qs = `?${params.toString()}`

  const live = await callServicesApi(qs)
  if (live && live.length > 0) {
    return live.map(fromELService)
  }

  // Fallback to static roster
  let services = fromStatic()
  if (opts.category) {
    services = services.filter((s) => s.service_category === opts.category)
  }
  return services
}

/**
 * Synchronous accessor for the static fallback. Useful when the page
 * needs a guaranteed list at render time without an async boundary.
 */
export function getPiccServicesStatic(): PiccService[] {
  return fromStatic()
}
