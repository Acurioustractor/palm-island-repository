'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FileText, Filter, Download, ArrowLeft, Calendar, Tag, Users, Wand2 } from 'lucide-react';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  content: string;
  created_at: string;
  category: string;
  storyteller_id: string;
}

export default function ReportGeneratorPage() {
  const supabase = createClientComponentClient();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    impactArea: ''
  });
  const [reportConfig, setReportConfig] = useState({
    funderName: '',
    reportingPeriod: '',
    includeStats: true,
    includeStories: true,
    storyLimit: 10
  });

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    let query = supabase
      .from('stories')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (data) {
      setStories(data);
    }
    setLoading(false);
  };

  const generateReport = async () => {
    if (!reportConfig.funderName || !reportConfig.reportingPeriod) {
      alert('Please fill in funder name and reporting period');
      return;
    }

    alert(`Report Generation Started!\n\nFunder: ${reportConfig.funderName}\nPeriod: ${reportConfig.reportingPeriod}\nStories: ${stories.length}\n\nThis would generate a comprehensive funder report with:\n- Executive summary\n- Key impact metrics\n- Selected stories from the period\n- Community engagement data\n- Photos and quotes\n\nImplementation coming soon!`);
  };

  const categories = ['culture', 'education', 'health', 'employment', 'innovation', 'governance'];
  const impactAreas = ['Elders', 'Youth', 'Families', 'Community', 'Economic', 'Cultural'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/picc/content-studio" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Content Studio
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Funder Report Generator</h1>
          </div>
          <p className="text-gray-600">Generate impact reports for funders using real community stories</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Report Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funder Name *
                  </label>
                  <input
                    type="text"
                    value={reportConfig.funderName}
                    onChange={(e) => setReportConfig({ ...reportConfig, funderName: e.target.value })}
                    placeholder="e.g., NIAA, Philanthropy Australia"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reporting Period *
                  </label>
                  <input
                    type="text"
                    value={reportConfig.reportingPeriod}
                    onChange={(e) => setReportConfig({ ...reportConfig, reportingPeriod: e.target.value })}
                    placeholder="e.g., July 2023 - June 2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Stories to Include
                  </label>
                  <input
                    type="number"
                    value={reportConfig.storyLimit}
                    onChange={(e) => setReportConfig({ ...reportConfig, storyLimit: Number(e.target.value) })}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeStats}
                      onChange={(e) => setReportConfig({ ...reportConfig, includeStats: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Include statistics & metrics</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeStories}
                      onChange={(e) => setReportConfig({ ...reportConfig, includeStories: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Include full story text</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Story Filters
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="capitalize">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Impact Area
                  </label>
                  <select
                    value={filters.impactArea}
                    onChange={(e) => setFilters({ ...filters, impactArea: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All impact areas</option>
                    {impactAreas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={loadStories}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Preview & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Stories Found</div>
                <div className="text-2xl font-bold text-gray-900">{stories.length}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Will Include</div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.min(stories.length, reportConfig.storyLimit)}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Storytellers</div>
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(stories.map(s => s.storyteller_id).filter(Boolean)).size}
                </div>
              </div>
            </div>

            {/* Stories Preview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Stories to Include</h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading stories...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stories.slice(0, reportConfig.storyLimit).map((story) => (
                    <div key={story.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{story.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{story.content.substring(0, 150)}...</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(story.created_at).toLocaleDateString()}
                        </span>
                        {story.category && (
                          <span className="flex items-center gap-1 capitalize">
                            <Tag className="h-3 w-3" />
                            {story.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
              <div className="flex items-start gap-4 mb-4">
                <Wand2 className="h-6 w-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">AI-Powered Report Generation</h3>
                  <p className="text-sm text-purple-100">
                    Our AI will analyze the selected stories and generate a professional funder report with
                    executive summary, impact metrics, compelling narratives, and recommendations.
                  </p>
                </div>
              </div>
              <button
                onClick={generateReport}
                disabled={stories.length === 0 || !reportConfig.funderName}
                className="w-full bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Generate Funder Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
