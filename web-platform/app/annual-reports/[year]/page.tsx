'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, ChevronLeft, ChevronRight, FileText, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface YearData {
  fiscalYear: string;
  title: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  theme: string;
  era: string;
  color: string;
  imageCount: number;
  heroImages: any[];
  pdfPath: string;
  keywords: string[];
}

export default function AnnualReportYearPage() {
  const params = useParams();
  const year = params?.year as string;

  const [yearData, setYearData] = useState<YearData | null>(null);
  const [allYears, setAllYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadYearData();
  }, [year]);

  const loadYearData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/knowledge/annual-reports');
      const data = await response.json();

      if (data.timeline) {
        // Find the specific year
        const yearEntry = data.timeline.find((y: YearData) =>
          y.fiscalYear === year || y.fiscalYear.replace('-', '') === year
        );

        if (yearEntry) {
          setYearData(yearEntry);
        }

        // Get all years for navigation
        setAllYears(data.timeline.map((y: YearData) => y.fiscalYear));
      }
    } catch (error) {
      console.error('Error loading year data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentIndex = () => {
    return allYears.findIndex(y => y === year || y.replace('-', '') === year);
  };

  const getPrevYear = () => {
    const idx = getCurrentIndex();
    return idx > 0 ? allYears[idx - 1] : null;
  };

  const getNextYear = () => {
    const idx = getCurrentIndex();
    return idx < allYears.length - 1 ? allYears[idx + 1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!yearData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
          <p className="text-gray-600 mb-6">The annual report for {year} could not be found.</p>
          <Link
            href="/annual-reports"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Timeline
          </Link>
        </div>
      </div>
    );
  }

  const prevYear = getPrevYear();
  const nextYear = getNextYear();

  const colorSchemes: Record<string, any> = {
    amber: {
      gradient: 'from-amber-50 to-orange-50',
      badge: 'bg-amber-100 text-amber-700 border-amber-300',
      accent: 'text-amber-700',
      border: 'border-amber-300'
    },
    purple: {
      gradient: 'from-purple-50 to-pink-50',
      badge: 'bg-purple-100 text-purple-700 border-purple-300',
      accent: 'text-purple-700',
      border: 'border-purple-300'
    },
    green: {
      gradient: 'from-green-50 to-emerald-50',
      badge: 'bg-green-100 text-green-700 border-green-300',
      accent: 'text-green-700',
      border: 'border-green-300'
    },
    blue: {
      gradient: 'from-blue-50 to-cyan-50',
      badge: 'bg-blue-100 text-blue-700 border-blue-300',
      accent: 'text-blue-700',
      border: 'border-blue-300'
    }
  };

  const scheme = colorSchemes[yearData.color] || colorSchemes.blue;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${scheme.gradient}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/annual-reports"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Timeline
            </Link>

            <a
              href={yearData.pdfPath}
              download
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className={`inline-block px-6 py-3 rounded-full border-2 ${scheme.badge} font-bold text-2xl mb-6`}>
            {yearData.fiscalYear}
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {yearData.theme || yearData.title}
          </h1>

          {yearData.subtitle && (
            <p className="text-xl text-gray-600 mb-6">
              {yearData.subtitle}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{yearData.era.replace('-', ' ')} Era</span>
            </div>
            {yearData.imageCount > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  {yearData.imageCount} images
                </div>
              </>
            )}
          </div>

          {/* Keywords */}
          {yearData.keywords && yearData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {yearData.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 text-sm rounded-full bg-white ${scheme.accent} border-2 ${scheme.border}`}
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {yearData.summary && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>{yearData.summary}</p>
            </div>
          </div>
        )}

        {/* Images Gallery */}
        {yearData.heroImages && yearData.heroImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Report Images ({yearData.heroImages.length})
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {yearData.heroImages.map((img, idx) => (
                <div
                  key={img.id || idx}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 hover:shadow-xl transition-all group cursor-pointer"
                >
                  {img.public_url ? (
                    <img
                      src={img.public_url}
                      alt={img.alt_text || `Page ${img.metadata?.page_number || idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-500" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-3 text-white text-sm">
                      <p className="font-semibold">
                        Page {img.metadata?.page_number || idx + 1}
                      </p>
                      {img.title && (
                        <p className="text-xs text-white/80">{img.title}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Content */}
        {yearData.content && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Full Content</h2>
            <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
              {yearData.content}
            </div>
          </div>
        )}

        {/* Navigation to Previous/Next Year */}
        <div className="flex justify-between items-center gap-4">
          {prevYear ? (
            <Link
              href={`/annual-reports/${prevYear}`}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow hover:shadow-lg transition-all border-2 border-gray-200 hover:border-blue-300"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>
                <div className="text-xs text-gray-600">Previous</div>
                <div className="font-semibold text-gray-900">{prevYear}</div>
              </span>
            </Link>
          ) : (
            <div></div>
          )}

          {nextYear ? (
            <Link
              href={`/annual-reports/${nextYear}`}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow hover:shadow-lg transition-all border-2 border-gray-200 hover:border-blue-300"
            >
              <span className="text-right">
                <div className="text-xs text-gray-600">Next</div>
                <div className="font-semibold text-gray-900">{nextYear}</div>
              </span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
