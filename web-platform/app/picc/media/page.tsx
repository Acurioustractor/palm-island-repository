'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MediaLibraryPage() {
  const [stats, setStats] = useState({
    totalPhotos: 0,
    collections: 0,
    smartFolders: 0,
    recentUploads: 0,
    untagged: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const headers = {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'count=exact'
      };

      const [photosRes, collectionsRes, foldersRes, recentRes, untaggedRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/media_files?select=id&deleted_at=is.null&limit=1`, {
          headers, signal: AbortSignal.timeout(5000),
        }),
        fetch(`${supabaseUrl}/rest/v1/photo_collections?select=id&limit=1`, {
          headers, signal: AbortSignal.timeout(5000),
        }),
        fetch(`${supabaseUrl}/rest/v1/smart_folders?select=id&limit=1`, {
          headers, signal: AbortSignal.timeout(5000),
        }),
        (() => {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          return fetch(`${supabaseUrl}/rest/v1/media_files?select=id&deleted_at=is.null&created_at=gte.${d.toISOString()}&limit=1`, {
            headers, signal: AbortSignal.timeout(5000),
          });
        })(),
        fetch(`${supabaseUrl}/rest/v1/media_files?select=id&deleted_at=is.null&tags=eq.{}&file_type=eq.image&limit=1`, {
          headers, signal: AbortSignal.timeout(5000),
        }),
      ]);

      const getCount = (res: Response) => parseInt(res.headers.get('content-range')?.split('/')[1] || '0');

      setStats({
        totalPhotos: getCount(photosRes),
        collections: getCount(collectionsRes),
        smartFolders: getCount(foldersRes),
        recentUploads: getCount(recentRes),
        untagged: getCount(untaggedRes),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => loading ? '\u2014' : n.toLocaleString();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Media Library</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Organize, browse, and manage your photo collection with collections and smart folders.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
          {[
            { label: 'Total media', value: fmt(stats.totalPhotos) },
            { label: 'Collections', value: fmt(stats.collections) },
            { label: 'Smart folders', value: fmt(stats.smartFolders) },
            { label: 'Added this week', value: fmt(stats.recentUploads) },
            { label: 'Needs tagging', value: fmt(stats.untagged) },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main navigation */}
        <div className="space-y-px border border-gray-200 rounded-xl overflow-hidden mb-16">
          {[
            {
              title: 'Gallery',
              description: 'Browse, search, and manage all photos and video links with tags and bulk actions.',
              href: '/picc/media/gallery',
              stat: `${fmt(stats.totalPhotos)} items`,
            },
            {
              title: 'Smart Folders',
              description: 'Dynamic collections that automatically organize photos by tags, events, and dates.',
              href: '/picc/media/smart-folders',
              stat: `${fmt(stats.smartFolders)} folders`,
            },
            {
              title: 'Collections',
              description: 'Manually curated photo albums for specific events, projects, or themes.',
              href: '/picc/media/collections',
              stat: `${fmt(stats.collections)} collections`,
            },
            {
              title: 'Video Links',
              description: 'YouTube, Vimeo, and Descript links that appear in the gallery and can be tagged.',
              href: '/picc/media/external-videos',
            },
            {
              title: 'AI Tag Untagged',
              description: 'Run AI analysis on untagged photos or review and manually tag remaining items.',
              href: '/picc/media/gallery?filter=untagged',
              stat: `${fmt(stats.untagged)} photos`,
            },
            {
              title: 'Upload',
              description: 'Upload photos, short videos, and audio files. Drag and drop supported.',
              href: '/picc/media/upload',
            },
            {
              title: 'Bulk Upload',
              description: 'Upload hundreds of photos at once with pre-tagging by service, project, or event.',
              href: '/picc/media/upload-bulk',
            },
            {
              title: 'Cover Photos',
              description: 'Manage hero images for all 33 integrated services.',
              href: '/picc/media/cover-photos',
            },
            {
              title: 'Page Slots',
              description: 'See where photos appear on the live site and assign them to specific page sections.',
              href: '/picc/media/page-slots',
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex items-center justify-between px-6 py-5 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
              </div>
              {item.stat && (
                <span className="text-sm text-gray-400 ml-6 whitespace-nowrap">{item.stat}</span>
              )}
              <span className="text-gray-300 group-hover:text-gray-500 ml-4 transition-colors">&rarr;</span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
