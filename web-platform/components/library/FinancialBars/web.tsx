import { tokens } from '@/lib/design-tokens/pdf-tokens'
import type { FinancialBarsProps } from './types'

const resolve = (key?: string) =>
  (key && (tokens.color.section as Record<string, string>)[key]) ??
  (key && (tokens.color.brand as Record<string, string>)[key]) ??
  tokens.color.brand.ochre

export function FinancialBars({ header, rows }: FinancialBarsProps) {
  return (
    <section
      className="flex flex-col gap-xl rounded-lg w-full"
      style={{ backgroundColor: tokens.color.brand.shell, padding: tokens.spacing.xxl }}
    >
      <h3
        className="font-sans font-bold uppercase tracking-[2px]"
        style={{ fontSize: tokens.typography.fontSize.eyebrow, color: tokens.color.brand.earth }}
      >
        {header}
      </h3>
      <div className="flex flex-col gap-lg">
        {rows.map((r, i) => (
          <div key={`${r.label}-${i}`} className="flex flex-col gap-[6px]">
            <div className="flex items-center justify-between gap-md">
              <span
                className="font-sans"
                style={{ fontSize: tokens.typography.fontSize.body, color: tokens.color.brand.earth }}
              >
                {r.label}
              </span>
              <span
                className="font-fraunces font-bold"
                style={{ fontSize: tokens.typography.fontSize.body, color: tokens.color.brand.earth }}
              >
                {r.display}
              </span>
            </div>
            <div className="h-3 rounded-md w-full" style={{ backgroundColor: tokens.color.brand.border }}>
              <div
                className="h-full rounded-md"
                style={{ width: `${Math.max(0, Math.min(1, r.ratio)) * 100}%`, backgroundColor: resolve(r.tint) }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
