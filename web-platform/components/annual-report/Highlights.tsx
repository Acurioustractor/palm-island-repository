'use client'

import Image from 'next/image'
import { ReportHighlight } from '@/lib/empathy-ledger/types-annual-report-content'
import { cn } from '@/lib/utils'

interface HighlightsProps {
  highlights: ReportHighlight[]
  className?: string
}

export function Highlights({ highlights, className }: HighlightsProps) {
  if (!highlights || highlights.length === 0) {
    return null
  }

  const sortedHighlights = [...highlights].sort((a, b) => {
    // Featured first, then by display order
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    return a.display_order - b.display_order
  })

  return (
    <section className={cn('annual-report-section', className)}>
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Key Achievements
        </h2>
        <p className="text-lg text-gray-600">
          Highlights from the year
        </p>
      </div>

      <div className="space-y-12">
        {sortedHighlights.map((highlight) => (
          <Highlight key={highlight.id} highlight={highlight} />
        ))}
      </div>
    </section>
  )
}

function Highlight({ highlight }: { highlight: ReportHighlight }) {
  const {
    title,
    subtitle,
    description,
    challenge_faced,
    solution_approach,
    impact_achieved,
    featured_image_url,
    metrics,
    display_style = 'standard',
    is_featured
  } = highlight

  // Hero style for featured highlights
  if (display_style === 'hero' || is_featured) {
    return (
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        {featured_image_url && (
          <div className="absolute inset-0">
            <Image
              src={featured_image_url}
              alt={title}
              fill
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-700/90"></div>
          </div>
        )}

        <div className="relative px-8 md:px-12 py-12 md:py-16">
          <div className="max-w-3xl">
            {subtitle && (
              <p className="text-blue-200 font-medium text-lg mb-2">{subtitle}</p>
            )}
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {title}
            </h3>
            <p className="text-xl text-blue-50 leading-relaxed mb-8">
              {description}
            </p>

            {metrics && <HighlightMetrics metrics={metrics} variant="light" />}
          </div>
        </div>
      </div>
    )
  }

  // Card style
  if (display_style === 'card') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        {featured_image_url && (
          <div className="aspect-video relative">
            <Image
              src={featured_image_url}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-8">
          {subtitle && (
            <p className="text-blue-600 font-medium text-sm uppercase tracking-wide mb-2">
              {subtitle}
            </p>
          )}
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-700 leading-relaxed mb-6">{description}</p>

          {(challenge_faced || solution_approach || impact_achieved) && (
            <StoryElements
              challenge={challenge_faced}
              solution={solution_approach}
              impact={impact_achieved}
            />
          )}

          {metrics && <HighlightMetrics metrics={metrics} />}
        </div>
      </div>
    )
  }

  // Timeline item style
  if (display_style === 'timeline_item') {
    return (
      <div className="relative pl-8 border-l-4 border-blue-600">
        <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-600 border-4 border-white"></div>

        {subtitle && (
          <p className="text-sm text-gray-500 font-medium mb-1">{subtitle}</p>
        )}
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-700 leading-relaxed mb-4">{description}</p>

        {metrics && <HighlightMetrics metrics={metrics} size="compact" />}
      </div>
    )
  }

  // Standard style (default)
  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      {featured_image_url && (
        <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
          <Image
            src={featured_image_url}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className={!featured_image_url ? 'md:col-span-2' : ''}>
        {subtitle && (
          <p className="text-blue-600 font-medium text-sm uppercase tracking-wide mb-2">
            {subtitle}
          </p>
        )}
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {title}
        </h3>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          {description}
        </p>

        {(challenge_faced || solution_approach || impact_achieved) && (
          <StoryElements
            challenge={challenge_faced}
            solution={solution_approach}
            impact={impact_achieved}
          />
        )}

        {metrics && <HighlightMetrics metrics={metrics} />}
      </div>
    </div>
  )
}

function StoryElements({
  challenge,
  solution,
  impact
}: {
  challenge?: string
  solution?: string
  impact?: string
}) {
  return (
    <div className="space-y-4 mt-6">
      {challenge && (
        <div className="border-l-4 border-red-400 pl-4 py-2 bg-red-50 rounded-r">
          <h4 className="font-bold text-red-900 text-sm uppercase tracking-wide mb-1">
            Challenge
          </h4>
          <p className="text-gray-700 text-sm">{challenge}</p>
        </div>
      )}

      {solution && (
        <div className="border-l-4 border-amber-400 pl-4 py-2 bg-amber-50 rounded-r">
          <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wide mb-1">
            Solution
          </h4>
          <p className="text-gray-700 text-sm">{solution}</p>
        </div>
      )}

      {impact && (
        <div className="border-l-4 border-green-400 pl-4 py-2 bg-green-50 rounded-r">
          <h4 className="font-bold text-green-900 text-sm uppercase tracking-wide mb-1">
            Impact
          </h4>
          <p className="text-gray-700 text-sm">{impact}</p>
        </div>
      )}
    </div>
  )
}

function HighlightMetrics({
  metrics,
  variant = 'default',
  size = 'default'
}: {
  metrics: Record<string, any>
  variant?: 'default' | 'light'
  size?: 'default' | 'compact'
}) {
  const entries = Object.entries(metrics)

  if (entries.length === 0) return null

  const textColor = variant === 'light' ? 'text-blue-100' : 'text-gray-600'
  const valueColor = variant === 'light' ? 'text-white' : 'text-blue-600'
  const sizeClasses = size === 'compact' ? 'text-xl' : 'text-3xl'

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {entries.map(([key, value]) => (
        <div key={key}>
          <div className={cn('font-bold', sizeClasses, valueColor)}>
            {value}
          </div>
          <div className={cn('text-sm capitalize', textColor)}>
            {key.replace(/_/g, ' ')}
          </div>
        </div>
      ))}
    </div>
  )
}
