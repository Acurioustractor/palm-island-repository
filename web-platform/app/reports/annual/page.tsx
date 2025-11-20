'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen, Users, Heart, TrendingUp, Award, Calendar,
  Download, Printer, BarChart3, PieChart, Activity
} from 'lucide-react';
import { formatCategoryName, formatStoryType } from '@/lib/annual-report/generator';
import type { AnnualReportData } from '@/lib/annual-report/generator';
import './print-styles.css';

export default function AnnualReportPage() {
  const [reportData, setReportData] = useState<AnnualReportData | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate list of available years (2020 to current year)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: currentYear - 2019 },
    (_, i) => currentYear - i
  );

  useEffect(() => {
    loadReport(selectedYear);
  }, [selectedYear]);

  async function loadReport(year: number) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/annual-report?year=${year}`);
      const result = await response.json();

      if (result.success) {
        setReportData(result.data);
        console.log('✅ Annual report loaded:', result.data);
      } else {
        setError(result.error || 'Failed to load report');
      }
    } catch (err) {
      console.error('Error loading annual report:', err);
      setError('Failed to load annual report');
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleDownloadPDF() {
    // Open print dialog with PDF destination pre-selected (user can change)
    // Modern browsers support "Save as PDF" in the print dialog
    if (confirm(
      '📄 Save as PDF\n\n' +
      'This will open your browser\'s print dialog.\n' +
      'Select "Save as PDF" as the destination to download the report.\n\n' +
      'Click OK to continue.'
    )) {
      window.print();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Generating {selectedYear} Annual Report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Report</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadReport(selectedYear)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header - Hide when printing */}
      <div className="print:hidden bg-gradient-to-r from-purple-900 to-blue-800 text-white py-8 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Annual Report</h1>
              <p className="text-blue-100">Palm Island Community Company</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Year Selector */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium border-2 border-purple-300 focus:ring-2 focus:ring-blue-400"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Action Buttons */}
              <button
                onClick={handlePrint}
                className="bg-white text-purple-900 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all flex items-center gap-2"
              >
                <Printer className="h-5 w-5" />
                Print
              </button>

              <button
                onClick={handleDownloadPDF}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Cover Page */}
        <div className="bg-white rounded-xl shadow-2xl p-12 mb-8 text-center print:shadow-none">
          <div className="mb-6">
            <div className="text-6xl mb-4">📖</div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2">
              {selectedYear} Annual Report
            </h1>
            <h2 className="text-3xl text-purple-600 mb-4">
              Palm Island Community Company
            </h2>
            <p className="text-xl text-gray-600 italic">
              Manbarra & Bwgcolman Country • Palm Island
            </p>
          </div>

          <div className="border-t-2 border-b-2 border-gray-300 py-6 my-8">
            <p className="text-2xl font-medium text-gray-700">
              Community Stories, Cultural Preservation & Impact
            </p>
          </div>

          <div className="text-sm text-gray-500">
            Generated on {new Date().toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 print:shadow-none">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Award className="h-8 w-8 text-purple-600" />
            Executive Summary
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div className="text-4xl font-bold text-purple-900">
                  {reportData.summary.totalStories}
                </div>
              </div>
              <div className="text-sm font-medium text-purple-700">Stories Collected</div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="text-4xl font-bold text-blue-900">
                  {reportData.summary.totalStorytellers}
                </div>
              </div>
              <div className="text-sm font-medium text-blue-700">Active Storytellers</div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <Heart className="h-8 w-8 text-green-600" />
                <div className="text-4xl font-bold text-green-900">
                  {reportData.summary.totalPeopleAffected.toLocaleString()}
                </div>
              </div>
              <div className="text-sm font-medium text-green-700">People Affected</div>
            </div>

            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg p-6 border-2 border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="text-4xl font-bold text-orange-900">
                  {reportData.insights.growthRate.toFixed(1)}%
                </div>
              </div>
              <div className="text-sm font-medium text-orange-700">Growth Rate</div>
            </div>
          </div>

          <div className="prose max-w-none text-gray-700">
            <p className="text-lg leading-relaxed">
              In {selectedYear}, the Palm Island Community Company collected{' '}
              <strong>{reportData.summary.totalStories} community stories</strong> from{' '}
              <strong>{reportData.summary.totalStorytellers} storytellers</strong>, including{' '}
              <strong>{reportData.summary.totalElders} elders</strong> and{' '}
              <strong>{reportData.summary.totalYouth} youth members</strong>. These stories
              document experiences affecting{' '}
              <strong>{reportData.summary.totalPeopleAffected.toLocaleString()} community members</strong>,
              demonstrating the significant impact of community-controlled storytelling and
              cultural preservation.
            </p>
          </div>
        </div>

        {/* Stories by Category */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 print:shadow-none">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <PieChart className="h-8 w-8 text-blue-600" />
            Stories by Category
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(reportData.storiesByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => {
                const percentage = (count / reportData.summary.totalStories) * 100;
                return (
                  <div key={category} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">
                        {formatCategoryName(category)}
                      </span>
                      <span className="text-2xl font-bold text-purple-600">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {percentage.toFixed(1)}% of total stories
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Monthly Timeline */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 print:shadow-none">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-green-600" />
            Monthly Story Collection
          </h2>

          <div className="space-y-3">
            {reportData.storiesByMonth.map(({ month, count }) => {
              const maxCount = Math.max(...reportData.storiesByMonth.map(m => m.count));
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
              const isPeakMonth = month === reportData.insights.peakMonth;

              return (
                <div
                  key={month}
                  className={`border-2 rounded-lg p-4 ${
                    isPeakMonth ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 flex items-center gap-2">
                      {month}
                      {isPeakMonth && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          Peak Month
                        </span>
                      )}
                    </span>
                    <span className="text-xl font-bold text-blue-600">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cultural Impact */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 print:shadow-none">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Activity className="h-8 w-8 text-purple-600" />
            Cultural Impact
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
              <div className="text-4xl font-bold text-purple-900 mb-2">
                {reportData.culturalMetrics.traditionalKnowledgeStories}
              </div>
              <div className="text-sm font-medium text-purple-700">
                Traditional Knowledge Stories
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <div className="text-4xl font-bold text-blue-900 mb-2">
                {reportData.culturalMetrics.elderWisdomStories}
              </div>
              <div className="text-sm font-medium text-blue-700">
                Elder Wisdom Stories
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <div className="text-4xl font-bold text-green-900 mb-2">
                {reportData.summary.totalElders}
              </div>
              <div className="text-sm font-medium text-green-700">
                Elder Contributors
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Cultural Sensitivity Distribution
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(reportData.culturalMetrics.culturalSensitivityBreakdown).map(
                ([level, count]) => (
                  <div key={level} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium capitalize">{level} Sensitivity</span>
                    <span className="text-lg font-bold text-purple-600">{count}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Community Engagement */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 print:shadow-none">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Community Engagement
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <div className="text-4xl font-bold text-blue-900 mb-2">
                {reportData.engagement.newStorytellers}
              </div>
              <div className="text-sm font-medium text-blue-700">
                New Storytellers
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
              <div className="text-4xl font-bold text-purple-900 mb-2">
                {reportData.engagement.averageStoriesPerStoryteller.toFixed(1)}
              </div>
              <div className="text-sm font-medium text-purple-700">
                Avg Stories per Storyteller
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <div className="text-4xl font-bold text-green-900 mb-2">
                {reportData.summary.totalViews.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-green-700">
                Total Story Views
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Most Active Storytellers (Top 10)
            </h3>
            <div className="space-y-2">
              {reportData.engagement.mostActiveStorytellers.map((storyteller, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{storyteller.name}</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {storyteller.storyCount} {storyteller.storyCount === 1 ? 'story' : 'stories'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Impact */}
        {reportData.impact.serviceEffectiveness.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-8 mb-8 print:shadow-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-green-600" />
              Service Impact
            </h2>

            <div className="space-y-4">
              {reportData.impact.serviceEffectiveness.map((service, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-400 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{service.service}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {service.storyCount}
                      </div>
                      <div className="text-sm text-gray-600">stories</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>
                      <strong>{service.peopleAffected.toLocaleString()}</strong> people affected
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Stories */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 print:shadow-none">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Award className="h-8 w-8 text-orange-600" />
            Most Viewed Stories
          </h2>

          <div className="space-y-3">
            {reportData.featured.topStories.map((story, index) => (
              <div
                key={story.id}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-orange-400 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{story.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span>By {story.storytellerName}</span>
                      <span>•</span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {formatCategoryName(story.category)}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-blue-600">
                        {story.views.toLocaleString()} views
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl shadow-xl p-8 print:shadow-none">
          <h2 className="text-3xl font-bold mb-6">Key Insights for {selectedYear}</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-5xl mb-2">📈</div>
              <h3 className="text-xl font-bold mb-2">Growth Trend</h3>
              <p className="text-blue-100">
                Story collection {reportData.insights.growthRate > 0 ? 'increased' : 'decreased'} by{' '}
                <strong className="text-white text-2xl">
                  {Math.abs(reportData.insights.growthRate).toFixed(1)}%
                </strong>{' '}
                compared to the previous year.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-5xl mb-2">🎯</div>
              <h3 className="text-xl font-bold mb-2">Most Common Theme</h3>
              <p className="text-blue-100">
                <strong className="text-white text-2xl">
                  {formatCategoryName(reportData.insights.mostCommonCategory)}
                </strong>{' '}
                stories were the most frequently shared, highlighting key community priorities.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-5xl mb-2">📅</div>
              <h3 className="text-xl font-bold mb-2">Peak Activity</h3>
              <p className="text-blue-100">
                <strong className="text-white text-2xl">{reportData.insights.peakMonth}</strong>{' '}
                was the most active month for story collection and community engagement.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-5xl mb-2">💫</div>
              <h3 className="text-xl font-bold mb-2">Average Impact</h3>
              <p className="text-blue-100">
                Each story affected an average of{' '}
                <strong className="text-white text-2xl">
                  {reportData.insights.averageImpactPerStory.toFixed(1)}
                </strong>{' '}
                community members.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 print:mt-8">
          <div className="border-t-2 border-gray-300 pt-6">
            <p className="text-lg font-medium mb-2">
              Palm Island Community Company • {selectedYear} Annual Report
            </p>
            <p className="text-sm italic">
              Community-controlled storytelling and cultural preservation on Manbarra & Bwgcolman Country
            </p>
            <p className="text-xs mt-4 text-gray-500">
              Generated on {new Date().toLocaleString('en-AU')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
