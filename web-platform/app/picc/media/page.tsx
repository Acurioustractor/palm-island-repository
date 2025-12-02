'use client';

import { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Folder,
  FolderOpen,
  Sparkles,
  Upload,
  Grid,
  LayoutGrid,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export default function MediaLibraryPage() {
  const [stats, setStats] = useState({
    totalPhotos: 0,
    collections: 0,
    smartFolders: 6,
    recentUploads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      // Get total photos count
      const photosResponse = await fetch(
        `${supabaseUrl}/rest/v1/media_files?select=id&deleted_at=is.null&limit=1`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'count=exact'
          },
          signal: AbortSignal.timeout(5000),
        }
      );
      const photosCount = photosResponse.headers.get('content-range')?.split('/')[1] || '0';

      // Get collections count
      const collectionsResponse = await fetch(
        `${supabaseUrl}/rest/v1/photo_collections?select=id&limit=1`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'count=exact'
          },
          signal: AbortSignal.timeout(5000),
        }
      );
      const collectionsCount = collectionsResponse.headers.get('content-range')?.split('/')[1] || '0';

      // Get recent uploads (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentResponse = await fetch(
        `${supabaseUrl}/rest/v1/media_files?select=id&deleted_at=is.null&created_at=gte.${sevenDaysAgo.toISOString()}&limit=1`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'count=exact'
          },
          signal: AbortSignal.timeout(5000),
        }
      );
      const recentCount = recentResponse.headers.get('content-range')?.split('/')[1] || '0';

      setStats({
        totalPhotos: parseInt(photosCount),
        collections: parseInt(collectionsCount),
        smartFolders: 6,
        recentUploads: parseInt(recentCount)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickStats: QuickStat[] = [
    {
      label: 'Total Photos',
      value: loading ? '...' : stats.totalPhotos.toLocaleString(),
      icon: <ImageIcon className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      label: 'Collections',
      value: loading ? '...' : stats.collections,
      icon: <Folder className="w-5 h-5" />,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      label: 'Smart Folders',
      value: stats.smartFolders,
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      label: 'Recent (7 days)',
      value: loading ? '...' : stats.recentUploads,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-green-50 text-green-600 border-green-200'
    }
  ];

  const mainFeatures = [
    {
      title: 'Photo Gallery',
      description: 'Browse, search, and manage all photos with tags, metadata, and bulk actions',
      href: '/picc/media/gallery',
      icon: <Grid className="w-8 h-8" />,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      stats: `${stats.totalPhotos.toLocaleString()} photos`
    },
    {
      title: 'Collections',
      description: 'Create and manage custom photo albums for events, projects, and themes',
      href: '/picc/media/collections',
      icon: <FolderOpen className="w-8 h-8" />,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      stats: `${stats.collections} collections`
    },
    {
      title: 'Smart Folders',
      description: 'Dynamic collections that automatically organize photos by tags, dates, and quality',
      href: '/picc/media/smart-folders',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
      iconColor: 'text-amber-600',
      stats: '6 smart folders'
    },
    {
      title: 'Upload Photos',
      description: 'Add new photos with automatic tagging, metadata extraction, and organization',
      href: '/picc/media/upload',
      icon: <Upload className="w-8 h-8" />,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600',
      stats: 'Drag & drop supported'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LayoutGrid className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Media Library</h1>
          </div>
          <p className="text-lg text-gray-600">
            Organize, browse, and manage your photo collection with Collections and Smart Folders
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 ${stat.color} transition-all`}
            >
              <div className="flex items-center gap-2 mb-2">
                {stat.icon}
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {mainFeatures.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className={`group block p-6 rounded-xl border-2 ${feature.color} transition-all hover:shadow-lg`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-lg bg-white border-2 ${feature.color.split(' ')[1]} ${feature.iconColor}`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h2>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-gray-600 mb-3">
                    {feature.description}
                  </p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${feature.color}`}>
                    {feature.stats}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-white rounded-xl border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/picc/media/gallery"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Grid className="w-4 h-4" />
              Browse All Photos
            </Link>
            <Link
              href="/picc/media/upload"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Photos
            </Link>
            <Link
              href="/picc/media/collections"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Folder className="w-4 h-4" />
              Manage Collections
            </Link>
            <Link
              href="/picc/media/smart-folders"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              View Smart Folders
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
            <Grid className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Gallery</h3>
            <p className="text-sm text-gray-700">
              Search, filter, and browse all photos with advanced metadata and bulk operations
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
            <FolderOpen className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Collections</h3>
            <p className="text-sm text-gray-700">
              Manually curated photo albums for specific events, projects, or themes
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200">
            <Sparkles className="w-8 h-8 text-amber-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Smart Folders</h3>
            <p className="text-sm text-gray-700">
              Auto-updating dynamic collections based on tags, dates, quality, and other criteria
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
