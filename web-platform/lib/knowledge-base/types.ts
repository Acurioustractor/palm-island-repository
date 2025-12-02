/**
 * PICC Knowledge Base Types
 * TypeScript definitions for the knowledge management system
 */

// ============================================================================
// ENUMS
// ============================================================================

export type EntryType =
  | 'fact'
  | 'history'
  | 'person'
  | 'place'
  | 'organization'
  | 'service'
  | 'program'
  | 'event'
  | 'statistic'
  | 'policy'
  | 'quote'
  | 'story'
  | 'media'
  | 'research'
  | 'news'
  | 'document';

export type SourceType =
  | 'pdf_document'
  | 'web_page'
  | 'news_article'
  | 'government_report'
  | 'academic_paper'
  | 'interview'
  | 'oral_history'
  | 'photograph'
  | 'video'
  | 'audio'
  | 'social_media'
  | 'internal_document'
  | 'email'
  | 'meeting_notes'
  | 'survey'
  | 'observation'
  | 'other';

export type MediaType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'pdf'
  | 'spreadsheet'
  | '3d_model'
  | 'map'
  | 'infographic'
  | 'chart'
  | 'other';

export type RelationshipType =
  | 'related_to'
  | 'part_of'
  | 'preceded_by'
  | 'followed_by'
  | 'caused_by'
  | 'resulted_in'
  | 'contradicts'
  | 'supports'
  | 'expands_on'
  | 'replaces'
  | 'see_also';

export type DatePrecision = 'exact' | 'month' | 'year' | 'decade' | 'approximate';

export type LocationType = 'palm_island' | 'townsville' | 'queensland' | 'australia' | 'other';

export type FinancialRecordType =
  | 'income'
  | 'expenditure'
  | 'asset'
  | 'liability'
  | 'equity'
  | 'budget'
  | 'forecast'
  | 'grant'
  | 'funding';

export type TimelineEventType =
  | 'founding'
  | 'milestone'
  | 'policy_change'
  | 'leadership_change'
  | 'service_launch'
  | 'award'
  | 'disaster'
  | 'cultural'
  | 'community'
  | 'political'
  | 'legal'
  | 'other';

// ============================================================================
// CORE TYPES
// ============================================================================

export interface KnowledgeEntry {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  summary?: string;

  entry_type: EntryType;
  category?: string;
  subcategory?: string;

  // Temporal
  date_from?: string;
  date_to?: string;
  date_precision?: DatePrecision;
  fiscal_year?: string;

  // Geographic
  location_name?: string;
  location_type?: LocationType;
  coordinates?: { lat: number; lng: number };

  // Importance
  importance: number;
  is_featured: boolean;
  is_public: boolean;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;

  // Structured data
  structured_data: Record<string, any>;

  // Search
  keywords?: string[];

  // Meta
  created_by?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  current_version: number;
  organization_id?: string;

  // Relations (populated on fetch)
  tags?: KnowledgeTag[];
  sources?: ResearchSourceLink[];
  media?: KnowledgeMedia[];
  related_entries?: KnowledgeRelationship[];
}

export interface KnowledgeVersion {
  id: string;
  entry_id: string;
  version_number: number;
  title: string;
  content: string;
  summary?: string;
  structured_data?: Record<string, any>;
  change_summary?: string;
  change_type?: 'created' | 'updated' | 'corrected' | 'expanded' | 'merged';
  created_by?: string;
  created_at: string;
  source_id?: string;
}

export interface ResearchSource {
  id: string;
  source_type: SourceType;
  title: string;
  description?: string;
  author?: string;
  publisher?: string;
  publication_date?: string;

  url?: string;
  file_path?: string;
  storage_url?: string;

  citation_text?: string;
  doi?: string;
  isbn?: string;

  reliability_score?: number;
  is_primary_source: boolean;
  is_verified: boolean;
  verified_by?: string;

  accessed_at?: string;
  last_checked_at?: string;
  is_available: boolean;

  extracted_text?: string;
  extracted_data?: Record<string, any>;

  created_by?: string;
  created_at: string;
  updated_at: string;
  organization_id?: string;
}

export interface ResearchSourceLink {
  id: string;
  entry_id: string;
  source_id: string;
  page_numbers?: string;
  section_reference?: string;
  timestamp_start?: string;
  timestamp_end?: string;
  quote?: string;
  relationship: 'primary_source' | 'supporting' | 'contradicts' | 'expands' | 'referenced';
  added_by?: string;
  added_at: string;
  notes?: string;

  // Populated
  source?: ResearchSource;
}

export interface FinancialRecord {
  id: string;
  fiscal_year: string;
  period_start: string;
  period_end: string;
  period_type: 'annual' | 'quarterly' | 'monthly';

  record_type: FinancialRecordType;
  category: string;
  subcategory?: string;
  cost_centre?: string;

  amount: number;
  currency: string;

  previous_amount?: number;
  variance?: number;
  variance_percentage?: number;

  description?: string;
  notes?: string;

  source_id?: string;
  is_audited: boolean;
  auditor?: string;

  created_by?: string;
  created_at: string;
  updated_at: string;
  organization_id?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;

  event_date?: string;
  event_date_end?: string;
  date_precision?: DatePrecision;

  event_type?: TimelineEventType;

  location_name?: string;
  location_type?: string;

  significance?: number;
  is_featured: boolean;

  related_entry_id?: string;
  related_people?: string[];

