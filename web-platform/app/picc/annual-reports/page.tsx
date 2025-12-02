'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText, Plus, Calendar, Eye, Edit, Download, Trash2,
  Loader2, BookOpen, BarChart3, Users, Star, Clock,
  CheckCircle, AlertCircle, Sparkles, ArrowRight, RefreshCw,
  MessageSquareQuote, Globe, Share2
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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load reports and stories in parallel using API routes
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
        // Map stories to report-ready format
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
        setReadyStories(stories.slice(0, 20)); // Limit to recent 20
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
      drafting: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      under_review: 'bg-blue-100 text-blue-800 border-blue-200',
      review: 'bg-blue-100 text-blue-800 border-blue-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      published: 'bg-purple-100 text-purple-800 border-purple-200',
      archived: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return styles[status] || styles.drafting;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4" />;
      case 'approved':
        return <Star className="w-4 h-4" />;
      case 'under_review':
      case 'review':
        return <Eye className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const currentFiscalYear = new Date().getMonth() >= 6
    ? new Date().getFullYear()
    : new Date().getFullYear() - 1;

  // Calculate stats
  const reportWorthyCount = readyStories.filter(s => s.report_worthy || s.auto_include).length;
  const elderStoryCount = readyStories.filter(s => s.is_elder).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                Annual Reports
              </h1>
              <p className="text-gray-600 mt-2">
                Create, manage, and export annual impact reports using the Living Ledger system
              </p>
            </div>
            <Link
              href="/picc/report-generator"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Create New Report
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error Loading Data</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
                  <div className="text-sm text-gray-600">Total Reports</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {reports.filter(r => r.status === 'published').length}
                  </div>
                  <div className="text-sm text-gray-600">Published</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{readyStories.length}</div>
                  <div className="text-sm text-gray-600">Stories Available</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 rounded-lg">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportWorthyCount}
                  </div>
                  <div className="text-sm text-gray-600">Report-Worthy</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Reports List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'reports'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" />
                      All Reports
                      {reports.length > 0 && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {reports.length}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('stories')}
                    className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'stories'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Report-Ready Stories
                      {readyStories.length > 0 && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {readyStories.length}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Refresh Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                    <p className="text-gray-500">Loading data...</p>
                  </div>
                ) : activeTab === 'reports' ? (
                  reports.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-purple-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Create your first annual report using the Living Ledger system to automatically
                        compile community stories into professional impact reports.
                      </p>
                      <Link
                        href="/picc/report-generator"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        <Sparkles className="w-5 h-5" />
                        Create Your First Report
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                  {report.title || `FY${report.report_year} Annual Report`}
                                </h3>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(report.status)}`}>
                                  {getStatusIcon(report.status)}
                                  <span className="capitalize">{report.status?.replace('_', ' ')}</span>
                                </span>
                                {report.theme && (
                                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                                    {report.theme}
                                  </span>
                                )}
                              </div>
                              {report.subtitle && (
                                <p className="text-gray-600 mb-3">{report.subtitle}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <Calendar className="w-4 h-4 text-purple-500" />
                                  FY{report.report_year}
                                </span>
                                {report.statistics?.total_stories !== undefined && (
                                  <span className="flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                    {report.statistics.total_stories} stories
                                  </span>
                                )}
                                {report.statistics?.unique_storytellers !== undefined && (
                                  <span className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-green-500" />
                                    {report.statistics.unique_storytellers} storytellers
                                  </span>
                                )}
                                {report.organizations?.short_name && (
                                  <span className="text-purple-600 font-medium">
                                    {report.organizations.short_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                              <Link
                                href={`/picc/reports/${report.id}`}
                                className="p-2.5 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors"
                                title="View Report"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/picc/report-generator?edit=${report.id}`}
                                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                                title="Edit Report"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
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
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stories Found</h3>
                      <p className="text-gray-600 mb-8">
                        Published stories will appear here for selection in annual reports.
                      </p>
                      <Link
                        href="/picc/create"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        Add a Story
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Elder Stories Summary */}
                      {elderStoryCount > 0 && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-amber-800">
                            <Star className="w-4 h-4" />
                            <span className="font-medium">{elderStoryCount} Elder stories</span>
                            <span className="text-amber-600">- prioritized for reports</span>
                          </div>
                        </div>
                      )}

                      {readyStories.map((story) => (
                        <div
                          key={story.id}
                          className={`border rounded-xl p-4 hover:shadow-sm transition-all ${
                            story.auto_include
                              ? 'border-purple-300 bg-purple-50'
                              : story.report_worthy
                              ? 'border-amber-300 bg-amber-50'
                              : story.is_elder
                              ? 'border-yellow-300 bg-yellow-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <h4 className="font-medium text-gray-900">{story.title}</h4>
                                {story.auto_include && (
                                  <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded-full">
                                    Auto-Include
                                  </span>
                                )}
                                {story.report_worthy && !story.auto_include && (
                                  <span className="px-2 py-0.5 bg-amber-600 text-white text-xs font-medium rounded-full">
                                    Report-Worthy
                                  </span>
                                )}
                                {story.is_elder && (
                                  <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-medium rounded-full">
                                    Elder Story
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="font-medium">{story.storyteller_name}</span>
                                {story.category && (
                                  <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs">
                                    {story.category}
                                  </span>
                                )}
                                <span>{new Date(story.created_at).toLocaleDateString('en-AU')}</span>
                              </div>
                            </div>
                            {story.quality_score > 0 && (
                              <div className="text-right ml-4">
                                <div className={`text-sm font-bold ${
                                  story.quality_score >= 80 ? 'text-green-600' :
                                  story.quality_score >= 60 ? 'text-amber-600' : 'text-gray-500'
                                }`}>
                                  {story.quality_score}%
                                </div>
                                <div className="text-xs text-gray-500">Quality</div>
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

          {/* Right Column - Quick Actions & Help */}
          <div className="space-y-6">
            {/* Report Building Tools */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Building Tools</h2>
              <div className="space-y-3">
                <Link
                  href="/picc/report-generator"
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl transition-all group shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generate Report
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/picc/scraper"
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all group shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquareQuote className="w-5 h-5" />
                    Curated Quotes
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/picc/knowledge"
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Content Sources
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/picc/reports"
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Export & Share
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Living Ledger System
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Collect Stories</div>
                    <div className="text-gray-600">Community stories are collected and tagged throughout the year</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Auto-Curate</div>
                    <div className="text-gray-600">Smart algorithms prioritize Elder stories and high-quality content</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Generate Report</div>
                    <div className="text-gray-600">One-click generation of professional annual reports</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    4
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Export & Share</div>
                    <div className="text-gray-600">Download as PDF or publish as interactive web report</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Fiscal Year */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Current Fiscal Year</h2>
              <p className="text-3xl font-bold text-purple-600 mb-2">FY{currentFiscalYear}-{currentFiscalYear + 1}</p>
              <p className="text-sm text-gray-600">
                July {currentFiscalYear} - June {currentFiscalYear + 1}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href={`/picc/report-generator?year=${currentFiscalYear}`}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 group"
                >
                  Start FY{currentFiscalYear} Report
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
