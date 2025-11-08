'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Users, BookOpen, ArrowLeft, Edit2, MapPin, Globe, Heart } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';
import { EnhancedProfileEditor } from '@/components/wiki/EnhancedProfileEditor';

interface Profile {
  id: string;
  full_name: string;
  preferred_name?: string;
  profile_image_url?: string;
  bio?: string;
  location?: string;
  storyteller_type?: string;
  is_elder?: boolean;
  traditional_country?: string;
  language_group?: string;
  community_role?: string;
  languages_spoken?: string[];
  expertise_areas?: string[];
}

interface Story {
  id: string;
  title: string;
  summary?: string;
  created_at: string;
  story_category?: string;
}

export default function PersonProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchProfile(params.id as string);
    }
  }, [params?.id]);

  async function fetchProfile(id: string) {
    const supabase = createClient();

    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      setLoading(false);
      return;
    }

    setProfile(profileData);

    // Fetch stories by this person
    const { data: storiesData, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, summary, created_at, story_category, is_public')
      .eq('storyteller_id', id)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (!storiesError) {
      setStories(storiesData || []);
    }

    setLoading(false);
  }

  const handleProfileUpdate = async (updatedProfile: Partial<Profile>) => {
    if (!profile) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update(updatedProfile)
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } else {
      // Refresh profile data
      await fetchProfile(profile.id);
      setEditMode(false);
    }
  };

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'People', href: '/wiki/people' },
    { label: profile?.preferred_name || profile?.full_name || 'Loading...', href: `/wiki/people/${params?.id}` },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Profile not found
          </h3>
          <p className="text-gray-600 mb-6">This person's profile could not be found.</p>
          <Link
            href="/wiki/people"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to People
          </Link>
        </div>
      </div>
    );
  }

  // If in edit mode, show the editor
  if (editMode) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Breadcrumbs items={breadcrumbs} className="mb-6" />

        <div className="mb-6">
          <button
            onClick={() => setEditMode(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Cancel Editing
          </button>
        </div>

        <EnhancedProfileEditor
          profile={profile}
          onSave={handleProfileUpdate}
          onCancel={() => setEditMode(false)}
        />
      </div>
    );
  }

  // View mode
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/wiki/people"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to People
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-stone-300 shadow-sm overflow-hidden mb-8">
        {/* Cover/Banner */}
        <div className="h-48 bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 relative">
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        {/* Profile Content */}
        <div className="relative px-8 pb-8">
          {/* Profile Image */}
          <div className="flex justify-between items-start -mt-16 mb-6">
            <div className="relative">
              {profile.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={profile.preferred_name || profile.full_name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover bg-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-4xl">
                  {(profile.preferred_name || profile.full_name)
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              {profile.is_elder && (
                <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-white shadow">
                  Elder
                </div>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>

          {/* Name and Role */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profile.preferred_name || profile.full_name}
            </h1>
            {profile.preferred_name && profile.preferred_name !== profile.full_name && (
              <p className="text-lg text-gray-600 mb-2">{profile.full_name}</p>
            )}
            {profile.community_role && (
              <p className="text-lg text-purple-700 font-medium">{profile.community_role}</p>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mb-6">
              <p className="text-gray-700 text-lg leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {profile.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-600">Location</div>
                  <div className="font-medium text-gray-900">{profile.location}</div>
                </div>
              </div>
            )}

            {profile.traditional_country && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-600">Traditional Country</div>
                  <div className="font-medium text-gray-900">{profile.traditional_country}</div>
                </div>
              </div>
            )}

            {profile.language_group && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-600">Language Group</div>
                  <div className="font-medium text-gray-900">{profile.language_group}</div>
                </div>
              </div>
            )}

            {profile.storyteller_type && (
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-600">Storyteller Type</div>
                  <div className="font-medium text-gray-900 capitalize">
                    {profile.storyteller_type.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Skills/Expertise */}
          {(profile.languages_spoken?.length || profile.expertise_areas?.length) && (
            <div className="grid md:grid-cols-2 gap-6">
              {profile.languages_spoken && profile.languages_spoken.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages_spoken.map((lang, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.expertise_areas && profile.expertise_areas.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise_areas.map((expertise, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-200"
                      >
                        {expertise}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stories Section */}
      <div className="bg-white rounded-xl border border-stone-300 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-stone-100 to-purple-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-600" />
            Stories ({stories.length})
          </h2>
        </div>
        <div className="p-6">
          {stories.length > 0 ? (
            <div className="space-y-4">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 mb-1">
                        {story.title}
                      </h3>
                      {story.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {story.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No public stories yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
