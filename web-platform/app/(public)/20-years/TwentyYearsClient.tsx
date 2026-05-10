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
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.shell }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: C.ochre }} />
          <p className="font-fraunces italic" style={{ color: C.driftwood }}>Loading our story…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.shell }}>
        <p style={{ color: C.turtleRed }}>Failed to load history data.</p>
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
    <div className="min-h-screen" style={{ backgroundColor: C.shell }}>
      {/* Progress Bar — ocean over warm rail */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50" style={{ backgroundColor: C.border }}>
        <motion.div
          className="h-full"
          style={{ width: progressWidth, background: `linear-gradient(90deg, ${C.ochre}, ${C.ocean}, ${C.turtleRed})` }}
        />
      </div>

      {/* HERO */}
      <HeroSection
        title="Our story · 17 years of community"
        subtitle="From Hull River to community control — a journey of resilience, self-determination, and community-led innovation on Palm Island."
        backgroundImage={heroImage || undefined}
        backgroundVideo={heroVideo || undefined}
        height="screen"
        overlay="gradient"
      >
        <div className="flex flex-wrap justify-center gap-10 mt-10">
          {summary.totalYears > 0 && (
            <HeroStat value={summary.totalYears} label="Years" />
          )}
          {summary.latestStaff && (
            <HeroStat value={summary.latestStaff} label="Staff today" />
          )}
          {summary.latestServices && (
            <HeroStat value={summary.latestServices} label="Services" />
          )}
          {summary.latestBudget && (
            <HeroStat
              value={Math.round(summary.latestBudget / 1_000_000)}
              prefix="$"
              suffix="M"
              label="Annual budget"
            />
          )}
        </div>
      </HeroSection>

      {/* STATS BAR — saltwater dark band, ochre/ocean Fraunces numbers */}
      <ScrollReveal>
        <div className="py-10" style={{ background: `linear-gradient(90deg, ${C.midnight}, ${C.earth})` }}>
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <StatCell value={summary.totalYears} label="Years of service" tone="white" />
            <StatCell value={summary.totalImages} label="Photos preserved" tone="ochre" />
            <StatCell value={eras.length} label="Distinct eras" tone="ochre" />
            <StatCell value={summary.latestIndigenous || '80%+'} label="Indigenous employment" tone="starGold" />
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
                <p
                  className="font-bold uppercase mb-4"
                  style={{ color: '#F5E9D0', fontSize: 11, letterSpacing: '0.3em', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                >
                  {era.years}
                </p>
                <h2
                  className="font-fraunces font-bold mb-3"
                  style={{ fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
                >
                  {era.name}
                </h2>
                <p
                  className="font-fraunces italic"
                  style={{ color: 'rgba(255,255,255,0.92)', fontSize: 'clamp(16px, 2vw, 22px)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                >
                  {era.subtitle}
                </p>
              </div>
            </ParallaxSection>
          ) : (
            <div
              className={`bg-gradient-to-r ${era.gradient} py-20 text-center text-white`}
            >
              <p
                className="font-bold uppercase mb-4"
                style={{ color: '#F5E9D0', fontSize: 11, letterSpacing: '0.3em' }}
              >
                {era.years}
              </p>
              <h2
                className="font-fraunces font-bold mb-3"
                style={{ fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.1 }}
              >
                {era.name}
              </h2>
              <p
                className="font-fraunces italic"
                style={{ color: 'rgba(255,255,255,0.92)', fontSize: 'clamp(16px, 2vw, 22px)' }}
              >
                {era.subtitle}
              </p>
            </div>
          )}

          {/* Era Narrative */}
          <TextSection
            title={`The ${era.name} era`}
            content={
              <p className="font-fraunces leading-relaxed" style={{ color: C.driftwood, fontSize: 19 }}>
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
      <section className="py-16 px-6" style={{ backgroundColor: C.shell }}>
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
        <section
          className="py-24 px-6 relative overflow-hidden text-white"
          style={{ background: `linear-gradient(135deg, ${C.ocean}, #0a3f57 60%, ${C.midnight})` }}
        >
          <div className="absolute top-10 left-10 font-fraunces leading-none select-none" style={{ color: C.ochre, opacity: 0.12, fontSize: 240 }}>&ldquo;</div>
          <div className="relative max-w-3xl mx-auto text-center">
            <p
              className="font-bold uppercase mb-8"
              style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
            >
              The vision
            </p>
            <blockquote
              className="font-fraunces italic mb-8"
              style={{ fontSize: 'clamp(22px, 3.5vw, 40px)', lineHeight: 1.4 }}
            >
              {rachelLegacy.text}
            </blockquote>
            <p className="font-fraunces" style={{ color: C.ochre, fontSize: 14 }}>— {rachelLegacy.author}</p>
          </div>
        </section>
      )}

      {/* COMMUNITY VOICES */}
      {voices.length > 0 && (
        <section className="py-20 px-6" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p
                className="font-bold uppercase mb-4"
                style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
              >
                Sovereign voices
              </p>
              <h2
                className="font-fraunces font-bold mb-4"
                style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1 }}
              >
                The voices behind the numbers
              </h2>
              <p
                className="font-fraunces max-w-2xl mx-auto"
                style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.55 }}
              >
                {elQuoteCount} community voices captured in the Empathy Ledger.
                {' '}{elTranscriptCount} interviews preserved for the next generation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {voices.slice(0, 6).map((voice, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-7 transition-colors"
                  style={{ backgroundColor: '#FBF8EE', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: C.ochre }}
                >
                  <div className="font-fraunces leading-none mb-2" style={{ color: C.ochre, fontSize: 56, opacity: 0.35 }}>&ldquo;</div>
                  <p
                    className="font-fraunces italic leading-relaxed line-clamp-5 -mt-3 mb-4"
                    style={{ color: C.earth, fontSize: 16 }}
                  >
                    {voice.text}
                  </p>
                  <p className="font-bold uppercase" style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.2em' }}>
                    {voice.author}
                  </p>
                  {voice.theme && (
                    <p className="capitalize mt-1" style={{ color: C.muted, fontSize: 11 }}>
                      {voice.theme.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <a
                href="/20-years/strategy"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
                style={{ backgroundColor: C.ocean, color: '#FBF8EE', letterSpacing: '0.15em' }}
              >
                Read the Sovereignty of Care strategy
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* LOOKING AHEAD */}
      <TextSection
        title="Looking ahead"
        content={
          <div className="space-y-4">
            <p className="font-fraunces leading-relaxed" style={{ color: C.driftwood, fontSize: 19 }}>
              From our founding in 2009 to today, Palm Island Community Company has grown from a small
              community organisation into the largest employer on Palm Island — with a vision for the
              next decade that includes 300 staff, 50 services, and full economic self-determination
              for our community.
            </p>
            <p className="font-fraunces leading-relaxed" style={{ color: C.driftwood, fontSize: 19 }}>
              As we approach our 20-year anniversary in 2029, we continue to innovate — pioneering
              AI-powered reporting, establishing on-Country infrastructure, and ensuring that every
              service, every program, and every dollar serves the people of Palm Island first.
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

function HeroStat({ value, label, prefix, suffix }: { value: number; label: string; prefix?: string; suffix?: string }) {
  return (
    <div className="text-center">
      <div
        className="font-fraunces font-bold text-white"
        style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
      >
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div
        className="font-bold uppercase mt-3"
        style={{ color: '#F5E9D0', fontSize: 10, letterSpacing: '0.3em', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
      >
        {label}
      </div>
    </div>
  )
}

function StatCell({ value, label, tone }: { value: number | string; label: string; tone: 'white' | 'ochre' | 'starGold' }) {
  const numberColour = tone === 'white' ? '#FFFFFF' : tone === 'ochre' ? C.ochre : C.starGold
  return (
    <div>
      <div
        className="font-fraunces font-bold leading-none"
        style={{ color: numberColour, fontSize: 36 }}
      >
        {value}
      </div>
      <div
        className="font-bold uppercase mt-3"
        style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: '0.25em' }}
      >
        {label}
      </div>
    </div>
  )
}
