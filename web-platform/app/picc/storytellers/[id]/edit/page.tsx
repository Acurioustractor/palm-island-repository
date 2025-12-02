'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { User, Save, X, Upload as UploadIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditStorytellerPage() {
  const params = useParams();
  const router = useRouter();
  const storytellerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    preferred_name: '',
    bio: '',
    storyteller_type: 'community_member',
    is_elder: false,
    is_cultural_advisor: false,
    location: 'Palm Island',
    email: '',
    phone: '',
    traditional_country: '',
    language_group: '',
    profile_image_file: null as File | null,
    current_image_url: ''
  });

  useEffect(() => {
    loadStoryteller();
  }, [storytellerId]);

  const loadStoryteller = async () => {
    try {
      const supabase = createClient();

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
          location: data.location || 'Palm Island',
          email: data.email || '',
          phone: data.phone || '',
          traditional_country: data.traditional_country || '',
          language_group: data.language_group || '',
          profile_image_file: null,
          current_image_url: data.profile_image_url || ''
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setFormData({ ...formData, profile_image_file: file });
  };

  const uploadProfileImage = async (file: File, storytellerId: string): Promise<string> => {
    const supabase = createClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${storytellerId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          preferred_name: formData.preferred_name || null,
          bio: formData.bio || null,
          storyteller_type: formData.storyteller_type,
          is_elder: formData.is_elder,
          is_cultural_advisor: formData.is_cultural_advisor,
          location: formData.location,
          email: formData.email || null,
          phone: formData.phone || null,
          traditional_country: formData.traditional_country || null,
          language_group: formData.language_group || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', storytellerId);

      if (profileError) throw profileError;

      // Upload new profile image if provided
      if (formData.profile_image_file) {
        setUploading(true);
        const imageUrl = await uploadProfileImage(formData.profile_image_file, storytellerId);

        // Update profile with image URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ profile_image_url: imageUrl })
          .eq('id', storytellerId);

        if (updateError) throw updateError;
        setUploading(false);
      }

      alert('Storyteller updated successfully!');
      router.push('/picc/storytellers');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading storyteller...</p>
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
          <User className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Edit Storyteller</h1>
        </div>
        <p className="text-gray-600">
          Update profile information for {formData.preferred_name || formData.full_name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Profile Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo
          </label>
          <div className="flex items-start gap-4">
            <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-white opacity-50" />
              )}
            </div>
            <div className="flex-1">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                <UploadIcon className="w-4 h-4" />
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Upload a profile photo (JPG, PNG, WebP - max 5MB)
              </p>
              {formData.current_image_url && !formData.profile_image_file && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Current photo will be kept unless you upload a new one
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Short bio about the storyteller..."
          />
        </div>

        {/* Storyteller Type and Roles */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <option value="service_provider">Service Provider</option>
              <option value="cultural_advisor">Cultural Advisor</option>
              <option value="visitor">Visitor</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Roles
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_elder}
                onChange={(e) => setFormData({ ...formData, is_elder: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Elder</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_cultural_advisor}
                onChange={(e) => setFormData({ ...formData, is_cultural_advisor: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Cultural Advisor</span>
            </label>
          </div>
        </div>

        {/* Location & Culture */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Traditional Country
            </label>
            <input
              type="text"
              value={formData.traditional_country}
              onChange={(e) => setFormData({ ...formData, traditional_country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Bwgcolman"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

        {/* Contact */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link
            href="/picc/storytellers"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving || uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {uploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
