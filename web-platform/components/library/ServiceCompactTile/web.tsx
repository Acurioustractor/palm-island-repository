import { tokens } from '@/lib/design-tokens/pdf-tokens'
import type { ServiceCompactTileProps } from './types'

export function ServiceCompactTile({
  name,
  description,
  imageUrl,
  tint = 'family',
  staffCount,
  clientsCount,
  href,
}: ServiceCompactTileProps) {
  const tintColor = tokens.color.section[tint]
  const showStrap = staffCount != null || clientsCount != null

  const Tag = (href ? 'a' : 'div') as 'a' | 'div'
  const linkProps = href ? { href } : {}

  return (
    <Tag
      {...linkProps}
      className={`flex flex-col rounded-lg overflow-hidden w-full h-full ${href ? 'hover:opacity-90 transition-opacity' : ''}`}
      style={{ backgroundColor: tokens.color.brand.shell }}
    >
      <div
        className="w-full"
        style={{
          height: 160,
          backgroundColor: imageUrl ? undefined : `${tintColor}33`,
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!imageUrl && (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="font-fraunces font-bold"
              style={{ color: tintColor, fontSize: 56, opacity: 0.5 }}
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
      <div className="flex flex-col gap-sm p-md flex-grow">
        <div
          className="font-fraunces font-bold leading-tight"
          style={{ color: tokens.color.brand.ocean, fontSize: 18 }}
        >
          {name}
        </div>
        {description && (
          <p
            className="leading-relaxed"
            style={{ color: tokens.color.brand.driftwood, fontSize: 13 }}
          >
            {description}
          </p>
        )}
        {showStrap && (
          <div
            className="flex gap-md mt-auto pt-sm"
            style={{ color: tokens.color.brand.muted, fontSize: tokens.typography.fontSize.caption - 1 }}
          >
            {staffCount != null && (
              <span>
                <strong style={{ color: tintColor }}>{staffCount}</strong> staff
              </span>
            )}
            {clientsCount != null && (
              <span>
                <strong style={{ color: tintColor }}>{clientsCount.toLocaleString()}</strong> clients/yr
              </span>
            )}
          </div>
        )}
      </div>
    </Tag>
  )
}
