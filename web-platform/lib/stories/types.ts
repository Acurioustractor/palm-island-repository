/**
 * TypeScript Type Definitions for Story System
 * Centralized types for stories, storytellers, and placement
 */

// ============================================================================
// Core Story Types
// ============================================================================

export type StoryType =
  | 'community_story'
  | 'elder_wisdom'
  | 'service_success'
  | 'micro_moment'
  | 'achievement'
  | 'challenge_overcome';

export type EmotionalTheme =
  | 'hope_aspiration'
  | 'pride_accomplishment'
  | 'connection_belonging'
  | 'resilience'
  | 'healing'
  | 'empowerment'
  | 'innovation';

export type CulturalSensitivityLevel = 'low' | 'medium' | 'high' | 'restricted';

export type AccessLevel = 'public' | 'community' | 'restricted';

export type StoryStatus = 'draft' | 'published' | 'archived';

export interface StoryMedia {
  id: string;
  story_id: string;
  media_url: string;
  media_type: 'image' | 'photo' | 'video' | 'audio';
  caption?: string;
  display_order?: number;
  created_at: string;
}

export interface Storyteller {
  id: string;
  full_name?: string;
  preferred_name?: string;
  is_elder?: boolean;
  is_cultural_advisor?: boolean;
  can_share_traditional_knowledge?: boolean;
  bio?: string;
  profile_image_url?: string;
  traditional_country?: string;
  language_group?: string;
  created_at: string;
}

export interface Story {
  id: string;
  title: string;
  content?: string;
  story_type?: StoryType;
  category?: string;
  emotional_theme?: EmotionalTheme;

  // Relationships
  storyteller_id?: string;
  storyteller?: Storyteller;
  story_media?: StoryMedia[];

  // Publication status
  is_public?: boolean;
  is_featured?: boolean;
  is_verified?: boolean;
  status?: StoryStatus;
  published_at?: string;

  // Cultural protocols
  contains_traditional_knowledge?: boolean;
  elder_approval_given?: boolean;
  elder_approval_required?: boolean;
  elder_approval_date?: string;
  cultural_sensitivity_level?: CulturalSensitivityLevel;
  access_level?: AccessLevel;

  // Placement (intelligent assignment)
  page_context?: string;
  page_section?: string;
  display_order?: number;
  placement_metadata?: PlacementMetadata;
  auto_placed?: boolean;
  last_placement_update?: string;

  // Scores
  quality_score?: number;
  engagement_score?: number;
  cultural_score?: number;
  recency_score?: number;
  diversity_score?: number;
  total_score?: number;

  // Engagement metrics
  views?: number;
  shares?: number;
  likes?: number;

  // Metadata
  tags?: string[];
  keywords?: string[];
  impact_type?: string[];

  // Vector embedding
  embedding?: number[];

  // Timestamps
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// Placement Types
// ============================================================================

export interface PlacementMetadata {
  rule_description?: string;
  assigned_at?: string;
  score_breakdown?: StoryScores;
  manual_override?: boolean;
  curator_notes?: string;
}

export interface StoryScores {
  quality_score: number;
  engagement_score: number;
  cultural_score: number;
  recency_score: number;
  diversity_score: number;
  total_score: number;
}

export interface ScoringWeights {
  quality: number;
  engagement: number;
  cultural: number;
  recency: number;
  diversity: number;
}

export interface PlacementFilters {
  story_types?: StoryType[];
  exclude_story_types?: StoryType[];
  emotional_themes?: EmotionalTheme[];
  categories?: string[];

  // Quality filters
  min_quality_score?: number;
  min_engagement_score?: number;
  min_cultural_score?: number;
  min_recency_score?: number;

  // Feature filters
  require_verified?: boolean;
  require_featured?: boolean;
  require_media?: boolean;

  // Cultural filters
  require_elder?: boolean;
  require_cultural_advisor?: boolean;
  require_traditional_knowledge?: boolean;
  require_elder_approval?: boolean;

