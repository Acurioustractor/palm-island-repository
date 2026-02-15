'use client';

import React from 'react';
import { Eye, EyeOff, ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';
import type { NodeType } from '@/lib/data-intelligence/types';
import { NODE_COLORS } from '@/lib/data-intelligence/types';

interface GraphControlsProps {
  activeDomains: NodeType[];
  onToggleDomain: (domain: NodeType) => void;
  fiscalYear: number;
  onFiscalYearChange: (year: number) => void;
  availableYears: number[];
  onExportSvg?: () => void;
}

const DOMAIN_LABELS: Record<NodeType, string> = {
  service: 'Services',
  partner: 'Partners',
  finance: 'Financials',
  staff: 'Staff',
  story: 'Stories',
  governance: 'Governance',
};

export default function GraphControls({
  activeDomains,
  onToggleDomain,
  fiscalYear,
  onFiscalYearChange,
  availableYears,
  onExportSvg,
}: GraphControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      {/* Domain toggles */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(DOMAIN_LABELS) as NodeType[]).map(domain => {
          const active = activeDomains.includes(domain);
          return (
            <button
              key={domain}
              onClick={() => onToggleDomain(domain)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                active
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: active ? NODE_COLORS[domain] : '#D1D5DB' }}
              />
              {DOMAIN_LABELS[domain]}
              {active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200" />

      {/* Fiscal Year Selector */}
      <select
        value={fiscalYear}
        onChange={(e) => onFiscalYearChange(parseInt(e.target.value))}
        className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white"
      >
        {availableYears.map(y => (
          <option key={y} value={y}>
            FY {y - 1}-{String(y).slice(2)}
          </option>
        ))}
      </select>

      {/* Export SVG */}
      {onExportSvg && (
        <>
          <div className="h-6 w-px bg-gray-200" />
          <button
            onClick={onExportSvg}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Download className="w-3 h-3" />
            Export SVG
          </button>
        </>
      )}
    </div>
  );
}
