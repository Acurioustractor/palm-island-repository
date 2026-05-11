/**
 * /picc/almanac/pencil-bridge — the photo paste workflow for Pencil.
 *
 * One page, every photo slot, grouped by Pencil v2 SPREAD frame. Each
 * row gives:
 *   - thumbnail (so you see what you're about to paste)
 *   - one-click "copy URL" (for Pencil's image-by-URL dialog)
 *   - one-click "open" (for download → drag into Pencil)
 *   - the Pencil frame ID it belongs to (so you know which frame to paste into)
 *
 * Pencil supports image fills via URL — paste the URL into the image
 * source dialog and it pulls from EL v2 / Supabase Storage directly.
 * No download-then-import dance required for the URL path.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { IMAGERY_SLOTS } from '@/lib/almanac/imagery-system'
import {
  getCanonicalPhotosForService,
  getPhotosForSlot,
} from '@/lib/media/el-photos'
import { getPiccServices } from '@/lib/services/el-services'
import { assetUrl } from '@/lib/media/asset-url'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import {
  PENCIL_SPREADS,
  framesForSlot,
} from '@/lib/almanac/pencil-frame-map'
import PencilBridgeClient, { type BridgeSlot, type BridgeFrameGroup } from './PencilBridgeClient'

interface ManifestEntry {
  slot: string
  index: number
  file: string
  pencilPath: string
  source_url: string
  el_id: string
}

async function loadManifest(): Promise<Map<string, ManifestEntry[]>> {
  try {
    const txt = await readFile(
      join(process.cwd(), 'pencil-photos', 'MANIFEST.json'),
      'utf8',
    )
    const data = JSON.parse(txt) as { photos: ManifestEntry[] }
    const map = new Map<string, ManifestEntry[]>()
    for (const p of data.photos) {
      const arr = map.get(p.slot) ?? []
      arr.push(p)
      map.set(p.slot, arr)
    }
    // Also index by el_id for service galleries (alt lookup)
    return map
  } catch {
    return new Map()
  }
}

/** Strip ./ if present and return Pencil-friendly relative path. */
function pencilPath(p: string | null): string | null {
  if (!p) return null
  return p.replace(/^\.\//, '')
}

export const dynamic = 'force-dynamic'
export const revalidate = 60

export const metadata = {
  title: 'Pencil photo bridge · PICC Almanac',
  description:
    'Every almanac photo slot, grouped by Pencil spread. One-click copy URL or open for paste-into-Pencil.',
}

const PENCIL_FILE = '/Users/benknight/Code/Palm Island Reposistory/web-platform/picc-annual-report.pen'

async function buildSlots(): Promise<BridgeSlot[]> {
  const manifest = await loadManifest()
  const out: BridgeSlot[] = []

  // 1) Defined slots from imagery-system.ts
  await Promise.all(
    IMAGERY_SLOTS.map(async (slot) => {
      let url: string | null = null
      let detail: string | undefined
      let extras: { url: string; caption: string | null; pencilPath: string | null }[] = []

      if (slot.source === 'el-v2' && slot.elV2Slot) {
        const photos = await getPhotosForSlot(slot.elV2Slot, 6)
        const hero = photos[0]
        url = hero?.url ?? null
        detail = hero?.caption ?? hero?.alt_text ?? undefined
        const manifestEntries = manifest.get(slot.elV2Slot) ?? []
        extras = photos.slice(1).map((p, i) => {
          const m = manifestEntries.find((e) => e.el_id === p.id)
          return {
            url: p.url,
            caption: p.caption,
            pencilPath: pencilPath(m?.pencilPath ?? null),
          }
        })
      } else if (slot.source === 'picc-photo' || slot.source === 'infographic' || slot.source === 'motif') {
        url = slot.path ? assetUrl(slot.path) : null
      } else if (slot.source === 'video-clip') {
        url = slot.path ? assetUrl(slot.path) : null
      }

      // Resolve hero pencilPath from manifest (slot.elV2Slot for EL slots)
      let resolvedPencilPath: string | null = null
      if (slot.elV2Slot) {
        const entries = manifest.get(slot.elV2Slot) ?? []
        const hero = entries.find((e) => e.index === 0)
        resolvedPencilPath = pencilPath(hero?.pencilPath ?? null)
      }

      const frames = framesForSlot(slot.id)
      out.push({
        id: slot.id,
        label: slot.label,
        section: slot.section,
        source: slot.source,
        url,
        pencilPath: resolvedPencilPath,
        detail,
        notes: slot.notes,
        frames: frames.map((f) => ({ nodeId: f.nodeId, label: f.label })),
        extras,
        elV2Slot: slot.elV2Slot ?? null,
      })
    }),
  )

  // 2) Per-service galleries
  const services = await getPiccServices()
  await Promise.all(
    services.slice(0, 12).map(async (svc) => {
      const { hero, all } = await getCanonicalPhotosForService(svc.slug)
      const manifestKey = `service-${svc.slug}`
      const manifestEntries = manifest.get(manifestKey) ?? []
      const heroEntry = manifestEntries.find((e) => e.index === 0)
      out.push({
        id: `service-${svc.slug}`,
        label: `Service · ${svc.name}`,
        section: 'services',
        source: 'el-v2',
        url: hero?.url ?? null,
        pencilPath: pencilPath(heroEntry?.pencilPath ?? null),
        detail: all.length ? `${all.length} photos in service gallery` : 'No photos linked yet',
        frames: [{ nodeId: '0WnsQ', label: 'Services at a Glance — 30 services' }],
        extras: all.slice(1, 6).map((p) => {
          const m = manifestEntries.find((e) => e.el_id === p.id)
          return {
            url: p.url,
            caption: p.caption,
            pencilPath: pencilPath(m?.pencilPath ?? null),
          }
        }),
        elV2Slot: null,
      })
    }),
  )

  return out
}

export default async function PencilBridgePage() {
  const slots = await buildSlots()

  // Group by Pencil frame for the spread-by-spread view
  const byFrame = new Map<string, BridgeSlot[]>()
  const unassigned: BridgeSlot[] = []
  for (const slot of slots) {
    if (slot.frames.length === 0) {
      unassigned.push(slot)
      continue
    }
    for (const f of slot.frames) {
      const arr = byFrame.get(f.nodeId) ?? []
      arr.push(slot)
      byFrame.set(f.nodeId, arr)
    }
  }

  const groups: BridgeFrameGroup[] = PENCIL_SPREADS.map((frame) => ({
    nodeId: frame.nodeId,
    label: frame.label,
    order: frame.order,
    slots: byFrame.get(frame.nodeId) ?? [],
  }))

  const filledCount = slots.filter((s) => s.url).length
  const totalCount = slots.length

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <p
          className="font-bold uppercase mb-3"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          PICC · ALMANAC · PHOTO BRIDGE
        </p>
        <h1
          className="font-fraunces font-bold mb-3"
          style={{ color: C.ocean, fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.1 }}
        >
          Push real photos into Pencil
        </h1>
        <p
          className="font-fraunces mb-6"
          style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.4, maxWidth: 720 }}
        >
          Every slot the almanac uses, grouped by Pencil spread. Copy a URL straight into
          Pencil's image fill dialog, or open the file to drag in. Same EL photo on web,
          print, and Pencil — no fork, no re-upload.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span
            className="px-3 py-1.5 rounded-md font-bold"
            style={{
              backgroundColor: C.shell,
              color: C.ocean,
              border: `1px solid ${C.border}`,
            }}
          >
            {filledCount} / {totalCount} slots filled
          </span>
          <Link
            href="/picc/almanac/photo-library"
            className="px-3 py-1.5 rounded-md text-sm font-bold hover:bg-stone-50"
            style={{ color: '#FFFFFF', backgroundColor: C.ocean, border: `1px solid ${C.ocean}` }}
          >
            📷 Browse all photos →
          </Link>
          <Link
            href="/picc/almanac/photos"
            className="px-3 py-1.5 rounded-md text-sm hover:bg-stone-50"
            style={{ color: C.ocean, border: `1px solid ${C.border}` }}
          >
            Slot status overview →
          </Link>
          <a
            href="https://picc.empathyledger.com/admin/photos"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-md text-sm inline-flex items-center gap-1.5 hover:bg-stone-50"
            style={{ color: C.ochre, border: `1px solid ${C.border}` }}
          >
            EL photo admin <ExternalLink className="w-3 h-3" />
          </a>
          <Link
            href="/picc/annual-report"
            className="px-3 py-1.5 rounded-md text-sm hover:bg-stone-50"
            style={{ color: C.muted, border: `1px solid ${C.border}` }}
          >
            ← Back to Annual Report Hub
          </Link>
        </div>
      </header>

      {/* How-to bar */}
      <section
        className="rounded-xl p-5 mb-10"
        style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}
      >
        <p
          className="font-bold uppercase mb-2"
          style={{ color: C.ochre, fontSize: 10, letterSpacing: '0.3em' }}
        >
          HOW TO USE THIS PAGE
        </p>
        <ol className="space-y-1 text-sm font-fraunces" style={{ color: C.earth }}>
          <li>
            <span className="font-bold" style={{ color: C.ocean }}>0 ·</span>{' '}
            <strong>One time:</strong> run{' '}
            <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}>
              node scripts/sync-pencil-photos.mjs
            </code>{' '}
            from <code>web-platform/</code>. Pulls every EL photo into{' '}
            <code>pencil-photos/</code> beside the .pen file. Re-run anytime EL changes.
          </li>
          <li>
            <span className="font-bold" style={{ color: C.ocean }}>1 ·</span>{' '}
            Find the spread you're working on (each card shows the Pencil frame ID).
          </li>
          <li>
            <span className="font-bold" style={{ color: C.ocean }}>2 ·</span>{' '}
            Click <strong>Copy Pencil path</strong> on the photo you want — copies
            something like <code>pencil-photos/elders-on-country.jpg</code>.
          </li>
          <li>
            <span className="font-bold" style={{ color: C.ocean }}>3 ·</span>{' '}
            In Pencil, select the rectangle/frame → open the fill dialog →{' '}
            <em>Image</em> → paste the path. The image renders immediately.
          </li>
          <li>
            <span className="font-bold" style={{ color: C.ocean }}>4 ·</span>{' '}
            <strong>Format gotcha:</strong> Pencil expects{' '}
            <code>pencil-photos/file.jpg</code> — <em>no</em> leading{' '}
            <code>./</code> or absolute paths. The button copies the right form.
          </li>
        </ol>
        <p className="mt-3 text-xs font-fraunces italic" style={{ color: C.muted }}>
          Pencil file: <code>{PENCIL_FILE}</code>
        </p>
      </section>

      <PencilBridgeClient groups={groups} unassigned={unassigned} />
    </div>
  )
}
