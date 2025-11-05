'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, User, Upload, FileText, CheckCircle, Loader, Camera, Mic } from 'lucide-react';

export default function AddPersonPage() {
  // Basic Info
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('Palm Island');
  const [storytellerType, setStorytellerType] = useState('community_member');
  const [isElder, setIsElder] = useState(false);

  // Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Transcript/Story
  const [transcript, setTranscript] = useState('');
  const [storyTitle, setStoryTitle] = useState('');

  // UI State
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profileId, setProfileId] = useState('');

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setError('');

    const supabase = createClient();

    try {
      // 1. Upload photo if provided
      let photoUrl = null;
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

      // 2. Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          full_name: fullName,
          preferred_name: preferredName || fullName,
          bio,
          location,
          storyteller_type: storytellerType,
          is_elder: isElder,
          profile_image_url: photoUrl,
          metadata: {
            added_via: 'admin_form',
            added_at: new Date().toISOString(),
          }
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // 3. Create story from transcript if provided
      if (transcript && profile) {
        const { error: storyError } = await supabase
          .from('stories')
          .insert({
            storyteller_id: profile.id,
            title: storyTitle || `${fullName}'s Story`,
            content: transcript,
            media_type: 'text',
            access_level: 'public',
            status: 'published',
            metadata: {
              source: 'admin_form',
              created_at: new Date().toISOString(),
            }
          });

        if (storyError) {
          console.error('Story creation error:', storyError);
          // Don't fail the whole process if story fails
        }
      }

      setProfileId(profile.id);
      setSuccess(true);

    } catch (err: any) {
      console.error('Creation error:', err);
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Created!</h2>
          <p className="text-gray-600 mb-6">
            {fullName} has been added successfully.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/storytellers/${profileId}`}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              View Profile
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setFullName('');
                setPreferredName('');
                setBio('');
                setTranscript('');
                setStoryTitle('');
                setPhotoFile(null);
                setPhotoPreview(null);
                setIsElder(false);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Add Another Person
            </Link>
            <Link
              href="/admin"
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </div>
    );
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
          <h1 className="text-4xl font-bold mb-2">Add New Person</h1>
          <p className="text-purple-100">
            Simple form to add community members with photos and stories
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-purple-600" />
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Uncle Frank Daniel Landers"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Include honorifics like "Uncle" or "Aunty" if appropriate
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Name
                  </label>
                  <input
                    type="text"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    placeholder="Uncle Frank (optional - defaults to full name)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Palm Island"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={storytellerType}
                    onChange={(e) => setStorytellerType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="community_member">Community Member</option>
                    <option value="elder">Elder</option>
                    <option value="service_provider">Service Provider</option>
                    <option value="youth">Youth</option>
                    <option value="visitor">Visitor</option>
                    <option value="staff">Staff Member</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isElder"
                    checked={isElder}
                    onChange={(e) => setIsElder(e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isElder" className="text-sm font-medium text-gray-700">
                    Mark as Elder (shows Elder badge on profile)
                  </label>
                </div>
              </div>
            </div>

            {/* Profile Photo */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Camera className="w-6 h-6 mr-2 text-blue-600" />
                Profile Photo
              </h2>

              <div className="space-y-4">
                {photoPreview ? (
                  <div className="text-center">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-48 h-48 rounded-full object-cover mx-auto mb-4 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-all">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <input
                      type="file"
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, PNG, or GIF • Max 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Biography */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-green-600" />
                Biography
              </h2>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about this person... (optional)"
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                {bio.length} characters
              </p>
            </div>

            {/* Transcript/Story */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Mic className="w-6 h-6 mr-2 text-orange-600" />
                Their Story / Transcript
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Title (optional)
                  </label>
                  <input
                    type="text"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="e.g., Uncle Frank's Story"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transcript / Story Content
                  </label>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste transcript or story here... (optional - you can add this later)"
                    rows={12}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {transcript.length} characters
                    {transcript && ` • ${Math.ceil(transcript.length / 250)} min read`}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <button
                type="submit"
                disabled={!fullName || uploading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
              >
                {uploading ? (
                  <>
                    <Loader className="w-6 h-6 mr-2 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <User className="w-6 h-6 mr-2" />
                    Create Profile
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 text-center mt-4">
                Only the name is required. You can add photo, bio, and story later.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
