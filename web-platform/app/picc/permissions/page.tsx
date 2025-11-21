'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, Lock, Eye, EyeOff, Users, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import Link from 'next/link';

interface PermissionProfile {
  id: string;
  full_name: string;
  preferred_name?: string;
  can_share_traditional_knowledge: boolean;
  face_recognition_consent: boolean;
  face_recognition_consent_date?: string;
  photo_consent_contexts?: string[];
  profile_visibility: string;
  show_in_directory: boolean;
  stories_count: number;
}

export default function PermissionsPage() {
  const [profiles, setProfiles] = useState<PermissionProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConsent, setFilterConsent] = useState<string>('all');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          preferred_name,
          can_share_traditional_knowledge,
          face_recognition_consent,
          face_recognition_consent_date,
          photo_consent_contexts,
          profile_visibility,
          show_in_directory
        `)
        .order('full_name');

      if (error) throw error;

      // Get story counts
      const profilesWithCounts = await Promise.all(
        (data || []).map(async (profile) => {
          const { count } = await supabase
            .from('stories')
            .select('*', { count: 'exact', head: true })
            .eq('storyteller_id', profile.id);

          return {
            ...profile,
            stories_count: count || 0
          };
        })
      );

      setProfiles(profilesWithCounts);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (
    profileId: string,
    field: string,
    value: boolean | string | string[]
  ) => {
    try {
      const supabase = createClient();

      const updateData: any = { [field]: value };

      // If updating face recognition consent, add timestamp
      if (field === 'face_recognition_consent' && value === true) {
        updateData.face_recognition_consent_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profileId);

      if (error) throw error;

      loadProfiles();
    } catch (error: any) {
      console.error('Error updating permission:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.preferred_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesConsent = filterConsent === 'all' ||
      (filterConsent === 'face_consent' && profile.face_recognition_consent) ||
      (filterConsent === 'no_face_consent' && !profile.face_recognition_consent) ||
      (filterConsent === 'traditional_knowledge' && profile.can_share_traditional_knowledge);

    return matchesSearch && matchesConsent;
  });

  const stats = {
    total: profiles.length,
    faceConsent: profiles.filter(p => p.face_recognition_consent).length,
    traditionalKnowledge: profiles.filter(p => p.can_share_traditional_knowledge).length,
    publicProfiles: profiles.filter(p => p.profile_visibility === 'public').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Cultural Permissions & Privacy</h1>
        </div>
        <p className="text-gray-600 mb-4">
          Manage cultural protocols, photo consent, and privacy settings for storytellers
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-1">
                Cultural Protocol Reminder
              </p>
              <p className="text-sm text-yellow-700">
                Always obtain explicit consent before sharing traditional knowledge, photos, or personal stories.
                Respect Elder guidance and community protocols.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Profiles</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.faceConsent}</div>
          <div className="text-sm text-gray-600">Face Recognition Consent</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{stats.traditionalKnowledge}</div>
          <div className="text-sm text-gray-600">Can Share Traditional Knowledge</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.publicProfiles}</div>
          <div className="text-sm text-gray-600">Public Profiles</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search storytellers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={filterConsent}
          onChange={(e) => setFilterConsent(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Permissions</option>
          <option value="face_consent">Has Face Consent</option>
          <option value="no_face_consent">No Face Consent</option>
          <option value="traditional_knowledge">Can Share Traditional Knowledge</option>
        </select>
      </div>

      {/* Profiles Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Storyteller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stories
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Face Recognition
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Traditional Knowledge
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile Visibility
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Directory
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {profile.preferred_name || profile.full_name}
                      </div>
                      {profile.preferred_name && (
                        <div className="text-xs text-gray-500">{profile.full_name}</div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{profile.stories_count}</span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => updatePermission(
                        profile.id,
                        'face_recognition_consent',
                        !profile.face_recognition_consent
                      )}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        profile.face_recognition_consent
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {profile.face_recognition_consent ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Consented
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          Not Consented
                        </>
                      )}
                    </button>
                    {profile.face_recognition_consent_date && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(profile.face_recognition_consent_date).toLocaleDateString()}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => updatePermission(
                        profile.id,
                        'can_share_traditional_knowledge',
                        !profile.can_share_traditional_knowledge
                      )}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        profile.can_share_traditional_knowledge
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {profile.can_share_traditional_knowledge ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          Not Approved
                        </>
                      )}
                    </button>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <select
                      value={profile.profile_visibility}
                      onChange={(e) => updatePermission(profile.id, 'profile_visibility', e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="public">Public</option>
                      <option value="community">Community</option>
                      <option value="private">Private</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => updatePermission(
                        profile.id,
                        'show_in_directory',
                        !profile.show_in_directory
                      )}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        profile.show_in_directory
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {profile.show_in_directory ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Hidden
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Permission Types
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-medium">Face Recognition:</span>
              <span>Consent to use facial recognition for photo tagging</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">Traditional Knowledge:</span>
              <span>Permission to share culturally sensitive stories</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">Profile Visibility:</span>
              <span>Who can see their profile (Public, Community, Private)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">Directory:</span>
              <span>Show/hide in public storyteller directory</span>
            </li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Cultural Protocol Guidelines
          </h3>
          <ul className="space-y-2 text-sm text-purple-800">
            <li>• Always seek Elder guidance for traditional knowledge</li>
            <li>• Obtain written consent before sharing sensitive content</li>
            <li>• Respect family and community wishes for privacy</li>
            <li>• Review consent annually or when circumstances change</li>
            <li>• Follow mourning protocols (remove content if requested)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
