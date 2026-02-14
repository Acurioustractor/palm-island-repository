'use client';

import { Download, Image as ImageIcon, Maximize2, FileText } from 'lucide-react';
import Image from 'next/image';

interface TimelineCardProps {
  year: {
    fiscalYear: string;
    title: string;
    subtitle?: string;
    summary?: string;
    theme: string;
    era: string;
    color: string;
    imageCount: number;
    heroImages: any[];
    pdfPath: string;
    keywords: string[];
  };
  index: number;
  onExpand: () => void;
}

export default function TimelineCard({ year, index, onExpand }: TimelineCardProps) {
  // Color schemes by era
  const colorSchemes = {
    amber: {
      gradient: 'from-picc-ochre-50 to-picc-ochre-50',
      border: 'border-picc-ochre-300',
      badge: 'bg-picc-ochre-100 text-picc-ochre border-picc-ochre-300',
      button: 'bg-picc-ochre hover:bg-picc-ochre',
      text: 'text-picc-ochre'
    },
    purple: {
      gradient: 'from-warm-100 to-warm-100',
      border: 'border-picc-ochre-300',
      badge: 'bg-warm-100 text-picc-ochre border-picc-ochre-300',
      button: 'bg-picc-ochre hover:bg-picc-ochre',
      text: 'text-picc-ochre'
    },
    green: {
      gradient: 'from-sage-50 to-sage-50',
      border: 'border-sage-300',
      badge: 'bg-sage-100 text-sage-700 border-sage-300',
      button: 'bg-sage-600 hover:bg-sage-600',
      text: 'text-sage-700'
    },
    blue: {
      gradient: 'from-warm-50 to-warm-50',
      border: 'border-picc-red-300',
      badge: 'bg-warm-100 text-picc-red border-picc-red-300',
      button: 'bg-picc-red hover:bg-picc-red',
      text: 'text-picc-red'
    }
  };

  const scheme = colorSchemes[year.color as keyof typeof colorSchemes] || colorSchemes.blue;

  return (
    <div
      className="flex-shrink-0 w-96 scroll-snap-align-start"
      style={{
        scrollSnapAlign: 'start',
        animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
      }}
    >
      <div
        className={`h-full bg-gradient-to-br ${scheme.gradient} rounded-2xl border-2 ${scheme.border} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group`}
      >
        {/* Header with Year Badge */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className={`px-4 py-2 rounded-full border-2 ${scheme.badge} font-bold text-2xl`}>
              {year.fiscalYear}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ImageIcon className="w-4 h-4" />
              {year.imageCount} images
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">{year.theme}</h3>
          {year.subtitle && (
            <p className="text-sm text-gray-600 mb-3">{year.subtitle}</p>
          )}
        </div>

        {/* Hero Images Grid */}
        {year.heroImages.length > 0 && (
          <div className="px-6 pb-4">
            <div className={`grid gap-2 ${
              year.heroImages.length === 1 ? 'grid-cols-1' :
              year.heroImages.length === 2 ? 'grid-cols-2' :
              'grid-cols-3'
            }`}>
              {year.heroImages.slice(0, 3).map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 group-hover:scale-105 transition-transform duration-300"
                >
                  {/* Placeholder - images are local files */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {year.summary && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-700 line-clamp-3">
              {year.summary}
            </p>
          </div>
        )}

        {/* Keywords Tags */}
        {year.keywords && year.keywords.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {year.keywords.slice(0, 4).map((keyword, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 text-xs rounded-full bg-white/50 ${scheme.text} border ${scheme.border}`}
                >
                  {keyword}
                </span>
              ))}
              {year.keywords.length > 4 && (
                <span className="px-2 py-1 text-xs rounded-full bg-white/50 text-gray-600 border border-gray-300">
                  +{year.keywords.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={onExpand}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 ${scheme.button} text-white rounded-lg transition-colors font-medium`}
          >
            <Maximize2 className="w-4 h-4" />
            View Details
          </button>
          <a
            href={year.pdfPath}
            download
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-4 h-4" />
          </a>
        </div>

        {/* Era Indicator */}
        <div className={`px-6 py-2 bg-white/30 border-t-2 ${scheme.border}`}>
          <p className="text-xs font-medium text-gray-600 text-center capitalize">
            {year.era.replace('-', ' ')} Era
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
