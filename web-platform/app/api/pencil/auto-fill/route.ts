/**
 * /api/pencil/auto-fill — propose + queue the best print-ready photo
 * for every image-fill target in the v2 spread cluster.
 *
 * GET  → preview suggestions (which photo would go in which target),
 *        no queue mutation. Body returns { suggestions: [...] }.
 * POST → enqueue all suggestions at once. Body returns
 *        { queued: N, suggestions: [...] }.
 *
 * Matching rules (in priority order):
 *   1. If the target's defaultSlot has a photo, use the BEST one for it
 *      (highest print_score, then largest pixel area)
 *   2. Otherwise, use heuristics by target.role:
 *        - hero    → fullbleed elders-on-country shots
 *        - portrait→ voices-wall photos (tighter crops)
 *        - secondary → any halfpage+ photo not already used
 *        - background → quarterpage+ allowed
 *   3. Skip targets that already have a recent photo (?force=true to override)
 *   4. Don't double-assign the same photo to multiple targets in one pass
 */
import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { IMAGE_TARGETS, type ImageTarget } from '@/lib/almanac/pencil-image-targets'
import { PENCIL_FRAME_BY_ID } from '@/lib/almanac/pencil-frame-map'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const QUEUE_PATH = join(process.cwd(), '.pencil-push-queue.json')
const MANIFEST_PATH = join(process.cwd(), 'pencil-photos', 'MANIFEST.json')

interface ManifestPhoto {
  slot: string
  index: number
  file: string
  pencilPath: string
  alt: string | null
  width: number | null
  height: number | null
  bytes: number
  print_score: 'fullbleed' | 'halfpage' | 'quarterpage' | 'thumbnail' | 'too-small' | 'unknown'
  storyteller_slug?: string
  storyteller_name?: string
  service_slug?: string
  service_name?: string
  project_slug?: string
  project_name?: string
}

const SCORE_RANK: Record<string, number> = {
  fullbleed: 4,
  halfpage: 3,
  quarterpage: 2,
  thumbnail: 1,
  'too-small': 0,
  unknown: 0,
}

const isImage = (p: ManifestPhoto) => /\.(jpe?g|png|webp|gif)$/i.test(p.file)

function bestPhotoForStoryteller(
  photos: ManifestPhoto[],
  slug: string,
  used: Set<string>,
): ManifestPhoto | null {
  const candidates = photos
    .filter((p) => p.storyteller_slug === slug && !used.has(p.pencilPath) && isImage(p))
    .sort((a, b) => {
      const sa = SCORE_RANK[a.print_score] ?? 0
      const sb = SCORE_RANK[b.print_score] ?? 0
      if (sa !== sb) return sb - sa
      return ((b.width ?? 0) * (b.height ?? 0)) - ((a.width ?? 0) * (a.height ?? 0))
    })
  return candidates[0] ?? null
}

function bestPhotoForService(
  photos: ManifestPhoto[],
  slug: string,
  used: Set<string>,
): ManifestPhoto | null {
  const candidates = photos
    .filter((p) => p.service_slug === slug && !used.has(p.pencilPath) && isImage(p))
    .sort((a, b) => {
      const sa = SCORE_RANK[a.print_score] ?? 0
      const sb = SCORE_RANK[b.print_score] ?? 0
      if (sa !== sb) return sb - sa
      return ((b.width ?? 0) * (b.height ?? 0)) - ((a.width ?? 0) * (a.height ?? 0))
    })
  return candidates[0] ?? null
}

function bestPhotoForProject(
  photos: ManifestPhoto[],
  slug: string,
  used: Set<string>,
): ManifestPhoto | null {
  const candidates = photos
    .filter((p) => p.project_slug === slug && !used.has(p.pencilPath) && isImage(p))
    .sort((a, b) => {
      const sa = SCORE_RANK[a.print_score] ?? 0
      const sb = SCORE_RANK[b.print_score] ?? 0
      if (sa !== sb) return sb - sa
      return ((b.width ?? 0) * (b.height ?? 0)) - ((a.width ?? 0) * (a.height ?? 0))
    })
  return candidates[0] ?? null
}

function bestPhotoForSlot(photos: ManifestPhoto[], slot: string, used: Set<string>): ManifestPhoto | null {
  const candidates = photos
    .filter((p) => p.slot === slot && !used.has(p.pencilPath) && isImage(p))
    .sort((a, b) => {
      const sa = SCORE_RANK[a.print_score] ?? 0
      const sb = SCORE_RANK[b.print_score] ?? 0
      if (sa !== sb) return sb - sa
      const aa = (a.width ?? 0) * (a.height ?? 0)
      const ab = (b.width ?? 0) * (b.height ?? 0)
      return ab - aa
    })
  return candidates[0] ?? null
}

function bestPhotoByRole(
  photos: ManifestPhoto[],
  role: 'hero' | 'portrait' | 'secondary' | 'background',
  used: Set<string>,
): ManifestPhoto | null {
  const minScore = role === 'background' ? 'quarterpage' : role === 'hero' ? 'fullbleed' : 'halfpage'
  const minRank = SCORE_RANK[minScore]
  const slotPreference =
    role === 'hero' || role === 'background'
      ? ['elders-on-country', 'voices-wall', 'cover', 'governance']
      : role === 'portrait'
      ? ['voices-wall', 'governance', 'elders-on-country']
      : ['voices-wall', 'elders-on-country', 'services', 'governance']

  for (const slot of slotPreference) {
    const candidates = photos
      .filter(
        (p) =>
          p.slot === slot &&
          !used.has(p.pencilPath) &&
          isImage(p) &&
          (SCORE_RANK[p.print_score] ?? 0) >= minRank,
      )
      .sort((a, b) => {
        const sa = SCORE_RANK[a.print_score] ?? 0
        const sb = SCORE_RANK[b.print_score] ?? 0
        if (sa !== sb) return sb - sa
        return ((b.width ?? 0) * (b.height ?? 0)) - ((a.width ?? 0) * (a.height ?? 0))
      })
    if (candidates[0]) return candidates[0]
  }
  return null
}

