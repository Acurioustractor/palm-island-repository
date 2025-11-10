'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { Upload as UploadIcon, User, Save, X, ArrowLeft, Trash2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function UploadStorytellerPhotoPage() {
  const params = useParams();
  const router = useRouter();
  const storytellerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [storyteller, setStoryteller] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadStoryteller();
  }, [storytellerId]);

  const loadStoryteller = async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, preferred_name, profile_image_url')
        .eq('id', storytellerId)
        .single();

      if (error) throw error;

      setStoryteller(data);
      if (data?.profile_image_url) {
        setImagePreview(data.profile_image_url);
      }
    } catch (error) {
      console.error('Error loading storyteller:', error);
      alert('Error loading storyteller');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5242880) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPG, PNG, and WebP images are supported');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
  };

  const uploadPhoto = async () => {
    if (!selectedFile) {
      alert('Please select a photo first');
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();

      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${storytellerId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update profile with image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', storytellerId);

      if (updateError) throw updateError;

      alert('Photo uploaded successfully!');
      router.push('/picc/storytellers');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async () => {
    if (!confirm('Are you sure you want to delete this profile photo?')) return;

    setDeleting(true);

    try {
      const supabase = createClient();

      // Update profile to remove image URL
      const { error } = await supabase
        .from('profiles')
        .update({ profile_image_url: null })
        .eq('id', storytellerId);

      if (error) throw error;

      alert('Photo deleted successfully');
      setImagePreview(null);
      setSelectedFile(null);
      loadStoryteller();
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!storyteller) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <p className="text-red-600">Storyteller not found</p>
          <Link href="/picc/storytellers" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Storytellers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/picc/storytellers"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Storytellers
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <ImageIcon className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Upload Profile Photo</h1>
        </div>
        <p className="text-gray-600">
          Upload or change the profile photo for {storyteller.preferred_name || storyteller.full_name}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Current/Preview Photo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Profile Photo
          </label>

          <div className="flex flex-col items-center">
            {/* Large preview */}
            <div className="w-64 h-64 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden mb-6 shadow-lg">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={storyteller.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-32 h-32 text-white opacity-50" />
              )}
            </div>

            {/* File input */}
            <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg">
              <UploadIcon className="w-5 h-5" />
              {selectedFile ? 'Choose Different Photo' : 'Choose Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <p className="text-sm text-green-600 mt-3 font-medium">
                ✓ Selected: {selectedFile.name}
              </p>
            )}

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md">
              <p className="text-sm text-blue-800 font-medium mb-2">Photo Guidelines:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Recommended size: 800x800px or larger</li>
                <li>• Max file size: 5MB</li>
                <li>• Formats: JPG, PNG, WebP</li>
                <li>• Square photos work best</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex gap-2">
            <Link
              href="/picc/storytellers"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </Link>

            {storyteller.profile_image_url && (
              <button
                onClick={deletePhoto}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Current Photo
              </button>
            )}
          </div>

          <button
            onClick={uploadPhoto}
            disabled={!selectedFile || uploading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Upload Photo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Tip:</strong> You can also edit the full profile including the photo by clicking the "Edit" button on the storyteller card.
        </p>
      </div>
    </div>
  );
}
