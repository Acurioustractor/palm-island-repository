'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Search, Edit, Trash2, User, Camera, Loader } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  preferred_name: string;
  bio?: string;
  profile_image_url?: string;
  storyteller_type?: string;
  is_elder?: boolean;
  location?: string;
  created_at: string;
}

export default function ManageProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  }

  async function deleteProfile(id: string) {
    if (!confirm('Are you sure you want to delete this profile? This will also delete all their stories.')) {
      return;
    }

    const supabase = createClient();

    // Delete stories first
    await supabase
      .from('stories')
      .delete()
      .eq('storyteller_id', id);

    // Delete profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (!error) {
      setProfiles(profiles.filter(p => p.id !== id));
      alert('Profile deleted successfully');
    } else {
      alert('Error deleting profile: ' + error.message);
    }
  }

  const filteredProfiles = profiles.filter(profile => {
    const query = searchQuery.toLowerCase();
    return (
      profile.full_name.toLowerCase().includes(query) ||
      profile.preferred_name?.toLowerCase().includes(query) ||
      profile.location?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (selectedProfile && editing) {
    return <EditProfileForm profile={selectedProfile} onClose={() => {
      setSelectedProfile(null);
      setEditing(false);
      fetchProfiles();
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/admin"
            className="inline-flex items-center text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Manage Profiles</h1>
          <p className="text-purple-100">
            View, edit, and manage all community member profiles
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Search and Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or location..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <Link
                href="/admin/add-person"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all whitespace-nowrap"
              >
                + Add New Person
              </Link>
            </div>

            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <div>Total: <strong>{profiles.length}</strong> profiles</div>
              <div>Filtered: <strong>{filteredProfiles.length}</strong> showing</div>
            </div>
          </div>

          {/* Profiles Grid */}
          {filteredProfiles.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No profiles found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                >
                  {/* Photo */}
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 relative">
                    {profile.profile_image_url ? (
                      <img
                        src={profile.profile_image_url}
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <User className="w-24 h-24 text-gray-300" />
                      </div>
                    )}
                    {profile.is_elder && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Elder
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {profile.preferred_name || profile.full_name}
                    </h3>
                    {profile.preferred_name && profile.preferred_name !== profile.full_name && (
                      <p className="text-sm text-gray-500 mb-2">{profile.full_name}</p>
                    )}

                    <div className="text-sm text-gray-600 mb-3">
                      <div className="capitalize">{profile.storyteller_type?.replace('_', ' ')}</div>
                      <div>{profile.location}</div>
                    </div>

                    {profile.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {profile.bio}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProfile(profile);
                          setEditing(true);
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProfile(profile.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditProfileForm({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [preferredName, setPreferredName] = useState(profile.preferred_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [location, setLocation] = useState(profile.location || 'Palm Island');
  const [storytellerType, setStorytellerType] = useState(profile.storyteller_type || 'community_member');
  const [isElder, setIsElder] = useState(profile.is_elder || false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.profile_image_url || null);
  const [saving, setSaving] = useState(false);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    try {
      let photoUrl = profile.profile_image_url;

      // Upload new photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `profile-images/${Date.now()}-${fullName.replace(/[^a-zA-Z0-9]/g, '-')}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          preferred_name: preferredName,
          bio,
          location,
          storyteller_type: storytellerType,
          is_elder: isElder,
          profile_image_url: photoUrl,
        })
        .eq('id', profile.id);

      if (error) throw error;

      alert('Profile updated successfully!');
      onClose();
    } catch (err: any) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <User className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    onChange={handlePhotoSelect}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Name
                </label>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location & Type */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={storytellerType}
                  onChange={(e) => setStorytellerType(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="community_member">Community Member</option>
                  <option value="elder">Elder</option>
                  <option value="service_provider">Service Provider</option>
                  <option value="youth">Youth</option>
                  <option value="visitor">Visitor</option>
                  <option value="staff">Staff Member</option>
                </select>
              </div>
            </div>

            {/* Elder Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="editIsElder"
                checked={isElder}
                onChange={(e) => setIsElder(e.target.checked)}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="editIsElder" className="text-sm font-medium text-gray-700">
                Mark as Elder
              </label>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biography
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
