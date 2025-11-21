'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Plus, Upload, FileText, Search, Edit2 } from 'lucide-react';
import Link from 'next/link';

interface Storyteller {
  id: string;
  full_name: string;
  preferred_name?: string;
  profile_image_url?: string;
  bio?: string;
  storyteller_type: string;
  is_elder: boolean;
  location?: string;
  stories_contributed: number;
  interviews_completed: number;
  created_at: string;
}

export default function StorytellerManagementPage() {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadStorytellers();
  }, []);

  const loadStorytellers = async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, preferred_name, profile_image_url, bio, storyteller_type, is_elder, location, stories_contributed, interviews_completed, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStorytellers(data || []);
    } catch (error) {
      console.error('Error loading storytellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStorytellers = storytellers.filter(storyteller => {
    const matchesSearch = storyteller.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         storyteller.preferred_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || storyteller.storyteller_type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading storytellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Storyteller Management</h1>
          </div>
          <Link
            href="/picc/storytellers/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Storyteller
          </Link>
        </div>
        <p className="text-gray-600">
          Manage storyteller profiles, upload photos, and link interview transcripts
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search storytellers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="elder">Elders</option>
          <option value="community_member">Community Members</option>
          <option value="youth">Youth</option>
          <option value="service_provider">Service Providers</option>
          <option value="cultural_advisor">Cultural Advisors</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{storytellers.length}</div>
          <div className="text-sm text-gray-600">Total Storytellers</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {storytellers.filter(s => s.is_elder).length}
          </div>
          <div className="text-sm text-gray-600">Elders</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {storytellers.reduce((sum, s) => sum + s.stories_contributed, 0)}
          </div>
          <div className="text-sm text-gray-600">Stories Contributed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {storytellers.reduce((sum, s) => sum + (s.interviews_completed || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Interviews Recorded</div>
        </div>
      </div>

      {/* Storytellers Grid */}
      {filteredStorytellers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No storytellers found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first storyteller'}
          </p>
          <Link
            href="/picc/storytellers/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add First Storyteller
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStorytellers.map((storyteller) => (
            <div
              key={storyteller.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Profile Image */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                {storyteller.profile_image_url ? (
                  <img
                    src={storyteller.profile_image_url}
                    alt={storyteller.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <User className="w-24 h-24 text-white opacity-50" />
                  </div>
                )}
                {storyteller.is_elder && (
                  <span className="absolute top-2 right-2 px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                    Elder
                  </span>
                )}
              </div>

              {/* Profile Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {storyteller.preferred_name || storyteller.full_name}
                </h3>
                {storyteller.preferred_name && (
                  <p className="text-sm text-gray-600 mb-2">{storyteller.full_name}</p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {storyteller.storyteller_type.replace('_', ' ')}
                  </span>
                  {storyteller.location && (
                    <span className="text-xs text-gray-500">{storyteller.location}</span>
                  )}
                </div>

                {storyteller.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {storyteller.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-gray-900">{storyteller.stories_contributed}</div>
                    <div className="text-xs text-gray-600">Stories</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-gray-900">{storyteller.interviews_completed || 0}</div>
                    <div className="text-xs text-gray-600">Interviews</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href={`/picc/storytellers/${storyteller.id}/edit`}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Link>
                  <Link
                    href={`/picc/storytellers/${storyteller.id}/interviews`}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Interviews
                  </Link>
                  <Link
                    href={`/picc/storytellers/${storyteller.id}/upload`}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Photo
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
