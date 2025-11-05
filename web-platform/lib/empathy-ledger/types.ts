/**
 * Empathy Ledger Types for Palm Island Community Repository
 * TypeScript interfaces for storyteller profiles and micro-stories
 */

// ============================================================================
// Storyteller Profile Types
// ============================================================================

export type StorytellerType = 
  | 'community_member' 
  | 'elder' 
  | 'youth' 
  | 'service_provider' 
  | 'cultural_advisor' 
  | 'visitor';

export type ProfileVisibility = 'public' | 'community' | 'private';

export interface Profile {
  id: string;
  user_id: string;
  
  // Identity
  full_name: string;
  preferred_name?: string;
  community_role?: string;
  
  // Contact
  email?: string;
  phone?: string;
  
  // Demographics
  age_range?: string;
  gender?: string;
  indigenous_status: string;
  
  // Location
  location: string;
  traditional_country?: string;
  language_group?: string;
  
  // Storyteller Status
  storyteller_type: StorytellerType;
  is_elder: boolean;
  is_cultural_advisor: boolean;
  is_service_provider: boolean;
  
  // Bio
  bio?: string;
  expertise_areas?: string[];
  languages_spoken?: string[];
  
  // Engagement
  stories_contributed: number;
  last_story_date?: string;
  engagement_score: number;
  
  // Cultural Permissions
  can_share_traditional_knowledge: boolean;
  face_recognition_consent: boolean;
  face_recognition_consent_date?: string;
  photo_consent_contexts?: string[];
  
  // Privacy
  profile_visibility: ProfileVisibility;
  show_in_directory: boolean;
  allow_messages: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Story Types
// ============================================================================

export type StoryType = 
  | 'community_story' 
  | 'elder_wisdom' 
  | 'service_success' 
  | 'micro_moment' 
  | 'achievement' 
  | 'challenge_overcome';

export type StoryCategory = 
  | 'health' 
  | 'youth' 
  | 'culture' 
  | 'family' 
  | 'education' 
  | 'environment' 
  | 'economic_development';

export type AccessLevel = 'public' | 'community' | 'restricted';

export type StoryStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'published' 
  | 'archived';

export type CulturalSensitivityLevel = 'low' | 'medium' | 'high' | 'restricted';

export type ImpactType = 
  | 'individual' 
  | 'family' 
  | 'community' 
  | 'service_improvement' 
  | 'cultural_preservation';

export interface Story {
  id: string;
  
  // Authorship
  storyteller_id: string;
  collected_by?: string;
  
  // Content
  title: string;
  content: string;
  content_embedding?: number[]; // Vector embedding for search
  
  // Classification
  story_type: StoryType;
  category: StoryCategory;
  sub_category?: string;
  
  // PICC Service Connection
  related_service?: string;
  
  // Impact
  impact_type?: ImpactType[];
  outcome_achieved?: string;
  people_affected?: number;
  
  // Traditional Knowledge
  contains_traditional_knowledge: boolean;
  cultural_sensitivity_level: CulturalSensitivityLevel;
  
  // Permissions
  access_level: AccessLevel;
  sharing_approved_by?: string[];
  elder_approval_required: boolean;
  elder_approval_given: boolean;
  elder_approval_date?: string;
  
  // Attribution
  attribution?: string;
  acknowledge_others?: string[];
  
  // Temporal
  story_date?: string;
  collection_date: string;
  
  // Location
  location?: string;
  location_type?: string;
  coordinates?: {x: number, y: number};
  
  // Engagement
  views: number;
  shares: number;
  likes: number;
  comments_count: number;
  
  // Quality
  is_verified: boolean;
  verification_notes?: string;
  is_featured: boolean;
  
  // Workflow
  status: StoryStatus;
  review_status?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  
  // Search & Discovery
  tags?: string[];
  keywords?: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Story with Storyteller (Joined View)
// ============================================================================

export interface StoryWithStoryteller extends Story {
  storyteller_name: string;
  storyteller_preferred_name?: string;
  storyteller_role?: string;
  storyteller_is_elder: boolean;
}

// ============================================================================
// Impact Indicator Types
// ============================================================================

export type IndicatorType = 
  | 'health_outcome' 
  | 'cultural_strengthening' 
  | 'service_access'
  | 'community_connection' 
  | 'economic_benefit' 
  | 'wellbeing_improvement';

export type MeasurementType = 
  | 'quantitative' 
  | 'qualitative' 
  | 'narrative' 
  | 'observed' 
  | 'self_reported';

export interface ImpactIndicator {
  id: string;
  story_id?: string;
  profile_id?: string;
  service_area?: string;
  
  // Impact Type
  indicator_type: IndicatorType;
  indicator_name: string;
  indicator_description?: string;
  
  // Measurement
  measurement_type: MeasurementType;
  value_numeric?: number;
  value_text?: string;
  value_category?: string;
  
  // Context
  baseline_value?: string;
  target_value?: string;
  change_observed?: string;
  significance?: string;
  
  // Temporal
  measurement_date: string;
  measurement_period_start?: string;
  measurement_period_end?: string;
  
  // Attribution
  contributed_by?: string;
  verified_by?: string;
  
  // Pattern Recognition
  pattern_category?: string;
  related_indicators?: string[];
  
  created_at: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Engagement Activity Types
// ============================================================================

export type ActivityType = 
  | 'story_created' 
  | 'story_viewed' 
  | 'story_shared' 
  | 'comment_added'
  | 'search_performed' 
  | 'profile_updated' 
  | 'service_interaction';

export interface EngagementActivity {
  id: string;
  profile_id: string;
  activity_type: ActivityType;
  
  // Target
  target_type?: string;
  target_id?: string;
  
  // Details
  activity_details?: Record<string, any>;
  engagement_score: number;
  
