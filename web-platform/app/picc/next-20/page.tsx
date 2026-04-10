/**
 * PICC Next-20 Canvas — Internal working surface for the 20-year vision
 *
 * Three columns side-by-side:
 *   1. Community Visions — pulled live from `community_visions` table (DB-sourced)
 *   2. Forward Commitments — sourced verbatim from PICC-20-Year-Launchpad-Plan.md
 *   3. Urgent Asks — sourced verbatim from PICC-Services-Projects-Review-for-Narelle.md
 *
 * Internal only (/picc/next-20). Designed as the working canvas for the
 * Rachel workshop — Slide 12 of PICC-Rachel-Workshop-Slides.md drafts the
 * next-20 sentence live, sourced from the visions and commitments shown here.
 */

import { createServerSupabase } from '@/lib/supabase/client'
import { Sparkles, Compass, AlertCircle, Quote, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Next 20 Years — Working Canvas | PICC',
  description: 'Working canvas for the next-20 vision: community voices, forward commitments, and urgent asks side by side.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ─────────────────────────────────────────────────────────────────────────
// SOURCE: PICC-Narelle-Rachel-Workshop/PICC-20-Year-Launchpad-Plan.md
// Section: M2 (next-20 vision document — Rachel-led)
// Last sync: 10 April 2026
// These are the three forward commitments drafted by Ben for Rachel to
// rewrite. Stored here as constants because they live in a markdown plan,
// not the database. When Rachel rewrites them, this constant updates AND
// the markdown file updates so the two stay in sync.
// ─────────────────────────────────────────────────────────────────────────
const FORWARD_COMMITMENTS = [
  {
    target_year: '2028',
    title: 'Aged care on Palm',
    body:
      'A dedicated aged care facility on Palm Island so our Elders never have to leave Country. Currently flagged URGENT in the ledger — Elders meeting 10 April 2026, council and mayor being pushed.',
    source: 'Launchpad M2 + Narelle services review (Aged Care Services)',
  },
  {
    target_year: '2030',
    title: 'Bwgcolman Way expanded',
    body:
      'Delegated Authority extended beyond child safety into health and justice — the first Indigenous-led delegated authority across three domains in Australia.',
    source: 'Launchpad M2 + governance_achievements 2024',
  },
  {
    target_year: '2045',
    title: 'Sovereign story archive',
    body:
      'Every Palm Island story captured, consented, and sovereign by 2045. The Empathy Ledger as permanent home for community voice — invisible plumbing, never the hero.',
    source: 'Launchpad M2 + E1 (20 voices for 20 years)',
  },
]

// ─────────────────────────────────────────────────────────────────────────
// SOURCE: PICC-Narelle-Rachel-Workshop/PICC-Services-Projects-Review-for-Narelle.md
// Section: "What we still need to get done" + the [URGENT] flagged services
// Last sync: 10 April 2026
// These are the three urgent items Narelle flagged in her services review.
// ─────────────────────────────────────────────────────────────────────────
const URGENT_ASKS = [
  {
    label: 'Aged Care Services',
    title: 'Outcome of the 10 April Elders meeting',
    body:
      'Aged Care Services is flagged URGENT in the ledger. No dedicated facility on Palm. Elders met on 10 April 2026 to discuss aged care and relocation. Council and mayor being pushed for action. Should this be a feature of the 20-year celebration as a forward commitment?',
    source: 'Narelle services review — Aged Care Services [URGENT]',
  },
  {
    label: 'Blue Card Liaison Service',
    title: 'Funding cliff 30 June 2026',
    body:
      'Two-year pilot averaging ~20 positive notices per month. Funding ends 30 June. Extension pending. Decision needed: extension secured or planning for the cliff?',
    source: 'Narelle services review — Blue Card Liaison Service',
  },
  {
    label: 'Three missing services',
    title: 'Narelle said 31, the Ledger has 28',
    body:
      'Narelle said about 31 services exist; the Empathy Ledger holds 28. Three services may be missing entirely. Identifying these is the first ask in Part A3 of the interview framework.',
    source: 'Narelle services review — "What\'s missing" section',
  },
]

interface CommunityVision {
  id: string
  vision_text: string
  author_name: string | null
  author_role: string | null
  category: string | null
}

export default async function Next20CanvasPage() {
  const supabase = createServerSupabase()

  const { data: visionsData } = await supabase
    .from('community_visions')
    .select('id, vision_text, author_name, author_role, category')
    .eq('is_approved', true)
    .order('created_at', { ascending: true })

  const visions: CommunityVision[] = visionsData || []

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* ── HEADER ── */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            Working Canvas · Internal · For Rachel & Narelle
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-800 italic mb-4 leading-tight">
            The Next 20 Years
          </h1>
          <p className="text-lg text-stone-600 max-w-3xl leading-relaxed">
            Three columns. The grassroots voice on the left, the forward commitments in the
            middle, the urgent asks on the right. This is the spread Rachel walks into the
            workshop with — not to accept, but to rewrite in her own words.
          </p>
        </div>

        {/* ── HULL RIVER QUOTE ── */}
        <div className="mb-16 rounded-2xl bg-[#0B4F6C] text-white p-8 md:p-10">
          <Quote className="w-8 h-8 text-picc-ochre mb-4 opacity-80" />
          <p className="font-serif italic text-2xl md:text-3xl leading-relaxed mb-4">
            Before PICC, there was Hull River.<br />
            Before Hull River, there was Country.<br />
            PICC&apos;s next 20 years start here.
          </p>
          <p className="text-sm text-white/60">
            From PICC-20-Year-Launchpad-Plan.md
          </p>
        </div>

        {/* ── THREE COLUMNS ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">

          {/* Column 1 — Community Visions (DB-sourced) */}
          <Column
            icon={<Sparkles className="w-5 h-5" />}
            label="Community Visions"
            count={visions.length}
            source={`Live from community_visions table · ${visions.length} approved`}
          >
            {visions.length === 0 ? (
              <EmptyState message="No approved community visions in the database. Run a capture session to populate." />
            ) : (
              visions.map((v) => (
                <div
                  key={v.id}
                  className="rounded-xl border border-stone-200 bg-white p-5"
                >
                  <p className="text-sm text-stone-700 leading-relaxed mb-3 italic">
                    &ldquo;{v.vision_text}&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">
                      — {v.author_name || 'Anonymous'}
                      {v.author_role ? `, ${v.author_role}` : ''}
                    </span>
                    {v.category && (
                      <span className="px-2 py-0.5 rounded-full bg-picc-ochre/10 text-picc-ochre font-medium capitalize">
                        {v.category}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </Column>

          {/* Column 2 — Forward Commitments (Launchpad-sourced) */}
          <Column
            icon={<Compass className="w-5 h-5" />}
            label="Forward Commitments"
            count={FORWARD_COMMITMENTS.length}
            source="From PICC-20-Year-Launchpad-Plan.md M2 · Last sync 10 April 2026"
          >
            {FORWARD_COMMITMENTS.map((c) => (
              <div
                key={c.title}
                className="rounded-xl border border-picc-ochre/30 bg-white p-5"
              >
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-mono text-xs font-bold text-picc-ochre tracking-wide">
                    BY {c.target_year}
                  </span>
                </div>
                <h3 className="font-semibold text-stone-800 mb-2">{c.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-3">
                  {c.body}
                </p>
                <p className="text-[11px] text-stone-400">
                  Source: {c.source}
                </p>
              </div>
            ))}
          </Column>

          {/* Column 3 — Urgent Asks (Narelle-sourced) */}
          <Column
            icon={<AlertCircle className="w-5 h-5 text-red-500" />}
            label="Urgent Asks"
            count={URGENT_ASKS.length}
            source="From PICC-Services-Projects-Review-for-Narelle.md · Last sync 10 April 2026"
          >
            {URGENT_ASKS.map((u) => (
              <div
                key={u.title}
                className="rounded-xl border-2 border-red-200 bg-red-50/40 p-5"
              >
                <p className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wide mb-1">
                  {u.label}
                </p>
                <h3 className="font-semibold text-stone-800 mb-2">{u.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-3">
                  {u.body}
                </p>
                <p className="text-[11px] text-stone-400">
                  Source: {u.source}
                </p>
              </div>
            ))}
          </Column>
        </div>

        {/* ── DRAFT SENTENCE ── */}
        <div className="rounded-2xl bg-stone-900 text-white p-8 md:p-10 mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            First-draft sentence (for Rachel to rewrite)
          </p>
          <p className="font-serif italic text-xl md:text-2xl leading-relaxed mb-6 text-white/95">
            In the next 20 years, PICC will build the community-controlled infrastructure
            Palm Island needed all along. By 2028, aged care on Palm — so our Elders never
            have to leave Country again. By 2030, Bwgcolman Way expanded beyond child safety
            into health and justice. By 2029, Palm Island running its own hospital, its own
            school, its own economy — because we have the people, we just needed the
            opportunity. And by 2045, every Palm Island story captured, consented, and
            sovereign — so the next generation inherits not just the buildings we built,
            but the voices that built them. Not the problems. The solutions.
          </p>
          <div className="text-xs text-white/50 border-l-2 border-picc-ochre pl-3">
            Italicised phrases are direct lifts from the 6 approved community_visions rows
            in the left column. Rachel owns the rewrite. This sentence becomes M2 in the
            Launchpad plan once she signs off in the workshop.
          </div>
        </div>

        {/* ── HOW TO USE ── */}
        <div className="rounded-2xl border border-stone-200 bg-white p-8">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            How to use this canvas
          </h2>
          <ol className="space-y-3 text-sm text-stone-700">
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-picc-ochre flex-shrink-0 w-6">1.</span>
              <span>
                Walk Rachel through the three columns — read every community vision out loud.
                The grassroots voice came first. The strategic commitments come second.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-picc-ochre flex-shrink-0 w-6">2.</span>
              <span>
                Ask Rachel which community vision surprises her. Which one does she want to
                make the headline? That voice becomes the first sentence of her rewrite.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-picc-ochre flex-shrink-0 w-6">3.</span>
              <span>
                Walk through the urgent asks. Which become forward commitments in the next-20
                vision (Aged Care is the obvious candidate)? Which need a separate plan?
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-picc-ochre flex-shrink-0 w-6">4.</span>
              <span>
                Show her the first-draft sentence above. Tell her: this is the placeholder.
                Now rewrite it, sentence by sentence, in your own voice.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-picc-ochre flex-shrink-0 w-6">5.</span>
              <span>
                Capture her rewrite. Update PICC-20-Year-Launchpad-Plan.md M2 within 48 hours.
                Update FORWARD_COMMITMENTS at the top of this page so the canvas reflects her
                voice next time.
              </span>
            </li>
          </ol>
        </div>

        {/* ── FOOTER LINKS ── */}
        <div className="mt-12 flex flex-wrap gap-3 text-xs">
          <a
            href="/picc/launchpad"
            className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 inline-flex items-center gap-1.5"
          >
            ← The Launchpad strategic plan
            <ArrowRight className="w-3 h-3" />
          </a>
          <a
            href="/services/bwgcolman-way"
            className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 inline-flex items-center gap-1.5"
          >
            Bwgcolman Way (the anchor)
            <ArrowRight className="w-3 h-3" />
          </a>
          <a
            href="/20-years"
            className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 inline-flex items-center gap-1.5"
          >
            17-year history walk
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────

function Column({
  icon,
  label,
  count,
  source,
  children,
}: {
  icon: React.ReactNode
  label: string
  count: number
  source: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="text-picc-ochre">{icon}</div>
        <h2 className="text-sm font-semibold tracking-wide uppercase text-stone-700">
          {label}
        </h2>
        <span className="text-xs text-stone-400">({count})</span>
      </div>
      <p className="text-[11px] text-stone-400 mb-4 leading-relaxed">{source}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-stone-200 p-6 text-center">
      <p className="text-sm text-stone-400">{message}</p>
    </div>
  )
}
