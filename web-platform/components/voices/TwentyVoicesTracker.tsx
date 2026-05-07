/**
 * 20 Voices for 20 Years — sprint progress tracker.
 *
 * Surfaces how close PICC is to capturing 20 named, consented voices
 * for the 20th-anniversary cycle. Sourced from EL v2's voices-pool
 * (the same feed the leader walkthrough Experience #3 uses) — counts
 * distinct named storytellers with at least one validated quote.
 *
 * Used inline on /voices and /picc/voices. Keep it small — one strip
 * with a target line, a count, and a progress meter. Designed to be
 * scannable in the leader meeting.
 */
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { getVoicesPool } from '@/lib/services/el-coverage'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

interface Props {
  /** Where the "Add a voice" CTA points. Defaults to public capture. */
  ctaHref?: string
  ctaLabel?: string
  /** Render as compact (single line + bar) vs full (with description). */
  compact?: boolean
}

const TARGET = 20

export async function TwentyVoicesTracker({
  ctaHref = '/share-note',
  ctaLabel = 'Add a voice',
  compact = false,
}: Props) {
  const voices = await getVoicesPool().catch(() => [])

  // Distinct named storytellers from the EL v2 voices-pool. Anonymous /
  // unnamed quotes don't count toward the sprint.
  const distinct = new Set<string>()
  for (const v of voices) {
    if (v.storyteller_id && v.speaker_name) {
      distinct.add(v.storyteller_id)
    }
  }
  const captured = distinct.size
  const remaining = Math.max(0, TARGET - captured)
  const pct = Math.min(100, Math.round((captured / TARGET) * 100))
  const complete = captured >= TARGET

  return (
    <section
      className="rounded-2xl border-2 overflow-hidden"
      style={{
        borderColor: complete ? C.mangrove : C.starGold,
        backgroundColor: '#fff',
      }}
    >
      <div className="px-6 md:px-8 py-6 md:py-7">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <div
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.3em] mb-2"
              style={{ color: C.turtleRed }}
            >
              <Sparkles className="w-3 h-3" />
              20 Voices for 20 Years · sprint
            </div>
            <h3
              className="font-fraunces font-bold leading-tight"
              style={{ color: C.ocean, fontSize: 'clamp(22px, 3vw, 30px)' }}
            >
              {complete
                ? `Sprint complete — ${captured} named voices captured.`
                : `${captured} of ${TARGET} named voices captured.`}
            </h3>
            {!compact && (
              <p className="mt-2 text-sm md:text-base" style={{ color: C.driftwood, lineHeight: 1.6 }}>
                {complete
                  ? 'Every voice consented, attributed and reviewed. The next-20 canvas can lift any of them.'
                  : `${remaining} more named contributors needed before the 20th-anniversary cycle. Anonymous quotes don't count toward the sprint.`}
              </p>
            )}
          </div>
          <Link
            href={ctaHref}
            className="px-4 py-2.5 rounded-md font-bold uppercase tracking-widest text-xs whitespace-nowrap transition hover:opacity-90"
            style={{
              backgroundColor: C.ocean,
              color: '#fff',
              fontSize: 11,
              letterSpacing: '0.2em',
            }}
          >
            {ctaLabel} →
          </Link>
        </div>

        {/* Progress meter */}
        <div className="mt-5">
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: '#F0EDE7' }}
            aria-label={`${captured} of ${TARGET} voices captured (${pct}%)`}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: complete ? C.mangrove : C.ochre,
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono" style={{ color: C.driftwood }}>
            <span>{captured} captured</span>
            <span>{pct}%</span>
            <span>target {TARGET}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
