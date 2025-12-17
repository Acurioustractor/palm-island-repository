'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Image as ImageIcon,
  X,
  Plus,
  Upload,
  Trash2,
  Globe,
  Lock,
  Users,
  Check,
  AlertCircle,
} from 'lucide-react';
import { TagPicker } from '@/components/admin';
import StoryRichTextEditor from '@/components/admin/StoryRichTextEditor';
import MediaPickerDialog from '@/components/admin/MediaPickerDialog';
import {
  STORY_PLACEMENT_CATEGORIES,
  STORY_STATUSES,
  STORY_ACCESS_LEVELS,
  getTagLabel,
  getTagColorClass,
} from '@/lib/taxonomy/placement-tags';

interface Story {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  category: string;
  story_type: string;
  status: string;
  access_level: string;
  is_featured?: boolean;
  storyteller_id?: string;
  featured_people?: string[];
  metadata?: any;
  tags: string[];
  location?: string;
  cultural_sensitivity_level?: string;
  elder_approval_required?: boolean;
  elder_approval_given?: boolean;
  created_at: string;
  updated_at?: string;
}

interface Storyteller {
  id: string;
  full_name: string;
  preferred_name?: string;
  profile_image_url?: string;
  is_elder?: boolean;
  is_cultural_advisor?: boolean;
}

const CATEGORIES = [
  { id: 'community', label: 'Community' },
  { id: 'health', label: 'Health & Wellbeing' },
  { id: 'education', label: 'Education' },
  { id: 'culture', label: 'Culture & Heritage' },
  { id: 'environment', label: 'Environment' },
  { id: 'youth', label: 'Youth' },
  { id: 'family', label: 'Family Services' },
];

const STORY_TYPES = [
  { id: 'community_story', label: 'Community Story' },
  { id: 'personal_narrative', label: 'Personal Narrative' },
  { id: 'historical', label: 'Historical' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'achievement', label: 'Achievement' },
  { id: 'program_highlight', label: 'Program Highlight' },
];

