/**
 * Community connections graph — `/voices/network`.
 *
 * Visualises EL v2's storyteller_connections data: every named Palm
 * Island storyteller is a node; each pair that shares a tagged photo
 * (or shared-themes connection) is an edge. The dataset surfaces the
 * "appears alongside" / "shared themes" linkages that already exist
 * in EL v2 but aren't exposed anywhere on the public site today.
 *
 * Data flow (server-side, Phase 1 read-only):
 *   getPalmStorytellers()                     → node list
 *   getStorytellerConnections(id) × N         → fan-out per storyteller
 *   dedupe (a→b == b→a)                       → edge list
 *
 * Falls back to a "Connection graph initialising" message if no
 * connections come back (EL v2 may not have backfilled the graph for
 * PICC org yet).
 */
import Link from 'next/link'
import { getPalmStorytellers } from '@/lib/empathy-ledger/el-server'
import { getStorytellerConnections, type ELConnection } from '@/lib/media/el-photos'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import NetworkGraph, { type GraphNode, type GraphEdge } from './NetworkGraph'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export const metadata = {
  title: 'Community Connections — Voices · PICC',
  description:
    'Every voice has a face — and a thread to others. The Palm Island storyteller archive, visualised as a force-directed graph of shared photos and themes.',
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface BuildResult {
  nodes: GraphNode[]
  edges: GraphEdge[]
  storytellerCount: number
  edgeCount: number
}

async function buildGraph(): Promise<BuildResult> {
  const storytellers = await getPalmStorytellers()
  if (!storytellers.length) {
    return { nodes: [], edges: [], storytellerCount: 0, edgeCount: 0 }
  }

  // Fan out connection lookups in parallel — ~13 storytellers means
  // ~13 concurrent fetches, well within EL's tolerance.
  const allConnections = await Promise.all(
    storytellers.map(async (s) => {
      const conns = await getStorytellerConnections(s.id)
      return { sourceId: s.id, conns }
    }),
  )

  // Index avatars seen in any connection payload — neighbour rows in
  // the response carry `public_avatar_url`, so we can build a face for
  // every storyteller mentioned even if their own row in
  // getPalmStorytellers() doesn't carry it.
  const avatarIndex = new Map<string, string>()
  for (const { conns } of allConnections) {
    for (const c of conns) {
      if (c.public_avatar_url && !avatarIndex.has(c.storyteller_id)) {
        avatarIndex.set(c.storyteller_id, c.public_avatar_url)
      }
    }
  }

  // Edge dedupe — store as `min(a,b)|max(a,b)` so a→b and b→a fold
  // together. We keep the larger `shared_photos` count if both halves
  // disagree.
  const edgeMap = new Map<string, GraphEdge>()
  for (const { sourceId, conns } of allConnections) {
    for (const c of conns) {
      if (!c.storyteller_id || c.storyteller_id === sourceId) continue
      const [a, b] = sourceId < c.storyteller_id
        ? [sourceId, c.storyteller_id]
        : [c.storyteller_id, sourceId]
      const key = `${a}|${b}`
      const existing = edgeMap.get(key)
      const weight = c.shared_photos ?? 1
      if (!existing || weight > existing.weight) {
        edgeMap.set(key, { source: a, target: b, weight })
      }
    }
  }

  // Drop nodes that have zero edges so the canvas isn't a blob of
  // orphans. Keep at least the connected ones.
  const connectedIds = new Set<string>()
  edgeMap.forEach((e) => {
    connectedIds.add(e.source)
    connectedIds.add(e.target)
  })

  const nodes: GraphNode[] = storytellers
    .filter((s) => connectedIds.has(s.id))
    .map((s) => ({
      id: s.id,
      name: s.display_name,
      slug: slugify(s.display_name),
      avatar: avatarIndex.get(s.id) ?? null,
      role: (s.cultural_background || []).join(' · ') || 'Bwgcolman storyteller',
    }))

  return {
    nodes,
    edges: Array.from(edgeMap.values()),
    storytellerCount: nodes.length,
    edgeCount: edgeMap.size,
  }
}

export default async function VoicesNetworkPage() {
  const { nodes, edges, storytellerCount, edgeCount } = await buildGraph()

  return (
    <div className="min-h-screen" style={{ background: C.shell }}>
      {/* Hero — small, almanac caption pattern */}
      <header
        className="border-b"
        style={{ background: C.midnight, borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <div
            className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: C.starGold }}
          >
            Community Connections
          </div>
          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight max-w-3xl"
            style={{ color: '#fff', fontFamily: '"Fraunces", Georgia, serif' }}
          >
            Every voice has a face — and a thread to others.
          </h1>
          <p
            className="mt-4 max-w-2xl text-base sm:text-lg"
            style={{ color: 'rgba(255,255,255,0.75)' }}
          >
            {storytellerCount > 0 ? (
              <>
                {storytellerCount} named storyteller{storytellerCount === 1 ? '' : 's'} ·{' '}
                {edgeCount} connection{edgeCount === 1 ? '' : 's'}. Drawn from
                consent-cleared photographs and shared themes in the Empathy
                Ledger archive.
              </>
            ) : (
              <>
                The Empathy Ledger archive holds the threads between Palm Island
                storytellers — shared photographs, shared themes, shared
                country. This page draws them.
              </>
            )}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-[0.2em]">
            <Link
              href="/voices"
              className="hover:opacity-80"
              style={{ color: C.starGold }}
            >
              ← All voices
            </Link>
            <Link
              href="/voices/who"
              className="hover:opacity-80"
              style={{ color: C.starGold }}
            >
              Storyteller index →
            </Link>
          </div>
        </div>
      </header>

      {/* Graph canvas */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        {storytellerCount === 0 ? (
          <div
            className="rounded-lg p-8 text-center"
            style={{ background: '#fff', border: `1px solid ${C.border}` }}
          >
            <div
              className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
              style={{ color: C.muted }}
            >
              Initialising
            </div>
            <p
              className="font-serif text-xl sm:text-2xl"
              style={{ color: C.earth, fontFamily: '"Fraunces", Georgia, serif' }}
            >
              Connection graph initialising — first build runs after the next
              Empathy Ledger sync.
            </p>
            <p className="mt-3 text-sm" style={{ color: C.driftwood }}>
              In the meantime, browse the{' '}
              <Link href="/voices" className="underline" style={{ color: C.ocean }}>
                voices wall
              </Link>
              .
            </p>
          </div>
        ) : (
          <NetworkGraph nodes={nodes} edges={edges} />
        )}

        <p
          className="mt-6 text-xs leading-relaxed max-w-2xl"
          style={{ color: C.driftwood, fontFamily: '"Fraunces", Georgia, serif' }}
        >
          Tap a face to highlight that person and the people they appear
          alongside. Tap empty space to clear. Hover for a name and role.
          Connections come from photographs only consent-cleared storytellers
          surface in.
        </p>
      </main>
    </div>
  )
}
