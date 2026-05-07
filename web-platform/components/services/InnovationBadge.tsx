/**
 * Tiny "Innovation programme" pill badge.
 *
 * Render on service cards, the service map, and anywhere a service appears
 * to distinguish next-20 innovation programmes from steady-state services.
 *
 * Source of truth for which slugs count as innovation:
 * `lib/services/innovation-tier.ts`.
 */
import { Sparkles } from 'lucide-react'
import { INNOVATION_BLURBS, isInnovation } from '@/lib/services/innovation-tier'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

interface Props {
  slug: string | null | undefined
  /** "card" = floating top-left badge for service cards.
   *  "inline" = inline pill for lists / detail headers. */
  variant?: 'card' | 'inline'
}

export function InnovationBadge({ slug, variant = 'card' }: Props) {
  if (!isInnovation(slug)) return null

  const tip = (slug && INNOVATION_BLURBS[slug]) || 'Driving the next 20 years.'

  if (variant === 'inline') {
    return (
      <span
        title={tip}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{
          backgroundColor: C.starGold,
          color: C.midnight,
        }}
      >
        <Sparkles className="w-3 h-3" />
        Innovation
      </span>
    )
  }

  return (
    <span
      title={tip}
      className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm backdrop-blur-sm"
      style={{
        backgroundColor: C.starGold,
        color: C.midnight,
      }}
    >
      <Sparkles className="w-3 h-3" />
      Innovation
    </span>
  )
}
