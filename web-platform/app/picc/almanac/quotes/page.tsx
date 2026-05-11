/**
 * /picc/almanac/quotes — quote library for the annual report.
 *
 * Browse every EL quote we have, filter by speaker / theme / status,
 * see annual-report-readiness score, copy quote text for use in
 * Pencil spreads.
 */
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import { loadAllQuotes, scoreForReport, ANNUAL_REPORT_QUOTE_PRINCIPLES } from '@/lib/almanac/quote-library'
import QuoteLibraryClient, { type ScoredQuote } from './QuoteLibraryClient'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export const metadata = {
  title: 'Quote library · PICC Almanac',
  description: 'Every EL quote we have, scored + filterable for annual-report use.',
}

export default async function QuotesPage() {
  const quotes = await loadAllQuotes()
  const scored: ScoredQuote[] = quotes
    .map((q) => ({ ...q, score: scoreForReport(q) }))
    .sort((a, b) => b.score - a.score)

  // Per-speaker counts
  const bySpeaker = new Map<string, number>()
  for (const q of quotes) bySpeaker.set(q.storyteller_slug, (bySpeaker.get(q.storyteller_slug) ?? 0) + 1)

  // Per-theme counts
  const byTheme = new Map<string, number>()
  for (const q of quotes) byTheme.set(q.theme ?? 'untagged', (byTheme.get(q.theme ?? 'untagged') ?? 0) + 1)

  const sfr = quotes.filter((q) => q.suggested_for_report).length
  const validated = quotes.filter((q) => q.is_validated).length

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <p
          className="font-bold uppercase mb-3"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          PICC · ALMANAC · QUOTE LIBRARY
        </p>
        <h1
          className="font-fraunces font-bold mb-3"
          style={{ color: C.ocean, fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.05 }}
        >
          Every quote we have, scored for the report.
        </h1>
        <p
          className="font-fraunces mb-6"
          style={{ color: C.driftwood, fontSize: 20, lineHeight: 1.4, maxWidth: 720 }}
        >
          {quotes.length} quotes from {bySpeaker.size} speakers. Sorted by annual-report
          fit. Click any quote to copy its text — paste straight into a Pencil spread.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total quotes" big={quotes.length} small={`${bySpeaker.size} speakers`} color={C.ocean} caption="in the library" />
          <Stat label="Suggested" big={sfr} small="for report" color={C.mangrove} caption="EL flag set" />
          <Stat label="Themes" big={byTheme.size} small="categories" color={C.ochre} caption="culture, history, etc." />
          <Stat label="Validated" big={validated} small="cleared" color={C.turtleRed} caption={validated === 0 ? 'cultural review pending' : 'cultural review done'} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/picc/almanac/alignment" className="px-3 py-1.5 rounded-md hover:bg-stone-50" style={{ color: C.ocean, border: `1px solid ${C.border}` }}>
            ← Alignment audit
          </Link>
          <Link href="/picc/almanac/auto-fill" className="px-3 py-1.5 rounded-md hover:bg-stone-50" style={{ color: C.ocean, border: `1px solid ${C.border}` }}>
            Auto-fill spreads →
          </Link>
        </div>
      </header>

      {/* Annual report principles */}
      <section
        className="rounded-xl p-6 mb-8"
        style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}
      >
        <p
          className="font-bold uppercase mb-3"
          style={{ color: C.ochre, fontSize: 10, letterSpacing: '0.3em' }}
        >
          THE QUOTE PRINCIPLES — ANNUAL REPORT EDITION
        </p>
        <pre
          className="text-sm font-fraunces whitespace-pre-wrap"
          style={{ color: C.earth, lineHeight: 1.6 }}
        >
{ANNUAL_REPORT_QUOTE_PRINCIPLES.trim()}
        </pre>
      </section>

      <QuoteLibraryClient quotes={scored} />
    </div>
  )
}

function Stat({ label, big, small, color, caption }: { label: string; big: number; small: string; color: string; caption: string }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: color }}>
      <p className="text-xs font-bold uppercase" style={{ color: C.muted, letterSpacing: '0.15em' }}>{label}</p>
      <p className="mt-1">
        <span className="font-fraunces font-bold" style={{ color, fontSize: 36, lineHeight: 1 }}>{big}</span>
        <span className="ml-1 text-sm" style={{ color: C.muted }}>{small}</span>
      </p>
      <p className="text-xs mt-1" style={{ color: C.driftwood }}>{caption}</p>
    </div>
  )
}
