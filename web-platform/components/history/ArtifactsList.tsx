'use client'

import { useState } from 'react'
import type { HistoricalArtifact } from '@/lib/history/get-artifacts'
import { ChevronDown, ChevronUp, ExternalLink, Newspaper, BookOpen, Camera, Map, FileText, Scale } from 'lucide-react'

const ARTIFACT_ICONS: Record<string, typeof Newspaper> = {
  newspaper: Newspaper,
  book_excerpt: BookOpen,
  photograph: Camera,
  map: Map,
  government_record: FileText,
  court_record: Scale,
  oral_history: BookOpen,
}

function ArtifactTypeIcon({ type }: { type: string }) {
  const Icon = ARTIFACT_ICONS[type] || FileText
  return <Icon className="w-4 h-4 flex-shrink-0" />
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

interface ArtifactsListProps {
  artifacts: HistoricalArtifact[]
  title?: string
  /** Whether to start expanded or collapsed */
  defaultExpanded?: boolean
  /** Max items to show before "show more" */
  initialCount?: number
  /** Dark mode for dark background sections */
  dark?: boolean
}

export default function ArtifactsList({
  artifacts,
  title = 'Historical Sources',
  defaultExpanded = false,
  initialCount = 3,
  dark = false,
}: ArtifactsListProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [showAll, setShowAll] = useState(false)

  if (artifacts.length === 0) return null

  const displayArtifacts = showAll ? artifacts : artifacts.slice(0, initialCount)
  const hasMore = artifacts.length > initialCount

  const textColor = dark ? 'text-stone-300' : 'text-gray-600'
  const titleColor = dark ? 'text-stone-200' : 'text-gray-900'
  const borderColor = dark ? 'border-stone-700' : 'border-stone-200'
  const bgColor = dark ? 'bg-stone-800/50' : 'bg-stone-50'
  const hoverBg = dark ? 'hover:bg-stone-700/50' : 'hover:bg-stone-100'
  const linkColor = dark ? 'text-picc-ochre/80 hover:text-picc-ochre' : 'text-picc-ochre hover:text-picc-ochre/80'

  return (
    <div className={`mt-8 border-t ${borderColor} pt-4`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 text-sm font-semibold ${titleColor} ${hoverBg} rounded-lg px-3 py-2 -ml-3 transition-colors`}
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {title} ({artifacts.length})
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {displayArtifacts.map((artifact) => (
            <div
              key={artifact.id}
              className={`${bgColor} rounded-lg p-3 border ${borderColor}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${textColor}`}>
                  <ArtifactTypeIcon type={artifact.artifact_type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-medium ${titleColor} leading-snug`}>
                      {artifact.title}
                    </h4>
                    {artifact.source_url && (
                      <a
                        href={artifact.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-shrink-0 ${linkColor} transition-colors`}
                        title="View source"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 mt-1 text-xs ${textColor}`}>
                    {artifact.date_original && (
                      <span>{formatDate(artifact.date_original)}</span>
                    )}
                    {artifact.date_original && artifact.source_name && (
                      <span className="opacity-50">|</span>
                    )}
                    {artifact.source_name && <span>{artifact.source_name}</span>}
                  </div>
                  {artifact.content_summary && (
                    <p className={`text-xs ${textColor} mt-1.5 line-clamp-2`}>
                      {artifact.content_summary}
                    </p>
                  )}
                </div>
                {artifact.image_url && (
                  <img
                    src={artifact.image_url}
                    alt={artifact.title}
                    className="w-16 h-16 object-cover rounded flex-shrink-0"
                  />
                )}
              </div>
            </div>
          ))}

          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className={`text-xs ${linkColor} font-medium px-3 py-1.5 transition-colors`}
            >
              Show {artifacts.length - initialCount} more sources
            </button>
          )}
        </div>
      )}
    </div>
  )
}
