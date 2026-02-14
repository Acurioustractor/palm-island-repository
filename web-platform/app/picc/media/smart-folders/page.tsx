'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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

const COLOR_ACCENTS: Record<string, string> = {
  amber: 'border-l-amber-400',
  blue: 'border-l-blue-400',
  red: 'border-l-red-400',
  purple: 'border-l-purple-400',
  green: 'border-l-green-500',
  pink: 'border-l-pink-400',
};

export default function SmartFoldersPage() {
  const [folders, setFolders] = useState<SmartFolder[]>([]);
  const [mediaCounts, setMediaCounts] = useState<Record<string, number>>({});
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadSmartFolders();
  }, []);

  const loadSmartFolders = async () => {
    try {
      setLoading(true);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

      try {
        const countsRes = await fetch('/api/media/smart-folder-counts', {
          signal: AbortSignal.timeout(30000),
        });
        if (countsRes.ok) {
          const countsJson = await countsRes.json();
          setMediaCounts(countsJson.counts || {});
          setThumbnails(countsJson.thumbnails || {});
        }
      } catch (countErr) {
        console.error('Error loading folder counts:', countErr);
      }
    } catch (error: any) {
      console.error('Error loading smart folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const bootstrapFolders = async () => {
    try {
      setBootstrapping(true);
      const res = await fetch('/api/media/bootstrap-system-folders', { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to bootstrap folders');
      await loadSmartFolders();
    } catch (e: any) {
      alert(e?.message || 'Failed to bootstrap folders');
    } finally {
      setBootstrapping(false);
    }
  };

  const groupFolders = (folderList: SmartFolder[]) => {
    const groups: { label: string; folders: SmartFolder[] }[] = [];
    const events: SmartFolder[] = [];
    const services: SmartFolder[] = [];
    const projects: SmartFolder[] = [];
    const fiscalYears: SmartFolder[] = [];
    const annualReports: SmartFolder[] = [];
    const utility: SmartFolder[] = [];

    for (const f of folderList) {
      if (f.slug.startsWith('event-') || f.slug.startsWith('source-') || f.slug === 'profile-photos') {
        events.push(f);
      } else if (f.slug.startsWith('service-')) {
        services.push(f);
      } else if (f.slug.startsWith('project-')) {
        projects.push(f);
      } else if (f.slug.startsWith('fy-')) {
        fiscalYears.push(f);
      } else if (f.slug.startsWith('annual-report-')) {
        annualReports.push(f);
      } else {
        utility.push(f);
      }
    }

    if (events.length) groups.push({ label: 'Photo Collections', folders: events });
    if (utility.length) groups.push({ label: 'Utility', folders: utility });
    if (services.length) groups.push({ label: 'Services', folders: services });
    if (projects.length) groups.push({ label: 'Projects', folders: projects });
    if (annualReports.length) groups.push({ label: 'Annual Reports', folders: annualReports });
    if (fiscalYears.length) groups.push({ label: 'Fiscal Years', folders: fiscalYears });

    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const systemFolders = folders.filter(f => f.is_system);
  const customFolders = folders.filter(f => !f.is_system);
  const groups = groupFolders(systemFolders);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <Link href="/picc/media" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Media Library
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-3">Smart Folders</h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Dynamic collections that automatically organize photos based on tags, events, and dates.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            {/* View toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden text-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 transition-colors ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                List
              </button>
            </div>
            <button
              onClick={bootstrapFolders}
              disabled={bootstrapping}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-4 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {bootstrapping ? 'Building...' : 'Rebuild'}
            </button>
          </div>
        </div>

        {/* Grouped folder sections */}
        {groups.map((group) => (
          <div key={group.label} className="mb-12">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              {group.label}
            </h2>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.folders.map((folder) => {
                  const count = mediaCounts[folder.slug] || 0;
                  const thumb = thumbnails[folder.slug];

                  return (
                    <Link
                      key={folder.id}
                      href={`/picc/media/smart-folders/${folder.slug}`}
                      className="group rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-[4/3] bg-gray-50 relative">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={folder.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-gray-300">No photos</span>
                          </div>
                        )}
                        {/* Count badge */}
                        {count > 0 && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm tabular-nums">
                            {count}
                          </div>
                        )}
                      </div>
                      {/* Label */}
                      <div className="px-3 py-2.5">
                        <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                          {folder.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{folder.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {group.folders.map((folder) => {
                  const count = mediaCounts[folder.slug] || 0;
                  const accent = COLOR_ACCENTS[folder.color] || 'border-l-gray-300';
                  const thumb = thumbnails[folder.slug];

                  return (
                    <Link
                      key={folder.id}
                      href={`/picc/media/smart-folders/${folder.slug}`}
                      className={`group flex items-center gap-4 px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors border-l-4 ${accent}`}
                    >
                      {/* Thumbnail in list view */}
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {thumb ? (
                          <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                          {folder.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{folder.description}</p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <span className={`text-sm tabular-nums ${count > 0 ? 'text-gray-700 font-medium' : 'text-gray-300'}`}>
                          {count}
                        </span>
                        <span className="text-gray-300 group-hover:text-gray-500 transition-colors">&rarr;</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Custom folders */}
        {customFolders.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Custom Folders
            </h2>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {customFolders.map((folder) => {
                  const count = mediaCounts[folder.slug] || 0;
                  const thumb = thumbnails[folder.slug];
                  return (
                    <Link
                      key={folder.id}
                      href={`/picc/media/smart-folders/${folder.slug}`}
                      className="group rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="aspect-[4/3] bg-gray-50 relative">
                        {thumb ? (
                          <img src={thumb} alt={folder.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-gray-300">No photos</span>
                          </div>
                        )}
                        {count > 0 && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm tabular-nums">
                            {count}
                          </div>
                        )}
                      </div>
                      <div className="px-3 py-2.5">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{folder.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{folder.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {customFolders.map((folder) => {
                  const count = mediaCounts[folder.slug] || 0;
                  const thumb = thumbnails[folder.slug];
                  return (
                    <Link
                      key={folder.id}
                      href={`/picc/media/smart-folders/${folder.slug}`}
                      className="group flex items-center gap-4 px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {thumb ? (
                          <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900">{folder.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{folder.description}</p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <span className={`text-sm tabular-nums ${count > 0 ? 'text-gray-700 font-medium' : 'text-gray-300'}`}>
                          {count}
                        </span>
                        <span className="text-gray-300 group-hover:text-gray-500 transition-colors">&rarr;</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {folders.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No smart folders yet</h3>
            <p className="text-gray-500 mb-6">
              Click &ldquo;Rebuild&rdquo; to generate folders from your services, projects, and events.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
