'use client'

import { StoryCardGrid } from './StoryCardGrid'
import { ServiceInfoCard } from './ServiceInfoCard'
import { TimelineDisplay } from './TimelineDisplay'
import { QuoteCarousel } from './QuoteCarousel'
import { PhotoGalleryInline } from './PhotoGalleryInline'
import { KnowledgeGraphMini } from './KnowledgeGraphMini'
import { VisionConfirmation } from './VisionConfirmation'

interface ToolResultRendererProps {
  toolName: string
  result: unknown
  darkMode?: boolean
}

export function ToolResultRenderer({ toolName, result, darkMode = false }: ToolResultRendererProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = result as any

  switch (toolName) {
    case 'searchStories':
      return <StoryCardGrid stories={data.stories as StoryCardData[]} darkMode={darkMode} />

    case 'getServiceInfo':
      if (!data.found) return <EmptyResult message="Service not found. Try a different name." darkMode={darkMode} />
      return <ServiceInfoCard data={data as ServiceData} darkMode={darkMode} />

    case 'exploreTimeline':
      return <TimelineDisplay events={data.events as TimelineEvent[]} dateRange={data.dateRange as { from: string; to: string }} darkMode={darkMode} />

    case 'findQuotes':
      return <QuoteCarousel quotes={data.quotes as QuoteData[]} darkMode={darkMode} />

    case 'getPhotoGallery':
      return <PhotoGalleryInline photos={data.photos as PhotoData[]} />

    case 'exploreKnowledgeGraph':
      return <KnowledgeGraphMini data={data as GraphData} darkMode={darkMode} />

    case 'submitCommunityVision':
      return <VisionConfirmation data={data as VisionData} darkMode={darkMode} />

    default:
      return null
  }
}

function EmptyResult({ message, darkMode }: { message: string; darkMode?: boolean }) {
  return (
    <div className={`my-4 rounded-2xl p-6 text-center text-sm ${
      darkMode ? 'bg-white/[0.04] text-white/40 border border-white/[0.06]' : 'bg-gray-50 text-gray-500'
    }`}>
      {message}
    </div>
  )
}

// ─── Shared Types ────────────────────────────────────────────────────────────

export interface StoryCardData {
  id: string
  title: string
  excerpt: string
  category: string
  tags: string[] | null
  storyDate: string | null
  publishedAt: string | null
  location: string | null
  heroImage: string | null
  heroAlt: string
}

export interface ServiceData {
  found: boolean
  service: {
    name: string
    slug: string
    description: string | null
    category: string | null
  }
  metrics: {
    fiscal_year: string
    clients_served: number | null
    sessions_delivered: number | null
    events_held: number | null
    staff_count: number | null
    key_achievement: string | null
    headline_stat_value: string | null
    headline_stat_label: string | null
  } | null
  achievements: Array<{
    achievement_text: string
    category: string
    fiscal_year: string
  }>
}

export interface TimelineEvent {
  id: string
  achievement_text: string
  category: string
  fiscal_year: string
}

export interface QuoteData {
  id: string
  text: string
  themes: string[] | null
  impactScore: number | null
  isFeatured: boolean
  storyTitle: string | null
  storyId: string | null
}

export interface PhotoData {
  id: string
  url: string
  alt: string | null
  caption: string | null
}

export interface GraphData {
  nodes: Array<{
    id: string
    label: string
    type: string
    group: number
    size?: number
  }>
  edges: Array<{
    source: string
    target: string
    relationship: string
    weight: number
  }>
  centeredOn: string | null
  stats: { totalNodes: number; totalEdges: number }
}

export interface VisionData {
  success: boolean
  id?: string
  category?: string
  totalVisions?: number
  message?: string
  error?: string
}
