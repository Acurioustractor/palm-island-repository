/**
 * Living Ledger Types for Palm Island Community Repository
 * TypeScript interfaces for continuous publishing and community conversations
 */

// ============================================================================
// Content Release Types
// ============================================================================

export type ReleaseType =
  | 'monthly_update'
  | 'quarterly_thematic'
  | 'service_spotlight'
  | 'community_milestone'
  | 'elder_wisdom'
  | 'data_snapshot';

export type ReleaseStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';

export interface ContentRelease {
  id: string;

  // Release Details
  release_type: ReleaseType;
  release_title: string;
  release_slug: string;
  release_date: string;

  // Organization Context
  organization_id?: string;
  service_ids?: string[];

  // Content Selection
  story_ids?: string[];
  data_snapshot_id?: string;

  // Narrative Framing
  executive_summary?: string;
  community_context?: string;
  impact_highlight?: string;
  looking_ahead?: string;

  // Visual Content
  cover_image_url?: string;
  featured_images?: string[];

  // Publication
  status: ReleaseStatus;
  published_at?: string;
  published_by?: string;

  // Engagement
  views: number;
  shares: number;
  community_feedback_count: number;

  // Annual Report Integration
  include_in_annual_report: boolean;
  annual_report_year?: number;

  // Metadata
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Data Snapshot Types
// ============================================================================

export type SnapshotPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface ServiceMetrics {
  people_served?: number;
  sessions_delivered?: number;
  cultural_events?: number;
  elder_engagement_hours?: number;
  youth_attendance_rate?: number;
  satisfaction_score?: number;
  [key: string]: number | undefined;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'number';
  metric_key: string;
  title: string;
  color?: string;
  show_change?: boolean;
}

export interface DataSnapshot {
  id: string;

  organization_id?: string;
  snapshot_date: string;
  snapshot_period: SnapshotPeriod;

  // Service Metrics
  service_id?: string;
  service_name?: string;

  // Flexible Metrics
  metrics: ServiceMetrics;

  // Narrative Context
  highlights?: string[];
  challenges?: string[];
  community_feedback?: string;

  // Visualization
  chart_configs?: ChartConfig[];

  // Comparison
  previous_snapshot_id?: string;
  change_summary?: Record<string, number>;

  created_at: string;
  created_by?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Content Tag Types
// ============================================================================

export type TagType = 'topic' | 'stakeholder' | 'format' | 'theme' | 'service' | 'custom';

export interface ContentTag {
  id: string;

  tag_name: string;
  tag_type: TagType;
  description?: string;
  color?: string;
  icon?: string;

  parent_tag_id?: string;
  organization_id?: string;

  usage_count: number;
  is_active: boolean;

  created_at: string;
}

export interface ContentTagAssignment {
  id: string;

  story_id?: string;
  release_id?: string;
  report_id?: string;
  snapshot_id?: string;

  tag_id: string;

  assigned_at: string;
  assigned_by?: string;
}

// ============================================================================
// Community Conversation Types
// ============================================================================

export type ConversationType =
  | 'listening_tour'
  | 'town_hall'
  | 'focus_group'
  | 'elder_session'
  | 'youth_forum'
  | 'service_feedback'
  | 'planning_workshop'
  | 'other';

export type ConversationStatus =
  | 'planned'
  | 'conducted'
  | 'transcribed'
  | 'analyzed'
  | 'integrated'
  | 'archived';

export interface ParticipantDemographics {
  elders?: number;
  adults?: number;
  youth?: number;
  children?: number;
  gender_breakdown?: {
    women?: number;
    men?: number;
    other?: number;
  };
  community_members?: number;
  external_stakeholders?: number;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative' | 'mixed';
  confidence: number;
  themes?: Record<string, 'positive' | 'neutral' | 'negative'>;
}

export interface FollowUpAction {
  action: string;
  owner_id?: string;
  owner_name?: string;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

export interface CommunityConversation {
  id: string;

  // Session Details
  conversation_title: string;
  conversation_type: ConversationType;
  session_date: string;
  session_start_time?: string;
  session_end_time?: string;
  location?: string;
  location_details?: string;

  facilitator_ids?: string[];

  // Organization Context
  organization_id?: string;
  service_ids?: string[];
  report_year?: number;

  // Participants
  participant_count?: number;
  participant_demographics?: ParticipantDemographics;

  // Questions Asked
  questions_posed?: string[];
  agenda?: string;

  // Conversation Capture
  recording_url?: string;
  transcript_url?: string;
  transcript_text?: string;
  notes?: string;

  // Theme Analysis
  themes_identified?: string[];
  sentiment_analysis?: SentimentAnalysis;
  key_quotes?: string[];
  priority_issues?: string[];

  // Action Items
  commitments_made?: string[];
  follow_up_required: boolean;
  follow_up_actions?: FollowUpAction[];
  follow_up_deadline?: string;

  // Cultural Protocols
  elder_present: boolean;
  cultural_protocols_followed: boolean;
  cultural_advisor_approval: boolean;
  cultural_advisor_id?: string;
  requires_anonymization: boolean;

  // Integration
  include_in_report: boolean;
  report_section?: string;

  // Status
  status: ConversationStatus;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Community Insight Types
// ============================================================================

export type InsightType =
  | 'need_identified'
  | 'value_statement'
  | 'concern_raised'
  | 'success_celebrated'
  | 'suggestion_offered'
  | 'priority_affirmed'
  | 'other';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'ongoing' | 'not_feasible';

export type MaterialityCategory =
  | 'financial_impact'
  | 'social_impact'
  | 'environmental_impact'
  | 'cultural_impact';

export interface CommunityInsight {
  id: string;

