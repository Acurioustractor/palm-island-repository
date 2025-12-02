'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Mic, Search, Play, Pause } from 'lucide-react';
import Link from 'next/link';

interface MediaFile {
  name: string;
  bucket: string;
  publicUrl: string;
  size: number;
  created_at: string;
  metadata?: any;
}

export default function MediaAudioPage() {
  const supabase = createClientComponentClient();
  const [audioFiles, setAudioFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  useEffect(() => {
    loadAudioFiles();
  }, []);

  const loadAudioFiles = async () => {
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
            // Only include audio files
            const isAudio = /\.(mp3|wav|m4a|ogg|flac)$/i.test(file.name);

            if (isAudio) {
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

      setAudioFiles(allMedia);
    } catch (error) {
      console.error('Error loading audio files:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAudio = audioFiles.filter(audio =>
    audio.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Mic className="h-8 w-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-gray-900">Audio Library</h1>
          </div>
          <p className="text-gray-600">Browse all voice recordings and audio content</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search audio files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Audio Files</div>
            <div className="text-2xl font-bold text-gray-900">{filteredAudio.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Size</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatFileSize(filteredAudio.reduce((sum, audio) => sum + audio.size, 0))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Buckets</div>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(filteredAudio.map(audio => audio.bucket)).size}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading audio files...</p>
          </div>
        )}

        {/* Audio Files List */}
        {!loading && (
          <div className="space-y-3">
            {filteredAudio.map((audio, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Mic className="h-6 w-6 text-teal-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate mb-1">{audio.name}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="capitalize">{audio.bucket.replace(/-/g, ' ')}</span>
                      <span>•</span>
                      <span>{formatFileSize(audio.size)}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <audio
                      controls
                      className="h-10"
                      preload="metadata"
                    >
                      <source src={audio.publicUrl} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAudio.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audio files found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search' : 'Upload audio recordings to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
