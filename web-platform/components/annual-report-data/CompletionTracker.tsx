'use client';

import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface CompletionTrackerProps {
  servicesWithData: number;
  totalServices: number;
  financialsDone: boolean;
  highlightsDone: boolean;
}

export default function CompletionTracker({
  servicesWithData,
  totalServices,
  financialsDone,
  highlightsDone,
}: CompletionTrackerProps) {
  const servicePercent = totalServices > 0 ? Math.round((servicesWithData / totalServices) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Data Completion
      </h3>

      {/* Service metrics progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Service Metrics
          </span>
          <span className="text-sm font-bold text-gray-900">
            {servicesWithData}/{totalServices}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${servicePercent}%`,
              backgroundColor: servicePercent === 100 ? '#059669' : servicePercent > 50 ? '#d97706' : '#dc2626',
            }}
          />
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          {financialsDone ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
          <span className={`text-sm ${financialsDone ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
            Financials
          </span>
        </div>

        <div className="flex items-center gap-2">
          {highlightsDone ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
          <span className={`text-sm ${highlightsDone ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
            Highlights
          </span>
        </div>
      </div>

      {servicePercent === 100 && financialsDone && highlightsDone && (
        <div className="mt-4 flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-lg px-4 py-2">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">All data entered for this fiscal year</span>
        </div>
      )}
    </div>
  );
}
