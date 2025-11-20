'use client'

import { ReportStatistic } from '@/lib/empathy-ledger/types-annual-report-content'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Award
} from 'lucide-react'

interface StatisticsProps {
  statistics: ReportStatistic[]
  className?: string
  layout?: 'grid' | 'featured'
}

export function Statistics({ statistics, className, layout = 'grid' }: StatisticsProps) {
  if (!statistics || statistics.length === 0) {
    return null
  }

  // Separate key metrics from regular stats
  const keyMetrics = statistics.filter(s => s.is_key_metric)
  const regularStats = statistics.filter(s => !s.is_key_metric)

  const sortedKeyMetrics = keyMetrics.sort((a, b) => a.display_order - b.display_order)
  const sortedRegularStats = regularStats.sort((a, b) => a.display_order - b.display_order)

  return (
    <section className={cn('annual-report-section', className)}>
      {/* Key Metrics - Always prominently displayed */}
      {sortedKeyMetrics.length > 0 && (
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            2024 at a Glance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sortedKeyMetrics.map((stat) => (
              <KeyMetricCard key={stat.id} statistic={stat} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Statistics */}
      {sortedRegularStats.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Detailed Statistics
          </h3>

          {layout === 'grid' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedRegularStats.map((stat) => (
                <StatCard key={stat.id} statistic={stat} />
              ))}
            </div>
          )}

          {layout === 'featured' && (
            <div className="space-y-4">
              {sortedRegularStats.map((stat) => (
                <StatListItem key={stat.id} statistic={stat} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function KeyMetricCard({ statistic }: { statistic: ReportStatistic }) {
  const {
    stat_label,
    stat_value,
    stat_description,
    comparison_type,
    color = '#3B82F6'
  } = statistic

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1"
      style={{ borderTop: `4px solid ${color}` }}
    >
      {/* Value */}
      <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color }}>
        {stat_value}
      </div>

      {/* Label */}
      <div className="text-gray-700 font-medium mb-2">
        {stat_label}
      </div>

      {/* Comparison Indicator */}
      {comparison_type && (
        <ComparisonBadge type={comparison_type} />
      )}

      {/* Description */}
      {stat_description && (
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
          {stat_description}
        </p>
      )}
    </div>
  )
}

function StatCard({ statistic }: { statistic: ReportStatistic }) {
  const {
    stat_label,
    stat_value,
    stat_description,
    comparison_previous_year,
    comparison_type,
    color = '#6B7280'
  } = statistic

  return (
    <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-2xl font-bold text-gray-900">
          {stat_value}
        </div>
        {comparison_type && (
          <ComparisonIcon type={comparison_type} />
        )}
      </div>

      <div className="text-sm font-medium text-gray-700 mb-1">
        {stat_label}
      </div>

      {comparison_previous_year && (
        <div className="text-xs text-gray-500 mt-2">
          {comparison_previous_year}
        </div>
      )}

      {stat_description && (
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
          {stat_description}
        </p>
      )}
    </div>
  )
}

function StatListItem({ statistic }: { statistic: ReportStatistic }) {
  const {
    stat_label,
    stat_value,
    stat_description,
    comparison_previous_year,
    comparison_type
  } = statistic

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-blue-600">{stat_value}</span>
          <span className="text-gray-700 font-medium">{stat_label}</span>
          {comparison_type && <ComparisonIcon type={comparison_type} />}
        </div>

        {(stat_description || comparison_previous_year) && (
          <p className="text-sm text-gray-600 mt-1">
            {comparison_previous_year && <span className="font-medium">{comparison_previous_year}. </span>}
            {stat_description}
          </p>
        )}
      </div>
    </div>
  )
}

function ComparisonBadge({ type }: { type: string }) {
  const variants: Record<string, { icon: any; label: string; className: string }> = {
    increase: {
      icon: TrendingUp,
      label: 'Increase',
      className: 'bg-green-100 text-green-800'
    },
    decrease: {
      icon: TrendingDown,
      label: 'Decrease',
      className: 'bg-red-100 text-red-800'
    },
    stable: {
      icon: Minus,
      label: 'Stable',
      className: 'bg-gray-100 text-gray-800'
    },
    new: {
      icon: Sparkles,
      label: 'New',
      className: 'bg-blue-100 text-blue-800'
    },
    milestone: {
      icon: Award,
      label: 'Milestone',
      className: 'bg-purple-100 text-purple-800'
    }
  }

  const variant = variants[type] || variants.stable
  const Icon = variant.icon

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
      variant.className
    )}>
      <Icon className="w-3 h-3" />
      {variant.label}
    </span>
  )
}

function ComparisonIcon({ type }: { type: string }) {
  const icons: Record<string, { icon: any; className: string }> = {
    increase: {
      icon: TrendingUp,
      className: 'text-green-600'
    },
    decrease: {
      icon: TrendingDown,
      className: 'text-red-600'
    },
    stable: {
      icon: Minus,
      className: 'text-gray-600'
    },
    new: {
      icon: Sparkles,
      className: 'text-blue-600'
    },
    milestone: {
      icon: Award,
      className: 'text-purple-600'
    }
  }

  const config = icons[type] || icons.stable
  const Icon = config.icon

  return <Icon className={cn('w-5 h-5', config.className)} />
}

// Compact statistics summary for sidebars
export function StatisticsSummary({
  statistics,
  className
}: {
  statistics: ReportStatistic[]
  className?: string
}) {
  const keyMetrics = statistics.filter(s => s.is_key_metric)

  if (keyMetrics.length === 0) return null

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Key Metrics</h3>
      {keyMetrics.map((stat) => (
        <div key={stat.id} className="border-l-3 border-blue-600 pl-3">
          <div className="text-2xl font-bold text-blue-600">{stat.stat_value}</div>
          <div className="text-sm text-gray-700">{stat.stat_label}</div>
        </div>
      ))}
    </div>
  )
}
