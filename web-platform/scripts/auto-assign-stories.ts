#!/usr/bin/env tsx
/**
 * Auto-Assign Stories to Page Contexts
 * 
 * Intelligently assigns stories to page sections based on:
 * - Multi-factor scoring (quality, engagement, cultural, recency, diversity)
 * - Placement rules configuration
 * - Cultural protocol enforcement
 * - Unique storyteller constraints
 * 
 * Run: npx tsx scripts/auto-assign-stories.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { PLACEMENT_RULES, type PlacementRule, type PlacementFilter } from '../lib/stories/placement-rules';
import { calculateStoryScores, formatScores, type ScoreWeights } from '../lib/stories/scoring';
import { canDisplayInContext } from '../lib/stories/cultural-protocols';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Story {
  id: string;
  title: string;
  content?: string;
  is_featured?: boolean;
  is_verified?: boolean;
  elder_approval_given?: boolean;
  contains_traditional_knowledge?: boolean;
  cultural_sensitivity_level?: string;
  story_type?: string;
  emotional_theme?: string;
  category?: string;
  views?: number;
  shares?: number;
  likes?: number;
  created_at?: string;
  story_media?: any[];
  storyteller?: {
    id: string;
    full_name?: string;
    preferred_name?: string;
    is_elder?: boolean;
    is_cultural_advisor?: boolean;
  };
}

async function autoAssignStories() {
  console.log('\n=== STORY AUTO-ASSIGNMENT ===\n');
  console.log(`Processing ${PLACEMENT_RULES.length} placement rules...\n`);

  let totalAssigned = 0;
  let totalStories = 0;

  // Fetch all public stories with storyteller info
  const { data: allStories, error } = await supabase
    .from('stories')
    .select(`
      *,
      storyteller:storyteller_id (
        id,
        full_name,
        preferred_name,
        is_elder,
        is_cultural_advisor
      )
    `)
    .eq('is_public', true);

  if (error || !allStories) {
    console.error('Error fetching stories:', error);
    return;
  }

  totalStories = allStories.length;
  console.log(`Found ${totalStories} public stories\n`);

  // Process each placement rule
  for (const rule of PLACEMENT_RULES) {
    console.log(`\n[${rule.pageContext}/${rule.pageSection}] ${rule.description || ''}`);
    console.log(`  Target: ${rule.limit} stories`);

    // Apply filters
    let filteredStories = applyFilters(allStories, rule.filters);
    console.log(`  After filters: ${filteredStories.length} candidates`);

    // Apply cultural protocol checks
    filteredStories = filteredStories.filter((story: any) => {
      const check = canDisplayInContext(story, rule.pageContext);
      if (!check.allowed) {
        console.log(`  ⚠ Filtered ${story.title.substring(0, 40)}: ${check.reason}`);
        return false;
      }
      return true;
    });
    console.log(`  After cultural protocols: ${filteredStories.length} stories`);

    if (filteredStories.length === 0) {
      console.log(`  ℹ No stories available for this placement`);
      continue;
    }

    // Calculate scores with rule-specific weights
    const weights = rule.weights || { quality: 0.30, engagement: 0.25, cultural: 0.20, recency: 0.15, diversity: 0.10 };
    const scoredStories = scoreStories(filteredStories, weights);

    // Handle featured_first constraint
    if (rule.featured_first) {
      scoredStories.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return b.total_score - a.total_score;
      });
    }

    // Handle unique_storyteller constraint
    let selectedStories = scoredStories;
    if (rule.require_unique_storyteller) {
      selectedStories = enforceUniqueStorytellers(scoredStories);
      console.log(`  After unique storyteller: ${selectedStories.length} stories`);
    }

    // Take top N stories
    const topStories = selectedStories.slice(0, rule.limit);

    // Update database with placements
    for (let i = 0; i < topStories.length; i++) {
      const story = topStories[i];
      const displayOrder = i + 1;

      const { error: updateError } = await supabase
        .from('stories')
        .update({
          page_context: rule.pageContext,
          page_section: rule.pageSection,
          display_order: displayOrder,
          quality_score: story.quality_score,
          engagement_score: story.engagement_score,
          cultural_score: story.cultural_score,
          recency_score: story.recency_score,
          total_score: story.total_score,
          auto_placed: true,
          placement_metadata: {
            rule_description: rule.description,
            assigned_at: new Date().toISOString(),
            scores: {
              quality: story.quality_score,
              engagement: story.engagement_score,
              cultural: story.cultural_score,
              recency: story.recency_score,
              total: story.total_score
            }
          },
          last_placement_update: new Date().toISOString()
        })
        .eq('id', story.id);

      if (updateError) {
        console.error(`  ✗ Failed to assign story ${story.id}:`, updateError);
      } else {
        const scoreDisplay = formatScores({
          quality_score: story.quality_score,
          engagement_score: story.engagement_score,
          cultural_score: story.cultural_score,
          recency_score: story.recency_score,
          diversity_score: 0,
          total_score: story.total_score
        });
        console.log(`  ✓ #${displayOrder} ${story.title.substring(0, 50)}`);
        console.log(`     ${scoreDisplay}`);
        console.log(`     By: ${story.storyteller?.preferred_name || story.storyteller?.full_name || 'Unknown'}`);
        totalAssigned++;
      }
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total stories: ${totalStories}`);
  console.log(`Total placements: ${totalAssigned}`);
  console.log(`\nℹ Run this script again to refresh placements based on updated scores`);
}

function applyFilters(stories: any[], filters?: PlacementFilter): any[] {
  if (!filters) return stories;

  return stories.filter((story) => {
    // Min scores
    if (filters.min_quality_score && (story.quality_score || 0) < filters.min_quality_score) return false;
    if (filters.min_engagement_score && (story.engagement_score || 0) < filters.min_engagement_score) return false;
    if (filters.min_cultural_score && (story.cultural_score || 0) < filters.min_cultural_score) return false;

    // Boolean requirements
    if (filters.require_verified && !story.is_verified) return false;
    if (filters.require_media && (!story.story_media || story.story_media.length === 0)) return false;
    if (filters.require_elder_approval && !story.elder_approval_given) return false;

    // Storyteller constraints
    if (filters.storyteller_is_elder && !story.storyteller?.is_elder) return false;
    if (filters.storyteller_is_cultural_advisor && !story.storyteller?.is_cultural_advisor) return false;

    // Array filters
    if (filters.story_types && filters.story_types.length > 0) {
      if (!story.story_type || !filters.story_types.includes(story.story_type)) return false;
    }
    if (filters.emotional_themes && filters.emotional_themes.length > 0) {
      if (!story.emotional_theme || !filters.emotional_themes.includes(story.emotional_theme)) return false;
    }
    if (filters.categories && filters.categories.length > 0) {
      if (!story.category || !filters.categories.includes(story.category)) return false;
    }

    // Exclusions
    if (filters.exclude_story_ids && filters.exclude_story_ids.includes(story.id)) return false;

    return true;
  });
}

function scoreStories(stories: any[], weights: ScoreWeights): any[] {
  const previousStories: any[] = []; // For diversity calculation

  return stories.map((story) => {
    const scores = calculateStoryScores(story, weights, previousStories);
    previousStories.push(story); // Add to previous for next iteration

    return {
      ...story,
      ...scores
    };
  }).sort((a, b) => b.total_score - a.total_score);
}

function enforceUniqueStorytellers(stories: any[]): any[] {
  const seen = new Set<string>();
  return stories.filter((story) => {
    const storytellerId = story.storyteller?.id;
    if (!storytellerId) return true; // Include stories without storytellers
    if (seen.has(storytellerId)) return false;
    seen.add(storytellerId);
    return true;
  });
}

// Run the assignment
autoAssignStories().catch(console.error);
