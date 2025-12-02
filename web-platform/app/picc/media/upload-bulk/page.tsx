'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Tag, Calendar, FolderOpen, Sparkles, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface UploadFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'skipped';
  error?: string;
  skipReason?: string;
  id: string;
}

export default function BulkUploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Batch tagging state
  const [batchTags, setBatchTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [batchYear, setBatchYear] = useState<number>(new Date().getFullYear());
  const [batchCollection, setBatchCollection] = useState('');
  const [batchDescription, setBatchDescription] = useState('');
  const [enableAI, setEnableAI] = useState(true);

  // Handle file selection
  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadFile[] = Array.from(fileList)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
        id: Math.random().toString(36).substring(7)
      }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Remove file
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Add tag
  const addTag = () => {
    if (newTag && !batchTags.includes(newTag)) {
      setBatchTags([...batchTags, newTag]);
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setBatchTags(batchTags.filter(t => t !== tag));
  };

  // Upload all files
  const uploadAll = async () => {
    if (files.length === 0) return;

    setUploading(true);

    for (const uploadFile of files) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
        ));

        const formData = new FormData();
        formData.append('file', uploadFile.file);
        formData.append('tags', JSON.stringify(batchTags));
        formData.append('year', batchYear.toString());
        formData.append('description', batchDescription);
        formData.append('collection', batchCollection);
        formData.append('enableAI', enableAI.toString());

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(30000), // 30 second timeout for uploads
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            throw new Error(`Upload failed: ${response.status} ${errorText}`);
          }

          // Handle duplicate (409 Conflict)
          if (response.status === 409 && errorData.error === 'duplicate') {
            setFiles(prev => prev.map(f =>
              f.id === uploadFile.id ? {
                ...f,
                status: 'skipped',
                skipReason: errorData.message
              } : f
            ));
            continue;
          }

          throw new Error(errorData.message || `Upload failed: ${response.status}`);
        }

        const data = await response.json();

        // Update status to success
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? { ...f, status: 'success' } : f
        ));

      } catch (error: any) {
        // Update status to error
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? { ...f, status: 'error', error: error.message } : f
        ));
      }
    }

    setUploading(false);
  };

  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const skippedCount = files.filter(f => f.status === 'skipped').length;
  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Upload className="w-8 h-8 text-blue-600" />
              Bulk Photo Upload
            </h1>
            <p className="text-gray-600 mt-2">
              Upload hundreds of photos at once with batch tagging and AI analysis
            </p>
          </div>
          <Link
            href="/picc/media"
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Back to Media
          </Link>
        </div>

        {/* Progress Stats */}
        {files.length > 0 && (
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">{files.length}</div>
              <div className="text-sm text-gray-600">Total Photos</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-gray-600">Uploaded</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-amber-600">{skippedCount}</div>
              <div className="text-sm text-gray-600">Skipped</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Upload Zone */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400'
            }`}
          >
            <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop photos here or click to browse
            </h3>
            <p className="text-gray-600 mb-4">
              Upload hundreds of photos at once. JPG, PNG, WebP supported.
            </p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
              <Upload className="w-5 h-5" />
              Choose Photos
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>

          {/* Photo Grid */}
          {files.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Selected Photos ({files.length})
              </h3>
              <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {files.map((uploadFile) => (
                  <div key={uploadFile.id} className="relative group">
                    <img
                      src={uploadFile.preview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {uploadFile.status === 'success' && (
                      <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                    )}
                    {uploadFile.status === 'skipped' && (
                      <div className="absolute inset-0 bg-amber-500/20 rounded-lg flex items-center justify-center" title={uploadFile.skipReason}>
                        <AlertCircle className="w-8 h-8 text-amber-600" />
                      </div>
                    )}
                    {uploadFile.status === 'error' && (
                      <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center" title={uploadFile.error}>
                        <AlertCircle className="w-8 h-8 text-red-600" />
                      </div>
                    )}
                    {uploadFile.status === 'uploading' && (
                      <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Batch Settings */}
        <div className="space-y-6">
          {/* Batch Tags */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Batch Tags</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Add tags that will be applied to all photos
            </p>

            {/* Tag Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {/* Current Tags */}
            <div className="flex flex-wrap gap-2">
              {batchTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Annual Report Year */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Annual Report Year</h3>
            </div>
            <select
              value={batchYear}
              onChange={(e) => setBatchYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Collection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Collection</h3>
            </div>
            <input
              type="text"
              value={batchCollection}
              onChange={(e) => setBatchCollection(e.target.value)}
              placeholder="e.g., Community Events 2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Batch Description</h3>
            <textarea
              value={batchDescription}
              onChange={(e) => setBatchDescription(e.target.value)}
              rows={3}
              placeholder="Description for all photos..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* AI Analysis */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">AI Analysis</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAI}
                  onChange={(e) => setEnableAI(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600">
              Auto-detect objects, scenes, and suggest additional tags
            </p>
          </div>

          {/* Upload Button */}
          <button
            onClick={uploadAll}
            disabled={files.length === 0 || uploading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Uploading... ({successCount}/{files.length})
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload All Photos
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
