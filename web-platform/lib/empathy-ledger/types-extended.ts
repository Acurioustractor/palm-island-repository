/**
 * Extended Types for Multi-Organization Support and Annual Reports
 * Extends the core Empathy Ledger types with organization management
 */

import type { Database } from './database.types';

// ============================================================================
// ORGANIZATION TYPES
// ============================================================================

export type OrganizationType =
  | 'aboriginal_community'
  | 'torres_strait_islander'
  | 'indigenous_ngo'
  | 'government_service'
  | 'healthcare'
  | 'education'
  | 'environmental'
  | 'social_services'
  | 'arts_culture'
  | 'economic_development'
  | 'other';

export interface Organization {
  id: string;
  
  // Basic Information
  name: string;
  legal_name: string | null;
  short_name: string | null;
  organization_type: OrganizationType;
  
  // Identity & Branding
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  tagline: string | null;
  mission_statement: string | null;
  
  // Location
  primary_location: string | null;
  traditional_country: string | null;
  language_groups: string[] | null;
  service_locations: string[] | null;
  coordinates: { x: number; y: number } | null;
  
  // Contact Information
  website: string | null;
  email: string | null;
  phone: string | null;
  postal_address: string | null;
  physical_address: string | null;
  
  // Organizational Details
  established_date: string | null;
  abn: string | null;
  indigenous_controlled: boolean;
  governance_model: string | null;
  
  // Empathy Ledger Configuration
  empathy_ledger_enabled: boolean;
  annual_reports_enabled: boolean;
  impact_tracking_enabled: boolean;
  
  // Cultural Protocols
  has_cultural_protocols: boolean;
  elder_approval_required: boolean;
  cultural_advisor_ids: string[] | null;
  
  // Settings
  default_story_access_level: 'public' | 'community' | 'restricted';
  require_story_approval: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string | null;
  metadata: Record<string, any>;
}

export interface OrganizationWithStats extends Organization {
  member_count: number;
  service_count: number;
  story_count: number;
  report_count: number;
}

// ============================================================================
// ORGANIZATION SERVICE TYPES
// ============================================================================

export type ServiceCategory =
  | 'health'
  | 'youth'
  | 'family'
  | 'education'
  | 'culture'
  | 'environment'
  | 'economic'
  | 'justice'
  | 'housing'
  | 'other';

export interface OrganizationService {
  id: string;
  
  // Organization Connection
  organization_id: string;
  
  // Service Details
  service_name: string;
  service_slug: string;
  description: string | null;
  service_category: ServiceCategory;
  
  // Service Operations
  manager_profile_id: string | null;
  staff_count: number;
  is_active: boolean;
  start_date: string | null;
  
  // Service Metrics
  clients_served_annual: number | null;
  budget_annual: number | null;
  
  // Impact Tracking
  impact_categories: string[] | null;
  story_count: number;
  
  // Branding
  service_color: string | null;
  icon_name: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

// ============================================================================
// ORGANIZATION MEMBERSHIP TYPES
// ============================================================================

export type MemberRole =
  | 'admin'
  | 'manager'
  | 'coordinator'
  | 'staff'
  | 'member'
  | 'contributor'
  | 'elder'
  | 'cultural_advisor'
  | 'board_member';

export interface OrganizationMember {
  id: string;
  
  // Connections
  organization_id: string;
  profile_id: string;
  
  // Membership Details
  role: MemberRole;
  
  // Service Assignment
  service_id: string | null;
  
  // Permissions
  can_approve_stories: boolean;
  can_manage_reports: boolean;
  can_view_analytics: boolean;
  can_manage_members: boolean;
  
  // Status
  is_active: boolean;
  join_date: string;
  end_date: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

// ============================================================================
// ANNUAL REPORT TYPES
// ============================================================================

export type ReportStatus =
  | 'planning'
  | 'collecting'
  | 'drafting'
  | 'review'
  | 'approved'
  | 'published'
  | 'archived';

export type ReportTemplate =
  | 'traditional'
  | 'modern'
  | 'photo_story'
  | 'youth_focused'
  | 'professional';

export interface ReportSection {
  type: string;
  enabled: boolean;
  order: number;
  required?: boolean;
}

export interface AnnualReport {
  id: string;
  
