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
import Link from 'next/link'
import { IMAGERY_SLOTS, resolveLocalSlot } from '@/lib/almanac/imagery-system'
import { getPhotoForSlot, getCanonicalPhotosForService } from '@/lib/media/el-photos'
import { getPiccServices } from '@/lib/services/el-services'

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
  const sections = Array.from(new Set(items.map((i) => i.section)))
  const filledCount = items.filter((i) => i.status === 'filled').length
  const missingCount = items.length - filledCount

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
            Internal · Almanac Editor
          </p>
          <h1 className="font-fraunces text-3xl md:text-4xl text-stone-800 italic mb-3">
            Almanac Photos
          </h1>
          <p className="text-stone-600 max-w-2xl leading-relaxed mb-4">
            Every photo + video the almanac uses, where it lands in the page, and how to swap.
            Click any "Swap in EL v2 →" to open the EL v2 admin filtered to that slot.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full px-3 py-1 bg-mangrove-100 text-mangrove-800 font-medium">
              ✓ filled · {filledCount}
            </span>
            <span className="rounded-full px-3 py-1 bg-stone-200 text-stone-700 font-medium">
              ○ missing · {missingCount}
            </span>
            <span className="self-center text-stone-500">{items.length} slots total</span>
          </div>
        </div>

        {sections.map((section) => {
          const sectionItems = items.filter((i) => i.section === section)
          return (
            <section key={section} className="mb-12">
              <h2 className="font-fraunces text-xl text-stone-800 mb-4 uppercase tracking-wide">
                {section}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sectionItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-stone-200 bg-white shadow-sm overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      {item.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.label}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-xs uppercase tracking-widest">
                          {item.source === 'video-tag' ? 'video tag' : 'no photo'}
                        </div>
                      )}
                      <div
                        className={`absolute top-2 right-2 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'filled' ? 'bg-mangrove-600 text-white' : 'bg-stone-700 text-white'
                        }`}
                      >
                        {item.status === 'filled' ? '✓' : '○'} {item.purpose}
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-2 flex-1">
                      <div className="font-semibold text-stone-900 text-sm leading-tight">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono break-all">
                        {item.id}
                      </div>
                      {item.detail && (
                        <div className="text-xs text-stone-600 italic">{item.detail}</div>
                      )}
                      {item.notes && (
                        <div className="text-xs text-stone-500 leading-snug">{item.notes}</div>
                      )}
                      <div className="mt-auto pt-2">
                        <a
                          href={item.swapHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-picc-red hover:underline"
                        >
                          Swap in EL v2 →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}

        <div className="mt-12 rounded-lg bg-stone-100 p-6 text-sm text-stone-600">
          <h3 className="font-semibold text-stone-800 mb-2">How swapping works</h3>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click "Swap in EL v2 →" on any card.</li>
            <li>EL v2 admin opens filtered to that slot/service.</li>
            <li>Tag a different photo with the slot, OR untag the current one and tag a new one.</li>
            <li>★ Star the photo to make it priority — PICC picks priority photos first.</li>
            <li>Reload this page — the new photo will appear within seconds (no cache).</li>
          </ol>
        </div>

        <p className="mt-6 text-xs text-stone-500">
          Slot registry source: <code className="font-mono">lib/almanac/imagery-system.ts</code> ·
          Services from EL v2 (count: {items.filter((i) => i.id.startsWith('service-')).length})
        </p>
      </div>
    </main>
  )
}
