'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Image as ImageIcon, Film, Music, Folder, Upload, Search, Filter, Download, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface MediaFile {
  name: string;
  bucket: string;
  size: number;
  created_at: string;
  updated_at: string;
  publicUrl: string;
  type: 'image' | 'video' | 'audio' | 'other';
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBucket, setFilterBucket] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const supabase = createClient();
      const allMedia: MediaFile[] = [];

      // Load from all buckets
      const buckets = ['story-images', 'profile-images', 'story-media'];

      for (const bucket of buckets) {
        const { data: files, error } = await supabase
          .storage
          .from(bucket)
          .list('', {
            limit: 1000,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (error) {
          console.error(`Error loading ${bucket}:`, error);
          continue;
        }

        if (files) {
          for (const file of files) {
            // Skip folders
            if (!file.name) continue;

            const { data: { publicUrl } } = supabase
              .storage
              .from(bucket)
              .getPublicUrl(file.name);

            const type = getFileType(file.name);

            allMedia.push({
              name: file.name,
              bucket,
              size: file.metadata?.size || 0,
              created_at: file.created_at || '',
              updated_at: file.updated_at || '',
              publicUrl,
              type
            });
          }
        }
      }

      setMedia(allMedia);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (filename: string): 'image' | 'video' | 'audio' | 'other' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'heic'].includes(ext || '')) return 'image';
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) return 'audio';
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredMedia = media.filter(file => {
    const matchesBucket = filterBucket === 'all' || file.bucket === filterBucket;
    const matchesType = filterType === 'all' || file.type === filterType;
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBucket && matchesType && matchesSearch;
  });

  const toggleFileSelection = (filename: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedFiles(newSelected);
  };

  const getBucketLabel = (bucket: string): string => {
    switch (bucket) {
      case 'story-images': return 'Story Images';
      case 'profile-images': return 'Profile Photos';
      case 'story-media': return 'Immersive Story Media';
      default: return bucket;
    }
  };

  const getBucketColor = (bucket: string): string => {
    switch (bucket) {
      case 'story-images': return 'bg-purple-100 text-purple-700';
      case 'profile-images': return 'bg-blue-100 text-blue-700';
      case 'story-media': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    total: media.length,
    images: media.filter(f => f.type === 'image').length,
    videos: media.filter(f => f.type === 'video').length,
    audio: media.filter(f => f.type === 'audio').length,
    totalSize: media.reduce((sum, f) => sum + f.size, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading media library...</p>
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
            <Folder className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          </div>
          <Link
            href="/picc/media/upload"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload Media
          </Link>
        </div>
        <p className="text-gray-600">
          Browse and manage all media files (photos, videos, audio)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Files</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.images}</div>
          <div className="text-sm text-gray-600">Images</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.videos}</div>
          <div className="text-sm text-gray-600">Videos</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.audio}</div>
          <div className="text-sm text-gray-600">Audio</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</div>
          <div className="text-sm text-gray-600">Total Size</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={filterBucket}
          onChange={(e) => setFilterBucket(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Buckets</option>
          <option value="story-images">Story Images</option>
          <option value="profile-images">Profile Photos</option>
          <option value="story-media">Immersive Story Media</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
        </select>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media files found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterBucket !== 'all' || filterType !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload your first media file to get started'}
          </p>
          <Link
            href="/picc/media/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Upload className="w-5 h-5" />
            Upload Media
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMedia.map((file) => (
            <div
              key={`${file.bucket}-${file.name}`}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Preview */}
              <div className="h-48 bg-gray-100 relative flex items-center justify-center">
                {file.type === 'image' ? (
                  <img
                    src={file.publicUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : file.type === 'video' ? (
                  <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-500 to-pink-600">
                    <Film className="w-16 h-16 text-white opacity-75 mb-2" />
                    <span className="text-xs text-white font-medium">Video File</span>
                  </div>
                ) : file.type === 'audio' ? (
                  <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-500 to-teal-600">
                    <Music className="w-16 h-16 text-white opacity-75 mb-2" />
                    <span className="text-xs text-white font-medium">Audio File</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-300">
                    <Folder className="w-16 h-16 text-gray-500 opacity-75 mb-2" />
                    <span className="text-xs text-gray-600 font-medium">Other File</span>
                  </div>
                )}

                {/* Bucket badge */}
                <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded ${getBucketColor(file.bucket)}`}>
                  {getBucketLabel(file.bucket).replace(' Images', '').replace(' Photos', '').replace(' Media', '')}
                </span>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 truncate mb-1" title={file.name}>
                  {file.name}
                </h3>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{new Date(file.created_at).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={file.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-xs"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </a>
                  <a
                    href={file.publicUrl}
                    download
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-xs"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