  // Context
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  
  created_at: string;
}

// ============================================================================
// Service Story Link Types
// ============================================================================

export interface ServiceStoryLink {
  id: string;
  story_id: string;
  service_name: string;
  
  // Service Details
  service_interaction_date?: string;
  service_outcome?: string;
  staff_member?: string;
  
  // Impact
  demonstrates_effectiveness: boolean;
  improvement_area?: string;
  replication_potential?: string;
  
  created_at: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Media Types
// ============================================================================

export type MediaType = 'photo' | 'video' | 'audio' | 'document';

export interface StoryMedia {
  id: string;
  story_id: string;
  
  // Media Details
  media_type: MediaType;
  file_path: string;
  supabase_bucket: string;
  file_name: string;
  file_size?: number;
  
  // Analysis
  media_embedding?: number[];
  ml_analysis?: {
    faces?: Array<{
      profile_id?: string;
      confidence: number;
      permission_verified: boolean;
    }>;
    places?: Array<{
      name: string;
      confidence: number;
    }>;
    objects?: Array<{
      label: string;
      confidence: number;
    }>;
    events?: Array<{
      type: string;
      confidence: number;
    }>;
  };
  
  // Permissions
  requires_permission: boolean;
  people_in_media?: string[];
  all_permissions_obtained: boolean;
  
  // Metadata
  caption?: string;
  alt_text?: string;
  display_order: number;
  created_at: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Cultural Permission Types
// ============================================================================

export type PermissionType = 
  | 'face_recognition' 
  | 'traditional_knowledge_sharing' 
  | 'photo_use'
  | 'story_sharing' 
  | 'name_use';

export type PermissionScope = 
  | 'all_contexts' 
  | 'specific_contexts' 
  | 'family_only' 
  | 'community_only';

export interface CulturalPermission {
  id: string;
  permission_type: PermissionType;
  profile_id: string;
  
  // Scope
  permission_scope: PermissionScope;
  allowed_contexts?: string[];
  
  // Status
  permission_granted: boolean;
  granted_date?: string;
  expires_date?: string;
  is_active: boolean;
  
  // Verification
  verified_by?: string;
  verification_date?: string;
  verification_notes?: string;
  
  // Revocation
  can_be_revoked: boolean;
  revoked_date?: string;
  revocation_reason?: string;
  
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Pattern Recognition Types
// ============================================================================

export type PatternType = 
  | 'service_effectiveness' 
  | 'cultural_practice_success'
  | 'community_control_impact' 
  | 'family_healing' 
  | 'youth_development';

export interface StoryPattern {
  id: string;
  pattern_name: string;
  pattern_type: PatternType;
  
  // Stories
  story_ids: string[];
  pattern_strength?: number; // 0-1
  
  // Insights
  pattern_description?: string;
  key_elements?: string[];
  success_factors?: string[];
  replication_guidance?: string;
  
  // Impact
  impact_category?: string;
  people_affected_estimate?: number;
  
  // Discovery
  discovered_by: string;
  discovery_date: string;
  
  // Verification
  verified: boolean;
  verified_by?: string;
  verification_date?: string;
  
  created_at: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Search & Filter Types
// ============================================================================

export interface SearchFilters {
  // Content Type
  story_types?: StoryType[];
  categories?: StoryCategory[];
  access_levels?: AccessLevel[];
  
  // Time Range
  date_from?: string;
  date_to?: string;
  
  // People & Places
  storyteller_ids?: string[];
  locations?: string[];
  
  // Cultural
  cultural_sensitivity?: CulturalSensitivityLevel[];
  requires_elder_approval?: boolean;
  
  // Impact
  impact_types?: ImpactType[];
  
  // Service
  related_services?: string[];
  
  // Quality
  is_featured?: boolean;
  is_verified?: boolean;
  
  // Status
  statuses?: StoryStatus[];
  
  // Tags
  tags?: string[];
}

export interface SearchResult {
  story: StoryWithStoryteller;
  relevance_score: number;
  match_type: 'semantic' | 'keyword' | 'hybrid';
  highlights?: {
    title?: string;
    content?: string;
  };
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface StorytellerStats {
  total_stories: number;
  public_stories: number;
  community_stories: number;
  restricted_stories: number;
  total_views: number;
  total_shares: number;
  engagement_score: number;
  last_story_date?: string;
}

export interface CommunityStats {
  total_storytellers: number;
  active_storytellers: number; // Contributed in last 30 days
  total_stories: number;
  stories_this_month: number;
  total_elders: number;
  total_cultural_advisors: number;
  
  // By Category
  stories_by_category: Record<StoryCategory, number>;
  
  // By Service
  stories_by_service: Record<string, number>;
  
  // Engagement
  total_views: number;
  total_shares: number;
  average_engagement_score: number;
  
  // Impact
  total_people_affected: number;
  patterns_discovered: number;
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface CreateStoryInput {
  title: string;
  content: string;
  story_type: StoryType;
  category: StoryCategory;
  sub_category?: string;
  related_service?: string;
  impact_type?: ImpactType[];
  outcome_achieved?: string;
  people_affected?: number;
  contains_traditional_knowledge?: boolean;
  access_level?: AccessLevel;
  attribution?: string;
  acknowledge_others?: string[];
  story_date?: string;
  location?: string;
  location_type?: string;
  tags?: string[];
}

export interface UpdateProfileInput {
  preferred_name?: string;
  community_role?: string;
  bio?: string;
  expertise_areas?: string[];
  languages_spoken?: string[];
  profile_visibility?: ProfileVisibility;
  show_in_directory?: boolean;
  allow_messages?: boolean;
  can_share_traditional_knowledge?: boolean;
  face_recognition_consent?: boolean;
  photo_consent_contexts?: string[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    per_page?: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
