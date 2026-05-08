/**
 * /picc/services/coverage — comprehensive service alignment view.
 *
 * One page that answers, for every PICC service:
 *   - Is it active in EL?
 *   - Does it have a cover photo? Where does the cover come from?
 *   - Does it have a description?
 *   - How many publishable photos · stories · quotes are linked?
 *   - Quick-link to: tag photos · set cover · edit service · face tagger
 *
 * Pulls live from EL canonical (getPiccServices + getServicesCoverage).
 * Deep-links into EL admin so editors can fix any gap in one click.
 */
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, AlertTriangle, CheckCircle2, Sparkles, Image as ImageIcon, Tag } from 'lucide-react'
import { getPiccServices } from '@/lib/services/el-services'
import { getServicesCoverage } from '@/lib/services/el-coverage'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'
import DraftDescriptionButton from '@/components/admin/DraftDescriptionButton'

export const metadata = {
  title: 'Service alignment — PICC Admin',
  description:
    'Every active PICC service with its EL canonical state, cover photo, photo + quote counts, and direct deep-links into EL admin.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const EL_ADMIN_BASE = process.env.NEXT_PUBLIC_EL_V2_URL || 'https://empathy-ledger-v2.vercel.app'
const PICC_ORG_ID = '084f851c-72e0-41fb-b5ba-f3088f44862d'

interface ServiceRow {
  id: string
  slug: string
  name: string
  status: string
  category: string | null
  has_description: boolean
  has_cover: boolean
  cover_url: string | null
  gallery_id: string | null
  photos_total: number
  photos_publishable: number
  stories: number
  quotes: number
}

function categoryColour(cat: string | null): string {
  switch ((cat || '').toLowerCase()) {
    case 'family': return SECTION_COLOURS.childrenFamilies
    case 'health': return SECTION_COLOURS.healthWellbeing
    case 'justice': return SECTION_COLOURS.justiceSafety
    case 'youth': return SECTION_COLOURS.youth
    case 'economic': return SECTION_COLOURS.economic
    case 'education': return SECTION_COLOURS.educationCommunity
    case 'community': return SECTION_COLOURS.educationCommunity
    case 'governance': return SECTION_COLOURS.governance
    default: return C.driftwood
  }
}

export default async function ServicesCoverageAdminPage() {
  const [services, coverage] = await Promise.all([
    getPiccServices({ status: 'active' }).catch(() => []),
    getServicesCoverage().catch(() => []),
  ])

  const covBySlug = new Map(coverage.map((c) => [c.slug, c]))

  const rows: ServiceRow[] = services.map((s) => {
    const cov = covBySlug.get(s.slug)
    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      status: 'active',
      category: s.service_category,
      has_description: cov?.has_description ?? !!s.description,
      has_cover: !!s.image_url,
      cover_url: s.image_url,
      gallery_id: s.gallery_id,
      photos_total: cov?.photos_total ?? 0,
      photos_publishable: cov?.photos_publishable ?? 0,
      stories: cov?.stories ?? 0,
      quotes: cov?.quotes ?? 0,
    }
  })

  // Uncovered first, then by name
  rows.sort((a, b) => {
    if (a.has_cover !== b.has_cover) return a.has_cover ? 1 : -1
    return a.name.localeCompare(b.name)
  })

  const total = rows.length
  const withCover = rows.filter((r) => r.has_cover).length
  const withDescription = rows.filter((r) => r.has_description).length
  const withGallery = rows.filter((r) => r.gallery_id).length
  const withPhotos = rows.filter((r) => r.photos_publishable > 0).length

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <header className="mb-8">
        <div
          className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2"
          style={{ color: C.turtleRed }}
        >
          Admin · Service alignment with Empathy Ledger
        </div>
        <h1 className="font-fraunces text-3xl md:text-4xl font-bold mb-3" style={{ color: C.ocean }}>
          {total} active services · {withCover} with cover · {withPhotos} with photos
        </h1>
        <p className="text-stone-600 max-w-3xl">
          Every active PICC service in Empathy Ledger v2. The list, the count, the names — all canonical from EL. Click any row to jump into EL admin and fix what&apos;s missing.
        </p>

        {/* Quick links to EL admin */}
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={`${EL_ADMIN_BASE}/admin/picc-tagging`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: C.ocean, color: '#fff', letterSpacing: '0.15em' }}
          >
            <Tag className="w-3 h-3" />
            Open photo tagger
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
          <a
            href={`${EL_ADMIN_BASE}/admin/picc-clusters`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: C.starGold, color: C.midnight, letterSpacing: '0.15em' }}
          >
            <Sparkles className="w-3 h-3" />
            Open face tagger
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
          <a
            href={`${EL_ADMIN_BASE}/admin/picc-bulk`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest border"
            style={{ borderColor: C.ocean, color: C.ocean, letterSpacing: '0.15em' }}
          >
            <ImageIcon className="w-3 h-3" />
            Bulk operations
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
          <Link
            href="/picc/projects/coverage"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest border"
            style={{ borderColor: C.driftwood, color: C.driftwood, letterSpacing: '0.15em' }}
          >
            Project alignment →
          </Link>
        </div>
      </header>

      {/* Coverage stats strip */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <Stat label="Active" value={total} colour={C.ocean} />
        <Stat label="With cover" value={withCover} sub={`${pct(withCover, total)}%`} colour={withCover === total ? C.mangrove : C.starGold} />
        <Stat label="Description" value={withDescription} sub={`${pct(withDescription, total)}%`} colour={C.mangrove} />
        <Stat label="Linked gallery" value={withGallery} sub={`${pct(withGallery, total)}%`} colour={C.ochre} />
        <Stat label="≥1 publishable photo" value={withPhotos} sub={`${pct(withPhotos, total)}%`} colour={withPhotos === total ? C.mangrove : C.coral} />
      </section>

      {/* Service rows */}
      <section>
        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.slug}
              className="rounded-xl border p-3 hover:shadow-sm transition"
              style={{
                borderColor: r.has_cover ? C.border : C.coral,
                backgroundColor: '#fff',
              }}
            >
              <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                {/* Cover thumbnail */}
                <div
                  className="w-16 h-16 rounded-md overflow-hidden relative flex-shrink-0"
                  style={{ backgroundColor: C.shell }}
                >
                  {r.cover_url ? (
                    <Image
                      src={r.cover_url}
                      alt={r.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#FFF1D6' }}>
                      <AlertTriangle className="w-5 h-5" style={{ color: C.coral }} />
                    </div>
                  )}
                </div>

                {/* Name + slug + category */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <Link
                      href={`/services/${r.slug}`}
                      target="_blank"
                      className="font-bold hover:underline"
                      style={{ color: C.ocean, fontSize: 16 }}
                    >
                      {r.name}
                    </Link>
                    <span className="text-[10px] font-mono" style={{ color: C.driftwood }}>
                      {r.slug}
                    </span>
                  </div>
                  {r.category && (
                    <span
                      className="inline-block mt-1 text-[9px] uppercase font-bold tracking-[0.15em] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: categoryColour(r.category) + '22',
                        color: categoryColour(r.category),
                      }}
                    >
                      {r.category}
                    </span>
                  )}
                </div>

                {/* Status pills */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Pill ok={r.has_cover} okText="Cover" badText="No cover" />
                  <Pill ok={r.has_description} okText="Desc" badText="No desc" />
                  <Count icon="📷" value={r.photos_publishable} title="Publishable photos" />
                  <Count icon="📖" value={r.stories} title="Stories" />
                  <Count icon="💬" value={r.quotes} title="Quotes" />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-1.5 flex-shrink-0">
                  <DraftDescriptionButton type="service" slug={r.slug} name={r.name} />
                  <a
                    href={`${EL_ADMIN_BASE}/admin/picc-tagging?service=${encodeURIComponent(r.slug)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap"
                    style={{ borderColor: C.driftwood, color: C.driftwood, letterSpacing: '0.15em' }}
                    title="Open photo tagger filtered to this service"
                  >
                    Tag
                  </a>
                  <a
                    href={`${EL_ADMIN_BASE}/admin/organisations/${PICC_ORG_ID}/services/${r.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap"
                    style={{ borderColor: C.starGold, color: C.starGold, letterSpacing: '0.15em' }}
                    title="Edit name, description, status (active/inactive) in EL admin"
                  >
                    Edit
                  </a>
                  <Link
                    href={`/services/${r.slug}`}
                    target="_blank"
                    className="px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap"
                    style={{ borderColor: C.ocean, color: C.ocean, letterSpacing: '0.15em' }}
                    title="View public page"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value, sub, colour }: { label: string; value: number; sub?: string; colour: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: C.border, backgroundColor: '#fff' }}>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: C.driftwood }}>
        {label}
      </div>
      <div className="font-fraunces font-bold leading-none" style={{ color: colour, fontSize: 32 }}>
        {value}
      </div>
      {sub && (
        <div className="text-[11px] mt-1 font-mono" style={{ color: C.driftwood }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function Pill({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap"
      style={{
        backgroundColor: ok ? '#DCF1E5' : '#FFE4DC',
        color: ok ? C.mangrove : C.coral,
      }}
    >
      {ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {ok ? okText : badText}
    </span>
  )
}

function Count({ icon, value, title }: { icon: string; value: number; title: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono whitespace-nowrap"
      style={{
        backgroundColor: value > 0 ? '#F0EDE7' : '#FFE4DC',
        color: value > 0 ? C.ocean : C.coral,
      }}
      title={title}
    >
      {icon} {value}
    </span>
  )
}

function pct(n: number, d: number): number {
  return d === 0 ? 0 : Math.round((n / d) * 100)
}
