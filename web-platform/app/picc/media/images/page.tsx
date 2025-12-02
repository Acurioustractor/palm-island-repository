'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Image as ImageIcon, Search, Download, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface MediaFile {
  name: string;
  bucket: string;
  publicUrl: string;
  size: number;
  created_at: string;
  metadata?: any;
}

export default function MediaImagesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [images, setImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
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
            // Only include image files
            const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);

            if (isImage) {
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

      setImages(allMedia);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(img =>
    img.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <ImageIcon className="h-8 w-8 text-pink-600" />
            <h1 className="text-3xl font-bold text-gray-900">Image Library</h1>
          </div>
          <p className="text-gray-600">Browse all images across story and profile collections</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Images</div>
            <div className="text-2xl font-bold text-gray-900">{filteredImages.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Size</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatFileSize(filteredImages.reduce((sum, img) => sum + img.size, 0))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Buckets</div>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(filteredImages.map(img => img.bucket)).size}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading images...</p>
          </div>
        )}

        {/* Images Grid */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredImages.map((image, index) => (
              <div key={index} className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={image.publicUrl}
                    alt={image.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <a
                      href={image.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all"
                    >
                      View Full Size
                    </a>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-xs font-medium text-gray-900 truncate mb-1">{image.name}</div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{image.bucket.replace(/-/g, ' ')}</span>
                    <span>{formatFileSize(image.size)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredImages.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search' : 'Upload images to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
