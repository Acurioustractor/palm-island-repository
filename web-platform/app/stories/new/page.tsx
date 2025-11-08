'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  BookOpen, Save, X, AlertCircle, Image, Video, Upload, Trash2,
  Tag, MapPin, Calendar, Users, Award, Globe, Heart, Sparkles, Link as LinkIcon
} from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface Storyteller {
  id: string;
  full_name: string;
  preferred_name?: string;
}

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  file: File | null;
  url?: string;
  caption: string;
  preview?: string;
}

export default function NewStoryPage() {
  const router = useRouter();
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const [formData, setFormData] = useState({
    // Authorship
    storyteller_id: '',
    collected_by: '',

    // Content
    title: '',
    content: '',
    summary: '',

    // Story Type & Category
    story_type: 'community_story',
    category: 'culture',
    sub_category: '',

    // PICC Service Connection
    related_service: '',

    // Impact
    impact_type: [] as string[],
    outcome_achieved: '',
    people_affected: '',

    // Traditional Knowledge
    contains_traditional_knowledge: false,
    cultural_sensitivity_level: 'low',

    // Permissions
    access_level: 'public',
    elder_approval_required: false,

    // Temporal
    story_date: '',

    // Location
    location: '',
    location_type: '',

    // Tags
    tags: '',
    keywords: '',

    // Workflow
    status: 'draft',
    is_featured: false,

    // Innovation Link
    innovation_link: '',
  });

  useEffect(() => {
    fetchStorytellers();
  }, []);

  async function fetchStorytellers() {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, preferred_name')
      .eq('show_in_directory', true)
      .order('full_name');

    setStorytellers(data || []);
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const newMedia: MediaItem = {
      id: Math.random().toString(36).substring(7),
      type,
      file,
      caption: '',
      preview: type === 'photo' ? URL.createObjectURL(file) : undefined,
    };

    setMediaItems([...mediaItems, newMedia]);
  }

  function removeMedia(id: string) {
    setMediaItems(mediaItems.filter(item => item.id !== id));
  }

  async function uploadMediaToSupabase(storyId: string) {
    const supabase = createClient();

    for (const media of mediaItems) {
      if (!media.file) continue;

      // Upload file to storage
      const fileExt = media.file.name.split('.').pop();
      const fileName = `${storyId}/${media.id}.${fileExt}`;
      const bucket = media.type === 'photo' ? 'story-images' : 'story-videos';

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, media.file);

      if (uploadError) {
        console.error('Error uploading media:', uploadError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Create media record
      await supabase
        .from('story_media')
        .insert({
          story_id: storyId,
          media_type: media.type,
          file_path: publicUrl,
          supabase_bucket: bucket,
          file_name: media.file.name,
          file_size: media.file.size,
          caption: media.caption,
          alt_text: media.caption,
        });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();

    // Process arrays
    const tags = formData.tags ? formData.tags.split(',').map(s => s.trim()) : [];
    const keywords = formData.keywords ? formData.keywords.split(',').map(s => s.trim()) : [];

    const insertData = {
      storyteller_id: formData.storyteller_id,
      collected_by: formData.collected_by || null,
      title: formData.title,
      content: formData.content,
      summary: formData.summary || null,
      story_type: formData.story_type,
      category: formData.category,
      sub_category: formData.sub_category || null,
      related_service: formData.related_service || null,
      impact_type: formData.impact_type,
      outcome_achieved: formData.outcome_achieved || null,
      people_affected: formData.people_affected ? parseInt(formData.people_affected) : null,
      contains_traditional_knowledge: formData.contains_traditional_knowledge,
      cultural_sensitivity_level: formData.cultural_sensitivity_level,
      access_level: formData.access_level,
      elder_approval_required: formData.elder_approval_required,
      story_date: formData.story_date || null,
      collection_date: new Date().toISOString().split('T')[0],
      location: formData.location || null,
      location_type: formData.location_type || null,
      tags,
      keywords,
      status: formData.status,
      is_featured: formData.is_featured,
      metadata: {
        innovation_link: formData.innovation_link || null,
      },
    };

    const { data, error: insertError } = await supabase
      .from('stories')
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating story:', insertError);
      setError(insertError.message);
      setSaving(false);
      return;
    }

    // Upload media
    if (mediaItems.length > 0) {
      setUploadingMedia(true);
      await uploadMediaToSupabase(data.id);
      setUploadingMedia(false);
    }

    // Redirect based on status
    if (formData.status === 'published') {
      router.push(`/stories/${data.id}`);
    } else {
      router.push('/admin/stories');
    }
  }

  const breadcrumbs = [
    { label: 'Stories', href: '/stories' },
    { label: 'Create New Story', href: '/stories/new' },
  ];

  const impactOptions = [
    'individual',
    'family',
    'community',
    'service_improvement',
    'cultural_preservation',
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <BookOpen className="h-10 w-10 text-blue-600" />
          Create New Story
        </h1>
        <p className="text-xl text-gray-600">
          Document community knowledge, innovation, and impact
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error creating story</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Authorship */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Authorship
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storyteller *
              </label>
              <select
                required
                value={formData.storyteller_id}
                onChange={(e) => setFormData({ ...formData, storyteller_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select storyteller...</option>
                {storytellers.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.preferred_name || st.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Story Collected By
              </label>
              <select
                value={formData.collected_by}
                onChange={(e) => setFormData({ ...formData, collected_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select collector...</option>
                {storytellers.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.preferred_name || st.full_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">If someone else collected this story</p>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Story Content
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Story Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Give your story a compelling title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary (Optional)
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={2}
                placeholder="Brief summary for previews and cards..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Story *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                placeholder="Tell the full story here. Include details, context, and what makes this story meaningful..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.content.length} characters
              </p>
            </div>
          </div>
        </div>

        {/* Media Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Image className="h-6 w-6 text-blue-600" />
            Photos & Videos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <label className="flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
              <Image className="h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Upload Photos</span>
              <span className="text-xs text-gray-500">JPG, PNG, HEIC</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleMediaUpload(e, 'photo')}
                className="hidden"
              />
            </label>

            <label className="flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-colors">
              <Video className="h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Upload Videos</span>
              <span className="text-xs text-gray-500">MP4, MOV</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleMediaUpload(e, 'video')}
                className="hidden"
              />
            </label>
          </div>

          {/* Media Preview */}
          {mediaItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Uploaded Media ({mediaItems.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mediaItems.map(media => (
                  <div key={media.id} className="border border-gray-200 rounded-lg p-4">
                    {media.type === 'photo' && media.preview && (
                      <img
                        src={media.preview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    {media.type === 'video' && (
                      <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg mb-3">
                        <Video className="h-12 w-12 text-gray-400" />
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder="Add caption..."
                      value={media.caption}
                      onChange={(e) => {
                        const updated = mediaItems.map(m =>
                          m.id === media.id ? { ...m, caption: e.target.value } : m
                        );
                        setMediaItems(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                    />

                    <button
                      type="button"
                      onClick={() => removeMedia(media.id)}
                      className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Categorization */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Tag className="h-6 w-6 text-blue-600" />
            Categorization
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Story Type *
              </label>
              <select
                required
                value={formData.story_type}
                onChange={(e) => setFormData({ ...formData, story_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="community_story">Community Story</option>
                <option value="elder_wisdom">Elder Wisdom</option>
                <option value="service_success">Service Success</option>
                <option value="micro_moment">Micro Moment</option>
                <option value="achievement">Achievement</option>
                <option value="challenge_overcome">Challenge Overcome</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="culture">Culture & Language</option>
                <option value="health">Health & Wellbeing</option>
                <option value="youth">Youth Services</option>
                <option value="family">Family Services</option>
                <option value="education">Education</option>
                <option value="environment">Environment</option>
                <option value="economic_development">Economic Development</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Related PICC Service
              </label>
              <input
                type="text"
                value={formData.related_service}
                onChange={(e) => setFormData({ ...formData, related_service: e.target.value })}
                placeholder="e.g., Bwgcolman Healing Service"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Innovation Link
              </label>
              <select
                value={formData.innovation_link}
                onChange={(e) => setFormData({ ...formData, innovation_link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None</option>
                <option value="elders-trip">Elders Trip to Hull River</option>
                <option value="photo-studio">Photo Studio & Kiosk</option>
                <option value="local-server">Local Server Infrastructure</option>
                <option value="storm-recovery">Storm Recovery Programs</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Comma-separated: health, family, innovation"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="Comma-separated keywords"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Impact & Outcomes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="h-6 w-6 text-blue-600" />
            Impact & Outcomes
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact Type (select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {impactOptions.map(option => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.impact_type.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            impact_type: [...formData.impact_type, option]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            impact_type: formData.impact_type.filter(t => t !== option)
                          });
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {option.replace(/_/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outcome Achieved
                </label>
                <textarea
                  value={formData.outcome_achieved}
                  onChange={(e) => setFormData({ ...formData, outcome_achieved: e.target.value })}
                  rows={3}
                  placeholder="Describe the outcome or achievement..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  People Affected (estimate)
                </label>
                <input
                  type="number"
                  value={formData.people_affected}
                  onChange={(e) => setFormData({ ...formData, people_affected: e.target.value })}
                  placeholder="Number of people impacted"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location & Date */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Location & Date
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Community Hall, Beach"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Type
              </label>
              <input
                type="text"
                value={formData.location_type}
                onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                placeholder="e.g., health_service, beach"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Story Date
              </label>
              <input
                type="date"
                value={formData.story_date}
                onChange={(e) => setFormData({ ...formData, story_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Cultural Protocols */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-blue-600" />
            Cultural Protocols & Permissions
          </h2>

          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.contains_traditional_knowledge}
                onChange={(e) => setFormData({
                  ...formData,
                  contains_traditional_knowledge: e.target.checked
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded mt-1"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Contains Traditional Knowledge
                </span>
                <p className="text-xs text-gray-500">
                  This story includes cultural or traditional knowledge
                </p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cultural Sensitivity Level
              </label>
              <select
                value={formData.cultural_sensitivity_level}
                onChange={(e) => setFormData({ ...formData, cultural_sensitivity_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low - General community content</option>
                <option value="medium">Medium - Some cultural considerations</option>
                <option value="high">High - Significant cultural content</option>
                <option value="restricted">Restricted - Elder/advisor approval required</option>
              </select>
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.elder_approval_required}
                onChange={(e) => setFormData({
                  ...formData,
                  elder_approval_required: e.target.checked
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded mt-1"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Elder Approval Required
                </span>
                <p className="text-xs text-gray-500">
                  Story must be approved by an elder before publishing
                </p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Level *
              </label>
              <select
                required
                value={formData.access_level}
                onChange={(e) => setFormData({ ...formData, access_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="public">Public - Visible to everyone</option>
                <option value="community">Community - Authenticated users only</option>
                <option value="restricted">Restricted - Limited access</option>
              </select>
            </div>
          </div>
        </div>

        {/* Publication Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            Publication Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft - Save for later</option>
                <option value="submitted">Submitted - Ready for review</option>
                <option value="under_review">Under Review - Being reviewed</option>
                <option value="published">Published - Make public</option>
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Feature this story</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="h-5 w-5" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploadingMedia}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:bg-gray-400"
          >
            {(saving || uploadingMedia) ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {uploadingMedia ? 'Uploading media...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                {formData.status === 'published' ? 'Publish Story' : 'Save Story'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
