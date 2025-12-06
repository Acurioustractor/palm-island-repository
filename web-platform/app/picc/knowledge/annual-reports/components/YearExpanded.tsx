'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Image as ImageIcon, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface YearExpandedProps {
  fiscalYear: string;
  yearData?: {
    fiscalYear: string;
    title: string;
    subtitle?: string;
    summary?: string;
    theme: string;
    era: string;
    color: string;
    imageCount: number;
    pdfPath: string;
    slug: string;
  };
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export default function YearExpanded({ fiscalYear, yearData, onClose, onNavigate }: YearExpandedProps) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadYearImages();
  }, [fiscalYear]);

  const loadYearImages = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from an API
      // For now, we'll simulate it
      setImages([]);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const colorSchemes = {
    amber: 'from-amber-500 to-orange-600',
    purple: 'from-purple-500 to-pink-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600'
  };

  const gradient = colorSchemes[yearData?.color as keyof typeof colorSchemes] || colorSchemes.blue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradient} text-white p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('prev')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                aria-label="Previous year"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-3xl font-bold">{fiscalYear}</h2>
                <p className="text-white/90">{yearData?.theme}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('next')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                aria-label="Next year"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <a
              href={yearData?.pdfPath}
              download
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
            <Link
              href={`/picc/knowledge/${yearData?.slug}`}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              View Full Entry
            </Link>
            <Link
              href="/picc/media/collections/annual-reports-images"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
            >
              <ImageIcon className="w-4 h-4" />
              All Images
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Summary */}
          {yearData?.summary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
              <p className="text-gray-700 leading-relaxed">{yearData.summary}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
              <div className="text-3xl font-bold text-gray-900">{yearData?.imageCount || 0}</div>
              <div className="text-sm text-gray-600">Images Extracted</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
              <div className="text-3xl font-bold text-gray-900 capitalize">{yearData?.era || '-'}</div>
              <div className="text-sm text-gray-600">Era</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
              <div className="text-3xl font-bold text-gray-900">PDF</div>
              <div className="text-sm text-gray-600">Full Report Available</div>
            </div>
          </div>

          {/* Images Grid */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Extracted Images ({yearData?.imageCount || 0})
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading images...</p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 border-2 border-blue-200 text-center">
                <ImageIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">
                  {yearData?.imageCount || 0} images from this year's annual report
                </p>
                <Link
                  href={`/picc/media/gallery?tag=annual-report-${fiscalYear}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <ImageIcon className="w-5 h-5" />
                  View in Gallery
                </Link>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Report</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Fiscal Year:</span> {fiscalYear}
              </p>
              <p>
                <span className="font-medium">Theme:</span> {yearData?.theme}
              </p>
              <p>
                <span className="font-medium">Era:</span> <span className="capitalize">{yearData?.era.replace('-', ' ')}</span>
              </p>
              <p>
                <span className="font-medium">Visual Documentation:</span> {yearData?.imageCount} images extracted and catalogued
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Use arrow keys or buttons to navigate between years
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('prev')}
              className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              ← Previous
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard navigation */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          if (e.key === 'ArrowLeft') onNavigate('prev');
          if (e.key === 'ArrowRight') onNavigate('next');
        }}
        tabIndex={0}
      />
    </div>
  );
}
