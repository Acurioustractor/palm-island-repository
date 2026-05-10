/**
 * /elders/family — public Elder-facing connections view.
 *
 * Same data engine as /picc/kinship but framed for Elders + community:
 *   - Only Elders (not all 58 storytellers)
 *   - Each Elder gets a card with photo, role, link to their PICC profile,
 *     AND a deep-link to their Empathy Ledger record so they can SEE the
 *     ledger that holds their voice
 *   - Connections shown as a who-is-connected-to-whom card grid
 *
 * The page deliberately leaves the framing open — "is this family, or
 * something else?" — and invites their guidance.
 */
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, Users, Quote, Briefcase, Folder, HelpCircle } from 'lucide-react'
import {
  getPiccElders,
  type ELStoryteller,
} from '@/lib/empathy-ledger/el-storytellers'
import { getELQuotes, findQuotesForPerson, type ELQuote } from '@/lib/empathy-ledger/el-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Family connections — Palm Island Community Company',
  description: 'How the Elders Group is connected — through shared themes, services, projects. A starting view, shaped by the Elders.',
}

const EL_BASE = (process.env.NEXT_PUBLIC_EL_V2_URL?.replace(/\/$/, '') || 'https://picc.empathyledger.com')

interface Connection {
  a: ELStoryteller
  b: ELStoryteller
  sharedThemes: string[]
  sharedServices: string[]
  sharedProjects: string[]
  weight: number
}

function buildThemesMap(elders: ELStoryteller[], quotes: ELQuote[]): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>()
  for (const e of elders) {
    const themes = new Set<string>()
    for (const q of findQuotesForPerson(quotes, e.display_name)) {
      if (q.themes && Array.isArray(q.themes)) {
        for (const t of q.themes) {
          const clean = String(t || '').trim().toLowerCase()
          if (clean) themes.add(clean)
        }
      }
    }
    out.set(e.id, themes)
  }
  return out
}