  // Organization & Period
  organization_id: string;
  report_year: number;
  reporting_period_start: string;
  reporting_period_end: string;
  
  // Report Details
  title: string;
  subtitle: string | null;
  theme: string | null;
  
  // Status & Workflow
  status: ReportStatus;
  
  // Template & Design
  template_name: ReportTemplate;
  cover_image_url: string | null;
  
  // Content Selections
  featured_story_ids: string[] | null;
  auto_include_criteria: Record<string, any> | null;
  exclude_story_ids: string[] | null;
  
  // Report Sections Configuration
  sections_config: ReportSection[];
  
  // Content
  executive_summary: string | null;
  leadership_message: string | null;
  leadership_message_author: string | null;
  year_highlights: string[] | null;
  looking_forward: string | null;
  acknowledgments: string | null;
  
  // Data & Statistics
  statistics: Record<string, any>;
  
  // Cultural Protocols
  elder_approval_required: boolean;
  elder_approvals: string[] | null;
  elder_approval_date: string | null;
  cultural_advisor_review: boolean;
  cultural_notes: string | null;
  
  // Generation & Publication
  auto_generated: boolean;
  generation_date: string | null;
  generated_by: string | null;
  
  published_date: string | null;
  published_by: string | null;
  
  pdf_url: string | null;
  web_version_url: string | null;
  
  // Distribution
  distribution_list: string[] | null;
  distribution_date: string | null;
  
  // Engagement
  views: number;
  downloads: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string | null;
  metadata: Record<string, any>;
}

export interface AnnualReportWithStats extends AnnualReport {
  organization_name: string;
  organization_logo: string | null;
  story_count: number;
  feedback_count: number;
  average_rating: number | null;
}

// ============================================================================
// ANNUAL REPORT STORY LINK TYPES
// ============================================================================

export type StoryInclusionReason =
  | 'featured'
  | 'category_representative'
  | 'impact_highlight'
  | 'elder_wisdom'
  | 'service_success'
  | 'auto_selected';

export interface AnnualReportStory {
  id: string;
  
  // Connections
  report_id: string;
  story_id: string;
  
  // Story Inclusion Details
  inclusion_reason: StoryInclusionReason | null;
  section_placement: string | null;
  display_order: number;
  is_featured: boolean;
  
  // Customization for Report
  custom_title: string | null;
  custom_excerpt: string | null;
  include_full_text: boolean;
  
  // Media Selection
  selected_media_ids: string[] | null;
  
  // Metadata
  added_at: string;
  added_by: string | null;
  metadata: Record<string, any>;
}

// ============================================================================
// REPORT SECTION TYPES
// ============================================================================

export type ReportSectionLayout =
  | 'standard'
  | 'two_column'
  | 'image_focus'
  | 'data_focus'
  | 'timeline';

export type ContentFormat = 'markdown' | 'html' | 'plain_text';

export interface ReportSectionDetail {
  id: string;
  
  // Report Connection
  report_id: string;
  
  // Section Details
  section_type: string;
  section_title: string;
  section_content: string | null;
  
  // Organization
  display_order: number;
  page_break_before: boolean;
  
  // Styling
  layout_style: ReportSectionLayout;
  background_color: string | null;
  
  // Content Elements
  include_stories: boolean;
  story_ids: string[] | null;
  
  include_media: boolean;
  media_ids: string[] | null;
  
  include_data_viz: boolean;
  data_viz_config: Record<string, any> | null;
  
  // Custom HTML/Markdown
  custom_content: string | null;
  content_format: ContentFormat;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string | null;
  metadata: Record<string, any>;
}

// ============================================================================
// REPORT TEMPLATE TYPES
// ============================================================================

export interface ReportTemplateDesignConfig {
  colorScheme: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  typography?: {
    headingFont: string;
    bodyFont: string;
  };
  layoutStyle: string;
  includePatterns: boolean;
  patternStyle?: string;
  culturalElements?: boolean;
}

export interface ReportTemplateDefinition {
  id: string;
  
