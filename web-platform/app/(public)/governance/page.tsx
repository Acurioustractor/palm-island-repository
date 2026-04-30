/**
 * /governance — public index of PICC's directors.
 *
 * All directors are Aboriginal and Torres Strait Islander people.
 * Member-elected, Traditional-Owner-nominated, skills-appointed.
 * Each card clicks through to /governance/<slug> for the full bio +
 * voice + photo gallery.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 1800

export const metadata = {
  title: 'Governance — Palm Island Community Company',
  description: "PICC's board of directors. All Bwgcolman, member-elected, skills-appointed.",
}

interface BoardMember {
  id: string
  name: string
  role: string | null
  photo_url: string | null
  display_order: number
}

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default async function GovernancePage() {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('board_members')
    .select('id, name, role, photo_url, display_order')
    .order('display_order')

  const directors = (data || []) as BoardMember[]

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero */}
      <section
        className="px-6 md:px-12 py-16 md:py-24"
        style={{ backgroundColor: C.shell }}
      >
        <div className="max-w-5xl mx-auto">
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Governance · {directors.length} directors
          </div>
          <h1
            className="font-fraunces font-bold leading-tight"
            style={{ color: C.ocean, fontSize: 'clamp(40px, 7vw, 80px)' }}
          >
            Our Board.
          </h1>
          <p
            className="mt-6 leading-relaxed max-w-2xl"
            style={{ color: C.driftwood, fontSize: 16 }}
          >
            All directors are Aboriginal and Torres Strait Islander people.
            Member-elected, Traditional-Owner-nominated, skills-appointed. PICC is
            governed in the Bwgcolman way — by the people of the place, for the
            people of the place.
          </p>
        </div>
      </section>

      {/* Directors grid */}
      <section className="px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          {directors.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 16 }}>No directors loaded.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {directors.map((d) => (
                <Link
                  key={d.id}
                  href={`/governance/${slugifyName(d.name)}`}
                  className="group flex flex-col items-center text-center"
                >
                  {d.photo_url ? (
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={d.photo_url}
                        alt={d.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        style={{ objectPosition: 'center top' }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-32 h-32 mx-auto rounded-full mb-4 flex items-center justify-center"
                      style={{ backgroundColor: C.sand }}
                    >
                      <span className="font-fraunces" style={{ color: C.turtleRed, fontSize: 36 }}>
                        {d.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                    </div>
                  )}
                  <div
                    className="font-fraunces font-bold leading-tight group-hover:underline"
                    style={{ color: C.ocean, fontSize: 18 }}
                  >
                    {d.name}
                  </div>
                  {d.role && (
                    <div
                      className="uppercase mt-1"
                      style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.1em' }}
                    >
                      {d.role}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bwgcolman way callout */}
      <section className="px-6 md:px-12 py-16 md:py-20" style={{ backgroundColor: C.midnight }}>
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
          >
            The Bwgcolman way
          </div>
          <p className="font-fraunces italic text-white leading-relaxed" style={{ fontSize: 'clamp(20px, 2.4vw, 28px)' }}>
            &ldquo;The Elders speak first when PICC has a hard call to make. The board
            governs in their light.&rdquo;
          </p>
          <Link
            href="/elders/leadership"
            className="inline-block mt-6 text-xs font-bold uppercase tracking-widest hover:underline"
            style={{ color: C.starGold }}
          >
            What the Elders teach →
          </Link>
        </div>
      </section>
    </main>
  )
}
