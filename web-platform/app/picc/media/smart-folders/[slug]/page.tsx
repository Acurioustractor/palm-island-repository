'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
  width?: number;
  height?: number;
  created_at: string;
}

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

      const res = await fetch(`/api/media/smart-folder-media?slug=${encodeURIComponent(slug)}`, {
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        console.error('Error loading folder:', res.statusText);
        return;
      }

      const json = await res.json();
      if (json.error) {
        console.error('Folder error:', json.error);
        return;
      }

      setFolder(json.folder);
      setMedia(json.media || []);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link href="/picc/media/smart-folders" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Smart Folders
          </Link>
          <div className="text-center py-16">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Folder not found</h1>
            <p className="text-gray-500">This smart folder doesn&apos;t exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Breadcrumb + Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/picc/media" className="hover:text-gray-600 transition-colors">Media Library</Link>
            <span>/</span>
            <Link href="/picc/media/smart-folders" className="hover:text-gray-600 transition-colors">Smart Folders</Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{folder.name}</h1>
          <p className="text-gray-600">{folder.description}</p>
          <p className="text-sm text-gray-400 mt-2">
            {media.length} photo{media.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Photo Grid */}
        {media.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No photos match this folder</h3>
            <p className="text-gray-500 mb-6">
              Photos will appear here automatically when they match the folder criteria.
            </p>
            <Link
              href="/picc/media/gallery"
              className="text-sm text-gray-700 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              Browse all photos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {media.map((item) => (
              <Link
                key={item.id}
                href={`/picc/media/${item.id}/edit`}
                className="group aspect-square bg-gray-100 rounded-lg overflow-hidden relative"
              >
                <img
                  src={item.public_url}
                  alt={item.title || item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {item.tags && item.tags.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-1.5 py-0.5 bg-white/20 text-white rounded backdrop-blur-sm"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="text-[11px] px-1.5 py-0.5 bg-white/20 text-white rounded backdrop-blur-sm">
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
