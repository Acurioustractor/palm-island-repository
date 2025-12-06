'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

interface ImageAnalysis {
  description: string;
  altText: string;
  tags: string[];
  culturalElements: {
    found: boolean;
    elements: string[];
    significance: string;
  };
}

interface SmartImageUploadProps {
  onUpload: (file: File, analysis: ImageAnalysis) => void;
  onError?: (error: string) => void;
  className?: string;
  maxSizeMB?: number;
}

export default function SmartImageUpload({
  onUpload,
  onError,
  className = '',
  maxSizeMB = 10
}: SmartImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const analyzeImage = useCallback(async (imageFile: File) => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('action', 'analyze');
      formData.append('options', JSON.stringify({
        generateAltText: true,
        detectCulturalContent: true,
        detailed: true
      }));

      const response = await fetch('/api/ai/vision', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const result: ImageAnalysis = {
        description: data.result.description || '',
        altText: data.result.altText || data.result.accessibility?.altText || '',
        tags: data.result.tags || [],
        culturalElements: data.result.culturalElements || {
          found: false,
          elements: [],
          significance: ''
        }
      };

      setAnalysis(result);
      return result;
    } catch (error: any) {
      onError?.(error.message || 'Failed to analyze image');
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [onError]);

  const handleFile = useCallback(async (selectedFile: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      onError?.('Please upload a JPEG, PNG, GIF, or WebP image');
      return;
    }

    // Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      onError?.(`Image must be smaller than ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);

    // Analyze with AI
    const result = await analyzeImage(selectedFile);
    if (result) {
      onUpload(selectedFile, result);
    }
  }, [analyzeImage, maxSizeMB, onError, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, [handleFile]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setAnalysis(null);
  };

  return (
    <div className={className}>
      {!file ? (
        // Upload area
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
            ${dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }
          `}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Drop an image here or click to upload</p>
              <p className="text-sm text-gray-500 mt-1">
                JPEG, PNG, GIF, or WebP up to {maxSizeMB}MB
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-indigo-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI will auto-analyze for alt text and cultural content
            </div>
          </div>
        </div>
      ) : (
        // Preview and analysis
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Image preview */}
          <div className="relative aspect-video bg-gray-100">
            {preview && (
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
              />
            )}
            {analyzing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p>Analyzing image with AI...</p>
                </div>
              </div>
            )}
          </div>

          {/* Analysis results */}
          {analysis && (
            <div className="p-4 space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-900">{analysis.description}</p>
              </div>

              {/* Alt text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text (auto-generated)
                </label>
                <input
                  type="text"
                  value={analysis.altText}
                  onChange={(e) => setAnalysis({ ...analysis, altText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {analysis.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cultural content warning */}
              {analysis.culturalElements.found && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-medium text-amber-800">Cultural Content Detected</p>
                      <p className="text-sm text-amber-700 mt-1">
                        {analysis.culturalElements.significance || 'This image may contain Indigenous cultural elements.'}
                      </p>
                      <ul className="mt-2 text-sm text-amber-700">
                        {analysis.culturalElements.elements.map((el, i) => (
                          <li key={i}>• {el}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={reset}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Choose Different Image
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
