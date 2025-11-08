'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Camera, Upload, X, Check } from 'lucide-react';

interface ProfilePhotoUploadProps {
  profileId: string;
  currentPhotoUrl?: string;
  onPhotoUpdate: (newUrl: string) => void;
}

export function ProfilePhotoUpload({ profileId, currentPhotoUrl, onPhotoUpdate }: ProfilePhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a photo');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // 1. Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `profile-photos/${profileId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // 3. Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', profileId);

      if (updateError) throw updateError;

      // 4. Notify parent component
      onPhotoUpdate(publicUrl);

      setSuccess(true);
      setSelectedFile(null);
      setPreview(null);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Current Photo */}
      <div className="flex items-center gap-6">
        <div className="relative">
          {currentPhotoUrl ? (
            <img
              src={currentPhotoUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-4xl border-4 border-gray-200">
              <Camera className="h-12 w-12" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Profile Photo</h3>
          <p className="text-xs text-gray-600 mb-3">
            Upload a photo of yourself. Recommended: square image, at least 400x400px, max 5MB.
          </p>

          <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer text-sm font-medium">
            <Upload className="h-4 w-4" />
            Choose Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <img
              src={preview}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Ready to upload</h4>
              <p className="text-sm text-blue-700 mb-3">
                {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(0)} KB)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={uploading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-900">Photo uploaded successfully!</h4>
            <p className="text-sm text-emerald-700">Your profile photo has been updated.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-3">
          <div className="h-8 w-8 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
            <X className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-rose-900">Upload failed</h4>
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
