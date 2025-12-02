'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  FolderOpen,
  Search,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  X,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface PhotoCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_id: string | null;
  item_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function MediaCollectionsPage() {
  const [collections, setCollections] = useState<PhotoCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<PhotoCollection | null>(null);
  const [tableExists, setTableExists] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_public: true,
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${supabaseUrl}/rest/v1/photo_collections?select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          setTableExists(false);
        } else {
          console.error('Error loading collections:', response.statusText);
        }
        return;
      }

      const data = await response.json();
      setCollections(data || []);
      setTableExists(true);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Request timeout loading collections');
      } else {
        console.error('Error loading collections:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingCollection ? formData.slug : generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const collectionData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      is_public: formData.is_public,
    };

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      if (editingCollection) {
        // Update existing collection
        const response = await fetch(
          `${supabaseUrl}/rest/v1/photo_collections?id=eq.${editingCollection.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify(collectionData),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to update collection: ${response.statusText}`);
        }
      } else {
        // Create new collection
        const response = await fetch(
          `${supabaseUrl}/rest/v1/photo_collections`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify(collectionData),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to create collection: ${response.statusText}`);
        }
      }

      setFormData({
        name: '',
        slug: '',
        description: '',
        is_public: true,
      });
      setShowAddForm(false);
      setEditingCollection(null);
      loadCollections();
    } catch (error: any) {
      console.error('Error saving collection:', error);
      alert(error.name === 'AbortError' ? 'Request timeout. Please try again.' : 'Failed to save collection. Please try again.');
    }
  };

  const handleEdit = (collection: PhotoCollection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || '',
      is_public: collection.is_public,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${supabaseUrl}/rest/v1/photo_collections?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to delete collection');
      }

      loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection.');
    }
  };

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collection.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesSearch;
  });

  // Table doesn't exist
  if (!tableExists && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/picc/media" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Media Library
          </Link>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Photo Collections Table Not Found</h1>
            <p className="text-gray-600 mb-6">
              The photo_collections table needs to be created in your Supabase database.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <h3 className="font-medium text-gray-900 mb-2">To set up:</h3>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                <li>Run: <code className="bg-gray-200 px-1 rounded">npx supabase db push</code></li>
                <li>Migration file: <code className="bg-gray-200 px-1 rounded">supabase/migrations/20250129134500_photo_collections_and_smart_folders.sql</code></li>
                <li>See: <code className="bg-gray-200 px-1 rounded">SUPABASE-MIGRATION-PROCESS.md</code> for details</li>
              </ol>
            </div>

            <Link
              href="https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Supabase Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/picc/media" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Media Library
          </Link>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Photo Collections</h1>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingCollection(null);
                setFormData({
                  name: '',
                  slug: '',
                  description: '',
                  is_public: true,
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Collection
            </button>
          </div>
          <p className="text-gray-600">
            Organize photos into manual collections for easy browsing and management
          </p>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingCollection ? 'Edit Collection' : 'Create New Collection'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingCollection(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Storm Recovery 2024"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="storm-recovery-2024"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated from name. Used in URLs.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this collection..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                      className="w-4 h-4 text-[#1e3a5f] rounded focus:ring-[#1e3a5f]"
                    />
                    <span className="text-sm text-gray-700">Public collection (visible to community)</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingCollection(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
                  >
                    {editingCollection ? 'Update Collection' : 'Create Collection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Collections</div>
            <div className="text-2xl font-bold text-gray-900">{collections.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Public Collections</div>
            <div className="text-2xl font-bold text-gray-900">
              {collections.filter(c => c.is_public).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Items</div>
            <div className="text-2xl font-bold text-gray-900">
              {collections.reduce((sum, c) => sum + (c.item_count || 0), 0)}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading collections...</p>
          </div>
        )}

        {/* Collections Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection) => (
              <div key={collection.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                {/* Cover Image */}
                <div className="aspect-[16/9] bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
                  {collection.cover_image_id ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-gray-300" />
                      <span className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                        Cover Image Available
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="w-16 h-16 text-green-400/50" />
                    </div>
                  )}

                  {/* Public Badge */}
                  {collection.is_public && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Public
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{collection.name}</h3>
                  {collection.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{collection.description}</p>
                  )}

                  {/* Item Count */}
                  <div className="flex gap-4 mb-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      {collection.item_count || 0} items
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Link
                      href={`/picc/media/collections/${collection.slug}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d4a6f] transition-colors"
                    >
                      View Collection
                    </Link>
                    <button
                      onClick={() => handleEdit(collection)}
                      className="p-2 text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(collection.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCollections.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? 'Try adjusting your search'
                : 'Create your first collection to organize photos'}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Collection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
