export type ContentType = 'story' | 'quote' | 'photo' | 'video' | 'person' | 'milestone'

export interface ContentItem {
  id: string
  type: ContentType
  title: string
  preview: string
  imageUrl?: string | null
  author?: string | null
  date?: string | null
  tags: string[]
  score: number
  selected: boolean
  metadata: Record<string, any>
}

export interface ContentCollection {
  id: string
  name: string
  purpose: string
  items: ContentItem[]
  createdAt: string
  updatedAt: string
}

export interface ContentRecommendation {
  item: ContentItem
  reason: string
  confidence: number
}

export interface CurationContext {
  page: string
  audience: string
  theme?: string
  maxItems?: number
}
