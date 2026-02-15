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
