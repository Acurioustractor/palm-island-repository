import type { UIMessage } from 'ai'

export interface ChatSource {
  id: string
  title: string
  url: string
  type: string
}

/**
 * Extract source citations from tool results in a UIMessage.
 * Inspects completed tool invocations and extracts linkable sources.
 */
export function extractSourcesFromMessage(message: UIMessage): ChatSource[] {
  const sources: ChatSource[] = []

  for (const part of message.parts) {
    // Tool parts have type like 'tool-searchStories'
    if (!part.type.startsWith('tool-')) continue

    const toolPart = part as { type: string; state?: string; output?: unknown }
    if (toolPart.state !== 'output-available' || !toolPart.output) continue

    const toolName = part.type.slice(5)
    const data = toolPart.output as Record<string, unknown>

    switch (toolName) {
      case 'searchStories': {
        const stories = data.stories as Array<{ id: string; title: string }> | undefined
        if (stories) {
          for (const story of stories) {
            sources.push({
              id: story.id,
              title: story.title,
              url: `/stories/${story.id}`,
              type: 'story',
            })
          }
        }
        break
      }

      case 'getServiceInfo': {
        if (data.found && data.service) {
          const svc = data.service as { slug: string; name: string }
          sources.push({
            id: svc.slug,
            title: svc.name,
            url: `/services`,
            type: 'service',
          })
        }
        break
      }

      case 'getInnovationProjects': {
        if (data.project) {
          const p = data.project as { slug: string; name: string }
          sources.push({
            id: p.slug,
            title: p.name,
            url: `/wiki/innovation/${p.slug}`,
            type: 'project',
          })
        }
        const projects = data.projects as Array<{ slug: string; name: string }> | undefined
        if (projects) {
          for (const p of projects) {
            sources.push({
              id: p.slug,
              title: p.name,
              url: `/wiki/innovation/${p.slug}`,
              type: 'project',
            })
          }
        }
        break
      }

      case 'exploreTimeline': {
        sources.push({
          id: 'timeline',
          title: 'PICC Timeline',
          url: '/timeline',
          type: 'timeline',
        })
        break
      }

      case 'getServiceMetrics': {
        if (data.service) {
          const metrics = data.annualMetrics as Array<{ organization_service_id?: string }> | undefined
          const slug = metrics?.[0]?.organization_service_id || 'metrics'
          sources.push({
            id: slug,
            title: data.service as string,
            url: '/services',
            type: 'service',
          })
        }
        break
      }

      case 'getBoardAndLeadership': {
        sources.push({
          id: 'board',
          title: 'Board & Leadership',
          url: '/about',
          type: 'board',
        })
        break
      }

      case 'getInterview': {
        if (data.interview) {
          const iv = data.interview as { id: string; interview_title: string }
          sources.push({
            id: iv.id,
            title: iv.interview_title || 'Interview',
            url: `/wiki/people`,
            type: 'interview',
          })
        }
        const interviews = data.interviews as Array<{ id: string; interview_title: string }> | undefined
        if (interviews) {
          for (const iv of interviews.slice(0, 5)) {
            sources.push({
              id: iv.id,
              title: iv.interview_title,
              url: `/wiki/people`,
              type: 'interview',
            })
          }
        }
        break
      }

      case 'getAnnualReportArchive': {
        const reports = data.reports as Array<{ fiscal_year: string; title?: string }> | undefined
        if (reports) {
          for (const r of reports) {
            sources.push({
              id: r.fiscal_year,
              title: r.title || `Annual Report ${r.fiscal_year}`,
              url: '/annual-reports',
              type: 'report',
            })
          }
        }
        break
      }

      case 'getPublications': {
        const pubs = data.publications as Array<{ slug: string; title: string }> | undefined
        if (pubs) {
          for (const p of pubs) {
            sources.push({
              id: p.slug,
              title: p.title,
              url: '/publications',
              type: 'publication',
            })
          }
        }
        break
      }

      case 'getDeepHistory': {
        sources.push({
          id: 'deep-history',
          title: 'PICC History & Timeline',
          url: '/timeline',
          type: 'history',
        })
        break
      }

      case 'getImpactIndicators': {
        sources.push({
          id: 'impact',
          title: 'Impact Indicators',
          url: '/explore',
          type: 'impact',
        })
        break
      }

      case 'getImmersiveStories': {
        if (data.story) {
          const s = data.story as { slug: string; title: string }
          sources.push({
            id: s.slug,
            title: s.title,
            url: `/immersive-stories/${s.slug}`,
            type: 'immersive',
          })
        }
        const immStories = data.stories as Array<{ slug: string; title: string }> | undefined
        if (immStories) {
          for (const s of immStories) {
            sources.push({
              id: s.slug,
              title: s.title,
              url: `/immersive-stories/${s.slug}`,
              type: 'immersive',
            })
          }
        }
        break
      }

      case 'getGrantsAndPartnerships': {
        sources.push({
          id: 'partners',
          title: 'Partners & Grants',
          url: '/about',
          type: 'partner',
        })
        break
      }

      case 'findQuotes': {
        const quotes = data.quotes as Array<{ storyId?: string; storyTitle?: string }> | undefined
        if (quotes) {
          for (const quote of quotes) {
            if (quote.storyId) {
              sources.push({
                id: quote.storyId,
                title: quote.storyTitle || 'Community Quote',
                url: `/stories/${quote.storyId}`,
                type: 'quote',
              })
            }
          }
        }
        break
      }
    }
  }

  // Deduplicate by id
  const seen = new Set<string>()
  return sources.filter(s => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return true
  })
}