  image_url?: string;
  source_id?: string;

  created_by?: string;
  created_at: string;
  updated_at: string;
  organization_id?: string;

  // Populated
  related_entry?: KnowledgeEntry;
}

export interface KnowledgeMedia {
  id: string;
  entry_id?: string;

  title: string;
  description?: string;
  alt_text?: string;

  media_type: MediaType;

  file_name?: string;
  file_size?: number;
  mime_type?: string;
  storage_path?: string;
  storage_url?: string;
  thumbnail_url?: string;

  duration_seconds?: number;
  width?: number;
  height?: number;

  transcript?: string;
  ocr_text?: string;
  extracted_data?: Record<string, any>;

  capture_date?: string;
  capture_location?: string;
  photographer?: string;

  people_tagged?: string[];
  tags?: string[];

  copyright?: string;
  license?: string;
  usage_restrictions?: string;

  source_id?: string;

  created_by?: string;
  created_at: string;
  updated_at: string;
  organization_id?: string;
}

export interface KnowledgeTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  tag_type?: 'topic' | 'person' | 'place' | 'time_period' | 'service' | 'program' | 'theme' | 'custom';
  color?: string;
  icon?: string;
  usage_count: number;
  created_at: string;
}

export interface KnowledgeRelationship {
  id: string;
  from_entry_id: string;
  to_entry_id: string;
  relationship_type: RelationshipType;
  description?: string;
  strength?: number;
  created_by?: string;
  created_at: string;

  // Populated
  to_entry?: KnowledgeEntry;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface KnowledgeSearchParams {
  query: string;
  entry_types?: EntryType[];
  categories?: string[];
  tags?: string[];
  date_from?: string;
  date_to?: string;
  fiscal_year?: string;
  location_type?: LocationType;
  is_verified?: boolean;
  limit?: number;
  offset?: number;
}

export interface KnowledgeSearchResult {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  entry_type: EntryType;
  category?: string;
  relevance: number;
  date_from?: string;
  tags?: string[];
}

export interface CreateKnowledgeEntryInput {
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  summary?: string;
  entry_type: EntryType;
  category?: string;
  subcategory?: string;
  date_from?: string;
  date_to?: string;
  date_precision?: DatePrecision;
  fiscal_year?: string;
  location_name?: string;
  location_type?: LocationType;
  coordinates?: { lat: number; lng: number };
  importance?: number;
  is_featured?: boolean;
  is_public?: boolean;
  keywords?: string[];
  structured_data?: Record<string, any>;
  tags?: string[];  // Tag slugs
  source_ids?: string[];
}

export interface CreateResearchSourceInput {
  source_type: SourceType;
  title: string;
  description?: string;
  author?: string;
  publisher?: string;
  publication_date?: string;
  url?: string;
  citation_text?: string;
  reliability_score?: number;
  is_primary_source?: boolean;
  extracted_text?: string;
  extracted_data?: Record<string, any>;
}

export interface CreateFinancialRecordInput {
  fiscal_year: string;
  period_start: string;
  period_end: string;
  period_type: 'annual' | 'quarterly' | 'monthly';
  record_type: FinancialRecordType;
  category: string;
  subcategory?: string;
  cost_centre?: string;
  amount: number;
  currency?: string;
  previous_amount?: number;
  description?: string;
  notes?: string;
  source_id?: string;
  is_audited?: boolean;
}

export interface CreateTimelineEventInput {
  title: string;
  description?: string;
  event_date?: string;
  event_date_end?: string;
  date_precision?: DatePrecision;
  event_type?: TimelineEventType;
  location_name?: string;
  location_type?: string;
  significance?: number;
  is_featured?: boolean;
  related_entry_id?: string;
  related_people?: string[];
  image_url?: string;
  source_id?: string;
  // For API compatibility
  end_date?: string;
  category?: string;
  location?: string;
  location_coordinates?: { lat: number; lng: number };
  people_involved?: string[];
  knowledge_entry_id?: string;
  metadata?: Record<string, any>;
}

export interface CreateKnowledgeMediaInput {
  knowledge_entry_id?: string;
  media_type: MediaType;
  storage_path: string;
  original_filename?: string;
  file_size?: number;
  mime_type?: string;
  duration_seconds?: number;
  width?: number;
  height?: number;
  thumbnail_path?: string;
  transcript?: string;
  alt_text?: string;
  caption?: string;
  credits?: string;
  captured_date?: string;
  captured_location?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// FULL ENTRY TYPE (with all relations)
// ============================================================================

export interface KnowledgeEntryFull extends KnowledgeEntry {
  tags: KnowledgeTag[];
  sources: (ResearchSourceLink & { source: ResearchSource })[];
  media: KnowledgeMedia[];
  related: (KnowledgeRelationship & { entry: KnowledgeEntry })[];
  versions: KnowledgeVersion[];
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface KnowledgeBaseStats {
  total_entries: number;
  entries_by_type: Record<EntryType, number>;
  entries_by_category: Record<string, number>;
  total_sources: number;
  total_media: number;
  total_financial_records: number;
  total_timeline_events: number;
  verified_entries: number;
  recent_entries: KnowledgeEntry[];
}

export interface FinancialSummary {
  fiscal_year: string;
  total_income: number;
  total_expenditure: number;
  net_result: number;
  by_category: Record<string, number>;
  assets: number;
  liabilities: number;
  equity: number;
}
