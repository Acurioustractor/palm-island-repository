/**
 * /picc/photos/find — universal photo finder.
 *
 * One server-rendered page that accepts a query mode (service / highlight /
 * project / storyteller / slot) + a target identifier and returns every
 * matching photo from EL v2. Editors copy the slot key with one click;
 * each result has a deep-link to EL v2 admin for swapping.
 *
 * Query params:
 *   ?mode=service&q=<slug>
 *   ?mode=highlight&q=<slug>
 *   ?mode=project&q=<slug>
 *   ?mode=storyteller&q=<id>
 *   ?mode=slot&q=<full-slot-key>
 */
import Link from 'next/link'
import {
  getPhotosForSlot,
  getCanonicalPhotosForService,
  getPhotosForStoryteller,
  type ELPhoto,
} from '@/lib/media/el-photos'
import { getPiccServices } from '@/lib/services/el-services'
import { getPalmStorytellers } from '@/lib/empathy-ledger/el-server'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Find a photo — PICC Admin',
  description: 'Universal photo finder across services, highlights, projects, storytellers, and slot keys.',
}

const EL_ADMIN = 'https://www.empathyledger.com/admin/photos'

type Mode = 'service' | 'highlight' | 'project' | 'storyteller' | 'slot'

interface PageProps {
  searchParams: Promise<{ mode?: string; q?: string }>
}

export default async function PhotoFindPage({ searchParams }: PageProps) {
  const params = await searchParams
  const mode = (['service', 'highlight', 'project', 'storyteller', 'slot'].includes(params.mode || '')
    ? params.mode
    : '') as Mode | ''
  const q = (params.q || '').trim()

  const [services, storytellers] = await Promise.all([
    getPiccServices(),
    getPalmStorytellers(),
  ])

  // Resolve photos based on mode
  let photos: ELPhoto[] = []
  let resolvedSlot: string | null = null
  let resolvedTitle: string | null = null

  if (mode && q) {
    if (mode === 'service') {
      const result = await getCanonicalPhotosForService(q, 48)
      photos = result.all
      resolvedSlot = `picc:slot:service-${q}`
      const svc = services.find((s) => s.slug === q)
      resolvedTitle = svc?.name ?? q
    } else if (mode === 'highlight') {
      resolvedSlot = `picc:slot:anchor-${q}`
      photos = await getPhotosForSlot(`anchor-${q}`, 48)
      resolvedTitle = q.replace(/-/g, ' ')
    } else if (mode === 'project') {
      resolvedSlot = `picc:slot:project-${q}`
      photos = await getPhotosForSlot(`project-${q}`, 48)
      resolvedTitle = q.replace(/-/g, ' ')
    } else if (mode === 'storyteller') {
      photos = await getPhotosForStoryteller(q, 48)
      const teller = storytellers.find((t) => t.id === q)
      resolvedSlot = null // face-tag, not slot-tagged
      resolvedTitle = teller?.display_name ?? q
    } else if (mode === 'slot') {
      const slot = q.replace(/^picc:slot:/, '')
      resolvedSlot = `picc:slot:${slot}`
      photos = await getPhotosForSlot(slot, 48)
      resolvedTitle = slot
    }
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
            Internal · Photo finder
          </p>
          <h1 className="font-fraunces text-3xl md:text-4xl text-stone-800 italic mb-3">
            Find a photo
          </h1>
          <p className="text-stone-600 max-w-2xl leading-relaxed">
            Pick a use case below and the right slug. Returns every consent-cleared
            photo linked to that target across EL v2 — slot tags, service galleries,
            and storyteller face-tags. Click any photo to open it in EL v2 admin.
          </p>
          <a
            href="/picc/almanac/photos/reference"
            className="inline-block mt-3 text-xs font-semibold tracking-[0.15em] uppercase text-picc-ochre hover:underline"
          >
            ← Slot reference
          </a>
        </div>

        {/* Mode picker */}
        <form className="mb-10 grid grid-cols-1 md:grid-cols-12 gap-3 bg-white border border-stone-200 rounded-lg p-4">
          <label className="md:col-span-3 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">Mode</span>
            <select
              name="mode"
              defaultValue={mode || 'service'}
              className="border border-stone-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="service">Service</option>
              <option value="highlight">Highlight / anchor story</option>
              <option value="project">Project</option>
              <option value="storyteller">Storyteller</option>
              <option value="slot">Raw slot key</option>
            </select>
          </label>
          <label className="md:col-span-7 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">Target</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="slug (e.g. bwgcolman-way), storyteller id, or anchor name"
              className="border border-stone-300 rounded px-3 py-2 text-sm bg-white"
            />
          </label>
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full bg-picc-ochre text-white px-4 py-2 rounded font-semibold uppercase tracking-widest text-xs hover:opacity-90"
            >
              Find
            </button>
          </div>
        </form>

        {/* Quick suggestion chips — services + storytellers */}
        {!mode && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">
                Services ({services.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {services.slice(0, 30).map((s) => (
                  <Link
                    key={s.id}
                    href={`/picc/photos/find?mode=service&q=${encodeURIComponent(s.slug)}`}
                    className="text-xs px-3 py-1.5 rounded-full border border-stone-300 bg-white hover:bg-stone-100"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">
                Storytellers ({storytellers.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {storytellers.slice(0, 30).map((t) => (
                  <Link
                    key={t.id}
                    href={`/picc/photos/find?mode=storyteller&q=${encodeURIComponent(t.id)}`}
                    className="text-xs px-3 py-1.5 rounded-full border border-stone-300 bg-white hover:bg-stone-100"
                  >
                    {t.display_name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">
                Anchor stories
              </div>
              <div className="flex flex-wrap gap-2">
                {['bwgcolman-way', '1000d', 'ndis'].map((a) => (
                  <Link
                    key={a}
                    href={`/picc/photos/find?mode=highlight&q=${a}`}
                    className="text-xs px-3 py-1.5 rounded-full border border-stone-300 bg-white hover:bg-stone-100"
                  >
                    {a}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {mode && q && (
          <div>
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                  {photos.length} {photos.length === 1 ? 'photo' : 'photos'} · {mode}
                </div>
                <h2 className="font-fraunces text-2xl text-stone-800 italic mt-1 capitalize">
                  {resolvedTitle}
                </h2>
              </div>
              {resolvedSlot && (
                <code className="text-xs font-mono px-3 py-2 rounded bg-stone-100 border border-stone-200 select-all">
                  {resolvedSlot}
                </code>
              )}
            </div>

            {photos.length === 0 ? (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-6 text-sm text-stone-700">
                No photos linked to this target yet. Tag photos with{' '}
                {resolvedSlot ? (
                  <code className="font-mono">{resolvedSlot}</code>
                ) : (
                  <span>the appropriate face-tag</span>
                )}{' '}
                in EL v2 admin to populate this view.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((p) => (
                  <a
                    key={p.id}
                    href={`${EL_ADMIN}?id=${encodeURIComponent(p.id)}`}
                    target="_blank"
                    rel="noopener"
                    className="group flex flex-col"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.alt_text || p.caption || ''}
                      className="w-full h-48 object-cover rounded-md group-hover:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                    {p.caption && (
                      <div className="text-xs text-stone-600 mt-2 line-clamp-2">
                        {p.caption}
                      </div>
                    )}
                    {p.slot && (
                      <div className="text-xs font-mono text-picc-ochre mt-1">
                        {p.slot}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
