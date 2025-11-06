'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image as ImageIcon, File, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DocumentFile {
  file: File;
  preview?: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  progress: number;
  metadata: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    document_date: string;
    author: string;
    access_level: 'public' | 'members' | 'admin';
  };
}

export default function DocumentUpload({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploading: false,
      uploaded: false,
      progress: 0,
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        description: '',
        category: 'other',
        tags: [],
        document_date: new Date().toISOString().split('T')[0],
        author: '',
        access_level: 'public' as const
      }
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/*': ['.txt', '.md']
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateMetadata = (index: number, field: string, value: any) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = {
        ...newFiles[index],
        metadata: {
          ...newFiles[index].metadata,
          [field]: value
        }
      };
      return newFiles;
    });
  };

  const uploadFile = async (index: number) => {
    const docFile = files[index];
    const supabase = createClient();

    try {
      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = { ...newFiles[index], uploading: true, error: undefined };
        return newFiles;
      });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}_${docFile.file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('community-documents')
        .upload(fileName, docFile.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get file type
      const fileType = docFile.file.type.split('/')[0] || 'other';
      const mimeType = docFile.file.type;

      // Insert document metadata into database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          title: docFile.metadata.title,
          description: docFile.metadata.description || null,
          file_path: uploadData.path,
          file_name: docFile.file.name,
          file_type: fileType,
          file_size: docFile.file.size,
          mime_type: mimeType,
          category: docFile.metadata.category,
          tags: docFile.metadata.tags.length > 0 ? docFile.metadata.tags : null,
          document_date: docFile.metadata.document_date || null,
          author: docFile.metadata.author || null,
          access_level: docFile.metadata.access_level,
          uploaded_by: user?.id
        });

      if (dbError) throw dbError;

      // Mark as uploaded
      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = { ...newFiles[index], uploading: false, uploaded: true, progress: 100 };
        return newFiles;
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = {
          ...newFiles[index],
          uploading: false,
          error: error.message || 'Upload failed'
        };
        return newFiles;
      });
    }
  };

  const uploadAll = async () => {
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      if (!files[i].uploaded && !files[i].uploading) {
        await uploadFile(i);
      }
    }

    setUploading(false);

    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image')) return <ImageIcon className="w-8 h-8" />;
    if (fileType.includes('pdf')) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-coral-warm bg-coral-warm/10'
            : 'border-earth-light hover:border-ocean-medium bg-white'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-16 h-16 mx-auto mb-4 text-ocean-medium" />
        {isDragActive ? (
          <p className="text-lg text-coral-warm font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-lg text-ocean-deep font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-earth-medium">
              Supports: PDF, Images, Word documents, Text files
            </p>
          </>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-ocean-deep">
              Files to Upload ({files.length})
            </h3>
            <button
              onClick={uploadAll}
              disabled={uploading || files.every(f => f.uploaded)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>

          {files.map((docFile, index) => (
            <div key={index} className="card-modern p-6">
              <div className="flex items-start gap-4">
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {docFile.preview ? (
                    <img
                      src={docFile.preview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-earth-bg rounded-lg flex items-center justify-center text-ocean-medium">
                      {getFileIcon(docFile.file.type)}
                    </div>
                  )}
                </div>

                {/* File Info & Metadata */}
                <div className="flex-1 space-y-4">
                  {/* File Name & Size */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-ocean-deep">{docFile.file.name}</p>
                      <p className="text-sm text-earth-medium">
                        {(docFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {docFile.uploaded && (
                        <CheckCircle className="w-5 h-5 text-success" />
                      )}
                      {docFile.error && (
                        <AlertCircle className="w-5 h-5 text-error" />
                      )}
                      {!docFile.uploaded && (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-earth-bg rounded"
                          disabled={docFile.uploading}
                        >
                          <X className="w-5 h-5 text-earth-medium" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {docFile.error && (
                    <div className="bg-error/10 border border-error rounded-lg p-3">
                      <p className="text-sm text-error">{docFile.error}</p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {docFile.uploading && (
                    <div className="w-full bg-earth-bg rounded-full h-2">
                      <div
                        className="bg-ocean-medium h-2 rounded-full transition-all"
                        style={{ width: `${docFile.progress}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Metadata Form */}
                  {!docFile.uploaded && !docFile.uploading && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-earth-dark mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={docFile.metadata.title}
                          onChange={(e) => updateMetadata(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-earth-light rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-medium"
                          placeholder="Document title"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-earth-dark mb-1">
                          Category *
                        </label>
                        <select
                          value={docFile.metadata.category}
                          onChange={(e) => updateMetadata(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-earth-light rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-medium"
                        >
                          <option value="other">Other</option>
                          <option value="report">Report</option>
                          <option value="photo">Photo</option>
                          <option value="historical">Historical</option>
                          <option value="meeting_minutes">Meeting Minutes</option>
                          <option value="news">News</option>
                          <option value="policy">Policy</option>
                        </select>
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-earth-dark mb-1">
                          Description
                        </label>
                        <textarea
                          value={docFile.metadata.description}
                          onChange={(e) => updateMetadata(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-earth-light rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-medium"
                          rows={2}
                          placeholder="Brief description of the document"
                        />
                      </div>

                      {/* Author */}
                      <div>
                        <label className="block text-sm font-medium text-earth-dark mb-1">
                          Author
                        </label>
                        <input
                          type="text"
                          value={docFile.metadata.author}
                          onChange={(e) => updateMetadata(index, 'author', e.target.value)}
                          className="w-full px-3 py-2 border border-earth-light rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-medium"
                          placeholder="Document author"
                        />
                      </div>

                      {/* Document Date */}
                      <div>
                        <label className="block text-sm font-medium text-earth-dark mb-1">
                          Document Date
                        </label>
                        <input
                          type="date"
                          value={docFile.metadata.document_date}
                          onChange={(e) => updateMetadata(index, 'document_date', e.target.value)}
                          className="w-full px-3 py-2 border border-earth-light rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-medium"
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-earth-dark mb-1">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={docFile.metadata.tags.join(', ')}
                          onChange={(e) =>
                            updateMetadata(
                              index,
                              'tags',
                              e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                            )
                          }
                          className="w-full px-3 py-2 border border-earth-light rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-medium"
                          placeholder="housing, community, health"
                        />
                      </div>

                      {/* Access Level */}
                      <div>
                        <label className="block text-sm font-medium text-earth-dark mb-1">
                          Access Level
                        </label>
                        <select
                          value={docFile.metadata.access_level}
                          onChange={(e) => updateMetadata(index, 'access_level', e.target.value)}
                          className="w-full px-3 py-2 border border-earth-light rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-medium"
                        >
                          <option value="public">Public</option>
                          <option value="members">Members Only</option>
                          <option value="admin">Admin Only</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {docFile.uploaded && (
                    <div className="bg-success/10 border border-success rounded-lg p-3">
                      <p className="text-sm text-success font-medium">
                        ✓ Uploaded successfully!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
