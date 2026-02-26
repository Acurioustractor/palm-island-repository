'use client'

import { useState } from 'react'
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
      if (!data.found) return <ServiceSuggestions suggestions={data.suggestions || []} darkMode={darkMode} />
      return <ServiceInfoCard data={data as ServiceData} darkMode={darkMode} />

    case 'exploreTimeline':
      return <TimelineDisplay events={data.events as TimelineEvent[]} dateRange={data.dateRange as { from: string; to: string }} darkMode={darkMode} />

    case 'findQuotes':
      return <QuoteCarousel quotes={data.quotes as QuoteData[]} darkMode={darkMode} />

    case 'getPhotoGallery':
      if (!data.photos?.length) return null
      return <PhotoGalleryInline photos={data.photos as PhotoData[]} />

    case 'exploreKnowledgeGraph':
      return <KnowledgeGraphMini data={data as GraphData} darkMode={darkMode} />

    case 'submitCommunityVision':
      return <VisionConfirmation data={data as VisionData} darkMode={darkMode} />

    case 'getFinancialSummary':
      if (data.financials?.length > 0) return <FinancialSummaryCard data={data} darkMode={darkMode} />
      return null

    case 'getServiceMetrics':
      if (data.annualMetrics?.length > 0 || data.trends) return <ServiceMetricsCard data={data} darkMode={darkMode} />
      return null

    case 'getContentReadiness':
      if (data.services || data.reportSections) return <ContentReadinessCard data={data} darkMode={darkMode} />
      return null

    case 'suggestDataEnrichment':
      if (data.serviceGaps?.length > 0 || data.reportGaps?.length > 0) return <DataEnrichmentCard data={data} darkMode={darkMode} />
      return null

    case 'submitServiceUpdate':
      return <ConfirmationCard data={data} darkMode={darkMode} />

    case 'submitMeetingNote':
      return <ConfirmationCard data={data} darkMode={darkMode} />

    case 'getBoardAndLeadership':
      if (data.board?.length > 0 || data.leadership?.length > 0) return <BoardAndLeadershipCard data={data} darkMode={darkMode} />
      return null

    case 'getInterview':
      if (data.found === false && data.interviews) return <InterviewListCard data={data} darkMode={darkMode} />
      if (data.found) return <InterviewDetailCard data={data} darkMode={darkMode} />
      if (data.interviews?.length > 0) return <InterviewListCard data={data} darkMode={darkMode} />
      return null

    case 'getPhotoCollections':
      if (data.found) return <PhotoCollectionDetail data={data} darkMode={darkMode} />
      if (data.collections?.length > 0) return <PhotoCollectionList data={data} darkMode={darkMode} />
      return null

    case 'getAnnualReportArchive':
      if (data.reports?.length > 0) return <AnnualReportArchiveCard data={data} darkMode={darkMode} />
      return null

    case 'getPublications':
      if (data.publications?.length > 0) return <PublicationsCard data={data} darkMode={darkMode} />
      return null

    case 'getDeepHistory':
      if (data.events?.length > 0 || data.eras?.length > 0) return <DeepHistoryCard data={data} darkMode={darkMode} />
      return null

    case 'getImpactIndicators':
      if (data.indicators?.length > 0) return <ImpactIndicatorsCard data={data} darkMode={darkMode} />
      return null

    case 'getImmersiveStories':
      if (data.found) return <ImmersiveStoryDetail data={data} darkMode={darkMode} />
      if (data.stories?.length > 0) return <ImmersiveStoryList data={data} darkMode={darkMode} />
      return null

    case 'getGrantsAndPartnerships':
      if (data.partners?.length > 0 || data.grants?.length > 0) return <GrantsAndPartnershipsCard data={data} darkMode={darkMode} />
      return null

    case 'getInnovationProjects':
      if (data.project) return <ProjectDetail data={data} darkMode={darkMode} />
      if (data.projects?.length > 0) return <ProjectList projects={data.projects} darkMode={darkMode} />
      return null

    case 'getCommunityVisions':
      if (data.visions?.length > 0 || data.elderVoices?.length > 0) return <CommunityVisionsDisplay data={data} darkMode={darkMode} />
      return null

    case 'escalateToHuman':
      if (data.escalated) return <EscalationCard data={data} darkMode={darkMode} />
      return null

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

