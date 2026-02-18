'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
} from 'lucide-react'
import type { DataGap } from '@/lib/data-enrichment/generate-questions'
import { formatGapsAsText } from '@/lib/data-enrichment/generate-questions'

type PriorityFilter = 'all' | 'high' | 'medium' | 'low'
type EntityFilter = 'all' | 'service' | 'report'

function PriorityBadge({ priority }: { priority: DataGap['priority'] }) {
  const styles = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-gray-100 text-gray-600',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[priority]}`}
    >
      {priority}
    </span>
  )
}

function SummaryCard({
  title,
  count,
  icon,
  colorClass,
  items,
}: {
  title: string
  count: number
  icon: React.ReactNode
  colorClass: string
  items: DataGap[]
}) {
  const [expanded, setExpanded] = useState(false)
  const uniqueEntities = Array.from(new Set(items.map((i) => i.entityName)))

  return (
    <div className={`rounded-xl border p-5 ${colorClass}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <span className="text-2xl font-bold">{count}</span>
      </div>
      {items.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-2"
          >
            {expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            {uniqueEntities.length} entities affected
          </button>
          {expanded && (
            <ul className="mt-2 space-y-1">
              {uniqueEntities.map((name) => (
                <li key={name} className="text-xs text-gray-600">
                  {name} ({items.filter((i) => i.entityName === name).length}{' '}
                  gaps)
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

function EntityGroup({
  entityName,
  entityType,
  entitySlug,
  gaps,
}: {
  entityName: string
  entityType: 'service' | 'report'
  entitySlug?: string
  gaps: DataGap[]
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm">
              {entityName}
            </h3>
            <span className="text-xs text-gray-500">
              {entityType === 'service' ? 'Service' : 'Report Section'} --{' '}
              {gaps.length} gap{gaps.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {entityType === 'service' && entitySlug && (
          <Link
            href={`/picc/services/${entitySlug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            View service
          </Link>
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-5 py-2 font-medium">Field</th>
                <th className="px-5 py-2 font-medium">Question</th>
                <th className="px-5 py-2 font-medium">Priority</th>
                <th className="px-5 py-2 font-medium">Assign To</th>
              </tr>
            </thead>
            <tbody>
              {gaps.map((gap) => (
                <tr
                  key={`${gap.entityName}-${gap.field}`}
                  className="border-b border-gray-50 last:border-b-0"
                >
                  <td className="px-5 py-3 text-xs text-gray-600 font-medium">
                    {gap.field}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-800">
                    {gap.question}
                  </td>
                  <td className="px-5 py-3">
                    <PriorityBadge priority={gap.priority} />
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {gap.assignTo ?? '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CopyQuestionsButton({ gaps }: { gaps: DataGap[] }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const text = formatGapsAsText(gaps, 'high')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copy High-Priority Questions
        </>
      )}
    </button>
  )
}

export default function DataEnrichmentClient({
  gaps,
  generatedAt,
}: {
  gaps: DataGap[]
  generatedAt: string
}) {
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('all')

  const filteredGaps = useMemo(() => {
    return gaps.filter((gap) => {
      if (priorityFilter !== 'all' && gap.priority !== priorityFilter)
        return false
      if (entityFilter !== 'all' && gap.entityType !== entityFilter)
        return false
      return true
    })
  }, [gaps, priorityFilter, entityFilter])

  // Group filtered gaps by entity
  const groupedGaps = useMemo(() => {
    const groups: Map<
      string,
      {
        entityName: string
        entityType: 'service' | 'report'
        entitySlug?: string
        gaps: DataGap[]
      }
    > = new Map()

    for (const gap of filteredGaps) {
      const key = `${gap.entityType}:${gap.entityName}`
      if (!groups.has(key)) {
        groups.set(key, {
          entityName: gap.entityName,
          entityType: gap.entityType,
          entitySlug: gap.entitySlug,
          gaps: [],
        })
      }
      groups.get(key)!.gaps.push(gap)
    }

    return Array.from(groups.values())
  }, [filteredGaps])

  // Counts
  const highCount = gaps.filter((g) => g.priority === 'high').length
  const mediumCount = gaps.filter((g) => g.priority === 'medium').length
  const lowCount = gaps.filter((g) => g.priority === 'low').length
  const servicesWithGaps = new Set(
    gaps.filter((g) => g.entityType === 'service').map((g) => g.entityName)
  ).size

  const formattedTime = new Date(generatedAt).toLocaleString('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Australia/Brisbane',
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Data Enrichment
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Identify gaps and generate questions for staff to fill missing data.
          Generated {formattedTime}.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span>
            <strong>{gaps.length}</strong> total gaps
          </span>
          <span className="text-gray-300">|</span>
          <span>
            <strong className="text-red-600">{highCount}</strong> high priority
          </span>
          <span className="text-gray-300">|</span>
          <span>
            <strong>{servicesWithGaps}</strong> services need attention
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          title="High Priority"
          count={highCount}
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          colorClass="bg-red-50 border-red-200"
          items={gaps.filter((g) => g.priority === 'high')}
        />
        <SummaryCard
          title="Medium Priority"
          count={mediumCount}
          icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
          colorClass="bg-amber-50 border-amber-200"
          items={gaps.filter((g) => g.priority === 'medium')}
        />
        <SummaryCard
          title="Low Priority"
          count={lowCount}
          icon={<Info className="w-5 h-5 text-gray-400" />}
          colorClass="bg-gray-50 border-gray-200"
          items={gaps.filter((g) => g.priority === 'low')}
        />
      </div>

      {/* Filters + Copy */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />

          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as PriorityFilter)
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 bg-white"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) =>
              setEntityFilter(e.target.value as EntityFilter)
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 bg-white"
          >
            <option value="all">All Types</option>
            <option value="service">Services</option>
            <option value="report">Report Sections</option>
          </select>

          {(priorityFilter !== 'all' || entityFilter !== 'all') && (
            <button
              onClick={() => {
                setPriorityFilter('all')
                setEntityFilter('all')
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>

        <CopyQuestionsButton gaps={gaps} />
      </div>

      {/* Showing count */}
      <p className="text-xs text-gray-400 mb-4">
        Showing {filteredGaps.length} of {gaps.length} gaps
      </p>

      {/* Grouped Questions */}
      <div className="space-y-4">
        {groupedGaps.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-700">
              No gaps found for the selected filters.
            </p>
          </div>
        ) : (
          groupedGaps.map((group) => (
            <EntityGroup
              key={`${group.entityType}:${group.entityName}`}
              entityName={group.entityName}
              entityType={group.entityType}
              entitySlug={group.entitySlug}
              gaps={group.gaps}
            />
          ))
        )}
      </div>
    </div>
  )
}
