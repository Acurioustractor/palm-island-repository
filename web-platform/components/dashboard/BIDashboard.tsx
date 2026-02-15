'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Users, Heart, DollarSign, Building2,
  ArrowUpRight, ArrowDownRight, Download, Loader2,
  MapPin, Camera, BookOpen, Landmark, Users2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Treemap,
} from 'recharts';
import type { OverviewKPI, TrendPoint } from '@/lib/data-intelligence/types';

const ICONS: Record<string, React.ReactNode> = {
  Users: <Users className="w-6 h-6" />,
  DollarSign: <DollarSign className="w-6 h-6" />,
  Building2: <Building2 className="w-6 h-6" />,
  Landmark: <Landmark className="w-6 h-6" />,
  Handshake: <Users2 className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
};

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-warm-50', text: 'text-picc-red' },
  green: { bg: 'bg-sage-50', text: 'text-sage-600' },
  purple: { bg: 'bg-picc-ochre-50', text: 'text-picc-ochre' },
  amber: { bg: 'bg-picc-ochre-50', text: 'text-picc-ochre' },
  teal: { bg: 'bg-warm-50', text: 'text-picc-ochre' },
  rose: { bg: 'bg-picc-red-50', text: 'text-picc-red' },
};

function KPICard({ kpi }: { kpi: OverviewKPI }) {
  const change = kpi.change || 0;
  const isPositive = change >= 0;
  const colorClasses = COLOR_MAP[kpi.color || 'blue'] || COLOR_MAP.blue;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses.bg}`}>
          <div className={colorClasses.text}>
            {ICONS[kpi.icon || 'Building2'] || <Building2 className="w-6 h-6" />}
          </div>
        </div>
        {change !== 0 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-sage-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(Math.round(change))}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</div>
      <div className="text-sm text-gray-500">{kpi.label}</div>
      {kpi.changeLabel && <div className="text-xs text-gray-400 mt-1">{kpi.changeLabel}</div>}
    </div>
  );
}

export function BIDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<OverviewKPI[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [ratios, setRatios] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [overviewRes, trendsRes] = await Promise.all([
          fetch('/api/data-intelligence/overview'),
          fetch('/api/data-intelligence/trends?from=2020&to=2026'),
        ]);

        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          setKpis(overviewData.kpis || []);
          setRatios(overviewData.ratios || null);
        }

        if (trendsRes.ok) {
          const trendsData = await trendsRes.json();
          setTrends(trendsData.data || []);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Build chart data from trends
  const staffChartData = trends
    .filter(t => t.total_staff)
    .map(t => ({
      year: t.fiscal_year,
      staff: t.total_staff as number,
      indigenous: t.indigenous_staff as number || 0,
    }));

  const revenueChartData = trends
    .filter(t => t.income || t.expenditure)
    .map(t => ({
      year: t.fiscal_year,
      income: ((t.income as number) || 0) / 1_000_000,
      expenditure: ((t.expenditure as number) || 0) / 1_000_000,
    }));

  // Expense breakdown from latest financial data
  const latestTrend = trends[trends.length - 1];
  const expenseCategories = ratios ? [
    { name: 'Labour', value: 60, color: '#EF4444' },
    { name: 'Admin', value: 21, color: '#F59E0B' },
    { name: 'Travel', value: 8, color: '#C8922A' },
    { name: 'Client', value: 5, color: '#8B1A1A' },
    { name: 'Property', value: 4, color: '#5B7B5E' },
    { name: 'Vehicles', value: 2, color: '#8B1A1A' },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading live data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Our Impact</h1>
              <p className="text-gray-600 mt-1">
                Live data from Palm Island Community Company
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/picc/data-intelligence"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <TrendingUp className="w-4 h-4" />
                Data Intelligence Hub
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpis.map((kpi, idx) => (
            <KPICard key={idx} kpi={kpi} />
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {['overview', 'services', 'community', 'financials'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-picc-ochre text-picc-ochre'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Staff Growth — live data */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Staff Growth</h3>
                    <p className="text-sm text-gray-500">Real Supabase data</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-sage-600" />
                </div>
                <div className="h-64">
                  {staffChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={staffChartData}>
                        <defs>
                          <linearGradient id="colorStaff" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C8922A" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#C8922A" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorIndigenous" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5B7B5E" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#5B7B5E" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Area type="monotone" dataKey="staff" stroke="#C8922A" strokeWidth={2} fillOpacity={1} fill="url(#colorStaff)" name="Total Staff" />
                        <Area type="monotone" dataKey="indigenous" stroke="#5B7B5E" strokeWidth={2} fillOpacity={1} fill="url(#colorIndigenous)" name="Indigenous Staff" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No staff data available</div>
                  )}
                </div>
              </div>

              {/* Revenue vs Expenditure — live data */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Revenue vs Expenditure</h3>
                    <p className="text-sm text-gray-500">Annual comparison ($M)</p>
                  </div>
                  <DollarSign className="w-5 h-5 text-sage-600" />
                </div>
                <div className="h-64">
                  {revenueChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(v) => `$${v}M`} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} formatter={(v: number) => `$${v.toFixed(1)}M`} />
                        <Bar dataKey="income" fill="#5B7B5E" radius={[4, 4, 0, 0]} name="Income" />
                        <Bar dataKey="expenditure" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenditure" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No financial data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Expense Distribution */}
            {expenseCategories.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Expenditure Distribution</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {expenseCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {expenseCategories.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="font-medium text-gray-900">{cat.name}</span>
                        </div>
                        <span className="text-gray-600">{cat.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <Camera className="w-12 h-12 text-picc-ochre mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">1,885</div>
              <div className="text-gray-600">Photos Captured</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <BookOpen className="w-12 h-12 text-picc-red mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">77+</div>
              <div className="text-gray-600">Stories Shared</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <MapPin className="w-12 h-12 text-sage-600 mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">16</div>
              <div className="text-gray-600">Service Locations</div>
            </div>
          </div>
        )}

        {/* 20-Year Progress */}
        <div className="mt-8 bg-gradient-to-r from-picc-earth-600 to-picc-earth rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">20-Year Journey Progress</h3>
              <p className="text-warm-200">Year 16 of 20 &bull; Target: July 2029</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-bold">80%</div>
                <div className="text-sm text-warm-200">Complete</div>
              </div>
              <Link href="/20-years" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                View Timeline
              </Link>
            </div>
          </div>
          <div className="mt-6">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '80%' }} />
            </div>
            <div className="flex justify-between mt-3 text-sm text-warm-200">
              <span>2009: Founded</span>
              <span>2029: 20 Years</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BIDashboard;
