/**
 * Smart Media Utilities
 * Functions for fetching and managing media across the platform
 */

import { createServerComponentClient } from '@/lib/supabase/server';
import type {
  MediaFile,
  PageMediaQuery,
  FeaturedMedia,
  MediaFileType,
  PageContext,
} from './types';

/**
 * Get media for a specific page and section
 */
export async function getPageMedia(query: PageMediaQuery): Promise<MediaFile[]> {
  const supabase = await createServerComponentClient();

  let queryBuilder = supabase
    .from('media_files')
    .select('*')
    .eq('page_context', query.pageContext)
    .eq('is_public', true)
    .is('deleted_at', null);

  // Filter by section if provided
  if (query.pageSection) {
    queryBuilder = queryBuilder.eq('page_section', query.pageSection);
  }

  // Filter by file type if provided
  if (query.fileType) {
    queryBuilder = queryBuilder.eq('file_type', query.fileType);
  }

  // Filter by featured if requested
  if (query.featuredOnly) {
    queryBuilder = queryBuilder.eq('is_featured', true);
  }

  // Filter by tags if provided
  if (query.tags && query.tags.length > 0) {
    queryBuilder = queryBuilder.overlaps('tags', query.tags);
  }

  // Order by display order and limit
  queryBuilder = queryBuilder
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (query.limit) {
    queryBuilder = queryBuilder.limit(query.limit);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching page media:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single featured media for a page/section
 */
export async function getFeaturedPageMedia(
  pageContext: PageContext,
  pageSection?: string,
  fileType?: MediaFileType
): Promise<FeaturedMedia | null> {
  const supabase = await createServerComponentClient();

  let queryBuilder = supabase
    .from('media_files')
    .select('id, public_url, title, alt_text, context_metadata')
    .eq('page_context', pageContext)
    .eq('is_public', true)
    .eq('is_featured', true)
    .is('deleted_at', null);

  if (pageSection) {
    queryBuilder = queryBuilder.eq('page_section', pageSection);
  }

  if (fileType) {
    queryBuilder = queryBuilder.eq('file_type', fileType);
  }

  queryBuilder = queryBuilder
    .order('display_order', { ascending: true })
    .limit(1)
    .single();

  const { data, error } = await queryBuilder;

  if (error) {
    if (error.code !== 'PGRST116') {
      // Not a "no rows" error
      console.error('Error fetching featured media:', error);
    }
    return null;
  }

  return data;
}

/**
 * Get hero image for a page
 */
export async function getHeroImage(pageContext: PageContext): Promise<string | null> {
  const media = await getFeaturedPageMedia(pageContext, 'hero', 'image');
  return media?.public_url || null;
}

/**
 * Get hero video for a page
 */
export async function getHeroVideo(pageContext: PageContext): Promise<FeaturedMedia | null> {
  return getFeaturedPageMedia(pageContext, 'hero', 'video');
}

/**
 * Get leadership photos for About page
 */
export async function getLeadershipPhotos(): Promise<MediaFile[]> {
  return getPageMedia({
    pageContext: 'about',
    pageSection: 'leadership',
    fileType: 'image',
    limit: 10,
  });
}

/**
 * Get timeline photos for About page
 */
export async function getTimelinePhotos(): Promise<MediaFile[]> {
  return getPageMedia({
    pageContext: 'about',
    pageSection: 'timeline',
    fileType: 'image',
    limit: 10,
  });
}

/**
 * Get service photos for About page
 */
export async function getServicePhotos(): Promise<MediaFile[]> {
  return getPageMedia({
    pageContext: 'about',
    pageSection: 'services',
    fileType: 'image',
    limit: 10,
  });
}

/**
 * Get testimonial photos
 */
export async function getTestimonialPhotos(): Promise<MediaFile[]> {
  return getPageMedia({
    pageContext: 'about',
    pageSection: 'testimonials',
    fileType: 'image',
    limit: 10,
  });
}

/**
 * Get media by tags
 */
export async function getMediaByTags(
  tags: string[],
  limit: number = 10,
  fileType?: MediaFileType
): Promise<MediaFile[]> {
  const supabase = await createServerComponentClient();

  let queryBuilder = supabase
    .from('media_files')
    .select('*')
    .overlaps('tags', tags)
    .eq('is_public', true)
    .is('deleted_at', null);

  if (fileType) {
    queryBuilder = queryBuilder.eq('file_type', fileType);
  }

  queryBuilder = queryBuilder
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching media by tags:', error);
    return [];
  }

  return data || [];
}

/**
 * Get recent media uploads
 */
export async function getRecentMedia(limit: number = 20): Promise<MediaFile[]> {
  const supabase = await createServerComponentClient();

  const { data, error } = await supabase
    .from('media_files')
    .select('*')
    .eq('is_public', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent media:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all media for a page (for admin view)
 */
export async function getAllPageMedia(pageContext: PageContext): Promise<MediaFile[]> {
  return getPageMedia({
    pageContext,
    limit: 100,
  });
}

/**
 * Search media by title/description/tags
 */
export async function searchMedia(query: string, limit: number = 20): Promise<MediaFile[]> {
  const supabase = await createServerComponentClient();

  const { data, error } = await supabase
    .from('media_files')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('is_public', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching media:', error);
    return [];
  }

  return data || [];
}

/**
 * Get media stats for a page
 */
export async function getPageMediaStats(pageContext: PageContext) {
  const supabase = await createServerComponentClient();

  const { data, error } = await supabase
    .from('media_by_page_context')
    .select('*')
    .eq('page_context', pageContext);

  if (error) {
    console.error('Error fetching media stats:', error);
    return [];
  }

  return data || [];
}

/**
 * Helper: Build public URL for media
 */
export function buildMediaUrl(bucketName: string, filePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
}

/**
 * Helper: Get placeholder image for missing media
 */
export function getPlaceholderImage(context?: string): string {
  // Return a default placeholder based on context
  const placeholders = {
    hero: '/placeholders/hero-placeholder.jpg',
    leadership: '/placeholders/person-placeholder.jpg',
    service: '/placeholders/service-placeholder.jpg',
    timeline: '/placeholders/history-placeholder.jpg',
    default: '/placeholders/default-placeholder.jpg',
  };

  return placeholders[context as keyof typeof placeholders] || placeholders.default;
}
