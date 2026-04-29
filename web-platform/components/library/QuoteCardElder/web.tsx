import { tokens } from '@/lib/design-tokens/pdf-tokens'
import type { QuoteCardElderProps } from './types'

export function QuoteCardElder({ quote, speakerName, speakerRole, portraitUrl }: QuoteCardElderProps) {
  return (
    <figure
      className="flex flex-col gap-[20px] rounded-lg w-full"
      style={{ backgroundColor: tokens.color.brand.sand, padding: 40 }}
    >
      <div className="w-9 h-9 text-[28px] leading-none font-fraunces" style={{ color: tokens.color.brand.turtleRed }}>
        &ldquo;
      </div>
      <blockquote
        className="font-fraunces italic font-medium leading-snug"
        style={{ fontSize: 32, color: tokens.color.brand.earth }}
      >
        {quote}
      </blockquote>
      <figcaption className="flex items-center gap-md">
        {portraitUrl && (
          <img
            src={portraitUrl}
            alt=""
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        )}
        <div className="flex flex-col gap-0.5">
          <span className="font-sans font-semibold text-brand-earth" style={{ fontSize: tokens.typography.fontSize.body }}>
            {speakerName}
          </span>
          {speakerRole && (
            <span className="font-sans text-brand-driftwood" style={{ fontSize: tokens.typography.fontSize.caption }}>
              {speakerRole}
            </span>
          )}
        </div>
      </figcaption>
    </figure>
  )
}
