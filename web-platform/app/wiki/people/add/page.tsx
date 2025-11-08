'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  User, ArrowLeft, Save, UserPlus, AlertCircle,
  CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface FormData {
  full_name: string;
  preferred_name: string;
  email: string;
  phone: string;
  location: string;
  storyteller_type: string;
  is_elder: boolean;
  bio: string;
  traditional_country: string;
  language_group: string;
  community_role: string;
  expertise_areas: string;
  languages_spoken: string;
}

export default function AddPersonPage() {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    preferred_name: '',
    email: '',
    phone: '',
    location: 'Palm Island',
    storyteller_type: 'community_member',
    is_elder: false,
    bio: '',
    traditional_country: '',
    language_group: '',
    community_role: '',
    expertise_areas: '',
    languages_spoken: '',
  });

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const supabase = createClient();

      // Prepare data for Supabase
      const profileData: any = {
        full_name: formData.full_name.trim(),
        location: formData.location || 'Palm Island',
        storyteller_type: formData.storyteller_type,
        is_elder: formData.is_elder,
      };

      // Add optional fields if provided
      if (formData.preferred_name) profileData.preferred_name = formData.preferred_name.trim();
      if (formData.email) profileData.email = formData.email.trim();
      if (formData.phone) profileData.phone = formData.phone.trim();
      if (formData.bio) profileData.bio = formData.bio.trim();
      if (formData.traditional_country) profileData.traditional_country = formData.traditional_country.trim();
      if (formData.language_group) profileData.language_group = formData.language_group.trim();
      if (formData.community_role) profileData.community_role = formData.community_role.trim();

      // Handle array fields
      if (formData.expertise_areas) {
        profileData.expertise_areas = formData.expertise_areas
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }

      if (formData.languages_spoken) {
        profileData.languages_spoken = formData.languages_spoken
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }

      // Insert into Supabase
      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        setError(`Failed to add person: ${insertError.message}`);
        setSaving(false);
        return;
      }

      // Success!
      setSuccess(true);

      // Redirect to the person's page after 1.5 seconds
      setTimeout(() => {
        router.push(`/wiki/people/${data.id}`);
      }, 1500);

    } catch (err: any) {
      console.error('Error:', err);
      setError(`An error occurred: ${err.message || 'Unknown error'}`);
      setSaving(false);
    }
  };

  const handleQuickAdd = async () => {
    // Quick add with just name and type
    if (!formData.full_name.trim()) {
      setError('Please enter a name');
      return;
    }

    await handleSubmit(new Event('submit') as any);
  };

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'People', href: '/wiki/people' },
    { label: 'Add Person', href: '/wiki/people/add' },
  ];

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">
            Person Added Successfully!
          </h2>
          <p className="text-emerald-700">
            Redirecting to their profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <UserPlus className="h-10 w-10 text-amber-600" />
            Add New Person
          </h1>
          <p className="text-xl text-gray-600">
            Add a storyteller or community member to the directory
          </p>
        </div>
        <Link
          href="/wiki/people"
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-rose-900">Error</div>
            <div className="text-sm text-rose-700">{error}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Essential Information Card */}
        <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-stone-100 to-amber-50 border-b border-stone-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
              <User className="h-5 w-5" />
              Essential Information
            </h2>
            <p className="text-sm text-gray-600 mt-1">Required fields to add a person</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Full Name - REQUIRED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent text-lg"
                placeholder="e.g., Aunty Rose Johnson"
                required
              />
            </div>

            {/* Preferred Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Name (What they like to be called)
              </label>
              <input
                type="text"
                value={formData.preferred_name}
                onChange={(e) => updateField('preferred_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                placeholder="e.g., Aunty Rose"
              />
            </div>

            {/* Type and Elder Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storyteller Type
                </label>
                <select
                  value={formData.storyteller_type}
                  onChange={(e) => updateField('storyteller_type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                >
                  <option value="community_member">Community Member</option>
                  <option value="elder">Elder</option>
                  <option value="youth">Youth</option>
                  <option value="service_provider">Service Provider</option>
                  <option value="cultural_advisor">Cultural Advisor</option>
                  <option value="visitor">Visitor</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 w-full">
                  <input
                    type="checkbox"
                    checked={formData.is_elder}
                    onChange={(e) => updateField('is_elder', e.target.checked)}
                    className="h-5 w-5 text-amber-600 rounded border-gray-300 focus:ring-amber-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    This person is an Elder
                  </span>
                </label>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                placeholder="Palm Island"
              />
            </div>
          </div>
        </div>

        {/* Advanced Information - Collapsible */}
        <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full bg-gradient-to-r from-stone-50 to-amber-50/30 border-b border-stone-200 px-6 py-4 flex items-center justify-between hover:bg-stone-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-stone-800">
                Additional Information
              </h2>
              <span className="text-sm text-gray-600">(Optional)</span>
            </div>
            {showAdvanced ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {showAdvanced && (
            <div className="p-6 space-y-4">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="email@picc.com.au"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="04XX XXX XXX"
                  />
                </div>
              </div>

              {/* Cultural Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Traditional Country
                  </label>
                  <input
                    type="text"
                    value={formData.traditional_country}
                    onChange={(e) => updateField('traditional_country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="e.g., Manbarra Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language Group
                  </label>
                  <input
                    type="text"
                    value={formData.language_group}
                    onChange={(e) => updateField('language_group', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="e.g., Bwgcolman"
                  />
                </div>
              </div>

              {/* Community Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Role
                </label>
                <input
                  type="text"
                  value={formData.community_role}
                  onChange={(e) => updateField('community_role', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                  placeholder="e.g., Health Worker, Cultural Advisor, Teacher"
                />
              </div>

              {/* Biography */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biography
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-none"
                  placeholder="Share their story, background, and what makes them special to the community..."
                />
              </div>

              {/* Expertise Areas (comma separated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expertise Areas
                  <span className="text-sm text-gray-500 ml-2">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={formData.expertise_areas}
                  onChange={(e) => updateField('expertise_areas', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                  placeholder="e.g., Traditional Healing, Fishing, Storytelling"
                />
              </div>

              {/* Languages Spoken (comma separated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken
                  <span className="text-sm text-gray-500 ml-2">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={formData.languages_spoken}
                  onChange={(e) => updateField('languages_spoken', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                  placeholder="e.g., English, Traditional Language"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Add Person
              </>
            )}
          </button>

          <Link
            href="/wiki/people"
            className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Only <strong>Full Name</strong> is required - you can add more details later</li>
          <li>• Click "Additional Information" to add contact details, cultural info, and biography</li>
          <li>• For expertise and languages, separate items with commas</li>
          <li>• Email should be unique for each person</li>
        </ul>
      </div>
    </div>
  );
}