function findConnections(elders: ELStoryteller[], themesBy: Map<string, Set<string>>): Connection[] {
  const conns: Connection[] = []
  for (let i = 0; i < elders.length; i++) {
    for (let j = i + 1; j < elders.length; j++) {
      const a = elders[i]
      const b = elders[j]
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

export default async function EldersFamilyPage() {
  const [elders, quotes] = await Promise.all([
    getPiccElders().catch(() => []),
    getELQuotes({ limit: 1500 }).catch(() => []),
  ])

  const themesBy = buildThemesMap(elders, quotes)
  const connections = findConnections(elders, themesBy)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
      <Link
        href="/elders"
        className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Elders
      </Link>

      <header className="mb-10">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          A starting view · shaped by the Elders
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-stone-800 italic mb-4">
          Family — how we&apos;re connected
        </h1>
        <div className="max-w-3xl space-y-3 text-stone-700 leading-relaxed">
          <p>
            This page shows how the <strong>Elders Group</strong> is connected through shared themes,
            shared services, shared projects across <strong>Empathy Ledger</strong>. It is one
            starting visualisation — not the final shape, not a definition of family. Real family lives
            with the Elders, in the protocols and the country.
          </p>
          <p>
            Tap any Elder to see their voice and stories in the Empathy Ledger. Read the
            connections. Tell us what to call this, and what shape it should take.
          </p>
        </div>
      </header>

      {/* The Elders */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl italic text-stone-800 mb-4">
          The Elders Group <span className="text-xs font-mono text-stone-400 ml-2">{elders.length}</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {elders.map((e) => (
            <ElderCard key={e.id} elder={e} />
          ))}
        </div>
      </section>

      {/* Connections */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl italic text-stone-800 mb-4">
          Connections we can see <span className="text-xs font-mono text-stone-400 ml-2">{connections.length}</span>
        </h2>
        {connections.length === 0 ? (
          <p className="text-stone-500 italic">
            No connections yet — Elders need quotes / service tagging in the Empathy Ledger for these to surface.
          </p>
        ) : (
          <div className="space-y-3">
            {connections.slice(0, 20).map((c, i) => (
              <ConnectionRow key={i} connection={c} />
            ))}
          </div>
        )}
      </section>

      {/* Questions for the Elders */}
      <section className="rounded-2xl border-2 border-dashed border-picc-ochre/40 bg-picc-ochre/5 p-6">
        <div className="flex items-start gap-3 mb-4">
          <HelpCircle className="w-5 h-5 text-picc-ochre shrink-0 mt-1" />
          <h2 className="font-serif text-2xl italic text-stone-800">
            Questions for the Elders Group + Rachel
          </h2>
        </div>
        <ul className="space-y-2 text-stone-700 list-disc pl-9 leading-relaxed">
          <li>Is <strong>&ldquo;family&rdquo;</strong> the right word, or something else — mob, river, songline, country?</li>
          <li>Which connections here are good to make visible? Which should stay private?</li>
          <li>What about <strong>generational links</strong> (grandparent, grandchild) — should they be added?</li>
          <li>What about <strong>naming relationships</strong> (named-after, namesake) — how do we hold those carefully?</li>
          <li>What about connections to <strong>country</strong> — Bwgcolman, mainland clans, Dreaming?</li>
          <li>Who decides who is connected to whom? Are these connections approved like quotes are?</li>
        </ul>
        <p className="text-sm text-stone-500 mt-4">
          Your answers shape what we build next. Nothing here is final.
        </p>
      </section>
    </div>
  )
}

function ElderCard({ elder }: { elder: ELStoryteller }) {
  const elHref = `${EL_BASE}/storytellers/${elder.slug}`
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col items-center text-center">
      {elder.photo_url ? (
        <Link href={`/voices/${elder.slug}`} className="relative w-20 h-20 rounded-full overflow-hidden mb-3 bg-stone-200">
          <Image src={elder.photo_url} alt={elder.display_name} fill sizes="80px" className="object-cover" />
        </Link>
      ) : (
        <div className="w-20 h-20 rounded-full bg-amber-200 flex items-center justify-center mb-3 text-amber-900 font-semibold text-2xl">
          {elder.display_name.charAt(0)}
        </div>
      )}
      <p className="text-sm font-semibold text-stone-800 leading-tight mb-1">
        {elder.display_name}
      </p>
      <p className="text-[11px] text-stone-500 mb-3">{elder.role || `${elder.quote_count} quotes`}</p>
      <div className="flex flex-col gap-1.5 w-full">
        <Link
          href={`/voices/${elder.slug}`}
          className="text-[11px] font-semibold uppercase tracking-wide text-picc-ochre hover:underline"
        >
          Their voice on PICC →
        </Link>
        <a
          href={elHref}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-semibold uppercase tracking-wide text-stone-600 hover:text-picc-ochre inline-flex items-center justify-center gap-1"
        >
          Empathy Ledger
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  )
}

function ConnectionRow({ connection }: { connection: Connection }) {
  const { a, b, sharedThemes, sharedServices, sharedProjects, weight } = connection
  return (
    <article className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
      <div className="flex items-center gap-3 md:gap-4 mb-3">
        <Person s={a} />
        <div className="flex-shrink-0 text-center">
          <Users className="w-5 h-5 text-stone-300 mx-auto" />
          <span className="text-[10px] font-mono text-stone-400 mt-0.5 block">weight {weight}</span>
        </div>
        <Person s={b} reverse />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <DimensionCol icon={<Quote className="w-3 h-3" />} label="Shared themes" items={sharedThemes} />
        <DimensionCol icon={<Briefcase className="w-3 h-3" />} label="Shared services" items={sharedServices} />
        <DimensionCol icon={<Folder className="w-3 h-3" />} label="Shared projects" items={sharedProjects} />
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
        <div className="w-11 h-11 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 text-amber-900 text-sm font-semibold">
          {s.display_name.charAt(0)}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-800 truncate group-hover:text-picc-ochre transition-colors">
          {s.display_name}
        </p>
        <p className="text-[11px] text-stone-500 truncate">
          {s.role || `${s.quote_count} quotes`}
        </p>
      </div>
    </Link>
  )
}

function DimensionCol({ icon, label, items }: { icon: React.ReactNode; label: string; items: string[] }) {
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
            <span key={it} className="px-1.5 py-0.5 rounded border bg-white text-stone-700 border-stone-200 text-[10px]">
              {it}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
