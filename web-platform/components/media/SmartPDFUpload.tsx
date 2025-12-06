'use client';

import { useState, useCallback } from 'react';

interface PDFAnalysis {
  title: string;
  year: string;
  summary: string;
  keyTopics: string[];
  pageCount: number;
  entities: {
    people: string[];
    places: string[];
    programs: string[];
  };
}

interface SmartPDFUploadProps {
  onUpload: (file: File, analysis: PDFAnalysis) => void;
  onError?: (error: string) => void;
  className?: string;
  expectedYear?: string;
}

export default function SmartPDFUpload({
  onUpload,
  onError,
  className = '',
  expectedYear
}: SmartPDFUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PDFAnalysis | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const analyzePDF = useCallback(async (pdfFile: File, year?: string) => {
    setAnalyzing(true);
    setProgress('Uploading PDF...');

    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('action', 'analyze');
      if (year) {
        formData.append('year', year);
      }

      setProgress('Extracting text...');
      const response = await fetch('/api/ai/pdf', {
        method: 'POST',
        body: formData
      });

      setProgress('Analyzing content with AI...');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const result: PDFAnalysis = {
        title: data.result?.title || data.documentInfo?.title || pdfFile.name,
        year: data.result?.year || year || 'Unknown',
        summary: data.result?.summary || '',
        keyTopics: data.result?.keyTopics || [],
        pageCount: data.documentInfo?.pageCount || 0,
        entities: {
          people: data.result?.entities?.people || [],
          places: data.result?.entities?.places || [],
          programs: data.result?.entities?.programs || []
        }
      };

      setAnalysis(result);
      setProgress('');
      return result;
    } catch (error: any) {
      onError?.(error.message || 'Failed to analyze PDF');
      setProgress('');
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [onError]);

  const handleFile = useCallback(async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      onError?.('Please upload a PDF file');
      return;
    }

    // Check file size (max 50MB for PDFs)
    const maxBytes = 50 * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      onError?.('PDF must be smaller than 50MB');
      return;
    }

    setFile(selectedFile);

    // Auto-detect year from filename if not provided
    let year = expectedYear;
    if (!year) {
      const yearMatch = selectedFile.name.match(/(\d{4})/);
      if (yearMatch) {
        year = yearMatch[1];
      }
    }

    const result = await analyzePDF(selectedFile, year);
    if (result) {
      onUpload(selectedFile, result);
    }
  }, [analyzePDF, expectedYear, onError, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const reset = () => {
    setFile(null);
    setAnalysis(null);
    setProgress('');
  };

  return (
    <div className={className}>
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
            ${dragActive
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }
          `}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Drop a PDF here or click to upload</p>
              <p className="text-sm text-gray-500 mt-1">Annual reports, documents up to 50MB</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI will extract and analyze content automatically
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* File info */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          {/* Analysis progress or results */}
          <div className="p-4">
            {analyzing ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{progress || 'Processing...'}</p>
                <p className="text-sm text-gray-500 mt-2">This may take a minute for large documents</p>
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                {/* Title and year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <p className="text-gray-900">{analysis.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <p className="text-gray-900">{analysis.year}</p>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                  <p className="text-gray-700 text-sm leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Key topics */}
                {analysis.keyTopics.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Key Topics</label>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keyTopics.map((topic, i) => (
                        <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted entities */}
                <div className="grid grid-cols-3 gap-4">
                  {analysis.entities.people.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">People</label>
                      <ul className="text-sm text-gray-600">
                        {analysis.entities.people.slice(0, 5).map((p, i) => (
                          <li key={i}>• {p}</li>
                        ))}
                        {analysis.entities.people.length > 5 && (
                          <li className="text-gray-400">+{analysis.entities.people.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {analysis.entities.programs.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Programs</label>
                      <ul className="text-sm text-gray-600">
                        {analysis.entities.programs.slice(0, 5).map((p, i) => (
                          <li key={i}>• {p}</li>
                        ))}
                        {analysis.entities.programs.length > 5 && (
                          <li className="text-gray-400">+{analysis.entities.programs.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {analysis.entities.places.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Places</label>
                      <ul className="text-sm text-gray-600">
                        {analysis.entities.places.slice(0, 5).map((p, i) => (
                          <li key={i}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-gray-200">
                  <button
                    onClick={reset}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Upload Different PDF
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
