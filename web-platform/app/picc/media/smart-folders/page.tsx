'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Users,
  Heart,
  Star,
  AlertCircle,
  Calendar,
  Folder,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface SmartFolder {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  is_system: boolean;
  query_rules: any;
  created_at: string;
}

interface MediaCount {
  [key: string]: number;
}

const iconMap: Record<string, any> = {
  Users,
  Heart,
  Star,
  AlertCircle,
  Calendar,
  Folder,
};

const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-700' },
};

export default function SmartFoldersPage() {
  const [folders, setFolders] = useState<SmartFolder[]>([]);
  const [mediaCounts, setMediaCounts] = useState<MediaCount>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSmartFolders();
  }, []);

  const loadSmartFolders = async () => {
    try {
      setLoading(true);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      // Load smart folders
      const response = await fetch(
        `${supabaseUrl}/rest/v1/smart_folders?select=*&order=name`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        console.error('Error loading smart folders:', response.statusText);
        return;
      }

      const data = await response.json();
      setFolders(data || []);

      // Calculate counts for each folder
      await calculateCounts(data);
    } catch (error: any) {
      console.error('Error loading smart folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCounts = async (folders: SmartFolder[]) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      // Get all media files
      const mediaResponse = await fetch(
        `${supabaseUrl}/rest/v1/media_files?select=id,tags,quality_score,created_at&deleted_at=is.null`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!mediaResponse.ok) return;

      const allMedia = await mediaResponse.json();
      const counts: MediaCount = {};

      // Calculate counts based on query rules
      folders.forEach(folder => {
        counts[folder.slug] = getMatchingMediaCount(folder, allMedia);
      });

      setMediaCounts(counts);
    } catch (error) {
      console.error('Error calculating counts:', error);
    }
  };

  const getMatchingMediaCount = (folder: SmartFolder, allMedia: any[]): number => {
    const rules = folder.query_rules;
    if (!rules || !rules.filters) return 0;

    return allMedia.filter(media => {
      return rules.filters.every((filter: any) => {
        switch (filter.field) {
          case 'tags':
            if (filter.operator === 'contains') {
              return media.tags?.includes(filter.value);
            }
            if (filter.operator === 'contains_any') {
              return filter.value.some((tag: string) => media.tags?.includes(tag));
            }
            if (filter.operator === 'empty') {
              return !media.tags || media.tags.length === 0;
            }
            return false;

          case 'quality_score':
            if (filter.operator === '>=') {
              return (media.quality_score || 0) >= filter.value;
            }
            return false;

          case 'created_at':
            if (filter.operator === '>=') {
              if (filter.value === 'start_of_month') {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return new Date(media.created_at) >= startOfMonth;
              }
            }
            return false;

          default:
            return false;
        }
      });
    }).length;
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Folder;
    return Icon;
  };

  const getColorClasses = (color: string) => {
    return colorClasses[color] || colorClasses.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading smart folders...</p>
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
              <Sparkles className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Smart Folders</h1>
            </div>
          </div>
          <p className="text-gray-600">
            Dynamic collections that automatically organize photos based on tags, dates, and quality
          </p>
        </div>

        {/* System Smart Folders */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Folders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.filter(f => f.is_system).map((folder) => {
              const Icon = getIcon(folder.icon);
              const colors = getColorClasses(folder.color);
              const count = mediaCounts[folder.slug] || 0;

              return (
                <Link
                  key={folder.id}
                  href={`/picc/media/smart-folders/${folder.slug}`}
                  className={`group block p-6 rounded-xl border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-all`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${colors.badge}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {folder.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {folder.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <span className={`font-medium ${colors.text}`}>
                          {count} photo{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Smart Folders (if any) */}
        {folders.filter(f => !f.is_system).length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Folders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.filter(f => !f.is_system).map((folder) => {
                const Icon = getIcon(folder.icon);
                const colors = getColorClasses(folder.color);
                const count = mediaCounts[folder.slug] || 0;

                return (
                  <Link
                    key={folder.id}
                    href={`/picc/media/smart-folders/${folder.slug}`}
                    className={`group block p-6 rounded-xl border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-all`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${colors.badge}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {folder.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {folder.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <span className={`font-medium ${colors.text}`}>
                            {count} photo{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {folders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No smart folders found</h3>
            <p className="text-gray-600">
              Smart folders will automatically organize your photos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
