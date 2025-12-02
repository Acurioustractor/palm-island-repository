/**
 * Jina AI Reader Client - Fallback Scraper
 *
 * Simple single-page extraction using Jina's Reader API
 * Free tier available, good for backup scraping
 */

export interface JinaResult {
  url: string
  title: string | null
  content: string
  success: boolean
  error?: string
}

/**
 * Fetch and extract content from a URL using Jina Reader
 */
export async function jinaFetch(url: string): Promise<JinaResult> {
  try {
    const jinaApiKey = process.env.JINA_API_KEY

    const headers: HeadersInit = {
      'Accept': 'text/markdown'
    }

    if (jinaApiKey) {
      headers['Authorization'] = `Bearer ${jinaApiKey}`
    }

    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers
    })

    if (!response.ok) {
      return {
        url,
        title: null,
        content: '',
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }

    const content = await response.text()

    // Extract title from markdown (first # heading)
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : null

    return {
      url,
      title,
      content,
      success: true
    }
  } catch (error: any) {
    return {
      url,
      title: null,
      content: '',
      success: false,
      error: error.message
    }
  }
}

/**
 * Search the web using Jina's Search API
 */
export async function jinaSearch(query: string, options: {
  maxResults?: number
} = {}): Promise<{
  results: Array<{
    title: string
    url: string
    snippet: string
  }>
  success: boolean
  error?: string
}> {
  try {
    const jinaApiKey = process.env.JINA_API_KEY
    const { maxResults = 10 } = options

    const headers: HeadersInit = {
      'Accept': 'application/json'
    }

    if (jinaApiKey) {
      headers['Authorization'] = `Bearer ${jinaApiKey}`
    }

    const response = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`, {
      headers
    })

    if (!response.ok) {
      return {
        results: [],
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }

    const data = await response.json()

    const results = (data.data || []).slice(0, maxResults).map((item: any) => ({
      title: item.title || '',
      url: item.url || '',
      snippet: item.description || item.content?.substring(0, 200) || ''
    }))

    return {
      results,
      success: true
    }
  } catch (error: any) {
    return {
      results: [],
      success: false,
      error: error.message
    }
  }
}
