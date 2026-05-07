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
import StorytellerSearchStrip from '@/components/community/StorytellerSearchStrip'
import { BespokeIcon } from '@/components/ui/BespokeIcon'
import { getPalmStorytellers } from '@/lib/empathy-ledger/el-server'
import { TwentyVoicesTracker } from '@/components/voices/TwentyVoicesTracker'

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

  // Compact name → slug index for VoiceWall — drives the "→ See profile"
  // link on individual quote cards when speaker_name resolves to a known
  // EL v2 storyteller.
  const wallIndex = sorted.map((s) => ({
    name: s.display_name,
    slug: slugify(s.display_name),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream">
      {/* Hero */}
      <div className="bg-gradient-to-r from-picc-earth to-picc-earth-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex items-center gap-3 mb-3">
            <BespokeIcon name="quote" size={40} />
            <h1 className="text-4xl font-bold font-serif">Community Voices</h1>
          </div>
          <p className="text-lg text-white/80 max-w-2xl mb-6">
            Words of wisdom, reflection, and pride from Palm Island community members
            and Elders — the voices that guide our journey.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold uppercase tracking-widest">
            <Link href="/voices/this-month" className="hover:opacity-80" style={{ color: '#F5A623' }}>
              This month →
            </Link>
            <Link href="/voices/pulse" className="hover:opacity-80" style={{ color: '#F5A623' }}>
              Community pulse →
            </Link>
            <Link href="/elders/leadership" className="hover:opacity-80" style={{ color: '#F5A623' }}>
              What the Elders teach →
            </Link>
            <Link href="/voices/questions" className="hover:opacity-80" style={{ color: '#F5A623' }}>
              Questions answered →
            </Link>
            <Link href="/voices/ask" className="hover:opacity-80" style={{ color: '#F5A623' }}>
              Ask a question →
            </Link>
            <Link href="/voices/notes" className="hover:opacity-80" style={{ color: '#F5A623' }}>
              Notes →
            </Link>
            <Link href="/share-note" className="hover:opacity-80" style={{ color: '#F5A623' }}>
              Leave a note →
            </Link>
          </div>
        </div>
      </div>

      {/* 20 Voices for 20 Years — sprint progress */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 -mt-8 relative z-10">
        <TwentyVoicesTracker />
      </div>

      {/* Storyteller index with search — links into per-person profiles.
          Quietly absent when EL v2 returns nothing so we don't render an
          empty strip. */}
      {sorted.length > 0 && (
        <StorytellerSearchStrip
          storytellers={sorted.map((s) => ({
            id: s.id,
            name: s.display_name,
            slug: slugify(s.display_name),
          }))}
        />
      )}

      {/* Voice Wall */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
        <VoiceWall storytellerIndex={wallIndex} />
      </div>
    </div>
  )
}
