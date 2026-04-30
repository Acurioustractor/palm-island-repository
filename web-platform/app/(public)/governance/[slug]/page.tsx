/**
 * /governance/<slug> — per-director profile.
 *
 * Pulls the director from board_members + any quotes attributed to them
 * + photos (face-tagged in EL v2 if the director also has an EL v2
 * storyteller record). Mirror of /voices/<slug> for board members.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase/client'
import { getELQuotes, findQuotesForPerson, getPalmStorytellers } from '@/lib/empathy-ledger/el-server'
import { getPhotosForStoryteller, type ELPhoto } from '@/lib/media/el-photos'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 1800

interface PageProps {
  params: Promise<{ slug: string }>
}

interface BoardRow {
  id: string
  name: string
  role: string | null
  photo_url: string | null
}

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function findDirector(slug: string): Promise<BoardRow | null> {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('board_members')
    .select('id, name, role, photo_url')
  for (const row of (data || []) as BoardRow[]) {
    if (slugifyName(row.name) === slug) return row
  }
  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const d = await findDirector(slug)
  if (!d) return { title: 'Director — PICC' }
  return {
    title: `${d.name} — Governance · PICC`,
    description: `${d.name}${d.role ? `, ${d.role}` : ''} — director, Palm Island Community Company.`,
  }
}

export default async function DirectorPage({ params }: PageProps) {
  const { slug } = await params
  const director = await findDirector(slug)
  if (!director) notFound()

  // Try to find a matching EL v2 storyteller (via display_name) so we
  // can pull face-tagged photos. Imperfect but works for named directors.
  const [storytellers, allELQuotes] = await Promise.all([
    getPalmStorytellers(),
    getELQuotes({ limit: 600 }),
  ])
  const storyteller = storytellers.find((s) =>
    slugifyName(s.display_name) === slug || s.display_name.toLowerCase().includes(director.name.toLowerCase()),
  )

  const photos: ELPhoto[] = storyteller ? await getPhotosForStoryteller(storyteller.id, 8) : []

  // Quotes attributed to this director (fuzzy name match)
  const elderQuotesPromise = (async () => {
    const supabase = createServerSupabase()
    const { data } = await supabase
      .from('elder_quotes')
      .select('id, text, speaker_name, speaker_role, theme, source_story_id')
      .ilike('speaker_name', `%${director.name}%`)
      .in('permission_level', ['public', 'community'])
      .neq('cultural_sensitivity', 'restricted')
      .limit(8)
    return data || []
  })()

  const [elderQuotes] = await Promise.all([elderQuotesPromise])
  const elQuotesForPerson = findQuotesForPerson(allELQuotes, director.name).slice(0, 6)

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero — split portrait + name */}
      <section className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: 480 }}>
        <div className="relative bg-stone-200" style={{ minHeight: 360 }}>
          {director.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={director.photo_url}
              alt={director.name}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center top' }}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: C.sand }}
            >
              <span className="font-fraunces" style={{ color: C.turtleRed, fontSize: 96 }}>
                {director.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </span>
            </div>
          )}
        </div>
        <div
          className="flex flex-col justify-end px-8 md:px-16 py-12 md:py-20"
          style={{ backgroundColor: C.shell }}
        >
          <Link
            href="/governance"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80"
            style={{ color: C.driftwood }}
          >
            ← All directors
          </Link>
          <div
            className="uppercase font-bold mt-6 mb-3"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Director · Palm Island Community Company
          </div>
          <h1
            className="font-fraunces font-bold leading-none mb-3"
            style={{ color: C.ocean, fontSize: 'clamp(40px, 6vw, 80px)' }}
          >
            {director.name}
          </h1>
          {director.role && (
            <div
              className="font-caveat italic"
              style={{ color: C.ochre, fontSize: 'clamp(20px, 2.4vw, 32px)' }}
            >
              {director.role}
            </div>
          )}
        </div>
      </section>

      {/* Quotes attributed (elder_quotes + EL extracted) */}
      {(elderQuotes.length > 0 || elQuotesForPerson.length > 0) && (
        <section className="px-6 md:px-12 py-16 md:py-20" style={{ backgroundColor: C.sand }}>
          <div className="max-w-4xl mx-auto">
            <div
              className="uppercase font-bold mb-4 text-center"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              In their words · with consent
            </div>
            <h2
              className="font-fraunces font-bold leading-tight text-center mb-12"
              style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 42px)' }}
            >
              {director.name.split(' ')[0]} on the work.
            </h2>
            <div className="flex flex-col gap-6">
              {elderQuotes.map((q: any) => (
                <blockquote
                  key={q.id}
                  className="font-fraunces italic leading-snug rounded-md p-6"
                  style={{ color: C.earth, fontSize: 'clamp(18px, 2.2vw, 22px)', backgroundColor: '#FBF8EE' }}
                >
                  &ldquo;{q.text}&rdquo;
                  {q.theme && (
                    <span className="block mt-3 text-xs uppercase capitalize not-italic font-sans" style={{ color: C.ochre, letterSpacing: '0.2em' }}>
                      · {q.theme}
                    </span>
                  )}
                </blockquote>
              ))}
              {elQuotesForPerson.map((q) => (
                <blockquote
                  key={q.id}
                  className="font-fraunces italic leading-snug rounded-md p-6"
                  style={{ color: C.earth, fontSize: 'clamp(18px, 2.2vw, 22px)', backgroundColor: '#FBF8EE' }}
                >
                  &ldquo;{q.quote_text}&rdquo;
                  {q.themes?.[0] && (
                    <span className="block mt-3 text-xs uppercase capitalize not-italic font-sans" style={{ color: C.ochre, letterSpacing: '0.2em' }}>
                      · {q.themes[0]}
                    </span>
                  )}
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photos via storyteller-id face tag (when available) */}
      {photos.length > 0 && (
        <section className="px-6 md:px-12 py-16 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div
              className="uppercase font-bold mb-3"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Photos · Empathy Ledger
            </div>
            <h2
              className="font-fraunces font-bold leading-tight mb-8"
              style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 42px)' }}
            >
              {director.name.split(' ')[0]} on Country.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={p.url}
                  alt={p.alt_text || director.name}
                  className="w-full h-48 md:h-56 object-cover rounded-md"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer link back */}
      <section
        className="px-6 py-12 text-center"
        style={{ backgroundColor: C.midnight }}
      >
        <Link
          href="/governance"
          className="inline-block uppercase font-bold tracking-widest hover:opacity-80"
          style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
        >
          ← Back to all directors
        </Link>
      </section>
    </main>
  )
}
