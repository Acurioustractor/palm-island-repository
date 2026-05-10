'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  PlayCircle,
  Quote,
  Search,
  X,
  Filter,
  Users,
  BarChart3,
  MessageSquareQuote,
  FileText,
} from 'lucide-react'
import type { TripStop } from '@/components/elders/EldersTripMap'
import Modal from '@/components/ui/Modal'
import { assetUrl } from '@/lib/media/asset-url'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

// Dynamically import the map component to avoid SSR issues with Leaflet
const EldersTripMap = dynamic(() => import('@/components/elders/EldersTripMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 h-[420px] flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-picc-ochre mx-auto mb-3" />
        <p className="text-sm">Loading map...</p>
      </div>
    </div>
  ),
})
import QuoteCard, { type QuoteData } from '@/components/elders/QuoteCard'
import StoryCard, { type StoryData } from '@/components/elders/StoryCard'
import ImageLightbox, { type LightboxImage } from '@/components/elders/ImageLightbox'
import { ElderContentRenderer, type ElderContentData } from '@/components/elders/ElderContentSections'
import YouthEngagement from '@/components/elders/YouthEngagement'
import ElderMilestoneTimeline from '@/components/elders/ElderMilestoneTimeline'
import ExternalSharingPanel from '@/components/elders/ExternalSharingPanel'
import Next20YearsVision from '@/components/elders/Next20YearsVision'
import IntergenerationalMap from '@/components/elders/IntergenerationalMap'

type ElderQuote = QuoteData
type ElderStory = StoryData

export type ElderInterview = {
  id: string
  title: string
  date?: string | null
  status?: string
  href: string
}

export type ElderCard = {
  id: string
  name: string
  fullName: string
  preferredName: string | null
  profileImageUrl: string | null
  bio: string | null
  location: string | null
  communityRole: string | null
  traditionalCountry: string | null
  languageGroup: string | null
  featuredQuote: ElderQuote | null
  quotes: ElderQuote[]
  stories: ElderStory[]
  interviews: ElderInterview[]
  profileHref: string
}

type TripMedia = {
  project: { name: string; slug: string } | null
  video: { id: string; title: string | null; description: string | null; videoUrl: string } | null
  images: Array<{ id: string; url: string; title: string | null; caption: string | null }>
  storyHref: string
  immersiveStoryHref: string
  stops?: Array<{ id: string; name: string; description?: string | null; lat: number; lng: number }>
}

type ElderInsights = {
  stats: {
    totalElders: number
    eldersWithQuotes: number
    eldersWithInterviews: number
    totalQuotes: number
    validatedQuotes: number
    totalInterviews: number
  }
  themes: Array<{
    name: string
    count: number
    fromQuotes: number
    fromInterviews: number
    sampleQuote: { id: string; text: string; elderName: string | null } | null
  }>
  highlightedQuotes: Array<{
    id: string
    text: string
    theme: string | null
    elderName: string | null
    createdAt: string
  }>
}

type Props = {
  elders: ElderCard[]
  hero: { type: 'image' | 'video'; url: string; title: string | null } | null
  insights: ElderInsights
  trip: TripMedia
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'PI'
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function formatIdentity(e: ElderCard) {
  const bits = [e.communityRole, e.languageGroup, e.traditionalCountry, e.location].filter(Boolean)
  return bits.join(' • ')
}

function youtubeEmbedUrl(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)
  if (!m) return null
  return `https://www.youtube.com/embed/${m[1]}`
}

function vimeoEmbedUrl(url: string) {
  const m = url.match(/vimeo\.com\/(\d+)/)
  if (!m) return null
  return `https://player.vimeo.com/video/${m[1]}`
}

function descriptEmbedUrl(url: string) {
  if (!/descript\.com/i.test(url)) return null
  return url.replace('/view/', '/embed/')
}

function makeStops(): TripStop[] {
  return [
    {
      id: 'palm-island',
      name: 'Palm Island',
      description: 'Departing from Country with Elders and community.',
      lat: -18.753,
      lng: 146.581,
    },
    {
      id: 'lucinda-outbound',
      name: 'Lucinda (barge crossing)',
      description: 'Barged over to Lucinda before the coastal journey north.',
      lat: -18.449,
      lng: 146.459,
    },
    {
      id: 'ingham',
      name: 'Ingham',
      description: 'On the way to the traditional sites at Hull River.',
      lat: -18.6455,
      lng: 146.1643,
    },
    {
      id: 'hull-river',
      name: 'Hull River (Mission Beach region)',
      description: 'Return journey to place and memory.',
      lat: -17.865,
      lng: 146.102,
    },
    {
      id: 'lucinda-return',
      name: 'Lucinda (return crossing)',
      description: 'Barged back to Lucinda at the end of the trip.',
      lat: -18.449,
      lng: 146.459,
    },
  ]
}

