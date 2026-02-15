'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Table2, BarChart3, Loader2 } from 'lucide-react';
import DashboardCard from './DashboardCard';

interface TrendDataPoint {
  fiscal_year: string;
  clients_served: number | null;
  revenue: number | null;
  staff_count: number | null;
  services_count: number | null;
}

type ViewMode = 'chart' | 'table';

const COLORS = ['#C8922A', '#8B1A1A', '#5B7B5E', '#f59e0b'];

export default function HistoricalTrendsPanel() {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('chart');

  useEffect(() => {
    async function fetchTrends() {
      setLoading(true);
      try {
        const res = await fetch('/api/annual-report-data/trends?metrics=clients,revenue,staff,services&from=2006&to=2026');
        if (!res.ok) throw new Error('Failed to load trends');
        const json = await res.json();
        setData(json.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchTrends();
  }, []);

  if (loading) {
    return (
      <DashboardCard className="p-8">
        <div className="flex items-center justify-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading historical data...
        </div>
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard className="p-8">
        <div className="text-center text-gray-500">
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1 text-gray-400">Historical data will populate as reports are created across fiscal years.</p>
        </div>
      </DashboardCard>
    );
  }

  const metrics = [
    { key: 'clients_served' as const, label: 'Clients Served', color: COLORS[0], format: (v: number) => v.toLocaleString() },
    { key: 'revenue' as const, label: 'Revenue', color: COLORS[1], format: (v: number) => `$${(v / 1000000).toFixed(1)}M` },
    { key: 'staff_count' as const, label: 'Staff', color: COLORS[2], format: (v: number) => v.toString() },
    { key: 'services_count' as const, label: 'Services', color: COLORS[3], format: (v: number) => v.toString() },
  ];

  // Find max values for chart scaling
  const getMax = (key: keyof TrendDataPoint) =>
    Math.max(...data.map(d => (d[key] as number) || 0), 1);

  return (
    <div className="space-y-6">
      <DashboardCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warm-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-picc-ochre" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Historical Trends</h2>
              <p className="text-sm text-gray-500">Key metrics across fiscal years</p>
            </div>
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('chart')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === 'chart' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 inline mr-1" />
              Chart
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              <Table2 className="w-3.5 h-3.5 inline mr-1" />
              Table
            </button>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No historical data available yet.</p>
            <p className="text-xs text-gray-400 mt-1">Data will appear as reports are created for each fiscal year.</p>
          </div>
        ) : view === 'chart' ? (
          /* Simple bar chart (CSS-based, no recharts dependency needed) */
          <div className="space-y-8">
            {metrics.map(metric => {
              const max = getMax(metric.key);
              const hasData = data.some(d => d[metric.key] !== null);
              if (!hasData) return null;

              return (
                <div key={metric.key}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }} />
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  </div>
                  <div className="space-y-1.5">
                    {data.map(point => {
                      const val = (point[metric.key] as number) || 0;
                      const pct = (val / max) * 100;
                      return (
                        <div key={point.fiscal_year} className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 w-12 text-right font-mono">
                            {point.fiscal_year}
                          </span>
                          <div className="flex-1 h-5 bg-gray-50 rounded overflow-hidden">
                            <div
                              className="h-full rounded transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: metric.color, opacity: 0.8 }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-600 w-16 text-right font-mono">
                            {val ? metric.format(val) : '--'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table view */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">FY</th>
                  {metrics.map(m => (
                    <th key={m.key} className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase">
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(point => (
                  <tr key={point.fiscal_year} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-mono text-gray-700">{point.fiscal_year}</td>
                    {metrics.map(m => (
                      <td key={m.key} className="text-right py-2 px-3 font-mono text-gray-600">
                        {point[m.key] !== null ? m.format(point[m.key] as number) : '--'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
