/**
 * Community Signing Canvas — public surface where leaders, Elders and
 * community members add their voice to the next 20 years.
 *
 * Reads approved community visions from the same `community_visions`
 * table the /picc/next-20 working canvas uses, then renders a form
 * that POSTs new entries via /api/community-visions. Submissions
 * land as is_approved=false and surface in /picc/vision for review.
 *
 * Designed to be opened on a tablet / projected during the leader
 * meeting. URL is short and memorable.
 */
import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/client'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import SignTheVisionClient from './SignTheVisionClient'
import SigningTicker from '@/components/picc/SigningTicker'
import QRPanel from '@/components/picc/QRPanel'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Sign the Vision — Palm Island next 20 years',
  description:
    'Add your voice to the Palm Island Community Company vision for the next 20 years. Open during community gatherings, leader meetings, and Elder reviews.',
}

interface ApprovedVision {
  id: string
  vision_text: string
  category: string
  author_name: string | null
  is_anonymous: boolean
}

const FALLBACK_VISIONS: ApprovedVision[] = [
  {
    id: 'fallback-1',
    vision_text: 'Heal the intergenerational trauma that Child Protection put on families.',
    category: 'governance',
    author_name: null,
    is_anonymous: true,
  },
  {
    id: 'fallback-2',
    vision_text: 'Children stay on Country; culture is not extracted from safety.',
    category: 'culture',
    author_name: null,
    is_anonymous: true,
  },
  {
    id: 'fallback-3',
    vision_text: 'Staff and leadership come from Palm Island.',
    category: 'economic',
    author_name: null,
    is_anonymous: true,
  },
  {
    id: 'fallback-4',
    vision_text: 'Governance is Aboriginal; decision-making is local.',
    category: 'governance',
    author_name: null,
    is_anonymous: true,
  },
  {
    id: 'fallback-5',
    vision_text: 'Services are designed by the people who deliver them, not imposed from outside.',
    category: 'services',
    author_name: null,
    is_anonymous: true,
  },
  {
    id: 'fallback-6',
    vision_text:
      'Financial sustainability means PICC keeps revenue on the island, not sending it to contractors off-island.',
    category: 'economic',
    author_name: null,
    is_anonymous: true,
  },
]

export default async function SignTheVisionPage() {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('community_visions')
    .select('id, vision_text, category, author_name, is_anonymous')
    .eq('is_approved', true)
    .order('created_at', { ascending: true })
    .limit(24)

  const approved: ApprovedVision[] = (data && data.length > 0 ? data : FALLBACK_VISIONS) as ApprovedVision[]
  const usingFallback = !data || data.length === 0

  // Build the absolute URL we want the QR to point at — the page's own URL
  // so scanning from the projected screen drops phones straight onto the
  // signing form.
  const h = await headers()
  const host = h.get('host') ?? 'palmisland.org.au'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  const signUrl = `${proto}://${host}/sign-the-vision?from=qr`

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      <section
        className="px-6 md:px-12 py-16 md:py-24"
        style={{ backgroundColor: C.shell }}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Next 20 Years · Community Canvas
          </div>
          <h1
            className="font-fraunces font-bold leading-tight mb-6"
            style={{ color: C.ocean, fontSize: 'clamp(40px, 7vw, 72px)' }}
          >
            Sign the vision
          </h1>
          <p
            className="font-fraunces max-w-2xl mb-4"
            style={{ color: C.driftwood, fontSize: 20, lineHeight: 1.5 }}
          >
            PICC belongs to the community. The next twenty years are not a
            forecast — they are a design choice. Add your voice.
          </p>
          <p className="text-sm max-w-2xl mb-8" style={{ color: C.driftwood }}>
            Read the visions already gathered, then write your own below.
            Every contribution is reviewed by Elders before it lights up the
            public next-20 canvas.
          </p>
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start max-w-4xl">
            <SigningTicker />
            <div className="hidden md:block">
              <QRPanel url={signUrl} label="Scan to sign on your phone" size={200} />
            </div>
          </div>
        </div>
      </section>

      <SignTheVisionClient approved={approved} usingFallback={usingFallback} />

      <section className="px-6 md:px-12 py-12">
        <div className="max-w-3xl mx-auto text-xs" style={{ color: C.driftwood }}>
          <p>
            Visions are stored in PICC&apos;s community-controlled archive
            and shown publicly only after Elder review. You can sign as
            yourself or stay anonymous.
          </p>
        </div>
      </section>
    </main>
  )
}
