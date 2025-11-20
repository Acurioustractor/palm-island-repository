/**
 * Annual Report Generator for PICC
 * Generates comprehensive annual reports showing community impact,
 * storytelling trends, and service outcomes
 */

import { createClient } from '@/lib/supabase/client';
import type { Story, Profile } from '@/lib/empathy-ledger/types';

export interface AnnualReportData {
  year: number;
  reportPeriod: {
    start: string;
    end: string;
  };

  // Summary Statistics
  summary: {
    totalStories: number;
    totalStorytellers: number;
    totalElders: number;
    totalYouth: number;
    totalPeopleAffected: number;
    totalViews: number;
    totalShares: number;
  };

  // Story Breakdown
  storiesByCategory: Record<string, number>;
  storiesByType: Record<string, number>;
  storiesByService: Record<string, number>;
  storiesByMonth: Array<{ month: string; count: number }>;

  // Cultural Impact
  culturalMetrics: {
    traditionalKnowledgeStories: number;
    elderWisdomStories: number;
    culturalSensitivityBreakdown: Record<string, number>;
  };

  // Community Engagement
  engagement: {
    activeStorytellers: number;
    newStorytellers: number;
    averageStoriesPerStoryteller: number;
    mostActiveStorytellers: Array<{
      name: string;
      storyCount: number;
    }>;
  };

  // Impact Metrics
  impact: {
    totalPeopleAffected: number;
    impactByType: Record<string, number>;
    serviceEffectiveness: Array<{
      service: string;
      storyCount: number;
      peopleAffected: number;
    }>;
  };

  // Featured Content
  featured: {
    topStories: Array<{
      id: string;
      title: string;
      storytellerName: string;
      views: number;
      category: string;
    }>;
    mostEngagedCategory: string;
    mostImpactfulService: string;
  };

  // Trends & Insights
  insights: {
    growthRate: number; // Year-over-year growth
    mostCommonCategory: string;
    peakMonth: string;
    averageImpactPerStory: number;
  };
}

/**
 * Generate annual report for a specific year
 */
