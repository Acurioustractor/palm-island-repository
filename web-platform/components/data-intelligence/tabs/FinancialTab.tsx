'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import WaterfallChart from '../WaterfallChart';
import GaugeChart from '../GaugeChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/data-intelligence/calculations';
import type { TrendPoint } from '@/lib/data-intelligence/types';

export default function FinancialTab() {
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [ratios, setRatios] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [trendsRes, overviewRes] = await Promise.all([
          fetch('/api/data-intelligence/trends?from=2020&to=2026'),
          fetch('/api/data-intelligence/overview'),
        ]);
        if (trendsRes.ok) {
          const data = await trendsRes.json();
          setTrends(data.data || []);
        }
        if (overviewRes.ok) {
          const data = await overviewRes.json();
          setRatios(data.ratios || null);
        }
      } catch (e) {
        console.error('Failed to load financial data:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  const latest = trends[trends.length - 1];
  const income = (latest?.income as number) || 0;
  const expenditure = (latest?.expenditure as number) || 0;

  // Waterfall items: Income -> expense categories -> net result
  const waterfallItems = [
    { name: 'Income', value: income, type: 'income' as const },
    { name: 'Labour', value: income * 0.60, type: 'expense' as const },
    { name: 'Admin', value: income * 0.21, type: 'expense' as const },
    { name: 'Travel', value: income * 0.075, type: 'expense' as const },
    { name: 'Client', value: income * 0.049, type: 'expense' as const },
    { name: 'Property', value: income * 0.045, type: 'expense' as const },
    { name: 'Vehicles', value: income * 0.017, type: 'expense' as const },
    { name: 'Net Result', value: 0, type: 'total' as const },
  ];

  // Expense donut
  const expenseData = [
    { name: 'Labour', value: 60, color: '#EF4444' },
    { name: 'Admin', value: 21, color: '#F59E0B' },
    { name: 'Travel & Training', value: 7.5, color: '#8B5CF6' },
    { name: 'Client Services', value: 4.9, color: '#3B82F6' },
    { name: 'Property', value: 4.5, color: '#10B981' },
    { name: 'Vehicles', value: 1.7, color: '#EC4899' },
  ];

  // Balance sheet data
  const balanceSheet = trends.filter(t => t.total_assets).map(t => ({
    year: t.fiscal_year,
    assets: t.total_assets as number,
    netAssets: t.net_assets as number,
  }));

  return (
    <div className="space-y-6">
      {/* Ratio Gauges */}
      {ratios && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Health Ratios</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <GaugeChart
              value={ratios.liquidityRatio}
              max={3}
              label="Liquidity Ratio"
              unit="x"
              thresholds={{ warn: 0.8, danger: 0.5 }}
            />
            <GaugeChart
              value={ratios.labourRatio}
              max={100}
              label="Labour Cost %"
              unit="%"
              thresholds={{ warn: 65, danger: 75 }}
            />
            <GaugeChart
              value={ratios.expenseToIncomeRatio}
              max={120}
              label="Expense/Income %"
              unit="%"
              thresholds={{ warn: 100, danger: 110 }}
            />
            <GaugeChart
              value={Math.abs(ratios.netSurplusDeficit) / 1_000_000}
              max={2}
              label={ratios.netSurplusDeficit >= 0 ? 'Net Surplus ($M)' : 'Net Deficit ($M)'}
              unit="M"
              color={ratios.netSurplusDeficit >= 0 ? '#10B981' : '#EF4444'}
            />
          </div>
        </div>
      )}

      {/* Waterfall + Donut Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Waterfall: Income to Net Result */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income to Net Result Flow</h3>
          <WaterfallChart items={waterfallItems} height={300} />
        </div>

        {/* Expense Donut */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenditure Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {expenseData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-700 truncate">{d.name}</span>
                  <span className="text-gray-400 ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Balance Sheet Table */}
      {balanceSheet.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Sheet Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-600">Fiscal Year</th>
                  <th className="text-right py-2 text-gray-600">Total Assets</th>
                  <th className="text-right py-2 text-gray-600">Net Assets</th>
                  <th className="text-right py-2 text-gray-600">Income</th>
                  <th className="text-right py-2 text-gray-600">Expenditure</th>
                  <th className="text-right py-2 text-gray-600">Net Result</th>
                </tr>
              </thead>
              <tbody>
                {trends.filter(t => t.income).map((t, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 font-medium">{t.fiscal_year}</td>
                    <td className="py-2 text-right">{t.total_assets ? formatCurrency(t.total_assets as number) : '—'}</td>
                    <td className="py-2 text-right">{t.net_assets ? formatCurrency(t.net_assets as number) : '—'}</td>
                    <td className="py-2 text-right">{formatCurrency((t.income as number) || 0)}</td>
                    <td className="py-2 text-right">{formatCurrency((t.expenditure as number) || 0)}</td>
                    <td className={`py-2 text-right font-medium ${(t.net_result as number) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency((t.net_result as number) || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
