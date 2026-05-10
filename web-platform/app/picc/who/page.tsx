/**
 * /picc/who — single index of every person in the system, grouped:
 *   - Elders (from EL, is_elder=true)
 *   - Staff & contributors (PICC overrides + non-Elder EL storytellers
 *     with named roles)
 *   - Storytellers + community voices (everyone else from EL)
 *
 * Each card links to /voices/<slug> — the canonical person profile —
 * so this is the central jumping-off point for "show me Aunty Iris" or
 * "show me Rachel" without navigating multiple sidebars.
 */
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, User } from 'lucide-react'
import { getPiccStorytellers, type ELStoryteller } from '@/lib/empathy-ledger/el-storytellers'
import { PICC_STAFF_OVERRIDES } from '@/lib/staff/picc-staff'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Who · PICC Admin',
  description: 'Every person in the platform — Elders, staff, storytellers, and community voices in one index.',
}

interface Person {
  id: string
  slug: string
  name: string
  role: string | null
  photo_url: string | null
  is_elder: boolean
  quote_count: number
  source: 'el' | 'override'
}

function categorise(p: Person): 'elder' | 'staff' | 'community' {
  if (p.is_elder) return 'elder'
  if (p.source === 'override') return 'staff'
  // Heuristic: a named role (not just count) → staff/contributor
  if (p.role && p.role.trim().length > 0) return 'staff'
  return 'community'
}

export default async function WhoPage() {
  const storytellers: ELStoryteller[] = await getPiccStorytellers({ limit: 500 }).catch(() => [])

  const people: Person[] = [
    ...storytellers.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.display_name,
      role: s.role,
      photo_url: s.photo_url,
      is_elder: s.is_elder,
      quote_count: s.quote_count,
      source: 'el' as const,
    })),
    ...PICC_STAFF_OVERRIDES
      .filter((s) => !storytellers.some((st) => st.display_name.toLowerCase().trim() === s.name.toLowerCase().trim()))
      .map((s) => ({
        id: s.id,
        slug: s.slug || s.id,
        name: s.name,
        role: s.role,
        photo_url: s.photo_url,
        is_elder: false,
        quote_count: 0,
        source: 'override' as const,
      })),
  ]

  const grouped = {
    elder: people.filter((p) => categorise(p) === 'elder').sort((a, b) => a.name.localeCompare(b.name)),
    staff: people.filter((p) => categorise(p) === 'staff').sort((a, b) => a.name.localeCompare(b.name)),
    community: people.filter((p) => categorise(p) === 'community').sort((a, b) => a.name.localeCompare(b.name)),
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Link
        href="/picc"
        className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Admin
      </Link>

      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Cross-cutting · every person in one place
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-stone-800 italic mb-2">Who</h1>
        <p className="text-stone-600 max-w-3xl leading-relaxed">
          Elders, staff, storytellers, and community voices — one index. Click any face to open
          their profile (their voice, their stories, the meetings they were part of).
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <Stat label="Elders" value={grouped.elder.length} accent="amber" />
        <Stat label="Staff & contributors" value={grouped.staff.length} accent="ochre" />
        <Stat label="Community voices" value={grouped.community.length} />
      </div>

      <PeopleGroup title="Elders" people={grouped.elder} accent="amber" />
      <PeopleGroup title="Staff &amp; contributors" people={grouped.staff} accent="ochre" />
      <PeopleGroup title="Community voices &amp; storytellers" people={grouped.community} />
    </div>
  )
}

function PeopleGroup({ title, people, accent }: { title: string; people: Person[]; accent?: 'amber' | 'ochre' }) {
  if (people.length === 0) return null
  return (
    <section className="mb-10">
      <h2 className="font-serif text-2xl italic text-stone-800 mb-4">
        <span dangerouslySetInnerHTML={{ __html: title }} />
        <span className="text-xs font-mono text-stone-400 ml-2">{people.length}</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {people.map((p) => (
          <PersonCard key={p.id} person={p} accent={accent} />
        ))}
      </div>
    </section>
  )
}

function PersonCard({ person, accent }: { person: Person; accent?: 'amber' | 'ochre' }) {
  const cls = accent === 'amber'
    ? 'border-amber-200 bg-amber-50 hover:border-amber-400'
    : accent === 'ochre'
    ? 'border-picc-ochre/30 bg-picc-ochre/5 hover:border-picc-ochre/60'
    : 'border-stone-200 bg-white hover:border-stone-400'
  return (
    <Link
      href={`/voices/${person.slug}`}
      className={`group flex flex-col items-center text-center rounded-xl border ${cls} p-4 transition-colors`}
    >
      {person.photo_url ? (
        <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 bg-stone-200">
          <Image src={person.photo_url} alt={person.name} fill sizes="80px" className="object-cover" />
        </div>
      ) : (
        <div className="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center mb-3 text-stone-500">
          <User className="w-9 h-9" />
        </div>
      )}
      <p className="text-sm font-semibold text-stone-800 group-hover:text-picc-ochre transition-colors leading-tight">
        {person.name}
      </p>
      {person.role && (
        <p className="text-[11px] text-stone-500 mt-1 leading-tight">{person.role}</p>
      )}
      {person.quote_count > 0 && (
        <p className="text-[10px] text-stone-400 mt-1 font-mono">{person.quote_count} quotes</p>
      )}
    </Link>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: 'amber' | 'ochre' }) {
  const cls = accent === 'amber'
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : accent === 'ochre'
    ? 'border-picc-ochre/30 bg-picc-ochre/5 text-stone-800'
    : 'border-stone-200 bg-white text-stone-800'
  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">{label}</p>
      <p className="font-serif text-3xl italic">{value}</p>
    </div>
  )
}
