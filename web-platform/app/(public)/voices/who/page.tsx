/**
 * /voices/who — face-first storyteller wall.
 *
 * Item #4 from `thoughts/shared/plans/2026-05-08-showcase-priorities.md`:
 * "every named storyteller as a face-tile (name + role + quote count). Click
 * into profile."
 *
 * Server component. Pulls Palm Island storytellers from EL v2 (with avatars)
 * and resolves their PICC quote count in a single in-memory pass over the
 * extracted_quotes table — same matching strategy as findQuotesForPerson() so
 * the count here matches what shows on the profile page.
 *
 * URL: /voices/who → tile click → /voices/<slug> (existing profile route).
 */

import { createClient } from '@supabase/supabase-js'
import {
  getPalmStorytellers,
  getELQuotes,
  findQuotesForPerson,
  PICC_ORG_ID,
  type ELStoryteller,
} from '@/lib/empathy-ledger/el-server'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import WhoClient, { type WhoTile } from './WhoClient'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export const metadata = {
  title: 'Every voice has a face — Palm Island Community Company',
  description:
    'Faces of every named storyteller in the Palm Island archive — click through to read their quotes, see their photos, and walk where they walk.',
}

const EL_URL = 'https://yvnuayzslukamizrlhwb.supabase.co'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function deriveRole(s: ELStoryteller): string {
  const bg = (s.cultural_background || []).filter(Boolean)
  if (bg.length === 0) return 'Bwgcolman storyteller'
  // Match the [slug] page's phrasing ("…storyteller").
  const joined = bg.join(' · ')
  return /storyteller$/i.test(joined) ? joined : `${joined} storyteller`
}

/**
 * Pull the avatar map directly from EL v2. The shared helper
 * (`getPalmStorytellers()`) doesn't surface `public_avatar_url`, and we can't
 * touch it for this build, so this page issues its own narrow lookup.
 *
 * Returns Map<storyteller_id, public_avatar_url>. Empty on misconfig — the
 * page still renders, tiles fall back to tonal placeholders.
 */
async function getAvatarMap(): Promise<Map<string, string>> {
  const key = process.env.EMPATHY_LEDGER_SERVICE_KEY
  if (!key) return new Map()

  try {
    const client = createClient(EL_URL, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data } = await client
      .from('storytellers')
      .select('id, public_avatar_url')
      .ilike('location', '%palm%')
      .not('public_avatar_url', 'is', null)
      .limit(500)

    const map = new Map<string, string>()
    for (const row of (data || []) as Array<{
      id: string
      public_avatar_url: string | null
    }>) {
      if (row.public_avatar_url) map.set(row.id, row.public_avatar_url)
    }
    return map
  } catch {
    return new Map()
  }
}

export default async function VoicesWhoPage() {
  // PICC_ORG_ID is exported from el-server but unused here directly — keep
  // the import so future filters scoped to org (vs ilike 'palm') stay easy.
  void PICC_ORG_ID

  const [storytellers, allQuotes, avatarMap] = await Promise.all([
    getPalmStorytellers(),
    getELQuotes({ limit: 1000 }),
    getAvatarMap(),
  ])

  // Empty-state fallback — never crash, message the user.
  if (!storytellers.length) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: '#FBF8EE' }}
      >
        <div className="max-w-md text-center flex flex-col gap-4">
          <div
            className="uppercase font-bold"
            style={{
              color: C.turtleRed,
              fontSize: 11,
              letterSpacing: '0.3em',
            }}
          >
            Every voice has a face
          </div>
          <h1
            className="font-fraunces font-bold leading-tight"
            style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            Storyteller index loading from Empathy Ledger&nbsp;v2 — try again
            shortly.
          </h1>
          <p style={{ color: C.driftwood, fontSize: 14 }}>
            The face wall depends on a live connection to the EL&nbsp;v2 archive.
            If this keeps showing, check the EL service key or Empathy Ledger
            uptime.
          </p>
        </div>
      </main>
    )
  }

  // Build tiles. Quote count is derived in-memory using the same fuzzy match
  // the [slug] page uses, so the number a person sees on this wall lines up
  // with the quotes they'll see when they click through.
  const tiles: WhoTile[] = storytellers
    .map((s) => {
      const matched = findQuotesForPerson(allQuotes, s.display_name)
      return {
        id: s.id,
        name: s.display_name,
        slug: slugify(s.display_name),
        role: deriveRole(s),
        location: s.location,
        avatarUrl: avatarMap.get(s.id) ?? null,
        quoteCount: matched.length,
      }
    })
    .sort((a, b) => {
      // Storytellers with at least one quote and an avatar bubble up first —
      // the wall feels more alive when faces lead. Then alpha by name.
      const aRich = (a.avatarUrl ? 2 : 0) + (a.quoteCount > 0 ? 1 : 0)
      const bRich = (b.avatarUrl ? 2 : 0) + (b.quoteCount > 0 ? 1 : 0)
      if (aRich !== bRich) return bRich - aRich
      return a.name.localeCompare(b.name)
    })

  const withAvatar = tiles.filter((t) => t.avatarUrl).length
  const totalQuotes = tiles.reduce((acc, t) => acc + t.quoteCount, 0)

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero — caption above headline, Saltwater Almanac grammar. */}
      <section
        className="px-6 md:px-12 py-16 md:py-24"
        style={{ backgroundColor: C.shell }}
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-5">
          <div
            className="uppercase font-bold"
            style={{
              color: C.turtleRed,
              fontSize: 11,
              letterSpacing: '0.3em',
            }}
          >
            Voices · the people behind the words
          </div>
          <h1
            className="font-fraunces font-bold leading-none"
            style={{
              color: C.ocean,
              fontSize: 'clamp(40px, 7vw, 80px)',
              letterSpacing: '-0.01em',
            }}
          >
            Every voice has a face.
          </h1>
          <p
            className="leading-relaxed max-w-3xl"
            style={{ color: C.earth, fontSize: 18, lineHeight: 1.55 }}
          >
            {tiles.length} named storytellers in the Palm Island archive
            {totalQuotes > 0
              ? `, between them ${totalQuotes.toLocaleString()} recorded quotes`
              : ''}
            . {withAvatar > 0
              ? `${withAvatar} have a portrait on file; the rest are placeholders until family confirms a photo.`
              : 'Portraits load from Empathy Ledger v2 once consent is confirmed.'}
            {' '}
            Click any face to read their words.
          </p>
          <p
            className="font-caveat italic"
            style={{ color: C.ochre, fontSize: 22 }}
          >
            All photos consent-cleared · all names with permission.
          </p>
        </div>
      </section>

      {/* Tile grid + search. */}
      <WhoClient tiles={tiles} />

      {/* Quiet footer line — provenance. */}
      <section
        className="px-6 md:px-12 py-12 text-center"
        style={{ backgroundColor: C.midnight }}
      >
        <div
          className="uppercase font-bold mb-3"
          style={{
            color: C.starGold,
            fontSize: 11,
            letterSpacing: '0.3em',
          }}
        >
          Source
        </div>
        <p
          className="font-fraunces leading-snug max-w-2xl mx-auto"
          style={{ color: '#FBF8EE', fontSize: 18 }}
        >
          Storytellers and portraits live in Empathy Ledger v2. Quotes counted
          here are PICC&rsquo;s extracted_quotes, matched by name. The archive
          grows every time a community member sits down to share.
        </p>
      </section>
    </main>
  )
}
