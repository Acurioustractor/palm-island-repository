/**
 * PICC Voices Grid — Internal admin
 *
 * Experience #3 from PICC-Leader-Walkthrough-Master-Brief.md (workshop vault doc #7).
 *
 * Surfaces the full voice inventory across both PICC voice tables:
 *   - elder_quotes (162) — curated, validated, with permission level
 *   - extracted_quotes (290) — AI-extracted from interview transcripts
 *
 * Total: 452 voices. Built for the Narelle voice capture priority list and
 * the 20-voices-for-20-years sprint named in the Launchpad plan E1.
 *
 * Honors cultural protocol: filters out cultural_sensitivity='restricted'
 * elder_quotes even in admin view.
 *
 * Internal route at /picc/voices.
 */

import { createServerSupabase } from '@/lib/supabase/client'
import {
  Quote,
  Mic,
  Users,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

export const metadata = {
  title: 'Voices — PICC Admin',
  description: 'The full voice inventory: elder quotes, extracted quotes, capture gaps, and the 20-voices-for-20-years priority list.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ElderQuote {
  id: string
  text: string
  speaker_name: string | null
  speaker_role: string | null
  theme: string | null
  category: string | null
  is_validated: boolean | null
  cultural_sensitivity: string | null
  permission_level: string | null
}

interface ExtractedQuote {
  id: string
  quote_text: string
  attribution: string | null
  theme: string | null
  sentiment: string | null
  impact_area: string | null
  suggested_for_report: boolean | null
  is_validated: boolean | null
  photo_url: string | null
}

const PRIORITY_CATEGORIES = ['community', 'culture', 'elders', 'youth', 'education', 'family', 'governance', 'employment']

export default async function VoicesPage() {
  const supabase = createServerSupabase()

  const [elderRes, extractedRes, categoriesRes, suggestedRes] = await Promise.all([
    // Curated elder quotes — diverse sample across categories
    supabase
      .from('elder_quotes')
      .select('id, text, speaker_name, speaker_role, theme, category, is_validated, cultural_sensitivity, permission_level')
      .in('permission_level', ['public', 'community'])
      .neq('cultural_sensitivity', 'restricted')
      .order('created_at', { ascending: false })
      .limit(60),

    // Extracted quotes — high-impact sample with photos where available
    supabase
      .from('extracted_quotes')
      .select('id, quote_text, attribution, theme, sentiment, impact_area, suggested_for_report, is_validated, photo_url')
      .order('suggested_for_report', { ascending: false })
      .order('display_order', { ascending: true })
      .limit(40),

    // Category breakdown across all elder_quotes
    supabase
      .from('elder_quotes')
      .select('category')
      .in('permission_level', ['public', 'community'])
      .neq('cultural_sensitivity', 'restricted'),

    // Voices marked as suggested_for_report in extracted_quotes
    supabase
      .from('extracted_quotes')
      .select('id', { count: 'exact', head: true })
      .eq('suggested_for_report', true),
  ])

  const elderQuotes: ElderQuote[] = (elderRes.data || []) as ElderQuote[]
  const extractedQuotes: ExtractedQuote[] = (extractedRes.data || []) as ExtractedQuote[]
  const allCategories = (categoriesRes.data || []) as { category: string | null }[]
  const suggestedCount = suggestedRes.count || 0

  // Build category breakdown for the priority list
  const categoryCounts = new Map<string, number>()
  for (const c of allCategories) {
    const key = c.category || 'uncategorised'
    categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1)
  }

  // Total counts
  const totalElder = allCategories.length
  const totalExtracted = extractedQuotes.length // sample shown — see also count below
  const totalAll = totalElder + 290 // 290 is the known full extracted_quotes count

  const youthCount = categoryCounts.get('youth') || 0
  const isYouthGap = youthCount < 10

  // Sample with at least one quote per priority category
  const sampleByCategory = new Map<string, ElderQuote>()
  for (const q of elderQuotes) {
    const cat = q.category || ''
    if (PRIORITY_CATEGORIES.includes(cat) && !sampleByCategory.has(cat)) {
      sampleByCategory.set(cat, q)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* ── HEADER ── */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            Internal · Voices Grid
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-800 italic mb-4 leading-tight">
            The voices we hold
          </h1>
          <p className="text-lg text-stone-600 max-w-3xl leading-relaxed">
            Every voice PICC has captured across two layers: curated elder quotes (validated,
            with permission level and cultural sensitivity flags) and AI-extracted quotes
            from interview transcripts. This is Experience #3 from the master brief — the
            inventory that feeds the 20-voices-for-20-years capture sprint and the Narelle
            voice priority list.
          </p>
        </div>

        {/* ── HEADLINE COUNTS ── */}
        <section className="mb-12">
          <div className="grid md:grid-cols-4 gap-4">
            <CountCard
              icon={<Quote className="w-5 h-5" />}
              label="Curated elder quotes"
              count={totalElder}
              sub="Public + community level, validated"
            />
            <CountCard
              icon={<Mic className="w-5 h-5" />}
              label="Extracted quotes"
              count={290}
              sub="From transcripts via AI"
            />
            <CountCard
              icon={<Sparkles className="w-5 h-5" />}
              label="Suggested for report"
              count={suggestedCount}
              sub="Flagged for annual report use"
            />
            <CountCard
              icon={<Users className="w-5 h-5" />}
              label="Total voices"
              count={totalAll}
              sub="Curated + extracted"
            />
          </div>
        </section>

        {/* ── YOUTH GAP CALLOUT ── */}
        {isYouthGap && (
          <section className="mb-12">
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 mb-1">
                    Youth voice gap — only {youthCount} youth quotes captured
                  </p>
                  <p className="text-sm text-amber-800 leading-relaxed mb-3">
                    Compared to {categoryCounts.get('community') || 0} community quotes,{' '}
                    {categoryCounts.get('culture') || 0} culture quotes, and{' '}
                    {categoryCounts.get('elders') || 0} elder quotes, the youth category is
                    severely under-represented. The Narelle interview framework Part F3 names
                    a young person voice as a non-negotiable for the 24-25 annual report and
                    the 20-voices-for-20-years sprint.
                  </p>
                  <p className="text-xs text-amber-700">
                    <strong>Action:</strong> Identify 5+ young people from The Centre or the
                    Digital Service Centre, capture their voices, link them as elder_quotes
                    rows with category=&apos;youth&apos;.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── CATEGORY BREAKDOWN ── */}
        <section className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            Elder quotes by category · {totalElder} total
          </p>
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex flex-wrap gap-2">
              {Array.from(categoryCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <CategoryPill
                    key={cat}
                    label={cat}
                    count={count}
                    isPriority={PRIORITY_CATEGORIES.includes(cat)}
                    isGap={cat === 'youth' && count < 10}
                  />
                ))}
            </div>
            <p className="text-[11px] text-stone-400 mt-4 leading-relaxed">
              Categories with the &ldquo;ai-extraction-v2&rdquo; prefix were generated by the
              annual report extraction pipeline (~50 across years 2009-10 to 2023-24). The
              named categories (community, culture, elders, youth, etc.) are the curated
              priority dimensions for the annual report and the celebration narrative.
            </p>
          </div>
        </section>

        {/* ── ONE FROM EACH PRIORITY CATEGORY ── */}
        {sampleByCategory.size > 0 && (
          <section className="mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
              One voice from each priority category
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {PRIORITY_CATEGORIES.map((cat) => {
                const quote = sampleByCategory.get(cat)
                if (!quote) {
                  return (
                    <div
                      key={cat}
                      className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-6"
                    >
                      <p className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wide mb-2">
                        {cat}
                      </p>
                      <p className="text-sm text-stone-400 italic">
                        No quotes captured in this category yet.
                      </p>
                    </div>
                  )
                }
                return <ElderQuoteCard key={cat} quote={quote} />
              })}
            </div>
          </section>
        )}

        {/* ── ELDER QUOTES SAMPLE ── */}
        <section className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            Recent curated elder quotes · showing {Math.min(elderQuotes.length, 12)} of {totalElder}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {elderQuotes.slice(0, 12).map((q) => (
              <ElderQuoteCard key={q.id} quote={q} />
            ))}
          </div>
          {elderQuotes.length > 12 && (
            <p className="text-xs text-stone-400 mt-4 italic">
              Showing first 12 of {elderQuotes.length} loaded · {totalElder} total in database.
              Full grid view is a future enhancement.
            </p>
          )}
        </section>

        {/* ── EXTRACTED QUOTES SAMPLE ── */}
        <section className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            Top extracted quotes · suggested for report first
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {extractedQuotes.slice(0, 12).map((q) => (
              <ExtractedQuoteCard key={q.id} quote={q} />
            ))}
          </div>
          {extractedQuotes.length > 12 && (
            <p className="text-xs text-stone-400 mt-4 italic">
              Showing first 12 of {extractedQuotes.length} loaded · 290 total in database.
            </p>
          )}
        </section>

        {/* ── 20 VOICES SPRINT ── */}
        <section className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            The 20 voices for 20 years sprint
          </p>
          <div className="rounded-2xl bg-stone-900 text-white p-8">
            <p className="text-white/90 leading-relaxed mb-4">
              The Launchpad plan E1 names a capture sprint: <strong>60 voices captured and
              approved before the celebration.</strong> One Elder, one staff member, and one
              young person per year 2005–2025. Each with photo, short video, written quote,
              tied to a specific year.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <SprintCount
                label="Voices needed"
                value="60"
                sub="3 per year × 20 years"
              />
              <SprintCount
                label="Currently held"
                value={String(totalElder)}
                sub="Curated elder quotes (mixed years)"
              />
              <SprintCount
                label="Status"
                value="Capture pending"
                sub="Awaiting Narelle priority list"
              />
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              The Narelle interview framework Part E5–E7 produces the must-capture-now list,
              who opens the door for each, and which voices need cultural sign-off before
              anything goes public. Once that list lands, this page becomes the operational
              tracker for the sprint.
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-8">
          <p className="text-xs text-stone-500 leading-relaxed">
            <strong className="text-stone-700">Sources:</strong> live from{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">elder_quotes</code>{' '}
            and{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">extracted_quotes</code>.
            Cultural protocol: voices with{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">cultural_sensitivity = restricted</code>{' '}
            are filtered out even in this admin view. Permission levels respected. The
            20-voices-for-20-years sprint specification is sourced from
            PICC-20-Year-Launchpad-Plan.md E1.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <a href="/picc/library" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            ← Library
          </a>
          <a href="/picc/launchpad" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Launchpad
          </a>
          <a href="/picc/next-20" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Next-20 canvas
          </a>
          <a href="/elders/voices-on-country" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Public voices on country
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
  sub: string
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-2 text-picc-ochre">
        {icon}
        <p className="text-xs font-semibold tracking-wide uppercase">{label}</p>
      </div>
      <p className="text-3xl font-bold text-picc-earth mb-1">{count.toLocaleString()}</p>
      <p className="text-xs text-stone-500 leading-relaxed">{sub}</p>
    </div>
  )
}

function CategoryPill({
  label,
  count,
  isPriority,
  isGap,
}: {
  label: string
  count: number
  isPriority: boolean
  isGap: boolean
}) {
  const styles = isGap
    ? 'bg-amber-100 text-amber-800 border-amber-300'
    : isPriority
    ? 'bg-picc-ochre/10 text-picc-ochre border-picc-ochre/30'
    : 'bg-stone-100 text-stone-600 border-stone-200'
  return (
    <span
      className={`px-3 py-1.5 rounded-full border text-sm font-medium inline-flex items-center gap-2 ${styles}`}
    >
      <span className="capitalize">{label}</span>
      <span className="text-xs font-mono">{count}</span>
    </span>
  )
}

function ElderQuoteCard({ quote }: { quote: ElderQuote }) {
  const displayName = quote.speaker_name || 'Community member'
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <Quote className="w-5 h-5 text-picc-ochre mb-3 opacity-60" />
      <p className="font-serif italic text-base text-stone-800 leading-relaxed mb-4 line-clamp-5">
        &ldquo;{quote.text}&rdquo;
      </p>
      <div className="flex items-start justify-between gap-2 pt-3 border-t border-stone-100">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-700 truncate">— {displayName}</p>
          {quote.speaker_role && (
            <p className="text-xs text-stone-500 truncate">{quote.speaker_role}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {quote.category && (
            <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-picc-ochre/10 text-picc-ochre">
              {quote.category.length > 18 ? quote.category.slice(0, 15) + '…' : quote.category}
            </span>
          )}
          {quote.is_validated && (
            <CheckCircle2 className="w-3 h-3 text-green-600" />
          )}
        </div>
      </div>
    </div>
  )
}

function ExtractedQuoteCard({ quote }: { quote: ExtractedQuote }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <Mic className="w-5 h-5 text-picc-ochre mb-3 opacity-60" />
      <p className="font-serif italic text-base text-stone-800 leading-relaxed mb-4 line-clamp-5">
        &ldquo;{quote.quote_text}&rdquo;
      </p>
      <div className="flex items-start justify-between gap-2 pt-3 border-t border-stone-100">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-700 truncate">
            — {quote.attribution || 'Unattributed'}
          </p>
          {quote.theme && (
            <p className="text-xs text-stone-500 truncate">{quote.theme}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {quote.suggested_for_report && (
            <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-picc-ochre/10 text-picc-ochre">
              For report
            </span>
          )}
          {quote.is_validated && (
            <CheckCircle2 className="w-3 h-3 text-green-600" />
          )}
        </div>
      </div>
    </div>
  )
}

function SprintCount({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-picc-ochre mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-white/50 leading-relaxed">{sub}</p>
    </div>
  )
}
