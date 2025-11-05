'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { FileText, Download, Loader, TrendingUp, Users, BookOpen, Award, Calendar } from 'lucide-react';

interface ReportData {
  year: number;
  storytellers: {
    total: number;
    new_this_year: number;
    by_type: Record<string, number>;
  };
  stories: {
    total: number;
    new_this_year: number;
    by_media_type: Record<string, number>;
  };
  engagement: {
    total_views: number;
    unique_visitors: number;
  };
  services: {
    total: number;
    categories: Record<string, number>;
  };
}

export default function GenerateReportPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  async function generateReport() {
    setLoading(true);
    setError('');
    const supabase = createClient();

    try {
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;

      // Fetch storytellers data
      const { data: allStorytellers } = await supabase
        .from('profiles')
        .select('id, storyteller_type, created_at');

      const { data: newStorytellers } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', yearStart)
        .lte('created_at', yearEnd);

      // Count by type
      const byType: Record<string, number> = {};
      allStorytellers?.forEach(s => {
        const type = s.storyteller_type || 'unknown';
        byType[type] = (byType[type] || 0) + 1;
      });

      // Fetch stories data
      const { data: allStories } = await supabase
        .from('stories')
        .select('id, media_type, created_at');

      const { data: newStories } = await supabase
        .from('stories')
        .select('id')
        .gte('created_at', yearStart)
        .lte('created_at', yearEnd);

      // Count by media type
      const byMediaType: Record<string, number> = {};
      allStories?.forEach(s => {
        const type = s.media_type || 'text';
        byMediaType[type] = (byMediaType[type] || 0) + 1;
      });

      // Fetch services data
      const { data: services } = await supabase
        .from('organization_services')
        .select('id, service_category')
        .eq('organization_id', '3c2011b9-f80d-4289-b300-0cd383cff479');

      const serviceCategories: Record<string, number> = {};
      services?.forEach(s => {
        const category = s.service_category || 'other';
        serviceCategories[category] = (serviceCategories[category] || 0) + 1;
      });

      // Compile report data
      const data: ReportData = {
        year,
        storytellers: {
          total: allStorytellers?.length || 0,
          new_this_year: newStorytellers?.length || 0,
          by_type: byType,
        },
        stories: {
          total: allStories?.length || 0,
          new_this_year: newStories?.length || 0,
          by_media_type: byMediaType,
        },
        engagement: {
          total_views: 0, // TODO: Track views in future
          unique_visitors: 0,
        },
        services: {
          total: services?.length || 0,
          categories: serviceCategories,
        },
      };

      setReportData(data);
    } catch (err) {
      console.error('Report generation error:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function downloadReport() {
    if (!reportData) return;

    const reportText = generateReportText(reportData);
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palm-island-report-${year}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function generateReportText(data: ReportData): string {
    return `# Palm Island Community Report ${data.year}

## Executive Summary

Palm Island Community Company (PICC) continues to prove that Indigenous self-determination delivers world-class outcomes. This report covers the ${data.year} calendar year and demonstrates our community's growth, impact, and sovereignty.

---

## Community Storytellers

**Total Storytellers**: ${data.storytellers.total}
**New in ${data.year}**: ${data.storytellers.new_this_year}

### Breakdown by Type:
${Object.entries(data.storytellers.by_type)
  .map(([type, count]) => `- ${type.replace('_', ' ')}: ${count}`)
  .join('\n')}

Every storyteller represents a voice in our community—from Elders holding traditional knowledge to youth shaping our future.

---

## Stories Shared

**Total Stories**: ${data.stories.total}
**New in ${data.year}**: ${data.stories.new_this_year}

### Breakdown by Media Type:
${Object.entries(data.stories.by_media_type)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

These stories preserve our history, share our experiences, and build our collective knowledge.

---

## PICC Services

**Total Services**: ${data.services.total}

### Service Categories:
${Object.entries(data.services.categories)
  .map(([category, count]) => `- ${category}: ${count} service${count > 1 ? 's' : ''}`)
  .join('\n')}

All services are 100% community-controlled, delivering better outcomes at lower costs than external providers.

---

## Impact Metrics

### Community Control
- **197 staff members** (majority from Palm Island)
- **100% community governed**
- **$115,000+ annual savings** by eliminating external consultants

### Digital Sovereignty
- **Indigenous data sovereignty** enforced at database level
- **CARE & OCAP® principles** implemented throughout
- **Community controls** who sees what data

---

## Key Achievements in ${data.year}

1. ✅ Maintained 100% community control of all services
2. ✅ ${data.storytellers.new_this_year} new storytellers joined the platform
3. ✅ ${data.stories.new_this_year} new stories shared
4. ✅ Zero dependence on external consultants
5. ✅ Full Indigenous data sovereignty maintained

---

## Looking Forward to ${data.year + 1}

**Goals:**
- Expand storytelling to more community members
- Enhance cultural preservation through digital archives
- Continue proving that Indigenous self-determination works
- Share our model with other Indigenous communities worldwide

---

## Conclusion

Palm Island Community Company proves what happens when Indigenous communities control their own services, data, and destiny: **we thrive**.

This platform represents more than technology—it's a statement of sovereignty, a tool for healing, and proof that we don't need to be "helped" by outsiders. We are the experts in our own lives.

**Our community. Our stories. Our data. Our future.**

---

*Generated ${new Date().toLocaleDateString()} via Palm Island Story Server*
*Manbarra & Bwgcolman Country*
`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-4">
              Generate Annual Report
            </h1>
            <p className="text-xl text-purple-100">
              Automatically generate comprehensive reports from your community data
            </p>
          </div>
        </div>
      </div>

      {/* Generator */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Select Report Year
            </h2>

            <div className="flex gap-4 items-end mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={generateReport}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Report Preview */}
          {reportData && (
            <>
              <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {reportData.year} Annual Report
                  </h2>
                  <button
                    onClick={downloadReport}
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Report
                  </button>
                </div>

                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <MetricCard
                    icon={<Users className="w-8 h-8" />}
                    number={reportData.storytellers.total}
                    label="Storytellers"
                    sublabel={`+${reportData.storytellers.new_this_year} this year`}
                    color="from-purple-500 to-blue-500"
                  />
                  <MetricCard
                    icon={<BookOpen className="w-8 h-8" />}
                    number={reportData.stories.total}
                    label="Stories"
                    sublabel={`+${reportData.stories.new_this_year} this year`}
                    color="from-blue-500 to-cyan-500"
                  />
                  <MetricCard
                    icon={<Award className="w-8 h-8" />}
                    number={reportData.services.total}
                    label="Services"
                    sublabel="100% community controlled"
                    color="from-green-500 to-teal-500"
                  />
                  <MetricCard
                    icon={<TrendingUp className="w-8 h-8" />}
                    number="100%"
                    label="Sovereignty"
                    sublabel="Indigenous data control"
                    color="from-orange-500 to-red-500"
                  />
                </div>

                {/* Detailed Sections */}
                <div className="space-y-6">
                  {/* Storytellers */}
                  <div className="border-2 border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Users className="w-6 h-6 mr-2 text-purple-600" />
                      Community Storytellers
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(reportData.storytellers.by_type).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded">
                          <span className="text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                          <span className="font-bold text-purple-600">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stories */}
                  <div className="border-2 border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                      Stories Shared
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.entries(reportData.stories.by_media_type).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded">
                          <span className="text-gray-700 capitalize">{type}</span>
                          <span className="font-bold text-blue-600">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services */}
                  <div className="border-2 border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Award className="w-6 h-6 mr-2 text-green-600" />
                      PICC Services
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(reportData.services.categories).map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded">
                          <span className="text-gray-700 capitalize">{category}</span>
                          <span className="font-bold text-green-600">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* View/Download Options */}
                <div className="mt-8 p-6 bg-purple-50 rounded-lg">
                  <h3 className="text-lg font-bold text-purple-900 mb-4">
                    What's Next?
                  </h3>
                  <div className="space-y-2 text-purple-800">
                    <p>✅ Review the metrics above</p>
                    <p>✅ Download the full report (Markdown format)</p>
                    <p>✅ Share with your community</p>
                    <p>✅ Use for funding applications or stakeholder updates</p>
                  </div>
                </div>
              </div>

              {/* Previous Reports */}
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                  View Previous Reports
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {years.slice(0, 6).map((y) => (
                    <Link
                      key={y}
                      href={`/reports/annual/${y}`}
                      className="border-2 border-gray-200 hover:border-purple-400 rounded-lg p-4 text-center transition-all hover:shadow-lg"
                    >
                      <div className="text-2xl font-bold text-purple-600 mb-1">{y}</div>
                      <div className="text-sm text-gray-600">Annual Report</div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  number,
  label,
  sublabel,
  color,
}: {
  icon: React.ReactNode;
  number: number | string;
  label: string;
  sublabel: string;
  color: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${color} text-white rounded-xl p-6`}>
      <div className="mb-3">{icon}</div>
      <div className="text-4xl font-bold mb-1">{number}</div>
      <div className="text-lg font-medium mb-1">{label}</div>
      <div className="text-sm opacity-90">{sublabel}</div>
    </div>
  );
}
