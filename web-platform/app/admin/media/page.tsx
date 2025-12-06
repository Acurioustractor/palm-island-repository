'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Image as ImageIcon, Video, Play, Tag, MapPin, Calendar, User, Save, X, Check, Upload, Search, Filter, Eye, EyeOff, Sparkles } from 'lucide-react';
import type { MediaFile, PageContext } from '@/lib/media/types';
import SmartImageUpload from '@/components/media/SmartImageUpload';

export default function AdminMediaManager() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaFile[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPage, setFilterPage] = useState<PageContext | 'all'>('all');
  const [filterSection, setFilterSection] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState(false);

  // Editing state
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<MediaFile>>({});

  // Upload state
  const [showUpload, setShowUpload] = useState(false);

  const pageContexts: PageContext[] = [
    'home', 'about', 'impact', 'community', 'stories',
    'share-voice', 'annual-reports', 'search', 'chat'
  ];

  const pageSections = {
    home: ['hero', 'features', 'featured-stories'],
    about: ['hero', 'vision', 'timeline', 'leadership', 'services', 'testimonials', 'ceo-video', 'services-video'],
    impact: ['hero', 'impact-stats', 'innovation', 'reporting'],
    community: ['hero', 'programs'],
    'annual-reports': ['timeline', 'year-detail'],
    stories: ['hero', 'story-grid'],
    'share-voice': ['hero', 'cultural-info'],
  };

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterPage, filterSection, filterType, filterFeatured, media]);

  const loadMedia = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading media:', error);
    } else {
      setMedia(data || []);
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...media];

    // Search by title/filename
    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by page
    if (filterPage !== 'all') {
      filtered = filtered.filter(m => m.page_context === filterPage);
    }

    // Filter by section
    if (filterSection !== 'all') {
      filtered = filtered.filter(m => m.page_section === filterSection);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.file_type === filterType);
    }

    // Filter by featured
    if (filterFeatured) {
      filtered = filtered.filter(m => m.is_featured);
    }

    setFilteredMedia(filtered);
  };

  const handleSelectMedia = (media: MediaFile) => {
    setSelectedMedia(media);
    setEditData({
      page_context: media.page_context,
      page_section: media.page_section,
      title: media.title,
      description: media.description,
      alt_text: media.alt_text,
      tags: media.tags,
      is_featured: media.is_featured,
      display_order: media.display_order,
      usage_context: media.usage_context,
    });
    setEditMode(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedMedia) return;

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('media_files')
      .update(editData)
      .eq('id', selectedMedia.id);

    if (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes');
    } else {
      alert('Changes saved successfully!');
      setEditMode(false);
      setSelectedMedia(null);
      loadMedia();
    }

    setSaving(false);
  };

  const handleToggleFeatured = async (mediaId: string, currentFeatured: boolean) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('media_files')
      .update({ is_featured: !currentFeatured })
      .eq('id', mediaId);

    if (error) {
      console.error('Error toggling featured:', error);
    } else {
      loadMedia();
    }
  };

  const handleTogglePublic = async (mediaId: string, currentPublic: boolean) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('media_files')
      .update({ is_public: !currentPublic })
      .eq('id', mediaId);

    if (error) {
      console.error('Error toggling public:', error);
    } else {
      loadMedia();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading media library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Manager</h1>
              <p className="text-gray-600 mt-1">
                {filteredMedia.length} of {media.length} media files
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Smart Upload
              </button>
              <button
                onClick={loadMedia}
                className="px-4 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, filename, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Page Filter */}
            <select
              value={filterPage}
              onChange={(e) => {
                setFilterPage(e.target.value as PageContext | 'all');
                setFilterSection('all');
              }}
              className="px-4 py-2 border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none transition-colors"
            >
              <option value="all">All Pages</option>
              {pageContexts.map(page => (
                <option key={page} value={page}>{page.charAt(0).toUpperCase() + page.slice(1)}</option>
              ))}
            </select>

            {/* Section Filter */}
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none transition-colors"
              disabled={filterPage === 'all'}
            >
              <option value="all">All Sections</option>
              {filterPage !== 'all' && pageSections[filterPage as keyof typeof pageSections]?.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none transition-colors"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.checked)}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <span className="text-sm font-medium text-gray-700">Featured Only</span>
            </label>

            {(searchQuery || filterPage !== 'all' || filterSection !== 'all' || filterType !== 'all' || filterFeatured) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterPage('all');
                  setFilterSection('all');
                  setFilterType('all');
                  setFilterFeatured(false);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border overflow-hidden hover:border-gray-900 transition-all cursor-pointer ${
                item.is_featured ? 'ring-2 ring-yellow-400' : 'border-gray-200'
              }`}
              onClick={() => handleSelectMedia(item)}
            >
              {/* Media Preview */}
              <div className="aspect-square bg-gray-100 relative">
                {item.file_type === 'image' && (
                  <img
                    src={item.public_url}
                    alt={item.alt_text || item.title || 'Media'}
                    className="w-full h-full object-cover"
                  />
                )}
                {item.file_type === 'video' && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                )}
                {item.file_type === 'audio' && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <Video className="w-16 h-16 text-white" />
                  </div>
                )}

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFeatured(item.id, item.is_featured);
                    }}
                    className={`p-2 rounded-full ${
                      item.is_featured
                        ? 'bg-yellow-400 text-gray-900'
                        : 'bg-white text-gray-700 border border-gray-200'
                    } hover:scale-110 transition-transform`}
                    title={item.is_featured ? 'Remove from featured' : 'Set as featured'}
                  >
                    {item.is_featured ? <Check className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePublic(item.id, item.is_public);
                    }}
                    className={`p-2 rounded-full ${
                      item.is_public
                        ? 'bg-green-400 text-white'
                        : 'bg-red-400 text-white'
                    } hover:scale-110 transition-transform`}
                    title={item.is_public ? 'Public' : 'Private'}
                  >
                    {item.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Media Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                  {item.title || item.filename}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="capitalize">{item.file_type}</span>
                  {item.page_context && (
                    <>
                      <span>•</span>
                      <span>{item.page_context}</span>
                    </>
                  )}
                </div>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMedia.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No media found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Smart Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  Smart Upload
                </h2>
                <p className="text-gray-600 mt-1">AI will auto-generate alt text and detect cultural content</p>
              </div>
              <button
                onClick={() => setShowUpload(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <SmartImageUpload
                onUpload={async (file, analysis) => {
                  // Here you would upload to Supabase storage and create media record
                  console.log('Upload:', file.name, analysis);
                  alert(`Image analyzed!\n\nAlt Text: ${analysis.altText}\n\nTags: ${analysis.tags.join(', ')}\n\nCultural Content: ${analysis.culturalElements.found ? 'Yes' : 'No'}`);
                  setShowUpload(false);
                  loadMedia();
                }}
                onError={(error) => alert(error)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editMode && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Edit Media</h2>
              <button
                onClick={() => setEditMode(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Preview */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Preview</h3>
                  <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                    {selectedMedia.file_type === 'image' && (
                      <img
                        src={selectedMedia.public_url}
                        alt={selectedMedia.alt_text || selectedMedia.title || 'Media'}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {selectedMedia.file_type === 'video' && (
                      <video src={selectedMedia.public_url} controls className="w-full h-full" />
                    )}
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p><strong>Filename:</strong> {selectedMedia.filename}</p>
                    <p><strong>Type:</strong> {selectedMedia.file_type}</p>
                    {selectedMedia.file_size && (
                      <p><strong>Size:</strong> {(selectedMedia.file_size / 1024 / 1024).toFixed(2)} MB</p>
                    )}
                  </div>
                </div>

                {/* Edit Form */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Media Details</h3>

                  {/* Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editData.title || ''}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-2xl focus:border-gray-400 focus:outline-none"
                    />
                  </div>

                  {/* Alt Text */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alt Text (Accessibility)
                    </label>
                    <input
                      type="text"
                      value={editData.alt_text || ''}
                      onChange={(e) => setEditData({ ...editData, alt_text: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none"
                    />
                  </div>

                  {/* Page Context */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Context
                    </label>
                    <select
                      value={editData.page_context || ''}
                      onChange={(e) => setEditData({ ...editData, page_context: e.target.value as PageContext, page_section: undefined })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none"
                    >
                      <option value="">None</option>
                      {pageContexts.map(page => (
                        <option key={page} value={page}>{page}</option>
                      ))}
                    </select>
                  </div>

                  {/* Page Section */}
                  {editData.page_context && pageSections[editData.page_context as keyof typeof pageSections] && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Section
                      </label>
                      <select
                        value={editData.page_section || ''}
                        onChange={(e) => setEditData({ ...editData, page_section: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none"
                      >
                        <option value="">None</option>
                        {pageSections[editData.page_context as keyof typeof pageSections]?.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Display Order */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order (lower = first)
                    </label>
                    <input
                      type="number"
                      value={editData.display_order || 0}
                      onChange={(e) => setEditData({ ...editData, display_order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none"
                    />
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editData.tags?.join(', ') || ''}
                      onChange={(e) => setEditData({ ...editData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                      placeholder="community, health, youth"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none"
                    />
                  </div>

                  {/* Featured Checkbox */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.is_featured || false}
                        onChange={(e) => setEditData({ ...editData, is_featured: e.target.checked })}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured/Hero Media</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-100">
              <button
                onClick={() => setEditMode(false)}
                className="px-6 py-2 border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-gray-900 rounded-full font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-6 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
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
      )}
    </div>
  );
}
