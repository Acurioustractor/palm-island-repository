'use client';

import Link from 'next/link';
import { FileText, Printer, CheckCircle, Circle, ArrowRight } from 'lucide-react';

type TabId = 'services' | 'financials' | 'highlights' | 'preview' | 'stories' | 'board' | 'photos' | 'projects' | 'countdown' | 'overview';

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
  onNavigateTab: (tab: string) => void;
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
  onNavigateTab,
}: PreviewPanelProps) {
  const items: { label: string; done: boolean; detail: string; targetTab: TabId }[] = [
    {
      label: 'Service metrics entered',
      done: servicesWithData === totalServices && totalServices > 0,
      detail: `${servicesWithData}/${totalServices} services`,
      targetTab: 'services',
    },
    {
      label: 'Financial data entered',
      done: financialsDone,
      detail: financialsDone ? 'Complete' : 'Not started',
      targetTab: 'financials',
    },
    {
      label: 'At least one highlight added',
      done: highlightsCount > 0,
      detail: `${highlightsCount} highlight${highlightsCount !== 1 ? 's' : ''}`,
      targetTab: 'highlights',
    },
    {
      label: 'Leadership messages written',
      done: leadershipCount > 0,
      detail: `${leadershipCount} message${leadershipCount !== 1 ? 's' : ''}`,
      targetTab: 'highlights',
    },
    {
      label: 'Stories linked to report',
      done: storiesCount > 0,
      detail: `${storiesCount} ${storiesCount === 1 ? 'story' : 'stories'}`,
      targetTab: 'stories',
    },
    {
      label: 'Board members / leadership added',
      done: boardMembersCount > 0,
      detail: `${boardMembersCount} member${boardMembersCount !== 1 ? 's' : ''}`,
      targetTab: 'board',
    },
    {
      label: 'Photos tagged for report',
      done: photosCount > 0 && photoGaps.length === 0,
      detail: photosCount > 0
        ? photoGaps.length === 0
          ? `${photosCount} photos, all sections covered`
          : `${photosCount} photos, ${photoGaps.length} section gap${photoGaps.length !== 1 ? 's' : ''}`
        : 'No photos tagged',
      targetTab: 'photos',
    },
    {
      label: 'Projects featured',
      done: projectsFeaturedCount > 0,
      detail: `${projectsFeaturedCount} featured`,
      targetTab: 'projects',
    },
  ];

  const doneCount = items.filter(i => i.done).length;
  const allDone = items.every(i => i.done);
  const completenessScore = Math.round((doneCount / items.length) * 100);

  // SVG progress ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completenessScore / 100) * circumference;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Readiness checklist */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Report Readiness Checklist
          </h2>
          {/* Progress ring */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32" cy="32" r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              <circle
                cx="32" cy="32" r={radius}
                fill="none"
                stroke={completenessScore === 100 ? '#10b981' : '#8b5cf6'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
              completenessScore === 100 ? 'text-emerald-600' : 'text-gray-700'
            }`}>
              {completenessScore}%
            </span>
          </div>
        </div>

        <div className="space-y-1">
          {items.map(item => (
            <button
              key={item.label}
              onClick={() => !item.done && onNavigateTab(item.targetTab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                item.done
                  ? 'cursor-default'
                  : 'hover:bg-gray-50 cursor-pointer'
              }`}
            >
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{item.detail}</span>
                {!item.done && (
                  <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </button>
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
