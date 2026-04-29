import { tokens } from '@/lib/design-tokens/pdf-tokens'
import type { FooterCTAProps } from './types'

export function FooterCTA({ title, body, cta, ctaHref }: FooterCTAProps) {
  return (
    <section
      className="flex flex-col items-center text-center gap-lg rounded-lg w-full"
      style={{ backgroundColor: tokens.color.brand.midnight, padding: tokens.spacing.xxxl }}
    >
      <h2
        className="font-fraunces font-bold"
        style={{ fontSize: tokens.typography.fontSize.stat, color: tokens.color.brand.starGold }}
      >
        {title}
      </h2>
      <p
        className="font-sans leading-relaxed text-white/85 max-w-xl"
        style={{ fontSize: tokens.typography.fontSize.body }}
      >
        {body}
      </p>
      {cta && (
        <a
          href={ctaHref ?? '#'}
          className="px-xl py-md rounded-pill font-sans font-semibold uppercase tracking-[2px] hover:opacity-90 transition-opacity"
          style={{
            fontSize: tokens.typography.fontSize.eyebrow,
            backgroundColor: tokens.color.brand.starGold,
            color: tokens.color.brand.midnight,
          }}
        >
          {cta}
        </a>
      )}
    </section>
  )
}
