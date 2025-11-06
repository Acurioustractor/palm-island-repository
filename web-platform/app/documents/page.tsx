'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DocumentCard from '@/components/documents/DocumentCard';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, Grid, List, Upload, FileText, Image as ImageIcon, File, Calendar } from 'lucide-react';
import Link from 'next/link';

// Dynamically import DocumentViewer to avoid SSR issues with react-pdf
const DocumentViewer = dynamic(
  () => import('@/components/documents/DocumentViewer'),
  { ssr: false }
);

interface Document {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  category: string;
  tags?: string[];
  author?: string;
  document_date?: string;
  created_at: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string>('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, selectedCategory, searchQuery]);

  const fetchDocuments = async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.author?.toLowerCase().includes(query) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleViewDocument = async (document: Document) => {
    try {
      const supabase = createClient();

      // Get public URL for the document
      const { data } = supabase.storage
        .from('community-documents')
        .getPublicUrl(document.file_path);

      setDocumentUrl(data.publicUrl);
      setViewingDocument(document);

      // Record view
      await supabase.rpc('record_document_view', {
        p_document_id: document.id,
        p_viewer_id: (await supabase.auth.getUser()).data.user?.id || null
      });
    } catch (error) {
      console.error('Error opening document:', error);
    }
  };

  const getCategoryCount = (category: string) => {
    if (category === 'all') return documents.length;
    return documents.filter(doc => doc.category === category).length;
  };

  const categories = [
    { value: 'all', label: 'All Documents', icon: FileText },
    { value: 'report', label: 'Reports', icon: FileText },
    { value: 'photo', label: 'Photos', icon: ImageIcon },
    { value: 'historical', label: 'Historical', icon: File },
    { value: 'meeting_minutes', label: 'Meeting Minutes', icon: FileText },
    { value: 'news', label: 'News', icon: FileText },
    { value: 'policy', label: 'Policy', icon: FileText },
    { value: 'other', label: 'Other', icon: File }
  ];

  if (loading) {
    return (
      
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coral-warm mx-auto mb-4"></div>
            <p className="text-xl text-earth-dark">Loading documents...</p>
          </div>
        </div>
      
    );
  }

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-ocean-deep to-ocean-medium text-white py-12">
          <div className="max-w-7xl mx-auto px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Community Documents
            </h1>
            <p className="text-xl text-white/90 max-w-3xl">
              Browse our collection of reports, photos, historical documents, and community records
            </p>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-earth-medium" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-earth-light rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-medium"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-ocean-medium text-white'
                      : 'bg-earth-bg text-earth-medium hover:bg-earth-light'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-ocean-medium text-white'
                      : 'bg-earth-bg text-earth-medium hover:bg-earth-light'
                  }`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Button (Admin only - could add permission check) */}
              <Link
                href="/documents/upload"
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <Upload className="w-5 h-5" />
                Upload
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="card-modern p-6 sticky top-8">
                <h3 className="text-lg font-bold text-ocean-deep mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h3>

                {/* Category Filters */}
                <div className="space-y-2">
                  {categories.map(({ value, label, icon: Icon }) => {
                    const count = getCategoryCount(value);
                    return (
                      <button
                        key={value}
                        onClick={() => setSelectedCategory(value)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                          selectedCategory === value
                            ? 'bg-coral-warm text-white'
                            : 'hover:bg-earth-bg text-earth-dark'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {label}
                        </span>
                        <span className={`text-sm ${
                          selectedCategory === value ? 'text-white' : 'text-earth-medium'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Documents Grid/List */}
            <main className="flex-1">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-ocean-deep">
                  {selectedCategory === 'all' ? 'All Documents' : categories.find(c => c.value === selectedCategory)?.label}
                  <span className="text-earth-medium ml-2">({filteredDocuments.length})</span>
                </h2>
              </div>

              {filteredDocuments.length === 0 ? (
                <div className="card-modern p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-earth-medium" />
                  <p className="text-earth-medium text-lg">
                    {searchQuery
                      ? 'No documents match your search'
                      : 'No documents in this category yet'}
                  </p>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid'
                    ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {filteredDocuments.map(document => (
                    <DocumentCard
                      key={document.id}
                      document={document}
                      onView={handleViewDocument}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && documentUrl && (
        <DocumentViewer
          fileUrl={documentUrl}
          fileName={viewingDocument.file_name}
          onClose={() => {
            setViewingDocument(null);
            setDocumentUrl('');
          }}
        />
      )}
    </>
  );
}
