'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Calendar,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { HeroSection } from '@/components/story-scroll/HeroSection'
import { ScrollReveal } from '@/components/story-scroll/ScrollReveal'
import { TextSection } from '@/components/story-scroll/TextSection'
import { QuoteSection } from '@/components/story-scroll/QuoteSection'
import { ImageGallery } from '@/components/story-scroll/ImageGallery'
import { ParallaxSection } from '@/components/story-scroll/ParallaxSection'
import { TimelineSection } from '@/components/story-scroll/TimelineSection'
import AnimatedCounter from '@/components/history/AnimatedCounter'
import GrowthChart from '@/components/history/GrowthChart'
import YearCard from '@/components/history/YearCard'

interface HistoryYear {
  fiscalYear: string
  era: string
  staffCount: number | null
  serviceCount: number | null
  peopleServed: string | null
  indigenousPercent: string | null
  annualBudget: number | null
  totalExpenditure: number | null
  totalAssets: number | null
  achievements: Array<{ text: string; category: string }>
  images: Array<{ id: string; url: string; alt: string; caption?: string }>
  imageCount: number
  staff: {
    total: number
    fullTime: number | null
    partTime: number | null
    casual: number | null
    indigenous: number | null
  } | null
}

interface HistoryEra {
  id: string
  name: string
  subtitle: string
  years: string
  color: string
  gradient: string
  description: string
  years_data: HistoryYear[]
  quote: { text: string; speaker_name: string; speaker_role: string } | null
  quotes: Array<{ text: string; speaker_name: string; speaker_role: string }>
  boardMembers: Array<{ name: string; role: string }>
  images: Array<{ url: string; alt: string; caption?: string }>
  latestStats: {
    staff: number | null
    services: number | null
    budget: number | null
    indigenousPercent: string | null
  } | null
}

interface HistoryData {
  years: HistoryYear[]
  chartYears: HistoryYear[]
  eras: HistoryEra[]
  summary: {
    totalYears: number
    yearsSpanned: string
    latestStaff: number | null
    latestBudget: number | null
    latestServices: number | null
    latestIndigenous: string | null
    totalImages: number
    totalQuotes: number
  }
}

export interface TwentyYearsClientProps {
  heroImage?: string | null
  heroVideo?: string | null
  voices?: { text: string; author: string; theme: string | null }[]
  elQuoteCount?: number
  elTranscriptCount?: number
  rachelLegacy?: { text: string; author: string } | null
}

