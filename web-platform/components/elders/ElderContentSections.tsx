'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import {
  Quote,
  BookOpen,
  Mic,
  Camera,
  Video,
  Users,
  Calendar,
  MapPin,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import QuoteCard, { type QuoteData } from './QuoteCard'
import StoryCard, { type StoryData } from './StoryCard'

/**
 * Extensible content section system for elder profiles.
 *
 * To add a new content type:
 * 1. Add the data to ElderContentData interface
 * 2. Create a section component below
 * 3. Register it in the CONTENT_SECTIONS array
 *
 * This makes it easy to add interviews, projects, media, etc.
 */

// Data types for different content sections
export interface ElderContentData {
  quotes?: QuoteData[]
  stories?: StoryData[]
  interviews?: InterviewData[]
  mediaGalleries?: MediaGalleryData[]
  projects?: ProjectData[]
  events?: EventData[]
  connections?: ConnectionData[]
}

export interface InterviewData {
  id: string
  title: string
  date?: string | null
  duration?: number | null
  status?: string
  href: string
}

export interface MediaGalleryData {
  id: string
  name: string
  imageCount: number
  coverUrl?: string | null
  href: string
}

export interface ProjectData {
  id: string
  name: string
  role?: string | null
  href: string
}

export interface EventData {
  id: string
  title: string
  date: string
  location?: string | null
  href?: string
}

export interface ConnectionData {
  id: string
  name: string
  relationship?: string | null
  imageUrl?: string | null
  href: string
}

// Content section configuration
interface ContentSectionConfig<T> {
  id: string
  title: string
  icon: ReactNode
  emptyMessage: string
  getData: (data: ElderContentData) => T[] | undefined
  render: (items: T[], elderName: string) => ReactNode
  adminLink?: { href: string; label: string }
}

// Section components
function QuotesSection({ quotes }: { quotes: QuoteData[] }) {
  if (quotes.length === 0) return null
  return (
    <div className="space-y-3">
      {quotes.slice(0, 5).map((q) => (
        <QuoteCard key={q.id} quote={q} showTheme />
      ))}
    </div>
  )
}

function StoriesSection({ stories }: { stories: StoryData[] }) {
  if (stories.length === 0) return null
  return (
    <div className="space-y-3">
      {stories.slice(0, 6).map((s) => (
        <StoryCard key={s.id} story={s} />
      ))}
    </div>
  )
}

