import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getThemeBySlug, ALL_THEMES } from '@/lib/themes/theme-definitions'
import { fetchThemeContent } from '@/lib/themes/theme-data-fetcher'
import { assembleThemeStory } from '@/lib/themes/theme-story-assembler'
import { ThemeStoryClient } from './ThemeStoryClient'

interface PageProps {
  params: Promise<{ theme: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { theme: slug } = await params
  const theme = getThemeBySlug(slug)
  if (!theme) return { title: 'Theme Not Found' }

  return {
    title: `${theme.title} | PICC Thematic Report`,
    description: theme.subtitle,
  }
}

export async function generateStaticParams() {
  return ALL_THEMES.map(theme => ({ theme: theme.slug }))
}

export const revalidate = 3600

export default async function ThemePage({ params }: PageProps) {
  const { theme: slug } = await params
  const theme = getThemeBySlug(slug)
  if (!theme) notFound()

  const content = await fetchThemeContent(theme)
  const sections = assembleThemeStory(content)

  return (
    <ThemeStoryClient
      theme={{
        slug: theme.slug,
        title: theme.title,
        subtitle: theme.subtitle,
        category: theme.category,
        color: theme.color,
      }}
      sections={sections}
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL || ''}
    />
  )
}
