'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User, BookOpen, MapPin, Globe, Languages, Award, ArrowLeft, Calendar } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Storyteller {
  id: string;
  full_name: string;
  preferred_name?: string;
  profile_image_url?: string;
  bio?: string;
  location?: string;
  traditional_country?: string;
  language_group?: string;
  community_role?: string;
  expertise_areas?: string[];
  languages_spoken?: string[];
  is_elder: boolean;
  is_cultural_advisor: boolean;
  is_service_provider: boolean;
  storyteller_type: string;
  stories_contributed: number;
  last_story_date?: string;
  created_at: string;
}

interface Story {
  id: string;
  title: string;
  summary?: string;
  story_category: string;
  created_at: string;
}

export default function StorytellerProfilePage() {
  const params = useParams();
  const storytellerId = params.id as string;

  const [storyteller, setStoryteller] = useState<Storyteller | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PICC_ORG_ID = process.env.NEXT_PUBLIC_PICC_ORGANIZATION_ID || '3c2011b9-f80d-4289-b300-0cd383cff479';

  useEffect(() => {
    async function fetchStorytellerProfile() {
      try {
        const supabase = createClient();

        // Fetch storyteller profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', storytellerId)
          .single();

        if (profileError) throw profileError;
        setStoryteller(profileData);

        // Fetch their stories
        const { data: storiesData, error: storiesError } = await supabase
          .from('stories')
          .select('id, title, summary, story_category, created_at')
          .eq('storyteller_id', storytellerId)
          .eq('organization_id', PICC_ORG_ID)
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (storiesError) throw storiesError;
        setStories(storiesData || []);

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching storyteller:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    if (storytellerId) {
      fetchStorytellerProfile();
    }
  }, [storytellerId, PICC_ORG_ID]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-palm-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading storyteller profile...</p>
        </div>
      </div>
    );
  }

  if (error || !storyteller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Storyteller Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The storyteller profile you\'re looking for doesn\'t exist.'}
          </p>
          <Link
            href="/storytellers"
            className="inline-block bg-palm-600 hover:bg-palm-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Back to Storytellers
          </Link>
        </div>
      </div>
    );
  }

  const displayName = storyteller.preferred_name || storyteller.full_name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-palm-800 to-palm-700 text-white py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/storytellers"
            className="inline-flex items-center text-white hover:text-palm-100 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Storytellers
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
            <div className="md:flex">
              {/* Profile Image */}
              <div className="md:w-1/3 bg-gradient-to-br from-palm-100 to-palm-50">
                {storyteller.profile_image_url ? (
                  <img
                    src={storyteller.profile_image_url}
                    alt={displayName}
                    className="w-full h-full object-cover min-h-[300px]"
                  />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                    <div className="h-40 w-40 rounded-full bg-gradient-to-br from-palm-500 to-palm-700 flex items-center justify-center text-white font-bold text-6xl shadow-2xl">
                      {displayName
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="md:w-2/3 p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {storyteller.is_elder && (
                    <span className="px-3 py-1 bg-palm-800 text-white rounded-full text-sm font-medium">
                      Elder
                    </span>
                  )}
                  {storyteller.is_cultural_advisor && (
                    <span className="px-3 py-1 bg-palm-700 text-white rounded-full text-sm font-medium">
                      Cultural Advisor
                    </span>
                  )}
                  {storyteller.is_service_provider && (
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                      Service Provider
                    </span>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-2">{displayName}</h1>

                {storyteller.preferred_name && storyteller.preferred_name !== storyteller.full_name && (
                  <p className="text-lg text-gray-600 mb-4">{storyteller.full_name}</p>
                )}

                {storyteller.community_role && (
                  <p className="text-xl text-palm-700 font-medium mb-4">{storyteller.community_role}</p>
                )}

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {storyteller.location && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-palm-600 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Location</div>
                        <div className="text-gray-800">{storyteller.location}</div>
                      </div>
                    </div>
                  )}

                  {storyteller.traditional_country && (
                    <div className="flex items-start">
                      <Globe className="h-5 w-5 text-palm-600 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Traditional Country</div>
                        <div className="text-gray-800">{storyteller.traditional_country}</div>
                      </div>
                    </div>
                  )}

                  {storyteller.language_group && (
                    <div className="flex items-start">
                      <Languages className="h-5 w-5 text-palm-600 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Language Group</div>
                        <div className="text-gray-800">{storyteller.language_group}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <BookOpen className="h-5 w-5 text-palm-600 mr-2 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Stories Shared</div>
                      <div className="text-gray-800 font-bold">{stories.length}</div>
                    </div>
                  </div>
                </div>

                {storyteller.bio && (
                  <div className="mb-6">
                    <h3 className="text-sm text-gray-500 mb-2">About</h3>
                    <p className="text-gray-700 leading-relaxed">{storyteller.bio}</p>
                  </div>
                )}

                {storyteller.expertise_areas && storyteller.expertise_areas.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm text-gray-500 mb-2">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {storyteller.expertise_areas.map((area, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-palm-50 text-palm-800 rounded-full text-sm border border-palm-200"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {storyteller.languages_spoken && storyteller.languages_spoken.length > 0 && (
                  <div>
                    <h3 className="text-sm text-gray-500 mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {storyteller.languages_spoken.map((language, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm border border-blue-200"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stories Section */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Stories by {displayName}
            </h2>

            {stories.length === 0 ? (
              <p className="text-gray-600 text-center py-12">
                No public stories yet.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {stories.map((story) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="block bg-gradient-to-br from-palm-50 to-white border-2 border-palm-100 hover:border-palm-400 rounded-lg p-6 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 flex-1">{story.title}</h3>
                      <BookOpen className="h-5 w-5 text-palm-600 ml-2" />
                    </div>

                    {story.summary && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{story.summary}</p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-palm-700 font-medium">{story.story_category}</span>
                      <span className="text-gray-500">
                        {new Date(story.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
