/**
 * Voices wall — landing page for the storyteller archive.
 *
 * Server component that pulls the Palm Island storyteller list from EL v2
 * and renders a horizontal "browse by name" strip linking into the
 * per-person profile routes at /voices/<slug>. The full quote wall lives
 * underneath (client-rendered from PICC supabase).
 */
import Link from 'next/link'
import VoiceWall from '@/components/community/VoiceWall'
import { BespokeIcon } from '@/components/ui/BespokeIcon'
import { getPalmStorytellers } from '@/lib/empathy-ledger/el-server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default async function VoicesPage() {
  const storytellers = await getPalmStorytellers()
  const sorted = [...storytellers].sort((a, b) => a.display_name.localeCompare(b.display_name))

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream">
      {/* Hero */}
      <div className="bg-gradient-to-r from-picc-earth to-picc-earth-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex items-center gap-3 mb-3">
            <BespokeIcon name="quote" size={40} />
            <h1 className="text-4xl font-bold font-serif">Community Voices</h1>
          </div>
          <p className="text-lg text-white/80 max-w-2xl">
            Words of wisdom, reflection, and pride from Palm Island community members
            and Elders — the voices that guide our journey.
          </p>
        </div>
      </div>

      {/* Storyteller index — links into per-person profiles. Quietly absent
          when EL v2 returns nothing so we don't render an empty strip. */}
      {sorted.length > 0 && (
        <div className="border-b border-stone-200 bg-white/60">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-6">
            <div className="text-xs uppercase font-bold text-stone-500 tracking-widest mb-3">
              Browse storytellers
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {sorted.map((s) => (
                <Link
                  key={s.id}
                  href={`/voices/${slugify(s.display_name)}`}
                  className="text-sm text-picc-earth hover:text-picc-earth-700 hover:underline font-medium"
                >
                  {s.display_name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Voice Wall */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
        <VoiceWall />
      </div>
    </div>
  )
}
