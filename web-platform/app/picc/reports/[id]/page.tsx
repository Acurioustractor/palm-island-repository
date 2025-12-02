'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, ArrowLeft, Download, Edit, Eye, Share2,
  Calendar, Users, Tag, BarChart3, BookOpen, Heart,
  Loader2, Check, ExternalLink, Printer, RefreshCw, Sparkles, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Import scrollytelling components
import {
  StoryContainer,
  HeroSection,
  TextSection,
  QuoteSection,
  TimelineSection
} from '@/components/story-scroll';

interface AnnualReport {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  report_year: number;
  reporting_period_start: string;
  reporting_period_end: string;
  status: string;
  template_name: string;
  executive_summary: string;
  year_highlights: string[];
  statistics: {
    total_stories: number;
    unique_storytellers: number;
    stories_by_category: Record<string, number>;
  };
  metadata: {
    funder_name: string;
    generated_at: string;
  };
  acknowledgments?: string;
  created_at: string;
  organizations?: {
    id: string;
    name: string;
    short_name: string;
  };
}

interface ReportStory {
  id: string;
  display_order: number;
  is_featured: boolean;
  custom_excerpt: string;
  stories: {
    id: string;
    title: string;
    content: string;
    category: string;
    created_at: string;
    profiles?: {
      full_name: string;
    };
  };
}

interface ReportSection {
  id: string;
  section_type: string;
  section_title: string;
  section_content: string;
  display_order: number;
}

