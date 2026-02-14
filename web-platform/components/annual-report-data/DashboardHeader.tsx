'use client';

import { Clock, ChevronRight } from 'lucide-react';
import GeneratePdfButton from './GeneratePdfButton';

interface FiscalYear {
  value: number;
  label: string;
  group: string;
}

interface DashboardHeaderProps {
  fiscalYear: number;
  fiscalYears?: FiscalYear[];
  onFiscalYearChange: (fy: number) => void;
  overallProgress: number;
  completeSections: number;
  totalSections: number;
  freshnessLabel: string;
  activeTabLabel?: string;
  reportId?: string | null;
}

export default function DashboardHeader({
  fiscalYear,
  fiscalYears,
  onFiscalYearChange,
  overallProgress,
  completeSections,
  totalSections,
  freshnessLabel,
  activeTabLabel,
  reportId,
}: DashboardHeaderProps) {
  // Group fiscal years for optgroup rendering
  const groups = fiscalYears
    ? Array.from(new Set(fiscalYears.map(fy => fy.group)))
    : [];

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      {activeTabLabel && (
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
          <span>PICC</span>
          <ChevronRight className="w-3 h-3" />
          <span>Annual Reports</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium">{activeTabLabel}</span>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Annual Report Data</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter and manage all data for the annual report
          </p>
        </div>
        <div className="flex items-center gap-3">
          {reportId && (
            <GeneratePdfButton
              reportId={reportId}
              readinessPercent={overallProgress}
              variant="compact"
            />
          )}
          <select
            value={fiscalYear}
            onChange={e => onFiscalYearChange(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:border-picc-ochre-300 focus:outline-none transition-colors duration-200"
          >
            {fiscalYears && groups.length > 0 ? (
              groups.map(group => (
                <optgroup key={group} label={group}>
                  {fiscalYears
                    .filter(fy => fy.group === group)
                    .map(fy => (
                      <option key={fy.value} value={fy.value}>
                        FY {fy.label}
                      </option>
                    ))}
                </optgroup>
              ))
            ) : (
              // Fallback for old-style fiscal years
              <option value={fiscalYear}>FY {fiscalYear}</option>
            )}
          </select>
        </div>
      </div>

      {/* Quick stat pills */}
      <div className="flex items-center gap-2 mt-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            overallProgress >= 80
              ? 'bg-sage-100 text-sage-700'
              : overallProgress >= 40
                ? 'bg-picc-ochre-100 text-picc-ochre'
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
