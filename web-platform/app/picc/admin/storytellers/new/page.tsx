'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Users, Save, X, AlertCircle, CheckCircle,
  User, Mail, Phone, MapPin, Award, Globe, Heart, Sparkles
} from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

export default function NewStorytellerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Identity
    full_name: '',
    preferred_name: '',
    community_role: '',

    // Contact
    email: '',
    phone: '',

    // Demographics
    age_range: '',
    gender: '',
    indigenous_status: 'Aboriginal or Torres Strait Islander',

    // Location
    location: 'Palm Island',
    traditional_country: '',
    language_group: '',

    // Storyteller Type
    storyteller_type: 'community_member',
    is_elder: false,
    is_cultural_advisor: false,
    is_service_provider: false,

    // Bio
    bio: '',
    expertise_areas: '',
    languages_spoken: '',

    // Cultural Permissions
    can_share_traditional_knowledge: false,
    face_recognition_consent: false,
    photo_consent_contexts: '',

    // Privacy
    profile_visibility: 'community',
    show_in_directory: true,
    allow_messages: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();

    // Process arrays from comma-separated strings
    const expertise_areas = formData.expertise_areas
      ? formData.expertise_areas.split(',').map(s => s.trim())
      : [];
    const languages_spoken = formData.languages_spoken
      ? formData.languages_spoken.split(',').map(s => s.trim())
      : [];
    const photo_consent_contexts = formData.photo_consent_contexts
      ? formData.photo_consent_contexts.split(',').map(s => s.trim())
      : [];

    const insertData = {
      full_name: formData.full_name,
      preferred_name: formData.preferred_name || null,
      community_role: formData.community_role || null,
      email: formData.email || null,
      phone: formData.phone || null,
      age_range: formData.age_range || null,
      gender: formData.gender || null,
      indigenous_status: formData.indigenous_status,
      location: formData.location,
      traditional_country: formData.traditional_country || null,
      language_group: formData.language_group || null,
      storyteller_type: formData.storyteller_type,
      is_elder: formData.is_elder,
      is_cultural_advisor: formData.is_cultural_advisor,
      is_service_provider: formData.is_service_provider,
      bio: formData.bio || null,
      expertise_areas,
      languages_spoken,
      can_share_traditional_knowledge: formData.can_share_traditional_knowledge,
      face_recognition_consent: formData.face_recognition_consent,
      face_recognition_consent_date: formData.face_recognition_consent ? new Date().toISOString() : null,
      photo_consent_contexts,
      profile_visibility: formData.profile_visibility,
      show_in_directory: formData.show_in_directory,
      allow_messages: formData.allow_messages,
    };

    const { data, error: insertError } = await supabase
      .from('profiles')
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating storyteller:', insertError);
      setError(insertError.message);
      setSaving(false);
    } else {
      // Success - redirect to profile page
      router.push(`/wiki/people/${data.id}`);
    }
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Storyteller Management', href: '/admin/storytellers' },
    { label: 'New Storyteller', href: '/admin/storytellers/new' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <Users className="h-10 w-10 text-blue-600" />
          Create Complete Storyteller Profile
        </h1>
        <p className="text-xl text-gray-600">
          Add comprehensive information about this community member
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error creating profile</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identity Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            Identity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Name
              </label>
              <input
                type="text"
                value={formData.preferred_name}
                onChange={(e) => setFormData({ ...formData, preferred_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                placeholder="e.g., Community Health Worker, Elder"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-600" />
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Demographics Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-600" />
            Demographics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Range
              </label>
              <select
                value={formData.age_range}
                onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="0-17">0-17 (Youth)</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45-54">45-54</option>
                <option value="55-64">55-64</option>
                <option value="65+">65+ (Elder)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indigenous Status
              </label>
              <select
                value={formData.indigenous_status}
                onChange={(e) => setFormData({ ...formData, indigenous_status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Aboriginal or Torres Strait Islander">Aboriginal or Torres Strait Islander</option>
                <option value="Non-Indigenous">Non-Indigenous</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location & Culture Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Location & Cultural Background
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Traditional Country
              </label>
              <input
                type="text"
                value={formData.traditional_country}
                onChange={(e) => setFormData({ ...formData, traditional_country: e.target.value })}
                placeholder="e.g., Manbarra Country"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                placeholder="e.g., Bwgcolman"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Storyteller Type Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="h-6 w-6 text-blue-600" />
            Storyteller Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storyteller Type *
              </label>
              <select
                required
                value={formData.storyteller_type}
                onChange={(e) => setFormData({ ...formData, storyteller_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="community_member">Community Member</option>
                <option value="elder">Elder</option>
                <option value="youth">Youth</option>
                <option value="service_provider">Service Provider</option>
                <option value="cultural_advisor">Cultural Advisor</option>
                <option value="visitor">Visitor</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_elder}
                  onChange={(e) => setFormData({ ...formData, is_elder: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Is Elder</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_cultural_advisor}
                  onChange={(e) => setFormData({ ...formData, is_cultural_advisor: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Is Cultural Advisor</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_service_provider}
                  onChange={(e) => setFormData({ ...formData, is_service_provider: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Is Service Provider</span>
              </label>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            Biography & Expertise
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biography
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Tell us about this person's background, experience, and contributions to the community..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expertise Areas
              </label>
              <input
                type="text"
                value={formData.expertise_areas}
                onChange={(e) => setFormData({ ...formData, expertise_areas: e.target.value })}
                placeholder="Comma-separated: health, education, cultural knowledge, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Enter expertise areas separated by commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Languages Spoken
              </label>
              <input
                type="text"
                value={formData.languages_spoken}
                onChange={(e) => setFormData({ ...formData, languages_spoken: e.target.value })}
                placeholder="Comma-separated: English, Bwgcolman, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Enter languages separated by commas</p>
            </div>
          </div>
        </div>

        {/* Cultural Permissions Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-blue-600" />
            Cultural Permissions & Consent
          </h2>

          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.can_share_traditional_knowledge}
                onChange={(e) => setFormData({ ...formData, can_share_traditional_knowledge: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Can Share Traditional Knowledge</span>
                <p className="text-xs text-gray-500">This person has permission to share traditional cultural knowledge</p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.face_recognition_consent}
                onChange={(e) => setFormData({ ...formData, face_recognition_consent: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Face Recognition Consent</span>
                <p className="text-xs text-gray-500">Consent given for face recognition in photos and videos</p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo Consent Contexts
              </label>
              <input
                type="text"
                value={formData.photo_consent_contexts}
                onChange={(e) => setFormData({ ...formData, photo_consent_contexts: e.target.value })}
                placeholder="Comma-separated: public_sharing, social_media, annual_report, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Contexts where photos can be used, separated by commas</p>
            </div>
          </div>
        </div>

        {/* Privacy Settings Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Visibility *
              </label>
              <select
                required
                value={formData.profile_visibility}
                onChange={(e) => setFormData({ ...formData, profile_visibility: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="public">Public - Visible to everyone</option>
                <option value="community">Community - Visible to authenticated users only</option>
                <option value="private">Private - Restricted visibility</option>
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.show_in_directory}
                onChange={(e) => setFormData({ ...formData, show_in_directory: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show in Directory</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.allow_messages}
                onChange={(e) => setFormData({ ...formData, allow_messages: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Allow Messages</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="h-5 w-5" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:bg-gray-400"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Create Storyteller Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
