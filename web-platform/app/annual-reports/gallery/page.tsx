'use client';

import { useState, useEffect } from 'react';
import { Calendar, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface MediaFile {
  id: string;
  filename: string;
  public_url: string;
  title?: string;
  alt_text?: string;
  metadata: {
    fiscal_year?: string;
    page_number?: number;
  };
}

export default function AnnualReportsGallery() {
  const searchParams = useSearchParams();
  const yearParam = searchParams?.get('year');

  const [images, setImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(yearParam || 'all');
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (yearParam && years.includes(yearParam)) {
      setSelectedYear(yearParam);
    }
  }, [yearParam, years]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/knowledge/annual-reports');
      const data = await response.json();

      // Collect all images from all years
      const allImages: MediaFile[] = [];
      const yearsSet = new Set<string>();

      data.timeline?.forEach((year: any) => {
        if (year.heroImages && year.heroImages.length > 0) {
          year.heroImages.forEach((img: any) => {
            allImages.push(img);
            if (img.metadata?.fiscal_year) {
              yearsSet.add(img.metadata.fiscal_year);
            }
          });
        }
      });

      setImages(allImages);
      setYears(Array.from(yearsSet).sort());
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = selectedYear === 'all'
    ? images
    : images.filter(img => img.metadata?.fiscal_year === selectedYear);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/annual-reports"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Timeline
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-7 h-7 text-blue-600" />
                  Annual Reports Image Gallery
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredImages.length} images from PICC annual reports
                </p>
              </div>
            </div>
          </div>

          {/* Year Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedYear === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Years ({images.length})
            </button>
            {years.map((year) => {
              const count = images.filter(img => img.metadata?.fiscal_year === year).length;
              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedYear === year
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {year} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading images...</p>
            </div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No images found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((img, idx) => (
                <div
                  key={img.id || idx}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 hover:shadow-xl transition-shadow group"
                >
                  <img
                    src={img.public_url}
                    alt={img.alt_text || img.title || `Annual report image from ${img.metadata?.fiscal_year || 'unknown year'}`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Overlay with info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-3 text-white text-sm">
                      <p className="font-semibold">{img.metadata?.fiscal_year || 'Unknown year'}</p>
                      {img.metadata?.page_number && (
                        <p className="text-xs text-white/80">Page {img.metadata.page_number}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Other Years Section */}
            {selectedYear !== 'all' && years.length > 1 && (
              <div className="mt-12 border-t border-gray-300 pt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Explore Other Years</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {years.filter(y => y !== selectedYear).map((year) => {
                    const count = images.filter(img => img.metadata?.fiscal_year === year).length;
                    return (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className="px-4 py-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                      >
                        <div className="font-semibold text-gray-900">{year}</div>
                        <div className="text-xs text-gray-600">{count} images</div>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setSelectedYear('all')}
                    className="px-4 py-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300 hover:border-blue-500 hover:shadow-lg transition-all text-center"
                  >
                    <div className="font-semibold text-blue-700">All Years</div>
                    <div className="text-xs text-blue-600">{images.length} images</div>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
