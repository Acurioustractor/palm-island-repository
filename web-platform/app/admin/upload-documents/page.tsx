'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, File, CheckCircle, Loader, Download } from 'lucide-react';

type DocumentType = 'annual_report' | 'policy' | 'research' | 'other';

export default function UploadDocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [docType, setDocType] = useState<DocumentType>('annual_report');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');

    const supabase = createClient();

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload documents');
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `documents/${year}/${Date.now()}-${title.replace(/[^a-zA-Z0-9]/g, '-')}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Create document entry in database
      // First, let's check if a documents table exists, if not we'll create it via metadata
      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          storyteller_id: user.id,
          title,
          content: description || `${docType.replace('_', ' ')} uploaded for ${year}`,
          media_type: 'document',
          access_level: 'public',
          status: 'published',
          metadata: {
            document_type: docType,
            year,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            file_ext: fileExt,
            uploaded_by: user.email,
            uploaded_at: new Date().toISOString(),
          }
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Uploaded!</h2>
          <p className="text-gray-600 mb-6">
            {title} has been uploaded successfully.
          </p>
          <Link
            href="/admin"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/admin"
            className="inline-flex items-center text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Upload Documents</h1>
          <p className="text-purple-100">
            Upload annual reports, policies, research papers, and historical documents
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Supported File Types</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">PDFs</div>
                  <div className="text-sm text-gray-600">Annual reports, documents</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <File className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Word Docs</div>
                  <div className="text-sm text-gray-600">.doc, .docx files</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">Excel Files</div>
                  <div className="text-sm text-gray-600">.xls, .xlsx spreadsheets</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <File className="w-6 h-6 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900">Text Files</div>
                  <div className="text-sm text-gray-600">.txt, .md, .csv</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleUpload} className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Details</h2>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-all">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.csv"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  required
                />
                {file && (
                  <p className="mt-4 text-sm text-green-600 font-medium">
                    ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 2023 Annual Report"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Document Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="annual_report">Annual Report</option>
                <option value="policy">Policy Document</option>
                <option value="research">Research Paper</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Year */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the document..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || !title || uploading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Document
                </>
              )}
            </button>
          </form>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3">Tips for Uploading</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• Annual reports will be indexed and searchable</li>
              <li>• Use clear, descriptive titles</li>
              <li>• Maximum file size: 20MB</li>
              <li>• Documents are stored securely in Supabase Storage</li>
              <li>• You can set access level (public/private) later</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
