/**
 * Annual Report Content Types
 * Extended types for leadership messages, governance, cultural content, and storytelling
 */

// ============================================================================
// Leadership Messages
// ============================================================================

export type LeadershipRole =
  | 'ceo'
  | 'chair'
  | 'board_member'
  | 'elder'
  | 'cultural_advisor'
  | 'executive_director'
  | 'president'
  | 'other';

export type MessageLayoutStyle =
  | 'standard'
  | 'photo_left'
  | 'photo_right'
  | 'full_width'
  | 'minimal';

export interface ReportLeadershipMessage {
  id: string;
  report_id: string;

  // Leadership Details
  role: LeadershipRole;
  person_profile_id?: string;
  person_name: string;
  person_title?: string; // "Chief Executive Officer"
  person_bio?: string;
  person_photo_url?: string;

  // Message Content
  message_title?: string; // "Message from the CEO"
  message_content: string; // Markdown supported
  message_excerpt?: string;

  // Styling & Display
  display_order: number;
  layout_style: MessageLayoutStyle;
  featured_quote?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Board Members & Governance
// ============================================================================

export interface ReportBoardMember {
  id: string;
  report_id: string;

  // Board Member Details
  profile_id?: string;
  full_name: string;
  position: string; // "Chair", "Director", "Company Secretary"

  // Display Information
  photo_url?: string;
  bio?: string;

  // Term Details
  term_start_date?: string;
  term_end_date?: string;
  is_current: boolean;

  // Display
  display_order: number;

  // Metadata
  created_at: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Cultural Grounding
// ============================================================================

export type CulturalContentType =
  | 'acknowledgement_of_country'
  | 'welcome_to_country'
  | 'cultural_protocol'
  | 'language_statement'
  | 'elder_blessing'
  | 'cultural_artwork_description'
  | 'traditional_story'
  | 'cultural_practice'
  | 'other';

export type CulturalSensitivityLevel =
  | 'public'
  | 'community_only'
  | 'restricted'
  | 'sacred';

export type PagePlacement =
  | 'opening'
  | 'closing'
  | 'throughout'
  | 'sidebar';

export interface ReportCulturalContent {
  id: string;
  report_id: string;

  // Content Type
  content_type: CulturalContentType;

  // Content
  title?: string;
  content: string;
  content_format: 'markdown' | 'html' | 'plain_text';

  // Cultural Elements
  language?: string; // Traditional language name
  language_translation?: string;

  // Associated Media
  artwork_image_url?: string;
  artwork_title?: string;
  artist_name?: string;
  artist_profile_id?: string;
  artwork_description?: string;
  artwork_copyright?: string;

  // Permissions & Protocols
  elder_approved: boolean;
  elder_approver_id?: string;
  cultural_sensitivity_level: CulturalSensitivityLevel;
  requires_permission: boolean;
  usage_restrictions?: string;

  // Display
  display_order: number;
  page_placement: PagePlacement;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Organizational Highlights & Initiatives
// ============================================================================

export type HighlightType =
  | 'major_initiative'
  | 'program_launch'
  | 'achievement'
  | 'milestone'
  | 'community_impact'
  | 'partnership'
  | 'innovation'
  | 'challenge_overcome'
  | 'service_expansion'
  | 'cultural_event'
  | 'other';

export type HighlightDisplayStyle =
  | 'standard'
  | 'hero'
  | 'card'
  | 'timeline_item'
  | 'stat_focus';

export interface ReportHighlight {
  id: string;
  report_id: string;

  // Highlight Type
  highlight_type: HighlightType;

  // Content
  title: string;
  subtitle?: string;
  description: string;

  // Story Elements
  challenge_faced?: string;
  solution_approach?: string;
  impact_achieved?: string;

  // Associated Service/Program
  service_id?: string;

  // Media
  featured_image_url?: string;
  additional_images?: string[];
  video_url?: string;

  // Related Stories
  related_story_ids?: string[];

  // Metrics & Data
  metrics?: Record<string, any>;

  // Display
  is_featured: boolean;
  display_order: number;
  display_style: HighlightDisplayStyle;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Partners & Collaborators
// ============================================================================

export type PartnerType =
  | 'government'
  | 'ngo'
  | 'corporate'
  | 'community'
  | 'academic'
  | 'health'
  | 'education'
  | 'funding_body'
  | 'philanthropic'
  | 'other';

export type PartnershipLevel =
  | 'major_funder'
  | 'key_partner'
  | 'collaborator'
  | 'supporter'
  | 'in_kind';

export interface ReportPartner {
  id: string;
  report_id: string;

  // Partner Details
  partner_name: string;
  partner_type: PartnerType;

  // Display Information
  logo_url?: string;
  website?: string;
  description?: string;

  // Partnership Details
  partnership_area?: string;
  partnership_level: PartnershipLevel;
  relationship_years?: number;
  contribution_description?: string;

  // Recognition Level
  should_display_logo: boolean;
  display_order: number;

