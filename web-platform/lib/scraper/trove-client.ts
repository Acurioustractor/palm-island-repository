/**
 * Trove API v3 Client
 *
 * Integrates with the National Library of Australia's Trove API to search
 * digitised newspaper articles, books, images, and journal articles
 * related to Palm Island history.
 *
 * API docs: https://trove.nla.gov.au/about/create-something/using-api
 * Rate limit: 200 calls/min (free tier)
 */

export interface TroveArticle {
  id: string
  heading: string
  category: string
  title: string // newspaper title
  date: string // YYYY-MM-DD
  page: number | null
  snippet: string
  troveUrl: string
  articleText?: string // full text if fetched
  illustrated: boolean
}

export interface TroveSearchResult {
  total: number
  articles: TroveArticle[]
  nextStart: string | null // Trove v3 uses cursor-based pagination
}

export interface TroveImageResult {
  id: string
  title: string
  description: string
  troveUrl: string
  thumbnailUrl: string | null
  date: string | null
  creator: string | null
}

export interface TroveSearchOptions {
  query: string
  dateFrom?: string // YYYY
  dateTo?: string // YYYY
  startCursor?: string // Trove v3 cursor for pagination
  limit?: number // max 100
  sortBy?: 'relevance' | 'dateasc' | 'datedesc'
  includeFullText?: boolean
}

const TROVE_API_BASE = 'https://api.trove.nla.gov.au/v3'

function getApiKey(): string {
  const key = process.env.TROVE_API_KEY
  if (!key) {
    throw new Error(
      'TROVE_API_KEY is not set. Get a free key at https://trove.nla.gov.au/about/create-something/using-api'
    )
  }
  return key
}

/**
 * Search Trove's digitised newspaper archive
 */
