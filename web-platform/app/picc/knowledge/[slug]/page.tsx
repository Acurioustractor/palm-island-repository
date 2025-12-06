'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Calendar, FileText, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface KnowledgeEntry {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  summary?: string;
  entry_type: string;
  category: string;
  fiscal_year?: string;
  structured_data?: any;
  created_at: string;
}

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

export default function KnowledgeEntryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [entry, setEntry] = useState<KnowledgeEntry | null>(null);
  const [images, setImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadEntry();
    }
  }, [slug]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Load knowledge entry
      const { data: entryData, error: entryError } = await supabase
        .from('knowledge_entries')
        .select('*')
        .eq('slug', slug)
        .single();

      if (entryError) throw entryError;
      if (!entryData) throw new Error('Entry not found');

      setEntry(entryData);

      // If it's an annual report, load associated images
      if (entryData.fiscal_year && entryData.entry_type === 'document') {
        const { data: imageData, error: imageError } = await supabase
          .from('media_files')
          .select('*')
          .contains('tags', ['annual-report'])
          .eq('metadata->>fiscal_year', entryData.fiscal_year)
          .is('deleted_at', null)
          .order('metadata->page_number', { ascending: true });

        if (!imageError && imageData) {
          setImages(imageData);
        }
      }

    } catch (err: any) {
      console.error('Error loading entry:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPdfPath = () => {
    if (!entry?.fiscal_year) return null;
    return `/documents/annual-reports/picc-annual-report-${entry.fiscal_year}.pdf`;
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

  if (error || !entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Entry Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested knowledge entry could not be found.'}</p>
          <Link
            href="/picc/knowledge"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Knowledge Base
          </Link>
        </div>
      </div>
    );
  }

  const isAnnualReport = entry.entry_type === 'document' && entry.slug.includes('annual-report');
  const pdfPath = getPdfPath();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={isAnnualReport ? "/annual-reports" : "/picc/knowledge"}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {isAnnualReport ? 'Back to Timeline' : 'Back to Knowledge Base'}
            </Link>

            {pdfPath && (
              <a
                href={pdfPath}
                download
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {entry.fiscal_year && (
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-bold text-lg mb-4">
              {entry.fiscal_year}
            </div>
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {entry.title}
          </h1>

          {entry.subtitle && (
            <p className="text-xl text-gray-600 mb-6">
              {entry.subtitle}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {entry.entry_type}
            </div>
            {entry.category && (
              <div className="flex items-center gap-2">
                <span>•</span>
                {entry.category}
              </div>
            )}
            {images.length > 0 && (
              <div className="flex items-center gap-2">
                <span>•</span>
                <ImageIcon className="w-4 h-4" />
                {images.length} images
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {entry.summary && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              {entry.summary}
            </div>
          </div>
        )}

        {/* Images Gallery */}
        {images.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-6 h-6" />
                Report Images ({images.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div
                  key={img.id || idx}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 hover:shadow-xl transition-all group cursor-pointer"
                >
                  <img
                    src={img.public_url}
                    alt={img.alt_text || `Page ${img.metadata?.page_number || idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-3 text-white text-sm">
                      <p className="font-semibold">
                        Page {img.metadata?.page_number || idx + 1}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Content */}
        {entry.content && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Full Content</h2>
            <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
              {entry.content}
            </div>
          </div>
        )}

        {/* Structured Data (if available) */}
        {entry.structured_data && Object.keys(entry.structured_data).length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(entry.structured_data).map(([key, value]) => (
                <div key={key} className="border-l-4 border-blue-500 pl-4">
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-gray-900">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
