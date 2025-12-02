'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Film, Search, Play } from 'lucide-react';
import Link from 'next/link';

interface MediaFile {
  name: string;
  bucket: string;
  publicUrl: string;
  size: number;
  created_at: string;
  metadata?: any;
}

export default function MediaVideosPage() {
  const supabase = useMemo(() => createClient(), []);
  const [videos, setVideos] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const allMedia: MediaFile[] = [];

      // Load from all buckets
      const buckets = ['story-images', 'profile-images', 'story-media'];

      for (const bucket of buckets) {
        const { data: files, error } = await supabase.storage
          .from(bucket)
          .list('', {
            limit: 1000,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (files) {
          for (const file of files) {
            // Only include video files
            const isVideo = /\.(mp4|mov|avi|webm|mkv)$/i.test(file.name);

            if (isVideo) {
              const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(file.name);

              allMedia.push({
                name: file.name,
                bucket,
                publicUrl,
                size: file.metadata?.size || 0,
                created_at: file.created_at || '',
                metadata: file.metadata
              });
            }
          }
        }
      }

      setVideos(allMedia);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(vid =>
    vid.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/picc/media" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to All Media
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <Film className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Video Library</h1>
          </div>
          <p className="text-gray-600">Browse all video content from stories and community</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Videos</div>
            <div className="text-2xl font-bold text-gray-900">{filteredVideos.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Size</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatFileSize(filteredVideos.reduce((sum, vid) => sum + vid.size, 0))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Buckets</div>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(filteredVideos.map(vid => vid.bucket)).size}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading videos...</p>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, index) => (
              <div key={index} className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-video bg-gray-900 relative overflow-hidden">
                  <video
                    src={video.publicUrl}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/30 transition-all">
                    <div className="bg-white/90 rounded-full p-4">
                      <Play className="h-8 w-8 text-purple-600 fill-current" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-900 truncate mb-2">{video.name}</div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="capitalize">{video.bucket.replace(/-/g, ' ')}</span>
                    <span>{formatFileSize(video.size)}</span>
                  </div>
                  <a
                    href={video.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all"
                  >
                    Watch Video
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredVideos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Film className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search' : 'Upload videos to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