export async function searchNewspapers(
  options: TroveSearchOptions
): Promise<TroveSearchResult> {
  const {
    query,
    dateFrom,
    dateTo,
    startCursor,
    limit = 20,
    sortBy = 'relevance',
  } = options

  const params = new URLSearchParams({
    q: query,
    category: 'newspaper',
    encoding: 'json',
    n: String(Math.min(limit, 100)),
    sortby: sortBy,
  })

  if (startCursor) {
    params.set('s', startCursor)
  }

  // Note: 'include=articleText' and 'l-availability=y' cause Trove API 500 errors
  // Full text is fetched per-article via getArticle() instead

  if (dateFrom || dateTo) {
    const from = dateFrom || '1803'
    const to = dateTo || '2025'
    params.set('l-dateFrom', from)
    params.set('l-dateTo', to)
  }

  const url = `${TROVE_API_BASE}/result?${params.toString()}`
  const response = await fetch(url, {
    headers: {
      'X-API-KEY': getApiKey(),
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Trove API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  // Navigate Trove's nested response structure
  const category = data?.category?.find((c: any) => c.code === 'newspaper')
  if (!category?.records?.article) {
    return { total: 0, articles: [], nextStart: null }
  }

  const total = category.records.total || 0
  const articles: TroveArticle[] = (category.records.article || []).map(
    (article: any) => ({
      id: article.id,
      heading: article.heading || '',
      category: 'newspaper',
      title: article.title?.title || article.title || '',
      date: article.date || '',
      page: article.page ? parseInt(article.page) : null,
      snippet: article.snippet || '',
      troveUrl: article.troveUrl || `https://trove.nla.gov.au/newspaper/article/${article.id}`,
      articleText: article.articleText || undefined,
      illustrated: article.illustrated === 'Y',
    })
  )

  const nextStart = category.records.nextStart || null

  return { total, articles, nextStart }
}

/**
 * Fetch full text of a specific newspaper article
 */
export async function getArticle(articleId: string): Promise<TroveArticle | null> {
  const params = new URLSearchParams({
    encoding: 'json',
    include: 'articleText',
  })

  const url = `${TROVE_API_BASE}/newspaper/${articleId}?${params.toString()}`
  const response = await fetch(url, {
    headers: {
      'X-API-KEY': getApiKey(),
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Trove API error: ${response.status} ${response.statusText}`)
  }

  const article = await response.json()

  return {
    id: article.id,
    heading: article.heading || '',
    category: 'newspaper',
    title: article.title?.title || article.title || '',
    date: article.date || '',
    page: article.page ? parseInt(article.page) : null,
    snippet: article.snippet || '',
    troveUrl: article.troveUrl || `https://trove.nla.gov.au/newspaper/article/${article.id}`,
    articleText: article.articleText || undefined,
    illustrated: article.illustrated === 'Y',
  }
}

/**
 * Search Trove for images (photographs, illustrations, maps)
 */
export async function searchImages(
  query: string,
  options: { offset?: number; limit?: number } = {}
): Promise<{ total: number; images: TroveImageResult[]; nextOffset: number | null }> {
  const { offset = 0, limit = 20 } = options

  const params = new URLSearchParams({
    q: query,
    category: 'image',
    encoding: 'json',
    n: String(Math.min(limit, 100)),
    s: String(offset),
  })

  const url = `${TROVE_API_BASE}/result?${params.toString()}`
  const response = await fetch(url, {
    headers: {
      'X-API-KEY': getApiKey(),
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Trove API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const category = data?.category?.find((c: any) => c.code === 'image')

  if (!category?.records?.work) {
    return { total: 0, images: [], nextOffset: null }
  }

  const total = category.records.total || 0
  const images: TroveImageResult[] = (category.records.work || []).map(
    (work: any) => ({
      id: work.id,
      title: work.title || '',
      description: work.snippet || '',
      troveUrl: work.troveUrl || `https://trove.nla.gov.au/work/${work.id}`,
      thumbnailUrl: work.identifier?.find((i: any) => i.linktype === 'thumbnail')?.value || null,
      date: work.issued || null,
      creator: work.contributor?.[0] || null,
    })
  )

  const nextOffset = offset + images.length < total ? offset + images.length : null

  return { total, images, nextOffset }
}

/**
 * Search Trove for books and published resources
 */
export async function searchBooks(
  query: string,
  options: { offset?: number; limit?: number } = {}
): Promise<{ total: number; works: any[]; nextOffset: number | null }> {
  const { offset = 0, limit = 20 } = options

  const params = new URLSearchParams({
    q: query,
    category: 'book',
    encoding: 'json',
    n: String(Math.min(limit, 100)),
    s: String(offset),
  })

  const url = `${TROVE_API_BASE}/result?${params.toString()}`
  const response = await fetch(url, {
    headers: {
      'X-API-KEY': getApiKey(),
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Trove API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const category = data?.category?.find((c: any) => c.code === 'book')

  if (!category?.records?.work) {
    return { total: 0, works: [], nextOffset: null }
  }

  const total = category.records.total || 0
  const works = category.records.work || []
  const nextOffset = offset + works.length < total ? offset + works.length : null

  return { total, works, nextOffset }
}

// ─── Palm Island Specific Search Queries ──────────────────────────────────────

/**
 * Pre-defined search queries for Palm Island history research.
 * Each maps to one or more chapters in content/history.md
 */
export const PALM_ISLAND_QUERIES = [
  {
    query: '"Palm Island" Aboriginal',
    chapters: ['manbarra', 'reserve', 'dormitories', 'act'],
    description: 'Broad search for Palm Island Aboriginal history',
  },
  {
    query: '"Hull River" settlement OR cyclone',
    chapters: ['hull-river'],
    description: 'Hull River settlement and 1918 cyclone',
  },
  {
    query: '"Palm Island" strike 1957',
    chapters: ['strike-1957'],
    description: '1957 Palm Island strike',
  },
  {
    query: '"Palm Island" dormitory OR dormitories',
    chapters: ['dormitories'],
    description: 'Dormitory system on Palm Island',
  },
  {
    query: '"Fantome Island" lazaret OR leper',
    chapters: ['hull-river'],
    description: 'Fantome Island lazaret (leper colony)',
  },
  {
    query: '"Palm Island" reserve Bleakley',
    chapters: ['reserve'],
    description: 'Bleakley and the establishment of the reserve',
  },
  {
    query: 'Bwgcolman',
    chapters: ['self-determination', 'picc'],
    description: 'Bwgcolman community references',
  },
  {
    query: '"Palm Island" "community company" OR PICC',
    chapters: ['picc'],
    description: 'PICC and community self-governance',
  },
  {
    query: '"Palm Island" Mulrunji OR "death in custody"',
    chapters: ['mulrunji'],
    description: 'Mulrunji Doomadgee death in custody',
  },
  {
    query: '"Aboriginals Protection" "Palm Island"',
    chapters: ['act', 'reserve'],
    description: 'Protection acts and their impact on Palm Island',
  },
] as const
