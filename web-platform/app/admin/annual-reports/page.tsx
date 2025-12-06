'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Upload, Sparkles, ArrowLeft } from 'lucide-react';
import SmartPDFUpload from '@/components/media/SmartPDFUpload';

interface ProcessedReport {
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

export default function AdminAnnualReports() {
  const [processedReports, setProcessedReports] = useState<ProcessedReport[]>([]);

  const handleUpload = (file: File, analysis: ProcessedReport) => {
    console.log('Processed report:', file.name, analysis);
    setProcessedReports(prev => [analysis, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="text-sm mb-2">
            <Link href="/admin" className="text-indigo-600 hover:underline">
              Admin
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600">Annual Reports</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Annual Reports Manager
              </h1>
              <p className="text-gray-600 mt-1">
                Upload and process annual reports with AI analysis
              </p>
            </div>
            <Link
              href="/admin/ai"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              AI Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Smart PDF Upload
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Upload an annual report PDF and AI will automatically extract:
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Executive summary</li>
                <li>• Key topics and themes</li>
                <li>• People, places, and programs mentioned</li>
                <li>• Statistics and metrics</li>
              </ul>

              <SmartPDFUpload
                onUpload={handleUpload}
                onError={(error) => alert(error)}
              />
            </div>
          </div>

          {/* Processed Reports */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recently Processed
            </h2>

            {processedReports.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No reports processed yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Upload a PDF to see AI analysis
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {processedReports.map((report, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-500">Year: {report.year}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Processed
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {report.summary}
                    </p>

                    {report.keyTopics.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Key Topics:</p>
                        <div className="flex flex-wrap gap-1">
                          {report.keyTopics.slice(0, 5).map((topic, i) => (
                            <span
                              key={i}
                              className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">People</p>
                        <p className="font-medium text-gray-900">
                          {report.entities.people.length}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Programs</p>
                        <p className="font-medium text-gray-900">
                          {report.entities.programs.length}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Pages</p>
                        <p className="font-medium text-gray-900">{report.pageCount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
