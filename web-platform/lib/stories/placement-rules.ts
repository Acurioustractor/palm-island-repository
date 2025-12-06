/**
 * Story Placement Rules Configuration
 * Defines WHERE stories should appear across the website
 *
 * Mirrors the proven media auto-assignment pattern
 */

import { ScoringWeights, CONTEXT_WEIGHTS } from './scoring';

export interface PlacementFilter {
  // Story type filters
  story_types?: string[];
  exclude_story_types?: string[];

  // Cultural filters
  require_elder?: boolean;
  require_traditional_knowledge?: boolean;
  require_elder_approval?: boolean;
  cultural_sensitivity?: ('low' | 'medium' | 'high' | 'restricted')[];

  // Quality filters
  min_quality_score?: number;
  min_engagement_score?: number;
  min_cultural_score?: number;
  min_total_score?: number;

  // Feature flags
  require_verified?: boolean;
  require_featured?: boolean;
  require_media?: boolean;

  // Service relationship
  service_ids?: string[];
}

export interface PlacementRule {
  // Target location
  pageContext: string;
  pageSection: string;

  // How many stories to place
  limit: number;

  // Filters to apply
  filters?: PlacementFilter;

  // Custom weights for scoring
  weights?: ScoringWeights;

  // Diversity constraints
  require_unique_storyteller?: boolean;
  max_same_type?: number;

  // Featured handling
  featured_first?: boolean;

  // Description for logging
  description?: string;
}

/**
 * Complete placement rules for all pages
 */