  conversation_id: string;

  // Insight Details
  insight_type: InsightType;
  insight_text: string;
  supporting_quotes?: string[];

  // Frequency & Importance
  mentioned_by_count: number;
  priority_level: PriorityLevel;

  // Categorization
  category?: string;
  service_area?: string;

  // Response Tracking
  organization_response?: string;
  action_taken?: string;
  action_status: ActionStatus;
  action_owner_id?: string;

  // Materiality
  is_material_issue: boolean;
  materiality_category?: MaterialityCategory;

  // Reporting
  included_in_report: boolean;
  report_section?: string;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// Feedback Loop Types (We Heard You)
// ============================================================================

export type FeedbackSource = 'conversation' | 'survey' | 'direct' | 'social_media';

export type FeedbackLoopStatus =
  | 'acknowledged'
  | 'action_planned'
  | 'in_progress'
  | 'completed'
  | 'reported_back';

export interface FeedbackLoop {
  id: string;

  // What was heard
  insight_id: string;
  original_feedback: string;
  feedback_date: string;
  feedback_source?: FeedbackSource;

  // What was done
  response_action: string;
  action_owner_id?: string;
  investment_amount?: number;
  investment_description?: string;

  // Timeline
  response_date?: string;
  completion_date?: string;

  // Results
  outcome_description?: string;
  impact_metrics?: Record<string, unknown>;
  community_reaction?: string;

  // Evidence
  evidence_urls?: string[];
  related_story_ids?: string[];

  // Reporting
  reported_in_year?: number;
  report_id?: string;
  report_section?: string;

  // Status
  status: FeedbackLoopStatus;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// Reporting Roadmap Types
// ============================================================================

export interface RoadmapPhase {
  phase: string;
  months: number[];
  activities: string[];
  milestones: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ReportingRoadmap {
  id: string;

  organization_id: string;
  report_year: number;

  // Phase Planning
  phases: RoadmapPhase[];

  // Tracking
  current_phase?: string;
  phase_status?: Record<string, string>;

  // Team
  pmo_lead_id?: string;
  team_member_ids?: string[];

  // Key Dates
  kickoff_date?: string;
  publication_target_date?: string;

  // Status
  overall_status: string;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// Content Engagement Types
// ============================================================================

export type ContentType =
  | 'story'
  | 'content_release'
  | 'annual_report'
  | 'data_dashboard'
  | 'conversation';

export type EngagementEventType =
  | 'view'
  | 'scroll_depth'
  | 'time_on_page'
  | 'interaction'
  | 'download'
  | 'share'
  | 'comment'
  | 'feedback';

export interface EngagementEventData {
  scroll_depth_percent?: number;
  time_spent_seconds?: number;
  interactions?: string[];
  device_type?: 'mobile' | 'tablet' | 'desktop';
  referrer?: string;
}

export interface ContentEngagement {
  id: string;

  content_type: ContentType;
  content_id: string;

  session_id?: string;
  user_profile_id?: string;

  event_type: EngagementEventType;
  event_data?: EngagementEventData;

  timestamp: string;
  user_agent?: string;

  anonymized: boolean;
}

export interface EngagementSummary {
  total_views: number;
  unique_visitors: number;
  avg_time_spent_seconds: number;
  avg_scroll_depth_percent: number;
  total_downloads: number;
  total_shares: number;
  engagement_rate: number;
}

// ============================================================================
// We Heard You Section Types
// ============================================================================

export interface WeHeardYouItem {
  feedback_theme: string;
  what_you_said: string[];
  what_we_did: string;
  outcome?: string;
  investment_amount?: number;
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface CreateContentReleaseInput {
  release_type: ReleaseType;
  release_title: string;
  release_date: string;
  organization_id?: string;
  service_ids?: string[];
  story_ids?: string[];
  executive_summary?: string;
  community_context?: string;
  impact_highlight?: string;
  looking_ahead?: string;
  cover_image_url?: string;
  annual_report_year?: number;
}

export interface CreateConversationInput {
  conversation_title: string;
  conversation_type: ConversationType;
  session_date: string;
  location?: string;
  organization_id?: string;
  service_ids?: string[];
  report_year?: number;
  questions_posed?: string[];
  agenda?: string;
}

export interface CreateInsightInput {
  conversation_id: string;
  insight_type: InsightType;
  insight_text: string;
  supporting_quotes?: string[];
  priority_level?: PriorityLevel;
  category?: string;
  service_area?: string;
}

export interface CreateFeedbackLoopInput {
  insight_id: string;
  original_feedback: string;
  feedback_date: string;
  response_action: string;
  feedback_source?: FeedbackSource;
  action_owner_id?: string;
  investment_amount?: number;
}

export interface CreateDataSnapshotInput {
  organization_id?: string;
  snapshot_date: string;
  snapshot_period: SnapshotPeriod;
  service_id?: string;
  service_name?: string;
  metrics: ServiceMetrics;
  highlights?: string[];
  challenges?: string[];
}

// ============================================================================
// Filter & Search Types
// ============================================================================

export interface ContentReleaseFilters {
  release_type?: ReleaseType[];
  status?: ReleaseStatus[];
  organization_id?: string;
  annual_report_year?: number;
  date_from?: string;
  date_to?: string;
}

export interface ConversationFilters {
  conversation_type?: ConversationType[];
  status?: ConversationStatus[];
  organization_id?: string;
  report_year?: number;
  date_from?: string;
  date_to?: string;
  has_insights?: boolean;
}

export interface InsightFilters {
  insight_type?: InsightType[];
  priority_level?: PriorityLevel[];
  action_status?: ActionStatus[];
  is_material_issue?: boolean;
  included_in_report?: boolean;
}
