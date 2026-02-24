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
      if (!data.found) return <ServiceSuggestions suggestions={data.suggestions || []} darkMode={darkMode} />
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

    case 'getInnovationProjects':
      if (data.project) return <ProjectDetail data={data} darkMode={darkMode} />
      if (data.projects?.length > 0) return <ProjectList projects={data.projects} darkMode={darkMode} />
      return null

    case 'getCommunityVisions':
      if (data.visions?.length > 0 || data.elderVoices?.length > 0) return <CommunityVisionsDisplay data={data} darkMode={darkMode} />
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
      {data.photos?.length > 0 && (
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {data.photos.slice(0, 8).map((photo: any, i: number) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden">
                <img src={photo.url} alt={photo.alt || ''} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
      {data.videos?.length > 0 && (
        <div className="px-5 pb-4">
          <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
            Videos ({data.videos.length})
          </div>
          <div className="space-y-2">
            {data.videos.map((v: any, i: number) => (
              <a key={i} href={v.url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                darkMode ? 'hover:bg-white/[0.06] text-white/70' : 'hover:bg-gray-50 text-gray-700'
              }`}>
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                {v.title || `Video ${i + 1}`}
              </a>
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

// ─── Community Visions Component ────────────────────────────────────────────

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
