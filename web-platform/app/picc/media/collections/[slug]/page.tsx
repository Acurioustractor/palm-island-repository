'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  FolderOpen,
  Image as ImageIcon,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Grid,
  LayoutGrid,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface MediaFile {
  id: string;
  filename: string;
  title: string | null;
  caption: string | null;
  public_url: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  tags: string[] | null;
  file_type: string;
}

interface CollectionItem {
  id: string;
  sort_order: number;
  added_at: string;
  media_id: string;
  media: MediaFile;
}

interface PhotoCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  item_count: number;
  is_public: boolean;
  created_at: string;
}

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<PhotoCollection | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [gridSize, setGridSize] = useState<'sm' | 'lg'>('lg');

  useEffect(() => {
    loadCollection();
  }, [slug]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/media/collections/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Collection not found');
        } else {
          setError('Failed to load collection');
        }
        return;
      }
      const data = await res.json();
      setCollection(data.collection);
      setItems(data.items || []);
    } catch (err) {
      setError('Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight' && selectedIndex < items.length - 1) setSelectedIndex(selectedIndex + 1);
      if (e.key === 'ArrowLeft' && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIndex, items.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f] mx-auto" />
          <p className="text-gray-600 mt-4">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/picc/media/collections" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Collections
          </Link>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Not Found'}</h1>
            <p className="text-gray-600">This collection doesn&apos;t exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/picc/media/collections" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Collections
          </Link>

          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
              {collection.description && (
                <p className="text-gray-600 mt-1 max-w-2xl">{collection.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGridSize(gridSize === 'lg' ? 'sm' : 'lg')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={gridSize === 'lg' ? 'Smaller grid' : 'Larger grid'}
              >
                {gridSize === 'lg' ? <Grid className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4" />
              {items.length} photo{items.length !== 1 ? 's' : ''}
            </span>
            {collection.is_public && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Public</span>
            )}
          </div>
        </div>

        {/* Photo Grid */}
        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
            <p className="text-gray-600">Add photos to this collection from the gallery.</p>
          </div>
        ) : (
          <div className={`grid gap-2 ${gridSize === 'lg' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-3 md:grid-cols-5 lg:grid-cols-6'}`}>
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setSelectedIndex(index)}
                className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 hover:ring-2 hover:ring-[#1e3a5f] transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.media.public_url}
                  alt={item.media.title || item.media.caption || item.media.filename}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                {item.media.title && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{item.media.title}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setSelectedIndex(null)}>
          {/* Close */}
          <button className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10" onClick={() => setSelectedIndex(null)}>
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/70 text-sm z-10">
            {selectedIndex! + 1} / {items.length}
          </div>

          {/* Prev */}
          {selectedIndex! > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white z-10"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex! - 1); }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next */}
          {selectedIndex! < items.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white z-10"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex! + 1); }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <div className="max-w-[90vw] max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedItem.media.public_url}
              alt={selectedItem.media.title || selectedItem.media.filename}
              className="max-w-full max-h-[85vh] object-contain rounded"
            />
            {/* Caption bar */}
            {(selectedItem.media.title || selectedItem.media.caption) && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b">
                {selectedItem.media.title && (
                  <p className="text-white font-medium">{selectedItem.media.title}</p>
                )}
                {selectedItem.media.caption && (
                  <p className="text-white/80 text-sm mt-1">{selectedItem.media.caption}</p>
                )}
              </div>
            )}
          </div>

          {/* Download link */}
          <a
            href={selectedItem.media.public_url}
            download={selectedItem.media.filename}
            className="absolute bottom-4 right-4 p-2 text-white/70 hover:text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-5 h-5" />
          </a>
        </div>
      )}
    </div>
  );
}
