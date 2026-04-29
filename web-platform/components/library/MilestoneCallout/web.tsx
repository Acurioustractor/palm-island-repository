import { tokens } from '@/lib/design-tokens/pdf-tokens'
import type { MilestoneCalloutProps } from './types'

const resolve = (key: string) =>
  (tokens.color.section as Record<string, string>)[key] ??
  (tokens.color.brand as Record<string, string>)[key] ??
  tokens.color.brand.ocean

export function MilestoneCallout({
  value, description, background = 'ocean', valueTint = 'starGold',
}: MilestoneCalloutProps) {
  return (
    <div
      className="flex flex-col gap-lg rounded-xl w-full"
      style={{ backgroundColor: resolve(background), padding: tokens.spacing.xxxl }}
    >
      <div
        className="font-fraunces font-bold leading-[0.9]"
        style={{ fontSize: tokens.typography.fontSize.hero, color: resolve(valueTint) }}
      >
        {value}
      </div>
      <p
        className="font-sans leading-relaxed text-white/90"
        style={{ fontSize: tokens.typography.fontSize.body }}
      >
        {description}
      </p>
    </div>
  )
}
