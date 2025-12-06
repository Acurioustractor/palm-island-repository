/**
 * Client-side Story Helper Functions
 * These can be used in 'use client' components
 */

import type { Story } from './types';

/**
 * Helper to format story excerpt
 */
export function getStoryExcerpt(content: string | undefined, maxLength: number = 150): string {
  if (!content) return '';

  if (content.length <= maxLength) return content;

  return content.substring(0, maxLength).trim() + '...';
}

/**
 * Helper to get storyteller display name
 */
export function getStorytellerName(storyteller?: Story['storyteller']): string {
  if (!storyteller) return 'Anonymous';

  return storyteller.preferred_name || storyteller.full_name || 'Community Member';
}

/**
 * Helper to check if story has media
 */
export function hasStoryMedia(story: Story): boolean {
  return !!(story.story_media && story.story_media.length > 0);
}

/**
 * Helper to get primary story image
 */
export function getStoryImage(story: Story): string | null {
  if (!hasStoryMedia(story)) return null;

  const imageMedia = story.story_media?.find(
    m => m.media_type === 'image' || m.media_type === 'photo'
  );

  return imageMedia?.media_url || null;
}
