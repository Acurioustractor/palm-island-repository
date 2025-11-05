'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, BookOpen, Heart, Star, Users } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Profile {
  id: string;
  full_name: string;
  preferred_name: string;
  profile_image_url?: string;
  bio?: string;
  location?: string;
  date_of_birth?: string;
  storyteller_type?: string;
  is_elder?: boolean;
  metadata?: any;
}

interface Story {
  id: string;
  title: string;
  content: string;
  created_at: string;
  media_type?: string;
}

export default function StorytellerProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileAndStories() {
      if (!id) return;

      try {
        const supabase = createClient();

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (profileError) throw profileError;

        // Fetch their stories
        const { data: storiesData, error: storiesError } = await supabase
          .from('stories')
          .select('*')
          .eq('storyteller_id', id)
          .order('created_at', { ascending: false });

        if (storiesError) console.error('Error fetching stories:', storiesError);

        setProfile(profileData);
        setStories(storiesData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    }

    fetchProfileAndStories();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-700 mb-4">Storyteller not found</p>
          <Link href="/storytellers" className="text-purple-600 hover:text-purple-800 font-medium">
            ← Back to Storytellers
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.preferred_name || profile.full_name;
  const hasHonorific = profile.is_elder || profile.full_name.toLowerCase().includes('uncle') || profile.full_name.toLowerCase().includes('aunty');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Navigation */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <Link href="/storytellers" className="flex items-center text-purple-600 hover:text-purple-800 font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Storytellers
          </Link>
        </div>
      </div>

      {/* Hero Section with Large Portrait */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Portrait Photo */}
            <div className="relative w-full aspect-[4/3] md:aspect-[16/9] max-h-[500px] bg-gradient-to-br from-purple-100 to-blue-100">
              {profile.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={`Portrait of ${displayName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-7xl shadow-2xl">
                    {displayName
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                </div>
              )}

              {/* Elder Badge */}
              {profile.is_elder && (
                <div className="absolute top-4 right-4 bg-purple-900 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Elder
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="p-8 md:p-12">
              {/* Name Section */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-2">
                  {profile.full_name}
                </h1>

                {profile.preferred_name && profile.preferred_name !== profile.full_name && (
                  <p className="text-xl text-gray-600 italic">Known as "{profile.preferred_name}"</p>
                )}

                {profile.storyteller_type && (
                  <p className="text-lg text-purple-600 font-medium mt-2 capitalize">
                    {profile.storyteller_type.replace('_', ' ')}
                  </p>
                )}
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-6 mb-8 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  <span>{profile.location || 'Palm Island'}</span>
                </div>

                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                  <span className="font-bold">{stories.length}</span>
                  <span className="ml-1">{stories.length === 1 ? 'story' : 'stories'} shared</span>
                </div>

                {profile.metadata?.personal_quote && (
                  <div className="w-full mt-4 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-600">
                    <p className="text-lg text-gray-700 italic">
                      "{profile.metadata.personal_quote}"
                    </p>
                  </div>
                )}
              </div>

              {/* Biography */}
              {profile.bio && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="w-6 h-6 mr-2 text-purple-600" />
                    About {displayName}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {profile.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Stories Section */}
              <div className="mt-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <BookOpen className="w-8 h-8 mr-3 text-purple-600" />
                  Stories from {displayName}
                </h2>

                {stories.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-600 text-lg">
                      No stories shared yet. Check back soon!
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {stories.map((story) => (
                      <Link
                        key={story.id}
                        href={`/stories/${story.id}`}
                        className="group bg-white border-2 border-purple-200 rounded-xl p-6 hover:shadow-xl hover:border-purple-400 transition-all"
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600">
                          {story.title || 'Untitled Story'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {story.content?.substring(0, 150)}...
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {new Date(story.created_at).toLocaleDateString('en-AU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-purple-600 font-medium group-hover:text-purple-800">
                            Read Story →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Call to Action */}
              <div className="mt-12 p-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white text-center">
                <Heart className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Share Your Story</h3>
                <p className="mb-6">
                  Every voice matters. Every story strengthens our community.
                </p>
                <Link
                  href="/stories/submit"
                  className="inline-block bg-white text-purple-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all"
                >
                  Submit Your Story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-medium mb-2">Palm Island Story Server</p>
          <p className="text-sm text-gray-300 italic">
            Community-controlled storytelling • Indigenous data sovereignty
          </p>
          <p className="text-xs text-gray-400 mt-4">Manbarra & Bwgcolman Country</p>
        </div>
      </footer>
    </div>
  );
}
