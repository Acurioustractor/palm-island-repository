'use client';

import { Clock } from 'lucide-react';

const FISCAL_YEARS = [
  { value: 2026, label: '2025-26' },
  { value: 2025, label: '2024-25' },
  { value: 2024, label: '2023-24' },
  { value: 2023, label: '2022-23' },
];

interface DashboardHeaderProps {
  fiscalYear: number;
  onFiscalYearChange: (fy: number) => void;
  overallProgress: number;
  completeSections: number;
  totalSections: number;
  freshnessLabel: string;
}

export default function DashboardHeader({
  fiscalYear,
  onFiscalYearChange,
  overallProgress,
  completeSections,
  totalSections,
  freshnessLabel,
}: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Annual Report Data</h1>
          <p className="text-gray-600 mt-1">
            Enter and manage all data for the annual report
          </p>
        </div>
        <select
          value={fiscalYear}
          onChange={e => onFiscalYearChange(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-purple-400 focus:outline-none"
        >
          {FISCAL_YEARS.map(fy => (
            <option key={fy.value} value={fy.value}>
              FY {fy.label}
            </option>
          ))}
        </select>
      </div>

      {/* Quick stat pills */}
      <div className="flex items-center gap-2 mt-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            overallProgress >= 80
              ? 'bg-emerald-100 text-emerald-700'
              : overallProgress >= 40
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
          }`}
        >
          {overallProgress}% Complete
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          {completeSections}/{totalSections} Sections
        </span>
        {freshnessLabel && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            <Clock className="w-3 h-3" />
            {freshnessLabel}
          </span>
        )}
      </div>
    </div>
  );
}