export default function StoryEditorPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;
  const isNew = storyId === 'new';

  // Form state
  const [story, setStory] = useState<Partial<Story>>({
    title: '',
    content: '',
    excerpt: '',
    category: 'community',
    story_type: 'community_story',
    status: 'draft',
    access_level: 'public',
    tags: [],
    location: 'Palm Island',
    is_featured: false,
    elder_approval_required: false,
    featured_people: [],
  });

  // UI state
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [showFeaturedImagePicker, setShowFeaturedImagePicker] = useState(false);

  // Storytellers for picker
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [storytellerSearch, setStorytellerSearch] = useState('');
  const [showStorytellerPicker, setShowStorytellerPicker] = useState(false);

  // Featured people picker (additional profiles shown on public story page)
  const [featuredPeopleSearch, setFeaturedPeopleSearch] = useState('');
  const [showFeaturedPeoplePicker, setShowFeaturedPeoplePicker] = useState(false);

  // Load story data
  useEffect(() => {
    if (isNew) return;

    const loadStory = async () => {
      try {
        const response = await fetch(`/api/stories?id=${storyId}`);
        if (!response.ok) throw new Error('Failed to load story');

        const { data } = await response.json();
        if (data && data.length > 0) {
          const row = data[0] || {};
          const excerpt = row.excerpt ?? row.summary ?? '';
          const rawFeaturedPeople =
            Array.isArray(row.featured_people)
              ? row.featured_people
              : Array.isArray(row?.metadata?.featured_people)
                ? row.metadata.featured_people
                : [];
          const featuredPeople = Array.from(
            new Set((rawFeaturedPeople || []).map((x: any) => String(x).trim()).filter(Boolean))
          );
          const metadata = { ...(row.metadata || {}), featured_people: featuredPeople };

          setStory({ ...row, excerpt, featured_people: featuredPeople, metadata });
        } else {
          setError('Story not found');
        }
      } catch (err) {
        console.error('Error loading story:', err);
        setError('Failed to load story');
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [storyId, isNew]);

  // Load storytellers
  useEffect(() => {
    const loadStorytellers = async () => {
      try {
        const response = await fetch('/api/storytellers?limit=1000');
        if (response.ok) {
          const { data } = await response.json();
          setStorytellers(data || []);
        }
      } catch (err) {
        console.error('Error loading storytellers:', err);
      }
    };

    loadStorytellers();
  }, []);

  // Ensure storyteller + featured people profiles are present (even if older than the initial list).
  useEffect(() => {
    if (isNew) return;

    const ids = [
      story.storyteller_id,
      ...(Array.isArray(story.featured_people) ? story.featured_people : []),
    ]
      .filter(Boolean)
      .map((s) => String(s).trim())
      .filter(Boolean);

    if (ids.length === 0) return;

    const existing = new Set(storytellers.map((s) => s.id));
    const missing = ids.filter((id) => !existing.has(id));
    if (missing.length === 0) return;

    const loadMissing = async () => {
      try {
        const res = await fetch(`/api/storytellers?ids=${encodeURIComponent(missing.join(','))}&limit=${missing.length}`);
        if (!res.ok) return;
        const json = await res.json();
        const extra = Array.isArray(json?.data) ? json.data : [];
        if (extra.length === 0) return;
        setStorytellers((prev) => {
          const byId = new Map(prev.map((p) => [p.id, p]));
          for (const p of extra) byId.set(p.id, p);
          return Array.from(byId.values());
        });
      } catch {
        // Non-fatal.
      }
    };

    loadMissing();
  }, [isNew, story.storyteller_id, story.featured_people, storytellers]);

  // Update field
  const updateField = <K extends keyof Story>(field: K, value: Story[K]) => {
    setStory((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Save story
  const handleSave = async (newStatus?: string) => {
    if (!story.title?.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...story,
        status: newStatus || story.status,
      };

      const method = isNew ? 'POST' : 'PATCH';
      const body = isNew ? payload : { id: storyId, ...payload };

      const response = await fetch('/api/stories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save story');
      }

      const { data } = await response.json();
      setHasChanges(false);
      setLastSavedAt(new Date().toISOString());

      if (isNew && data?.id) {
        router.push(`/picc/stories/${data.id}/edit`);
      } else {
        setStory((prev) => ({ ...prev, ...data }));
      }

      // Reload from the server to verify the saved version matches what the editor shows.
      if (!isNew) {
        try {
          const verifyRes = await fetch(`/api/stories?id=${storyId}`);
          if (verifyRes.ok) {
            const verifyJson = await verifyRes.json();
            const row = verifyJson?.data?.[0];
            if (row) {
              const excerpt = row.excerpt ?? row.summary ?? '';
              const rawFeaturedPeople =
                Array.isArray(row.featured_people)
                  ? row.featured_people
                  : Array.isArray(row?.metadata?.featured_people)
                    ? row.metadata.featured_people
                    : [];
              const featuredPeople = Array.from(
                new Set((rawFeaturedPeople || []).map((x: any) => String(x).trim()).filter(Boolean))
              );
              const metadata = { ...(row.metadata || {}), featured_people: featuredPeople };
              setStory({ ...row, excerpt, featured_people: featuredPeople, metadata });
            }
          }
        } catch {
          // Non-fatal: save already succeeded.
        }
      }
    } catch (err: any) {
      console.error('Error saving story:', err);
      setError(err.message || 'Failed to save story');
    } finally {
      setSaving(false);
    }
  };

  // Delete story
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this story? This cannot be undone.')) return;

    setSaving(true);
    try {
      const response = await fetch('/api/stories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: storyId }),
      });

      if (!response.ok) throw new Error('Failed to delete story');

      router.push('/picc/stories');
    } catch (err) {
      console.error('Error deleting story:', err);
      setError('Failed to delete story');
      setSaving(false);
    }
  };

  // Get selected storyteller
  const sharedByAllElders = String((story as any)?.metadata?.shared_by || '').toLowerCase() === 'all_elders';
  const selectedStoryteller = storytellers.find((s) => s.id === story.storyteller_id);
  const featuredPeopleIds = Array.isArray(story.featured_people) ? story.featured_people : [];
  const featuredPeople = storytellers.filter((s) => featuredPeopleIds.includes(s.id));

  // Filter storytellers for picker
  const filteredStorytellers = storytellers.filter((s) => {
    if (!storytellerSearch.trim()) return true;
    const name = (s.preferred_name || s.full_name || '').toLowerCase();
    return name.includes(storytellerSearch.toLowerCase());
  });

  const filteredFeaturedPeople = storytellers.filter((s) => {
    if (featuredPeopleIds.includes(s.id)) return false;
    if (!featuredPeopleSearch.trim()) return true;
    const name = (s.preferred_name || s.full_name || '').toLowerCase();
    return name.includes(featuredPeopleSearch.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/picc/stories"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {isNew ? 'New Story' : 'Edit Story'}
                </h1>
                {hasChanges && (
                  <span className="text-xs text-amber-600">Unsaved changes</span>
                )}
                {!hasChanges && lastSavedAt && (
                  <span className="text-xs text-emerald-700">
                    Saved {new Date(lastSavedAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isNew && (
                <Link
                  href={`/stories/${storyId}`}
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Link>
              )}

              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>

              {story.status !== 'published' && (
                <button
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 rounded"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={story.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter story title..."
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt / Summary
              </label>
              <textarea
                value={story.excerpt || ''}
                onChange={(e) => updateField('excerpt', e.target.value)}
                placeholder="Brief summary shown on story cards..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <StoryRichTextEditor
                value={story.content || ''}
                onChange={(next) => updateField('content', next)}
                placeholder="Write your story content here..."
              />
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              <MediaPickerDialog
                open={showFeaturedImagePicker}
                kind="image"
                onClose={() => setShowFeaturedImagePicker(false)}
                onPick={(m) => {
                  setShowFeaturedImagePicker(false);
                  const url = String(m.public_url || '').trim();
                  if (url) updateField('featured_image_url', url);
                }}
              />
              {story.featured_image_url ? (
                <div className="relative">
                  <img
                    src={story.featured_image_url}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFeaturedImagePicker(true)}
                    className="absolute top-2 left-2 px-3 py-2 bg-white/90 text-gray-900 rounded-lg border border-gray-200 hover:bg-white"
                  >
                    Choose from library
                  </button>
                  <button
                    onClick={() => updateField('featured_image_url', undefined)}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No featured image</p>
                  <button
                    type="button"
                    onClick={() => setShowFeaturedImagePicker(true)}
                    className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 mb-3"
                  >
                    Choose from library
                  </button>
                  <input
                    type="text"
                    placeholder="Paste image URL..."
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        updateField('featured_image_url', e.target.value.trim());
                      }
                    }}
                    className="w-full max-w-md mx-auto px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
              <div className="space-y-2">
                {STORY_STATUSES.map((status) => (
                  <label
                    key={status.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      story.status === status.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status.id}
                      checked={story.status === status.id}
                      onChange={(e) => updateField('status', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-medium">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Access Level */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Access Level</label>
              <div className="space-y-2">
                {STORY_ACCESS_LEVELS.map((level) => (
                  <label
                    key={level.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      story.access_level === level.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="access_level"
                      value={level.id}
                      checked={story.access_level === level.id}
                      onChange={(e) => updateField('access_level', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        {level.id === 'public' && <Globe className="w-4 h-4 text-green-600" />}
                        {level.id === 'community' && <Users className="w-4 h-4 text-blue-600" />}
                        {level.id === 'restricted' && <Lock className="w-4 h-4 text-red-600" />}
                        <span className="font-medium">{level.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{level.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Category & Type */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={story.category || 'community'}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Type</label>
                <select
                  value={story.story_type || 'community_story'}
                  onChange={(e) => updateField('story_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {STORY_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Storyteller */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Storyteller</label>

              <label className="flex items-start gap-3 mb-4 p-3 rounded-lg border border-gray-200 bg-gray-50">
                <input
                  type="checkbox"
                  checked={sharedByAllElders}
                  onChange={(e) => {
                    const next = { ...(story.metadata || {}) } as any;
                    if (e.target.checked) next.shared_by = 'all_elders';
                    else delete next.shared_by;
                    updateField('metadata', next);
                  }}
                  className="mt-0.5 w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Show “Shared by: All Elders” on the public story</div>
                  <div className="text-xs text-gray-600">
                    Keep the storyteller set (for admin tracking), but display the story as shared by All Elders on `/stories/...`.
                  </div>
                </div>
              </label>

              {selectedStoryteller ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {selectedStoryteller.profile_image_url ? (
                    <img
                      src={selectedStoryteller.profile_image_url}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">
                      {selectedStoryteller.preferred_name || selectedStoryteller.full_name}
                    </p>
                  </div>
                  <button
                    onClick={() => updateField('storyteller_id', undefined)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowStorytellerPicker(!showStorytellerPicker)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400"
                  >
                    <span className="text-gray-500">Select storyteller...</span>
                    <Plus className="w-4 h-4 text-gray-400" />
                  </button>

                  {showStorytellerPicker && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-hidden">
                      <div className="p-2 border-b border-gray-200">
                        <input
                          type="text"
                          value={storytellerSearch}
                          onChange={(e) => setStorytellerSearch(e.target.value)}
                          placeholder="Search..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredStorytellers.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              updateField('storyteller_id', s.id);
                              setShowStorytellerPicker(false);
                              setStorytellerSearch('');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
                          >
                            {s.profile_image_url ? (
                              <img
                                src={s.profile_image_url}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <span className="text-sm">
                              {s.preferred_name || s.full_name}
                            </span>
                          </button>
                        ))}
                        {filteredStorytellers.length === 0 && (
                          <p className="px-4 py-3 text-sm text-gray-500 text-center">
                            No storytellers found
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Featured People */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  {sharedByAllElders ? 'Elders involved' : 'Featured people'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowFeaturedPeoplePicker(!showFeaturedPeoplePicker)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showFeaturedPeoplePicker ? 'Done' : 'Add'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {featuredPeople.length === 0 ? (
                  <p className="text-sm text-gray-500">No featured people linked yet.</p>
                ) : (
                  featuredPeople.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {p.preferred_name || p.full_name}
                      <button
                        type="button"
                        onClick={() =>
                          (() => {
                            const next = featuredPeopleIds.filter((id) => id !== p.id)
                            updateField('featured_people', next)
                            updateField('metadata', { ...(story.metadata || {}), featured_people: next })
                          })()
                        }
                        className="p-0.5 rounded-full hover:bg-black/10"
                        aria-label={`Remove ${p.preferred_name || p.full_name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {showFeaturedPeoplePicker && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <input
                    type="text"
                    value={featuredPeopleSearch}
                    onChange={(e) => setFeaturedPeopleSearch(e.target.value)}
                    placeholder="Search people..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
                    autoFocus
                  />
                  <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredFeaturedPeople.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const next = [...featuredPeopleIds, p.id]
                          updateField('featured_people', next);
                          updateField('metadata', { ...(story.metadata || {}), featured_people: next })
                          setFeaturedPeopleSearch('');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
                      >
                        {p.profile_image_url ? (
                          <img
                            src={p.profile_image_url}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <span className="text-sm">{p.preferred_name || p.full_name}</span>
                      </button>
                    ))}
                    {filteredFeaturedPeople.length === 0 && (
                      <p className="px-4 py-3 text-sm text-gray-500 text-center">No matches</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Featured people appear at the bottom of the public story page and link to their bios.
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Tags</label>
                <button
                  onClick={() => setShowTagPicker(!showTagPicker)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showTagPicker ? 'Done' : 'Edit'}
                </button>
              </div>

              {/* Selected tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {(story.tags || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No tags selected</p>
                ) : (
                  (story.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getTagColorClass(tag)} ${getTagColorClass(tag, 'text')}`}
                    >
                      {getTagLabel(tag)}
                      <button
                        onClick={() =>
                          updateField(
                            'tags',
                            (story.tags || []).filter((t) => t !== tag)
                          )
                        }
                        className="hover:bg-black/10 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Tag picker */}
              {showTagPicker && (
                <div className="border-t border-gray-200 pt-3">
                  <TagPicker
                    categories={STORY_PLACEMENT_CATEGORIES}
                    selectedTags={story.tags || []}
                    onChange={(tags) => updateField('tags', tags)}
                    maxHeight="250px"
                  />
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={story.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="Palm Island"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={story.is_featured || false}
                  onChange={(e) => updateField('is_featured', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="is_featured" className="text-sm text-gray-700">
                  Feature this story
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="elder_approval"
                  checked={story.elder_approval_required || false}
                  onChange={(e) => updateField('elder_approval_required', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="elder_approval" className="text-sm text-gray-700">
                  Requires Elder approval
                </label>
              </div>

              {story.elder_approval_required && (
                <div className="flex items-center gap-3 pl-7">
                  <input
                    type="checkbox"
                    id="elder_approved"
                    checked={story.elder_approval_given || false}
                    onChange={(e) => updateField('elder_approval_given', e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <label htmlFor="elder_approved" className="text-sm text-gray-700">
                    Elder approval given
                  </label>
                </div>
              )}
            </div>

            {/* Delete */}
            {!isNew && (
              <div className="bg-white rounded-xl border border-red-200 p-6">
                <h3 className="text-sm font-medium text-red-700 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Permanently delete this story. This action cannot be undone.
                </p>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Story
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside handlers */}
      {showStorytellerPicker && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowStorytellerPicker(false);
            setStorytellerSearch('');
          }}
        />
      )}

      {showFeaturedPeoplePicker && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowFeaturedPeoplePicker(false);
            setFeaturedPeopleSearch('');
          }}
        />
      )}
    </div>
  );
}
