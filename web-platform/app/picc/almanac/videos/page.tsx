/**
 * /picc/almanac/videos — operational video state for the almanac.
 *
 * Mirror of /picc/almanac/photos but for the video slot system. Shows
 * every named video scene the almanac uses, where it's currently
 * pointing, and a swap link to EL v2 admin filtered to that slot.
 *
 * Sources resolved:
 *   - EL v2 picc:slot:video-<scene> via getVideoOverlay()
 *   - VIDEO_TAGS_2025 static fallback (when EL v2 isn't filled yet)
 *   - Local hero-assets/clips/<file>.mp4 paths
 */
import Link from 'next/link'
import { getVideoOverlay, type VideoOverlay } from '@/lib/media/el-photos'
import { VIDEO_TAGS_2025 } from '@/lib/annual-report/data-2025'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Almanac Videos — PICC Admin',
  description: 'Every video scene the almanac uses, where it points, and how to swap.',
}

const EL_ADMIN = 'https://www.empathyledger.com/admin/photos'

interface ResolvedVideo {
  scene: string
  slotKey: string
  description: string
  el: VideoOverlay | null
  fallback: string | null
}

const SCENES: Array<{ scene: string; description: string }> = [
  { scene: 'cover', description: 'Cover loop · 60-90s · 16:9 · auto-mute · poster fallback' },
  { scene: 'acknowledgement', description: 'Bwgcolman break · 5-8s · between Year-in-Numbers and anchor stories' },
  { scene: 'children-families', description: 'Anchor break · before the Six Anchor Stories block' },
  { scene: 'elders', description: 'Elder lanterns intro · before the consent voices' },
  { scene: 'forward-commitments', description: 'Closing break · before the Three Commitments' },
  { scene: 'cfc-rebuild', description: 'Anchor story support · CFC rebuild post-floods' },
  { scene: 'bwgcolman-way', description: 'Anchor story support · Bwgcolman Way / Delegated Authority' },
  { scene: 'health-wellbeing', description: 'Cartouche · Health & Wellbeing room' },
  { scene: 'justice-safety', description: 'Cartouche · Justice & Safety room' },
  { scene: 'youth', description: 'Cartouche · Youth room' },
  { scene: 'economic', description: 'Cartouche · Economic Development room' },
  { scene: 'education-community', description: 'Cartouche · Education & Community room' },
]

async function resolveAll(): Promise<ResolvedVideo[]> {
  return Promise.all(
    SCENES.map(async (s) => {
      const el = await getVideoOverlay(s.scene)
      const fallback = VIDEO_TAGS_2025[s.scene] ?? null
      return {
        scene: s.scene,
        slotKey: `picc:slot:video-${s.scene}`,
        description: s.description,
        el,
        fallback,
      }
    }),
  )
}

export default async function AlmanacVideosPage() {
  const items = await resolveAll()
  const elFilled = items.filter((i) => i.el).length
  const fallbackOnly = items.filter((i) => !i.el && i.fallback).length
  const empty = items.filter((i) => !i.el && !i.fallback).length

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-10">
        <div className="mb-6">
          <Link
            href="/picc/almanac/photos"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80 text-stone-500"
          >
            ← Almanac photos
          </Link>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mt-6 mb-2">
            Internal · Almanac Editor
          </p>
          <h1 className="font-fraunces text-3xl md:text-4xl text-stone-800 italic mb-3">
            Almanac Videos
          </h1>
          <p className="text-stone-600 max-w-2xl leading-relaxed">
            Every video scene the almanac uses, where it currently points, and the
            EL v2 slot key to swap it. Tag a clip with{' '}
            <code className="font-mono text-xs">picc:slot:video-&lt;scene&gt;</code>{' '}
            in EL v2 admin and it appears here automatically.
          </p>
        </div>

        {/* Counts strip */}
        <div className="flex flex-wrap gap-4 mb-8 text-sm">
          <Stat label="EL v2 filled" value={elFilled} tint={C.mangrove} />
          <Stat label="Fallback only" value={fallbackOnly} tint={C.starGold} />
          <Stat label="Empty" value={empty} tint={C.coral} />
          <Stat label="Total scenes" value={items.length} tint={C.ocean} />
        </div>

        {/* Slot grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <article
              key={item.scene}
              className="bg-white rounded-md border border-stone-200 overflow-hidden"
            >
              {/* Preview */}
              <div className="relative bg-stone-900" style={{ aspectRatio: '16 / 9' }}>
                {item.el?.poster_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.el.poster_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : item.el ? (
                  <video
                    src={item.el.url}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : item.fallback ? (
                  <video
                    src={item.fallback}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-stone-500 text-sm italic">
                    No video tagged yet
                  </div>
                )}

                {/* Status pill */}
                <div className="absolute top-2 left-2">
                  <StatusPill el={item.el} fallback={item.fallback} />
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-fraunces text-lg text-stone-800 capitalize">
                    {item.scene.replace(/-/g, ' ')}
                  </h3>
                </div>
                <code className="text-xs font-mono text-stone-700 bg-stone-100 px-2 py-1 rounded select-all break-all">
                  {item.slotKey}
                </code>
                <p className="text-xs text-stone-500 leading-relaxed">{item.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <a
                    href={`${EL_ADMIN}?tag=${encodeURIComponent(item.slotKey)}`}
                    target="_blank"
                    rel="noopener"
                    className="text-xs font-semibold uppercase tracking-widest text-picc-ochre hover:underline"
                  >
                    Swap in EL v2 →
                  </a>
                  {item.fallback && (
                    <span className="text-xs text-stone-400 truncate" title={item.fallback}>
                      Fallback: {item.fallback.split('/').pop()}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value, tint }: { label: string; value: number; tint: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-md px-4 py-2 flex items-baseline gap-2">
      <span className="font-fraunces text-2xl font-bold" style={{ color: tint }}>
        {value}
      </span>
      <span className="text-xs uppercase tracking-widest text-stone-500">{label}</span>
    </div>
  )
}

function StatusPill({ el, fallback }: { el: VideoOverlay | null; fallback: string | null }) {
  if (el) {
    return (
      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-emerald-600 text-white">
        ✓ EL v2
      </span>
    )
  }
  if (fallback) {
    return (
      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-amber-500 text-white">
        · fallback
      </span>
    )
  }
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-stone-500 text-white">
      ✗ empty
    </span>
  )
}