export async function generateAnnualReport(year: number): Promise<AnnualReportData> {
  const supabase = createClient();

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  // Fetch all stories for the year
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select(`
      *,
      storyteller:storyteller_id (
        id,
        full_name,
        preferred_name,
        storyteller_type,
        is_elder
      )
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59')
    .eq('organization_id', '3c2011b9-f80d-4289-b300-0cd383cff479'); // PICC

  if (storiesError) {
    console.error('Error fetching stories for annual report:', storiesError);
    throw storiesError;
  }

  // Transform storyteller arrays to objects
  const transformedStories = (stories || []).map(story => ({
    ...story,
    storyteller: Array.isArray(story.storyteller) ? story.storyteller[0] : story.storyteller,
  }));

  // Fetch all storytellers for the year
  const uniqueStorytellerIds = new Set(
    transformedStories.map(s => s.storyteller_id).filter(Boolean)
  );

  const { data: storytellers } = await supabase
    .from('profiles')
    .select('*')
    .in('id', Array.from(uniqueStorytellerIds));

  // Fetch previous year's stories for growth calculation
  const previousYearStart = `${year - 1}-01-01`;
  const previousYearEnd = `${year - 1}-12-31`;

  const { data: previousYearStories } = await supabase
    .from('stories')
    .select('id')
    .gte('created_at', previousYearStart)
    .lte('created_at', previousYearEnd + 'T23:59:59')
    .eq('organization_id', '3c2011b9-f80d-4289-b300-0cd383cff479');

  // Calculate summary statistics
  const totalStories = transformedStories.length;
  const totalStorytellers = uniqueStorytellerIds.size;
  const totalElders = storytellers?.filter(s => s.is_elder).length || 0;
  const totalYouth = storytellers?.filter(s => s.storyteller_type === 'youth').length || 0;

  const totalPeopleAffected = transformedStories.reduce(
    (sum, story) => sum + (story.people_affected || 0),
    0
  );

  const totalViews = transformedStories.reduce(
    (sum, story) => sum + (story.views || 0),
    0
  );

  const totalShares = transformedStories.reduce(
    (sum, story) => sum + (story.shares || 0),
    0
  );

  // Stories by category
  const storiesByCategory: Record<string, number> = {};
  transformedStories.forEach(story => {
    const category = story.category || 'uncategorized';
    storiesByCategory[category] = (storiesByCategory[category] || 0) + 1;
  });

  // Stories by type
  const storiesByType: Record<string, number> = {};
  transformedStories.forEach(story => {
    const type = story.story_type || 'unknown';
    storiesByType[type] = (storiesByType[type] || 0) + 1;
  });

  // Stories by service
  const storiesByService: Record<string, number> = {};
  transformedStories.forEach(story => {
    if (story.related_service) {
      storiesByService[story.related_service] =
        (storiesByService[story.related_service] || 0) + 1;
    }
  });

  // Stories by month
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const storiesByMonth = monthNames.map((month, index) => {
    const monthStories = transformedStories.filter(story => {
      const storyDate = new Date(story.created_at);
      return storyDate.getMonth() === index;
    });
    return { month, count: monthStories.length };
  });

  // Cultural metrics
  const traditionalKnowledgeStories = transformedStories.filter(
    s => s.contains_traditional_knowledge
  ).length;

  const elderWisdomStories = transformedStories.filter(
    s => s.story_type === 'elder_wisdom'
  ).length;

  const culturalSensitivityBreakdown: Record<string, number> = {};
  transformedStories.forEach(story => {
    const level = story.cultural_sensitivity_level || 'low';
    culturalSensitivityBreakdown[level] =
      (culturalSensitivityBreakdown[level] || 0) + 1;
  });

  // Engagement metrics
  const storytellerCounts = new Map<string, number>();
  transformedStories.forEach(story => {
    if (story.storyteller_id) {
      storytellerCounts.set(
        story.storyteller_id,
        (storytellerCounts.get(story.storyteller_id) || 0) + 1
      );
    }
  });

  const mostActiveStorytellers = Array.from(storytellerCounts.entries())
    .map(([storytellerId, count]) => {
      const storyteller = transformedStories.find(
        s => s.storyteller_id === storytellerId
      )?.storyteller;
      return {
        name: storyteller?.preferred_name || storyteller?.full_name || 'Unknown',
        storyCount: count,
      };
    })
    .sort((a, b) => b.storyCount - a.storyCount)
    .slice(0, 10);

  // New storytellers (first story in this year)
  const newStorytellerIds = new Set<string>();
  for (const story of transformedStories) {
    if (story.storyteller_id) {
      // Check if this storyteller has any stories before this year
      const { data: earlierStories } = await supabase
        .from('stories')
        .select('id')
        .eq('storyteller_id', story.storyteller_id)
        .lt('created_at', startDate)
        .limit(1);

      if (!earlierStories || earlierStories.length === 0) {
        newStorytellerIds.add(story.storyteller_id);
      }
    }
  }

  // Impact by type
  const impactByType: Record<string, number> = {};
  transformedStories.forEach(story => {
    if (story.impact_type && Array.isArray(story.impact_type)) {
      story.impact_type.forEach(type => {
        impactByType[type] = (impactByType[type] || 0) + 1;
      });
    }
  });

  // Service effectiveness
  const serviceEffectiveness = Object.entries(storiesByService).map(
    ([service, storyCount]) => {
      const serviceStories = transformedStories.filter(
        s => s.related_service === service
      );
      const peopleAffected = serviceStories.reduce(
        (sum, s) => sum + (s.people_affected || 0),
        0
      );
      return { service, storyCount, peopleAffected };
    }
  ).sort((a, b) => b.storyCount - a.storyCount);

  // Top stories
  const topStories = transformedStories
    .filter(s => s.is_public !== false)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10)
    .map(story => ({
      id: story.id,
      title: story.title,
      storytellerName: story.storyteller?.preferred_name ||
                       story.storyteller?.full_name ||
                       'Anonymous',
      views: story.views || 0,
      category: story.category,
    }));

  // Find most engaged category
  const mostEngagedCategory = Object.entries(storiesByCategory)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

  // Find most impactful service
  const mostImpactfulService = serviceEffectiveness[0]?.service || 'none';

  // Find peak month
  const peakMonth = storiesByMonth
    .reduce((max, curr) => curr.count > max.count ? curr : max, storiesByMonth[0])
    .month;

  // Calculate growth rate
  const previousYearTotal = previousYearStories?.length || 0;
  const growthRate = previousYearTotal > 0
    ? ((totalStories - previousYearTotal) / previousYearTotal) * 100
    : 0;

  // Average impact per story
  const storiesWithImpact = transformedStories.filter(s => s.people_affected).length;
  const averageImpactPerStory = storiesWithImpact > 0
    ? totalPeopleAffected / storiesWithImpact
    : 0;

  return {
    year,
    reportPeriod: {
      start: startDate,
      end: endDate,
    },
    summary: {
      totalStories,
      totalStorytellers,
      totalElders,
      totalYouth,
      totalPeopleAffected,
      totalViews,
      totalShares,
    },
    storiesByCategory,
    storiesByType,
    storiesByService,
    storiesByMonth,
    culturalMetrics: {
      traditionalKnowledgeStories,
      elderWisdomStories,
      culturalSensitivityBreakdown,
    },
    engagement: {
      activeStorytellers: totalStorytellers,
      newStorytellers: newStorytellerIds.size,
      averageStoriesPerStoryteller: totalStorytellers > 0
        ? totalStories / totalStorytellers
        : 0,
      mostActiveStorytellers,
    },
    impact: {
      totalPeopleAffected,
      impactByType,
      serviceEffectiveness,
    },
    featured: {
      topStories,
      mostEngagedCategory,
      mostImpactfulService,
    },
    insights: {
      growthRate,
      mostCommonCategory: mostEngagedCategory,
      peakMonth,
      averageImpactPerStory,
    },
  };
}

/**
 * Format category name for display
 */
export function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format story type for display
 */
export function formatStoryType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
