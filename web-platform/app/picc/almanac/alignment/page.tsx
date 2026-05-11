/**
 * /picc/almanac/alignment — single-page entity audit.
 *
 * One view that shows EVERY entity in EL (storytellers · services ·
 * projects) with the photos linked to it. Gaps surface immediately:
 * "Luella Bligh: 0 photos" → click to upload in EL.
 *
 * This is the data-first step. Get this clean before any Pencil work.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import AlignmentClient, {
  type AlignmentEntity,
  type AlignmentPhoto,
} from './AlignmentClient'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export const metadata = {
  title: 'Almanac alignment · PICC',
  description:
    'Every storyteller, service, and project — with the photos linked to each. Fix the gaps in EL before building.',
}

const EL_ADMIN = process.env.NEXT_PUBLIC_EL_V2_URL?.replace(/\/$/, '') || 'https://picc.empathyledger.com'

interface ManifestEntry {
  slot: string
  index: number
  file: string
  pencilPath: string
  source_url: string
  alt: string | null
  caption: string | null
  storyteller_id?: string
  storyteller_slug?: string
  storyteller_name?: string
  storyteller_is_elder?: boolean
  service_slug?: string
  service_name?: string
  width: number | null
  height: number | null
  print_score: string
}

async function loadManifest(): Promise<ManifestEntry[]> {
  try {
    const txt = await readFile(
      join(process.cwd(), 'pencil-photos', 'MANIFEST.json'),
      'utf8',
    )
    return (JSON.parse(txt) as { photos: ManifestEntry[] }).photos ?? []
  } catch {
    return []
  }
}

async function fetchEL<T>(path: string): Promise<T | null> {
  const base = process.env.EL_V2_API_URL?.replace(/\/$/, '')
  const key = process.env.EL_V2_API_KEY
  if (!base || !key) return null
  try {
    const r = await fetch(`${base}${path}`, {
      headers: { 'x-picc-api-key': key },
      cache: 'no-store',
    })
    if (!r.ok) return null
    return (await r.json()) as T
  } catch {
    return null
  }
}

export default async function AlmanacAlignmentPage() {
  const [manifest, stData, svcData] = await Promise.all([
    loadManifest(),
    fetchEL<{ storytellers: Array<{ id: string; slug: string; display_name: string; is_elder: boolean; quote_count?: number }> }>(
      '/api/picc/storytellers?limit=200',
    ),
    fetchEL<{ services: Array<{ slug: string; name: string }> }>('/api/picc/services?limit=200'),
  ])

  // Build entity views
  const photosByStoryteller = new Map<string, ManifestEntry[]>()
  const photosByService = new Map<string, ManifestEntry[]>()
  for (const p of manifest) {
    if (p.storyteller_slug) {
      const arr = photosByStoryteller.get(p.storyteller_slug) ?? []
      arr.push(p)
      photosByStoryteller.set(p.storyteller_slug, arr)
    }
    if (p.service_slug) {
      const arr = photosByService.get(p.service_slug) ?? []
      arr.push(p)
      photosByService.set(p.service_slug, arr)
    }
  }

  const storytellers: AlignmentEntity[] = (stData?.storytellers ?? [])
    .map((s) => ({
      kind: 'storyteller' as const,
      id: s.id,
      slug: s.slug,
      name: s.display_name,
      isElder: s.is_elder,
      quoteCount: s.quote_count ?? null,
      photos: (photosByStoryteller.get(s.slug) ?? []).map(toPhoto),
      elAdminUrl: `${EL_ADMIN}/admin/storytellers/${s.id}`,
    }))
    .sort((a, b) => {
      // Has photos first, then elders, then alphabetical
      const aHas = a.photos.length > 0 ? 0 : 1
      const bHas = b.photos.length > 0 ? 0 : 1
      if (aHas !== bHas) return aHas - bHas
      if (a.isElder !== b.isElder) return a.isElder ? -1 : 1
      return a.name.localeCompare(b.name)
    })

  const services: AlignmentEntity[] = (svcData?.services ?? [])
    .map((s) => ({
      kind: 'service' as const,
      id: s.slug,
      slug: s.slug,
      name: s.name,
      isElder: false,
      quoteCount: null,
      photos: (photosByService.get(s.slug) ?? []).map(toPhoto),
      elAdminUrl: `${EL_ADMIN}/admin/services/${s.slug}`,
    }))
    .sort((a, b) => {
      const aHas = a.photos.length > 0 ? 0 : 1
      const bHas = b.photos.length > 0 ? 0 : 1
      if (aHas !== bHas) return aHas - bHas
      return a.name.localeCompare(b.name)
    })

  const stWithPhotos = storytellers.filter((s) => s.photos.length > 0).length
  const stWithoutPhotos = storytellers.length - stWithPhotos
  const svcWithPhotos = services.filter((s) => s.photos.length > 0).length
  const svcWithoutPhotos = services.length - svcWithPhotos

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <p
          className="font-bold uppercase mb-3"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          PICC · ALMANAC · DATA ALIGNMENT
        </p>
        <h1
          className="font-fraunces font-bold mb-3"
          style={{ color: C.ocean, fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.05 }}
        >
          Every photo linked to every person, service, project.
        </h1>
        <p
          className="font-fraunces mb-6"
          style={{ color: C.driftwood, fontSize: 20, lineHeight: 1.4, maxWidth: 720 }}
        >
          Before any Pencil work. Get the relationships right in EL first —
          the report builds itself once the data is clean.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Storytellers" big={stWithPhotos} small={`/ ${storytellers.length}`} color={C.ocean} caption="with photos" />
          <Stat label="Need photos" big={stWithoutPhotos} small="people" color={C.turtleRed} caption="upload to EL" />
          <Stat label="Services" big={svcWithPhotos} small={`/ ${services.length}`} color={C.mangrove} caption="with photos" />
          <Stat label="Need photos" big={svcWithoutPhotos} small="services" color={C.ochre} caption="upload to EL" />
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/picc/almanac/auto-fill" className="px-3 py-1.5 rounded-md hover:bg-stone-50" style={{ color: C.ocean, border: `1px solid ${C.border}` }}>
            ✨ Auto-fill spreads →
          </Link>
          <Link href="/picc/almanac/photo-library" className="px-3 py-1.5 rounded-md hover:bg-stone-50" style={{ color: C.ocean, border: `1px solid ${C.border}` }}>
            Photo library →
          </Link>
          <a href={EL_ADMIN} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 hover:bg-stone-50" style={{ color: C.ochre, border: `1px solid ${C.border}` }}>
            EL admin <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      <AlignmentClient storytellers={storytellers} services={services} />
    </div>
  )
}

function toPhoto(p: ManifestEntry): AlignmentPhoto {
  return {
    file: p.file,
    pencilPath: p.pencilPath.replace(/^\.\//, ''),
    source_url: p.source_url,
    width: p.width,
    height: p.height,
    print_score: p.print_score as AlignmentPhoto['print_score'],
    caption: p.caption,
  }
}

function Stat({ label, big, small, color, caption }: { label: string; big: number; small: string; color: string; caption: string }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: color }}>
      <p className="text-xs font-bold uppercase" style={{ color: C.muted, letterSpacing: '0.15em' }}>{label}</p>
      <p className="mt-1">
        <span className="font-fraunces font-bold" style={{ color, fontSize: 36, lineHeight: 1 }}>{big}</span>
        <span className="ml-1 text-sm" style={{ color: C.muted }}>{small}</span>
      </p>
      <p className="text-xs mt-1" style={{ color: C.driftwood }}>{caption}</p>
    </div>
  )
}
