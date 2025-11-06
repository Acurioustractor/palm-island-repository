'use client';

import React from 'react';
import { BookOpen, Type, Calendar, TrendingUp, Tag } from 'lucide-react';

interface ProfileStatsProps {
  totalStories: number;
  totalWords: number;
  firstStoryDate?: string;
  lastStoryDate?: string;
  categoryBreakdown?: Record<string, number>;
  averageReadingTime?: number; // in seconds
}

export default function ProfileStats({
  totalStories,
  totalWords,
  firstStoryDate,
  lastStoryDate,
  categoryBreakdown = {},
  averageReadingTime = 0
}: ProfileStatsProps) {
  // Calculate member duration
  const getMemberDuration = () => {
    if (!firstStoryDate) return 'New member';
    const start = new Date(firstStoryDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      mens_health: "Men's Health",
      womens_health: "Women's Health",
      elder_care: 'Elder Care',
      youth: 'Youth',
      community: 'Community',
      health: 'Health',
      culture: 'Culture',
      education: 'Education',
      housing: 'Housing',
      justice: 'Justice',
      environment: 'Environment',
      family_support: 'Family Support',
    };
    return labels[category] || category;
  };

  // Get top categories
  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-modern p-4 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-coral-warm" />
          <div className="text-3xl font-bold text-ocean-deep">{totalStories}</div>
          <div className="text-sm text-earth-medium">
            {totalStories === 1 ? 'Story' : 'Stories'}
          </div>
        </div>

        <div className="card-modern p-4 text-center">
          <Type className="w-8 h-8 mx-auto mb-2 text-ocean-medium" />
          <div className="text-3xl font-bold text-ocean-deep">
            {(totalWords / 1000).toFixed(1)}k
          </div>
          <div className="text-sm text-earth-medium">Words</div>
        </div>

        <div className="card-modern p-4 text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-sunset-orange" />
          <div className="text-3xl font-bold text-ocean-deep">{getMemberDuration()}</div>
          <div className="text-sm text-earth-medium">Contributing</div>
        </div>

        <div className="card-modern p-4 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success" />
          <div className="text-3xl font-bold text-ocean-deep">
            {Math.ceil(averageReadingTime / 60)}
          </div>
          <div className="text-sm text-earth-medium">Min Avg Read</div>
        </div>
      </div>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <div className="card-modern p-6">
          <h3 className="text-lg font-bold text-ocean-deep mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2 text-coral-warm" />
            Top Themes
          </h3>
          <div className="space-y-3">
            {topCategories.map(([category, count]) => {
              const percentage = Math.round((count / totalStories) * 100);
              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-earth-dark">
                      {getCategoryLabel(category)}
                    </span>
                    <span className="text-sm text-earth-medium">
                      {count} {count === 1 ? 'story' : 'stories'} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-earth-bg rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-coral-warm to-sunset-orange h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline Summary */}
      {firstStoryDate && (
        <div className="card-modern p-6">
          <h3 className="text-lg font-bold text-ocean-deep mb-4">Timeline</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-earth-medium">First Story:</span>
              <span className="text-earth-dark font-medium">
                {new Date(firstStoryDate).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            {lastStoryDate && (
              <div className="flex justify-between">
                <span className="text-earth-medium">Latest Story:</span>
                <span className="text-earth-dark font-medium">
                  {new Date(lastStoryDate).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
