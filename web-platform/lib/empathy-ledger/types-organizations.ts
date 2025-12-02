/**
 * Organization and Annual Report Types for Empathy Ledger
 * Extends the core Empathy Ledger to support any organization
 */

// ============================================================================
// Organization Types
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

export type GovernanceModel = 
  | 'board_managed'
  | 'community_controlled'
  | 'cooperative'
  | 'government'
  | 'not_for_profit'
  | 'other';

export interface Organization {
  id: string;
  
  // Basic Information
  name: string;
  legal_name?: string;
  short_name?: string;
  organization_type: OrganizationType;
  
  // Identity & Branding
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  tagline?: string;
  mission_statement?: string;
  
  // Location
  primary_location?: string;
  traditional_country?: string;
  language_groups?: string[];
  service_locations?: string[];
  coordinates?: {x: number, y: number};
  
  // Contact Information
  website?: string;
  email?: string;
  phone?: string;
  postal_address?: string;
  physical_address?: string;
  
  // Organizational Details
  established_date?: string;
  abn?: string;
  indigenous_controlled: boolean;
  governance_model?: GovernanceModel;
  
  // Empathy Ledger Configuration
  empathy_ledger_enabled: boolean;
  annual_reports_enabled: boolean;
  impact_tracking_enabled: boolean;
  
  // Cultural Protocols
  has_cultural_protocols: boolean;
  elder_approval_required: boolean;
  cultural_advisor_ids?: string[];
  
  // Settings
  default_story_access_level: 'public' | 'community' | 'restricted';
  require_story_approval: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Organization Services Types
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
  organization_id: string;
  
  // Service Details
  service_name: string;
  service_slug: string;
  description?: string;
  service_category: ServiceCategory;
  
  // Service Operations
  manager_profile_id?: string;
  staff_count: number;
  is_active: boolean;
  start_date?: string;
  
  // Service Metrics
  clients_served_annual?: number;
  budget_annual?: number;
  
  // Impact Tracking
  impact_categories?: string[];
  story_count: number;
  
  // Branding
  service_color?: string;
  icon_name?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Organization Membership Types
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
  service_id?: string;
  
  // Permissions
  can_approve_stories: boolean;
  can_manage_reports: boolean;
  can_view_analytics: boolean;
  can_manage_members: boolean;
  
  // Status
  is_active: boolean;
  join_date: string;
  end_date?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Annual Report Types
// ============================================================================

export type ReportStatus = 
  | 'planning'
  | 'collecting'
  | 'drafting'
  | 'review'
  | 'approved'
  | 'published'
  | 'archived';

export type ReportTemplateName = 
  | 'traditional'
  | 'modern_professional'
  | 'photo_story'
  | 'youth_focused'
  | 'custom';

export interface AnnualReport {
  id: string;
  
  // Organization & Period
  organization_id: string;
  report_year: number;
  reporting_period_start: string;
  reporting_period_end: string;
  
  // Report Details
  title: string;
  subtitle?: string;
  theme?: string;
  
  // Status & Workflow
  status: ReportStatus;
  
  // Template & Design
  template_name: ReportTemplateName;
  cover_image_url?: string;
  
  // Content Selections
  featured_story_ids?: string[];
  auto_include_criteria?: Record<string, any>;
  exclude_story_ids?: string[];
  
  // Report Sections Configuration
  sections_config: ReportSectionConfig[];
  
  // Content
  executive_summary?: string;
  leadership_message?: string;
  leadership_message_author?: string;
  year_highlights?: string[];
  looking_forward?: string;
  acknowledgments?: string;
  
  // Data & Statistics
  statistics?: Record<string, any>;
  
  // Cultural Protocols
  elder_approval_required: boolean;
  elder_approvals?: string[];
  elder_approval_date?: string;
  cultural_advisor_review: boolean;
  cultural_notes?: string;
  
  // Generation & Publication
  auto_generated: boolean;
  generation_date?: string;
  generated_by?: string;
  
  published_date?: string;
  published_by?: string;
  
  pdf_url?: string;
  web_version_url?: string;
  
  // Distribution
  distribution_list?: string[];
  distribution_date?: string;
  
