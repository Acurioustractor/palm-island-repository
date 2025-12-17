/**
 * Taxonomy definitions for storyteller and story placement tags
 * These tags control where content appears across the site
 */

export interface PlacementTag {
  id: string;
  label: string;
  description?: string;
  color?: string;
}

export interface TagCategory {
  id: string;
  label: string;
  tags: PlacementTag[];
}

// ============================================================================
// Storyteller Placement Tags
// ============================================================================

export const STORYTELLER_SITE_SECTIONS: PlacementTag[] = [
  { id: 'homepage-featured', label: 'Homepage Featured', description: 'Show in homepage hero/featured section', color: 'purple' },
  { id: 'elders-page', label: 'Elders Page', description: 'Show on public elders directory page', color: 'amber' },
  { id: 'about-team', label: 'About/Team', description: 'Show on about page team section', color: 'blue' },
  { id: 'wiki-featured', label: 'Wiki Featured', description: 'Featured prominently on wiki pages', color: 'green' },
  { id: 'board-directors', label: 'Board of Directors', description: 'Show on governance/board page', color: 'indigo' },
];

export const STORYTELLER_ROLES: PlacementTag[] = [
  { id: 'role:board-member', label: 'Board Member', color: 'indigo' },
  { id: 'role:staff', label: 'Staff Member', color: 'blue' },
  { id: 'role:volunteer', label: 'Volunteer', color: 'green' },
  { id: 'role:elder-advisor', label: 'Elder Advisor', color: 'amber' },
  { id: 'role:cultural-advisor', label: 'Cultural Advisor', color: 'purple' },
];

// Generate fiscal year tags dynamically
export function generateFiscalYearTags(count: number = 5): PlacementTag[] {
  const now = new Date();
  const currentFYStart = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;

  return Array.from({ length: count }).map((_, i) => {
    const startYear = currentFYStart - i;
    const endYear = startYear + 1;
    const fyLabel = `${startYear}-${String(endYear).slice(-2)}`;
    return {
      id: `ar:${fyLabel}`,
      label: `Annual Report ${fyLabel}`,
      description: `Include in ${fyLabel} annual report`,
      color: 'pink',
    };
  });
}

export const STORYTELLER_ANNUAL_REPORTS = generateFiscalYearTags(5);

export const STORYTELLER_PLACEMENT_CATEGORIES: TagCategory[] = [
  { id: 'site_sections', label: 'Site Sections', tags: STORYTELLER_SITE_SECTIONS },
  { id: 'annual_reports', label: 'Annual Reports', tags: STORYTELLER_ANNUAL_REPORTS },
  { id: 'roles', label: 'Roles', tags: STORYTELLER_ROLES },
];

export const ALL_STORYTELLER_TAGS = [
  ...STORYTELLER_SITE_SECTIONS,
  ...STORYTELLER_ANNUAL_REPORTS,
  ...STORYTELLER_ROLES,
];

// ============================================================================
// Story Placement Tags
// ============================================================================

export const STORY_SITE_SECTIONS: PlacementTag[] = [
  { id: 'homepage', label: 'Homepage', description: 'Show on homepage stories section', color: 'purple' },
  { id: 'featured', label: 'Featured', description: 'Mark as featured story', color: 'amber' },
  { id: 'annual-report', label: 'Annual Report', description: 'Include in annual report', color: 'pink' },
  { id: 'wiki-highlight', label: 'Wiki Highlight', description: 'Highlight on wiki pages', color: 'green' },
];

export const STORY_CATEGORIES: PlacementTag[] = [
  { id: 'cat:community', label: 'Community', color: 'blue' },
  { id: 'cat:health', label: 'Health & Wellbeing', color: 'green' },
  { id: 'cat:education', label: 'Education', color: 'indigo' },
  { id: 'cat:culture', label: 'Culture & Heritage', color: 'amber' },
  { id: 'cat:environment', label: 'Environment', color: 'teal' },
  { id: 'cat:youth', label: 'Youth', color: 'purple' },
  { id: 'cat:elders', label: 'Elders', color: 'orange' },
  { id: 'cat:family', label: 'Family Services', color: 'pink' },
];

