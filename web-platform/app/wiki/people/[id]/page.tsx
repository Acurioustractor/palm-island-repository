'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Users, BookOpen, ArrowLeft, Edit2, MapPin, Globe, Heart } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';
import { EnhancedProfileEditor } from '@/components/wiki/EnhancedProfileEditor';
import { ProfilePhotoUpload } from '@/components/wiki/ProfilePhotoUpload';

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
  excerpt?: string;
  created_at: string;
  story_category?: string;
}

export default function PersonProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [featuredInStories, setFeaturedInStories] = useState<Story[]>([]);
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
      .select('id, title, excerpt, created_at, story_category, is_public')
      .eq('storyteller_id', id)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (!storiesError) {
      setStories(storiesData || []);
    }

    // Fetch stories where this person is featured (metadata.featured_people)
    try {
      const { data: featuredData, error: featuredError } = await supabase
        .from('stories')
        .select('id, title, excerpt, created_at, story_category, is_public, storyteller_id')
        .eq('is_public', true)
        .neq('storyteller_id', id)
        .contains('metadata', { featured_people: [id] })
        .order('created_at', { ascending: false });

      if (!featuredError) {
        const authoredIds = new Set((storiesData || []).map((s: any) => String(s.id)));
        setFeaturedInStories((featuredData || []).filter((s: any) => !authoredIds.has(String(s.id))));
      } else {
        setFeaturedInStories([]);
      }
    } catch {
      setFeaturedInStories([]);
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

  const handlePhotoUpdate = (newUrl: string) => {
    // Update the local state with new photo URL
    setProfile(prev => prev ? { ...prev, profile_image_url: newUrl } : null);
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-picc-ochre mx-auto mb-4"></div>
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-picc-ochre text-white rounded-lg hover:bg-picc-ochre-700 transition-colors"
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

        {/* Profile Photo Upload Section */}
        <div className="bg-white rounded-xl border border-stone-300 shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Photo</h2>
          <ProfilePhotoUpload
            profileId={profile.id}
            currentPhotoUrl={profile.profile_image_url}
            onPhotoUpdate={handlePhotoUpdate}
          />
        </div>

        {/* Profile Details Editor */}
        <EnhancedProfileEditor
          initialData={{
            full_name: profile.full_name,
            preferred_name: profile.preferred_name,
            profile_image_url: profile.profile_image_url,
            bio_short: profile.bio,
            bio_long: undefined,
            location: profile.location || '',
            traditional_country: profile.traditional_country,
            language_group: profile.language_group,
            community_roles: profile.community_role ? [profile.community_role] : [],
            expertise_areas: profile.expertise_areas || [],
            languages_spoken: profile.languages_spoken || [],
            profile_visibility: 'public',
            show_in_directory: true,
            face_recognition_consent: false,
          }}
          onSave={async (data) => {
            await handleProfileUpdate({
              full_name: data.full_name,
              preferred_name: data.preferred_name,
              profile_image_url: data.profile_image_url,
              bio: data.bio_short,
              location: data.location,
              traditional_country: data.traditional_country,
              language_group: data.language_group,
              community_role: data.community_roles?.[0],
              expertise_areas: data.expertise_areas,
              languages_spoken: data.languages_spoken,
            });
          }}
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
        <div className="h-48 bg-gradient-to-r from-picc-ochre-300 via-picc-red-300 to-picc-ochre-300 relative">
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
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-picc-ochre to-picc-red flex items-center justify-center text-white font-bold text-4xl">
                  {(profile.preferred_name || profile.full_name)
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              {profile.is_elder && (
                <div className="absolute -bottom-2 -right-2 bg-picc-ochre-500 text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-white shadow">
                  Elder
                </div>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-picc-ochre text-white rounded-lg hover:bg-picc-ochre-700 transition-colors font-medium shadow-sm"
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
              <p className="text-lg text-picc-ochre-700 font-medium">{profile.community_role}</p>
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
                        className="px-3 py-1 bg-warm-50 text-picc-red rounded-full text-sm border border-warm-200"
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
                        className="px-3 py-1 bg-warm-100 text-picc-ochre-700 rounded-full text-sm border border-warm-200"
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
        <div className="bg-gradient-to-r from-stone-100 to-warm-100 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-picc-ochre" />
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
                  className="block p-4 border border-gray-200 rounded-lg hover:border-picc-ochre-300 hover:bg-warm-100/50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-picc-ochre mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-picc-ochre-700 mb-1">
                      {story.title}
                    </h3>
                      {story.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {story.excerpt}
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

      {/* Featured In Section */}
      <div className="mt-6 bg-white rounded-xl border border-stone-300 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-stone-100 to-picc-ochre-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-6 w-6 text-picc-ochre" />
            Featured in ({featuredInStories.length})
          </h2>
        </div>
        <div className="p-6">
          {featuredInStories.length > 0 ? (
            <div className="space-y-4">
              {featuredInStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-picc-ochre-300 hover:bg-picc-ochre-50/50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-picc-ochre mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-picc-earth mb-1">
                      {story.title}
                    </h3>
                      {story.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {story.excerpt}
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
              <p>No featured stories yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
