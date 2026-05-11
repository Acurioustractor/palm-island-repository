'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, DollarSign, Building2,
  ArrowUpRight, Download,
  Calendar, Activity, Target, ChevronRight,
} from 'lucide-react';
import VideoHero from '@/components/video/VideoHero';
import { assetUrl } from '@/lib/media/asset-url';
import { FINANCIALS, MILESTONES } from '@/lib/stats/current-stats';
import { C } from '@/components/annual-report/2024-25/almanac/tokens';
import { BarChart, Bar, Legend } from 'recharts';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ExpenseBreakdown {
  labourCosts: { amount: number; pct: number };
  adminExpenses: { amount: number; pct: number };
  travelTraining: { amount: number; pct: number };
  clientCosts: { amount: number; pct: number };
  propertyEnergy: { amount: number; pct: number };
  motorVehicle: { amount: number; pct: number };
}

export interface ImpactPageProps {
  staffTotal: number;
  staffIndigenousPct: number;
  servicesTotal: number;
  incomeDisplay: string;
  fiscalYear: string;
  heroImage?: string | null;
  heroVideoSrc?: string | null;
  incomeHistory: { year: string; income: number; labour: number; admin: number; travel: number; clientCosts: number; property: number; vehicles: number }[];
  expenseBreakdown: ExpenseBreakdown | null;
  staffHistory: { year: string; staff: number; indigenous: number }[];
  latestServiceData: { clients: number; sessions: number };
  latestServiceYear: string | null;
  leadership?: { text: string; author: string } | null;
  impactVoices?: { text: string; author: string; theme: string | null }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMillions(value: number) {
  return `$${(value / 1_000_000).toFixed(1)}M`;
}

/** Compute real year-over-year percentage change from an array of numbers */
function yoyChange(history: number[]): number | null {
  if (history.length < 2) return null;
  const prev = history[history.length - 2];
  const curr = history[history.length - 1];
  if (prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function HeroStat({
  label,
  value,
  change,
  icon,
  index,
}: {
  label: string;
  value: string | number;
  change: number | null;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-warm-100">{icon}</div>
        {change !== null && (
          <div className="flex items-center gap-1 text-sm font-semibold text-sage-600">
            <ArrowUpRight className="w-4 h-4" />
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
    </motion.div>
  );
}

function SectionHeading({ title, subtitle, eyebrow }: { title: string; subtitle?: string; eyebrow?: string }) {
  return (
    <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-6">
      {eyebrow && (
        <p
          className="font-bold uppercase mb-2"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="font-fraunces font-bold"
        style={{ color: C.ocean, fontSize: 'clamp(24px, 3vw, 32px)', lineHeight: 1.15 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="font-fraunces mt-2"
          style={{ color: C.driftwood, fontSize: 16, lineHeight: 1.55 }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ImpactPageClient({
  staffTotal,
  staffIndigenousPct,
  servicesTotal,
  incomeDisplay,
  fiscalYear,
  heroImage,
  heroVideoSrc,
  incomeHistory,
  expenseBreakdown,
  staffHistory,
  latestServiceData,
  latestServiceYear,
  leadership,
  impactVoices = [],
}: ImpactPageProps) {
  // Compute real YoY changes
  const incomeChange = yoyChange(incomeHistory.map((d) => d.income));
  const staffChange = yoyChange(staffHistory.map((d) => d.staff));

  // Derive span label
  const firstYear = incomeHistory[0]?.year ?? staffHistory[0]?.year ?? '2009';
  const lastYear =
    incomeHistory[incomeHistory.length - 1]?.year ??
    staffHistory[staffHistory.length - 1]?.year ??
    fiscalYear;
  const spanLabel = `${firstYear}–${lastYear}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.shell }}>
      {/* ================================================================ */}
      {/* HERO                                                             */}
      {/* ================================================================ */}
      <VideoHero
        videoSrc={heroVideoSrc || assetUrl('/hero-assets/clips/youth-team-group.mp4')}
        overlay="gradient-brand"
        height="tall"
        parallax
        aria-label="Impact journey — Palm Island Community Company"
      >
        <div className="text-center text-white max-w-4xl mx-auto">
          <p
            className="font-bold uppercase mb-4 inline-flex items-center gap-2"
            style={{ color: '#F5E9D0', fontSize: 11, letterSpacing: '0.3em', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
          >
            <Activity className="w-3.5 h-3.5" />
            {MILESTONES.yearsOperating} years of community impact
          </p>

          <h1
            className="font-fraunces font-bold mb-4"
            style={{ fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.05, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
          >
            Our impact journey
          </h1>

          <p
            className="font-fraunces max-w-2xl mx-auto mb-10"
            style={{ color: 'rgba(255,255,255,0.92)', fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.55, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
          >
            From humble beginnings to Palm Island&apos;s largest employer — tracking our growth across {spanLabel}.
          </p>

          <Link
            href="/annual-report/live"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
            style={{ backgroundColor: '#FFFFFF', color: C.ocean, letterSpacing: '0.15em' }}
          >
            <Download className="w-3.5 h-3.5" />
            View annual report
          </Link>
        </div>
      </VideoHero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* ================================================================ */}
        {/* HEADLINE STATS                                                   */}
        {/* ================================================================ */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <HeroStat
            label="Total Staff"
            value={staffTotal}
            change={staffChange}
            icon={<Users className="w-6 h-6 text-picc-red" />}
            index={0}
          />
          <HeroStat
            label="Integrated Services"
            value={servicesTotal}
            change={null}
            icon={<Building2 className="w-6 h-6 text-picc-ochre" />}
            index={1}
          />
          <HeroStat
            label="Indigenous Workforce"
            value={`${staffIndigenousPct}%`}
            change={null}
            icon={<Users className="w-6 h-6 text-picc-red" />}
            index={2}
          />
          <HeroStat
            label="Annual Income"
            value={incomeDisplay}
            change={incomeChange}
            icon={<DollarSign className="w-6 h-6 text-sage-600" />}
            index={3}
          />
        </motion.div>

        {/* ================================================================ */}
        {/* LEADERSHIP VOICE — Why these numbers matter                       */}
        {/* ================================================================ */}
        {leadership && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-[#0B4F6C] via-[#0a3f57] to-[#082a3a] text-white rounded-2xl p-10 md:p-14 overflow-hidden"
          >
            <div className="absolute top-6 left-8 text-picc-ochre/20 text-9xl font-serif leading-none select-none">
              &ldquo;
            </div>
            <div className="relative max-w-3xl mx-auto text-center">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
                Why these numbers matter
              </p>
              <blockquote className="font-serif italic text-xl md:text-2xl leading-relaxed mb-6">
                {leadership.text}
              </blockquote>
              <p className="text-sm text-picc-ochre">— {leadership.author}</p>
            </div>
          </motion.section>
        )}

        {/* ================================================================ */}
        {/* REVENUE GROWTH CHART                                             */}
        {/* ================================================================ */}
        {incomeHistory.length > 1 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Growth</h3>
                <p className="text-sm text-gray-500">
                  {formatMillions(incomeHistory[0].income)} &rarr; {formatMillions(incomeHistory[incomeHistory.length - 1].income)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-sage-600 font-medium">
                <TrendingUp className="w-4 h-4" />
                {spanLabel}
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incomeHistory}>
                  <defs>
                    <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b8f71" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6b8f71" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(0)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Total Income']}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#6b8f71"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradIncome)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        )}

        {/* ================================================================ */}
        {/* STAFF GROWTH CHART                                               */}
        {/* ================================================================ */}
        {staffHistory.length > 1 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Staff Growth</h3>
                <p className="text-sm text-gray-500">{staffIndigenousPct}% Indigenous employment</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-sage-600 font-medium">
                <TrendingUp className="w-4 h-4" />
                +{staffTotal - staffHistory[0].staff} since {staffHistory[0].year}
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={staffHistory}>
                  <defs>
                    <linearGradient id="colorIndigenous" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8922A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C8922A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B1A1A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8B1A1A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} staff`,
                      name === 'indigenous' ? 'Indigenous Staff' : 'Total Staff',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="staff"
                    stroke="#8B1A1A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    name="Total Staff"
                  />
                  <Area
                    type="monotone"
                    dataKey="indigenous"
                    stroke="#C8922A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIndigenous)"
                    name="Indigenous Staff"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        )}

        {/* ================================================================ */}
        {/* SERVICE DELIVERY                                                 */}
        {/* ================================================================ */}
        {(latestServiceData.clients > 0 || latestServiceData.sessions > 0) && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <SectionHeading
              title="Service Delivery"
              subtitle={latestServiceYear ? `FY ${latestServiceYear} across all programs` : undefined}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-picc-ochre to-picc-ochre rounded-2xl p-6 text-white">
                <Users className="w-10 h-10 mb-4 opacity-80" />
                <div className="text-4xl font-bold mb-1">
                  {latestServiceData.clients.toLocaleString()}
                </div>
                <div className="text-warm-100">Clients Served</div>
              </div>
              <div className="bg-gradient-to-br from-picc-red to-picc-red rounded-2xl p-6 text-white">
                <Target className="w-10 h-10 mb-4 opacity-80" />
                <div className="text-4xl font-bold mb-1">
                  {latestServiceData.sessions.toLocaleString()}
                </div>
                <div className="text-warm-100">Sessions Delivered</div>
              </div>
              <div className="bg-gradient-to-br from-sage-500 to-sage-600 rounded-2xl p-6 text-white flex flex-col justify-between">
                <div>
                  <Building2 className="w-10 h-10 mb-4 opacity-80" />
                  <div className="text-4xl font-bold mb-1">{servicesTotal}</div>
                  <div className="text-sage-100">Integrated Services</div>
                </div>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mt-4 transition-colors"
                >
                  Browse Services <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.section>
        )}

        {/* ================================================================ */}
        {/* EXPENDITURE BREAKDOWN                                            */}
        {/* ================================================================ */}
        {(() => {
          const breakdown = expenseBreakdown ?? FINANCIALS.breakdown;
          const items = [
            { name: 'Labour Costs', ...breakdown.labourCosts },
            { name: 'Admin Expenses', ...breakdown.adminExpenses },
            { name: 'Travel & Training', ...breakdown.travelTraining },
            { name: 'Client Costs', ...breakdown.clientCosts },
            { name: 'Property & Energy', ...breakdown.propertyEnergy },
            { name: 'Motor Vehicles', ...breakdown.motorVehicle },
          ].filter((i) => i.amount > 0);

          return (
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Expenditure Breakdown — FY {fiscalYear}
              </h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="w-36 text-sm font-medium text-gray-700">{item.name}</div>
                    <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-picc-ochre rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <div className="w-20 text-right text-sm font-semibold text-gray-900">
                      {item.pct}%
                    </div>
                    <div className="w-28 text-right text-sm text-gray-500">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          );
        })()}

        {/* ================================================================ */}
        {/* EXPENSE TRENDS OVER TIME                                         */}
        {/* ================================================================ */}
        {incomeHistory.length > 3 && incomeHistory.some((d) => d.labour > 0) && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Expense Growth Over Time</h3>
                <p className="text-sm text-gray-500">How expenditure categories have scaled with growth</p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeHistory.filter((d) => d.labour > 0)} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  />
                  <Legend />
                  <Bar dataKey="labour" stackId="expenses" name="Labour" fill="#8B1A1A" />
                  <Bar dataKey="admin" stackId="expenses" name="Admin" fill="#C8922A" />
                  <Bar dataKey="travel" stackId="expenses" name="Travel & Training" fill="#6b8f71" />
                  <Bar dataKey="clientCosts" stackId="expenses" name="Client Costs" fill="#D4A574" />
                  <Bar dataKey="property" stackId="expenses" name="Property" fill="#7C6F64" />
                  <Bar dataKey="vehicles" stackId="expenses" name="Vehicles" fill="#A0AEC0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        )}

        {/* ================================================================ */}
        {/* 20-YEAR PROGRESS                                                 */}
        {/* ================================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-picc-earth via-picc-earth-700 to-picc-earth-700 rounded-2xl p-8 text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-warm-300" />
                <h3 className="text-xl font-semibold">20-Year Journey Progress</h3>
              </div>
              <p className="text-warm-200">
                Year {MILESTONES.currentYear} of 20 &bull; Target: July 2029
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-4xl font-bold">{MILESTONES.progressPct}%</div>
                <div className="text-sm text-warm-200">Complete</div>
              </div>
              <Link
                href="/20-years"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition-colors"
              >
                View Timeline
              </Link>
            </div>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${MILESTONES.progressPct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-picc-ochre-300 via-picc-red-300 to-picc-red rounded-full"
            />
          </div>
          <div className="flex justify-between mt-3 text-sm text-warm-200">
            <span>2009: Founded</span>
            <span>2029: 20 Years</span>
          </div>
        </motion.section>

        {/* ================================================================ */}
        {/* YEAR-BY-YEAR BREAKDOWN — every year of growth                    */}
        {/* ================================================================ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-sm"
        >
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
              Year by year
            </p>
            <h2
              className="font-fraunces font-bold mb-2"
              style={{ color: C.ocean, fontSize: 'clamp(24px, 3.5vw, 36px)', lineHeight: 1.15 }}
            >
              Every year of the journey
            </h2>
            <p className="text-sm text-gray-500">
              From 2010 to {lastYear} — every staff member, every dollar, every milestone in one place.
            </p>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-xs uppercase tracking-wider text-gray-400">
                  <th className="text-left py-3 px-3 font-semibold">Year</th>
                  <th className="text-right py-3 px-3 font-semibold">Income</th>
                  <th className="text-right py-3 px-3 font-semibold">Total Staff</th>
                  <th className="text-right py-3 px-3 font-semibold">Indigenous</th>
                  <th className="text-right py-3 px-3 font-semibold">% Indigenous</th>
                  <th className="text-right py-3 px-3 font-semibold">Labour Costs</th>
                </tr>
              </thead>
              <tbody>
                {incomeHistory.map((fy, i) => {
                  const staffRow = staffHistory.find(s => s.year === fy.year)
                  const indigPct = staffRow && staffRow.staff > 0
                    ? Math.round((staffRow.indigenous / staffRow.staff) * 100)
                    : null
                  const isLatest = i === incomeHistory.length - 1
                  return (
                    <tr
                      key={fy.year}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        isLatest ? 'bg-picc-ochre/5 font-semibold' : ''
                      }`}
                    >
                      <td className={`py-3 px-3 ${isLatest ? 'text-picc-ochre' : 'text-gray-700'}`}>
                        {fy.year}
                        {isLatest && <span className="ml-2 text-xs font-normal text-picc-ochre/60">latest</span>}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-700">
                        {fy.income > 0 ? formatMillions(fy.income) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-700">
                        {staffRow?.staff || '—'}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-700">
                        {staffRow?.indigenous || '—'}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-700">
                        {indigPct !== null ? `${indigPct}%` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-500">
                        {fy.labour > 0 ? formatMillions(fy.labour) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td className="py-3 px-3 text-xs text-gray-400">{incomeHistory.length} years</td>
                  <td className="py-3 px-3 text-right text-xs text-gray-400">
                    {(() => {
                      const first = incomeHistory[0]?.income || 0
                      const last = incomeHistory[incomeHistory.length - 1]?.income || 0
                      const growth = first > 0 ? Math.round(((last - first) / first) * 100) : 0
                      return `+${growth}% growth`
                    })()}
                  </td>
                  <td className="py-3 px-3 text-right text-xs text-gray-400">
                    {(() => {
                      const first = staffHistory[0]?.staff || 0
                      const last = staffHistory[staffHistory.length - 1]?.staff || 0
                      return `+${last - first}`
                    })()}
                  </td>
                  <td className="py-3 px-3 text-right text-xs text-gray-400">
                    {(() => {
                      const last = staffHistory[staffHistory.length - 1]
                      return last ? `+${(last.indigenous || 0) - (staffHistory[0]?.indigenous || 0)}` : '—'
                    })()}
                  </td>
                  <td colSpan={2} className="py-3 px-3 text-right text-xs text-gray-400">
                    Source: Annual financials & staff statistics
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.section>

        {/* ================================================================ */}
        {/* COMMUNITY IMPACT VOICES                                          */}
        {/* ================================================================ */}
        {impactVoices.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="py-8"
          >
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
                Voices behind the numbers
              </p>
              <h2
                className="font-fraunces font-bold"
                style={{ color: C.ocean, fontSize: 'clamp(24px, 3.5vw, 36px)', lineHeight: 1.15 }}
              >
                What community impact sounds like
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {impactVoices.map((voice, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-2xl p-7 hover:border-picc-ochre/40 transition-colors"
                >
                  <div className="text-picc-ochre text-5xl font-serif leading-none mb-2 opacity-30">
                    &ldquo;
                  </div>
                  <p className="font-serif italic text-gray-700 leading-relaxed text-base mb-4 line-clamp-5 -mt-3">
                    {voice.text}
                  </p>
                  <p className="text-sm font-semibold text-picc-ochre">{voice.author}</p>
                  {voice.theme && (
                    <p className="text-xs text-gray-400 mt-1 capitalize">
                      {voice.theme.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/picc/pcap"
                className="inline-flex items-center gap-2 text-sm font-semibold text-picc-ochre hover:gap-3 transition-all"
              >
                Explore all 525 sovereign voices
                <span aria-hidden>→</span>
              </Link>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
