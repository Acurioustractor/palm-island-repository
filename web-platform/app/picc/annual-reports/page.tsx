'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, Calendar, Eye, Edit, Download,
  Loader2, ChevronRight, AlertCircle, RefreshCw,
} from 'lucide-react';

interface AnnualReport {
  id: string;
  title: string;
  subtitle: string;
  report_year: number;
  reporting_period_start: string;
  reporting_period_end: string;
  status: string;
  theme: string;
  template_name: string;
  statistics: any;
  created_at: string;
  updated_at: string;
  organizations?: {
    id: string;
    name: string;
    short_name: string;
  };
}

interface ReportReadyStory {
  id: string;
  title: string;
  storyteller_name: string;
  category: string;
  quality_score: number;
  created_at: string;
  report_worthy: boolean;
  auto_include: boolean;
  is_elder: boolean;
}

export default function AnnualReportsPage() {
  const [reports, setReports] = useState<AnnualReport[]>([]);
  const [readyStories, setReadyStories] = useState<ReportReadyStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'stories'>('reports');
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [reportsRes, storiesRes] = await Promise.all([
        fetch('/api/annual-reports'),
        fetch('/api/stories?status=published')
      ]);

      const reportsData = await reportsRes.json();
      const storiesData = await storiesRes.json();

      if (!reportsRes.ok) {
        console.warn('Reports API error:', reportsData.error);
      } else {
        setReports(reportsData.reports || []);
      }

      if (!storiesRes.ok) {
        console.warn('Stories API error:', storiesData.error);
      } else {
        const stories = (storiesData.stories || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          storyteller_name: s.storyteller_name || 'Community Member',
          category: s.category || 'general',
          quality_score: s.quality_score || 50,
          created_at: s.created_at,
          report_worthy: s.report_worthy || false,
          auto_include: s.auto_include || false,
          is_elder: s.is_elder || false
        }));
        setReadyStories(stories.slice(0, 20));
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      drafting: 'bg-gray-100 text-gray-600',
      under_review: 'bg-gray-100 text-gray-600',
      review: 'bg-gray-100 text-gray-600',
      approved: 'bg-gray-100 text-gray-900',
      published: 'bg-gray-900 text-white',
      archived: 'bg-gray-100 text-gray-500'
    };
    return styles[status] || styles.drafting;
  };

  const currentFiscalYear = new Date().getMonth() >= 6
    ? new Date().getFullYear()
    : new Date().getFullYear() - 1;

  const reportWorthyCount = readyStories.filter(s => s.report_worthy || s.auto_include).length;
  const elderStoryCount = readyStories.filter(s => s.is_elder).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Reports</p>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-4xl font-bold text-gray-900">Annual Reports</h1>
          <Link
            href="/picc/report-generator"
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Report
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Error loading data</p>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Annual Report Workflow */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Annual Report Workflow</p>
        <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
          <Link
            href="/picc/annual-report-data"
            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Current Year Data Entry</p>
              <p className="text-xs text-gray-500 mt-0.5">Enter services, financials, highlights for FY {currentFiscalYear}-{String(currentFiscalYear + 1).slice(2)}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
          <Link
            href="/picc/knowledge/annual-reports"
            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Historical Timeline</p>
              <p className="text-xs text-gray-500 mt-0.5">Browse 18 years of reports (2006-2024) with extracted data</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
          <Link
            href="/picc/report-generator"
            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Generate Report</p>
              <p className="text-xs text-gray-500 mt-0.5">Create PDF reports from collected data</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
          <Link
            href="/picc/projects"
            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Innovation Timeline</p>
              <p className="text-xs text-gray-500 mt-0.5">18-year innovation milestones</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
          <Link
            href="/picc/insights/patterns"
            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Story Analytics</p>
              <p className="text-xs text-gray-500 mt-0.5">Patterns across all stories and years</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
          <Link
            href="/picc/data-intelligence"
            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Data Intelligence</p>
              <p className="text-xs text-gray-500 mt-0.5">Network graph and BI dashboard</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
          <Link
            href="/picc/agents/cmo"
            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">CMO Agent</p>
              <p className="text-xs text-gray-500 mt-0.5">AI marketing intelligence</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div>
          <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total reports</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">
            {reports.filter(r => r.status === 'published').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Published</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{readyStories.length}</p>
          <p className="text-sm text-gray-500 mt-1">Stories available</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{reportWorthyCount}</p>
          <p className="text-sm text-gray-500 mt-1">Report-worthy</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Reports List */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="border border-gray-200 rounded-xl">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'reports'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All Reports
                  {reports.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {reports.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('stories')}
                  className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'stories'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Report-Ready Stories
                  {readyStories.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {readyStories.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Refresh Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : activeTab === 'reports' ? (
                reports.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-lg font-medium text-gray-900 mb-2">No reports yet</p>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                      Create your first annual report to compile community stories into professional impact reports.
                    </p>
                    <Link
                      href="/picc/report-generator"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Your First Report
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-sm font-medium text-gray-900">
                                {report.title || `FY${report.report_year} Annual Report`}
                              </h3>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(report.status)}`}>
                                {report.status?.replace('_', ' ')}
                              </span>
                            </div>
                            {report.subtitle && (
                              <p className="text-xs text-gray-500 mb-2">{report.subtitle}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                FY{report.report_year}
                              </span>
                              {report.statistics?.total_stories !== undefined && (
                                <span>{report.statistics.total_stories} stories</span>
                              )}
                              {report.statistics?.unique_storytellers !== undefined && (
                                <span>{report.statistics.unique_storytellers} storytellers</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                            <Link
                              href={`/picc/reports/${report.id}`}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/picc/report-generator?edit=${report.id}`}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={async () => {
                                setDownloadingPdf(report.id);
                                try {
                                  const res = await fetch(`/api/annual-reports/${report.id}/export-pdf`, { method: 'POST' });
                                  if (!res.ok) throw new Error('PDF generation failed');
                                  const blob = await res.blob();
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `${report.title || 'Annual-Report'}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                } catch (err) {
                                  console.error('PDF download error:', err);
                                  alert('Failed to generate PDF. Please try again.');
                                } finally {
                                  setDownloadingPdf(null);
                                }
                              }}
                              disabled={downloadingPdf === report.id}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Download PDF"
                            >
                              {downloadingPdf === report.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                // Stories Tab
                readyStories.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-lg font-medium text-gray-900 mb-2">No stories found</p>
                    <p className="text-sm text-gray-500 mb-6">
                      Published stories will appear here for selection in annual reports.
                    </p>
                    <Link
                      href="/picc/create"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add a Story
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {elderStoryCount > 0 && (
                      <div className="mb-4 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">{elderStoryCount} Elder stories</span>
                          <span className="text-gray-400"> — prioritized for reports</span>
                        </p>
                      </div>
                    )}

                    {readyStories.map((story) => (
                      <div
                        key={story.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h4 className="text-sm font-medium text-gray-900">{story.title}</h4>
                              {story.auto_include && (
                                <span className="px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full">
                                  Auto-Include
                                </span>
                              )}
                              {story.report_worthy && !story.auto_include && (
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                                  Report-Worthy
                                </span>
                              )}
                              {story.is_elder && (
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                                  Elder Story
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{story.storyteller_name}</span>
                              {story.category && (
                                <span className="capitalize px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs">
                                  {story.category}
                                </span>
                              )}
                              <span>{new Date(story.created_at).toLocaleDateString('en-AU')}</span>
                            </div>
                          </div>
                          {story.quality_score > 0 && (
                            <div className="text-right ml-4">
                              <p className="text-sm font-bold text-gray-900">{story.quality_score}%</p>
                              <p className="text-xs text-gray-400">Quality</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Tools & Info */}
        <div className="space-y-8">
          {/* Report Building Tools */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Tools</p>
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
              <Link
                href="/picc/report-generator"
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <span className="text-sm font-medium text-gray-900">Generate Report</span>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
              <Link
                href="/picc/scraper"
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <span className="text-sm font-medium text-gray-900">Curated Quotes</span>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
              <Link
                href="/picc/knowledge"
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <span className="text-sm font-medium text-gray-900">Content Sources</span>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
              <Link
                href="/picc/reports"
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <span className="text-sm font-medium text-gray-900">Export & Share</span>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Current Fiscal Year */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Current fiscal year</p>
            <div className="border border-gray-200 rounded-xl p-5">
              <p className="text-3xl font-bold text-gray-900">FY{currentFiscalYear}-{String(currentFiscalYear + 1).slice(2)}</p>
              <p className="text-sm text-gray-500 mt-1">
                July {currentFiscalYear} &ndash; June {currentFiscalYear + 1}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  href={`/picc/report-generator?year=${currentFiscalYear}`}
                  className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
                >
                  Start FY{currentFiscalYear} Report &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
