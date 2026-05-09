/**
 * /picc/services/map — drag-to-position admin for service GPS pins.
 *
 * Service rows from PICC organization_services (legacy) merged with
 * EL canonical services (latitude / longitude / address). Drag any pin
 * to set its position; save endpoint writes to BOTH PICC + EL canonical
 * so the next read from /services or /picc/twenty-years reflects the
 * change immediately.
 *
 * Server component shell + client island for the leaflet map.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { getPiccServices } from '@/lib/services/el-services'
import { ogMeta } from '@/lib/seo/og'
import ServicesMapEditor from './ServicesMapEditor'

export const metadata = ogMeta({
  title: 'Service map editor — PICC admin',
  description: 'Drag-to-position service GPS pins. Persists to PICC + EL canonical.',
  path: '/picc/services/map',
})

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ServicesMapEditorPage() {
  const supabase = createServerSupabase()
  const [piccRes, elServices] = await Promise.all([
    supabase
      .from('organization_services')
      .select('id, name, slug, service_category, metadata, is_active')
      .eq('is_active', true)
      .order('name'),
    getPiccServices({ status: 'active' }).catch(() => []),
  ])

  // Merge: prefer EL canonical lat/lng if present, fall back to PICC metadata
  const elBySlug = new Map(elServices.map((s) => [s.slug, s]))
  const services = (piccRes.data || []).map((p: any) => {
    const el = elBySlug.get(p.slug)
    const meta = (p.metadata || {}) as Record<string, any>
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      service_category: p.service_category,
      latitude: el?.latitude ?? meta.latitude ?? null,
      longitude: el?.longitude ?? meta.longitude ?? null,
      address: el?.address ?? meta.address ?? null,
      hasGeo: (el?.latitude != null && el?.longitude != null) || (meta.latitude != null && meta.longitude != null),
    }
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/picc/services"
            className="inline-flex items-center gap-2 mb-4 text-xs uppercase font-bold tracking-widest hover:opacity-80"
            style={{ color: '#6B6560', letterSpacing: '0.2em' }}
          >
            ← Services
          </Link>
          <p
            className="uppercase font-bold mb-2"
            style={{ color: '#8B1A1A', fontSize: 11, letterSpacing: '0.3em' }}
          >
            PICC admin · service map editor
          </p>
          <h1
            className="font-fraunces font-bold leading-tight"
            style={{ color: '#0B4F6C', fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            Where the work happens.
          </h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: '#6B6560' }}>
            Drag any pin to position it on Palm Island. Coordinates persist to
            EL canonical first, then mirrored to the PICC mirror — same source
            the public <Link href="/services" className="underline" style={{ color: '#0B4F6C' }}>/services</Link> page
            and the <Link href="/picc/twenty-years" className="underline" style={{ color: '#0B4F6C' }}>twenty-years showcase</Link> read from.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs" style={{ color: '#6B6560' }}>
            <span><strong style={{ color: '#16A34A' }}>{services.filter((s) => s.hasGeo).length}</strong> placed</span>
            <span><strong style={{ color: '#C8963E' }}>{services.filter((s) => !s.hasGeo).length}</strong> awaiting placement</span>
            <span>{services.length} active services total</span>
          </div>
        </div>

        <ServicesMapEditor services={services} />
      </div>
    </div>
  )
}