function formatBudget(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

const ERA_COLORS: Record<string, string> = {
  foundation: 'from-picc-ochre to-picc-red',
  growth: 'from-picc-ochre to-picc-ochre-600',
  transition: 'from-picc-earth to-picc-ochre',
  'community-controlled': 'from-picc-red to-picc-ochre',
}

const ERA_BG: Record<string, string> = {
  foundation: 'bg-warm-100',
  growth: 'bg-warm-100',
  transition: 'bg-warm-50',
  'community-controlled': 'bg-warm-50',
}

export default function TwentyYearsClient({ heroImage, heroVideo, voices = [], elQuoteCount = 0, elTranscriptCount = 0, rachelLegacy }: TwentyYearsClientProps) {
  const [data, setData] = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { scrollYProgress } = useScroll()
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  useEffect(() => {
    fetch('/api/public/history')
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-picc-ochre mx-auto mb-4" />
          <p className="text-gray-500">Loading our story...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-500">Failed to load history data.</p>
      </div>
    )
  }

  const { years, chartYears, eras, summary } = data

  // Build milestone timeline events from all years' achievements
  const milestones = years
    .flatMap((y) =>
      y.achievements.slice(0, 1).map((a) => ({
        date: y.fiscalYear,
        title: a.text.length > 60 ? a.text.slice(0, 57) + '...' : a.text,
        description: a.category || '',
        isComplete: true,
      }))
    )
    .filter((m) => m.title)

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-picc-ochre via-picc-red to-picc-earth"
          style={{ width: progressWidth }}
        />
      </div>

      {/* HERO */}
      <HeroSection
        title="Our Story: 17 Years of Community"
        subtitle="From Hull River to community control — follow our journey of resilience, self-determination, and community-led innovation on Palm Island."
        backgroundImage={heroImage || undefined}
        backgroundVideo={heroVideo || undefined}
        height="screen"
        overlay="gradient"
      >
        <div className="flex flex-wrap justify-center gap-8 mt-8">
          {summary.totalYears > 0 && (
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white">
                <AnimatedCounter value={summary.totalYears} />
              </div>
              <div className="text-warm-200 text-sm mt-1">Years</div>
            </div>
          )}
          {summary.latestStaff && (
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white">
                <AnimatedCounter value={summary.latestStaff} />
              </div>
              <div className="text-warm-200 text-sm mt-1">Staff Today</div>
            </div>
          )}
          {summary.latestServices && (
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white">
                <AnimatedCounter value={summary.latestServices} />
              </div>
              <div className="text-warm-200 text-sm mt-1">Services</div>
            </div>
          )}
          {summary.latestBudget && (
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white">
                <AnimatedCounter
                  value={Math.round(summary.latestBudget / 1_000_000)}
                  prefix="$"
                  suffix="M"
                />
              </div>
              <div className="text-warm-200 text-sm mt-1">Annual Budget</div>
            </div>
          )}
        </div>
      </HeroSection>

      {/* ANIMATED STATS BAR */}
      <ScrollReveal>
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-8">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-white">
                {summary.totalYears}
              </div>
              <div className="text-gray-400 text-sm">Years of Service</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-picc-ochre-300">
                {summary.totalImages}
              </div>
              <div className="text-gray-400 text-sm">Photos Preserved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-picc-ochre-300">
                {eras.length}
              </div>
              <div className="text-gray-400 text-sm">Distinct Eras</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-picc-red-300">
                {summary.latestIndigenous || '80%+'}
              </div>
              <div className="text-gray-400 text-sm">Indigenous Employment</div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ERAS */}
      {eras.map((era, eraIndex) => (
        <div key={era.id}>
          {/* Era Divider */}
          {era.images.length > 0 ? (
            <ParallaxSection
              backgroundImage={era.images[0].url}
              height="h-[50vh]"
              speed={0.3}
            >
              <div className="text-center text-white px-6">
                <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-3">
                  {era.years}
                </span>
                <h2 className="text-4xl md:text-6xl font-bold mb-2">
                  {era.name}
                </h2>
                <p className="text-xl text-white/80">{era.subtitle}</p>
              </div>
            </ParallaxSection>
          ) : (
            <div
              className={`bg-gradient-to-r ${era.gradient} py-20 text-center text-white`}
            >
              <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-3">
                {era.years}
              </span>
              <h2 className="text-4xl md:text-6xl font-bold mb-2">
                {era.name}
              </h2>
              <p className="text-xl text-white/80">{era.subtitle}</p>
            </div>
          )}

          {/* Era Narrative */}
          <TextSection
            title={`The ${era.name} Era`}
            content={
              <p className="text-gray-600 text-lg leading-relaxed">
                {era.description}
              </p>
            }
            backgroundColor={ERA_BG[era.id] || 'bg-white'}
            maxWidth="medium"
          />

          {/* Year Cards Grid */}
          {era.years_data.length > 0 && (
            <section
              className={`py-12 px-6 ${ERA_BG[era.id] || 'bg-gray-50'}`}
            >
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {era.years_data.map((year, i) => (
                    <YearCard
                      key={year.fiscalYear}
                      fiscalYear={year.fiscalYear}
                      staffCount={year.staffCount}
                      serviceCount={year.serviceCount}
                      annualBudget={year.annualBudget}
                      indigenousPercent={year.indigenousPercent}
                      achievements={year.achievements}
                      gradient={ERA_COLORS[era.id] || 'from-gray-500 to-gray-600'}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Era Quote */}
          {era.quote && (
            <QuoteSection
              quote={era.quote.text}
              author={era.quote.speaker_name}
              role={era.quote.speaker_role}
              size={eraIndex === 0 ? 'large' : 'medium'}
            />
          )}

          {/* Era Image Gallery */}
          {era.images.length > 1 && (
            <ImageGallery
              title={`${era.name} Era — Photos`}
              images={era.images.slice(1, 7).map((img) => ({
                url: img.url,
                alt: img.alt,
                caption: img.caption,
              }))}
              columns={3}
            />
          )}
        </div>
      ))}

      {/* GROWTH CHART */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <GrowthChart years={chartYears || years} />
          </ScrollReveal>
        </div>
      </section>

      {/* KEY MILESTONES TIMELINE */}
      {milestones.length > 0 && (
        <TimelineSection
          title="Key Milestones"
          events={milestones}
          backgroundColor="bg-white"
        />
      )}

      {/* RACHEL'S LEGACY QUOTE */}
      {rachelLegacy && (
        <section className="py-24 px-6 bg-gradient-to-br from-[#0B4F6C] via-[#0a3f57] to-[#082a3a] text-white relative overflow-hidden">
          <div className="absolute top-10 left-10 text-picc-ochre/10 text-[200px] font-serif leading-none select-none">&ldquo;</div>
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-8">
              The Vision
            </p>
            <blockquote className="font-serif italic text-2xl md:text-4xl leading-relaxed mb-8">
              {rachelLegacy.text}
            </blockquote>
            <p className="text-picc-ochre text-sm">— {rachelLegacy.author}</p>
          </div>
        </section>
      )}

      {/* COMMUNITY VOICES */}
      {voices.length > 0 && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
                Sovereign Voices
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
                The voices behind the numbers
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                {elQuoteCount} community voices captured in the Empathy Ledger.
                {elTranscriptCount} interviews preserved for the next generation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {voices.slice(0, 6).map((voice, i) => (
                <div
                  key={i}
                  className="bg-warm-50 border border-warm-100 rounded-2xl p-7 hover:border-picc-ochre/40 transition-colors"
                >
                  <div className="text-picc-ochre text-5xl font-serif leading-none mb-2 opacity-30">&ldquo;</div>
                  <p className="font-serif italic text-gray-700 leading-relaxed text-base mb-4 line-clamp-5 -mt-3">
                    {voice.text}
                  </p>
                  <p className="text-sm font-semibold text-picc-ochre">{voice.author}</p>
                  {voice.theme && (
                    <p className="text-xs text-gray-400 mt-1 capitalize">
                      {voice.theme.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <a
                href="/20-years/strategy"
                className="inline-flex items-center gap-3 px-8 py-4 bg-picc-ochre text-white rounded-full font-semibold hover:bg-picc-ochre/90 transition-all"
              >
                Read the Sovereignty of Care Strategy
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* LOOKING AHEAD */}
      <TextSection
        title="Looking Ahead"
        content={
          <div className="space-y-4">
            <p className="text-gray-600 text-lg leading-relaxed">
              From our founding in 2009 to today, Palm Island Community Company
              has grown from a small community organisation into the largest
              employer on Palm Island — with a vision for the next decade that
              includes reaching 300 staff, 50 services, and full economic
              self-determination for our community.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              As we approach our 20-year anniversary in 2029, we continue to
              innovate — pioneering AI-powered reporting, establishing on-Country
              infrastructure, and ensuring that every service, every program, and
              every dollar serves the people of Palm Island first.
            </p>
          </div>
        }
        backgroundColor="bg-gradient-to-br from-warm-50 to-warm-100"
        maxWidth="medium"
        textAlign="center"
      />
    </div>
  )
}
