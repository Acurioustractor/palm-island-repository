import { tokens } from '@/lib/design-tokens/pdf-tokens'
import type { StatHeroProps } from './types'

/**
 * StatHero — the canonical big-number treatment used across the almanac.
 *
 * Pencil source: picc-almanac-web.pen → "02 · StatHero" (XhjFb).
 * Tokens come from `lib/design-tokens/pdf-tokens` (the same const both web
 * and pdf consume). No hardcoded colours / spacing.
 */
export function StatHero({ value, label, caption, iconUrl, tint = 'mangrove', size = 'fixed' }: StatHeroProps) {
  const tintColor =
    (tokens.color.section as Record<string, string>)[tint] ??
    (tokens.color.brand as Record<string, string>)[tint] ??
    tokens.color.brand.mangrove

  const sizing = size === 'fixed' ? 'w-[300px] h-[240px]' : 'w-full h-full min-h-[240px]'

  return (
    <div
      className={`flex flex-col items-center justify-center gap-sm p-xl rounded-lg ${sizing}`}
    >
      {iconUrl && (
        <div className="w-12 h-12">
          <img src={iconUrl} alt="" className="w-full h-full object-contain" />
        </div>
      )}
      <div
        className="font-fraunces font-bold leading-none"
        style={{ fontSize: tokens.typography.fontSize.display, color: tintColor }}
      >
        {value}
      </div>
      <div
        className="font-sans font-bold uppercase tracking-[2px] text-brand-earth"
        style={{ fontSize: tokens.typography.fontSize.eyebrow }}
      >
        {label}
      </div>
      {caption && (
        <div
          className="font-sans text-brand-muted text-center leading-snug"
          style={{ fontSize: tokens.typography.fontSize.eyebrow }}
        >
          {caption}
        </div>
      )}
    </div>
  )
}