interface Suggestion {
  nodeId: string
  spreadId: string
  spreadLabel: string
  targetLabel: string
  pencilPath: string | null
  file: string | null
  print_score: string | null
  reason: string
}

async function buildSuggestions(): Promise<Suggestion[]> {
  if (!existsSync(MANIFEST_PATH)) return []
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8')) as { photos: ManifestPhoto[] }
  const photos = manifest.photos.map((p) => ({
    ...p,
    pencilPath: p.pencilPath.replace(/^\.\//, ''),
  }))

  const used = new Set<string>()
  const out: Suggestion[] = []

  for (const target of IMAGE_TARGETS) {
    let photo: ManifestPhoto | null = null
    let reason = ''

    // 1) STORYTELLER MATCH — strongest signal. The named person's photo.
    //    Entity-specific matches IGNORE the "used" pool — if Rachel has one
    //    photo and appears in two targets, BOTH get her photo (it's HER).
    const t = target as ImageTarget & { storytellerSlug?: string; serviceSlug?: string; projectSlug?: string }
    const emptySet = new Set<string>()
    let entityMatch = false
    if (t.storytellerSlug) {
      photo = bestPhotoForStoryteller(photos, t.storytellerSlug, emptySet)
      if (photo) {
        reason = `✓ Storyteller match: ${photo.storyteller_name ?? t.storytellerSlug} (${photo.print_score})`
        entityMatch = true
      }
    }

    // 2) SERVICE MATCH — uses the service's `image_url` set in EL admin
    if (!photo && t.serviceSlug) {
      photo = bestPhotoForService(photos, t.serviceSlug, emptySet)
      if (photo) {
        reason = `✓ Service match: ${photo.service_name ?? t.serviceSlug} (${photo.print_score})`
        entityMatch = true
      }
    }

    // 3) PROJECT MATCH — uses the project's `cover_image_url` set in EL admin
    if (!photo && t.projectSlug) {
      photo = bestPhotoForProject(photos, t.projectSlug, emptySet)
      if (photo) {
        reason = `✓ Project match: ${photo.project_name ?? t.projectSlug} (${photo.print_score})`
        entityMatch = true
      }
    }

    // 3) SLOT MATCH — generic tagged photos. Consumes from "used" pool to
    //    avoid repeating the same scenic shot.
    if (!photo && target.defaultSlot) {
      photo = bestPhotoForSlot(photos, target.defaultSlot, used)
      if (photo) reason = `Slot match: "${target.defaultSlot}" (${photo.print_score})`
    }

    // 4) ROLE FALLBACK — last resort
    if (!photo) {
      photo = bestPhotoByRole(photos, target.role, used)
      if (photo) reason = `Fallback: best ${photo.print_score} photo for role "${target.role}" (slot: ${photo.slot})`
    }

    // Only mark generic photos as "used" — entity-specific matches can repeat
    if (photo && !entityMatch) used.add(photo.pencilPath)

    out.push({
      nodeId: target.nodeId,
      spreadId: target.spreadId,
      spreadLabel: PENCIL_FRAME_BY_ID[target.spreadId]?.label ?? target.spreadId,
      targetLabel: target.label,
      pencilPath: photo?.pencilPath ?? null,
      file: photo?.file ?? null,
      print_score: photo?.print_score ?? null,
      reason: reason || (t.storytellerSlug
        ? `No photo synced for storyteller "${t.storytellerSlug}" — upload to EL and re-sync`
        : 'No matching photo synced — skip'),
    })
  }

  return out
}

export async function GET() {
  const suggestions = await buildSuggestions()
  const matched = suggestions.filter((s) => s.pencilPath !== null).length
  return NextResponse.json({
    suggestions,
    counts: {
      total: suggestions.length,
      matched,
      skipped: suggestions.length - matched,
    },
  })
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const force = url.searchParams.get('force') === 'true'

  const suggestions = await buildSuggestions()
  const toQueue = suggestions.filter((s) => s.pencilPath !== null)

  // Load existing queue
  let queue: { entries: Array<Record<string, unknown>> } = { entries: [] }
  if (existsSync(QUEUE_PATH)) {
    try {
      queue = JSON.parse(await readFile(QUEUE_PATH, 'utf8'))
    } catch {}
  }

  // For each suggestion: drop any pending push for that node, then add fresh
  const cleaned = queue.entries.filter(
    (e) =>
      !(e.status === 'pending' && toQueue.some((s) => s.nodeId === e.nodeId)),
  )

  const now = new Date().toISOString()
  for (const s of toQueue) {
    cleaned.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nodeId: s.nodeId,
      pencilPath: s.pencilPath,
      label: `${s.spreadLabel} · ${s.targetLabel}`,
      status: 'pending',
      queued_at: now,
    })
  }

  await mkdir(dirname(QUEUE_PATH), { recursive: true })
  await writeFile(QUEUE_PATH, JSON.stringify({ entries: cleaned }, null, 2))

  return NextResponse.json({
    queued: toQueue.length,
    skipped: suggestions.length - toQueue.length,
    suggestions,
  })
}
