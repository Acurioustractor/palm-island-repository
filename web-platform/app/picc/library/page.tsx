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
  FileText,
  Library,
  Quote,
  Mic,
  Database,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import ResearchSourcesPanel from './ResearchSourcesPanel'

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
  description: string | null
  author: string | null
  publisher: string | null
  publication_date: string | null
  url: string | null
  is_verified: boolean | null
  is_primary_source: boolean | null
  extracted_data: { subtype?: string; impact?: string; provenance?: string; capture_status?: string } | null
}

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
      .select('id, source_type, title, description, author, publisher, publication_date, url, is_verified, is_primary_source, extracted_data')
      .order('is_primary_source', { ascending: false })
      .order('is_verified', { ascending: false }),
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
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-stone-700">Fiscal year</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-700">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-700">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-700">Where</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Build a row for every fiscal year from FY07-08 → FY25-26.
                  // Mirror rows surface their PICC title; the rest fall back
                  // to the EL v2 archive marker.
                  const mirrorByYear = new Map<string, AnnualReportRow>()
                  for (const r of annualReports) {
                    if (r.fiscal_year) mirrorByYear.set(r.fiscal_year, r)
                  }
                  const rows: Array<{
                    key: string
                    fy: string
                    title: string
                    inMirror: boolean
                    status: string
                  }> = []
                  // FY07-08 through FY25-26 — 19 fiscal years span PICC's lifetime
                  for (let start = 2025; start >= 2007; start--) {
                    const fy = `${start}-${String((start + 1) % 100).padStart(2, '0')}`
                    const mirror = mirrorByYear.get(fy)
                    rows.push({
                      key: fy,
                      fy,
                      title: mirror?.title || `Annual Report ${fy}`,
                      inMirror: !!mirror,
                      status: mirror ? (mirror as any).status || 'in mirror' : 'in EL archive only',
                    })
                  }
                  return rows.map((row, i) => (
                    <tr key={row.key} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                      <td className="px-4 py-3 font-mono text-stone-600 text-xs">{row.fy}</td>
                      <td className="px-4 py-3 text-stone-800">{row.title}</td>
                      <td className="px-4 py-3 text-xs">
                        {row.inMirror ? (
                          <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            in mirror
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                            EL archive only
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-500">
                        {row.inMirror ? 'PICC + EL v2 storage' : 'EL v2 storage'}
                      </td>
                    </tr>
                  ))
                })()}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-stone-400 mt-3 leading-relaxed">
            The PICC mirror has {annualReports.length} of the 19 annual reports the EL v2
            archive holds (FY07-08 through FY25-26). The /20-years scrolling history page
            already pulls from the structured markdown extracts in EL v2 — bringing the
            remaining reports into the PICC <code className="bg-stone-100 px-1 rounded">annual_reports</code> table is a
            future capture task.
          </p>
        </section>

        {/* ── RESEARCH SOURCES (live from DB) ── */}
        <section className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            Research sources · {researchSources.length} captured in <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">research_sources</code>
          </p>
          <div className="rounded-2xl bg-picc-ochre/5 border border-picc-ochre/20 p-5 mb-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-picc-ochre flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-stone-800 mb-1">
                  Now reading from the database, not a hardcoded list
                </p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  10 documents named in the sector-context research (vault doc #8) were
                  inserted into <code className="text-xs bg-white px-1 py-0.5 rounded">research_sources</code> on 10 April 2026.
                  The page now reads them live. Each row carries its subtype, impact level,
                  and provenance back to doc #8 in <code className="text-xs bg-white px-1 py-0.5 rounded">extracted_data</code> jsonb.
                  When new documents come in, insert a row — no code change needed.
                </p>
              </div>
            </div>
          </div>
          {researchSources.length === 0 ? (
            <EmptyState message="No research sources captured." />
          ) : (
            <ResearchSourcesPanel sources={researchSources} />
          )}
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
            10 documents named in the sector-context research were inserted into{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">research_sources</code>{' '}
            on 10 April 2026 — see PICC-Sector-Context-Deep-Research.md (vault doc #8) for
            the canonical provenance.
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
