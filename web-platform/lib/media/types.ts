/**
 * Media Management Types
 * TypeScript definitions for smart media system
 */

export type MediaFileType = 'image' | 'video' | 'audio' | 'document' | 'other';

export type MediaUsageContext =
  | 'story_hero'
  | 'story_inline'
  | 'profile_photo'
  | 'gallery'
  | 'project_showcase'
  | 'immersive_story'
  | 'thumbnail'
  | 'page_hero'
  | 'page_section'
  | 'service_photo'
  | 'leadership_photo'
  | 'testimonial_photo'
  | 'timeline_photo'
  | 'video_embed'
  | 'other';

export type PageContext =
  // Public pages
  | 'home'
  | 'about'
  | 'impact'
  | 'community'
  | 'stories'
  | 'share-voice'
  | 'annual-reports'
  | 'search'
  | 'chat'
  | 'assistant'
  // Sections
  | 'hero'
  | 'vision'
  | 'timeline'
  | 'leadership'
  | 'services'
  | 'testimonials'
  | 'future'
  | 'contact'
  // Story contexts
  | 'story'
  | 'storyteller'
  | 'project'
  // Other
  | 'global'
  | 'other';

export interface MediaFile {
  id: string;
  filename: string;
  original_filename?: string;
  file_path: string;
  bucket_name: string;
  public_url: string;
  file_type: MediaFileType;
  mime_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  duration?: number;
  tenant_id: string;
  uploaded_by?: string;
  story_id?: string;
  project_id?: string;
  storyteller_id?: string;
  title?: string;
  description?: string;
  alt_text?: string;
  caption?: string;
  tags?: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  taken_at?: string;
  requires_elder_approval?: boolean;
  approved_by?: string;
  approved_at?: string;
  cultural_sensitivity_notes?: string;
  faces_detected?: string[];
  is_public: boolean;
  is_featured: boolean;
  usage_context?: MediaUsageContext;
  view_count: number;
  download_count: number;
  page_context?: PageContext;
  page_section?: string;
  display_order: number;
  context_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  metadata?: Record<string, any>;
}

export interface PageMediaQuery {
  pageContext: PageContext;
  pageSection?: string;
  fileType?: MediaFileType;
  tags?: string[];
  limit?: number;
  featuredOnly?: boolean;
}

export interface MediaWithUploaderinfo extends MediaFile {
  uploader_name?: string;
  uploader_preferred_name?: string;
}

export interface FeaturedMedia {
  id: string;
  public_url: string;
  title?: string;
  alt_text?: string;
  context_metadata?: Record<string, any>;
}

export interface MediaStats {
  page_context: string;
  page_section: string;
  file_type: MediaFileType;
  media_count: number;
  featured_count: number;
}
