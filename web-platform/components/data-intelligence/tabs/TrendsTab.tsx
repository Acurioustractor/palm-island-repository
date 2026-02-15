'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { TrendPoint, GrowthMetric } from '@/lib/data-intelligence/types';
import { formatCurrency } from '@/lib/data-intelligence/calculations';

export default function TrendsTab() {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [growth, setGrowth] = useState<GrowthMetric[]>([]);
  const [projections, setProjections] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/data-intelligence/trends?from=2020&to=2026&projections=true');
        if (res.ok) {
          const json = await res.json();
          setData(json.data || []);
          setGrowth(json.growthMetrics || []);
          setProjections(json.projections || []);
        }
      } catch (e) {
        console.error('Failed to load trends:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  const chartData = [...data, ...projections.map(p => ({ ...p, projected: true }))];

  return (
    <div className="space-y-6">
      {/* Growth Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {growth.map((g, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">{g.label}</div>
            <div className="text-2xl font-bold text-gray-900">
              {g.label.includes('Revenue') ? formatCurrency(g.current) : g.current.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {g.yoyGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${g.yoyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {g.yoyGrowth >= 0 ? '+' : ''}{g.yoyGrowth.toFixed(1)}% YoY
              </span>
            </div>
            {g.cagr !== undefined && (
              <div className="text-xs text-gray-400 mt-1">CAGR: {g.cagr.toFixed(1)}%</div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Staff Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Growth Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.filter(d => d.total_staff)}>
                <defs>
                  <linearGradient id="gradStaff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradIndigenous" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="fiscal_year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total_staff" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradStaff)" name="Total" />
                <Area type="monotone" dataKey="indigenous_staff" stroke="#10b981" strokeWidth={2} fill="url(#gradIndigenous)" name="Indigenous" />
                <Area type="monotone" dataKey="resident_staff" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} name="Residents" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenditure</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.filter(d => d.income)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="fiscal_year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenditure" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenditure" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Result */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Net Surplus/Deficit</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.filter(d => d.net_result !== null)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="fiscal_year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="net_result" radius={[4, 4, 0, 0]} name="Net Result">
                  {data.filter(d => d.net_result !== null).map((entry, i) => (
                    <rect key={i} fill={(entry.net_result as number) >= 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assets */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.filter(d => d.total_assets)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="fiscal_year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Line type="monotone" dataKey="total_assets" stroke="#3B82F6" strokeWidth={2} name="Total Assets" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="net_assets" stroke="#8B5CF6" strokeWidth={2} name="Net Assets" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
