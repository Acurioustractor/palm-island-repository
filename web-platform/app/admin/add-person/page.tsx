'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, User, Upload, FileText, CheckCircle, Loader, Camera, Mic } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

export default function AddPersonPage() {
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('Palm Island');
  const [storytellerType, setStorytellerType] = useState('community_member');
  const [isElder, setIsElder] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profileId, setProfileId] = useState('');

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setError('');
    const supabase = createClient();

    try {
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

      if (transcript && profile) {
        await supabase
          .from('stories')
          .insert({
            storyteller_id: profile.id,
            title: storyTitle || fullName + ' Story',
            content: transcript,
            media_type: 'text',
            access_level: 'public',
            status: 'published',
            metadata: {
              source: 'admin_form',
              created_at: new Date().toISOString(),
            }
          });
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
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full card-modern shadow-2xl p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
            <h2 className="text-3xl font-bold text-ocean-deep mb-2">Profile Created!</h2>
            <p className="text-earth-medium mb-6">{fullName} has been added successfully.</p>
            <div className="flex flex-col gap-3">
              <Link href={`/storytellers/${profileId}`} className="btn-primary text-center">
                View Profile
              </Link>
              <button onClick={() => {
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
                className="bg-earth-medium hover:bg-earth-dark text-white font-bold py-3 px-6 rounded-lg transition-all">
                Add Another Person
              </button>
              <Link href="/admin" className="text-ocean-medium hover:text-ocean-deep font-medium">
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen">
        <div className="bg-gradient-to-r from-ocean-deep to-ocean-medium text-white py-12 px-8">
          <div className="max-w-6xl mx-auto">
            <Link href="/admin" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Admin Dashboard
            </Link>
            <h1 className="text-4xl font-bold mb-2">Add New Person</h1>
            <p className="text-white/70">Simple form to add community members with photos and stories</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="card-modern">
              <h2 className="text-2xl font-bold text-ocean-deep mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-coral-warm" />
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-dark mb-2">
                    Full Name <span className="text-error">*</span>
                  </label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Uncle Frank Daniel Landers" required
                    className="input-field" />
                  <p className="text-sm text-earth-medium mt-1">Include honorifics like Uncle or Aunty if appropriate</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-dark mb-2">Preferred Name</label>
                  <input type="text" value={preferredName} onChange={(e) => setPreferredName(e.target.value)}
                    placeholder="Uncle Frank (optional - defaults to full name)"
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-dark mb-2">Location</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                    placeholder="Palm Island"
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-dark mb-2">Type</label>
                  <select value={storytellerType} onChange={(e) => setStorytellerType(e.target.value)}
                    className="input-field">
                    <option value="community_member">Community Member</option>
                    <option value="elder">Elder</option>
                    <option value="service_provider">Service Provider</option>
                    <option value="youth">Youth</option>
                    <option value="visitor">Visitor</option>
                    <option value="staff">Staff Member</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isElder" checked={isElder} onChange={(e) => setIsElder(e.target.checked)}
                    className="w-5 h-5 text-ocean-medium border-earth-light rounded focus:ring-ocean-medium" />
                  <label htmlFor="isElder" className="text-sm font-medium text-earth-dark">
                    Mark as Elder (shows Elder badge on profile)
                  </label>
                </div>
              </div>
            </div>

            <div className="card-modern">
              <h2 className="text-2xl font-bold text-ocean-deep mb-6 flex items-center">
                <Camera className="w-6 h-6 mr-2 text-ocean-medium" />
                Profile Photo
              </h2>
              <div className="space-y-4">
                {photoPreview ? (
                  <div className="text-center">
                    <img src={photoPreview} alt="Preview" className="w-48 h-48 rounded-full object-cover mx-auto mb-4 shadow-lg" />
                    <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                      className="text-error hover:text-red-800 font-medium">
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-earth-light rounded-lg p-8 text-center hover:border-ocean-medium transition-all">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-earth-medium" />
                    <input type="file" onChange={handlePhotoSelect} accept="image/*"
                      className="block w-full text-sm text-earth-medium file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-ocean-light/10 file:text-ocean-deep hover:file:bg-ocean-light/20" />
                    <p className="text-sm text-earth-medium mt-2">JPG, PNG, or GIF - Max 5MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card-modern">
              <h2 className="text-2xl font-bold text-ocean-deep mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-success" />
                Biography
              </h2>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about this person... (optional)" rows={6}
                className="input-field" />
              <p className="text-sm text-earth-medium mt-2">{bio.length} characters</p>
            </div>

            <div className="card-modern">
              <h2 className="text-2xl font-bold text-ocean-deep mb-6 flex items-center">
                <Mic className="w-6 h-6 mr-2 text-sunset-orange" />
                Their Story / Transcript
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-dark mb-2">Story Title (optional)</label>
                  <input type="text" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="e.g., Uncle Frank Story"
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-dark mb-2">Transcript / Story Content</label>
                  <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste transcript or story here... (optional - you can add this later)" rows={12}
                    className="input-field font-mono text-sm" />
                  <p className="text-sm text-earth-medium mt-2">
                    {transcript.length} characters
                    {transcript && ` - ${Math.ceil(transcript.length / 250)} min read`}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-modern">
              <button type="submit" disabled={!fullName || uploading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg">
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
              <p className="text-sm text-earth-medium text-center mt-4">
                Only the name is required. You can add photo, bio, and story later.
              </p>
            </div>
          </form>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