export const STORY_FISCAL_YEARS = generateFiscalYearTags(5).map(tag => ({
  ...tag,
  id: tag.id.replace('ar:', 'fy:'), // Use fy: prefix for stories
  label: tag.label.replace('Annual Report', 'FY'),
  description: `Story from fiscal year ${tag.label.replace('Annual Report ', '')}`,
}));

export const STORY_SERVICES: PlacementTag[] = [
  { id: 'service:health', label: 'Health Service', color: 'green' },
  { id: 'service:family', label: 'Family Wellbeing', color: 'pink' },
  { id: 'service:youth', label: 'Youth Services', color: 'purple' },
  { id: 'service:early-childhood', label: 'Early Childhood', color: 'blue' },
  { id: 'service:mens', label: "Men's Gathering", color: 'indigo' },
  { id: 'service:womens', label: "Women's Service", color: 'rose' },
  { id: 'service:elders', label: 'Elder Services', color: 'amber' },
  { id: 'service:digital', label: 'Digital Service Centre', color: 'cyan' },
];

export const STORY_PLACEMENT_CATEGORIES: TagCategory[] = [
  { id: 'site_sections', label: 'Site Sections', tags: STORY_SITE_SECTIONS },
  { id: 'categories', label: 'Categories', tags: STORY_CATEGORIES },
  { id: 'fiscal_years', label: 'Fiscal Years', tags: STORY_FISCAL_YEARS },
  { id: 'services', label: 'Services', tags: STORY_SERVICES },
];

export const ALL_STORY_TAGS = [
  ...STORY_SITE_SECTIONS,
  ...STORY_CATEGORIES,
  ...STORY_FISCAL_YEARS,
  ...STORY_SERVICES,
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the color class for a tag
 */
export function getTagColorClass(tagId: string, variant: 'bg' | 'text' | 'border' = 'bg'): string {
  const allTags = [...ALL_STORYTELLER_TAGS, ...ALL_STORY_TAGS];
  const tag = allTags.find(t => t.id === tagId);
  const color = tag?.color || 'gray';

  const colorMap: Record<string, Record<string, string>> = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  };

  return colorMap[color]?.[variant] || colorMap.gray[variant];
}

/**
 * Get tag label by ID
 */
export function getTagLabel(tagId: string): string {
  const allTags = [...ALL_STORYTELLER_TAGS, ...ALL_STORY_TAGS];
  return allTags.find(t => t.id === tagId)?.label || tagId;
}

/**
 * Parse tags into categories for display
 */
export function categorizeTags(tags: string[], categories: TagCategory[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const category of categories) {
    const categoryTagIds = new Set(category.tags.map(t => t.id));
    result[category.id] = tags.filter(tag => categoryTagIds.has(tag));
  }

  // Uncategorized tags
  const allKnownTagIds = new Set(categories.flatMap(c => c.tags.map(t => t.id)));
  result.other = tags.filter(tag => !allKnownTagIds.has(tag));

  return result;
}

/**
 * Storyteller types for filtering
 */
export const STORYTELLER_TYPES = [
  { id: 'elder', label: 'Elder' },
  { id: 'community_member', label: 'Community Member' },
  { id: 'youth', label: 'Youth' },
  { id: 'staff', label: 'Staff' },
  { id: 'service_provider', label: 'Service Provider' },
  { id: 'cultural_advisor', label: 'Cultural Advisor' },
  { id: 'board_member', label: 'Board Member' },
];

/**
 * Story status options
 */
export const STORY_STATUSES = [
  { id: 'draft', label: 'Draft', color: 'gray' },
  { id: 'pending', label: 'Pending Review', color: 'amber' },
  { id: 'published', label: 'Published', color: 'green' },
  { id: 'archived', label: 'Archived', color: 'red' },
];

/**
 * Story access levels
 */
export const STORY_ACCESS_LEVELS = [
  { id: 'public', label: 'Public', description: 'Visible to everyone' },
  { id: 'community', label: 'Community', description: 'Visible to community members' },
  { id: 'restricted', label: 'Restricted', description: 'Restricted access only' },
];
