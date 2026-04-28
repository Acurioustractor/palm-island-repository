/**
 * ReefLayers — painted strata as a financial-breakdown header, with
 * category-coloured stacked bars below.
 *
 * Hybrid component: brush-textured painted reef layers PNG (approved
 * infographic #03-reef-layers) sits as a decorative band; below, real
 * data renders as horizontal bars with each category in its own
 * Saltwater & Earth section colour (no more all-the-same-blue bars).
 *
 * Designed for the FY24-25 expenditure breakdown but generalised:
 * accepts any [{ category, amount, percentage }] series.
 */
'use client'

import { assetUrl } from '@/lib/media/asset-url'
import { C } from './tokens'

interface BreakdownItem {
  category: string
  amount: number
  percentage: number
}

interface ReefLayersProps {
  items: BreakdownItem[]
  /** Caption under the painted band (optional). */
  caption?: string
  /** Override the painted backdrop. */
  heroImageUrl?: string
}

const DEFAULT_HERO = assetUrl('/icons/picc/infographics/03-reef-layers.png')

// Match category strings to brand palette. Keys are lower-cased and
// matched against substrings of the category label so "Children &
// Families" matches "family" / "children".
const CATEGORY_COLOUR_KEYS: { keywords: string[]; colour: string }[] = [
  { keywords: ['children', 'families', 'family'],   colour: C.ochre },
  { keywords: ['health', 'wellbeing'],              colour: C.mangrove },
  { keywords: ['justice', 'safety'],                colour: C.coral },
  { keywords: ['youth'],                             colour: C.reef },
  { keywords: ['economic', 'enterprise', 'social'], colour: C.starGold },
  { keywords: ['education', 'community'],           colour: C.ocean },
  { keywords: ['operations', 'governance', 'admin'],colour: C.turtleRed },
]

function pickColour(category: string): string {
  const k = category.toLowerCase()
  for (const m of CATEGORY_COLOUR_KEYS) {
    if (m.keywords.some((kw) => k.includes(kw))) return m.colour
  }
  return C.driftwood
}

function formatM(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`
  if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toFixed(0)}`
}

export function ReefLayers({ items, caption, heroImageUrl }: ReefLayersProps) {
  // Sort by percentage descending so the biggest layers are visually
  // first — matches a real reef strata reading top-down.
  const sorted = [...items].sort((a, b) => b.percentage - a.percentage)

  return (
    <section className="w-full" aria-label="Expenditure breakdown by category">
      {/* Painted strata header band */}
      <div className="mx-auto mb-8" style={{ maxWidth: 720 }}>
        <div className="relative w-full" style={{ aspectRatio: '3 / 2' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImageUrl ?? DEFAULT_HERO}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>
        {caption && (
          <p
            className="mx-auto mt-4 text-center font-caveat italic"
            style={{ color: C.driftwood, fontSize: 'clamp(14px, 1.6vw, 18px)', maxWidth: 540 }}
          >
            {caption}
          </p>
        )}
      </div>

      {/* Category-coloured stacked bars */}
      <div className="mx-auto space-y-4" style={{ maxWidth: 720 }}>
        {sorted.map((item) => {
          const colour = pickColour(item.category)
          return (
            <div key={item.category}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: colour,
                      display: 'inline-block',
                    }}
                  />
                  <span
                    className="uppercase font-bold"
                    style={{
                      color: C.rock,
                      fontSize: 12,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {item.category}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-caveat font-bold"
                    style={{ color: colour, fontSize: 22 }}
                  >
                    {formatM(item.amount)}
                  </span>
                  <span style={{ color: C.driftwood, fontSize: 11 }}>
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-3 rounded-full" style={{ backgroundColor: C.shell }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ backgroundColor: colour, width: `${item.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
