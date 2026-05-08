'use client'

/**
 * /voices/who — face-first storyteller wall (client side).
 *
 * Receives the full storyteller list pre-resolved from the server (avatar URL,
 * derived role, quote count, location). All filtering happens in the browser
 * against this in-memory list — no extra fetches.
 *
 * Tile rendering pattern:
 *   - public_avatar_url present → portrait <img>
 *   - missing → tonal placeholder filled with hashed section colour + initials
 *     in Fraunces.  Hash is deterministic per name so a person always gets
 *     the same tone.
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export interface WhoTile {
  id: string
  name: string
  slug: string
  role: string
  location: string | null
  avatarUrl: string | null
  quoteCount: number
}

const PLACEHOLDER_TONES = [
  C.ocean,
  C.ochre,
  C.mangrove,
  C.coral,
  C.reef,
  C.starGold,
  C.turtleRed,
] as const

function hashIndex(seed: string, modulo: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return h % modulo
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function normalise(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
}

interface Props {
  tiles: WhoTile[]
}

export default function WhoClient({ tiles }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return tiles
    const q = normalise(trimmed)
    return tiles.filter(
      (t) =>
        normalise(t.name).includes(q) ||
        (t.location && normalise(t.location).includes(q)),
    )
  }, [tiles, query])

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
      {/* Search row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10 md:mb-14">
        <div
          className="uppercase font-bold"
          style={{
            color: C.driftwood,
            fontSize: 11,
            letterSpacing: '0.3em',
          }}
        >
          {filtered.length === tiles.length
            ? `${tiles.length} storytellers`
            : `${filtered.length} of ${tiles.length} shown`}
        </div>
        <div className="relative w-full max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: C.muted }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or place…"
            aria-label="Search storytellers"
            className="w-full pl-9 pr-3 py-2 rounded-full text-sm focus:outline-none"
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${C.border}`,
              color: C.earth,
            }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p
          className="italic text-center py-12"
          style={{ color: C.muted, fontSize: 14 }}
        >
          No storytellers match &ldquo;{query.trim()}&rdquo;.
        </p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {filtered.map((tile) => (
            <li key={tile.id}>
              <Link
                href={`/voices/${tile.slug}`}
                className="group block focus:outline-none"
              >
                <Tile tile={tile} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Tile({ tile }: { tile: WhoTile }) {
  const tone =
    PLACEHOLDER_TONES[hashIndex(tile.name, PLACEHOLDER_TONES.length)]
  const initials = initialsFor(tile.name) || '·'

  return (
    <article className="flex flex-col gap-3">
      <div
        className="relative w-full overflow-hidden rounded-md"
        style={{
          aspectRatio: '4 / 5',
          backgroundColor: C.shell,
          border: `1px solid ${C.border}`,
        }}
      >
        {tile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tile.avatarUrl}
            alt={tile.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            style={{ objectPosition: 'center top' }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: tone }}
          >
            <span
              className="font-fraunces"
              style={{
                color: '#FBF8EE',
                fontSize: 'clamp(48px, 5vw, 72px)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
              }}
            >
              {initials}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3
          className="font-fraunces font-bold leading-tight transition-colors"
          style={{ color: C.ocean, fontSize: 20 }}
        >
          {tile.name}
        </h3>
        <p
          className="leading-snug"
          style={{ color: C.driftwood, fontSize: 13 }}
        >
          {tile.role}
          {tile.location ? (
            <span style={{ color: C.muted }}> · {tile.location}</span>
          ) : null}
        </p>
        {tile.quoteCount > 0 ? (
          <p
            className="uppercase font-bold mt-1"
            style={{
              color: C.ochre,
              fontSize: 10,
              letterSpacing: '0.25em',
            }}
          >
            {tile.quoteCount} {tile.quoteCount === 1 ? 'quote' : 'quotes'}
          </p>
        ) : (
          <p
            className="uppercase mt-1"
            style={{
              color: C.muted,
              fontSize: 10,
              letterSpacing: '0.25em',
            }}
          >
            Profile only
          </p>
        )}
      </div>
    </article>
  )
}
