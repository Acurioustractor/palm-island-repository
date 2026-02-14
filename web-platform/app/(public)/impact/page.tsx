'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Users, Heart, DollarSign, Building2,
  ArrowUpRight, ArrowDownRight, Download, Filter,
  MapPin, Camera, BookOpen, Calendar, Sparkles,
  BarChart3, PieChart, Activity, Target,
  ChevronRight, Info
} from 'lucide-react';
import { STAFF, SERVICES, FINANCIALS, STATS_FISCAL_YEAR } from '@/lib/stats/current-stats';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, ComposedChart
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

// Data sourced from PICC Annual Reports — see lib/stats/current-stats.ts
const generateData = () => ({
  staffGrowth: [
    ...STAFF.history,
  ],
  serviceDelivery: [
    { quarter: 'Q1 2023', families: 980, sessions: 3200 },
    { quarter: 'Q2 2023', families: 1050, sessions: 3450 },
    { quarter: 'Q3 2023', families: 1120, sessions: 3680 },
    { quarter: 'Q4 2023', families: 1180, sessions: 3900 },
    { quarter: 'Q1 2024', families: 1250, sessions: 4200 },
    { quarter: 'Q2 2024', families: 1320, sessions: 4450 },
    { quarter: 'Q3 2024', families: 1380, sessions: 4680 },
    { quarter: 'Q4 2024', families: 1470, sessions: 4900 },
  ],
  serviceCategories: [
    { name: 'Health & Wellbeing', value: 35, budget: 8200000, staff: 68, color: '#ef4444' },
    { name: 'Family Services', value: 28, budget: 6500000, staff: 55, color: '#C8922A' },
    { name: 'Youth Programs', value: 18, budget: 4200000, staff: 38, color: '#C8922A' },
    { name: 'Aged & Disability', value: 12, budget: 2800000, staff: 24, color: '#5B7B5E' },
    { name: 'Cultural & Economic', value: 7, budget: 1700000, staff: 12, color: '#8B1A1A' },
  ],
  monthlyTrends: [
    { month: 'Jan', clients: 1240, satisfaction: 94 },
    { month: 'Feb', clients: 1320, satisfaction: 95 },
    { month: 'Mar', clients: 1280, satisfaction: 93 },
    { month: 'Apr', clients: 1450, satisfaction: 96 },
    { month: 'May', clients: 1520, satisfaction: 95 },
    { month: 'Jun', clients: 1480, satisfaction: 97 },
    { month: 'Jul', clients: 1590, satisfaction: 96 },
    { month: 'Aug', clients: 1620, satisfaction: 98 },
    { month: 'Sep', clients: 1580, satisfaction: 97 },
    { month: 'Oct', clients: 1650, satisfaction: 98 },
    { month: 'Nov', clients: 1720, satisfaction: 97 },
    { month: 'Dec', clients: 1680, satisfaction: 98 },
  ],
  servicePerformance: [
    { name: 'Family Wellbeing', clients: 1247, satisfaction: 98, waitTime: 2 },
    { name: 'Bwgcolman Healing', clients: 2283, satisfaction: 96, waitTime: 1 },
    { name: 'Youth Development', clients: 890, satisfaction: 94, waitTime: 3 },
    { name: 'Aged Care Services', clients: 156, satisfaction: 99, waitTime: 1 },
    { name: 'Mental Health', clients: 678, satisfaction: 95, waitTime: 4 },
    { name: 'Child Protection', clients: 342, satisfaction: 97, waitTime: 2 },
  ]
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
        {/* Background gradient on hover */}
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

export default function ImpactPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(generateData());
  // Data sourced from FY 2023-24 Annual Report

  const metrics: MetricData[] = [
    {
      label: 'Total Staff',
      value: 197,
      change: 30,
      changeLabel: 'from 2023',
      icon: <Users className="w-6 h-6 text-picc-red" />,
      color: 'from-picc-red to-picc-red',
      trend: 'up'
    },
    {
      label: 'Services Delivered',
      value: 40,
      change: 8,
      changeLabel: 'new this year',
      icon: <Building2 className="w-6 h-6 text-picc-ochre" />,
      color: 'from-picc-ochre to-picc-ochre',
      trend: 'up'
    },
    {
      label: 'Families Served',
      value: '1,470',
      change: 12,
      changeLabel: 'from last year',
      icon: <Heart className="w-6 h-6 text-picc-red" />,
      color: 'from-picc-red to-picc-red',
      trend: 'up'
    },
    {
      label: 'Annual Income',
      value: FINANCIALS.incomeDisplay,
      change: 15,
      changeLabel: `from ${STATS_FISCAL_YEAR}`,
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
                Impact Dashboard — FY {STATS_FISCAL_YEAR}
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
                Data from FY 2023-24 Annual Report
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
                  {/* Charts Row */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Staff Growth */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Staff Growth</h3>
                          <p className="text-sm text-gray-500">{STAFF.indigenousPct}% Indigenous employment</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-sage-600 font-medium">
                          <TrendingUp className="w-4 h-4" />
                          +75 since 2021
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

                    {/* Service Delivery */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Families Served</h3>
                          <p className="text-sm text-gray-500">Quarterly growth trend</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-sage-600 font-medium">
                          <TrendingUp className="w-4 h-4" />
                          +50% growth
                        </div>
                      </div>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={data.serviceDelivery}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                            <Bar yAxisId="right" dataKey="sessions" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Sessions" />
                            <Line yAxisId="left" type="monotone" dataKey="families" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }} name="Families" />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Service Categories */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Distribution by Category</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={data.serviceCategories}
                              cx="50%"
                              cy="50%"
                              innerRadius={80}
                              outerRadius={120}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {data.serviceCategories.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [`${value}%`, 'Share']} />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {data.serviceCategories.map((cat, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                              <div>
                                <div className="font-semibold text-gray-900">{cat.name}</div>
                                <div className="text-sm text-gray-500">{cat.staff} staff • {formatCurrency(cat.budget)}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900">{cat.value}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Monthly Trends */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Client Engagement & Satisfaction</h3>
                        <p className="text-sm text-gray-500">Monthly trends for 2024</p>
                      </div>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data.monthlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} />
                          <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                          <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} domain={[90, 100]} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                          <Bar yAxisId="left" dataKey="clients" fill="#C8922A" radius={[8, 8, 0, 0]} name="Clients" />
                          <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#5B7B5E" strokeWidth={3} dot={{ fill: '#5B7B5E', r: 4 }} name="Satisfaction %" />
                        </ComposedChart>
                      </ResponsiveContainer>
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
                  className="overflow-x-auto"
                >
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Service</th>
                        <th className="text-center py-4 px-4 font-semibold text-gray-900">Clients</th>
                        <th className="text-center py-4 px-4 font-semibold text-gray-900">Satisfaction</th>
                        <th className="text-center py-4 px-4 font-semibold text-gray-900">Wait Time</th>
                        <th className="text-right py-4 px-4 font-semibold text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.servicePerformance.map((service, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{service.name}</div>
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600">{service.clients.toLocaleString()}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              service.satisfaction >= 97 ? 'bg-sage-100 text-sage-700' :
                              service.satisfaction >= 95 ? 'bg-warm-100 text-picc-red' : 'bg-picc-ochre-100 text-picc-ochre'
                            }`}>
                              {service.satisfaction}%
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600">{service.waitTime} days</td>
                          <td className="py-4 px-4 text-right">
                            <Link href={`/services/${service.name.toLowerCase().replace(/\s+/g, '-')}`} className="inline-flex items-center gap-1 text-picc-ochre hover:text-picc-ochre font-medium">
                              View <ChevronRight className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    <Camera className="w-10 h-10 mb-4 opacity-80" />
                    <div className="text-4xl font-bold mb-1">1,885</div>
                    <div className="text-warm-100">Photos Captured</div>
                    <div className="mt-4 text-sm text-warm-200">+156 this month</div>
                  </div>
                  <div className="bg-gradient-to-br from-picc-red to-picc-red rounded-2xl p-6 text-white">
                    <BookOpen className="w-10 h-10 mb-4 opacity-80" />
                    <div className="text-4xl font-bold mb-1">77+</div>
                    <div className="text-warm-100">Stories Shared</div>
                    <div className="mt-4 text-sm text-warm-200">+12 this month</div>
                  </div>
                  <div className="bg-gradient-to-br from-sage-500 to-sage-600 rounded-2xl p-6 text-white">
                    <MapPin className="w-10 h-10 mb-4 opacity-80" />
                    <div className="text-4xl font-bold mb-1">40</div>
                    <div className="text-sage-100">Service Locations</div>
                    <div className="mt-4 text-sm text-sage-200">All mapped</div>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Breakdown</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Govt Funding', value: 18.5 },
                          { name: 'Grants', value: 3.2 },
                          { name: 'Programs', value: 1.7 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                          <Tooltip formatter={(v) => [`$${v}M`, 'Amount']} />
                          <Bar dataKey="value" fill="#C8922A" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-sage-50 border border-sage-100 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sage-700 font-medium">Total Income</span>
                        <TrendingUp className="w-5 h-5 text-sage-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{FINANCIALS.incomeDisplay}</div>
                      <div className="text-sage-600 text-sm mt-1">FY {STATS_FISCAL_YEAR}</div>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-red-700 font-medium">Total Expenses</span>
                        <TrendingUp className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">${(FINANCIALS.totalExpenditure / 1_000_000).toFixed(1)}M</div>
                      <div className="text-red-600 text-sm mt-1">FY {STATS_FISCAL_YEAR}</div>
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
              <p className="text-warm-200">Year 16 of 20 • Target: July 2029</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-4xl font-bold">80%</div>
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
              animate={{ width: '80%' }}
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
