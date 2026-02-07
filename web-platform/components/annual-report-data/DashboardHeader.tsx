'use client';

import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const FISCAL_YEARS = [
  { value: 2026, label: '2025-26' },
  { value: 2025, label: '2024-25' },
  { value: 2024, label: '2023-24' },
  { value: 2023, label: '2022-23' },
];

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface DashboardHeaderProps {
  fiscalYear: number;
  onFiscalYearChange: (fy: number) => void;
  saveStatus: SaveStatus;
}

export default function DashboardHeader({
  fiscalYear,
  onFiscalYearChange,
  saveStatus,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Annual Report Data</h1>
        <p className="text-gray-600 mt-1">
          Enter and manage all data for the annual report
        </p>
      </div>
      <div className="flex items-center gap-4">
        <SaveIndicator status={saveStatus} />
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
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;

  const config = {
    saving: { icon: Clock, text: 'Saving...', className: 'text-gray-500' },
    saved: { icon: CheckCircle, text: 'All changes saved', className: 'text-emerald-600' },
    error: { icon: AlertCircle, text: 'Save failed', className: 'text-red-600' },
  } as const;

  const { icon: Icon, text, className } = config[status];

  return (
    <span className={`flex items-center gap-1.5 text-sm ${className}`}>
      <Icon className="w-4 h-4" />
      {text}
    </span>
  );
}