// Extract unique filter values from elders
function getFilterOptions(elders: ElderCard[]) {
  const roles = new Set<string>()
  const languages = new Set<string>()
  const locations = new Set<string>()

  elders.forEach((e) => {
    if (e.communityRole) roles.add(e.communityRole)
    if (e.languageGroup) languages.add(e.languageGroup)
    if (e.location) locations.add(e.location)
  })

  return {
    roles: Array.from(roles).sort(),
    languages: Array.from(languages).sort(),
    locations: Array.from(locations).sort(),
  }
}

export default function EldersPageClient({ elders, hero, insights, trip }: Props) {
  // Modal state
  const [activeElderId, setActiveElderId] = useState<string | null>(null)

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<{
    role: string | null
    language: string | null
    location: string | null
  }>({ role: null, language: null, location: null })
  const [heroGridConfig, setHeroGridConfig] = useState({ cols: 3, rows: 4 })
  const [galleryVisibleCount, setGalleryVisibleCount] = useState(24)

  const activeElder = useMemo(() => elders.find((e) => e.id === activeElderId) || null, [elders, activeElderId])

  const lightboxImages: LightboxImage[] = useMemo(
    () =>
      trip.images.map((img) => ({
        id: img.id,
        url: img.url,
        title: img.title,
        caption: img.caption,
      })),
    [trip.images]
  )

  const filterOptions = useMemo(() => getFilterOptions(elders), [elders])

  // Filter elders based on search and filters
  const filteredElders = useMemo(() => {
    return elders.filter((e) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = [
          e.name,
          e.fullName,
          e.preferredName,
          e.communityRole,
          e.languageGroup,
          e.location,
          e.bio,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!searchableText.includes(query)) return false
      }

      // Role filter
      if (activeFilters.role && e.communityRole !== activeFilters.role) return false

      // Language filter
      if (activeFilters.language && e.languageGroup !== activeFilters.language) return false

      // Location filter
      if (activeFilters.location && e.location !== activeFilters.location) return false

      return true
    })
  }, [elders, searchQuery, activeFilters])

  const hasActiveFilters = activeFilters.role || activeFilters.language || activeFilters.location

  const clearFilters = useCallback(() => {
    setActiveFilters({ role: null, language: null, location: null })
    setSearchQuery('')
  }, [])

  const stops = useMemo(() => {
    // Use dynamic stops from DB if available, otherwise fall back to hardcoded
    if (trip.stops && trip.stops.length > 0) return trip.stops
    return makeStops()
  }, [trip.stops])

  const quoteCoverage = useMemo(() => {
    if (!insights.stats.totalElders) return 0
    return Math.round((insights.stats.eldersWithQuotes / insights.stats.totalElders) * 100)
  }, [insights.stats.eldersWithQuotes, insights.stats.totalElders])

  const interviewCoverage = useMemo(() => {
    if (!insights.stats.totalElders) return 0
    return Math.round((insights.stats.eldersWithInterviews / insights.stats.totalElders) * 100)
  }, [insights.stats.eldersWithInterviews, insights.stats.totalElders])

  const themeMaxCount = useMemo(() => {
    if (!insights.themes.length) return 1
    return Math.max(...insights.themes.map((t) => t.count))
  }, [insights.themes])

  const insightStats = useMemo(
    () => [
      {
        label: 'Elders with quotes',
        value: `${insights.stats.eldersWithQuotes}/${insights.stats.totalElders || 0}`,
        helper: `${quoteCoverage}% coverage`,
        icon: MessageSquareQuote,
      },
      {
        label: 'Interviews logged',
        value: insights.stats.totalInterviews,
        helper: `${interviewCoverage}% of Elders`,
        icon: FileText,
      },
      {
        label: 'Validated quotes',
        value: insights.stats.validatedQuotes,
        helper: `${insights.stats.totalQuotes} total`,
        icon: BarChart3,
      },
    ],
    [
      insights.stats.eldersWithQuotes,
      insights.stats.totalElders,
      insights.stats.totalInterviews,
      insights.stats.validatedQuotes,
      insights.stats.totalQuotes,
      quoteCoverage,
      interviewCoverage,
    ]
  )

  useEffect(() => {
    const updateGrid = () => {
      const width = window.innerWidth
      if (width >= 1280) {
        setHeroGridConfig({ cols: 5, rows: 3 })
      } else if (width >= 1024) {
        setHeroGridConfig({ cols: 4, rows: 3 })
      } else if (width >= 768) {
        setHeroGridConfig({ cols: 4, rows: 3 })
      } else if (width >= 640) {
        setHeroGridConfig({ cols: 3, rows: 3 })
      } else {
        setHeroGridConfig({ cols: 2, rows: 3 })
      }
    }

    updateGrid()
    window.addEventListener('resize', updateGrid)
    return () => window.removeEventListener('resize', updateGrid)
  }, [])

  useEffect(() => {
    setGalleryVisibleCount(24)
  }, [trip.images.length])

  const heroGridTiles = useMemo(() => {
    const base = elders.filter((e) => e.profileImageUrl || e.name)
    if (base.length === 0) return []
    const tileCount = heroGridConfig.cols * heroGridConfig.rows
    return Array.from({ length: tileCount }, (_, index) => {
      const elder = base[index % base.length]
      return {
        id: `${elder.id}-${index}`,
        name: elder.name,
        imageUrl: elder.profileImageUrl,
        initials: initials(elder.name),
      }
    })
  }, [elders, heroGridConfig])

  const videoEmbed =
    trip.video?.videoUrl ? youtubeEmbedUrl(trip.video.videoUrl) || vimeoEmbedUrl(trip.video.videoUrl) : null
  const descriptEmbed = trip.video?.videoUrl ? descriptEmbedUrl(trip.video.videoUrl) : null
  const featuredEmbed = videoEmbed || descriptEmbed

  // Build content data for the active elder
  const elderContentData: ElderContentData | null = useMemo(() => {
    if (!activeElder) return null
    return {
      quotes: activeElder.quotes,
      stories: activeElder.stories,
      interviews: (activeElder.interviews || []).map((i) => ({
        id: i.id,
        title: i.title,
        date: i.date,
        status: i.status,
        href: i.href,
      })),
      mediaGalleries: [],
      projects: [],
      events: [],
      connections: [],
    }
  }, [activeElder])

  // Handle lightbox navigation
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const navigateLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  return (
    <div className="min-h-screen palm-gradient">
      {/* Skip to content link for accessibility */}
      <a
        href="#elders"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-lg focus:shadow-lg"
      >
        Skip to Elders
      </a>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          {heroGridTiles.length > 0 ? (
            <div className="absolute inset-0">
              <div
                className="grid h-full w-full gap-0"
                style={{
                  gridTemplateColumns: `repeat(${heroGridConfig.cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${heroGridConfig.rows}, minmax(0, 1fr))`,
                }}
              >
                {heroGridTiles.map((tile) => (
                  <div key={tile.id} className="relative overflow-hidden" aria-hidden="true">
                    {tile.imageUrl ? (
                      <img
                        src={tile.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-picc-earth via-picc-red to-picc-ochre text-white text-xl font-semibold tracking-wide">
                        {tile.initials}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {hero?.type === 'image' && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${hero.url})` }}
                  role="img"
                  aria-label={hero.title || 'Elders group hero image'}
                />
              )}
              {hero?.type === 'video' && (
                <video
                  className="absolute inset-0 w-full h-full object-cover motion-reduce:hidden"
                  src={hero.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  poster={undefined} // Add poster image if available
                />
              )}
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" aria-hidden="true" />
          <div className="absolute inset-0 cultural-pattern opacity-60" aria-hidden="true" />
        </div>

        <div className="relative min-h-[calc(100vh-4rem)] flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
            <div className="max-w-3xl mx-auto text-center">
              <p
                className="font-bold uppercase mb-4"
                style={{
                  color: '#F5E9D0',
                  fontSize: 11,
                  letterSpacing: '0.3em',
                  textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                }}
              >
                PICC · Elders Group
              </p>
              <h1
                className="font-fraunces font-bold leading-[1.05] mb-6"
                style={{
                  color: '#FFFFFF',
                  fontSize: 'clamp(40px, 7vw, 72px)',
                  textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                }}
              >
                Connecting generations through culture
              </h1>
              <p
                className="font-fraunces mt-4 mx-auto"
                style={{
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  lineHeight: 1.55,
                  maxWidth: 640,
                  textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                }}
              >
                Our Elders carry the knowledge, stories, and cultural strength that connect Palm Island&apos;s past
                to its future. This page holds their voices and the pathways they&apos;re building for the next generation.
              </p>
              <div className="mt-10 flex flex-wrap gap-3 justify-center">
                <a
                  href="#elders"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
                  style={{ backgroundColor: C.ocean, color: '#FBF8EE', letterSpacing: '0.15em' }}
                >
                  Meet the Elders <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#video"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md font-bold uppercase text-xs hover:bg-white/15 transition"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}
                >
                  Watch the trip <PlayCircle className="w-3.5 h-3.5" />
                </a>
              </div>
              <p
                className="font-fraunces italic mt-8"
                style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
              >
                Manbarra &amp; Bwgcolman Country · Palm Island
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="rounded-2xl bg-white p-7 shadow-sm"
          style={{ border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: C.ochre }}
        >
          <p
            className="uppercase font-bold mb-3"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Elders Trip · 2024
          </p>
          <p className="text-gray-800 leading-relaxed">
            In 2024, members of the Palm Island Elders Advisory Group made a significant journey from Palm Island through Townsville
            and Ingham to Hull River in the Mission Beach region. The trip brought together Elders to walk country where their
            families had been held during the mission era, to connect with other Indigenous communities, and to remember those
            who came before.
          </p>
          <p className="text-gray-800 leading-relaxed mt-3">
            It was a journey of respect, learning, and strengthening the pathways forward for young people.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={trip.storyHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              Read the trip story <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#trip"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-gray-900 font-semibold hover:bg-stone-50 transition-colors"
            >
              Explore photos & map <PlayCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Featured Video */}
      <section id="video" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-gray-900">Elders Trip — Featured Video</h2>
                <p className="mt-2 text-gray-700">
                  A return journey that strengthens connection — captured in story and place.
                </p>
              </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={trip.immersiveStoryHref}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Immersive Story <PlayCircle className="w-4 h-4" />
                  </Link>
                </div>
            </div>

            <div className="mt-8 rounded-2xl overflow-hidden border border-stone-200 bg-stone-900">
              {trip.video?.videoUrl && featuredEmbed ? (
                <div className="relative w-full aspect-video">
                  <iframe
                    src={featuredEmbed}
                    title={trip.video.title || 'Elders Trip Video'}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : trip.video?.videoUrl ? (
                <div className="p-8 text-white">
                  <div className="text-xl font-bold">{trip.video.title || 'Elders Trip Video'}</div>
                  <p className="text-white/80 mt-2 max-w-2xl">
                    This video link can't be embedded here, but you can open it in a new tab.
                  </p>
                  <a
                    href={trip.video.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-stone-100 transition-colors"
                  >
                    Watch video <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="p-8 text-white">
                  <div className="text-xl font-bold">Trip video coming soon</div>
                  <p className="text-white/80 mt-2 max-w-2xl">
                    Add a featured trip video in the Media Library and tag it to the Elders Trips project.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Transcript Insights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-picc-ochre-50 via-white to-warm-100 shadow-sm p-8">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-wide font-semibold text-picc-ochre">Transcript insights</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">What Elders are speaking about</h2>
              <p className="mt-2 text-gray-700">
                Based on {insights.stats.totalQuotes || 0} quotes and {insights.stats.totalInterviews || 0} interviews logged so far.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
              {insightStats.map((card) => (
                <div
                  key={card.label}
                  className="flex items-start gap-3 bg-white/80 border border-stone-200 rounded-2xl px-4 py-3 shadow-sm"
                >
                  <div className="p-2 rounded-xl bg-warm-100 text-picc-ochre">
                    <card.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{card.label}</div>
                    <div className="text-xl font-bold text-gray-900">{card.value}</div>
                    <div className="text-xs text-gray-600">{card.helper}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {insights.themes.length === 0 && insights.highlightedQuotes.length === 0 ? (
            <div className="mt-6 text-sm text-gray-700">
              Add validated Elder quotes or transcript themes to see the pattern of voices here.
            </div>
          ) : (
            <div className="mt-8 grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {insights.themes.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-6 text-sm text-gray-700">
                    Themes will appear once transcripts are tagged or quotes have themes set.
                  </div>
                ) : (
                  insights.themes.map((theme) => {
                    const width = Math.max(12, Math.round((theme.count / themeMaxCount) * 100))
                    return (
                      <div
                        key={theme.name}
                        className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{theme.name}</div>
                            <div className="text-xs text-gray-600">
                              {theme.fromQuotes} quotes • {theme.fromInterviews} transcript tags
                            </div>
                          </div>
                          <div className="text-sm font-bold text-gray-900">{theme.count}</div>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-picc-ochre via-picc-ochre to-picc-ochre-400"
                            style={{ width: `${Math.min(width, 100)}%` }}
                          />
                        </div>
                        {theme.sampleQuote?.text && (
                          <p className="mt-3 text-sm text-gray-700 italic">
                            “{theme.sampleQuote.text}”
                            {theme.sampleQuote.elderName && (
                              <span className="text-gray-500"> — {theme.sampleQuote.elderName}</span>
                            )}
                          </p>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-picc-ochre" />
                  <h3 className="text-lg font-bold text-gray-900">Highlighted quotes</h3>
                </div>
                <div className="mt-4 space-y-4">
                  {insights.highlightedQuotes.length === 0 ? (
                    <p className="text-sm text-gray-700">
                      Publish validated Elder quotes to spotlight them here.
                    </p>
                  ) : (
                    insights.highlightedQuotes.slice(0, 6).map((q) => {
                      const quoteDate = q.createdAt ? new Date(q.createdAt) : null
                      const formattedDate =
                        quoteDate && !Number.isNaN(quoteDate.valueOf())
                          ? quoteDate.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
                          : null
                      return (
                        <div
                          key={q.id}
                          className="border border-stone-200 rounded-xl p-3 bg-stone-50"
                        >
                          <div className="text-sm text-gray-900 leading-relaxed">“{q.text}”</div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                            {q.elderName && <span>{q.elderName}</span>}
                            {q.theme && (
                              <span className="px-2 py-1 rounded-full bg-warm-100 text-picc-ochre font-semibold">
                                {q.theme}
                              </span>
                            )}
                            {formattedDate && <span>{formattedDate}</span>}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Youth Engagement */}
      <section id="youth-engagement" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <YouthEngagement />
      </section>

      {/* Connection to Country — cinematic video interstitial */}
      <section className="relative h-[40vh] min-h-[280px] overflow-hidden">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={assetUrl('/hero-assets/clips/country-waterfall.mp4')}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70 mb-3">
              Connection to Country
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white max-w-2xl mx-auto">
              Where water meets memory, Elders walk with purpose
            </h2>
          </div>
        </div>
      </section>

      {/* Elders grid */}
      <section id="elders" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-900">Our Elders</h2>
            <p className="mt-2 text-gray-700">
              Click a card to read more — including additional quotes and links to public stories across the PICC site.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 px-4 py-3 text-sm text-gray-700">
            <Users className="w-4 h-4 inline mr-2" />
            <span className="font-semibold text-gray-900">{filteredElders.length}</span>
            {filteredElders.length !== elders.length && (
              <span className="text-gray-500"> of {elders.length}</span>
            )} Elders
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search elders by name, role, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 bg-white focus:border-picc-ochre-300 focus:ring-2 focus:ring-warm-100 focus:outline-none transition-colors"
              aria-label="Search elders"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-100 rounded-full"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'border-picc-ochre-300 bg-warm-100 text-picc-ochre'
                : 'border-stone-200 bg-white text-gray-700 hover:bg-stone-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-picc-ochre text-white text-xs flex items-center justify-center">
                {[activeFilters.role, activeFilters.language, activeFilters.location].filter(Boolean).length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-picc-ochre hover:text-picc-ochre-900 font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 p-6 bg-white rounded-2xl border border-stone-200 grid sm:grid-cols-3 gap-6">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Community Role</label>
              <select
                value={activeFilters.role || ''}
                onChange={(e) => setActiveFilters({ ...activeFilters, role: e.target.value || null })}
                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-picc-ochre-300 focus:ring-2 focus:ring-warm-100 focus:outline-none"
              >
                <option value="">All roles</option>
                {filterOptions.roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language Group</label>
              <select
                value={activeFilters.language || ''}
                onChange={(e) => setActiveFilters({ ...activeFilters, language: e.target.value || null })}
                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-picc-ochre-300 focus:ring-2 focus:ring-warm-100 focus:outline-none"
              >
                <option value="">All languages</option>
                {filterOptions.languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={activeFilters.location || ''}
                onChange={(e) => setActiveFilters({ ...activeFilters, location: e.target.value || null })}
                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-picc-ochre-300 focus:ring-2 focus:ring-warm-100 focus:outline-none"
              >
                <option value="">All locations</option>
                {filterOptions.locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {filteredElders.length === 0 && elders.length > 0 ? (
          <div className="mt-10 bg-white rounded-2xl border border-stone-200 p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900">No elders match your search</h3>
            <p className="text-gray-700 mt-2">
              Try adjusting your search terms or clearing filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-picc-ochre text-white font-semibold hover:bg-picc-ochre transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : elders.length === 0 ? (
          <div className="mt-10 bg-white rounded-2xl border border-stone-200 p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900">No Elders found yet</h3>
            <p className="text-gray-700 mt-2">
              Mark profiles as Elders and enable "show in directory" to appear here.
            </p>
            <div className="mt-5">
              <Link
                href="/picc/storytellers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
              >
                Manage Profiles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElders.map((e) => {
              const identity = formatIdentity(e)
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setActiveElderId(e.id)}
                  className="group text-left bg-white rounded-2xl border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md transition-all overflow-hidden focus:outline-none focus:ring-2 focus:ring-picc-ochre-300 focus:ring-offset-2"
                  aria-label={`View details for ${e.name}`}
                >
                  <div className="h-72 relative overflow-hidden bg-gradient-to-br from-stone-100 via-picc-ochre-50 to-orange-50">
                    {e.profileImageUrl ? (
                      <img
                        src={e.profileImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="h-28 w-28 rounded-full bg-gradient-to-br from-warm-1000 to-picc-ochre flex items-center justify-center text-white font-bold text-3xl shadow-2xl">
                          {initials(e.name)}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute left-5 right-5 bottom-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-2xl font-bold text-white truncate">{e.name}</h3>
                        <ArrowRight className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                      </div>
                      <div className="mt-1 text-sm text-white/90 line-clamp-2">
                        {identity || 'Elder • Palm Island'}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {e.featuredQuote?.quoteText && (
                      <QuoteCard quote={e.featuredQuote} variant="compact" />
                    )}

                    {e.bio ? (
                      <p className="mt-4 text-sm text-gray-700 line-clamp-3">{e.bio}</p>
                    ) : (
                      <p className="mt-4 text-sm text-gray-500 line-clamp-3">Bio coming soon.</p>
                    )}

                    {(e.stories.length > 0 || e.quotes.length > 0) && (
                      <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
                        {e.stories.length > 0 ? (
                          <span className="inline-flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {e.stories.length} stories
                          </span>
                        ) : (
                          <span />
                        )}
                        {e.quotes.length > 0 && (
                          <span className="inline-flex items-center gap-2">
                            <Quote className="w-4 h-4" />
                            {e.quotes.length} quotes
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* Elders Trip */}
      <section id="trip" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-gray-900">The Elders Trip</h2>
                <p className="mt-2 text-gray-700">
                  A return journey that strengthens connection — captured through video, photos, and place.
                </p>
                <p className="mt-3 text-sm text-gray-700">
                  This is a living story: as more interviews are added and quotes are reviewed, we’ll continue building a fuller record of what the trip meant and what it carries forward for the next generation.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={trip.storyHref}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
                >
                  Read the trip story <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={trip.immersiveStoryHref}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-gray-900 font-semibold hover:bg-stone-50 transition-colors"
                >
                  Immersive story <PlayCircle className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Map */}
            <div className="mt-8">
              <EldersTripMap stops={stops} />
            </div>

            {/* Gallery */}
            <div className="mt-10 bg-stone-50 rounded-2xl border border-stone-200 p-6">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Photo Gallery</h3>
                  <p className="text-sm text-gray-700 mt-1">Selected images from the trip. Click to enlarge.</p>
                </div>
                {trip.images.length > 0 && (
                  <div className="text-sm text-gray-600">{trip.images.length} photos</div>
                )}
              </div>

              {trip.images.length === 0 ? (
                <div className="mt-5 text-sm text-gray-600">
                  No public trip photos found yet. Upload images to the Elders Trips project (public) to show them here.
                </div>
              ) : (
                <div className="mt-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {trip.images.slice(0, galleryVisibleCount).map((img, idx) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => openLightbox(idx)}
                        className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-picc-ochre-300 focus:ring-offset-2"
                        aria-label={img.title || `View photo ${idx + 1}`}
                      >
                        <img src={img.url} alt={img.title || 'Trip photo'} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  {trip.images.length > galleryVisibleCount && (
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span>
                        Showing {galleryVisibleCount} of {trip.images.length} photos.
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryVisibleCount((count) => Math.min(count + 24, trip.images.length))
                        }
                        className="px-4 py-2 rounded-full bg-white border border-stone-200 text-gray-900 font-semibold hover:bg-stone-100 transition-colors"
                      >
                        Show more
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryVisibleCount(trip.images.length)}
                        className="px-4 py-2 rounded-full bg-white border border-stone-200 text-gray-900 font-semibold hover:bg-stone-100 transition-colors"
                      >
                        Show all
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Next 20 Years Vision */}
      <Next20YearsVision />

      {/* Intergenerational Connection Map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <IntergenerationalMap />
      </section>

      {/* Elder Modal */}
      <Modal
        isOpen={!!activeElder}
        onClose={() => setActiveElderId(null)}
        size="lg"
        headerContent={
          activeElder && (
            <div className="flex items-start gap-4 min-w-0">
              {activeElder.profileImageUrl ? (
                <img
                  src={activeElder.profileImageUrl}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover border border-stone-200 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warm-1000 to-picc-ochre text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {initials(activeElder.name)}
                </div>
              )}

              <div className="min-w-0">
                <div className="text-2xl font-bold text-gray-900 truncate">{activeElder.name}</div>
                {formatIdentity(activeElder) ? (
                  <div className="text-sm text-gray-700 mt-1">{formatIdentity(activeElder)}</div>
                ) : (
                  <div className="text-sm text-gray-600 mt-1">Elder • Palm Island</div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={activeElder.profileHref}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
                  >
                    View profile <ExternalLink className="w-4 h-4" />
                  </Link>
                  {activeElder.stories.length > 0 && (
                    <a
                      href="#elder-stories"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-gray-900 font-semibold hover:bg-stone-50 transition-colors"
                    >
                      Stories <BookOpen className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        }
      >
        {activeElder && elderContentData && (
          <div className="p-6 md:p-8">
            {/* About Section */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-gray-900 mb-2">About</h4>
              {activeElder.bio ? (
                <p className="text-gray-700 whitespace-pre-line">{activeElder.bio}</p>
              ) : (
                <p className="text-gray-600">
                  Bio coming soon. Add a short bio on the profile to help explain who this Elder is.
                </p>
              )}
            </div>

            {/* Extensible Content Sections */}
            <ElderContentRenderer
              elderName={activeElder.name}
              data={elderContentData}
              sections={['quotes', 'stories', 'interviews']}
              layout="two-column"
            />

            {/* Milestone Timeline */}
            <div className="mt-8">
              <ElderMilestoneTimeline
                elderId={activeElder.id}
                elderName={activeElder.name}
              />
            </div>

            {/* External Sharing */}
            <div className="mt-8">
              <ExternalSharingPanel
                elderId={activeElder.id}
                elderName={activeElder.name}
                quoteCount={activeElder.quotes.length}
                storyCount={activeElder.stories.length}
              />
            </div>

            {/* Add Content Prompt */}
            <div className="mt-8 rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-picc-ochre-50 p-5">
              <div className="font-bold text-gray-900">Want to add more Elder stories?</div>
              <p className="text-sm text-gray-700 mt-1">
                Upload transcripts, extract quotes, and publish stories to build a richer profile over time.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/picc/quotes/library"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-gray-900 font-semibold hover:bg-stone-50 transition-colors"
                >
                  Quote Library <Quote className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Image Lightbox */}
      {lightboxIndex !== null && lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
          showDownload
        />
      )}
    </div>
  )
}
