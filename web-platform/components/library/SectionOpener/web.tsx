import { tokens } from '@/lib/design-tokens/pdf-tokens'
import type { SectionOpenerProps } from './types'

export function SectionOpener({ eyebrow, title, subtitle, section = 'family', iconUrl }: SectionOpenerProps) {
  const tint = tokens.color.section[section]
  return (
    <section
      className="flex flex-col items-center text-center gap-xl rounded-lg w-full"
      style={{ backgroundColor: tokens.color.brand.shell, padding: tokens.spacing.xxxl }}
    >
      {iconUrl && (
        <div className="w-[140px] h-[140px]">
          <img src={iconUrl} alt="" className="w-full h-full object-contain" />
        </div>
      )}
      <div
        className="font-sans font-bold uppercase tracking-[3px]"
        style={{ fontSize: tokens.typography.fontSize.eyebrow, color: tint }}
      >
        {eyebrow}
      </div>
      <h2
        className="font-fraunces font-bold leading-[1.05] max-w-3xl"
        style={{ fontSize: tokens.typography.fontSize.display, color: tint }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="font-sans leading-relaxed max-w-2xl"
          style={{ fontSize: tokens.typography.fontSize.body, color: tokens.color.brand.driftwood }}
        >
          {subtitle}
        </p>
      )}
    </section>
  )
}
