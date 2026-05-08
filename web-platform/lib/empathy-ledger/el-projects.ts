/**
 * Empathy Ledger v2 projects client.
 *
 * EL v2 is the canonical projects roster (seeded by EL migration
 * 20260429140000_picc_projects_canonical_seed.sql). This module is the
 * only place PICC fetches projects from EL v2. Replaces the parallel
 * PICC Supabase `projects` table consumption — see migration plan
 * thoughts/shared/plans/2026-05-08-el-canonical-migration.md.
 *
 * Requires:
 *   EL_V2_API_URL   — e.g. https://empathy-ledger-v2.vercel.app
 *   EL_V2_API_KEY   — shared secret matching EL v2 PICC_API_KEY
 */

export interface ELProject {
  /** EL v2 row UUID */
  id: string
  /** Stable identifier (e.g. 'photo-studio', 'first-1000-days') */
  slug: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  /** Canonical hero / cover photo URL */
  cover_image_url: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  /** PICC overlay (external_references.picc.tagline) */
  tagline: string | null
  /** PICC overlay themes — culture-country, technology-sovereignty,
   *  employment-enterprise, etc. Free-form strings; consumers pick. */
  themes: string[]
  /** PICC overlay project_type — 'innovation', 'trip', etc.
   *  Set per the migration plan: trips will be project_type='trip'. */
  project_type: string | null
  /** Number of EL v2 photos tagged for this project's slot. */
  photo_count: number
  updated_at: string
}

export interface ELProjectPhoto {
  id: string
  url: string
  thumbnail_url: string | null
  alt_text: string | null
  caption: string | null
  taken_at: string | null
}

const base = () => process.env.EL_V2_API_URL?.replace(/\/$/, '')
const key = () => process.env.EL_V2_API_KEY

async function call<T>(path: string): Promise<T | null> {
  const b = base()
  const k = key()
  if (!b || !k) return null
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15_000)
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
    clearTimeout(timer)
  }
}

/**
 * Get all PICC projects from EL v2. Defaults to status='active'.
 * Pass 'all' to include completed + on_hold + cancelled.
 *
 * Returns [] when EL is unreachable — pages should handle empty
 * gracefully (no parallel fallback to PICC Supabase, that's the
 * whole point of the migration).
 */
export async function getPiccProjects(
  opts: { status?: 'active' | 'completed' | 'all'; include?: ('photos')[] } = {},
): Promise<ELProject[]> {
  const status = opts.status ?? 'active'
  const params = new URLSearchParams()
  params.set('status', status)
  if (opts.include?.includes('photos')) params.set('include', 'photos')
  const r = await call<{ count: number; projects: ELProject[] }>(`/api/picc/projects?${params.toString()}`)
  return r?.projects ?? []
}

/**
 * Single-project lookup by slug. Returns null if EL is unreachable
 * OR if no project matches. Used by /projects/[slug].
 */
export async function getPiccProject(slug: string): Promise<ELProject | null> {
  const params = new URLSearchParams({ slug })
  const r = await call<{ count: number; projects: ELProject[] }>(`/api/picc/projects?${params.toString()}`)
  return r?.projects?.[0] ?? null
}

/**
 * Single-project lookup with photos embedded. Slightly heavier — use
 * for the detail page where the gallery is rendered.
 */
export async function getPiccProjectWithPhotos(
  slug: string,
): Promise<{ project: ELProject; photos: ELProjectPhoto[] } | null> {
  const params = new URLSearchParams({ slug, include: 'photos' })
  const r = await call<{
    count: number
    projects: ELProject[]
    photos?: Record<string, ELProjectPhoto[]>
  }>(`/api/picc/projects?${params.toString()}`)
  const project = r?.projects?.[0]
  if (!project) return null
  const photos = r?.photos?.[project.slug] ?? []
  return { project, photos }
}
