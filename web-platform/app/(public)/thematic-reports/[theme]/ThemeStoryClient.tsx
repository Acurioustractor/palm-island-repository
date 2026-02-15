'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { HeroSection } from '@/components/story-scroll/HeroSection'
import { TextSection } from '@/components/story-scroll/TextSection'
import { QuoteSection } from '@/components/story-scroll/QuoteSection'
import { ImageGallery } from '@/components/story-scroll/ImageGallery'
import { TimelineSection } from '@/components/story-scroll/TimelineSection'
import { ParallaxSection } from '@/components/story-scroll/ParallaxSection'
import { SideBySideSection } from '@/components/story-scroll/SideBySideSection'
import { ScrollReveal } from '@/components/story-scroll/ScrollReveal'
import { MetricsBar } from '@/components/thematic-reports/MetricsBar'
import { PrintReportFAB } from '@/components/thematic-reports/PrintReportFAB'
import type { StorySection, ThemeCategory } from '@/lib/themes/types'

interface ThemeStoryClientProps {
  theme: {
    slug: string
    title: string
    subtitle: string
    category: ThemeCategory
    color: string
  }
  sections: StorySection[]
  supabaseUrl: string
}

export function ThemeStoryClient({ theme, sections, supabaseUrl }: ThemeStoryClientProps) {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function getPhotoUrl(photo: { supabase_bucket: string; file_path: string }): string {
    return `${supabaseUrl}/storage/v1/object/public/${photo.supabase_bucket}/${photo.file_path}`
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-gray-200/50">
        <div
          className={`h-full bg-gradient-to-r ${theme.color} transition-[width] duration-150`}
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Back link */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/thematic-reports"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-sm text-gray-700 hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Themes
        </Link>
      </div>

      {/* Render sections */}
      {sections.map((section, index) => (
        <SectionRenderer
          key={`${section.type}-${index}`}
          section={section}
          theme={theme}
          getPhotoUrl={getPhotoUrl}
        />
      ))}

      {/* Print FAB */}
      <PrintReportFAB themeSlug={theme.slug} themeTitle={theme.title} />
    </main>
  )
}

// --- Section renderer ---

function SectionRenderer({
  section,
  theme,
  getPhotoUrl,
}: {
  section: StorySection
  theme: { slug: string; title: string; color: string }
  getPhotoUrl: (photo: { supabase_bucket: string; file_path: string }) => string
}) {
  switch (section.type) {
    case 'hero':
      return (
        <HeroSection
          title={section.title}
          subtitle={section.subtitle}
          backgroundImage={section.backgroundImage}
          height="screen"
          overlay="gradient"
        />
      )

    case 'metrics_bar':
      return <MetricsBar metrics={section.metrics} />

    case 'narrative_intro':
      return (
        <TextSection
          title={section.title}
          content={<p className="text-lg leading-relaxed">{section.content}</p>}
          maxWidth="medium"
          textAlign="center"
        />
      )

    case 'key_stories':
      return (
        <div>
          {section.stories.map((story, i) => (
            <SideBySideSection
              key={story.id}
              title={story.title}
              content={
                <div>
                  <p className="text-gray-700 leading-relaxed">
                    {story.content.length > 400
                      ? story.content.slice(0, 400) + '...'
                      : story.content}
                  </p>
                  {story.outcome_achieved && (
                    <p className="mt-4 text-sm font-medium text-picc-red">
                      {story.outcome_achieved}
                    </p>
                  )}
                  <Link
                    href={`/stories/${story.id}`}
                    className="inline-block mt-4 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Read full story &rarr;
                  </Link>
                </div>
              }
              mediaUrl={story.heroImage || ''}
              mediaPosition={i % 2 === 0 ? 'right' : 'left'}
              mediaAlt={story.title}
              backgroundColor={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            />
          ))}
        </div>
      )

    case 'elder_quotes':
      return (
        <div>
          {section.quotes.map((quote, i) => (
            <QuoteSection
              key={quote.id}
              quote={quote.quote_text}
              author={quote.story?.title}
              size={i === 0 ? 'large' : 'medium'}
              backgroundColor={
                i % 2 === 0
                  ? 'bg-gradient-to-br from-warm-50 to-warm-100'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100'
              }
            />
          ))}
        </div>
      )

    case 'photo_gallery':
      return (
        <ImageGallery
          title={section.title}
          images={section.photos.map(p => ({
            url: getPhotoUrl(p),
            alt: p.alt_text || p.file_name,
            caption: p.caption || undefined,
          }))}
          columns={3}
        />
      )

    case 'timeline':
      return (
        <TimelineSection
          title={section.title}
          events={section.events.map(e => ({
            date: e.date,
            title: e.title,
            description: e.description,
          }))}
        />
      )

    case 'parallax_divider':
      return (
        <ParallaxSection
          backgroundImage={section.backgroundImage}
          height="h-[60vh]"
        >
          {section.text && (
            <p className="text-3xl md:text-5xl font-bold text-white text-center max-w-3xl">
              {section.text}
            </p>
          )}
        </ParallaxSection>
      )

    case 'vision_forward':
      return (
        <TextSection
          title={section.title}
          content={
            <div>
              <p className="text-lg leading-relaxed">{section.content}</p>
              <div className="mt-8 flex justify-center">
                <Link
                  href="/thematic-reports"
                  className="px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Explore More Themes
                </Link>
              </div>
            </div>
          }
          maxWidth="medium"
          textAlign="center"
          backgroundColor="bg-gray-50"
        />
      )

    default:
      return null
  }
}
