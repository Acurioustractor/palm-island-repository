/**
 * /picc/almanac/photo-library — visual browser for every photo synced
 * into pencil-photos/. Big thumbnails, hover lightbox, click-to-copy
 * Pencil path.
 *
 * Reads MANIFEST.json so it shows exactly what's available locally
 * (synced from EL). For "what's available in EL but not yet synced"
 * use /picc/almanac/pencil-bridge — this page is for fast browsing.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import { IMAGE_TARGETS } from '@/lib/almanac/pencil-image-targets'
import { PENCIL_FRAME_BY_ID } from '@/lib/almanac/pencil-frame-map'
import PhotoLibraryClient, { type LibraryPhoto } from './PhotoLibraryClient'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export const metadata = {
  title: 'Photo library · PICC Almanac',
  description:
    'Visual browser for every EL photo synced to pencil-photos/. Click any photo to copy its Pencil path.',
}

interface ManifestEntry {
  slot: string
  index: number
  file: string
  pencilPath: string
  source_url: string
  alt: string | null
  caption: string | null
  service_slug?: string
  service_name?: string
  el_id: string
  bytes: number
  width: number | null
  height: number | null
  print_score: 'fullbleed' | 'halfpage' | 'quarterpage' | 'thumbnail' | 'too-small' | 'unknown'
}

interface Manifest {
  generated_at: string
  count: number
  photos: ManifestEntry[]
}

async function loadManifest(): Promise<Manifest | null> {
  try {
    const txt = await readFile(
      join(process.cwd(), 'pencil-photos', 'MANIFEST.json'),
      'utf8',
    )
    return JSON.parse(txt) as Manifest
  } catch {
    return null
  }
}

export default async function PhotoLibraryPage() {
  const manifest = await loadManifest()

  if (!manifest) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <header className="mb-10">
          <p
            className="font-bold uppercase mb-3"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            PICC · ALMANAC · PHOTO LIBRARY
          </p>
          <h1
            className="font-fraunces font-bold mb-3"
            style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.1 }}
          >
            No photos synced yet
          </h1>
          <p className="font-fraunces" style={{ color: C.driftwood, fontSize: 18 }}>
            Run the sync script to pull EL photos into <code>pencil-photos/</code>:
          </p>
        </header>
        <div
          className="rounded-xl p-6"
          style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}
        >
          <pre
            className="text-sm overflow-x-auto"
            style={{ color: C.ocean, fontFamily: 'ui-monospace, monospace' }}
          >
            cd web-platform{'\n'}node scripts/sync-pencil-photos.mjs
          </pre>
          <p className="mt-3 text-sm font-fraunces" style={{ color: C.muted }}>
            Then refresh this page. Photos appear in a grid, click any to copy the Pencil path.
          </p>
        </div>
        <div className="mt-6 flex gap-3 text-sm">
          <Link
            href="/picc/almanac/pencil-bridge"
            className="px-3 py-1.5 rounded-md hover:bg-stone-50"
            style={{ color: C.ocean, border: `1px solid ${C.border}` }}
          >
            ← Pencil photo bridge
          </Link>
        </div>
      </div>
    )
  }

  // Group photos by slot for the section grouping
  const bySlot = new Map<string, LibraryPhoto[]>()
  for (const p of manifest.photos) {
    const arr = bySlot.get(p.slot) ?? []
    arr.push({
      slot: p.slot,
      index: p.index,
      file: p.file,
      pencilPath: p.pencilPath.replace(/^\.\//, ''),
      source_url: p.source_url,
      alt: p.alt,
      caption: p.caption,
      service_name: p.service_name ?? null,
      el_id: p.el_id,
      bytes: p.bytes,
      width: p.width ?? null,
      height: p.height ?? null,
      print_score: p.print_score ?? 'unknown',
    })
    bySlot.set(p.slot, arr)
  }

  const groups = Array.from(bySlot.entries())
    .map(([slot, photos]) => ({ slot, photos: photos.sort((a, b) => a.index - b.index) }))
    .sort((a, b) => a.slot.localeCompare(b.slot))

  const totalBytes = manifest.photos.reduce((sum, p) => sum + p.bytes, 0)
  const generated = new Date(manifest.generated_at)

  // Print-readiness rollup for the header
  const printTally = manifest.photos.reduce(
    (acc, p) => {
      const k = p.print_score ?? 'unknown'
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <p
          className="font-bold uppercase mb-3"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          PICC · ALMANAC · PHOTO LIBRARY
        </p>
        <h1
          className="font-fraunces font-bold mb-3"
          style={{ color: C.ocean, fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.1 }}
        >
          {manifest.count} photos ready for Pencil
        </h1>
        <p
          className="font-fraunces mb-6"
          style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.4, maxWidth: 720 }}
        >
          Every EL photo synced into <code>pencil-photos/</code>. Click any photo to copy
          its Pencil path. Hover to enlarge.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span
            className="px-3 py-1.5 rounded-md font-bold"
            style={{ backgroundColor: C.shell, color: C.ocean, border: `1px solid ${C.border}` }}
          >
            {manifest.count} photos · {(totalBytes / 1_000_000).toFixed(1)} MB
          </span>
          {(['fullbleed', 'halfpage', 'quarterpage'] as const).map((s) => {
            const count = printTally[s] ?? 0
            if (count === 0) return null
            const colors: Record<typeof s, { bg: string; fg: string; label: string }> = {
              fullbleed: { bg: '#15803D14', fg: '#15803D', label: '🖨 Full bleed' },
              halfpage: { bg: '#0EA5E914', fg: '#0EA5E9', label: '½ page' },
              quarterpage: { bg: '#C8963E14', fg: '#C8963E', label: '¼ page' },
            }
            const c = colors[s]
            return (
              <span
                key={s}
                className="px-3 py-1.5 rounded-md text-xs font-bold"
                style={{ backgroundColor: c.bg, color: c.fg, border: `1px solid ${c.fg}33` }}
              >
                {count} {c.label}
              </span>
            )
          })}
          <span
            className="px-3 py-1.5 rounded-md text-xs"
            style={{ color: C.muted, border: `1px solid ${C.border}` }}
            title={generated.toISOString()}
          >
            Synced {generated.toLocaleString()}
          </span>
          <Link
            href="/picc/almanac/pencil-bridge"
            className="px-3 py-1.5 rounded-md hover:bg-stone-50"
            style={{ color: C.ocean, border: `1px solid ${C.border}` }}
          >
            ← Pencil bridge (slot view)
          </Link>
          <a
            href="https://picc.empathyledger.com/admin/photos"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 hover:bg-stone-50"
            style={{ color: C.ochre, border: `1px solid ${C.border}` }}
          >
            EL photo admin <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Re-sync helper */}
      <section
        className="rounded-xl p-5 mb-10"
        style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}
      >
        <p
          className="font-bold uppercase mb-2"
          style={{ color: C.ochre, fontSize: 10, letterSpacing: '0.3em' }}
        >
          NEED MORE PHOTOS?
        </p>
        <ol className="space-y-1 text-sm font-fraunces" style={{ color: C.earth }}>
          <li>
            <span className="font-bold" style={{ color: C.ocean }}>1 ·</span>{' '}
            Tag photos in EL admin with{' '}
            <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}>
              picc:slot:&lt;your-slot-name&gt;
            </code>
          </li>
          <li>
            <span className="font-bold" style={{ color: C.ocean }}>2 ·</span>{' '}
            Add the slot name to <code>EL_SLOTS</code> in{' '}
            <code>scripts/sync-pencil-photos.mjs</code>
          </li>
          <li>
            <span className="font-bold" style={{ color: C.ocean }}>3 ·</span>{' '}
            Re-run{' '}
            <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}>
              node scripts/sync-pencil-photos.mjs --force
            </code>
          </li>
        </ol>
      </section>

      <PhotoLibraryClient
        groups={groups}
        targets={IMAGE_TARGETS.map((t) => ({
          nodeId: t.nodeId,
          spreadId: t.spreadId,
          spreadLabel: PENCIL_FRAME_BY_ID[t.spreadId]?.label ?? t.spreadId,
          label: t.label,
          role: t.role,
        }))}
      />
    </div>
  )
}
