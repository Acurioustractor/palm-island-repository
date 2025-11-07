'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Save, User, Globe, Languages, Shield, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    preferred_name: '',
    community_role: '',
    bio: '',
    location: 'Palm Island',
    traditional_country: '',
    language_group: '',
    expertise_areas: [] as string[],
    languages_spoken: [] as string[],
    profile_visibility: 'community' as 'public' | 'community' | 'private',
    show_in_directory: true,
    allow_messages: true,
    can_share_traditional_knowledge: false,
    face_recognition_consent: false,
  });

  // Expertise and languages input
  const [expertiseInput, setExpertiseInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setMessage({ type: 'error', text: 'Please sign in to edit your profile' });
          setLoading(false);
          return;
        }

        setUserId(user.id);

        // Load profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error loading profile:', profileError);
          setMessage({ type: 'error', text: 'Could not load profile' });
          setLoading(false);
          return;
        }

        if (profile) {
          setFormData({
            preferred_name: profile.preferred_name || '',
            community_role: profile.community_role || '',
            bio: profile.bio || '',
            location: profile.location || 'Palm Island',
            traditional_country: profile.traditional_country || '',
            language_group: profile.language_group || '',
            expertise_areas: profile.expertise_areas || [],
            languages_spoken: profile.languages_spoken || [],
            profile_visibility: profile.profile_visibility || 'community',
            show_in_directory: profile.show_in_directory ?? true,
            allow_messages: profile.allow_messages ?? true,
            can_share_traditional_knowledge: profile.can_share_traditional_knowledge || false,
            face_recognition_consent: profile.face_recognition_consent || false,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setMessage({ type: 'error', text: 'An error occurred' });
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('profiles')
        .update({
          preferred_name: formData.preferred_name,
          community_role: formData.community_role,
          bio: formData.bio,
          location: formData.location,
          traditional_country: formData.traditional_country,
          language_group: formData.language_group,
          expertise_areas: formData.expertise_areas,
          languages_spoken: formData.languages_spoken,
          profile_visibility: formData.profile_visibility,
          show_in_directory: formData.show_in_directory,
          allow_messages: formData.allow_messages,
          can_share_traditional_knowledge: formData.can_share_traditional_knowledge,
          face_recognition_consent: formData.face_recognition_consent,
          face_recognition_consent_date: formData.face_recognition_consent
            ? new Date().toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        router.push('/storytellers');
      }, 2000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const addExpertise = () => {
    if (expertiseInput.trim() && !formData.expertise_areas.includes(expertiseInput.trim())) {
      setFormData({
        ...formData,
        expertise_areas: [...formData.expertise_areas, expertiseInput.trim()]
      });
      setExpertiseInput('');
    }
  };

  const removeExpertise = (index: number) => {
    setFormData({
      ...formData,
      expertise_areas: formData.expertise_areas.filter((_, i) => i !== index)
    });
  };

  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages_spoken.includes(languageInput.trim())) {
      setFormData({
        ...formData,
        languages_spoken: [...formData.languages_spoken, languageInput.trim()]
      });
      setLanguageInput('');
    }
  };

  const removeLanguage = (index: number) => {
    setFormData({
      ...formData,
      languages_spoken: formData.languages_spoken.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-palm-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold">Edit Your Profile</h1>
          <p className="text-palm-100 mt-2">Update your information and privacy settings</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <User className="h-6 w-6 text-palm-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Name
                  </label>
                  <input
                    type="text"
                    value={formData.preferred_name}
                    onChange={(e) => setFormData({ ...formData, preferred_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palm-500 focus:border-transparent"
                    placeholder="How you'd like to be called"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Community Role
                  </label>
                  <input
                    type="text"
                    value={formData.community_role}
                    onChange={(e) => setFormData({ ...formData, community_role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palm-500 focus:border-transparent"
                    placeholder="e.g., Teacher, Health Worker, Elder"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About You
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palm-500 focus:border-transparent"
                    placeholder="Tell us about yourself, your interests, and your connection to the community..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palm-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Cultural Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 text-palm-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Cultural Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Traditional Country
                  </label>
                  <input
                    type="text"
                    value={formData.traditional_country}
                    onChange={(e) => setFormData({ ...formData, traditional_country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palm-500 focus:border-transparent"
                    placeholder="e.g., Manbarra Country, Bwgcolman Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language Group
                  </label>
                  <input
                    type="text"
                    value={formData.language_group}
                    onChange={(e) => setFormData({ ...formData, language_group: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palm-500 focus:border-transparent"
                    placeholder="Your language group"
                  />
                </div>
              </div>
            </div>

            {/* Expertise & Languages */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Languages className="h-6 w-6 text-palm-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Skills & Languages</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Areas of Expertise
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={expertiseInput}
                      onChange={(e) => setExpertiseInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palm-500 focus:border-transparent"
                      placeholder="e.g., Cultural knowledge, Health, Education"
                    />
                    <button
                      type="button"
                      onClick={addExpertise}
                      className="px-4 py-2 bg-palm-600 hover:bg-palm-700 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise_areas.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-palm-50 text-palm-800 rounded-full text-sm border border-palm-200 flex items-center gap-2"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => removeExpertise(index)}
                          className="text-palm-600 hover:text-palm-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Languages Spoken
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palm-500 focus:border-transparent"
                      placeholder="e.g., English, Manbarra, Bwgcolman"
                    />
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="px-4 py-2 bg-palm-600 hover:bg-palm-700 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages_spoken.map((language, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm border border-blue-200 flex items-center gap-2"
                      >
                        {language}
                        <button
                          type="button"
                          onClick={() => removeLanguage(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Eye className="h-6 w-6 text-palm-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Privacy Settings</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    value={formData.profile_visibility}
                    onChange={(e) => setFormData({ ...formData, profile_visibility: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palm-500 focus:border-transparent bg-white"
                  >
                    <option value="public">Public - Anyone can see</option>
                    <option value="community">Community - PICC members only</option>
                    <option value="private">Private - Only me</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_in_directory"
                    checked={formData.show_in_directory}
                    onChange={(e) => setFormData({ ...formData, show_in_directory: e.target.checked })}
                    className="h-4 w-4 text-palm-600 focus:ring-palm-500 border-gray-300 rounded"
                  />
                  <label htmlFor="show_in_directory" className="ml-2 block text-sm text-gray-700">
                    Show in storyteller directory
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allow_messages"
                    checked={formData.allow_messages}
                    onChange={(e) => setFormData({ ...formData, allow_messages: e.target.checked })}
                    className="h-4 w-4 text-palm-600 focus:ring-palm-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allow_messages" className="ml-2 block text-sm text-gray-700">
                    Allow community members to contact me
                  </label>
                </div>
              </div>
            </div>

            {/* Cultural Permissions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-palm-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Cultural Permissions</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-palm-50 border border-palm-200 rounded-lg">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="can_share_traditional_knowledge"
                      checked={formData.can_share_traditional_knowledge}
                      onChange={(e) => setFormData({ ...formData, can_share_traditional_knowledge: e.target.checked })}
                      className="h-4 w-4 text-palm-600 focus:ring-palm-500 border-gray-300 rounded mt-1"
                    />
                    <div className="ml-3">
                      <label htmlFor="can_share_traditional_knowledge" className="block text-sm font-medium text-gray-900">
                        Traditional Knowledge Sharing
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        I have the right and permission to share traditional knowledge and cultural stories
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="face_recognition_consent"
                      checked={formData.face_recognition_consent}
                      onChange={(e) => setFormData({ ...formData, face_recognition_consent: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <div className="ml-3">
                      <label htmlFor="face_recognition_consent" className="block text-sm font-medium text-gray-900">
                        Face Recognition Consent
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        I consent to face recognition technology being used to identify me in photos (for auto-tagging)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-palm-600 hover:bg-palm-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                <Save className="h-5 w-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href="/storytellers"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
