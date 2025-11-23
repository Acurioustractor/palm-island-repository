'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  ArrowLeft,
  CheckCircle,
  Shield,
  Heart,
  Users,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

// PICC Organization and Tenant IDs
const PICC_ORG_ID = '3c2011b9-f80d-4289-b300-0cd383cff479';
const PICC_TENANT_ID = '9c4e5de2-d80a-4e0b-8a89-1bbf09485532';

interface Service {
  id: string;
  service_name: string;
  service_slug: string;
}

export default function AddStorytellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const [formData, setFormData] = useState({
    full_name: '',
    preferred_name: '',
    email: '',
    phone: '',
    storyteller_type: 'community_member',
    community_role: '',
    bio: '',
    service_id: '',
    org_role: 'contributor',
    // Consent
    can_share_stories: true,
    consent_given: false,
    show_in_directory: true,
    // Cultural
    can_share_traditional_knowledge: false,
    is_elder: false,
    is_cultural_advisor: false
  });

  const storytellerTypes = [
    { value: 'community_member', label: 'Community Member', icon: Users, description: 'General community member' },
    { value: 'elder', label: 'Elder', icon: Heart, description: 'Respected community elder' },
    { value: 'youth', label: 'Youth', icon: User, description: 'Young community member' },
    { value: 'staff', label: 'PICC Staff', icon: Briefcase, description: 'PICC employee' },
    { value: 'cultural_advisor', label: 'Cultural Advisor', icon: Shield, description: 'Cultural knowledge keeper' }
  ];

  const orgRoles = [
    { value: 'contributor', label: 'Contributor', description: 'Can submit stories' },
    { value: 'staff', label: 'Staff Member', description: 'PICC staff with additional access' },
    { value: 'coordinator', label: 'Coordinator', description: 'Can coordinate story collection' },
    { value: 'elder', label: 'Elder', description: 'Elder with approval rights' },
    { value: 'cultural_advisor', label: 'Cultural Advisor', description: 'Can review cultural content' }
  ];

  // Fetch services on mount
  useEffect(() => {
    async function fetchServices() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('organization_services')
        .select('id, service_name, service_slug')
        .eq('organization_id', PICC_ORG_ID)
        .eq('is_active', true)
        .order('service_name');

      if (data && !error) {
        setServices(data);
      }
    }
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate consent
    if (!formData.consent_given) {
      setError('Consent must be given before adding a storyteller');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Create the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          tenant_id: PICC_TENANT_ID,
          full_name: formData.full_name,
          preferred_name: formData.preferred_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          storyteller_type: formData.storyteller_type,
          community_role: formData.community_role || null,
          bio: formData.bio || null,
          can_share_stories: formData.can_share_stories,
          consent_given: formData.consent_given,
          consent_date: new Date().toISOString(),
          show_in_directory: formData.show_in_directory,
          can_share_traditional_knowledge: formData.can_share_traditional_knowledge,
          is_elder: formData.storyteller_type === 'elder' || formData.is_elder,
          is_cultural_advisor: formData.storyteller_type === 'cultural_advisor' || formData.is_cultural_advisor,
          primary_organization_id: PICC_ORG_ID,
          is_verified: true,
          profile_visibility: 'community'
        })
        .select('id')
        .single();

      if (profileError) throw profileError;

      // Link to organization as member
      if (profile) {
        const canApprove = ['elder', 'cultural_advisor', 'coordinator'].includes(formData.org_role);

        const { error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: PICC_ORG_ID,
            profile_id: profile.id,
            role: formData.org_role,
            service_id: formData.service_id || null,
            can_approve_stories: canApprove,
            is_active: true
          });

        if (memberError) {
          console.warn('Could not link to organization:', memberError);
          // Don't fail - profile was created successfully
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push('/storytellers');
      }, 2000);

    } catch (err: any) {
      console.error('Error adding storyteller:', err);
      setError(err.message || 'Failed to add storyteller');
      setLoading(false);
    }
  };

  // Auto-set flags based on storyteller type
  useEffect(() => {
    if (formData.storyteller_type === 'elder') {
      setFormData(prev => ({ ...prev, is_elder: true, org_role: 'elder' }));
    } else if (formData.storyteller_type === 'cultural_advisor') {
      setFormData(prev => ({ ...prev, is_cultural_advisor: true, org_role: 'cultural_advisor' }));
    } else if (formData.storyteller_type === 'staff') {
      setFormData(prev => ({ ...prev, org_role: 'staff' }));
    }
  }, [formData.storyteller_type]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-900 mb-4">
            Storyteller Added!
          </h1>
          <p className="text-gray-700 mb-2">
            <strong>{formData.full_name}</strong> has been added to the Palm Island community.
          </p>
          <p className="text-sm text-gray-600">
            Redirecting to storytellers directory...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/storytellers"
            className="inline-flex items-center text-teal-600 hover:text-teal-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Storytellers
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-2">
              <User className="w-8 h-8 text-teal-600 mr-3" />
              <h1 className="text-3xl font-bold text-teal-900">
                Add New Storyteller
              </h1>
            </div>
            <p className="text-gray-600">
              Add a new community member to the Palm Island storytelling platform.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter full name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.preferred_name}
                  onChange={(e) => setFormData({ ...formData, preferred_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="What do they like to be called?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Role / Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.community_role}
                  onChange={(e) => setFormData({ ...formData, community_role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Youth Worker, Health Worker, Community Leader..."
                />
              </div>
            </div>
          </div>

          {/* Storyteller Type */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Storyteller Type *</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {storytellerTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, storyteller_type: type.value })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.storyteller_type === type.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${
                        formData.storyteller_type === type.value ? 'text-teal-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-800">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Connection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Service Connection (Optional)</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Service
                </label>
                <select
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">No specific service</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.service_name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Link this person to a PICC service they work with or are connected to.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Role
                </label>
                <select
                  value={formData.org_role}
                  onChange={(e) => setFormData({ ...formData, org_role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {orgRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">About This Person (Optional)</h2>

            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="A brief description of this person and their connection to Palm Island community..."
            />
          </div>

          {/* Consent & Permissions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              Consent & Permissions
            </h2>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consent_given}
                  onChange={(e) => setFormData({ ...formData, consent_given: e.target.checked })}
                  className="mt-1 h-5 w-5 text-teal-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-800">Consent Given *</div>
                  <div className="text-sm text-gray-600">
                    This person has given consent to be added to the platform and have their stories collected.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.can_share_stories}
                  onChange={(e) => setFormData({ ...formData, can_share_stories: e.target.checked })}
                  className="mt-1 h-5 w-5 text-teal-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-800">Can Share Stories</div>
                  <div className="text-sm text-gray-600">
                    This person can have their stories shared publicly (with their approval per story).
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.show_in_directory}
                  onChange={(e) => setFormData({ ...formData, show_in_directory: e.target.checked })}
                  className="mt-1 h-5 w-5 text-teal-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-800">Show in Directory</div>
                  <div className="text-sm text-gray-600">
                    Display this person in the public storytellers directory.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-t pt-4">
                <input
                  type="checkbox"
                  checked={formData.can_share_traditional_knowledge}
                  onChange={(e) => setFormData({ ...formData, can_share_traditional_knowledge: e.target.checked })}
                  className="mt-1 h-5 w-5 text-teal-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-800">Can Share Traditional Knowledge</div>
                  <div className="text-sm text-gray-600">
                    This person has permission to share traditional cultural knowledge (typically elders and cultural advisors).
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Cultural Protocol Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="font-bold text-amber-800 mb-2">Cultural Protocol Reminder</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Ensure proper consent has been obtained in a culturally appropriate manner</li>
              <li>• Elder stories may require additional cultural review before publishing</li>
              <li>• Traditional knowledge content should be flagged for cultural advisor review</li>
              <li>• All data remains under community control and ownership</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !formData.consent_given}
              className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:transform-none"
            >
              {loading ? 'Adding Storyteller...' : 'Add Storyteller'}
            </button>
            <Link
              href="/storytellers"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              New storytellers will be visible in the directory immediately.
            </p>
            <p className="mt-1">
              All community data remains 100% community-owned and controlled.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
