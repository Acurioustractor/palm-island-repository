import { tokens } from '@/lib/design-tokens/pdf-tokens'
import type { PhotoBlockProps } from './types'

export function PhotoBlock({ src, alt, caption, height = 520 }: PhotoBlockProps) {
  return (
    <figure className="flex flex-col gap-md w-full">
      <img
        src={src}
        alt={alt}
        className="w-full object-cover rounded-lg"
        style={{ height }}
      />
      {caption && (
        <figcaption
          className="font-fraunces italic leading-snug"
          style={{ fontSize: 18, color: tokens.color.brand.driftwood }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
