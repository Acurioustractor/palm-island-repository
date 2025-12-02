'use client';

import React from 'react';
import { FileText, Star, Sparkles, Tag, CheckCircle, Info } from 'lucide-react';

interface ReportWorthySettingsProps {
  reportWorthy: boolean;
  setReportWorthy: (value: boolean) => void;
  autoInclude: boolean;
  setAutoInclude: (value: boolean) => void;
  qualityScore: number;
  setQualityScore: (value: number) => void;
  reportSection: string;
  setReportSection: (value: string) => void;
  compact?: boolean;
}

const reportSections = [
  { value: '', label: 'Auto-assign based on category' },
  { value: 'executive_summary', label: 'Executive Summary' },
  { value: 'community_stories', label: 'Community Stories' },
  { value: 'elder_wisdom', label: 'Elder Wisdom & Stories' },
  { value: 'youth_spotlight', label: 'Youth Spotlight' },
  { value: 'cultural_highlights', label: 'Cultural Highlights' },
  { value: 'innovation_spotlight', label: 'Innovation Projects' },
  { value: 'health_wellbeing', label: 'Health & Wellbeing' },
  { value: 'economic_development', label: 'Economic Development' },
  { value: 'photo_gallery', label: 'Photo Gallery Feature' },
  { value: 'acknowledgments', label: 'Acknowledgments' }
];

const qualityDescriptions: Record<number, string> = {
  0: 'Not rated',
  25: 'Needs work - basic content',
  50: 'Good - meets standard quality',
  75: 'Very good - strong storytelling',
  100: 'Excellent - featured quality'
};

export function ReportWorthySettings({
  reportWorthy,
  setReportWorthy,
  autoInclude,
  setAutoInclude,
  qualityScore,
  setQualityScore,
  reportSection,
  setReportSection,
  compact = false
}: ReportWorthySettingsProps) {
  if (compact) {
    return (
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
          <input
            type="checkbox"
            checked={reportWorthy}
            onChange={(e) => setReportWorthy(e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <FileText className="h-5 w-5 text-purple-600" />
          <div className="flex-1">
            <span className="font-medium text-gray-900">Include in Annual Reports</span>
            <p className="text-xs text-gray-500">Mark this story as suitable for reporting</p>
          </div>
        </label>

        {reportWorthy && (
          <div className="pl-6 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality Score</label>
              <input
                type="range"
                min="0"
                max="100"
                step="25"
                value={qualityScore}
                onChange={(e) => setQualityScore(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{qualityScore}%</span>
                <span>{qualityDescriptions[qualityScore] || 'Good quality'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <FileText className="h-6 w-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Annual Report Settings</h3>
      </div>

      <p className="text-sm text-gray-600">
        Configure how this story should be included in annual reports. Stories marked as
        "report worthy" will be available for selection when generating reports.
      </p>

      {/* Report Worthy Toggle */}
      <div className="flex items-start gap-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={reportWorthy}
            onChange={(e) => setReportWorthy(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
        <div>
          <div className="font-medium text-gray-900">Mark as Report Worthy</div>
          <p className="text-sm text-gray-500">
            This story is suitable for inclusion in annual reports and funder communications.
          </p>
        </div>
      </div>

      {reportWorthy && (
        <>
          {/* Quality Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Quality Score
              </label>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.ceil(qualityScore / 20) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={qualityScore}
              onChange={(e) => setQualityScore(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-500">
                {qualityScore}% - {qualityDescriptions[Math.round(qualityScore / 25) * 25] || 'Good quality'}
              </span>
              <span className="text-xs text-gray-400">
                Higher scores = featured placement
              </span>
            </div>
          </div>

          {/* Report Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Report Section
            </label>
            <select
              value={reportSection}
              onChange={(e) => setReportSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {reportSections.map(section => (
                <option key={section.value} value={section.value}>
                  {section.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose where this story should appear in reports, or leave blank for automatic placement.
            </p>
          </div>

          {/* Auto-Include Toggle */}
          <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={autoInclude}
                onChange={(e) => setAutoInclude(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="font-medium text-gray-900">Auto-Include in Reports</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Automatically include this story in reports without manual selection.
                Best for high-impact stories that should always appear.
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Living Ledger System:</strong> Stories marked as report-worthy are
              automatically tracked throughout the year. When you generate an annual report,
              these stories will be suggested for inclusion based on their quality scores,
              categories, and engagement levels.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ReportWorthySettings;
