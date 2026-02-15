'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, MapPin, Calendar } from 'lucide-react'
import type { StoryCardData } from './ToolResultRenderer'

interface StoryCardGridProps {
  stories: StoryCardData[]
  darkMode?: boolean
}

export function StoryCardGrid({ stories, darkMode = false }: StoryCardGridProps) {
  if (!stories || stories.length === 0) {
    return (
      <div className={`my-4 rounded-2xl p-6 text-center text-sm ${
        darkMode ? 'bg-white/[0.04] text-white/40' : 'bg-gray-50 text-gray-500'
      }`}>
        No stories found for this topic. Try a broader search.
      </div>
    )
  }

  const columns = stories.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={`my-2 grid ${columns} gap-3`}>
      {stories.map(story => (
        <Link
          key={story.id}
          href={`/stories/${story.id}`}
          className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${
            darkMode
              ? 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]'
              : 'bg-white border border-gray-100 hover:shadow-lg'
          }`}
        >
          {/* Hero Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {story.heroImage ? (
              <Image
                src={story.heroImage}
                alt={story.heroAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${
                darkMode
                  ? 'bg-gradient-to-br from-picc-ochre/10 to-picc-red/5'
                  : 'bg-gradient-to-br from-warm-100 to-warm-200'
              }`}>
                <BookOpen className={`w-8 h-8 ${darkMode ? 'text-white/10' : 'text-warm-400'}`} />
              </div>
            )}
            {story.category && (
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium capitalize backdrop-blur-sm ${
                darkMode ? 'bg-black/40 text-white/80' : 'bg-white/90 text-gray-700'
              }`}>
                {story.category.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className={`font-semibold text-sm leading-snug line-clamp-2 transition-colors ${
              darkMode ? 'text-white/90 group-hover:text-picc-ochre-300' : 'text-gray-900 group-hover:text-warm-700'
            }`}>
              {story.title}
            </h3>
            {story.excerpt && (
              <p className={`mt-1.5 text-xs line-clamp-2 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                {story.excerpt}
              </p>
            )}
            <div className={`mt-3 flex items-center gap-3 text-xs ${darkMode ? 'text-white/25' : 'text-gray-400'}`}>
              {story.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {story.location}
                </span>
              )}
              {story.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(story.publishedAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
