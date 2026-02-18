'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Users, DollarSign, Building2,
  ArrowUpRight, ArrowDownRight, Download,
  Calendar, BarChart3, Activity, Target,
  ChevronRight
} from 'lucide-react';
import { STAFF, FINANCIALS, MILESTONES } from '@/lib/stats/current-stats';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// Types
interface MetricData {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface ImpactPageProps {
  staffTotal: number;
  staffIndigenousPct: number;
  servicesTotal: number;
  incomeDisplay: string;
  fiscalYear: string;
}

// Data sourced from PICC Annual Reports — history is static (changes annually)
const generateData = () => ({
  staffGrowth: [
    ...STAFF.history,
  ],
});

function MetricCard({ metric, index }: { metric: MetricData; index: number }) {
  const isPositive = metric.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${metric.color.replace('from-', 'bg-').replace('to-', '').split(' ')[0].replace('picc-ochre', 'warm-100').replace('picc-red', 'warm-100').replace('sage-500', 'sage-100')}`}>
              {metric.icon}
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-sage-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(metric.change)}%
            </div>
          </div>

          <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
          <div className="text-sm text-gray-500 font-medium">{metric.label}</div>
          <div className="text-xs text-gray-400 mt-1">{metric.changeLabel}</div>
        </div>
      </div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
        active
          ? 'border-picc-ochre text-picc-ochre'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

export default function ImpactPageClient({ staffTotal, staffIndigenousPct, servicesTotal, incomeDisplay, fiscalYear }: ImpactPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [data] = useState(generateData());

  const metrics: MetricData[] = [
    {
      label: 'Total Staff',
      value: staffTotal,
      change: 30,
      changeLabel: 'from 2023',
      icon: <Users className="w-6 h-6 text-picc-red" />,
      color: 'from-picc-red to-picc-red',
      trend: 'up'
    },
    {
      label: 'Integrated Services',
      value: servicesTotal,
      change: 0,
      changeLabel: 'community-controlled',
      icon: <Building2 className="w-6 h-6 text-picc-ochre" />,
      color: 'from-picc-ochre to-picc-ochre',
      trend: 'neutral'
    },
    {
      label: 'Indigenous Workforce',
      value: `${staffIndigenousPct}%`,
      change: 0,
      changeLabel: 'maintained since establishment',
      icon: <Users className="w-6 h-6 text-picc-red" />,
      color: 'from-picc-red to-picc-red',
      trend: 'neutral'
    },
    {
      label: 'Annual Income',
      value: incomeDisplay,
      change: 15,
      changeLabel: `FY ${fiscalYear}`,
      icon: <DollarSign className="w-6 h-6 text-sage-600" />,
      color: 'from-sage-500 to-sage-600',
      trend: 'up'
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <div className="relative bg-gradient-to-br from-gray-900 via-picc-earth to-picc-earth-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-picc-ochre rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-picc-red rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4"
              >
                <Activity className="w-4 h-4" />
                Impact Dashboard — FY {fiscalYear}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold mb-3"
              >
                Our Impact
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-warm-200 max-w-2xl"
              >
                Data from FY {fiscalYear} Annual Report
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <Link
                href="/annual-report/live"
                className="inline-flex items-center gap-2 px-4 py-3 bg-white text-picc-earth rounded-xl font-semibold hover:bg-warm-50 transition-colors"
              >
                <Download className="w-5 h-5" />
                View Annual Report
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KEY METRICS */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {metrics.map((metric, idx) => (
            <MetricCard key={idx} metric={metric} index={idx} />
          ))}
        </motion.div>

        {/* TABS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex gap-2 px-6 border-b border-gray-100 overflow-x-auto">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={BarChart3} label="Overview" />
            <TabButton active={activeTab === 'services'} onClick={() => setActiveTab('services')} icon={Building2} label="Services" />
            <TabButton active={activeTab === 'community'} onClick={() => setActiveTab('community')} icon={Users} label="Community" />
            <TabButton active={activeTab === 'financials'} onClick={() => setActiveTab('financials')} icon={DollarSign} label="Financials" />
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Staff Growth — Real Data */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Staff Growth</h3>
                        <p className="text-sm text-gray-500">{staffIndigenousPct}% Indigenous employment</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-sage-600 font-medium">
                        <TrendingUp className="w-4 h-4" />
                        +{staffTotal - STAFF.history[0].staff} since {STAFF.history[0].year}
                      </div>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.staffGrowth}>
                          <defs>
                            <linearGradient id="colorIndigenous" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C8922A" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#C8922A" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B1A1A" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#8B1A1A" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            formatter={(value: number) => [`${value} staff`, '']}
                          />
                          <Area type="monotone" dataKey="staff" stroke="#8B1A1A" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Staff" />
                          <Area type="monotone" dataKey="indigenous" stroke="#C8922A" strokeWidth={2} fillOpacity={1} fill="url(#colorIndigenous)" name="Indigenous Staff" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Expenditure Breakdown — Real Data */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Expenditure Breakdown — FY {fiscalYear}</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Labour Costs', ...FINANCIALS.breakdown.labourCosts },
                        { name: 'Admin Expenses', ...FINANCIALS.breakdown.adminExpenses },
                        { name: 'Travel & Training', ...FINANCIALS.breakdown.travelTraining },
                        { name: 'Client Costs', ...FINANCIALS.breakdown.clientCosts },
                        { name: 'Property & Energy', ...FINANCIALS.breakdown.propertyEnergy },
                        { name: 'Motor Vehicles', ...FINANCIALS.breakdown.motorVehicle },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center gap-4">
                          <div className="w-36 text-sm font-medium text-gray-700">{item.name}</div>
                          <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-picc-ochre rounded-full"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                          <div className="w-20 text-right text-sm font-semibold text-gray-900">{item.pct}%</div>
                          <div className="w-28 text-right text-sm text-gray-500">{formatCurrency(item.amount)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'services' && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center py-16"
                >
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{servicesTotal} Integrated Services</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Per-service performance data will be available when service-level reporting is connected. View individual services for current information.
                  </p>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-picc-ochre text-white rounded-xl font-semibold hover:bg-picc-ochre/90 transition-colors"
                  >
                    Browse Services <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}

              {activeTab === 'community' && (
                <motion.div
                  key="community"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid md:grid-cols-3 gap-6"
                >
                  <div className="bg-gradient-to-br from-picc-ochre to-picc-ochre rounded-2xl p-6 text-white">
                    <Users className="w-10 h-10 mb-4 opacity-80" />
                    <div className="text-4xl font-bold mb-1">{staffTotal}</div>
                    <div className="text-warm-100">Staff Members</div>
                    <div className="mt-4 text-sm text-warm-200">{staffIndigenousPct}% Indigenous workforce</div>
                  </div>
                  <div className="bg-gradient-to-br from-picc-red to-picc-red rounded-2xl p-6 text-white">
                    <Building2 className="w-10 h-10 mb-4 opacity-80" />
                    <div className="text-4xl font-bold mb-1">{servicesTotal}</div>
                    <div className="text-warm-100">Integrated Services</div>
                    <div className="mt-4 text-sm text-warm-200">Community-controlled</div>
                  </div>
                  <div className="bg-gradient-to-br from-sage-500 to-sage-600 rounded-2xl p-6 text-white">
                    <DollarSign className="w-10 h-10 mb-4 opacity-80" />
                    <div className="text-4xl font-bold mb-1">{incomeDisplay}</div>
                    <div className="text-sage-100">Annual Income</div>
                    <div className="mt-4 text-sm text-sage-200">FY {fiscalYear}</div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'financials' && (
                <motion.div
                  key="financials"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenditure by Category</h3>
                    <p className="text-sm text-gray-500 mb-6">FY {fiscalYear} — Total: ${(FINANCIALS.totalExpenditure / 1_000_000).toFixed(1)}M</p>
                    <div className="space-y-3">
                      {[
                        { name: 'Labour Costs', ...FINANCIALS.breakdown.labourCosts },
                        { name: 'Admin Expenses', ...FINANCIALS.breakdown.adminExpenses },
                        { name: 'Travel & Training', ...FINANCIALS.breakdown.travelTraining },
                        { name: 'Client Costs', ...FINANCIALS.breakdown.clientCosts },
                        { name: 'Property & Energy', ...FINANCIALS.breakdown.propertyEnergy },
                        { name: 'Motor Vehicles', ...FINANCIALS.breakdown.motorVehicle },
                      ].map((item) => (
                        <div key={item.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{item.name}</span>
                            <span className="text-gray-500">{formatCurrency(item.amount)} ({item.pct}%)</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-picc-ochre rounded-full" style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-sage-50 border border-sage-100 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sage-700 font-medium">Total Income</span>
                        <TrendingUp className="w-5 h-5 text-sage-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{incomeDisplay}</div>
                      <div className="text-sage-600 text-sm mt-1">FY {fiscalYear}</div>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-red-700 font-medium">Total Expenses</span>
                        <TrendingUp className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">${(FINANCIALS.totalExpenditure / 1_000_000).toFixed(1)}M</div>
                      <div className="text-red-600 text-sm mt-1">FY {fiscalYear}</div>
                    </div>
                    <div className="bg-warm-100 border border-warm-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-picc-ochre font-medium">Net Result</span>
                        <Target className="w-5 h-5 text-picc-ochre" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">-${Math.abs(FINANCIALS.netResult / 1_000).toFixed(0)}K</div>
                      <div className="text-picc-ochre text-sm mt-1">Invested in growth</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 20-YEAR PROGRESS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-picc-earth via-picc-earth-700 to-picc-earth-700 rounded-2xl p-8 text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-warm-300" />
                <h3 className="text-xl font-semibold">20-Year Journey Progress</h3>
              </div>
              <p className="text-warm-200">Year {MILESTONES.currentYear} of 20 • Target: July 2029</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-4xl font-bold">{MILESTONES.progressPct}%</div>
                <div className="text-sm text-warm-200">Complete</div>
              </div>
              <Link
                href="/20-years"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
              >
                View Timeline
              </Link>
            </div>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${MILESTONES.progressPct}%` }}
              transition={{ duration: 1.5, delay: 0.8 }}
              className="h-full bg-gradient-to-r from-picc-ochre-300 via-picc-red-300 to-picc-red rounded-full"
            />
          </div>
          <div className="flex justify-between mt-3 text-sm text-warm-200">
            <span>2009: Founded</span>
            <span>2029: 20 Years</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
