'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, BookOpen, Heart, Star, Users, Image as ImageIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import PhotoGallery from '@/components/profile/PhotoGallery';
import StoryTimeline from '@/components/profile/StoryTimeline';
import ProfileStats from '@/components/profile/ProfileStats';
import ShareProfile from '@/components/profile/ShareProfile';

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
  summary?: string;
  content?: string;
  story_category: string;
  created_at: string;
  media_type?: string;
}

export default function StorytellerProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'stories' | 'photos'>('about');

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

        // Fetch photos (if table exists)
        const { data: photosData } = await supabase
          .from('storyteller_photos')
          .select('*')
          .eq('storyteller_id', id)
          .order('display_order', { ascending: true });

        // Fetch stats (if table exists)
        const { data: statsData } = await supabase
          .from('storyteller_stats')
          .select('*')
          .eq('storyteller_id', id)
          .single();

        setProfile(profileData);
        setStories(storiesData || []);
        setPhotos(photosData || []);
        setStats(statsData);
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
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coral-warm mx-auto mb-4"></div>
            <p className="text-xl text-earth-dark">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-earth-dark mb-4">Storyteller not found</p>
            <Link href="/storytellers" className="text-coral-warm hover:text-ocean-medium font-medium">
              ← Back to Storytellers
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const displayName = profile.preferred_name || profile.full_name;
  const hasHonorific = profile.is_elder || profile.full_name.toLowerCase().includes('uncle') || profile.full_name.toLowerCase().includes('aunty');

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Navigation */}
        <div className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-8 py-4">
            <Link href="/storytellers" className="flex items-center text-coral-warm hover:text-ocean-medium font-medium">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Storytellers
            </Link>
          </div>
        </div>

        {/* Hero Section with Large Portrait */}
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="card-modern shadow-2xl overflow-hidden">
              {/* Portrait Photo */}
              <div className="relative w-full aspect-[4/3] md:aspect-[16/9] max-h-[500px] bg-gradient-to-br from-earth-bg to-ocean-light/10">
              {profile.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={`Portrait of ${displayName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full bg-gradient-to-br from-ocean-medium to-ocean-light flex items-center justify-center text-white font-bold text-7xl shadow-2xl">
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
                <div className="absolute top-4 right-4 bg-coral-warm text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Elder
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="p-8 md:p-12">
              {/* Name Section */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-6xl font-bold text-ocean-deep mb-2">
                  {profile.full_name}
                </h1>

                {profile.preferred_name && profile.preferred_name !== profile.full_name && (
                  <p className="text-xl text-earth-medium italic">Known as "{profile.preferred_name}"</p>
                )}

                {profile.storyteller_type && (
                  <p className="text-lg text-coral-warm font-medium mt-2 capitalize">
                    {profile.storyteller_type.replace('_', ' ')}
                  </p>
                )}
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-6 mb-8 text-earth-medium">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-ocean-medium" />
                  <span>{profile.location || 'Palm Island'}</span>
                </div>

                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-coral-warm" />
                  <span className="font-bold">{stories.length}</span>
                  <span className="ml-1">{stories.length === 1 ? 'story' : 'stories'} shared</span>
                </div>

                {profile.metadata?.personal_quote && (
                  <div className="w-full mt-4 p-6 bg-coral-warm/10 rounded-lg border-l-4 border-coral-600">
                    <p className="text-lg text-earth-dark italic">
                      "{profile.metadata.personal_quote}"
                    </p>
                  </div>
                )}
              </div>

              {/* Profile Stats */}
              {stats && (
                <div className="mb-8">
                  <ProfileStats
                    totalStories={stats.total_stories || stories.length}
                    totalWords={stats.total_words || 0}
                    firstStoryDate={stats.first_story_date || stories[stories.length - 1]?.created_at}
                    lastStoryDate={stats.last_story_date || stories[0]?.created_at}
                    categoryBreakdown={stats.category_breakdown || {}}
                    averageReadingTime={stats.average_reading_time || 0}
                  />
                </div>
              )}

              {/* Share Profile */}
              <div className="mb-8 flex justify-end">
                <ShareProfile
                  profileId={id}
                  storytellerName={displayName}
                />
              </div>

              {/* Tabbed Interface */}
              <div className="mb-8">
                <div className="border-b-2 border-earth-bg">
                  <nav className="flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('about')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'about'
                          ? 'border-coral-warm text-coral-warm'
                          : 'border-transparent text-earth-medium hover:text-ocean-deep hover:border-earth-medium'
                      }`}
                    >
                      About
                    </button>
                    <button
                      onClick={() => setActiveTab('stories')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'stories'
                          ? 'border-coral-warm text-coral-warm'
                          : 'border-transparent text-earth-medium hover:text-ocean-deep hover:border-earth-medium'
                      }`}
                    >
                      Stories ({stories.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('photos')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'photos'
                          ? 'border-coral-warm text-coral-warm'
                          : 'border-transparent text-earth-medium hover:text-ocean-deep hover:border-earth-medium'
                      }`}
                    >
                      Photos ({photos.length})
                    </button>
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'about' && (
                <div className="space-y-8">
                  {/* Biography */}
                  {profile.bio && (
                    <div>
                      <h2 className="text-2xl font-bold text-ocean-deep mb-4 flex items-center">
                        <Users className="w-6 h-6 mr-2 text-coral-warm" />
                        About {displayName}
                      </h2>
                      <div className="prose prose-lg max-w-none">
                        <p className="text-earth-dark leading-relaxed whitespace-pre-line">
                          {profile.bio}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Additional metadata if available */}
                  {profile.metadata && Object.keys(profile.metadata).length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {profile.metadata.interests && (
                        <div className="card-modern p-6">
                          <h3 className="font-bold text-ocean-deep mb-3">Interests</h3>
                          <p className="text-earth-medium">{profile.metadata.interests}</p>
                        </div>
                      )}
                      {profile.metadata.achievements && (
                        <div className="card-modern p-6">
                          <h3 className="font-bold text-ocean-deep mb-3">Achievements</h3>
                          <p className="text-earth-medium">{profile.metadata.achievements}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'stories' && (
                <div>
                  <StoryTimeline stories={stories} />
                </div>
              )}

              {activeTab === 'photos' && (
                <div>
                  {photos.length > 0 ? (
                    <PhotoGallery photos={photos} storytellerName={displayName} />
                  ) : (
                    <div className="bg-earth-bg rounded-lg p-12 text-center">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 text-earth-medium" />
                      <p className="text-earth-medium text-lg">
                        No photos available yet. Check back soon!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Call to Action */}
              <div className="mt-12 p-8 bg-gradient-to-r from-ocean-deep to-ocean-medium rounded-xl text-white text-center">
                <Heart className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Share Your Story</h3>
                <p className="mb-6">
                  Every voice matters. Every story strengthens our community.
                </p>
                <Link
                  href="/stories/submit"
                  className="inline-block bg-white text-ocean-deep px-8 py-3 rounded-lg font-bold hover:bg-earth-bg transition-all"
                >
                  Submit Your Story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-ocean-deep text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-lg font-medium mb-2">Palm Island Story Server</p>
          <p className="text-sm text-white/70 italic">
            Community-controlled storytelling • Indigenous data sovereignty
          </p>
          <p className="text-xs text-white/50 mt-4">Manbarra & Bwgcolman Country</p>
        </div>
      </footer>
      </div>
    </AppLayout>
  );
}
