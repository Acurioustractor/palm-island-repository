'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import type { CorrelationPair } from '@/lib/data-intelligence/types';

function CorrelationBadge({ value }: { value: number }) {
  const abs = Math.abs(value);
  let bg = 'bg-gray-100 text-gray-600';
  if (abs >= 0.8) bg = 'bg-green-100 text-green-700';
  else if (abs >= 0.5) bg = 'bg-warm-100 text-picc-red';
  else if (abs >= 0.3) bg = 'bg-yellow-100 text-yellow-700';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bg}`}>
      r = {value.toFixed(2)}
    </span>
  );
}

export default function InsightsTab() {
  const [correlations, setCorrelations] = useState<CorrelationPair[]>([]);
  const [dataYears, setDataYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/data-intelligence/correlations');
        if (res.ok) {
          const data = await res.json();
          setCorrelations(data.correlations || []);
          setDataYears(data.dataYears || []);
        }
      } catch (e) {
        console.error('Failed to load correlations:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  // Sort correlations by strength
  const sorted = [...correlations].sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  // AI-generated insights based on correlations
  const insights = sorted
    .filter(c => Math.abs(c.correlation) >= 0.5)
    .map(c => {
      const direction = c.correlation > 0 ? 'increases' : 'decreases';
      return `When ${c.metricA} grows, ${c.metricB} tends to ${c.correlation > 0 ? 'grow' : 'shrink'} as well (${c.interpretation.toLowerCase()}, r=${c.correlation.toFixed(2)}).`;
    });

  return (
    <div className="space-y-6">
      {/* Correlation Matrix */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cross-Domain Correlations</h3>
        <p className="text-sm text-gray-500 mb-4">
          Pearson correlations computed across {dataYears.length} fiscal years ({dataYears[0]} to {dataYears[dataYears.length - 1]})
        </p>

        {sorted.length > 0 ? (
          <div className="space-y-3">
            {sorted.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className={`w-4 h-4 ${c.correlation >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {c.metricA} &harr; {c.metricB}
                    </div>
                    <div className="text-xs text-gray-500">{c.interpretation}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{c.dataPoints} points</span>
                  <CorrelationBadge value={c.correlation} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Not enough data points for correlation analysis. Need 3+ years of aligned data.
          </div>
        )}
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-warm-50 to-warm-100 rounded-xl p-6 border border-warm-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">&#x1f4a1;</span>
            Key Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-3 items-start">
                <CheckCircle className="w-4 h-4 text-picc-red mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Quality Scorecard */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Quality Scorecard</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { table: 'annual_financials', label: 'Financials', years: dataYears.length },
            { table: 'staff_statistics', label: 'Staff Stats', years: dataYears.length },
            { table: 'service_metrics', label: 'Service Metrics', years: Math.min(dataYears.length, 2) },
            { table: 'partners', label: 'Partners', years: 1 },
          ].map((item, i) => {
            const completeness = Math.min(100, (item.years / 5) * 100);
            return (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                <div className="flex items-center gap-2">
                  {completeness >= 60 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium">{Math.round(completeness)}%</span>
                </div>
                <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${completeness >= 60 ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