  // Template Identity
  template_name: string;
  display_name: string;
  description: string | null;
  
  // Template Type
  category: string;
  
  // Design Configuration
  design_config: ReportTemplateDesignConfig;
  
  // Default Sections
  default_sections: ReportSection[];
  
  // Template Assets
  cover_template_url: string | null;
  header_template_url: string | null;
  footer_template_url: string | null;
  
  // Availability
  is_public: boolean;
  organization_id: string | null;
  
  // Usage
  usage_count: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string | null;
  metadata: Record<string, any>;
}

// ============================================================================
// REPORT FEEDBACK TYPES
// ============================================================================

export type FeedbackType =
  | 'community_member'
  | 'staff'
  | 'elder'
  | 'cultural_advisor'
  | 'external';

export interface ReportFeedback {
  id: string;
  
  // Report Connection
  report_id: string;
  
  // Feedback Provider
  profile_id: string | null;
  feedback_type: FeedbackType;
  
  // Feedback Content
  rating: number | null;
  feedback_text: string | null;
  
  // Specific Feedback Areas
  liked_sections: string[] | null;
  improvement_areas: string[] | null;
  missing_content: string | null;
  design_feedback: string | null;
  
  // Action
  is_addressed: boolean;
  response_text: string | null;
  responded_by: string | null;
  responded_at: string | null;
  
  // Metadata
  created_at: string;
  metadata: Record<string, any>;
}

// ============================================================================
// HELPER TYPES FOR OPERATIONS
// ============================================================================

export interface OrganizationStats {
  total_members: number;
  active_services: number;
  total_stories: number;
  stories_this_year: number;
  total_reports: number;
  published_reports: number;
}

export interface StoryForReport {
  story_id: string;
  story_title: string;
  category: string;
  impact_score: number;
  relevance_score: number;
}

export interface CreateOrganizationInput {
  name: string;
  organization_type: OrganizationType;
  primary_location?: string;
  traditional_country?: string;
  mission_statement?: string;
  website?: string;
  email?: string;
  phone?: string;
  indigenous_controlled?: boolean;
}

export interface CreateServiceInput {
  organization_id: string;
  service_name: string;
  service_slug: string;
  service_category: ServiceCategory;
  description?: string;
  service_color?: string;
  icon_name?: string;
}

export interface CreateAnnualReportInput {
  organization_id: string;
  report_year: number;
  title: string;
  template_name?: ReportTemplate;
  auto_include_criteria?: Record<string, any>;
}

export interface SelectStoriesForReportParams {
  organization_id: string;
  report_year: number;
  categories?: string[];
  min_impact_score?: number;
  include_featured?: boolean;
  include_elder_wisdom?: boolean;
  max_stories?: number;
}

// ============================================================================
// PICC-SPECIFIC TYPES
// ============================================================================

export const PICC_SERVICES = [
  'bwgcolman_healing',
  'family_wellbeing',
  'youth_services',
  'early_learning',
  'cultural_centre',
  'ranger_program',
  'digital_services',
  'economic_development',
  'housing_services',
  'elder_support',
  'community_justice',
  'womens_services',
  'mens_programs',
  'food_security',
  'sports_recreation',
  'transport',
] as const;

export type PICCService = (typeof PICC_SERVICES)[number];

export interface PICCServiceConfig {
  slug: PICCService;
  name: string;
  category: ServiceCategory;
  color: string;
  icon: string;
  description: string;
}

// ============================================================================
// VIEW TYPES (for database views)
// ============================================================================

export interface OrganizationOverview extends Organization {
  member_count: number;
  service_count: number;
  story_count: number;
  report_count: number;
}

export interface AnnualReportWithStatsView extends AnnualReport {
  organization_name: string;
  organization_logo: string | null;
  story_count: number;
  feedback_count: number;
  average_rating: number | null;
}
