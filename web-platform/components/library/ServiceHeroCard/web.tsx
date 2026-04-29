import { tokens } from '@/lib/design-tokens/pdf-tokens'
import type { ServiceHeroCardProps } from './types'

export function ServiceHeroCard({
  categoryLabel,
  name,
  description,
  factStrap,
  imageUrl,
  tint = 'family',
}: ServiceHeroCardProps) {
  const tintColor = tokens.color.section[tint]

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 rounded-lg overflow-hidden w-full"
      style={{ backgroundColor: tokens.color.brand.shell, minHeight: 380 }}
    >
      <div
        className="w-full"
        style={{
          minHeight: 240,
          backgroundColor: imageUrl ? undefined : `${tintColor}26`,
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!imageUrl && (
          <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 240 }}>
            <div
              className="font-fraunces font-bold"
              style={{ color: tintColor, fontSize: 96, opacity: 0.45 }}
            >
              {name
                .split(/\s+/)
                .map((p) => p[0])
                .slice(0, 2)
                .join('')}
            </div>
          </div>
        )}
      </div>
      <div
        className="flex flex-col justify-center gap-lg"
        style={{ padding: tokens.spacing.xxxl }}
      >
        <div
          className="font-sans font-bold uppercase"
          style={{
            color: tintColor,
            fontSize: tokens.typography.fontSize.eyebrow,
            letterSpacing: '3px',
          }}
        >
          {categoryLabel}
        </div>
        <h3
          className="font-fraunces font-bold leading-tight"
          style={{ color: tokens.color.brand.ocean, fontSize: 42 }}
        >
          {name}
        </h3>
        {description && (
          <p
            className="font-sans leading-relaxed"
            style={{ color: tokens.color.brand.driftwood, fontSize: 14 }}
          >
            {description}
          </p>
        )}
        {factStrap && (
          <p
            className="font-caveat italic"
            style={{ color: tokens.color.brand.muted, fontSize: 16 }}
          >
            {factStrap}
          </p>
        )}
      </div>
    </div>
  )
}
