'use client';

import Link from 'next/link';
import { FileText, Printer, CheckCircle, Circle } from 'lucide-react';

interface PreviewPanelProps {
  servicesWithData: number;
  totalServices: number;
  financialsDone: boolean;
  highlightsCount: number;
  leadershipCount: number;
  storiesCount: number;
  boardMembersCount: number;
  photosCount: number;
  photoGaps: string[];
  projectsFeaturedCount: number;
}

export default function PreviewPanel({
  servicesWithData,
  totalServices,
  financialsDone,
  highlightsCount,
  leadershipCount,
  storiesCount,
  boardMembersCount,
  photosCount,
  photoGaps,
  projectsFeaturedCount,
}: PreviewPanelProps) {
  const items = [
    {
      label: 'Service metrics entered',
      done: servicesWithData === totalServices && totalServices > 0,
      detail: `${servicesWithData}/${totalServices} services`,
    },
    {
      label: 'Financial data entered',
      done: financialsDone,
      detail: financialsDone ? 'Complete' : 'Not started',
    },
    {
      label: 'At least one highlight added',
      done: highlightsCount > 0,
      detail: `${highlightsCount} highlight${highlightsCount !== 1 ? 's' : ''}`,
    },
    {
      label: 'Leadership messages written',
      done: leadershipCount > 0,
      detail: `${leadershipCount} message${leadershipCount !== 1 ? 's' : ''}`,
    },
    {
      label: 'Stories linked to report',
      done: storiesCount > 0,
      detail: `${storiesCount} ${storiesCount === 1 ? 'story' : 'stories'}`,
    },
    {
      label: 'Board members / leadership added',
      done: boardMembersCount > 0,
      detail: `${boardMembersCount} member${boardMembersCount !== 1 ? 's' : ''}`,
    },
    {
      label: 'Photos tagged for report',
      done: photosCount > 0 && photoGaps.length === 0,
      detail: photosCount > 0
        ? photoGaps.length === 0
          ? `${photosCount} photos, all sections covered`
          : `${photosCount} photos, ${photoGaps.length} section gap${photoGaps.length !== 1 ? 's' : ''}`
        : 'No photos tagged',
    },
    {
      label: 'Projects featured',
      done: projectsFeaturedCount > 0,
      detail: `${projectsFeaturedCount} featured`,
    },
  ];

  const doneCount = items.filter(i => i.done).length;
  const allDone = items.every(i => i.done);
  const completenessScore = Math.round((doneCount / items.length) * 100);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Readiness checklist */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Report Readiness Checklist
          </h2>
          <span className={`text-sm font-bold ${completenessScore === 100 ? 'text-emerald-600' : 'text-gray-500'}`}>
            {completenessScore}% ready
          </span>
        </div>

        <div className="space-y-3">
          {items.map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <span
                  className={`text-sm ${
                    item.done ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
              <span className="text-xs text-gray-400">{item.detail}</span>
            </div>
          ))}
        </div>

        {allDone && (
          <div className="mt-4 flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-lg px-4 py-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              All data entered — report is ready to preview
            </span>
          </div>
        )}
      </div>

      {/* Export links */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Preview &amp; Export
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/annual-report/live"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-purple-300 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Live Dashboard
          </Link>
          <Link
            href="/annual-report/print"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-purple-300 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </Link>
        </div>
      </div>
    </div>
  );
}
