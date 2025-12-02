'use client';

import React, { useState } from 'react';
import { Download, FileText, Calendar, Users, BarChart3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  formats: string[];
  color: string;
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);

  const reportTypes: ReportType[] = [
    {
      id: 'impact-summary',
      name: 'Impact Summary Report',
      description: 'Overview of community impact, stories collected, and key metrics',
      icon: BarChart3,
      formats: ['pdf', 'docx', 'csv'],
      color: 'blue'
    },
    {
      id: 'storyteller-report',
      name: 'Storyteller Report',
      description: 'List of all storytellers with their contributions and details',
      icon: Users,
      formats: ['pdf', 'csv', 'xlsx'],
      color: 'purple'
    },
    {
      id: 'stories-by-category',
      name: 'Stories by Category',
      description: 'Breakdown of stories organized by categories and themes',
      icon: FileText,
      formats: ['pdf', 'docx', 'xlsx'],
      color: 'green'
    },
    {
      id: 'monthly-activity',
      name: 'Monthly Activity Report',
      description: 'Month-by-month activity trends and engagement metrics',
      icon: Calendar,
      formats: ['pdf', 'xlsx'],
      color: 'orange'
    },
    {
      id: 'funder-report',
      name: 'Funder Report',
      description: 'Comprehensive report for funding bodies with impact data and stories',
      icon: FileText,
      formats: ['pdf', 'docx'],
      color: 'teal'
    }
  ];

  const handleGenerateReport = async () => {
    if (!selectedReport || !dateRange.start || !dateRange.end) {
      alert('Please select a report type and date range');
      return;
    }

    setGenerating(true);

    // Simulate report generation
    setTimeout(() => {
      alert(`Report "${reportTypes.find(r => r.id === selectedReport)?.name}" generated successfully!\n\nFormat: ${format.toUpperCase()}\nPeriod: ${dateRange.start} to ${dateRange.end}\n\nNote: This is a demo - actual report generation will be implemented.`);
      setGenerating(false);
    }, 2000);
  };

  const selectedReportData = reportTypes.find(r => r.id === selectedReport);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/picc/analytics" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Analytics
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <Download className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Export Reports</h1>
          </div>
          <p className="text-gray-600">Generate and download reports for funders, community, and internal use</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Types */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h2>
            <div className="space-y-3">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                const isSelected = selectedReport === report.id;

                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `border-${report.color}-500 bg-${report.color}-50`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-6 w-6 flex-shrink-0 ${isSelected ? `text-${report.color}-600` : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className={`font-medium ${isSelected ? `text-${report.color}-900` : 'text-gray-900'}`}>
                          {report.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{report.description}</div>
                        <div className="flex gap-2 mt-2">
                          {report.formats.map(fmt => (
                            <span key={fmt} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {fmt.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Format Selection */}
              {selectedReportData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {selectedReportData.formats.map(fmt => (
                      <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quick Date Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setMonth(start.getMonth() - 1);
                      setDateRange({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0]
                      });
                    }}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Last Month
                  </button>
                  <button
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setMonth(start.getMonth() - 3);
                      setDateRange({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0]
                      });
                    }}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Last Quarter
                  </button>
                  <button
                    onClick={() => {
                      const end = new Date();
                      const start = new Date(end.getFullYear(), 0, 1);
                      setDateRange({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0]
                      });
                    }}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    This Year
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateReport}
                disabled={!selectedReport || generating}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Report...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Generate & Download Report</span>
                  </>
                )}
              </button>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-900 font-medium mb-1">Report Generation</div>
                <div className="text-xs text-blue-700">
                  Reports are generated based on your current database. Ensure all stories and
                  storyteller information is up to date before generating reports for external use.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
