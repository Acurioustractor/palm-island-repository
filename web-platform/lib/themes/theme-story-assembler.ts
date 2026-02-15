import type { ThemeContent, StorySection, ThemeDefinition } from './types'

/**
 * Assembles fetched theme content into an ordered array of story-scroll sections.
 * Maps database data to the props expected by story-scroll components.
 */
export function assembleThemeStory(content: ThemeContent): StorySection[] {
  const { theme, stories, quotes, photos, metrics, achievements, staffStats } = content
  const sections: StorySection[] = []

  for (const sectionType of theme.sectionSequence) {
    switch (sectionType) {
      case 'hero':
        sections.push({
          type: 'hero',
          title: theme.title,
          subtitle: theme.subtitle,
          backgroundImage: getHeroImage(content),
        })
        break

      case 'metrics_bar':
        sections.push({
          type: 'metrics_bar',
          metrics: buildMetrics(content),
        })
        break

      case 'narrative_intro':
        sections.push({
          type: 'narrative_intro',
          title: theme.category === 'eras' ? theme.subtitle : undefined,
          content: theme.description,
        })
        break

      case 'key_stories':
        if (stories.length > 0) {
          sections.push({
            type: 'key_stories',
            stories: stories.slice(0, 6),
          })
        }
        break

      case 'elder_quotes':
        if (quotes.length > 0) {
          sections.push({
            type: 'elder_quotes',
            quotes: quotes.slice(0, 5),
          })
        }
        break

      case 'photo_gallery':
        if (photos.length > 0) {
          sections.push({
            type: 'photo_gallery',
            title: `${theme.title} Gallery`,
            photos: photos.slice(0, 12),
          })
        }
        break

      case 'timeline':
        sections.push({
          type: 'timeline',
          title: buildTimelineTitle(theme),
          events: buildTimelineEvents(content),
        })
        break

      case 'parallax_divider': {
        const dividerImage = getParallaxImage(content)
        if (dividerImage) {
          sections.push({
            type: 'parallax_divider',
            backgroundImage: dividerImage,
          })
        }
        break
      }

      case 'vision_forward':
        sections.push({
          type: 'vision_forward',
          title: 'Looking Forward',
          content: buildVisionContent(theme),
        })
        break
    }
  }

  return sections
}

// --- Helper functions ---

function getHeroImage(content: ThemeContent): string | undefined {
  // Try first story's hero image, then first photo
  if (content.stories[0]?.heroImage) return content.stories[0].heroImage
  if (content.photos[0]) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${content.photos[0].supabase_bucket}/${content.photos[0].file_path}`
  }
  return undefined
}

function getParallaxImage(content: ThemeContent): string | undefined {
  // Use a photo from the middle of the collection for visual variety
  const midIdx = Math.floor(content.photos.length / 2)
  const photo = content.photos[midIdx]
  if (photo) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${photo.supabase_bucket}/${photo.file_path}`
  }
  return content.stories[1]?.heroImage || undefined
}

function buildMetrics(content: ThemeContent): Array<{ label: string; value: string | number }> {
  const metricsList: Array<{ label: string; value: string | number }> = []

  // Service-level metrics
  for (const m of content.metrics) {
    if (m.headline_stat_value && m.headline_stat_label) {
      metricsList.push({ label: m.headline_stat_label, value: m.headline_stat_value })
    }
    if (m.clients_served) {
      metricsList.push({ label: 'Clients Served', value: m.clients_served.toLocaleString() })
    }
    if (m.sessions_delivered) {
      metricsList.push({ label: 'Sessions Delivered', value: m.sessions_delivered.toLocaleString() })
    }
    if (m.staff_count) {
      metricsList.push({ label: 'Staff', value: m.staff_count })
    }
  }

  // Staff stats for era/vision themes
  if (content.staffStats.length > 0) {
    const latest = content.staffStats[0]
    metricsList.push({ label: 'Total Staff', value: latest.total_staff })
    if (latest.indigenous_staff_count) {
      metricsList.push({ label: 'Indigenous Staff', value: latest.indigenous_staff_count })
    }
    if (latest.palm_island_resident_count) {
      metricsList.push({ label: 'Palm Island Residents', value: latest.palm_island_resident_count })
    }
  }

  // Content counts
  if (content.stories.length > 0) {
    metricsList.push({ label: 'Stories', value: content.stories.length })
  }
  if (content.photos.length > 0) {
    metricsList.push({ label: 'Photos', value: content.photos.length })
  }

  return metricsList.slice(0, 6)
}

function buildTimelineTitle(theme: ThemeDefinition): string {
  if (theme.category === 'eras') return `Key Moments: ${theme.title}`
  if (theme.category === 'vision') return 'Milestones'
  return `${theme.title} Timeline`
}

function buildTimelineEvents(content: ThemeContent): Array<{ date: string; title: string; description: string }> {
  const events: Array<{ date: string; title: string; description: string }> = []

  // Achievements as timeline events
  for (const a of content.achievements) {
    events.push({
      date: `FY ${a.fiscal_year}`,
      title: a.achievement_text.slice(0, 60) + (a.achievement_text.length > 60 ? '...' : ''),
      description: a.achievement_text,
    })
  }

  // Stories with dates as timeline events
  for (const s of content.stories) {
    if (s.story_date || s.published_at) {
      const date = s.story_date || s.published_at || ''
      events.push({
        date: new Date(date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short' }),
        title: s.title,
        description: s.content.slice(0, 150) + '...',
      })
    }
  }

  // Sort by date string (fiscal year or actual date)
  return events.slice(0, 10)
}

function buildVisionContent(theme: ThemeDefinition): string {
  const categoryMessages: Record<string, string> = {
    services: `${theme.title} continues to evolve, shaped by community needs and driven by Palm Islanders. As PICC approaches its 20th anniversary, this service represents the community's commitment to self-determination and culturally appropriate care.`,
    innovation: `${theme.title} is part of PICC's broader innovation strategy — proving that remote Indigenous communities can lead in technology, storytelling, and community development. The next decade will see this work scale and inspire other communities.`,
    eras: `The lessons from this era continue to shape PICC's approach. Each challenge overcome and milestone reached has strengthened the organization's capacity to serve Palm Island on its own terms.`,
    vision: `This vision belongs to the community. Every service delivered, every story collected, every innovation launched brings Palm Island closer to a future where the community determines its own path — stronger, safer, and more prosperous.`,
  }
  return categoryMessages[theme.category] || categoryMessages.services
}