function InterviewsSection({ interviews }: { interviews: InterviewData[] }) {
  if (interviews.length === 0) return null
  return (
    <div className="space-y-3">
      {interviews.slice(0, 5).map((i) => (
        <Link
          key={i.id}
          href={i.href}
          className="flex items-center gap-4 p-4 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-gray-900 truncate">{i.title}</div>
            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
              {i.date && <span>{new Date(i.date).toLocaleDateString('en-AU')}</span>}
              {i.duration && <span>{i.duration} min</span>}
              {i.status && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  i.status === 'approved' ? 'bg-green-100 text-green-700' :
                  i.status === 'edited' ? 'bg-purple-100 text-purple-700' :
                  'bg-stone-100 text-stone-700'
                }`}>
                  {i.status}
                </span>
              )}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </Link>
      ))}
    </div>
  )
}

function MediaGalleriesSection({ galleries }: { galleries: MediaGalleryData[] }) {
  if (galleries.length === 0) return null
  return (
    <div className="grid grid-cols-2 gap-3">
      {galleries.slice(0, 4).map((g) => (
        <Link
          key={g.id}
          href={g.href}
          className="group rounded-2xl border border-stone-200 bg-white hover:border-stone-300 overflow-hidden transition-all"
        >
          <div className="aspect-video bg-stone-100 overflow-hidden">
            {g.coverUrl ? (
              <img
                src={g.coverUrl}
                alt={g.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                <Camera className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="p-3">
            <div className="font-medium text-gray-900 truncate">{g.name}</div>
            <div className="text-sm text-gray-600">{g.imageCount} photos</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function ProjectsSection({ projects }: { projects: ProjectData[] }) {
  if (projects.length === 0) return null
  return (
    <div className="space-y-2">
      {projects.slice(0, 6).map((p) => (
        <Link
          key={p.id}
          href={p.href}
          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors"
        >
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">{p.name}</div>
            {p.role && <div className="text-sm text-gray-600">{p.role}</div>}
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </Link>
      ))}
    </div>
  )
}

function EventsSection({ events }: { events: EventData[] }) {
  if (events.length === 0) return null
  return (
    <div className="space-y-2">
      {events.slice(0, 5).map((e) => (
        <div
          key={e.id}
          className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 bg-white"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900">{e.title}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <span>{new Date(e.date).toLocaleDateString('en-AU')}</span>
              {e.location && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {e.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ConnectionsSection({ connections }: { connections: ConnectionData[] }) {
  if (connections.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {connections.slice(0, 8).map((c) => (
        <Link
          key={c.id}
          href={c.href}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-colors"
        >
          {c.imageUrl ? (
            <img src={c.imageUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-amber-400 flex items-center justify-center text-white text-xs font-bold">
              {c.name[0]}
            </div>
          )}
          <span className="font-medium text-gray-900">{c.name}</span>
          {c.relationship && (
            <span className="text-xs text-gray-500">({c.relationship})</span>
          )}
        </Link>
      ))}
    </div>
  )
}

// Content section registry
// Add new sections here to extend elder profiles
export const CONTENT_SECTIONS: ContentSectionConfig<any>[] = [
  {
    id: 'quotes',
    title: 'Quotes',
    icon: <Quote className="w-5 h-5" />,
    emptyMessage: 'No validated quotes found yet for this Elder.',
    getData: (data) => data.quotes,
    render: (items) => <QuotesSection quotes={items} />,
    adminLink: { href: '/picc/quotes/library', label: 'Quote Library' },
  },
  {
    id: 'stories',
    title: 'Stories to Read',
    icon: <BookOpen className="w-5 h-5" />,
    emptyMessage: 'No public stories linked to this Elder yet.',
    getData: (data) => data.stories,
    render: (items) => <StoriesSection stories={items} />,
  },
  {
    id: 'interviews',
    title: 'Interviews',
    icon: <Mic className="w-5 h-5" />,
    emptyMessage: 'No interviews recorded yet.',
    getData: (data) => data.interviews,
    render: (items) => <InterviewsSection interviews={items} />,
  },
  {
    id: 'mediaGalleries',
    title: 'Photo Galleries',
    icon: <Camera className="w-5 h-5" />,
    emptyMessage: 'No photo galleries yet.',
    getData: (data) => data.mediaGalleries,
    render: (items) => <MediaGalleriesSection galleries={items} />,
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: <Video className="w-5 h-5" />,
    emptyMessage: 'Not linked to any projects.',
    getData: (data) => data.projects,
    render: (items) => <ProjectsSection projects={items} />,
  },
  {
    id: 'events',
    title: 'Events',
    icon: <Calendar className="w-5 h-5" />,
    emptyMessage: 'No events recorded.',
    getData: (data) => data.events,
    render: (items) => <EventsSection events={items} />,
  },
  {
    id: 'connections',
    title: 'Connections',
    icon: <Users className="w-5 h-5" />,
    emptyMessage: 'No connections recorded.',
    getData: (data) => data.connections,
    render: (items) => <ConnectionsSection connections={items} />,
  },
]

// Main component to render all content sections
interface ElderContentProps {
  elderName: string
  data: ElderContentData
  sections?: string[] // Optional filter for which sections to show
  layout?: 'single' | 'two-column'
}

export function ElderContentRenderer({
  elderName,
  data,
  sections,
  layout = 'single',
}: ElderContentProps) {
  const activeSections = sections
    ? CONTENT_SECTIONS.filter((s) => sections.includes(s.id))
    : CONTENT_SECTIONS

  // Only show sections that have data
  const sectionsWithData = activeSections.filter((section) => {
    const items = section.getData(data)
    return items && items.length > 0
  })

  if (sectionsWithData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No content available yet.</p>
      </div>
    )
  }

  if (layout === 'two-column') {
    const midpoint = Math.ceil(sectionsWithData.length / 2)
    const leftSections = sectionsWithData.slice(0, midpoint)
    const rightSections = sectionsWithData.slice(midpoint)

    return (
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-8">
          {leftSections.map((section) => (
            <ContentSection
              key={section.id}
              section={section}
              data={data}
              elderName={elderName}
            />
          ))}
        </div>
        <div className="space-y-8">
          {rightSections.map((section) => (
            <ContentSection
              key={section.id}
              section={section}
              data={data}
              elderName={elderName}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sectionsWithData.map((section) => (
        <ContentSection
          key={section.id}
          section={section}
          data={data}
          elderName={elderName}
        />
      ))}
    </div>
  )
}

function ContentSection({
  section,
  data,
  elderName,
}: {
  section: ContentSectionConfig<any>
  data: ElderContentData
  elderName: string
}) {
  const items = section.getData(data) || []

  return (
    <div>
      <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
        <span className="text-purple-600">{section.icon}</span>
        {section.title}
        {items.length > 0 && (
          <span className="text-sm font-normal text-gray-500">({items.length})</span>
        )}
      </h4>
      {items.length === 0 ? (
        <p className="text-gray-600">{section.emptyMessage}</p>
      ) : (
        section.render(items, elderName)
      )}
    </div>
  )
}

// Export section IDs for easy reference
export const SECTION_IDS = CONTENT_SECTIONS.map((s) => s.id)