function ServiceSuggestions({ suggestions, darkMode }: { suggestions: Array<{ name: string; slug: string; description: string | null; category: string | null }>; darkMode?: boolean }) {
  // Group by category
  const grouped = new Map<string, typeof suggestions>()
  for (const s of suggestions) {
    const cat = s.category || 'other'
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(s)
  }

  const categoryLabels: Record<string, string> = {
    health: 'Health',
    family: 'Family',
    justice: 'Justice',
    youth: 'Youth',
    community: 'Community',
    economic: 'Economic Development',
    culture: 'Culture',
    housing: 'Housing',
    disability: 'Disability',
    wellbeing: 'Wellbeing',
    education: 'Education',
    other: 'Other',
  }

  return (
    <div className={`my-4 rounded-2xl overflow-hidden border ${
      darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'
    }`}>
      <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${
        darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'
      }`}>
        Our Services ({suggestions.length})
      </div>
      <div className="px-5 py-3 space-y-4 max-h-[400px] overflow-y-auto">
        {Array.from(grouped.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, services]) => (
          <div key={category}>
            <div className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${
              darkMode ? 'text-white/40' : 'text-gray-400'
            }`}>
              {categoryLabels[category] || category}
            </div>
            <div className="space-y-1">
              {services.map((s) => (
                <a
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`block rounded-lg px-3 py-2 transition-colors ${
                    darkMode
                      ? 'hover:bg-white/[0.06] text-white/80'
                      : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <span className="font-medium text-sm">{s.name}</span>
                  {s.description && (
                    <span className={`block text-xs mt-0.5 line-clamp-1 ${
                      darkMode ? 'text-white/40' : 'text-gray-500'
                    }`}>
                      {s.description}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
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
  speakerName: string | null
  speakerImage: string | null
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

// ─── Project Components ─────────────────────────────────────────────────────

function ProjectDetail({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const p = data.project
  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      {p.heroImage && (
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img src={p.heroImage} alt={p.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-lg">{p.name}</h3>
            {p.tagline && <p className="text-white/80 text-sm mt-1">{p.tagline}</p>}
          </div>
        </div>
      )}
      {!p.heroImage && (
        <div className={`px-5 py-4 ${darkMode ? 'bg-white/[0.04]' : 'bg-warm-50'}`}>
          <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
          {p.tagline && <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{p.tagline}</p>}
        </div>
      )}
      <div className="px-5 py-4 space-y-3">
        {p.status && (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
            p.status === 'in_progress' ? 'bg-green-100 text-green-800' :
            p.status === 'planning' ? 'bg-amber-100 text-amber-800' :
            'bg-gray-100 text-gray-600'
          }`}>
            {p.status === 'in_progress' ? 'In Progress' : p.status}
          </span>
        )}
        {(p.targetBeneficiaries || p.budget) && (
          <div className="flex gap-4 text-sm">
            {p.targetBeneficiaries && <span className={darkMode ? 'text-white/60' : 'text-gray-500'}>Target: {p.targetBeneficiaries} beneficiaries</span>}
            {p.budget && <span className={darkMode ? 'text-white/60' : 'text-gray-500'}>Budget: {p.budget}</span>}
          </div>
        )}
      </div>
      {data.videos?.length > 0 && (() => {
        // Sort: embeddable videos (Descript/YouTube/Vimeo) first, then .mp4s
        const isEmbeddable = (url: string) => /youtube|youtu\.be|vimeo\.com|descript\.com/.test(url)
        const sorted = [...data.videos].sort((a: any, b: any) => {
          const aEmbed = isEmbeddable(a.url) ? 0 : 1
          const bEmbed = isEmbeddable(b.url) ? 0 : 1
          return aEmbed - bEmbed
        })
        return (
          <div className="px-5 pb-4">
            <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
              Videos ({data.videos.length})
            </div>
            <div className="space-y-3">
              {sorted.map((v: any, i: number) => (
                <InlineVideo key={i} url={v.url} title={v.title || `Video ${i + 1}`} darkMode={darkMode} />
              ))}
            </div>
          </div>
        )
      })()}
      {data.photos?.length > 0 && (
        <div className="px-5 pb-4">
          <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
            Photos ({data.photos.length})
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {data.photos.slice(0, 8).map((photo: any, i: number) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden">
                <img src={photo.url} alt={photo.alt || ''} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
      {data.relatedStories?.length > 0 && (
        <div className={`px-5 py-3 border-t ${darkMode ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
            Related Stories
          </div>
          {data.relatedStories.map((s: any) => (
            <a key={s.id} href={`/stories/${s.id}`} target="_blank" rel="noreferrer" className={`block text-sm py-1 transition-colors ${
              darkMode ? 'text-white/60 hover:text-picc-ochre-300' : 'text-gray-600 hover:text-picc-ochre'
            }`}>
              {s.title}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectList({ projects, darkMode }: { projects: any[]; darkMode?: boolean }) {
  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
        Innovation Projects ({projects.length})
      </div>
      <div className="divide-y divide-gray-100">
        {projects.map((p: any) => (
          <div key={p.slug} className="px-5 py-3 flex items-center gap-4">
            {p.heroImage && (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img src={p.heroImage} alt={p.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{p.name}</div>
              {p.tagline && <div className={`text-xs mt-0.5 line-clamp-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{p.tagline}</div>}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
              p.status === 'in_progress' ? 'bg-green-100 text-green-700' :
              p.status === 'planning' ? 'bg-amber-100 text-amber-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {p.status === 'in_progress' ? 'Active' : p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Inline Video Player ────────────────────────────────────────────────────

function InlineVideo({ url, title, darkMode }: { url: string; title: string; darkMode?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  // Detect YouTube/Vimeo/Descript vs direct video file
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/)
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  const descriptMatch = url.match(/share\.descript\.com\/(?:view|embed)\/([A-Za-z0-9]+)/)
  const isEmbed = !!(youtubeMatch || vimeoMatch || descriptMatch)

  const getEmbedUrl = () => {
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0`
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    if (descriptMatch) return `https://share.descript.com/embed/${descriptMatch[1]}`
    return url
  }

  if (isEmbed) {
    // Embeddable videos show inline immediately (no click to reveal)
    return (
      <div className="rounded-xl overflow-hidden">
        <div className="aspect-video">
          <iframe
            src={getEmbedUrl()}
            title={title}
            className="w-full h-full rounded-xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className={`text-xs mt-1.5 px-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
          {title}
        </div>
      </div>
    )
  }

  // Direct video file (.mp4 etc) — show native player inline
  return (
    <div className="rounded-xl overflow-hidden">
      <video
        controls
        preload="metadata"
        playsInline
        className="w-full rounded-xl"
      >
        <source src={url} type="video/mp4" />
      </video>
      <div className={`text-xs mt-1.5 px-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
        {title}
      </div>
    </div>
  )
}

// ─── Financial Summary Card ─────────────────────────────────────────────────

function FinancialSummaryCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const financials = data.financials as Array<{
    fiscal_year: string
    total_revenue?: number
    total_expenditure?: number
    surplus_deficit?: number
    total_assets?: number
  }>

  const fmt = (n: number | undefined) =>
    n != null ? `$${(n / 1000).toFixed(0)}K` : '—'

  const latest = financials[0]
  const prev = financials[1]

  const yoyChange = (current?: number, previous?: number) => {
    if (current == null || previous == null || previous === 0) return null
    return ((current - previous) / previous * 100).toFixed(1)
  }

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
        Financial Summary — {latest?.fiscal_year || 'Latest'}
      </div>
      <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Revenue', value: latest?.total_revenue, prevValue: prev?.total_revenue },
          { label: 'Expenditure', value: latest?.total_expenditure, prevValue: prev?.total_expenditure },
          { label: 'Surplus/Deficit', value: latest?.surplus_deficit, prevValue: prev?.surplus_deficit },
          { label: 'Total Assets', value: latest?.total_assets, prevValue: prev?.total_assets },
        ].map((stat) => {
          const change = yoyChange(stat.value, stat.prevValue)
          return (
            <div key={stat.label}>
              <div className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{stat.label}</div>
              <div className={`text-lg font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {fmt(stat.value)}
              </div>
              {change && (
                <div className={`text-xs mt-0.5 ${
                  parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-500'
                }`}>
                  {parseFloat(change) >= 0 ? '+' : ''}{change}% YoY
                </div>
              )}
            </div>
          )
        })}
      </div>
      {financials.length > 1 && (
        <div className={`px-5 py-3 border-t ${darkMode ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          <div className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
            Showing {financials.length} year{financials.length > 1 ? 's' : ''} of data
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Service Metrics Card ───────────────────────────────────────────────────

function ServiceMetricsCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const metrics = data.annualMetrics as Array<{
    fiscal_year: string
    clients_served?: number
    sessions_delivered?: number
    events_held?: number
    staff_count?: number
    key_achievement?: string
    headline_stat_value?: string
    headline_stat_label?: string
  }>
  const trends = data.trends as { totalClients: number; totalSessions: number; monthsCovered: number } | null
  const latest = metrics[0]

  const statItems = [
    latest?.clients_served != null && { label: 'Clients Served', value: latest.clients_served.toLocaleString() },
    latest?.sessions_delivered != null && { label: 'Sessions', value: latest.sessions_delivered.toLocaleString() },
    latest?.events_held != null && { label: 'Events', value: latest.events_held.toLocaleString() },
    latest?.staff_count != null && { label: 'Staff', value: latest.staff_count.toLocaleString() },
    latest?.headline_stat_value && { label: latest.headline_stat_label || 'Headline', value: latest.headline_stat_value },
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
        {data.service ? `${data.service} — Metrics` : 'Service Metrics'} {latest?.fiscal_year ? `(${latest.fiscal_year})` : ''}
      </div>
      {statItems.length > 0 && (
        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {statItems.map((stat) => (
            <div key={stat.label}>
              <div className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{stat.label}</div>
              <div className={`text-lg font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}
      {latest?.key_achievement && (
        <div className={`px-5 py-3 border-t ${darkMode ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>Key Achievement</div>
          <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>{latest.key_achievement}</p>
        </div>
      )}
      {trends && (
        <div className={`px-5 py-3 border-t ${darkMode ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          <div className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
            Trend: {trends.totalClients.toLocaleString()} clients, {trends.totalSessions.toLocaleString()} sessions over {trends.monthsCovered} months
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Content Readiness Card ─────────────────────────────────────────────────

function ContentReadinessCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const services = data.services as Array<{ name: string; slug: string; status: string; score: number }> | undefined
  const reportSections = data.reportSections as Array<{ section: string; status: string; details?: string }> | undefined

  const statusDot = (status: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-500',
      amber: 'bg-amber-500',
      red: 'bg-red-500',
    }
    return <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || 'bg-gray-400'}`} />
  }

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 flex items-center justify-between ${darkMode ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
        <span className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
          Content Readiness
        </span>
        {data.overallScore != null && (
          <span className={`text-sm font-bold ${
            data.overallScore >= 80 ? 'text-green-600' :
            data.overallScore >= 50 ? 'text-amber-600' : 'text-red-500'
          }`}>
            {data.overallScore}%
          </span>
        )}
      </div>
      <div className="px-5 py-3 space-y-4 max-h-[400px] overflow-y-auto">
        {services && services.length > 0 && (
          <div>
            <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>Services</div>
            <div className="space-y-1.5">
              {services.map((s) => (
                <div key={s.slug} className="flex items-center gap-2">
                  {statusDot(s.status)}
                  <span className={`text-sm flex-1 ${darkMode ? 'text-white/80' : 'text-gray-800'}`}>{s.name}</span>
                  <span className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{s.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {reportSections && reportSections.length > 0 && (
          <div>
            <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>Report Sections</div>
            <div className="space-y-1.5">
              {reportSections.map((s) => (
                <div key={s.section} className="flex items-center gap-2">
                  {statusDot(s.status)}
                  <span className={`text-sm flex-1 ${darkMode ? 'text-white/80' : 'text-gray-800'}`}>{s.section}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Data Enrichment Card ───────────────────────────────────────────────────

function DataEnrichmentCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const serviceGaps = data.serviceGaps as Array<{ service: string; slug: string; status: string; questions: string[] }>
  const reportGaps = data.reportGaps as Array<{ section: string; status: string; questions: string[] }>

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 flex items-center justify-between ${darkMode ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
        <span className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
          Data Gaps — Questions to Answer
        </span>
        {data.totalQuestions != null && (
          <span className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
            {data.totalQuestions} question{data.totalQuestions !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="px-5 py-3 space-y-4 max-h-[500px] overflow-y-auto">
        {serviceGaps.map((group) => (
          <div key={group.slug}>
            <div className={`text-sm font-medium mb-1.5 ${darkMode ? 'text-white/80' : 'text-gray-800'}`}>
              {group.service}
            </div>
            <ul className="space-y-1">
              {group.questions.map((q, i) => (
                <li key={i} className={`text-sm pl-3 border-l-2 ${
                  darkMode ? 'text-white/60 border-white/10' : 'text-gray-600 border-gray-200'
                }`}>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {reportGaps.length > 0 && (
          <>
            <div className={`text-xs font-bold uppercase tracking-wide ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>Report Sections</div>
            {reportGaps.map((group) => (
              <div key={group.section}>
                <div className={`text-sm font-medium mb-1.5 ${darkMode ? 'text-white/80' : 'text-gray-800'}`}>
                  {group.section}
                </div>
                <ul className="space-y-1">
                  {group.questions.map((q, i) => (
                    <li key={i} className={`text-sm pl-3 border-l-2 ${
                      darkMode ? 'text-white/60 border-white/10' : 'text-gray-600 border-gray-200'
                    }`}>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Confirmation Card (reusable for submit tools) ──────────────────────────

function ConfirmationCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const isSuccess = data.success === true

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${
      darkMode
        ? isSuccess ? 'bg-green-500/[0.06] border-green-500/20' : 'bg-red-500/[0.06] border-red-500/20'
        : isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }`}>
      <div className="px-5 py-4 flex items-start gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {isSuccess ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <div>
          {data.service && (
            <div className={`text-xs font-medium uppercase tracking-wide mb-0.5 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
              {data.service}
            </div>
          )}
          <p className={`text-sm ${darkMode ? 'text-white/80' : 'text-gray-800'}`}>
            {data.message || data.error || (isSuccess ? 'Saved successfully.' : 'Something went wrong.')}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Board & Leadership Card ────────────────────────────────────────────────

function BoardAndLeadershipCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const board = data.board as Array<{ name: string; role: string; bio?: string; photo_url?: string }>
  const leadership = data.leadership as Array<{ full_name: string; position: string; bio?: string; photo_url?: string; featured_quote?: string }>

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      {leadership.length > 0 && (
        <>
          <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
            Leadership Team ({leadership.length})
          </div>
          <div className="px-5 py-3 space-y-3">
            {leadership.map((l, i) => (
              <div key={i} className="flex items-start gap-3">
                {l.photo_url && (
                  <img src={l.photo_url} alt={l.full_name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{l.full_name}</div>
                  <div className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{l.position}</div>
                  {l.featured_quote && (
                    <p className={`text-xs italic mt-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>&ldquo;{l.featured_quote}&rdquo;</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {board.length > 0 && (
        <>
          <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'} ${leadership.length > 0 ? (darkMode ? 'border-t border-white/[0.06]' : 'border-t border-gray-100') : ''}`}>
            Board Members ({board.length})
          </div>
          <div className="px-5 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {board.map((b, i) => (
                <div key={i} className={`rounded-lg px-3 py-2 ${darkMode ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
                  <div className={`text-sm font-medium ${darkMode ? 'text-white/80' : 'text-gray-800'}`}>{b.name}</div>
                  <div className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{b.role}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Interview Cards ────────────────────────────────────────────────────────

function InterviewDetailCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const interview = data.interview
  const segments = data.segments as Array<{ segment_index: number; speaker: string; segment_text: string }> | undefined

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 ${darkMode ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
        <div className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{interview.interview_title}</div>
        <div className={`text-xs mt-0.5 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
          {interview.interview_date && new Date(interview.interview_date).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
          {interview.interview_location && ` · ${interview.interview_location}`}
        </div>
      </div>
      {interview.key_themes && (
        <div className="px-5 py-2 flex flex-wrap gap-1.5">
          {(Array.isArray(interview.key_themes) ? interview.key_themes : []).map((t: string, i: number) => (
            <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-white/[0.06] text-white/60' : 'bg-warm-100 text-gray-600'}`}>{t}</span>
          ))}
        </div>
      )}
      {data.note && (
        <div className={`px-5 py-2 text-xs italic ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{data.note}</div>
      )}
      {segments && segments.length > 0 && (
        <div className={`px-5 py-3 space-y-2 max-h-[400px] overflow-y-auto border-t ${darkMode ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          {segments.slice(0, 20).map((seg) => (
            <div key={seg.segment_index}>
              <span className={`text-xs font-semibold ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{seg.speaker}:</span>
              <span className={`text-sm ml-1.5 ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>{seg.segment_text}</span>
            </div>
          ))}
          {segments.length > 20 && (
            <div className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>+ {segments.length - 20} more segments</div>
          )}
        </div>
      )}
    </div>
  )
}

function InterviewListCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const interviews = data.interviews as Array<{ id: string; interview_title: string; interview_date?: string; interview_type?: string; key_themes?: string[] }>

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
        Interviews ({interviews.length})
      </div>
      <div className="divide-y divide-gray-100">
        {interviews.map((iv) => (
          <div key={iv.id} className="px-5 py-3">
            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{iv.interview_title}</div>
            <div className={`text-xs mt-0.5 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
              {iv.interview_date && new Date(iv.interview_date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short' })}
              {iv.interview_type && ` · ${iv.interview_type}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Photo Collection Cards ─────────────────────────────────────────────────

function PhotoCollectionDetail({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const collection = data.collection
  const photos = data.photos as Array<{ id: string; file_url: string; alt_text?: string; caption?: string }>

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 ${darkMode ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
        <div className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{collection.name}</div>
        {collection.description && <div className={`text-xs mt-0.5 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{collection.description}</div>}
      </div>
      {photos.length > 0 && (
        <div className="px-5 py-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.slice(0, 12).map((p) => (
              <div key={p.id} className="aspect-square rounded-lg overflow-hidden">
                <img src={p.file_url} alt={p.alt_text || ''} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PhotoCollectionList({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const collections = data.collections as Array<{ name: string; slug: string; description?: string; item_count?: number }>

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
        Photo Collections ({collections.length})
      </div>
      <div className="divide-y divide-gray-100">
        {collections.map((c) => (
          <div key={c.slug} className="px-5 py-3">
            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{c.name}</div>
            <div className={`text-xs mt-0.5 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
              {c.item_count || 0} photos{c.description && ` · ${c.description}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Annual Report Archive Card ─────────────────────────────────────────────

function AnnualReportArchiveCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const reports = data.reports as Array<{
    fiscal_year: string; title: string; subtitle?: string; theme?: string
    executive_summary?: string; pdf_url?: string; published_date?: string; status: string
  }>

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
        Annual Reports ({reports.length})
      </div>
      <div className="divide-y divide-gray-100">
        {reports.map((r) => (
          <div key={r.fiscal_year} className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{r.title || `Annual Report ${r.fiscal_year}`}</div>
                {r.theme && <div className={`text-xs mt-0.5 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Theme: {r.theme}</div>}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                r.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {r.status}
              </span>
            </div>
            {r.executive_summary && (
              <p className={`text-sm mt-2 line-clamp-2 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>{r.executive_summary}</p>
            )}
            {r.pdf_url && (
              <a href={r.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-picc-ochre hover:underline">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Download PDF
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Publications Card ──────────────────────────────────────────────────────

function PublicationsCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const pubs = data.publications as Array<{
    slug: string; title: string; subtitle?: string; description?: string
    category?: string; pdf_url?: string; author?: string; published_date?: string
  }>

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
        Publications ({pubs.length})
      </div>
      <div className="divide-y divide-gray-100">
        {pubs.map((p) => (
          <div key={p.slug} className="px-5 py-3">
            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{p.title}</div>
            {p.author && <div className={`text-xs mt-0.5 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>By {p.author}</div>}
            {p.description && <p className={`text-sm mt-1 line-clamp-2 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>{p.description}</p>}
            {p.pdf_url && (
              <a href={p.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-1.5 text-xs text-picc-ochre hover:underline">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Download PDF
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Deep History Card ──────────────────────────────────────────────────────

function DeepHistoryCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const events = data.events as Array<{ id: string; title: string; description?: string; event_date?: string; event_type?: string; is_featured?: boolean }>
  const eras = data.eras as Array<{ era_name: string; year_start: number; year_end?: number; description?: string }>

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
        History — {data.totalEvents || events.length} Events
      </div>
      {eras.length > 0 && (
        <div className="px-5 py-3 flex flex-wrap gap-2">
          {eras.map((e, i) => (
            <div key={i} className={`rounded-lg px-3 py-2 ${darkMode ? 'bg-white/[0.04]' : 'bg-warm-50'}`}>
              <div className={`text-xs font-semibold ${darkMode ? 'text-white/70' : 'text-gray-800'}`}>{e.era_name}</div>
              <div className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{e.year_start}{e.year_end ? `–${e.year_end}` : '–present'}</div>
            </div>
          ))}
        </div>
      )}
      <div className="px-5 py-3 space-y-2 max-h-[400px] overflow-y-auto">
        {events.map((ev) => (
          <div key={ev.id} className={`flex gap-3 ${ev.is_featured ? (darkMode ? 'bg-white/[0.04] rounded-lg p-2 -mx-2' : 'bg-warm-50 rounded-lg p-2 -mx-2') : ''}`}>
            <div className={`flex-shrink-0 w-1 rounded-full ${
              ev.event_type === 'milestone' ? 'bg-picc-ochre' :
              ev.event_type === 'cultural' ? 'bg-purple-400' :
              'bg-gray-300'
            }`} />
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${darkMode ? 'text-white/80' : 'text-gray-800'}`}>{ev.title}</div>
              {ev.description && <p className={`text-xs mt-0.5 line-clamp-2 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{ev.description}</p>}
              {ev.event_date && <div className={`text-xs mt-0.5 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>{new Date(ev.event_date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short' })}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Impact Indicators Card ─────────────────────────────────────────────────

function ImpactIndicatorsCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const indicators = data.indicators as Array<{
    indicator_name: string; indicator_description?: string; service_area?: string
    value_numeric?: number; value_text?: string; change_observed?: string
    significance?: string; pattern_category?: string
  }>

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
        Impact Indicators ({indicators.length})
      </div>
      <div className="px-5 py-3 space-y-3 max-h-[400px] overflow-y-auto">
        {indicators.map((ind, i) => (
          <div key={i} className={`rounded-lg p-3 ${darkMode ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className={`text-sm font-medium ${darkMode ? 'text-white/80' : 'text-gray-800'}`}>{ind.indicator_name}</div>
                {ind.service_area && <div className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{ind.service_area}</div>}
              </div>
              {ind.value_numeric != null && (
                <div className={`text-lg font-bold flex-shrink-0 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{ind.value_numeric}</div>
              )}
              {ind.value_text && !ind.value_numeric && (
                <div className={`text-sm font-medium flex-shrink-0 ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>{ind.value_text}</div>
              )}
            </div>
            {ind.change_observed && (
              <p className={`text-xs mt-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Change: {ind.change_observed}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Immersive Story Cards ──────────────────────────────────────────────────

function ImmersiveStoryDetail({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const story = data.story
  const sections = data.sections as Array<{ section_order: number; section_type: string; title?: string; content?: string; quote_author?: string }> | undefined

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      {story.hero_media_url && (
        <div className="relative h-48 overflow-hidden">
          <img src={story.hero_media_url} alt={story.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-lg">{story.title}</h3>
            {story.subtitle && <p className="text-white/80 text-sm mt-1">{story.subtitle}</p>}
          </div>
        </div>
      )}
      {!story.hero_media_url && (
        <div className={`px-5 py-4 ${darkMode ? 'bg-white/[0.04]' : 'bg-warm-50'}`}>
          <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{story.title}</h3>
          {story.subtitle && <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{story.subtitle}</p>}
        </div>
      )}
      {sections && sections.length > 0 && (
        <div className="px-5 py-3 space-y-2 max-h-[300px] overflow-y-auto">
          {sections.slice(0, 10).map((sec) => (
            <div key={sec.section_order}>
              {sec.title && <div className={`text-sm font-medium ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>{sec.title}</div>}
              {sec.content && <p className={`text-sm line-clamp-2 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{sec.content}</p>}
              {sec.quote_author && <p className={`text-xs italic ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>— {sec.quote_author}</p>}
            </div>
          ))}
        </div>
      )}
      <div className={`px-5 py-3 border-t ${darkMode ? 'border-white/[0.06]' : 'border-gray-100'}`}>
        <a href={`/immersive-stories/${story.slug}`} target="_blank" rel="noreferrer" className="text-xs text-picc-ochre hover:underline">
          View full immersive story
        </a>
      </div>
    </div>
  )
}

function ImmersiveStoryList({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const stories = data.stories as Array<{ title: string; subtitle?: string; slug: string; hero_media_url?: string }>

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
        Immersive Stories ({stories.length})
      </div>
      <div className="divide-y divide-gray-100">
        {stories.map((s) => (
          <a key={s.slug} href={`/immersive-stories/${s.slug}`} target="_blank" rel="noreferrer" className={`flex items-center gap-3 px-5 py-3 transition-colors ${darkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50'}`}>
            {s.hero_media_url && <img src={s.hero_media_url} alt={s.title} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />}
            <div>
              <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.title}</div>
              {s.subtitle && <div className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{s.subtitle}</div>}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Grants & Partnerships Card ─────────────────────────────────────────────

function GrantsAndPartnershipsCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const partners = data.partners as Array<{ name: string; partner_type?: string; description?: string; website_url?: string }>
  const grants = data.grants as Array<{ id: string; [key: string]: any }> | undefined
  const deadlines = data.upcomingDeadlines as Array<{ id: string; [key: string]: any }> | undefined

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
      {partners.length > 0 && (
        <>
          <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
            Partners ({partners.length})
          </div>
          <div className="px-5 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {partners.map((p, i) => (
                <div key={i} className={`rounded-lg px-3 py-2 ${darkMode ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
                  <div className={`text-sm font-medium ${darkMode ? 'text-white/80' : 'text-gray-800'}`}>{p.name}</div>
                  {p.partner_type && <div className={`text-xs capitalize ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{p.partner_type}</div>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {grants && grants.length > 0 && (
        <div className={`px-5 py-3 ${partners.length > 0 ? (darkMode ? 'border-t border-white/[0.06]' : 'border-t border-gray-100') : ''}`}>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
            Grants ({grants.length})
          </div>
          <div className="space-y-1.5">
            {grants.map((g) => (
              <div key={g.id} className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
                {g.grant_name || g.funder_name || `Grant ${g.id.slice(0, 8)}`}
              </div>
            ))}
          </div>
        </div>
      )}
      {deadlines && deadlines.length > 0 && (
        <div className={`px-5 py-3 border-t ${darkMode ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
            Upcoming Deadlines
          </div>
          <div className="space-y-1">
            {deadlines.map((d) => (
              <div key={d.id} className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
                {d.title || 'Deadline'} — {d.deadline_date}
              </div>
            ))}
          </div>
        </div>
      )}
      {partners.length === 0 && (!grants || grants.length === 0) && (
        <div className={`px-5 py-4 text-center text-sm ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
          No grant or partnership data available yet.
        </div>
      )}
    </div>
  )
}

// ─── Community Visions Component ────────────────────────────────────────────

// ─── Escalation Card ─────────────────────────────────────────────────────────

function EscalationCard({ data, darkMode }: { data: any; darkMode?: boolean }) {
  const isCrisis = data.category === 'crisis'
  const contacts = data.contacts as { phone: string; email: string; address: string; hours: string }
  const crisisContacts = data.crisisContacts as Record<string, string> | null

  return (
    <div className={`my-3 rounded-2xl overflow-hidden border-2 ${
      isCrisis
        ? 'border-red-300 bg-red-50'
        : darkMode ? 'border-picc-ochre/30 bg-white/[0.03]' : 'border-picc-ochre/30 bg-warm-50'
    }`}>
      <div className={`px-5 py-4 flex items-start gap-3 ${isCrisis ? 'bg-red-100' : darkMode ? 'bg-white/[0.04]' : 'bg-warm-100/50'}`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isCrisis ? 'bg-red-200 text-red-700' : 'bg-picc-ochre/20 text-picc-ochre'
        }`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <div>
          <h3 className={`font-semibold text-sm ${isCrisis ? 'text-red-900' : darkMode ? 'text-white' : 'text-picc-earth'}`}>
            {isCrisis ? 'Crisis Support' : 'Speak with the PICC Team'}
          </h3>
          <p className={`text-sm mt-1 ${isCrisis ? 'text-red-800' : darkMode ? 'text-white/70' : 'text-picc-earth-300'}`}>
            {data.message}
          </p>
        </div>
      </div>

      {isCrisis && crisisContacts && (
        <div className="px-5 py-3 bg-red-50 border-t border-red-200">
          <div className="text-xs font-bold uppercase tracking-wide text-red-700 mb-2">24/7 Crisis Lines</div>
          <div className="space-y-1.5">
            {Object.entries(crisisContacts).map(([key, value]) => (
              <a key={key} href={`tel:${value.replace(/\s/g, '')}`} className="flex items-center justify-between text-sm text-red-800 hover:text-red-900">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-semibold">{value}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className={`px-5 py-3 space-y-2 ${isCrisis ? 'border-t border-red-200' : darkMode ? 'border-t border-white/[0.06]' : 'border-t border-warm-200'}`}>
        <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
          Contact PICC
        </div>
        <a href={`tel:${contacts.phone.replace(/\s/g, '')}`} className={`flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-white/80 hover:text-picc-ochre-300' : 'text-picc-earth hover:text-picc-ochre'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          {contacts.phone}
        </a>
        <a href={`mailto:${contacts.email}`} className={`flex items-center gap-2 text-sm ${darkMode ? 'text-white/60 hover:text-picc-ochre-300' : 'text-picc-earth-300 hover:text-picc-ochre'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          {contacts.email}
        </a>
        <p className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
          {contacts.hours}
        </p>
      </div>
    </div>
  )
}

function CommunityVisionsDisplay({ data, darkMode }: { data: any; darkMode?: boolean }) {
  return (
    <div className="my-3 space-y-3">
      {data.visions?.length > 0 && (
        <div className={`rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
          <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
            Community Visions ({data.visions.length})
          </div>
          <div className="px-5 py-3 space-y-3">
            {data.visions.map((v: any, i: number) => (
              <div key={i} className={`rounded-xl p-4 ${darkMode ? 'bg-white/[0.04]' : 'bg-warm-50'}`}>
                <p className={`text-sm italic leading-relaxed ${darkMode ? 'text-white/80' : 'text-gray-800'}`}>
                  &ldquo;{v.text}&rdquo;
                </p>
                <div className={`mt-2 flex items-center justify-between text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                  <span>— {v.author}</span>
                  {v.category && <span className={`px-2 py-0.5 rounded-full capitalize ${darkMode ? 'bg-white/[0.06]' : 'bg-white'}`}>{v.category}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.elderVoices?.length > 0 && (
        <div className={`rounded-2xl overflow-hidden border ${darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
          <div className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-white/50 bg-white/[0.04]' : 'text-gray-500 bg-gray-50'}`}>
            Elder Voices on the Future
          </div>
          <div className="px-5 py-3 space-y-3">
            {data.elderVoices.map((q: any, i: number) => (
              <div key={i}>
                <p className={`text-sm italic leading-relaxed ${darkMode ? 'text-white/80' : 'text-gray-800'}`}>
                  &ldquo;{q.text}&rdquo;
                </p>
                <p className={`mt-1 text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                  — {q.speaker}{q.role ? `, ${q.role}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
