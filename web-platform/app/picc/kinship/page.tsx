/**
 * /picc/kinship — connections we can DERIVE from EL, as a conversation starter.
 *
 * This is NOT family. Real kinship lives with the Elders and their protocols.
 * This view shows connections derived from shared activity in EL:
 *   - shared themes across quotes attributed to two storytellers
 *   - shared service_slugs they both appear with
 *   - shared project_slugs
 * Weight = #shared_themes + 2 × #shared_services + 2 × #shared_projects.
 *
 * Use it to anchor the conversation with Elders / Rachel about:
 *   - is 'kinship' the right metaphor, or something else (mob, river, songline)?
 *   - which connections should be visible here vs private?
 *   - what about generational links, naming relationships, country?
 *
 * The page deliberately shows the SOURCE of each connection so nothing
 * is presented as "we know they're related" when really it's "they
 * appear together in our data".
 */
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Users, Quote, Briefcase, Folder, HelpCircle } from 'lucide-react'
import {
  getPiccStorytellers,
  type ELStoryteller,
} from '@/lib/empathy-ledger/el-storytellers'
import {
  getELQuotes,
  findQuotesForPerson,
  type ELQuote,
} from '@/lib/empathy-ledger/el-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Kinship view · PICC Admin',
  description: 'Connections derived from shared themes, services, and projects — a starting point for the conversation about kinship.',
}

interface Connection {
  a: ELStoryteller
  b: ELStoryteller
  sharedThemes: string[]
  sharedServices: string[]
  sharedProjects: string[]
  weight: number
}

function buildThemesMap(
  storytellers: ELStoryteller[],
  quotes: ELQuote[],
): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>()
  for (const s of storytellers) {
    const personQuotes = findQuotesForPerson(quotes, s.display_name)
    const themes = new Set<string>()
    for (const q of personQuotes) {
      if (q.themes && Array.isArray(q.themes)) {
        for (const t of q.themes) {
          const clean = String(t || '').trim().toLowerCase()
          if (clean) themes.add(clean)
        }
      }
    }
    out.set(s.id, themes)
  }
  return out
}

function findConnections(
  storytellers: ELStoryteller[],
  themesBy: Map<string, Set<string>>,
): Connection[] {
  const conns: Connection[] = []
  for (let i = 0; i < storytellers.length; i++) {
    for (let j = i + 1; j < storytellers.length; j++) {
      const a = storytellers[i]
      const b = storytellers[j]
      const aT = themesBy.get(a.id) || new Set<string>()
      const bT = themesBy.get(b.id) || new Set<string>()
      const sharedThemes: string[] = []
      aT.forEach((t) => { if (bT.has(t)) sharedThemes.push(t) })

      const aSvc = new Set(a.service_slugs || [])
      const sharedServices = (b.service_slugs || []).filter((s) => aSvc.has(s))

      const aPrj = new Set(a.project_slugs || [])
      const sharedProjects = (b.project_slugs || []).filter((p) => aPrj.has(p))

      const weight = sharedThemes.length + sharedServices.length * 2 + sharedProjects.length * 2
      if (weight > 0) {
        conns.push({ a, b, sharedThemes, sharedServices, sharedProjects, weight })
      }
    }
  }
  return conns.sort((x, y) => y.weight - x.weight)
}

