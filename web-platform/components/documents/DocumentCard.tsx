'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Image as ImageIcon, File, Download, Eye, Calendar, Tag, User } from 'lucide-react';

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

interface DocumentCardProps {
  document: Document;
  onView: (doc: Document) => void;
  viewMode?: 'grid' | 'list';
}

export default function DocumentCard({ document, onView, viewMode = 'grid' }: DocumentCardProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType === 'image' || fileType.startsWith('image/')) {
      return <ImageIcon className="w-12 h-12 text-ocean-medium" />;
    }
    if (fileType === 'pdf' || fileType.includes('pdf')) {
      return <FileText className="w-12 h-12 text-coral-warm" />;
    }
    return <File className="w-12 h-12 text-earth-medium" />;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      report: 'Report',
      photo: 'Photo',
      historical: 'Historical',
      meeting_minutes: 'Meeting Minutes',
      news: 'News',
      policy: 'Policy',
      other: 'Other'
    };
    return labels[category] || category;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="card-modern p-4 hover:shadow-lg transition-all">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            {getFileIcon(document.file_type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-ocean-deep mb-1 truncate">
              {document.title}
            </h3>
            {document.description && (
              <p className="text-sm text-earth-medium mb-2 line-clamp-1">
                {document.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-earth-medium">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {getCategoryLabel(document.category)}
              </span>
              {document.author && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {document.author}
                </span>
              )}
              {document.document_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(document.document_date)}
                </span>
              )}
              {document.file_size && (
                <span>{formatFileSize(document.file_size)}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(document)}
              className="p-2 hover:bg-ocean-light/20 rounded-lg transition-all"
              title="View"
            >
              <Eye className="w-5 h-5 text-ocean-medium" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={() => onView(document)}
      className="card-modern p-6 cursor-pointer hover:shadow-xl transition-all group"
    >
      {/* Icon/Preview */}
      <div className="mb-4 flex justify-center">
        <div className="w-24 h-24 bg-earth-bg rounded-lg flex items-center justify-center group-hover:bg-ocean-light/20 transition-all">
          {getFileIcon(document.file_type)}
        </div>
      </div>

      {/* Category Badge */}
      <div className="mb-3">
        <span className="inline-block px-3 py-1 bg-coral-warm/10 text-coral-warm text-xs font-medium rounded-full">
          {getCategoryLabel(document.category)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-ocean-deep mb-2 line-clamp-2 group-hover:text-coral-warm transition-colors">
        {document.title}
      </h3>

      {/* Description */}
      {document.description && (
        <p className="text-sm text-earth-medium mb-4 line-clamp-2">
          {document.description}
        </p>
      )}

      {/* Metadata */}
      <div className="space-y-2 text-xs text-earth-medium border-t border-earth-light pt-3">
        {document.author && (
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span className="truncate">{document.author}</span>
          </div>
        )}
        {document.document_date && (
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(document.document_date)}</span>
          </div>
        )}
        {document.file_size && (
          <div className="text-xs">
            {formatFileSize(document.file_size)}
          </div>
        )}
      </div>

      {/* Tags */}
      {document.tags && document.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {document.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 bg-earth-bg text-earth-dark text-xs rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
