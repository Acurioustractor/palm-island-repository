'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users, Plus, Search, Filter, Edit2, Eye, Award,
  Sparkles, UserPlus, BookOpen, Mail, Phone, MapPin
} from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface Storyteller {
  id: string;
  full_name: string;
  preferred_name?: string;
  community_role?: string;
  storyteller_type: string;
  location?: string;
  email?: string;
  phone?: string;
  is_elder: boolean;
  is_cultural_advisor: boolean;
  is_service_provider: boolean;
  stories_contributed: number;
  last_story_date?: string;
  profile_visibility: string;
  created_at: string;
}

export default function StorytellerManagementPage() {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [filteredStorytellers, setFilteredStorytellers] = useState<Storyteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    fetchStorytellers();
  }, []);

  useEffect(() => {
    filterStorytellers();
  }, [searchTerm, filterType, storytellers]);

  async function fetchStorytellers() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching storytellers:', error);
    } else {
      setStorytellers(data || []);
    }

    setLoading(false);
  }

  function filterStorytellers() {
    let filtered = storytellers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.preferred_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.community_role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      if (filterType === 'elder') {
        filtered = filtered.filter(s => s.is_elder);
      } else if (filterType === 'cultural_advisor') {
        filtered = filtered.filter(s => s.is_cultural_advisor);
      } else if (filterType === 'service_provider') {
        filtered = filtered.filter(s => s.is_service_provider);
      } else {
        filtered = filtered.filter(s => s.storyteller_type === filterType);
      }
    }

    setFilteredStorytellers(filtered);
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Storyteller Management', href: '/admin/storytellers' },
  ];

  const stats = {
    total: storytellers.length,
    elders: storytellers.filter(s => s.is_elder).length,
    culturalAdvisors: storytellers.filter(s => s.is_cultural_advisor).length,
    serviceProviders: storytellers.filter(s => s.is_service_provider).length,
    activeThisMonth: storytellers.filter(s => {
      if (!s.last_story_date) return false;
      const date = new Date(s.last_story_date);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return date > monthAgo;
    }).length,
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading storytellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-10 w-10 text-blue-600" />
              Storyteller Management
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              Manage community storytellers and their profiles
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowQuickAdd(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <UserPlus className="h-5 w-5" />
              Quick Add
            </button>
            <Link
              href="/admin/storytellers/new"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Complete Profile
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-blue-100 text-sm">Total Storytellers</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white">
            <div className="text-3xl font-bold">{stats.elders}</div>
            <div className="text-amber-100 text-sm">Elders</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="text-3xl font-bold">{stats.culturalAdvisors}</div>
            <div className="text-purple-100 text-sm">Cultural Advisors</div>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-4 text-white">
            <div className="text-3xl font-bold">{stats.serviceProviders}</div>
            <div className="text-teal-100 text-sm">Service Providers</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="text-3xl font-bold">{stats.activeThisMonth}</div>
            <div className="text-green-100 text-sm">Active This Month</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, role, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Storytellers</option>
              <option value="elder">Elders Only</option>
              <option value="cultural_advisor">Cultural Advisors</option>
              <option value="service_provider">Service Providers</option>
              <option value="community_member">Community Members</option>
              <option value="youth">Youth</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredStorytellers.length} of {storytellers.length} storytellers
        </div>
      </div>

      {/* Storytellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStorytellers.map((storyteller) => (
          <div
            key={storyteller.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {storyteller.preferred_name || storyteller.full_name}
                </h3>
                {storyteller.preferred_name && (
                  <p className="text-sm text-gray-500">{storyteller.full_name}</p>
                )}
                {storyteller.community_role && (
                  <p className="text-sm text-gray-600 mt-1">{storyteller.community_role}</p>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-col gap-1">
                {storyteller.is_elder && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    <Award className="h-3 w-3" />
                    Elder
                  </span>
                )}
                {storyteller.is_cultural_advisor && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    Advisor
                  </span>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              {storyteller.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{storyteller.email}</span>
                </div>
              )}
              {storyteller.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {storyteller.phone}
                </div>
              )}
              {storyteller.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {storyteller.location}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  {storyteller.stories_contributed}
                </span>
                <span className="text-xs text-gray-500">stories</span>
              </div>
              <div className="text-xs text-gray-500">
                {storyteller.profile_visibility}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                href={`/wiki/people/${storyteller.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="h-4 w-4" />
                View
              </Link>
              <Link
                href={`/admin/storytellers/edit/${storyteller.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStorytellers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2">No storytellers found</p>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first storyteller'}
          </p>
        </div>
      )}

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal
          onClose={() => setShowQuickAdd(false)}
          onSuccess={() => {
            setShowQuickAdd(false);
            fetchStorytellers();
          }}
        />
      )}
    </div>
  );
}

// Quick Add Modal Component
function QuickAddModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    full_name: '',
    preferred_name: '',
    email: '',
    phone: '',
    community_role: '',
    storyteller_type: 'community_member',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .insert([{
        ...formData,
        location: 'Palm Island',
        profile_visibility: 'community',
      }]);

    if (error) {
      console.error('Error creating storyteller:', error);
      alert('Failed to create storyteller profile');
    } else {
      alert('Storyteller added successfully!');
      onSuccess();
    }

    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Quick Add Storyteller</h2>
          <p className="text-gray-600 mt-1">Add essential information quickly</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Community Role
              </label>
              <input
                type="text"
                value={formData.community_role}
                onChange={(e) => setFormData({ ...formData, community_role: e.target.value })}
                placeholder="e.g., Community Health Worker, Elder, Youth Leader"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storyteller Type *
              </label>
              <select
                required
                value={formData.storyteller_type}
                onChange={(e) => setFormData({ ...formData, storyteller_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="community_member">Community Member</option>
                <option value="elder">Elder</option>
                <option value="youth">Youth</option>
                <option value="service_provider">Service Provider</option>
                <option value="cultural_advisor">Cultural Advisor</option>
                <option value="visitor">Visitor</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? 'Adding...' : 'Add Storyteller'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