export const PLACEMENT_RULES: PlacementRule[] = [
  // ============================================================================
  // HOME PAGE
  // ============================================================================
  {
    pageContext: 'home',
    pageSection: 'hero',
    limit: 1,
    filters: {
      min_quality_score: 80,
      min_engagement_score: 60,
      require_verified: true,
      require_media: true
    },
    weights: CONTEXT_WEIGHTS.home_hero,
    description: 'Home page hero - highest quality story with media'
  },
  {
    pageContext: 'home',
    pageSection: 'featured',
    limit: 6,
    filters: {
      min_quality_score: 70
    },
    weights: CONTEXT_WEIGHTS.home_featured,
    require_unique_storyteller: true,
    description: 'Home page featured carousel - diverse quality stories'
  },
  {
    pageContext: 'home',
    pageSection: 'voices',
    limit: 8,
    filters: {
      min_quality_score: 60
    },
    require_unique_storyteller: true,
    max_same_type: 3,
    description: 'Home page community voices section'
  },
  {
    pageContext: 'home',
    pageSection: 'elder-wisdom',
    limit: 3,
    filters: {
      require_elder: true,
      min_quality_score: 70
    },
    weights: CONTEXT_WEIGHTS.elder_wisdom,
    description: 'Home page elder wisdom section'
  },

  // ============================================================================
  // ABOUT PAGE
  // ============================================================================
  {
    pageContext: 'about',
    pageSection: 'hero',
    limit: 1,
    filters: {
      story_types: ['achievement', 'service_success'],
      min_quality_score: 75
    },
    description: 'About page hero - organizational achievement'
  },
  {
    pageContext: 'about',
    pageSection: 'elder-wisdom',
    limit: 4,
    filters: {
      require_elder: true,
      min_quality_score: 70
    },
    weights: CONTEXT_WEIGHTS.about_elders,
    description: 'About page elder stories section'
  },
  {
    pageContext: 'about',
    pageSection: 'highlights',
    limit: 6,
    filters: {
      story_types: ['community_story', 'service_success'],
      min_quality_score: 65
    },
    require_unique_storyteller: true,
    description: 'About page community impact showcase'
  },

  // ============================================================================
  // STORIES PAGE
  // ============================================================================
  {
    pageContext: 'stories',
    pageSection: 'hero',
    limit: 1,
    filters: {
      require_featured: true,
      min_quality_score: 80
    },
    featured_first: true,
    description: 'Stories page hero - featured story'
  },
  {
    pageContext: 'stories',
    pageSection: 'featured',
    limit: 3,
    filters: {
      require_verified: true,
      min_quality_score: 75
    },
    weights: CONTEXT_WEIGHTS.stories_featured,
    featured_first: true,
    description: 'Stories page featured section'
  },
  {
    pageContext: 'stories',
    pageSection: 'trending',
    limit: 6,
    filters: {
      min_engagement_score: 40
    },
    weights: CONTEXT_WEIGHTS.stories_trending,
    description: 'Stories page trending stories'
  },
  {
    pageContext: 'stories',
    pageSection: 'elder-wisdom',
    limit: 6,
    filters: {
      require_elder: true,
      min_quality_score: 65
    },
    weights: CONTEXT_WEIGHTS.elder_wisdom,
    description: 'Stories page elder voices section'
  },
  {
    pageContext: 'stories',
    pageSection: 'highlights',
    limit: 6,
    filters: {
      require_traditional_knowledge: true,
      require_elder_approval: true,
      cultural_sensitivity: ['high', 'medium']
    },
    weights: CONTEXT_WEIGHTS.elder_wisdom,
    description: 'Stories page traditional knowledge section'
  },
  {
    pageContext: 'stories',
    pageSection: 'recent',
    limit: 12,
    filters: {
      min_quality_score: 60
    },
    weights: {
      quality: 0.25,
      engagement: 0.20,
      cultural: 0.15,
      recency: 0.35, // Heavy recency weight
      diversity: 0.05
    },
    require_unique_storyteller: true,
    description: 'Stories page recent stories'
  },

  // ============================================================================
  // IMPACT PAGE
  // ============================================================================
  {
    pageContext: 'impact',
    pageSection: 'hero',
    limit: 1,
    filters: {
      story_types: ['achievement', 'service_success'],
      min_quality_score: 80
    },
    description: 'Impact page hero story'
  },
  {
    pageContext: 'impact',
    pageSection: 'highlights',
    limit: 6,
    filters: {
      story_types: ['service_success', 'achievement'],
      min_quality_score: 70
    },
    require_unique_storyteller: true,
    description: 'Impact page success stories'
  },
  {
    pageContext: 'impact',
    pageSection: 'voices',
    limit: 8,
    filters: {
      story_types: ['community_story'],
      min_quality_score: 65
    },
    require_unique_storyteller: true,
    description: 'Impact page community testimonials'
  },

  // ============================================================================
  // COMMUNITY PAGE
  // ============================================================================
  {
    pageContext: 'community',
    pageSection: 'featured',
    limit: 6,
    filters: {
      story_types: ['community_story'],
      min_quality_score: 70
    },
    require_unique_storyteller: true,
    description: 'Community page featured stories'
  },
  {
    pageContext: 'community',
    pageSection: 'elder-wisdom',
    limit: 4,
    filters: {
      require_elder: true,
      min_quality_score: 70
    },
    weights: CONTEXT_WEIGHTS.elder_wisdom,
    description: 'Community page elder wisdom'
  },

  // ============================================================================
  // ELDERS PAGE (if exists)
  // ============================================================================
  {
    pageContext: 'elders',
    pageSection: 'featured',
    limit: 8,
    filters: {
      require_elder: true,
      min_quality_score: 65
    },
    weights: CONTEXT_WEIGHTS.elder_wisdom,
    require_unique_storyteller: true,
    description: 'Elders page - stories from elders'
  },
  {
    pageContext: 'elders',
    pageSection: 'highlights',
    limit: 6,
    filters: {
      require_elder: true,
      require_traditional_knowledge: true,
      require_elder_approval: true
    },
    weights: CONTEXT_WEIGHTS.elder_wisdom,
    description: 'Elders page traditional knowledge section'
  },

  // ============================================================================
  // CULTURE PAGE
  // ============================================================================
  {
    pageContext: 'culture',
    pageSection: 'featured',
    limit: 6,
    filters: {
      require_traditional_knowledge: true,
      min_cultural_score: 60
    },
    weights: CONTEXT_WEIGHTS.elder_wisdom,
    description: 'Culture page featured stories'
  },
  {
    pageContext: 'culture',
    pageSection: 'elder-wisdom',
    limit: 6,
    filters: {
      require_elder: true,
      require_traditional_knowledge: true
    },
    weights: CONTEXT_WEIGHTS.elder_wisdom,
    description: 'Culture page elder knowledge'
  },

  // ============================================================================
  // SERVICES PAGES (dynamic based on service_id)
  // ============================================================================
  {
    pageContext: 'services',
    pageSection: 'highlights',
    limit: 6,
    filters: {
      story_types: ['service_success'],
      min_quality_score: 65
    },
    description: 'Service page success stories'
  },

  // ============================================================================
  // FEATURED COLLECTION (cross-site)
  // ============================================================================
  {
    pageContext: 'featured',
    pageSection: 'featured',
    limit: 20,
    filters: {
      require_featured: true,
      min_quality_score: 75
    },
    featured_first: true,
    require_unique_storyteller: true,
    description: 'Global featured stories collection'
  }
];

/**
 * Get placement rules for a specific page context
 */
export function getPlacementRulesForPage(pageContext: string): PlacementRule[] {
  return PLACEMENT_RULES.filter(rule => rule.pageContext === pageContext);
}

/**
 * Get a specific placement rule
 */
export function getPlacementRule(
  pageContext: string,
  pageSection: string
): PlacementRule | undefined {
  return PLACEMENT_RULES.find(
    rule => rule.pageContext === pageContext && rule.pageSection === pageSection
  );
}

/**
 * Get all unique page contexts
 */
export function getAllPageContexts(): string[] {
  return [...new Set(PLACEMENT_RULES.map(rule => rule.pageContext))];
}

/**
 * Get all sections for a page context
 */
export function getPageSections(pageContext: string): string[] {
  return PLACEMENT_RULES
    .filter(rule => rule.pageContext === pageContext)
    .map(rule => rule.pageSection);
}