  // Engagement
  views: number;
  downloads: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata?: Record<string, any>;
}

export interface ReportSectionConfig {
  type: string;
  enabled: boolean;
  order: number;
  required?: boolean;
}

// ============================================================================
// Annual Report Stories Types
// ============================================================================

export type InclusionReason = 
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
  inclusion_reason?: InclusionReason;
  section_placement?: string;
  display_order: number;
  is_featured: boolean;
  
  // Customization for Report
  custom_title?: string;
  custom_excerpt?: string;
  include_full_text: boolean;
  
  // Media Selection
  selected_media_ids?: string[];
  
  // Metadata
  added_at: string;
  added_by?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Report Sections Types
// ============================================================================

export type LayoutStyle = 
  | 'standard'
  | 'two_column'
  | 'image_focus'
  | 'data_focus'
  | 'timeline';

export type ContentFormat = 'markdown' | 'html' | 'plain_text';

export interface ReportSection {
  id: string;
  report_id: string;
  
  // Section Details
  section_type: string;
  section_title: string;
  section_content?: string;
  
  // Organization
  display_order: number;
  page_break_before: boolean;
  
  // Styling
  layout_style: LayoutStyle;
  background_color?: string;
  
  // Content Elements
  include_stories: boolean;
  story_ids?: string[];
  
  include_media: boolean;
  media_ids?: string[];
  
  include_data_viz: boolean;
  data_viz_config?: Record<string, any>;
  
  // Custom HTML/Markdown
  custom_content?: string;
  content_format: ContentFormat;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Report Templates Types
// ============================================================================

export type TemplateCategory = 
  | 'general'
  | 'indigenous_focused'
  | 'youth'
  | 'health'
  | 'environmental'
  | 'education'
  | 'other';

export interface ReportTemplate {
  id: string;
  
  // Template Identity
  template_name: string;
  display_name: string;
  description?: string;
  
  // Template Type
  category: TemplateCategory;
  
  // Design Configuration
  design_config: {
    colorScheme?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    typography?: {
      headingFont?: string;
      bodyFont?: string;
    };
    layoutStyle?: string;
    includePatterns?: boolean;
    patternStyle?: string;
    culturalElements?: boolean;
  };
  
  // Default Sections
  default_sections: Array<{
    type: string;
    required: boolean;
  }>;
  
  // Template Assets
  cover_template_url?: string;
  header_template_url?: string;
  footer_template_url?: string;
  
  // Availability
  is_public: boolean;
  organization_id?: string;
  
  // Usage
  usage_count: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Report Feedback Types
// ============================================================================

export type FeedbackType = 
  | 'community_member'
  | 'staff'
  | 'elder'
  | 'cultural_advisor'
  | 'external';

export interface ReportFeedback {
  id: string;
  report_id: string;
  
  // Feedback Provider
  profile_id?: string;
  feedback_type: FeedbackType;
  
  // Feedback Content
  rating?: number; // 1-5
  feedback_text?: string;
  
  // Specific Feedback Areas
  liked_sections?: string[];
  improvement_areas?: string[];
  missing_content?: string;
  design_feedback?: string;
  
  // Action
  is_addressed: boolean;
  response_text?: string;
  responded_by?: string;
  responded_at?: string;
  
