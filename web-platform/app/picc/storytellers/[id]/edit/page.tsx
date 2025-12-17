'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Save,
  X,
  Upload as UploadIcon,
  ArrowLeft,
  Loader2,
  FolderOpen,
  Check,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';

interface MediaFile {
  id: string;
  public_url: string;
  title?: string;
  created_at: string;
  file_size?: number;
}

export default function EditStorytellerPage() {
  const params = useParams();
  const router = useRouter();
  const storytellerId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Media library state
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<MediaFile[]>([]);
  const [profileImages, setProfileImages] = useState<MediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    preferred_name: '',
    bio: '',
    storyteller_type: 'community_member',
    is_elder: false,
    is_cultural_advisor: false,
    show_in_directory: true,
    location: 'Palm Island',
    email: '',
    phone: '',
    traditional_country: '',
    language_group: '',
    community_role: '',
    age_range: '',
    profile_image_url: '',
  });

  const supabase = createClient();

  useEffect(() => {
    loadStoryteller();
    loadProfileImages();
  }, [storytellerId]);

  const loadStoryteller = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', storytellerId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          preferred_name: data.preferred_name || '',
          bio: data.bio || '',
          storyteller_type: data.storyteller_type || 'community_member',
          is_elder: data.is_elder || false,
          is_cultural_advisor: data.is_cultural_advisor || false,
          show_in_directory: data.show_in_directory !== false,
          location: data.location || 'Palm Island',
          email: data.email || '',
          phone: data.phone || '',
          traditional_country: data.traditional_country || '',
          language_group: data.language_group || '',
          community_role: data.community_role || '',
          age_range: data.age_range || '',
          profile_image_url: data.profile_image_url || '',
        });

        if (data.profile_image_url) {
          setImagePreview(data.profile_image_url);
        }
      }
    } catch (error) {
      console.error('Error loading storyteller:', error);
      alert('Error loading storyteller');
    } finally {
      setLoading(false);
    }
  };

  const loadProfileImages = async () => {
    try {
      const response = await fetch(`/api/storytellers/${storytellerId}/profile-image`);
      if (response.ok) {
        const data = await response.json();
        setProfileImages(data.profileImages || []);
      }
    } catch (error) {
      console.error('Error loading profile images:', error);
    }
  };

  const loadMediaLibrary = async () => {
    setLoadingMedia(true);
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('id, public_url, title, created_at, file_size')
        .eq('file_type', 'image')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMediaLibrary(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload using the new API
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch(`/api/storytellers/${storytellerId}/profile-image`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();

      // Update form state
      setFormData((prev) => ({ ...prev, profile_image_url: data.url }));
      setImagePreview(data.url);

      // Reload profile images to show the new one
      loadProfileImages();

      setSuccessMessage('Profile image uploaded and saved to media library');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
      // Revert preview
      setImagePreview(formData.profile_image_url || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const selectFromLibrary = async (mediaFile: MediaFile) => {
    try {
      const response = await fetch(`/api/storytellers/${storytellerId}/profile-image`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: mediaFile.id, imageUrl: mediaFile.public_url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update');
      }

      // Update state
      setFormData((prev) => ({ ...prev, profile_image_url: mediaFile.public_url }));
      setImagePreview(mediaFile.public_url);
      setShowMediaPicker(false);

      setSuccessMessage('Profile image updated');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      alert(`Failed to update: ${error.message}`);
    }
  };

  const removeProfileImage = async () => {
    if (!confirm('Remove the current profile image?')) return;

    try {
      const response = await fetch(`/api/storytellers/${storytellerId}/profile-image`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove');
      }

      setFormData((prev) => ({ ...prev, profile_image_url: '' }));
      setImagePreview(null);

      setSuccessMessage('Profile image removed');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      alert(`Failed to remove: ${error.message}`);
    }
  };

  const openMediaPicker = () => {
    setShowMediaPicker(true);
    loadMediaLibrary();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          preferred_name: formData.preferred_name || null,
          bio: formData.bio || null,
          storyteller_type: formData.storyteller_type,
          is_elder: formData.is_elder,
          is_cultural_advisor: formData.is_cultural_advisor,
          show_in_directory: formData.show_in_directory,
          location: formData.location,
          email: formData.email || null,
          phone: formData.phone || null,
          traditional_country: formData.traditional_country || null,
          language_group: formData.language_group || null,
          community_role: formData.community_role || null,
          age_range: formData.age_range || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', storytellerId);

      if (profileError) throw profileError;

      setSuccessMessage('Profile saved successfully');
      setTimeout(() => {
        router.push(`/picc/storytellers/${storytellerId}`);
      }, 1000);
    } catch (error: any) {
      console.error('Error saving storyteller:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading storyteller...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/picc/storytellers/${storytellerId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Edit: {formData.preferred_name || formData.full_name}
            </h1>
            <p className="text-gray-600 mt-1">Update profile information and photo</p>
          </div>

          {successMessage && (
            <span className="text-green-600 text-sm flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
              <Check className="w-4 h-4" />
              {successMessage}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Image */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>

              {/* Current Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                    <User className="w-24 h-24 text-white opacity-50" />
                  </div>
                )}

                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Image Actions */}
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <UploadIcon className="w-4 h-4" />
                  Upload New Photo
                </button>

                <button
                  type="button"
                  onClick={openMediaPicker}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <FolderOpen className="w-4 h-4" />
                  Select from Library
                </button>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeProfileImage}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Photo
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Photos are saved to the media library for future use
              </p>

              {/* Previous Profile Images */}
              {profileImages.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Previous Photos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {profileImages.slice(0, 6).map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => selectFromLibrary(img)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          formData.profile_image_url === img.public_url
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img src={img.public_url} alt="" className="w-full h-full object-cover" />
                        {formData.profile_image_url === img.public_url && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Uncle Frank Foster"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Uncle Frank"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Storyteller Type
                  </label>
                  <select
                    value={formData.storyteller_type}
                    onChange={(e) => setFormData({ ...formData, storyteller_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="community_member">Community Member</option>
                    <option value="elder">Elder</option>
                    <option value="youth">Youth</option>
                    <option value="staff">Staff Member</option>
                    <option value="service_user">Service User</option>
                    <option value="cultural_advisor">Cultural Advisor</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Community Role
                  </label>
                  <input
                    type="text"
                    value={formData.community_role}
                    onChange={(e) => setFormData({ ...formData, community_role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Elder, Teacher, Artist"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                  <select
                    value={formData.age_range}
                    onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Not specified</option>
                    <option value="under_18">Under 18</option>
                    <option value="18_25">18-25</option>
                    <option value="26_35">26-35</option>
                    <option value="36_45">36-45</option>
                    <option value="46_55">46-55</option>
                    <option value="56_65">56-65</option>
                    <option value="over_65">Over 65</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Short bio about the storyteller..."
                />
              </div>
            </div>

            {/* Cultural Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cultural Information</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Traditional Country
                  </label>
                  <input
                    type="text"
                    value={formData.traditional_country}
                    onChange={(e) =>
                      setFormData({ ...formData, traditional_country: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Bwgcolman"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Manbarra"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact (Private)</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_elder}
                    onChange={(e) => setFormData({ ...formData, is_elder: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Elder Status</span>
                    <p className="text-sm text-gray-500">
                      Mark as a respected Elder in the community
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_cultural_advisor}
                    onChange={(e) =>
                      setFormData({ ...formData, is_cultural_advisor: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Cultural Advisor</span>
                    <p className="text-sm text-gray-500">Provides cultural guidance and advice</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_in_directory}
                    onChange={(e) =>
                      setFormData({ ...formData, show_in_directory: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Show in Directory</span>
                    <p className="text-sm text-gray-500">Display in the public storyteller list</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <Link
                href={`/picc/storytellers/${storytellerId}`}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Select from Media Library</h2>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              {loadingMedia ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                  <p className="text-gray-500">Loading media...</p>
                </div>
              ) : mediaLibrary.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No images in the media library</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {mediaLibrary.map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => selectFromLibrary(media)}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all group"
                    >
                      <img
                        src={media.public_url}
                        alt={media.title || ''}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
