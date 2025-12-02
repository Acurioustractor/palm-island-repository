'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Heart,
  Star,
  AlertCircle,
  Calendar,
  Folder,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

interface SmartFolder {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  query_rules: any;
}

interface MediaFile {
  id: string;
  filename: string;
  public_url: string;
  file_type: string;
  title?: string;
  tags?: string[];
  quality_score?: number;
  created_at: string;
}

const iconMap: Record<string, any> = {
  Users,
  Heart,
  Star,
  AlertCircle,
  Calendar,
  Folder,
};

const colorClasses: Record<string, { bg: string; text: string; badge: string }> = {
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  red: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  green: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-700' },
};

export default function SmartFolderDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [folder, setFolder] = useState<SmartFolder | null>(null);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadFolderAndMedia();
    }
  }, [slug]);

  const loadFolderAndMedia = async () => {
    try {
      setLoading(true);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      // Load smart folder
      const folderResponse = await fetch(
        `${supabaseUrl}/rest/v1/smart_folders?select=*&slug=eq.${slug}`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!folderResponse.ok) {
        console.error('Error loading folder:', folderResponse.statusText);
        return;
      }

      const folderData = await folderResponse.json();
      if (!folderData || folderData.length === 0) {
        console.error('Folder not found');
        return;
      }

      setFolder(folderData[0]);

      // Load all media files
      const mediaResponse = await fetch(
        `${supabaseUrl}/rest/v1/media_files?select=id,filename,public_url,file_type,title,tags,quality_score,created_at&deleted_at=is.null&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!mediaResponse.ok) {
        console.error('Error loading media:', mediaResponse.statusText);
        return;
      }

      const allMedia = await mediaResponse.json();

      // Filter media based on folder rules
      const filteredMedia = filterMediaByRules(folderData[0], allMedia);
      setMedia(filteredMedia);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMediaByRules = (folder: SmartFolder, allMedia: MediaFile[]): MediaFile[] => {
    const rules = folder.query_rules;
    if (!rules || !rules.filters) return [];

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
    });
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
            <p className="text-gray-600">Loading smart folder...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/picc/media/smart-folders" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Smart Folders
          </Link>
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Folder not found</h1>
          </div>
        </div>
      </div>
    );
  }

  const Icon = getIcon(folder.icon);
  const colors = getColorClasses(folder.color);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/picc/media/smart-folders" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Smart Folders
          </Link>

          <div className={`p-6 rounded-xl border-2 ${colors.bg} border-gray-200 mb-4`}>
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-lg ${colors.badge}`}>
                <Icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{folder.name}</h1>
                <p className="text-gray-600 mb-3">{folder.description}</p>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  <span className={`font-medium ${colors.text}`}>
                    {media.length} photo{media.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        {media.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No photos match this folder</h3>
            <p className="text-gray-600 mb-4">
              Photos will appear here automatically when they match the folder criteria
            </p>
            <Link
              href="/picc/media/gallery"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View All Photos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item) => (
              <Link
                key={item.id}
                href={`/picc/media/${item.id}`}
                className="group aspect-square bg-gray-100 rounded-lg overflow-hidden relative hover:ring-2 hover:ring-blue-500 transition-all"
              >
                <img
                  src={item.public_url}
                  alt={item.title || item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.tags && item.tags.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-1.5 py-0.5 bg-white/20 text-white rounded backdrop-blur-sm"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="text-xs px-1.5 py-0.5 bg-white/20 text-white rounded backdrop-blur-sm">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