  // Metadata
  created_at: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Statistics & Data Points
// ============================================================================

export type StatCategory =
  | 'service_delivery'
  | 'workforce'
  | 'financial'
  | 'community_engagement'
  | 'outcomes'
  | 'cultural'
  | 'environmental'
  | 'health'
  | 'education'
  | 'other';

export type ComparisonType =
  | 'increase'
  | 'decrease'
  | 'stable'
  | 'new'
  | 'milestone';

export type DisplayFormat =
  | 'number'
  | 'percentage'
  | 'currency'
  | 'chart'
  | 'graph'
  | 'icon';

export interface ReportStatistic {
  id: string;
  report_id: string;

  // Statistic Details
  category: StatCategory;
  stat_label: string; // "Total Staff Members"
  stat_value: string; // "197" or "3x increase"
  stat_unit?: string; // "people", "dollars", "percent"

  // Context
  stat_description?: string;
  comparison_previous_year?: string;
  comparison_type?: ComparisonType;

  // Visualization
  display_format: DisplayFormat;
  icon_name?: string;
  color?: string;

  // Display
  is_key_metric: boolean;
  display_order: number;

  // Source & Verification
  data_source?: string;
  verified_by?: string;
  verified_date?: string;

  // Metadata
  created_at: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Extended Annual Report Type
// ============================================================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface CulturalDesignElements {
  patterns: boolean;
  artwork?: string;
  colors: string;
}

export interface CompleteAnnualReport {
  // Base Report
  report: {
    id: string;
    organization_id: string;
    report_year: number;
    reporting_period_start: string;
    reporting_period_end: string;
    title: string;
    subtitle?: string;
    theme?: string;
    narrative_theme?: string;
    status: string;
    template_name: string;

    // Visual Design
    cover_image_url?: string;
    cover_photo_url?: string;
    cover_photo_caption?: string;
    cover_photo_credit?: string;
    theme_colors?: ThemeColors;
    cultural_design_elements?: CulturalDesignElements;

    // Core Content
    executive_summary?: string;
    acknowledgement_of_country?: string;
    year_highlights?: string[];
    looking_forward?: string;
    vision_statement?: string;
    values?: string[];
    acknowledgments?: string;

    // Metadata
    status: string;
    published_date?: string;
    pdf_url?: string;
    web_version_url?: string;
    views: number;
    downloads: number;
  };

  // Organization
  organization: {
    id: string;
    name: string;
    short_name?: string;
    logo_url?: string;
    tagline?: string;
    mission_statement?: string;
    traditional_country?: string;
    language_groups?: string[];
  };

  // Rich Content
  leadership_messages?: ReportLeadershipMessage[];
  board_members?: ReportBoardMember[];
  cultural_content?: ReportCulturalContent[];
  highlights?: ReportHighlight[];
  partners?: ReportPartner[];
  statistics?: ReportStatistic[];

  // Stories
  stories?: Array<{
    story: any;
    storyteller: any;
    service: any;
  }>;
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface CreateLeadershipMessageInput {
  report_id: string;
  role: LeadershipRole;
  person_name: string;
  person_title?: string;
  person_photo_url?: string;
  message_title?: string;
  message_content: string;
  message_excerpt?: string;
  layout_style?: MessageLayoutStyle;
  featured_quote?: string;
  display_order?: number;
}

export interface CreateBoardMemberInput {
  report_id: string;
  full_name: string;
  position: string;
  photo_url?: string;
  bio?: string;
  term_start_date?: string;
  display_order?: number;
}

export interface CreateCulturalContentInput {
  report_id: string;
  content_type: CulturalContentType;
  title?: string;
  content: string;
  artwork_image_url?: string;
  artist_name?: string;
  cultural_sensitivity_level?: CulturalSensitivityLevel;
  elder_approved?: boolean;
  display_order?: number;
}

export interface CreateHighlightInput {
  report_id: string;
  highlight_type: HighlightType;
  title: string;
  subtitle?: string;
  description: string;
  challenge_faced?: string;
  solution_approach?: string;
  impact_achieved?: string;
  service_id?: string;
  featured_image_url?: string;
  metrics?: Record<string, any>;
  is_featured?: boolean;
  display_order?: number;
}

export interface CreatePartnerInput {
  report_id: string;
  partner_name: string;
  partner_type: PartnerType;
  logo_url?: string;
  website?: string;
  description?: string;
  partnership_level?: PartnershipLevel;
  contribution_description?: string;
  display_order?: number;
}

export interface CreateStatisticInput {
  report_id: string;
  category: StatCategory;
  stat_label: string;
  stat_value: string;
  stat_unit?: string;
  stat_description?: string;
  comparison_previous_year?: string;
  comparison_type?: ComparisonType;
  display_format?: DisplayFormat;
  is_key_metric?: boolean;
  display_order?: number;
}

// ============================================================================
// Helper Types
// ============================================================================

export interface ReportContentSummary {
  leadership_message_count: number;
  board_member_count: number;
  cultural_content_count: number;
  highlight_count: number;
  partner_count: number;
  statistic_count: number;
  story_count: number;
}

export interface AnnualReportWithContentSummary {
  id: string;
  organization_name: string;
  report_year: number;
  title: string;
  status: string;
  leadership_message_count: number;
  board_member_count: number;
  cultural_content_count: number;
  highlight_count: number;
  partner_count: number;
  statistic_count: number;
  story_count: number;
}
