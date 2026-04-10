/**
 * PICC Library — Admin knowledge inventory
 *
 * Shows the full public-record footprint PICC has assembled across:
 *   - Owned publications (publications table)
 *   - Annual reports (annual_reports table)
 *   - External research sources (research_sources table)
 *   - The Empathy Ledger knowledge layer (elder_quotes, extracted_quotes,
 *     interviews, knowledge_entries) with the connection counts
 *   - Documents named in the 2026 sector-context research that are not yet
 *     captured in the database — the "next capture" list
 *
 * Internal route at /picc/library. Sourced live from PICC Supabase + a
 * canonical list of external research from PICC-Sector-Context-Deep-Research.md.
 *
 * The point of this page: show how PICC's documentation is wired into the
 * knowledge layer, and where the gaps are.
 */

import { createServerSupabase } from '@/lib/supabase/client'
import {
  BookOpen,
  FileText,
  Library,
  Quote,
  Mic,
  Database,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

export const metadata = {
  title: 'Library — PICC Admin',
  description: 'Knowledge inventory: PICC publications, annual reports, external research, and Empathy Ledger connections.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PublicationRow {
  id: string
  slug: string | null
  title: string
  category: string | null
  fiscal_year: string | null
  author: string | null
  status: string | null
  pdf_url: string | null
  published_date: string | null
}

interface AnnualReportRow {
  id: string
  fiscal_year: string | null
  title: string
}

interface ResearchSourceRow {
  id: string
  source_type: string | null
  title: string
  author: string | null
  publisher: string | null
  publication_date: string | null
  url: string | null
  is_verified: boolean | null
  is_primary_source: boolean | null
}

// Documented in PICC-Sector-Context-Deep-Research.md but NOT yet captured in
// the research_sources table. Hardcoded with explicit provenance — single
// source of truth lives in the workshop vault doc #8.
const DOCUMENTED_NOT_CAPTURED = [
  {
    title: 'Ipsos 2019 independent evaluation of PICC',
    type: 'Independent evaluation',
    note: 'Cited as the foundational evidence for the 2021 community-control restructure. Found PICC ran 17 contracts from 11 funders, served 3,306 clients, employed 98 staff (85% ATSI, 78% local). Named the central finding that the mixed-governance model "created distrust and confusion about whether PICC was truly community-led."',
    impact: 'Highest — already cited on /picc/launchpad, /picc/governance, /picc/sector-map, /picc/finances, /picc/risks',
  },
  {
    title: '17-year PICC annual report archive (2007-08 to 2023-24)',
    type: 'Annual reports',
    note: 'Full 17-year set extracted to structured markdown in /Users/benknight/Code/empathy-ledger-v2/docs/15-reports/picc-annual-reports/years/. PDFs stored in EL Supabase Storage. Currently only 3 are reflected in the PICC `annual_reports` table.',
    impact: 'High — drives the /20-years scrolling history page',
  },
  {
    title: 'PICC Constitution',
    type: 'Governance document',
    note: 'Defines membership eligibility (Manbarra & Bwgcolman 18+), board composition (5-7 directors with reserved Manbarra-nominated seat), guardrails. Source for /picc/governance.',
    impact: 'High — currently rendered from doc #8 synthesis, not from a stored constitution document',
  },
  {
    title: 'PICC 2021-26 Strategic Plan',
    type: 'Strategy document',
    note: 'Names the deepening of self-determination through the 2021 community-control transition. Public document on PICC website publications page.',
    impact: 'Medium',
  },
  {
    title: 'AIATSIS earlier review record',
    type: 'External research',
    note: 'AIATSIS catalog record of an earlier review of PICC. Not yet captured. Provides historical baseline for comparison with the Ipsos 2019 evaluation.',
    impact: 'Medium',
  },
  {
    title: 'JCU thesis on Palm Island development context',
    type: 'External research',
    note: 'James Cook University thesis touching Palm Island development context. Not yet catalogued in PICC research_sources.',
    impact: 'Medium',
  },
  {
    title: 'UQ research using PICC as Indigenous community-controlled health partner',
    type: 'External research',
    note: 'University of Queensland research report. Not yet captured.',
    impact: 'Medium',
  },
  {
    title: 'QATSICPP case study of PICC Family Care Services',
    type: 'Sector case study',
    note: 'Queensland Aboriginal and Torres Strait Islander Child Protection Peak case study describing trust, cultural understanding, and keeping families away from departmental treatment. 2022 Practice Excellence Award context.',
    impact: 'High — direct evidence for Bwgcolman Way case study',
  },
  {
    title: 'Community Justice Group evaluation',
    type: 'Sector evaluation',
    note: 'Independent evaluation naming PICC as the auspicing body for the Community Justice Group. Justice & DFV evidence layer.',
    impact: 'Medium',
  },
  {
    title: 'PICC submission to child protection inquiry',
    type: 'Government submission',
    note: 'Public submission to a child protection inquiry. Direct PICC voice on policy. Not yet catalogued.',
    impact: 'Medium',
  },
]

export default async function LibraryPage() {
  const supabase = createServerSupabase()

  const [pubsRes, reportsRes, sourcesRes, statsRes] = await Promise.all([
    supabase
      .from('publications')
      .select('id, slug, title, category, fiscal_year, author, status, pdf_url, published_date')
      .order('published_date', { ascending: false }),
    supabase
      .from('annual_reports')
      .select('id, fiscal_year, title')
      .order('fiscal_year', { ascending: false }),
    supabase
      .from('research_sources')
      .select('id, source_type, title, author, publisher, publication_date, url, is_verified, is_primary_source')
      .order('publication_date', { ascending: false }),
    Promise.all([
      supabase.from('elder_quotes').select('id', { count: 'exact', head: true }).in('permission_level', ['public', 'community']),
      supabase.from('extracted_quotes').select('id', { count: 'exact', head: true }),
      supabase.from('interviews').select('id', { count: 'exact', head: true }),
      supabase.from('interview_segments').select('id', { count: 'exact', head: true }),
      supabase.from('historical_artifacts').select('id', { count: 'exact', head: true }),
      supabase.from('knowledge_entries').select('id', { count: 'exact', head: true }),
      supabase.from('media_files').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    ]),
  ])

  const publications: PublicationRow[] = (pubsRes.data || []) as PublicationRow[]
  const annualReports: AnnualReportRow[] = (reportsRes.data || []) as AnnualReportRow[]
  const researchSources: ResearchSourceRow[] = (sourcesRes.data || []) as ResearchSourceRow[]

  const [
    elderQuotesCount,
    extractedQuotesCount,
    interviewsCount,
    segmentsCount,
    artifactsCount,
    knowledgeCount,
    mediaCount,
  ] = statsRes

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* ── HEADER ── */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            Internal · Knowledge Inventory
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-800 italic mb-4 leading-tight">
            PICC Library
          </h1>
          <p className="text-lg text-stone-600 max-w-3xl leading-relaxed">
            The full public-record footprint PICC has assembled, plus the Empathy Ledger
            knowledge layer that sits on top of it, plus the documents named in the
            sector-context research that are still waiting to be captured. One page,
            one inventory.
          </p>
        </div>

        {/* ── THE FRAMING ── */}
        <section className="mb-12">
          <div className="rounded-2xl bg-[#0B4F6C] text-white p-8">
            <p className="font-serif italic text-xl md:text-2xl leading-relaxed mb-4">
              &ldquo;PICC is unusually well documented for a remote place-based organisation.&rdquo;
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              From the 2026 sector-context research (vault doc #8). PICC publishes annual
              reports, audited financials, governance documents, and a public independent
              evaluation. That documentation is the raw material for everything PICC tells
              the world about itself — and it is the raw material the Empathy Ledger reads
              from.
            </p>
          </div>
        </section>

        {/* ── EMPATHY LEDGER CONNECTION ── */}
        <section className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            Empathy Ledger knowledge layer · live counts
          </p>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            <CountCard
              icon={<Quote className="w-5 h-5" />}
              label="Elder quotes"
              count={elderQuotesCount.count || 0}
              sub="Public + community level"
            />
            <CountCard
              icon={<Quote className="w-5 h-5" />}
              label="Extracted quotes"
              count={extractedQuotesCount.count || 0}
              sub="From transcripts via AI extraction"
            />
            <CountCard
              icon={<Mic className="w-5 h-5" />}
              label="Interviews"
              count={interviewsCount.count || 0}
              sub={`${segmentsCount.count?.toLocaleString() || 0} segments captured`}
            />
            <CountCard
              icon={<Database className="w-5 h-5" />}
              label="Knowledge entries"
              count={knowledgeCount.count || 0}
              sub="Platform-wide KB rows"
            />
            <CountCard
              icon={<Library className="w-5 h-5" />}
              label="Historical artifacts"
              count={artifactsCount.count || 0}
              sub="Photos, documents, citations"
            />
            <CountCard
              icon={<FileText className="w-5 h-5" />}
              label="Media files"
              count={mediaCount.count || 0}
              sub="Active, non-deleted"
            />
          </div>
          <div className="mt-4 rounded-xl bg-picc-ochre/5 border border-picc-ochre/20 p-5">
            <p className="text-xs font-semibold tracking-wide uppercase text-picc-ochre mb-2">
              How the connection works
            </p>
            <p className="text-sm text-stone-700 leading-relaxed">
              Every published document below is a potential source of voices, themes, and
              transcripts in the Empathy Ledger. The 17-year annual report archive sits in
              EL v2 storage and is the raw material the AI extraction pipeline runs against
              — that&apos;s where the {extractedQuotesCount.count || 0} extracted quotes come
              from. The {elderQuotesCount.count || 0} elder quotes come from interviews and
              capture sessions. The {knowledgeCount.count || 0} knowledge entries are the
              cross-cutting facts derived from all of the above. PICC knowledge is a graph,
              not a list.
            </p>
          </div>
        </section>

        {/* ── PUBLICATIONS TABLE ── */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre">
              Owned publications · {publications.length} captured
            </p>
            <a href="/publications" className="text-xs text-picc-ochre hover:underline inline-flex items-center gap-1">
              Public page <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
            {publications.length === 0 ? (
              <EmptyState message="No publications captured in the publications table." />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-stone-700">Title</th>
                    <th className="text-left px-4 py-3 font-semibold text-stone-700">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-stone-700">Author</th>
                    <th className="text-left px-4 py-3 font-semibold text-stone-700">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-stone-700">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {publications.map((p, i) => (
                    <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                      <td className="px-4 py-3 text-stone-800 font-medium">{p.title}</td>
                      <td className="px-4 py-3 text-stone-600 capitalize">{p.category || '—'}</td>
                      <td className="px-4 py-3 text-stone-600 text-xs">{p.author || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                          {p.status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.pdf_url ? (
                          <a href={p.pdf_url} className="text-xs text-picc-ochre hover:underline">PDF</a>
                        ) : (
                          <span className="text-xs text-stone-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ── ANNUAL REPORTS TABLE ── */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre">
              Annual reports · {annualReports.length} captured · 17 in EL v2 archive
            </p>
            <a href="/picc/reports/builder" className="text-xs text-picc-ochre hover:underline inline-flex items-center gap-1">
              Report builder <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
            {annualReports.length === 0 ? (
              <EmptyState message="No annual reports captured." />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-stone-700">Fiscal year</th>
                    <th className="text-left px-4 py-3 font-semibold text-stone-700">Title</th>
                  </tr>
                </thead>
                <tbody>
                  {annualReports.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                      <td className="px-4 py-3 font-mono text-stone-600 text-xs">{r.fiscal_year || '—'}</td>
                      <td className="px-4 py-3 text-stone-800">{r.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p className="text-[11px] text-stone-400 mt-3 leading-relaxed">
            The PICC mirror has {annualReports.length} of the 17 annual reports the EL v2
            archive holds (2007-08 through 2023-24). The /20-years scrolling history page
            already pulls from the structured markdown extracts in EL v2 — bringing the
            remaining reports into the PICC `annual_reports` table is a future capture task.
          </p>
        </section>

        {/* ── EXTERNAL RESEARCH SOURCES ── */}
        <section className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            External research sources · {researchSources.length} captured
          </p>
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
            {researchSources.length === 0 ? (
              <EmptyState message="No external research sources captured." />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-stone-700">Title</th>
                    <th className="text-left px-4 py-3 font-semibold text-stone-700">Author</th>
                    <th className="text-left px-4 py-3 font-semibold text-stone-700">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-stone-700">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {researchSources.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                      <td className="px-4 py-3 text-stone-800 font-medium">{r.title}</td>
                      <td className="px-4 py-3 text-stone-600 text-xs">{r.author || '—'}</td>
                      <td className="px-4 py-3 text-stone-600 text-xs capitalize">{r.source_type || '—'}</td>
                      <td className="px-4 py-3">
                        {r.is_verified ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <span className="text-xs text-stone-400">no</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ── DOCUMENTED BUT NOT CAPTURED ── */}
        <section className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            Documented in research, awaiting capture · {DOCUMENTED_NOT_CAPTURED.length} items
          </p>
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/30 p-6 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  These documents exist in the public record but are not yet in the PICC database
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Each one is named in PICC-Sector-Context-Deep-Research.md (vault doc #8) with
                  enough provenance to verify and capture. Several are already cited across the
                  /picc admin pages (Ipsos, governance docs, the annual report archive). Bringing
                  them into the database means the live pages stop hardcoding citations and start
                  reading from canonical rows.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {DOCUMENTED_NOT_CAPTURED.map((d) => (
              <div key={d.title} className="rounded-xl border border-stone-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-semibold text-stone-800 leading-snug">{d.title}</h3>
                  <span className="text-[10px] font-mono uppercase tracking-wide text-stone-400 flex-shrink-0">
                    {d.type}
                  </span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed mb-2">{d.note}</p>
                <p className="text-[11px] text-picc-ochre">
                  Impact: {d.impact}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW THIS LINKS ── */}
        <section className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            How this links to the rest of the platform
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <LinkCard
              title="Public-facing"
              body="The /publications page surfaces owned PICC publications to the public. The /20-years scrolling history pulls structured year data from the EL v2 archive. Every story on /elders, /services/[slug], /elders/voices-on-country is sourced from the same knowledge layer counted above."
              href="/publications"
              hrefLabel="Public publications page"
            />
            <LinkCard
              title="Empathy Ledger"
              body="Every document above is a source for AI extraction into elder_quotes, extracted_quotes, and knowledge_entries. The 17-year annual report archive lives in EL v2 Supabase Storage. PICC and EL share storage but have separate canonical schemas — see /picc/sector-map for how PICC sits inside the broader ecosystem."
              href="/picc/sector-map"
              hrefLabel="Sector map"
            />
            <LinkCard
              title="Internal admin"
              body="The /picc/launchpad, /picc/governance, /picc/sector-map, /picc/finances, /picc/risks pages all cite documents from this library. Bringing the missing items into research_sources turns those citations from hardcoded references into live database links."
              href="/picc/launchpad"
              hrefLabel="Launchpad strategic plan"
            />
            <LinkCard
              title="Reports + workflows"
              body="The /picc/reports/builder generates audience-targeted annual report PDFs from the same data. Each generated PDF is a publication candidate that flows back into this library."
              href="/picc/reports/builder"
              hrefLabel="Annual report builder"
            />
          </div>
        </section>

        {/* ── FOOTER ── */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-8">
          <p className="text-xs text-stone-500 leading-relaxed">
            <strong className="text-stone-700">Sources:</strong> live from{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">publications</code>,{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">annual_reports</code>,{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">research_sources</code>,{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">elder_quotes</code>,{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">extracted_quotes</code>,{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">interviews</code>,{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">interview_segments</code>,{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">historical_artifacts</code>,{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">knowledge_entries</code>,{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">media_files</code>. The
            "Documented in research, awaiting capture" list is sourced from
            PICC-Sector-Context-Deep-Research.md (vault doc #8).
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <a href="/publications" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            ← Public publications page
          </a>
          <a href="/picc/launchpad" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Launchpad
          </a>
          <a href="/picc/governance" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Governance
          </a>
          <a href="/picc/sector-map" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Sector map
          </a>
          <a href="/picc/finances" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Finances
          </a>
          <a href="/picc/risks" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Risks
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────

function CountCard({
  icon,
  label,
  count,
  sub,
}: {
  icon: React.ReactNode
  label: string
  count: number
  sub?: string
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-2 text-picc-ochre">
        {icon}
        <p className="text-xs font-semibold tracking-wide uppercase">{label}</p>
      </div>
      <p className="text-3xl font-bold text-picc-earth mb-1">{count.toLocaleString()}</p>
      {sub && <p className="text-xs text-stone-500 leading-relaxed">{sub}</p>}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-8 text-center">
      <p className="text-sm text-stone-400">{message}</p>
    </div>
  )
}

function LinkCard({
  title,
  body,
  href,
  hrefLabel,
}: {
  title: string
  body: string
  href: string
  hrefLabel: string
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h3 className="font-semibold text-stone-800 mb-2">{title}</h3>
      <p className="text-sm text-stone-600 leading-relaxed mb-3">{body}</p>
      <a href={href} className="text-xs text-picc-ochre hover:underline inline-flex items-center gap-1">
        {hrefLabel}
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}
