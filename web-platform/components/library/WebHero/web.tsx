import { tokens } from '@/lib/design-tokens/pdf-tokens'
import type { WebHeroProps } from './types'

export function WebHero({ imageUrl, eyebrow, title, subtitle, height = 680 }: WebHeroProps) {
  return (
    <header
      className="relative flex flex-col justify-end rounded-xl w-full overflow-hidden"
      style={{
        height,
        padding: tokens.spacing.hero,
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%), url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="flex flex-col gap-sm">
        <div
          className="font-sans font-bold uppercase tracking-[3px] text-white"
          style={{ fontSize: tokens.typography.fontSize.eyebrow }}
        >
          {eyebrow}
        </div>
        <h1
          className="font-fraunces font-bold text-white leading-none"
          style={{ fontSize: tokens.typography.fontSize.hero }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="font-fraunces font-bold"
            style={{ fontSize: 36, color: tokens.color.brand.starGold }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </header>
  )
}
