'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Award, TrendingUp, Users, Heart, BookOpen, Sparkles } from 'lucide-react';
import { BespokeIcon } from '@/components/ui/BespokeIcon';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface AchievementStory {
  id: string;
  title: string;
  summary?: string;
  story_category?: string;
  created_at: string;
  location?: string;
  is_public?: boolean;
  storyteller?: {
    full_name: string;
    preferred_name?: string;
  } | {
    full_name: string;
    preferred_name?: string;
  }[];
  service?: {
    service_name: string;
    service_color?: string;
  } | {
    service_name: string;
    service_color?: string;
  }[];
}

export default function AchievementsPage() {
  const [stories, setStories] = useState<AchievementStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      const supabase = createClient();

      // Fetch stories showcasing achievements and positive impact
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          summary,
          story_category,
          created_at,
          location,
          is_public,
          storyteller:storyteller_id (
            full_name,
            preferred_name
          ),
          service:service_id (
            service_name,
            service_color
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
      } else {
        setStories((data || []) as unknown as AchievementStory[]);
      }

      setLoading(false);
    }

    fetchAchievements();
  }, []);

  // Filter stories by category for different achievement sections
  const successStories = stories.filter(s =>
    s.story_category === 'community_event' ||
    s.story_category === 'achievement'
  );

  const serviceStories = stories.filter(s => s.service);
  const recentAchievements = stories.slice(0, 6);

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Achievements', href: '/wiki/achievements' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-picc-ochre mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Award className="h-10 w-10 text-picc-ochre" />
          Community Achievements
        </h1>
        <p className="text-xl text-gray-600">
          Celebrating our successes and demonstrating Indigenous excellence
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-picc-ochre-50 rounded-lg p-4 text-center border border-picc-ochre-200">
          <div className="text-3xl font-bold text-picc-ochre">197</div>
          <div className="text-sm text-gray-600">PICC Staff</div>
        </div>
        <div className="bg-warm-50 rounded-lg p-4 text-center border border-picc-red-200">
          <div className="text-3xl font-bold text-picc-red">16+</div>
          <div className="text-sm text-gray-600">Integrated Services</div>
        </div>
        <div className="bg-sage-50 rounded-lg p-4 text-center border border-sage-200">
          <div className="text-3xl font-bold text-sage-600">100%</div>
          <div className="text-sm text-gray-600">Community Control</div>
        </div>
        <div className="bg-warm-50 rounded-lg p-4 text-center border border-warm-200">
          <div className="text-3xl font-bold text-picc-red">{stories.length}</div>
          <div className="text-sm text-gray-600">Impact Stories</div>
        </div>
      </div>

      {/* PICC Achievement Highlight */}
      <div className="bg-gradient-to-r from-picc-ochre-50 to-orange-50 border border-picc-ochre-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-picc-ochre" />
          PICC: Proving Indigenous Self-Determination Works
        </h2>
        <div className="prose max-w-none text-gray-700 space-y-4">
          <p>
            Palm Island Community Company (PICC) represents one of the most significant achievements
            in Indigenous self-determination in Australia, demonstrating that community-controlled
            services deliver better outcomes at scale.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-lg p-6 border border-picc-ochre-200">
              <div className="mb-2"><BespokeIcon name="economic" size={32} /></div>
              <h3 className="font-bold text-picc-earth mb-2">Employment</h3>
              <p className="text-sm text-gray-600">
                197 staff members employed across integrated services, creating local
                economic opportunities and building community capacity.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-picc-ochre-200">
              <div className="mb-2"><BespokeIcon name="governance" size={32} /></div>
              <h3 className="font-bold text-picc-earth mb-2">Service Integration</h3>
              <p className="text-sm text-gray-600">
                Over 16 integrated services operating under community control,
                from health and education to cultural programs.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-picc-ochre-200">
              <div className="mb-2"><BespokeIcon name="proud" size={32} /></div>
              <h3 className="font-bold text-picc-earth mb-2">Excellence</h3>
              <p className="text-sm text-gray-600">
                Demonstrating that Indigenous-led organizations can deliver
                world-class services at scale with 100% community governance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-stone-100 to-picc-ochre-50 border-b border-stone-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-sage-600" />
                Recent Achievements & Impact
              </h2>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {recentAchievements.map((story) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-picc-ochre-300 hover:bg-picc-ochre-50/50 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-picc-ochre mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-picc-ochre mb-1">
                          {story.title}
                        </h3>
                        {story.summary && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {story.summary}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {(() => {
                            const service = Array.isArray(story.service) ? story.service[0] : story.service;
                            return service && (
                              <span className="px-2 py-1 bg-warm-50 text-picc-red rounded border border-picc-red-200">
                                {service.service_name}
                              </span>
                            );
                          })()}
                          {story.location && (
                            <span className="px-2 py-1 bg-sage-50 text-sage-700 rounded border border-sage-200">
                              {story.location}
                            </span>
                          )}
                          {(() => {
                            const storyteller = Array.isArray(story.storyteller) ? story.storyteller[0] : story.storyteller;
                            return storyteller && (
                              <span className="text-gray-500">
                                by {storyteller.preferred_name || storyteller.full_name}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Stories by Category */}
      {successStories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="h-6 w-6 text-picc-red" />
            Community Success Stories
          </h2>
          <div className="space-y-3">
            {successStories.slice(0, 6).map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="block p-4 bg-white border border-stone-300 rounded-lg hover:border-picc-ochre-300 hover:bg-picc-ochre-50/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-picc-ochre mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-picc-ochre mb-1">
                      {story.title}
                    </h3>
                    {story.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {story.summary}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {story.story_category && (
                        <span className="px-2 py-1 bg-stone-100 rounded border border-stone-300">
                          {story.story_category.replace(/_/g, ' ')}
                        </span>
                      )}
                      <span>
                        {new Date(story.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Service Achievements */}
      {serviceStories.length > 0 && (
        <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-stone-100 to-warm-50 border-b border-stone-200 px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-picc-red" />
              Service Achievements & Impact
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Stories showcasing the impact of PICC's integrated services across the community
            </p>
            <div className="space-y-3">
              {serviceStories.slice(0, 6).map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-picc-red-300 hover:bg-warm-50/50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-picc-red mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-picc-red mb-1">
                        {story.title}
                      </h3>
                      {story.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {story.summary}
                        </p>
                      )}
                      {(() => {
                        const service = Array.isArray(story.service) ? story.service[0] : story.service;
                        return service && (
                          <div className="flex items-center gap-2 text-xs">
                            <span
                              className="px-2 py-1 rounded border"
                              style={{
                                backgroundColor: service.service_color ? `${service.service_color}20` : '#FEF3C7',
                                borderColor: service.service_color || '#F59E0B',
                                color: service.service_color || '#92400E'
                              }}
                            >
                              {service.service_name}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No stories fallback */}
      {stories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Achievement stories will appear here
          </h3>
          <p className="text-gray-600">
            Stories showcasing community successes and impact will be displayed here
          </p>
        </div>
      )}

      {/* Links to Related Pages */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Link
          href="/wiki/services"
          className="block p-6 bg-gradient-to-r from-warm-50 to-warm-50 border border-picc-red-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Heart className="h-8 w-8 text-picc-red mb-2" />
          <h3 className="font-bold text-picc-earth mb-2 group-hover:text-picc-red">
            PICC Services
          </h3>
          <p className="text-sm text-gray-700">
            Explore our integrated services
          </p>
        </Link>
        <Link
          href="/wiki/people"
          className="block p-6 bg-gradient-to-r from-warm-50 to-picc-ochre-50 border border-warm-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Users className="h-8 w-8 text-picc-red mb-2" />
          <h3 className="font-bold text-picc-earth mb-2 group-hover:text-picc-red">
            Our People
          </h3>
          <p className="text-sm text-gray-700">
            Meet the team making it happen
          </p>
        </Link>
        <Link
          href="/stories"
          className="block p-6 bg-gradient-to-r from-picc-ochre-50 to-orange-50 border border-picc-ochre-200 rounded-lg hover:shadow-md transition-all group"
        >
          <BookOpen className="h-8 w-8 text-picc-ochre mb-2" />
          <h3 className="font-bold text-picc-earth mb-2 group-hover:text-picc-ochre">
            All Stories
          </h3>
          <p className="text-sm text-gray-700">
            Browse the full collection
          </p>
        </Link>
      </div>
    </div>
  );
}
