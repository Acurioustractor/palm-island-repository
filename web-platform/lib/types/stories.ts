// Shared types for story-related data fetching
// These help with Supabase's complex relation queries

import type { Database } from '@/lib/supabase/database.types'

// Base types from database
export type Story = Database['public']['Tables']['stories']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type StoryMedia = Database['public']['Tables']['story_media']['Row']

// Storyteller with minimal fields for display
export interface StorytellerInfo {
  id: string
  full_name: string | null
  preferred_name: string | null
  profile_image_url: string | null
  is_elder: boolean | null
  language_group: string | null
  community_role: string | null
}

// Service info for display
export interface ServiceInfo {
  id: string
  service_name: string | null
}

// Story with relations for list display
export interface StoryWithRelations {
  id: string
  title: string
  summary: string | null
  content: string | null
  story_category: string | null
  category: string | null
  location: string | null
  traditional_knowledge: boolean | null
  is_public: boolean | null
  created_at: string | null
  published_at: string | null
  views: number | null
  shares: number | null
  likes: number | null
  storyteller?: StorytellerInfo | null
  organization?: { id: string; name: string | null; logo_url: string | null } | null
  service?: ServiceInfo | null
  media?: StoryMedia[]
}

// Story for detailed view
export interface StoryDetail extends StoryWithRelations {
  storyteller_id: string | null
  author_id: string | null
  organization_id: string | null
  story_type: string | null
  emotional_theme: string | null
  privacy_level: string | null
  access_level: string | null
  cultural_sensitivity: string | null
  requires_elder_approval: boolean | null
  elder_approved: boolean | null
  story_date: string | null
  metadata: Record<string, unknown> | null
}

// Profile for display
export interface ProfileDisplay {
  id: string
  full_name: string | null
  preferred_name: string | null
  profile_image_url: string | null
  bio: string | null
  storyteller_type: string | null
  is_elder: boolean | null
  is_cultural_advisor: boolean | null
  location: string | null
  traditional_country: string | null
  language_group: string | null
  community_role: string | null
  stories_count?: number
}

// Dashboard stats
export interface DashboardStats {
  totalStories: number
  totalStorytellers: number
  totalProjects: number
  publicStories?: number
  draftStories?: number
}

// Pattern analysis types
export interface PatternData {
  category: string
  count: number
  percentage?: number
}

export interface LocationPattern {
  location: string
  count: number
}

export interface StorytellerPattern {
  name: string
  count: number
}

export interface MonthlyTrend {
  month: string
  count: number
}
