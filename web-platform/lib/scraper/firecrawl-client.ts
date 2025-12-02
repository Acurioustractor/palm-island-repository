/**
 * Firecrawl Client for PICC Knowledge Scraping
 *
 * Primary scraper using Firecrawl for deep web crawling with JavaScript rendering
 */

import Firecrawl from '@mendable/firecrawl-js'

// Initialize Firecrawl client
const getFirecrawl = () => {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY is not set')
  }
  return new Firecrawl({ apiKey })
}

export interface ScrapeResult {
  url: string
  title: string | null
  content: string
  markdown: string | null
  metadata: {
    description?: string
    author?: string
    publishedDate?: string
    language?: string
    [key: string]: any
  }
  success: boolean
  error?: string
}

export interface CrawlResult {
  success: boolean
  pages: ScrapeResult[]
  totalPages: number
  error?: string
}

/**
 * Scrape a single URL and return cleaned content
 */
export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  try {
    const firecrawl = getFirecrawl()

    const response = await firecrawl.scrape(url, {
      formats: ['markdown', 'html'],
      onlyMainContent: true,
    })

    // Type guard for the response
    const doc = response as any

    if (!doc || !doc.markdown) {
      return {
        url,
        title: null,
        content: '',
        markdown: null,
        metadata: {},
        success: false,
        error: 'Scrape failed - no content'
      }
    }

    return {
      url,
      title: doc.metadata?.title || null,
      content: doc.html || doc.markdown || '',
      markdown: doc.markdown || null,
      metadata: {
        description: doc.metadata?.description,
        author: doc.metadata?.author,
        publishedDate: doc.metadata?.publishedDate,
        language: doc.metadata?.language,
        ogImage: doc.metadata?.ogImage,
        sourceURL: doc.metadata?.sourceURL,
      },
      success: true
    }
  } catch (error: any) {
    return {
      url,
      title: null,
      content: '',
      markdown: null,
      metadata: {},
      success: false,
      error: error.message
    }
  }
}

/**
 * Crawl an entire website up to a specified number of pages
 */
export async function crawlSite(
  url: string,
  options: {
    maxPages?: number
    allowedPaths?: string[]
    excludePaths?: string[]
  } = {}
): Promise<CrawlResult> {
  try {
    const firecrawl = getFirecrawl()
    const { maxPages = 50, allowedPaths, excludePaths } = options

    const crawlOptions: any = {
      limit: maxPages,
      scrapeOptions: {
        formats: ['markdown'],
        onlyMainContent: true
      }
    }

    if (allowedPaths) {
      crawlOptions.includePaths = allowedPaths
    }
    if (excludePaths) {
      crawlOptions.excludePaths = excludePaths
    }

    // Use crawlAndWait to get all documents when the crawl completes
    const response = await firecrawl.crawl(url, crawlOptions)
    const result = response as any

    if (!result || !result.success) {
      return {
        success: false,
        pages: [],
        totalPages: 0,
        error: 'Crawl failed'
      }
    }

    // Handle different response formats
    const documents = result.data || result.documents || []
    const pages: ScrapeResult[] = documents.map((page: any) => ({
      url: page.metadata?.sourceURL || page.url || url,
      title: page.metadata?.title || null,
      content: page.html || page.markdown || '',
      markdown: page.markdown || null,
      metadata: {
        description: page.metadata?.description,
        author: page.metadata?.author,
        publishedDate: page.metadata?.publishedDate,
        language: page.metadata?.language,
      },
      success: true
    }))

    return {
      success: true,
      pages,
      totalPages: pages.length
    }
  } catch (error: any) {
    return {
      success: false,
      pages: [],
      totalPages: 0,
      error: error.message
    }
  }
}

/**
 * Map a website to discover all URLs without scraping content
 */
export async function mapSite(url: string): Promise<string[]> {
  try {
    const firecrawl = getFirecrawl()
    const response = await firecrawl.map(url)
    const result = response as any

    if (!result || !result.links) {
      return []
    }

    return result.links || []
  } catch (error) {
    console.error('Map site error:', error)
    return []
  }
}
