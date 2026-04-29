/**
 * /picc/almanac/photos — full overview of every photo + video the
 * almanac uses, where it's wired, and how to swap it.
 *
 * For each slot defined in lib/almanac/imagery-system.ts we resolve
 * its current asset (local path → assetUrl, or EL v2 fetch for slot
 * tags + service galleries). Editors get a single page that shows:
 *   - what photo is currently in each slot
 *   - whether it's filled or empty
 *   - a one-click link back to EL v2 /admin/photos with the right
 *     filter pre-applied for swapping
 */
import { IMAGERY_SLOTS, resolveLocalSlot } from '@/lib/almanac/imagery-system'
import { getPhotoForSlot, getCanonicalPhotosForService } from '@/lib/media/el-photos'
import { getPiccServices } from '@/lib/services/el-services'
import AlmanacPhotosClient from './AlmanacPhotosClient'

export const metadata = {
  title: 'Almanac Photos — PICC Admin',
  description: 'Every photo + video the almanac uses, how it\'s wired, and how to swap.',
}

export const dynamic = 'force-dynamic'

const EL_ADMIN = 'https://www.empathyledger.com/admin/photos'

interface ResolvedSlot {
  id: string
  label: string
  section: string
  purpose: string
  source: string
  url: string | null
  status: 'filled' | 'missing'
  swapHref: string
  notes?: string
  detail?: string
}

async function resolveAll(): Promise<ResolvedSlot[]> {
  // Slot-defined imagery (cover, ack, leadership, anchors, etc.)
  const slotResults: ResolvedSlot[] = await Promise.all(
    IMAGERY_SLOTS.map(async (slot): Promise<ResolvedSlot> => {
      let url: string | null = null
      let detail: string | undefined

      if (slot.source === 'el-v2' && slot.elV2Slot) {
        const photo = await getPhotoForSlot(slot.elV2Slot)
        url = photo?.url ?? null
        detail = photo?.caption ?? photo?.alt_text ?? undefined
      } else if (slot.source === 'picc-photo' || slot.source === 'infographic' || slot.source === 'motif') {
        url = resolveLocalSlot(slot)
      } else if (slot.source === 'video-clip') {
        url = resolveLocalSlot(slot)
      } else if (slot.source === 'video-tag') {
        // Video tags are placeholder strings, no thumbnail to render
        url = null
      }

      const swapHref =
        slot.source === 'el-v2' && slot.elV2Slot
          ? `${EL_ADMIN}?tag=${encodeURIComponent('picc:slot:' + slot.elV2Slot)}`
          : EL_ADMIN

      return {
        id: slot.id,
        label: slot.label,
        section: slot.section,
        purpose: slot.purpose,
        source: slot.source,
        url,
        status: url ? 'filled' : 'missing',
        swapHref,
        notes: slot.notes,
        detail,
      }
    }),
  )

  // Per-service galleries — one row per service
  const services = await getPiccServices()
  const serviceResults: ResolvedSlot[] = await Promise.all(
    services.map(async (svc): Promise<ResolvedSlot> => {
      const { hero, all } = await getCanonicalPhotosForService(svc.slug)
      const url = hero?.url ?? null
      return {
        id: `service-${svc.slug}`,
        label: `Service · ${svc.name}`,
        section: 'services',
        purpose: 'gallery',
        source: 'el-v2',
        url,
        status: url ? 'filled' : 'missing',
        swapHref: `${EL_ADMIN}?service=${encodeURIComponent(svc.slug)}`,
        detail: all.length ? `${all.length} photos in service gallery` : 'No photos linked yet',
      }
    }),
  )

  return [...slotResults, ...serviceResults]
}

export default async function AlmanacPhotosPage() {
  const items = await resolveAll()
  return <AlmanacPhotosClient items={items} />
}