  // Storyteller filters
  storyteller_ids?: string[];
  exclude_storyteller_ids?: string[];
}

export interface PlacementRule {
  pageContext: string;
  pageSection: string;
  limit: number;
  filters?: PlacementFilters;
  weights?: ScoringWeights;
  description?: string;
  featured_first?: boolean;
  require_unique_storyteller?: boolean;
}

// ============================================================================
// Query Types
// ============================================================================

export interface PageStoryQuery {
  pageContext: string;
  pageSection?: string;
  limit?: number;
  offset?: number;
}

export interface StorySearchQuery {
  query: string;
  filters?: {
    story_types?: StoryType[];
    emotional_themes?: EmotionalTheme[];
    categories?: string[];
    is_elder?: boolean;
    has_media?: boolean;
  };
  limit?: number;
  offset?: number;
}

export interface SimilarStoriesQuery {
  storyId: string;
  limit?: number;
  threshold?: number;
}

// ============================================================================
// Cultural Protocol Types
// ============================================================================

export interface CulturalCheckResult {
  allowed: boolean;
  reason?: string;
  warnings?: string[];
}

export type ElderApprovalStatus = 'not_required' | 'pending' | 'approved' | 'expired';

export interface CulturalProtocolStatus {
  has_traditional_knowledge: boolean;
  elder_approval_status: ElderApprovalStatus;
  sensitivity_level: string;
  public_display_allowed: boolean;
  auto_place_allowed: boolean;
  warnings: string[];
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface StoryCardProps {
  story: Story;
  variant?: 'default' | 'featured' | 'compact' | 'list';
  showExcerpt?: boolean;
  showStorytellerInfo?: boolean;
  showCulturalWarning?: boolean;
  className?: string;
}

export interface StoryCarouselProps {
  stories?: Story[];
  pageContext?: string;
  pageSection?: string;
  limit?: number;
  autoPlay?: boolean;
  showDots?: boolean;
  className?: string;
}

export interface RelatedStoriesProps {
  currentStoryId: string;
  limit?: number;
  title?: string;
  className?: string;
}

export interface StoryGridProps {
  stories?: Story[];
  pageContext?: string;
  pageSection?: string;
  limit?: number;
  columns?: 1 | 2 | 3 | 4;
  showLoadMore?: boolean;
  className?: string;
}

export interface StoryFilterProps {
  onFilterChange: (filters: StorySearchQuery['filters']) => void;
  availableTypes?: StoryType[];
  availableThemes?: EmotionalTheme[];
  availableCategories?: string[];
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface StoryAnalytics {
  story_id: string;
  views: number;
  unique_views: number;
  shares: number;
  likes: number;
  average_read_time?: number;
  engagement_rate?: number;
  placement_effectiveness?: {
    page_context: string;
    page_section: string;
    impressions: number;
    clicks: number;
    click_through_rate: number;
  }[];
}

export interface PlacementEffectiveness {
  rule: PlacementRule;
  stories_placed: number;
  average_engagement: number;
  cultural_representation: {
    elder_stories: number;
    traditional_knowledge: number;
    cultural_advisor_stories: number;
  };
  diversity_score: number;
}

// ============================================================================
// Admin/Curation Types
// ============================================================================

export interface CurationAction {
  action: 'approve' | 'reject' | 'request_changes' | 'archive';
  curator_id: string;
  curator_name: string;
  notes?: string;
  timestamp: string;
}

export interface StoryWithCuration extends Story {
  curation_history?: CurationAction[];
  pending_review?: boolean;
  reviewer_notes?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface StoriesResponse {
  stories: Story[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface StoryDetailResponse {
  story: Story;
  relatedStories: Story[];
  similarStories: Story[];
}

export interface PlacementSummary {
  total_stories: number;
  placed_stories: number;
  coverage_percentage: number;
  placements_by_page: {
    [pageContext: string]: {
      total: number;
      sections: {
        [pageSection: string]: number;
      };
    };
  };
  cultural_representation: {
    elder_stories: number;
    traditional_knowledge_stories: number;
    community_stories: number;
  };
}

// ============================================================================
// Helper Type Guards
// ============================================================================

export function isElder(storyteller?: Storyteller): boolean {
  return storyteller?.is_elder === true;
}

export function isCulturalAdvisor(storyteller?: Storyteller): boolean {
  return storyteller?.is_cultural_advisor === true;
}

export function hasTraditionalKnowledge(story: Story): boolean {
  return story.contains_traditional_knowledge === true;
}

export function requiresElderApproval(story: Story): boolean {
  return story.elder_approval_required === true;
}

export function isHighSensitivity(story: Story): boolean {
  return story.cultural_sensitivity_level === 'high' ||
         story.cultural_sensitivity_level === 'restricted';
}

export function hasMedia(story: Story): boolean {
  return !!(story.story_media && story.story_media.length > 0);
}

export function isPublished(story: Story): boolean {
  return story.status === 'published' && story.is_public === true;
}