export default async function KinshipPage() {
  const [storytellers, quotes] = await Promise.all([
    getPiccStorytellers({ limit: 500 }).catch(() => []),
    getELQuotes({ limit: 1500 }).catch(() => []),
  ])

  const themesBy = buildThemesMap(storytellers, quotes)
  const allConnections = findConnections(storytellers, themesBy)
  const topConnections = allConnections.slice(0, 30)

  // Bias to ones that include at least one Elder when possible
  const elderConnections = topConnections.filter((c) => c.a.is_elder || c.b.is_elder).slice(0, 12)
  const otherConnections = topConnections.filter((c) => !c.a.is_elder && !c.b.is_elder).slice(0, 18)

  // Per-storyteller stats for sidebar
  const connectionCountBy = new Map<string, number>()
  for (const c of allConnections) {
    connectionCountBy.set(c.a.id, (connectionCountBy.get(c.a.id) || 0) + 1)
    connectionCountBy.set(c.b.id, (connectionCountBy.get(c.b.id) || 0) + 1)
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Link
        href="/picc/voices"
        className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Voices
      </Link>

      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Prototype · conversation starter
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-stone-800 italic mb-4">
          Kinship — connections we can see
        </h1>
        <div className="max-w-3xl space-y-3 text-stone-600 leading-relaxed">
          <p>
            <strong className="text-stone-800">This is not family.</strong> Real kinship lives with the Elders and the protocols
            that hold it. This view shows connections we can <em>derive</em> from Empathy Ledger —
            shared themes in their quotes, shared services they appear with, shared projects.
          </p>
          <p>
            Built as a starting point for the conversation about <em>what kinship means here</em>,
            and what shape it should take in the system. Every connection below shows its source
            so nothing is presented as fact when really it&apos;s shared activity.
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat label="Storytellers" value={storytellers.length} />
        <Stat label="Quotes analysed" value={quotes.length} />
        <Stat label="Connections found" value={allConnections.length} />
        <Stat label="Of which include an Elder" value={allConnections.filter((c) => c.a.is_elder || c.b.is_elder).length} />
      </div>

      {/* Elder-anchored connections */}
      <section className="mb-12">
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="font-serif text-2xl italic text-stone-800">
            Connections involving Elders
          </h2>
          <span className="text-xs font-mono text-stone-400">{elderConnections.length} shown</span>
        </div>
        <div className="space-y-3">
          {elderConnections.length === 0 ? (
            <p className="text-sm text-stone-500 italic">
              No Elder connections yet — Elders need quotes / service tagging in EL for these to surface.
            </p>
          ) : (
            elderConnections.map((c, i) => <ConnectionCard key={`e-${i}`} connection={c} />)
          )}
        </div>
      </section>

      {/* Other strong connections */}
      <section className="mb-12">
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="font-serif text-2xl italic text-stone-800">
            Other strong connections
          </h2>
          <span className="text-xs font-mono text-stone-400">{otherConnections.length} shown</span>
        </div>
        <div className="space-y-3">
          {otherConnections.map((c, i) => <ConnectionCard key={`o-${i}`} connection={c} />)}
        </div>
      </section>

      {/* Questions for the room */}
      <section className="rounded-2xl border-2 border-dashed border-picc-ochre/40 bg-picc-ochre/5 p-6">
        <div className="flex items-start gap-3 mb-4">
          <HelpCircle className="w-5 h-5 text-picc-ochre shrink-0 mt-1" />
          <h2 className="font-serif text-xl italic text-stone-800">
            Questions to bring to the Elders + Rachel
          </h2>
        </div>
        <ul className="space-y-2 text-sm text-stone-700 list-disc pl-9">
          <li>Is <strong>&ldquo;kinship&rdquo;</strong> the right word, or something else — family, mob, river, songline, country?</li>
          <li>Which connections here are useful to make visible? Which should stay private?</li>
          <li>What about <strong>generational links</strong> (grandparent / grandchild) — not in EL today, would need to be added carefully.</li>
          <li>What about <strong>naming relationships</strong> (e.g. named-after, namesake) — held by Elders, sometimes private.</li>
          <li>What about connections to <strong>country</strong> (Bwgcolman, mainland origin clans) — currently captured as location, but should it be its own dimension?</li>
          <li>Who decides who is connected to whom? Are these connections approved like quotes are?</li>
          <li>If the Elders prefer a different shape (a river map, a constellation, a tree by clan), is the current shape worth iterating?</li>
        </ul>
        <p className="text-xs text-stone-500 mt-4">
          Their answer becomes the spec for the proper version of this surface.
        </p>
      </section>
    </div>
  )
}

function ConnectionCard({ connection }: { connection: Connection }) {
  const { a, b, sharedThemes, sharedServices, sharedProjects, weight } = connection
  const anyElder = a.is_elder || b.is_elder
  return (
    <article className={`rounded-xl border ${anyElder ? 'border-amber-200 bg-amber-50/50' : 'border-stone-200 bg-white'} p-4`}>
      {/* People */}
      <div className="flex items-center gap-3 md:gap-4">
        <Person s={a} />
        <div className="flex-shrink-0 text-center">
          <Users className="w-5 h-5 text-stone-300 mx-auto" />
          <span className="text-[10px] font-mono text-stone-400 mt-0.5 block">weight {weight}</span>
        </div>
        <Person s={b} reverse />
      </div>

      {/* Connection sources */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <DimensionCol icon={<Quote className="w-3 h-3" />} label="Shared themes" items={sharedThemes} colour="ochre" />
        <DimensionCol icon={<Briefcase className="w-3 h-3" />} label="Shared services" items={sharedServices} colour="mangrove" />
        <DimensionCol icon={<Folder className="w-3 h-3" />} label="Shared projects" items={sharedProjects} colour="reef" />
      </div>
    </article>
  )
}

function Person({ s, reverse }: { s: ELStoryteller; reverse?: boolean }) {
  return (
    <Link
      href={`/voices/${s.slug}`}
      className={`flex-1 min-w-0 flex items-center gap-2.5 group ${reverse ? 'flex-row-reverse text-right' : ''}`}
    >
      {s.photo_url ? (
        <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-stone-200">
          <Image src={s.photo_url} alt={s.display_name} fill sizes="44px" className="object-cover" />
        </div>
      ) : (
        <div className="w-11 h-11 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0 text-stone-500 text-sm font-semibold">
          {s.display_name.charAt(0)}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-800 truncate group-hover:text-picc-ochre transition-colors">
          {s.display_name}
        </p>
        <p className="text-[11px] text-stone-500 truncate">
          {s.is_elder && (
            <span className="font-bold text-amber-700 uppercase tracking-wide mr-1">Elder ·</span>
          )}
          {s.role || `${s.quote_count} quotes`}
        </p>
      </div>
    </Link>
  )
}

function DimensionCol({
  icon, label, items, colour,
}: {
  icon: React.ReactNode
  label: string
  items: string[]
  colour: 'ochre' | 'mangrove' | 'reef'
}) {
  const palette = {
    ochre: 'bg-picc-ochre/10 text-picc-ochre/90 border-picc-ochre/20',
    mangrove: 'bg-green-50 text-green-800 border-green-200',
    reef: 'bg-sky-50 text-sky-800 border-sky-200',
  }[colour]
  return (
    <div>
      <p className="font-semibold text-stone-500 uppercase tracking-wide mb-1.5 inline-flex items-center gap-1">
        {icon}
        {label} <span className="font-mono opacity-50">{items.length}</span>
      </p>
      {items.length === 0 ? (
        <p className="text-stone-300 italic">none</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {items.map((it) => (
            <span key={it} className={`px-1.5 py-0.5 rounded border text-[10px] ${palette}`}>
              {it}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-serif text-3xl text-stone-800 italic">{value}</p>
    </div>
  )
}