  // Metadata
  created_at: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// View Types (Joined Data)
// ============================================================================

export interface OrganizationOverview extends Organization {
  member_count: number;
  service_count: number;
  story_count: number;
  report_count: number;
}

export interface AnnualReportWithStats extends AnnualReport {
  organization_name: string;
  organization_logo?: string;
  story_count: number;
  feedback_count: number;
  average_rating?: number;
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface OrganizationStats {
  total_members: number;
  active_services: number;
  total_stories: number;
  stories_this_year: number;
  total_reports: number;
  published_reports: number;
}

export interface ReportGenerationStats {
  selected_stories: number;
  stories_by_category: Record<string, number>;
  stories_by_service: Record<string, number>;
  total_media_items: number;
  elder_approvals_pending: number;
  estimated_pages: number;
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface CreateOrganizationInput {
  name: string;
  organization_type: OrganizationType;
  primary_location?: string;
  traditional_country?: string;
  language_groups?: string[];
  website?: string;
  email?: string;
  phone?: string;
  indigenous_controlled?: boolean;
  governance_model?: GovernanceModel;
  has_cultural_protocols?: boolean;
  elder_approval_required?: boolean;
}

export interface CreateAnnualReportInput {
  organization_id: string;
  report_year: number;
  reporting_period_start: string;
  reporting_period_end: string;
  title: string;
  subtitle?: string;
  theme?: string;
  template_name?: ReportTemplateName;
  elder_approval_required?: boolean;
}

export interface UpdateAnnualReportInput {
  title?: string;
  subtitle?: string;
  theme?: string;
  status?: ReportStatus;
  executive_summary?: string;
  leadership_message?: string;
  year_highlights?: string[];
  looking_forward?: string;
  acknowledgments?: string;
  statistics?: Record<string, any>;
}

export interface AddStoryToReportInput {
  report_id: string;
  story_id: string;
  inclusion_reason?: InclusionReason;
  section_placement?: string;
  display_order?: number;
  is_featured?: boolean;
  custom_title?: string;
  custom_excerpt?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ReportGenerationResponse {
  success: boolean;
  report_id?: string;
  pdf_url?: string;
  web_version_url?: string;
  stats?: ReportGenerationStats;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface AutoSelectStoriesResponse {
  stories: Array<{
    story_id: string;
    story_title: string;
    category: string;
    impact_score: number;
    relevance_score: number;
    suggested_section?: string;
  }>;
  total_matches: number;
  selection_criteria: Record<string, any>;
}

// ============================================================================
// Helper Types for PICC Services
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
  'transport'
] as const;

export type PICCService = typeof PICC_SERVICES[number];

export interface PICCServiceConfig {
  slug: PICCService;
  name: string;
  category: ServiceCategory;
  color: string;
  icon: string;
}

export const PICC_SERVICE_CONFIGS: Record<PICCService, Omit<PICCServiceConfig, 'slug'>> = {
  bwgcolman_healing: {
    name: 'Bwgcolman Healing Service',
    category: 'health',
    color: '#E74C3C',
    icon: 'heart-pulse'
  },
  family_wellbeing: {
    name: 'Family Wellbeing Centre',
    category: 'family',
    color: '#9B59B6',
    icon: 'users'
  },
  youth_services: {
    name: 'Youth Services',
    category: 'youth',
    color: '#3498DB',
    icon: 'user-group'
  },
  early_learning: {
    name: 'Early Learning Centre',
    category: 'education',
    color: '#F39C12',
    icon: 'school'
  },
  cultural_centre: {
    name: 'Cultural Centre',
    category: 'culture',
    color: '#1ABC9C',
    icon: 'landmark'
  },
  ranger_program: {
    name: 'Ranger Program',
    category: 'environment',
    color: '#27AE60',
    icon: 'tree'
  },
  digital_services: {
    name: 'Digital Service Centre',
    category: 'education',
    color: '#34495E',
    icon: 'laptop'
  },
  economic_development: {
    name: 'Economic Development',
    category: 'economic',
    color: '#E67E22',
    icon: 'briefcase'
  },
  housing_services: {
    name: 'Housing Services',
    category: 'housing',
    color: '#95A5A6',
    icon: 'home'
  },
  elder_support: {
    name: 'Elder Support Services',
    category: 'family',
    color: '#8E44AD',
    icon: 'hand-holding-heart'
  },
  community_justice: {
    name: 'Community Justice',
    category: 'justice',
    color: '#C0392B',
    icon: 'scale-balanced'
  },
  womens_services: {
    name: "Women's Services",
    category: 'family',
    color: '#E91E63',
    icon: 'venus'
  },
  mens_programs: {
    name: "Men's Programs",
    category: 'family',
    color: '#2980B9',
    icon: 'mars'
  },
  food_security: {
    name: 'Food Security',
    category: 'health',
    color: '#16A085',
    icon: 'utensils'
  },
  sports_recreation: {
    name: 'Sports & Recreation',
    category: 'youth',
    color: '#F1C40F',
    icon: 'futbol'
  },
  transport: {
    name: 'Transport Services',
    category: 'other',
    color: '#7F8C8D',
    icon: 'van-shuttle'
  }
};
