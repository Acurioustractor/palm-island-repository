/**
 * /picc/projects/coverage — comprehensive project alignment view.
 *
 * Mirrors /picc/services/coverage but for projects. Pulls live from
 * EL canonical (getPiccProjects with include=photos for counts).
 * Deep-links into EL admin's project tagger / face tagger / bulk ops.
 */
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, AlertTriangle, CheckCircle2, Sparkles, Image as ImageIcon, Tag } from 'lucide-react'
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import DraftDescriptionButton from '@/components/admin/DraftDescriptionButton'

export const metadata = {
  title: 'Project alignment — PICC Admin',
  description:
    'Every PICC project in Empathy Ledger v2 with cover, description, photo count, and direct deep-links into EL admin.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const EL_ADMIN_BASE = process.env.NEXT_PUBLIC_EL_V2_URL || 'https://empathy-ledger-v2.vercel.app'

export default async function ProjectsCoverageAdminPage() {
  const projects = await getPiccProjects({ status: 'all' }).catch(() => [])

  const rows = projects
    .filter((p) => p.status !== 'cancelled')
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      status: p.status,
      has_description: !!(p.description && p.description.length > 30),
      has_cover: !!p.cover_image_url,
      cover_url: p.cover_image_url,
      photo_count: p.photo_count,
      tagline: p.tagline,
      themes: p.themes,
    }))

  rows.sort((a, b) => {
    if (a.has_cover !== b.has_cover) return a.has_cover ? 1 : -1
    return a.name.localeCompare(b.name)
  })

  const total = rows.length
  const withCover = rows.filter((r) => r.has_cover).length
  const withDescription = rows.filter((r) => r.has_description).length
  const withPhotos = rows.filter((r) => r.photo_count > 0).length
  const active = rows.filter((r) => r.status === 'active').length

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <header className="mb-8">
        <div
          className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2"
          style={{ color: C.turtleRed }}
        >
          Admin · Project alignment with Empathy Ledger
        </div>
        <h1 className="font-fraunces text-3xl md:text-4xl font-bold mb-3" style={{ color: C.ocean }}>
          {total} projects · {withCover} with cover · {withPhotos} with photos
        </h1>
        <p className="text-stone-600 max-w-3xl">
          Every PICC project in Empathy Ledger v2. The list, the count, the cover photos — all canonical from EL. Click any row to jump into EL admin and fix what&apos;s missing.
        </p>

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
            href="/picc/services/coverage"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest border"
            style={{ borderColor: C.driftwood, color: C.driftwood, letterSpacing: '0.15em' }}
          >
            ← Service alignment
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <Stat label="Total" value={total} colour={C.ocean} />
        <Stat label="Active" value={active} colour={C.mangrove} />
        <Stat label="With cover" value={withCover} sub={`${pct(withCover, total)}%`} colour={withCover === total ? C.mangrove : C.starGold} />
        <Stat label="Description" value={withDescription} sub={`${pct(withDescription, total)}%`} colour={C.mangrove} />
        <Stat label="≥1 photo" value={withPhotos} sub={`${pct(withPhotos, total)}%`} colour={withPhotos === total ? C.mangrove : C.coral} />
      </section>

      <section>
        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border p-3 hover:shadow-sm transition"
              style={{
                borderColor: r.has_cover ? C.border : C.coral,
                backgroundColor: '#fff',
              }}
            >
              <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
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

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <Link
                      href={`/projects/${r.slug}`}
                      target="_blank"
                      className="font-bold hover:underline"
                      style={{ color: C.ocean, fontSize: 16 }}
                    >
                      {r.name}
                    </Link>
                    <span className="text-[10px] font-mono" style={{ color: C.driftwood }}>
                      {r.slug}
                    </span>
                    <span
                      className="text-[9px] uppercase font-bold tracking-[0.15em] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          r.status === 'active' ? '#DCF1E5' : r.status === 'completed' ? '#DAEAF6' : '#F0EDE7',
                        color:
                          r.status === 'active' ? C.mangrove : r.status === 'completed' ? C.ocean : C.driftwood,
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                  {r.tagline && (
                    <div className="text-xs mt-1" style={{ color: C.driftwood }}>
                      {r.tagline}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Pill ok={r.has_cover} okText="Cover" badText="No cover" />
                  <Pill ok={r.has_description} okText="Desc" badText="No desc" />
                  <Count icon="📷" value={r.photo_count} title="Tagged photos" />
                </div>

                <div className="flex justify-end gap-1.5 flex-shrink-0">
                  <DraftDescriptionButton type="project" slug={r.slug} name={r.name} />
                  <a
                    href={`${EL_ADMIN_BASE}/admin/picc-tagging?project=${encodeURIComponent(r.slug)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap"
                    style={{ borderColor: C.driftwood, color: C.driftwood, letterSpacing: '0.15em' }}
                    title="Open photo tagger filtered to this project"
                  >
                    Tag
                  </a>
                  <a
                    href={`${EL_ADMIN_BASE}/admin/projects/${r.id}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap"
                    style={{ borderColor: C.starGold, color: C.starGold, letterSpacing: '0.15em' }}
                    title="Edit in EL admin"
                  >
                    Edit
                  </a>
                  <Link
                    href={`/projects/${r.slug}`}
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
