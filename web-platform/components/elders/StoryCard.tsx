'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Calendar, Clock } from 'lucide-react'

export type StoryData = {
  id: string
  title: string
  summary?: string | null
  createdAt?: string
  href: string
  readTime?: number
  coverImage?: string | null
}

type StoryCardProps = {
  story: StoryData
  variant?: 'default' | 'compact' | 'featured'
  showDate?: boolean
  showReadTime?: boolean
  className?: string
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

/**
 * Reusable story card component for displaying story links.
 *
 * Variants:
 * - default: Card with title, summary, and arrow
 * - compact: Minimal inline link
 * - featured: Large card with cover image
 */
export default function StoryCard({
  story,
  variant = 'default',
  showDate = false,
  showReadTime = false,
  className = '',
}: StoryCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={story.href}
        className={`inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium transition-colors ${className}`}
      >
        <BookOpen className="w-4 h-4" />
        <span className="truncate">{story.title}</span>
        <ArrowRight className="w-3 h-3" />
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link
        href={story.href}
        className={`group block rounded-2xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-md transition-all overflow-hidden ${className}`}
      >
        {story.coverImage && (
          <div className="aspect-video bg-stone-100 overflow-hidden">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-6">
          <h4 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
            {story.title}
          </h4>
          {story.summary && (
            <p className="mt-2 text-gray-700 line-clamp-3">{story.summary}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            {showDate && story.createdAt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(story.createdAt)}
              </span>
            )}
            {showReadTime && story.readTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {story.readTime} min read
              </span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link
      href={story.href}
      className={`block rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors p-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-bold text-gray-900">{story.title}</h4>
          {story.summary && (
            <p className="mt-1 text-sm text-gray-700 line-clamp-2">{story.summary}</p>
          )}
          {showDate && story.createdAt && (
            <p className="mt-2 text-xs text-gray-500">{formatDate(story.createdAt)}</p>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
      </div>
    </Link>
  )
}

/**
 * Story list with count and "view all" link
 */
type StoryListProps = {
  stories: StoryData[]
  maxDisplay?: number
  viewAllHref?: string
  viewAllLabel?: string
  emptyMessage?: string
}

export function StoryList({
  stories,
  maxDisplay = 6,
  viewAllHref,
  viewAllLabel = 'View all stories',
  emptyMessage = 'No stories yet.',
}: StoryListProps) {
  if (stories.length === 0) {
    return <p className="text-gray-600">{emptyMessage}</p>
  }

  const displayStories = stories.slice(0, maxDisplay)
  const remaining = stories.length - maxDisplay

  return (
    <div>
      <div className="space-y-3">
        {displayStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
      {remaining > 0 && viewAllHref && (
        <div className="mt-4">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium"
          >
            {viewAllLabel} ({remaining} more) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
