/**
 * Story Scoring Algorithm
 * Multi-factor scoring system for intelligent story placement
 *
 * Total Score = (Quality × 0.30) + (Engagement × 0.25) + (Cultural × 0.20) + (Recency × 0.15) + (Diversity × 0.10)
 */

import type { Story } from './types';

export interface ScoreWeights {
  quality: number;
  engagement: number;
  cultural: number;
  recency: number;
  diversity: number;
}

export interface StoryScores {
  quality_score: number;
  engagement_score: number;
  cultural_score: number;
  recency_score: number;
  diversity_score: number;
  total_score: number;
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  quality: 0.30,
  engagement: 0.25,
  cultural: 0.20,
  recency: 0.15,
  diversity: 0.10,
};

/**
 * Calculate quality score (0-100)
 * Based on: featured status, verification, elder approval, traditional knowledge, media, content length
 */
export function calculateQualityScore(story: Story): number {
  let score = 50; // Base score

  // Featured stories get significant boost
  if (story.is_featured) score += 25;

  // Verified stories
  if (story.is_verified) score += 20;

  // Elder approval for traditional knowledge
  if (story.elder_approval_given) score += 15;

  // Contains traditional knowledge
  if (story.contains_traditional_knowledge) score += 10;

  // Has media attached
  if (story.story_media && story.story_media.length > 0) score += 5;

  // Content length (longer = more substantial)
  if (story.content && story.content.length > 500) score += 5;

  return Math.min(100, score);
}

/**
 * Calculate engagement score (0-100)
 * Based on: views, shares, likes with logarithmic normalization
 */
export function calculateEngagementScore(story: Story): number {
  const views = story.views || 0;
  const shares = story.shares || 0;
  const likes = story.likes || 0;

  // Weight shares higher than likes, likes higher than views
  const rawScore = (views * 1) + (shares * 3) + (likes * 2);

  // Logarithmic normalization to 0-100 scale
  const normalizedScore = Math.log10(rawScore + 1) * 20;

  // Add boost for recent engagement velocity
  let velocityBoost = 0;
  if (story.created_at) {
    const daysOld = Math.floor(
      (Date.now() - new Date(story.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysOld > 0 && daysOld <= 30) {
      const engagementPerDay = rawScore / daysOld;
      if (engagementPerDay > 10) {
        velocityBoost = Math.min(15, engagementPerDay);
      }
    }
  }

  return Math.min(100, normalizedScore + velocityBoost);
}

/**
 * Calculate cultural score (0-100)
 * Based on: elder storyteller, cultural advisor, traditional knowledge, elder approval
 */
export function calculateCulturalScore(story: Story): number {
  let score = 0;

  if (story.storyteller?.is_elder) score += 40;
  if (story.storyteller?.is_cultural_advisor) score += 30;
  if (story.contains_traditional_knowledge) score += 30;
  if (story.elder_approval_given) score += 20;

  return Math.min(100, score);
}

/**
 * Calculate recency score (0-100)
 * Based on: time since creation with decay function
 */
export function calculateRecencyScore(story: Story): number {
  if (!story.created_at) return 50;

  const now = Date.now();
  const createdAt = new Date(story.created_at).getTime();
  const daysOld = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

  if (daysOld <= 7) return 100;
  else if (daysOld <= 30) return 90 - ((daysOld - 7) * 2);
  else if (daysOld <= 90) return 50 - ((daysOld - 30) * 0.5);
  else if (daysOld <= 365) return 20 - ((daysOld - 90) * 0.05);
  else return Math.max(0, 10 - ((daysOld - 365) * 0.01));
}

/**
 * Calculate diversity score (0-100)
 * Penalizes repetition of same storyteller, category, emotional theme
 */
export function calculateDiversityScore(
  story: Story,
  previousStories: Story[]
): number {
  let score = 100;

  const storytellerId = story.storyteller?.id;
  const category = story.category;
  const emotionalTheme = story.emotional_theme;

  let storytellerRepeat = 0;
  let categoryRepeat = 0;
  let themeRepeat = 0;

  for (const prev of previousStories) {
    if (prev.storyteller?.id === storytellerId) storytellerRepeat++;
    if (prev.category === category) categoryRepeat++;
    if (prev.emotional_theme === emotionalTheme) themeRepeat++;
  }

  score -= storytellerRepeat * 15;
  score -= categoryRepeat * 10;
  score -= themeRepeat * 8;

  return Math.max(0, score);
}

/**
 * Calculate all scores for a story
 */
export function calculateStoryScores(
  story: Story,
  weights: ScoreWeights = DEFAULT_WEIGHTS,
  previousStories: Story[] = []
): StoryScores {
  const quality_score = calculateQualityScore(story);
  const engagement_score = calculateEngagementScore(story);
  const cultural_score = calculateCulturalScore(story);
  const recency_score = calculateRecencyScore(story);
  const diversity_score = calculateDiversityScore(story, previousStories);

  const total_score =
    quality_score * weights.quality +
    engagement_score * weights.engagement +
    cultural_score * weights.cultural +
    recency_score * weights.recency +
    diversity_score * weights.diversity;

  return {
    quality_score,
    engagement_score,
    cultural_score,
    recency_score,
    diversity_score,
    total_score,
  };
}

/**
 * Custom scoring for specific page contexts
 */
export const CONTEXT_WEIGHTS: Record<string, ScoreWeights> = {
  home: { quality: 0.35, engagement: 0.30, cultural: 0.15, recency: 0.10, diversity: 0.10 },
  about: { quality: 0.25, engagement: 0.10, cultural: 0.45, recency: 0.10, diversity: 0.10 },
  stories: { quality: 0.30, engagement: 0.30, cultural: 0.15, recency: 0.15, diversity: 0.10 },
  impact: { quality: 0.40, engagement: 0.30, cultural: 0.10, recency: 0.10, diversity: 0.10 },
  community: { quality: 0.20, engagement: 0.25, cultural: 0.20, recency: 0.20, diversity: 0.15 },
  'elder-care': { quality: 0.20, engagement: 0.10, cultural: 0.50, recency: 0.10, diversity: 0.10 },
  featured: { quality: 0.50, engagement: 0.25, cultural: 0.15, recency: 0.05, diversity: 0.05 },
  trending: { quality: 0.15, engagement: 0.50, cultural: 0.10, recency: 0.20, diversity: 0.05 },
};

export function getContextWeights(pageContext: string): ScoreWeights {
  return CONTEXT_WEIGHTS[pageContext] || DEFAULT_WEIGHTS;
}

export function scoreAndRankStories(
  stories: Story[],
  pageContext: string,
  previousStories: Story[] = []
): Array<Story & { scores: StoryScores }> {
  const weights = getContextWeights(pageContext);

  const scoredStories = stories.map((story) => ({
    ...story,
    scores: calculateStoryScores(story, weights, previousStories),
  }));

  scoredStories.sort((a, b) => b.scores.total_score - a.scores.total_score);

  return scoredStories;
}

export function formatScores(scores: StoryScores): string {
  return `Total: ${scores.total_score.toFixed(1)} (Q:${scores.quality_score.toFixed(0)} E:${scores.engagement_score.toFixed(0)} C:${scores.cultural_score.toFixed(0)} R:${scores.recency_score.toFixed(0)} D:${scores.diversity_score.toFixed(0)})`;
}
