import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { ALL_THEMES } from '@/lib/themes/theme-definitions'
import { fetchThemeContentCounts } from '@/lib/themes/theme-data-fetcher'
import { ThemeGrid } from '@/components/thematic-reports/ThemeGrid'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Explore Our Story | PICC Thematic Reports',
  description: 'Explore Palm Island Community Company through themed stories — services, innovation, eras, and vision for the future.',
}

export const revalidate = 3600 // Revalidate every hour

export default async function ThematicReportsPage() {
  const counts = await fetchThemeContentCounts(ALL_THEMES)

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-picc-red via-picc-ochre to-picc-earth py-24 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-[-0.02em] leading-[0.95]">
            Explore Our Story
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Discover Palm Island Community Company through {ALL_THEMES.length} themed stories — from individual services
            to innovation projects, historical eras, and our vision for the next decade.
          </p>
        </div>
      </section>

      {/* Theme Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <ThemeGrid themes={ALL_THEMES} counts={counts} />
      </section>
    </main>
  )
}