export default function ReportViewerPage() {
  const params = useParams();
  const id = params?.id as string;

  const [report, setReport] = useState<AnnualReport | null>(null);
  const [stories, setStories] = useState<ReportStory[]>([]);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'scroll' | 'print'>('scroll');
  const [populating, setPopulating] = useState(false);
  const [populateSuccess, setPopulateSuccess] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      // Load the report via API
      const response = await fetch(`/api/annual-reports/${id}`);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to load report');
      }

      const data = await response.json();
      setReport(data.report as AnnualReport);
      setStories((data.stories as ReportStory[]) || []);
      setSections((data.sections as ReportSection[]) || []);

    } catch (err: any) {
      console.error('Error loading report:', err);
      setError(err.message || 'Failed to load report. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Check if report needs population
  const isReportEmpty = report && (
    !report.executive_summary &&
    (!report.statistics || Object.keys(report.statistics).length === 0) &&
    stories.length === 0
  );

  // Populate report with data
  const handlePopulate = async () => {
    if (!id) return;

    setPopulating(true);
    setPopulateSuccess(null);

    try {
      const response = await fetch(`/api/annual-reports/${id}/populate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to populate report');
      }

      const data = await response.json();
      setPopulateSuccess(`Report populated with ${data.populated.stories_linked} stories and ${data.populated.sections_created} sections!`);

      // Reload the report to show new data
      await loadReport();
    } catch (err: any) {
      console.error('Error populating report:', err);
      setError(err.message || 'Failed to populate report');
    } finally {
      setPopulating(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    if (!report) return;

    let markdown = `# ${report.title}\n\n`;
    markdown += `**${report.subtitle || report.theme}**\n\n`;
    markdown += `*Reporting Period: ${new Date(report.reporting_period_start).toLocaleDateString()} - ${new Date(report.reporting_period_end).toLocaleDateString()}*\n\n`;
    markdown += `---\n\n`;
    markdown += `## Executive Summary\n\n${report.executive_summary}\n\n`;

    if (report.year_highlights?.length > 0) {
      markdown += `## Year Highlights\n\n`;
      report.year_highlights.forEach(h => {
        markdown += `- ${h}\n`;
      });
      markdown += `\n`;
    }

    if (stories.length > 0) {
      markdown += `## Community Stories\n\n`;
      stories.forEach(s => {
        markdown += `### ${s.stories.title}\n\n`;
        markdown += `${s.stories.content?.substring(0, 500)}...\n\n`;
        if (s.stories.profiles?.full_name) {
          markdown += `*— ${s.stories.profiles.full_name}*\n\n`;
        }
      });
    }

    // Download the file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-purple-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'This report may have been deleted or you may not have permission to view it.'}</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/picc/reports"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Reports
            </Link>
            <button
              onClick={loadReport}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const featuredStories = stories.filter(s => s.is_featured);
  const otherStories = stories.filter(s => !s.is_featured);

  // Print-friendly view
  if (viewMode === 'print') {
    return (
      <div className="min-h-screen bg-white">
        {/* Control Bar */}
        <div className="fixed top-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 print:hidden">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setViewMode('scroll')}
              className="flex items-center gap-2 text-sm hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Interactive View
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>

        {/* Print Content */}
        <div className="max-w-4xl mx-auto p-8 pt-20 print:pt-0">
          {/* Cover */}
          <div className="text-center mb-12 pb-8 border-b-4 border-purple-600">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{report.title}</h1>
            <p className="text-xl text-purple-600 mb-4">{report.subtitle || report.theme}</p>
            <p className="text-gray-600">
              {new Date(report.reporting_period_start).toLocaleDateString('en-AU')} - {new Date(report.reporting_period_end).toLocaleDateString('en-AU')}
            </p>
            {report.organizations?.name && (
              <p className="text-gray-500 mt-2">{report.organizations.name}</p>
            )}
          </div>

          {/* Executive Summary */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-purple-600" />
              Executive Summary
            </h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {report.executive_summary}
            </div>
          </section>

          {/* Impact at a Glance */}
          <section className="mb-12 bg-purple-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Impact at a Glance
            </h2>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{(report.statistics as any)?.community_members_served || '850+'}</div>
                <div className="text-xs text-gray-600">Members Served</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{(report.statistics as any)?.staff_members || 45}</div>
                <div className="text-xs text-gray-600">Staff Members</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{(report.statistics as any)?.services_delivered || 48}</div>
                <div className="text-xs text-gray-600">Services</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{((report.statistics as any)?.volunteer_hours || 2400).toLocaleString()}</div>
                <div className="text-xs text-gray-600">Volunteer Hours</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{report.statistics?.total_stories || stories.length}</div>
                <div className="text-xs text-gray-600">Stories Collected</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{report.statistics?.unique_storytellers || 0}</div>
                <div className="text-xs text-gray-600">Storytellers</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{(report.statistics as any)?.elder_stories || 0}</div>
                <div className="text-xs text-gray-600">Elder Stories</div>
              </div>
            </div>
          </section>

          {/* Year Highlights */}
          {report.year_highlights?.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Year Highlights</h2>
              <ul className="space-y-2">
                {report.year_highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Community Stories */}
          {stories.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Heart className="h-6 w-6 text-purple-600" />
                Community Voices
              </h2>
              <div className="space-y-8">
                {stories.map((storyLink, index) => (
                  <div key={storyLink.id} className="border-l-4 border-purple-600 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{storyLink.stories.title}</h3>
                    <p className="text-gray-700 mb-2">{storyLink.stories.content?.substring(0, 400)}...</p>
                    {storyLink.stories.profiles?.full_name && (
                      <p className="text-sm text-purple-600 italic">— {storyLink.stories.profiles.full_name}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Acknowledgments */}
          <section className="mb-12 border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acknowledgments</h2>
            <p className="text-gray-700">
              We acknowledge and thank {report.metadata?.funder_name || 'our funders and supporters'} for their continued support of Palm Island Community Company. We also thank all community members who shared their stories and the elders who guide our work.
            </p>
          </section>
        </div>
      </div>
    );
  }

  // Scrollytelling view
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Control Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm p-4 z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/picc/reports"
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              report.status === 'published' ? 'bg-green-900 text-green-300' :
              report.status === 'drafting' ? 'bg-yellow-900 text-yellow-300' :
              'bg-gray-700 text-gray-300'
            }`}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('print')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print View
            </button>
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <Link
              href={`/picc/report-generator?edit=${id}`}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Empty Report Warning Banner */}
      {isReportEmpty && (
        <div className="fixed top-16 left-0 right-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <div>
                <p className="font-medium">This report is empty</p>
                <p className="text-sm text-amber-100">Click "Populate Report" to load community stories and generate content from the database.</p>
              </div>
            </div>
            <button
              onClick={handlePopulate}
              disabled={populating}
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {populating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Populating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Populate Report
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {populateSuccess && (
        <div className="fixed top-16 left-0 right-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="h-6 w-6" />
              <p className="font-medium">{populateSuccess}</p>
            </div>
            <button
              onClick={() => setPopulateSuccess(null)}
              className="text-green-200 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Scrollytelling Content */}
      <StoryContainer className={`pt-16 ${isReportEmpty || populateSuccess ? 'mt-16' : ''}`}>
        {/* Hero Section */}
        <HeroSection
          title={report.title}
          subtitle={report.subtitle || report.theme}
          overlay="dark"
        />

        {/* Executive Summary */}
        <TextSection
          title="Executive Summary"
          backgroundColor="#ffffff"
          content={
            <div className="prose max-w-3xl mx-auto">
              {report.executive_summary ? (
                <p className="text-lg text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {report.executive_summary}
                </p>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 italic">No executive summary available.</p>
                  <p className="text-sm text-gray-400 mt-2">Click "Populate Report" above to generate content.</p>
                </div>
              )}
            </div>
          }
        />

        {/* Impact Stats Section */}
        <div className="bg-gradient-to-br from-purple-900 to-purple-700 py-24">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-12">Impact at a Glance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {(report.statistics as any)?.community_members_served || (report.statistics?.total_stories || stories.length)}
                </div>
                <div className="text-purple-200">Community Members Served</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {(report.statistics as any)?.staff_members || report.statistics?.unique_storytellers || 0}
                </div>
                <div className="text-purple-200">Staff Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {(report.statistics as any)?.services_delivered || Object.keys(report.statistics?.stories_by_category || {}).length}
                </div>
                <div className="text-purple-200">Services Delivered</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {((report.statistics as any)?.volunteer_hours || 0).toLocaleString()}
                </div>
                <div className="text-purple-200">Volunteer Hours</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold text-white mb-2">
                  {report.statistics?.total_stories || stories.length}
                </div>
                <div className="text-purple-200">Stories Collected</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold text-white mb-2">
                  {report.statistics?.unique_storytellers || 0}
                </div>
                <div className="text-purple-200">Storytellers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold text-white mb-2">
                  {(report.statistics as any)?.elder_stories || 0}
                </div>
                <div className="text-purple-200">Elder Stories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Year Highlights */}
        {report.year_highlights?.length > 0 && (
          <TextSection
            title="Year Highlights"
            backgroundColor="#f9fafb"
            content={
              <div className="max-w-2xl mx-auto">
                <ul className="space-y-4">
                  {report.year_highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3 text-lg">
                      <div className="p-1 bg-green-100 rounded-full mt-1">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            }
          />
        )}

        {/* Featured Stories */}
        {featuredStories.length > 0 && (
          <>
            <TextSection
              title="Featured Community Voices"
              backgroundColor="#ffffff"
              content={
                <p className="text-center text-gray-600 max-w-2xl mx-auto">
                  These stories represent the heart of our community's journey this year.
                </p>
              }
            />

            {featuredStories.map((storyLink) => (
              <QuoteSection
                key={storyLink.id}
                quote={storyLink.stories.content?.substring(0, 300) + '...'}
                author={storyLink.stories.profiles?.full_name || 'Community Member'}
                role={storyLink.stories.category}
              />
            ))}
          </>
        )}

        {/* More Stories */}
        {otherStories.length > 0 && (
          <div className="bg-gray-50 py-16">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">More Community Stories</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {otherStories.map((storyLink) => (
                  <div key={storyLink.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">{storyLink.stories.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {storyLink.stories.content?.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {storyLink.stories.profiles?.full_name && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {storyLink.stories.profiles.full_name}
                        </span>
                      )}
                      {storyLink.stories.category && (
                        <span className="flex items-center gap-1 capitalize">
                          <Tag className="h-3 w-3" />
                          {storyLink.stories.category}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories Breakdown */}
        {report.statistics?.stories_by_category && Object.keys(report.statistics.stories_by_category).length > 0 && (
          <div className="bg-white py-16">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Stories by Impact Area</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(report.statistics.stories_by_category).map(([category, count]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-purple-50 transition-colors">
                    <div className="text-2xl font-bold text-purple-600">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{category}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Acknowledgments */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Thank You</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              We acknowledge and thank {report.metadata?.funder_name || 'our funders and supporters'} for their continued support of Palm Island Community Company. We also thank all community members who shared their stories and the elders who guide our work.
            </p>
            <div className="mt-8 text-gray-500 text-sm">
              Generated on {new Date(report.metadata?.generated_at || report.created_at).toLocaleDateString('en-AU')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 py-8 text-center">
          <p className="text-gray-500 text-sm">
            Palm Island Community Company &copy; {report.report_year}
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Our Community, Our Future, Our Way
          </p>
        </div>
      </StoryContainer>
    </div>
  );
}
