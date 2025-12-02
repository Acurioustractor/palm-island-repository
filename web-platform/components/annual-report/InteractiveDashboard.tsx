'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Filter,
  Download, ChevronDown, Info, Users, Calendar
} from 'lucide-react';

interface ServiceMetric {
  id: string;
  name: string;
  category: string;
  metrics: {
    people_served: number;
    sessions: number;
    satisfaction: number;
    year_over_year_change: number;
  };
  monthlyData: number[];
}

interface InteractiveDashboardProps {
  data: ServiceMetric[];
  year: number;
  title?: string;
  description?: string;
}

export function InteractiveDashboard({
  data,
  year,
  title = 'Explore Our Impact Data',
  description = 'Interact with the data to see our community impact',
}: InteractiveDashboardProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'service' | 'timeline'>('overview');
  const [showComparison, setShowComparison] = useState(false);

  const totals = useMemo(() => {
    return {
      people_served: data.reduce((sum, s) => sum + s.metrics.people_served, 0),
      sessions: data.reduce((sum, s) => sum + s.metrics.sessions, 0),
      avgSatisfaction: data.reduce((sum, s) => sum + s.metrics.satisfaction, 0) / data.length,
      avgChange: data.reduce((sum, s) => sum + s.metrics.year_over_year_change, 0) / data.length,
    };
  }, [data]);

  const selectedServiceData = selectedService
    ? data.find((s) => s.id === selectedService) ?? null
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-teal-100 mt-1">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {year} Data
            </span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          {(['overview', 'service', 'timeline'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-white text-teal-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {mode === 'overview' && 'Overview'}
              {mode === 'service' && 'By Service'}
              {mode === 'timeline' && 'Timeline'}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center">
        {viewMode === 'service' && (
          <div className="relative">
            <select
              value={selectedService || ''}
              onChange={(e) => setSelectedService(e.target.value || null)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Services</option>
              {data.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showComparison}
            onChange={(e) => setShowComparison(e.target.checked)}
            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          Compare with {year - 1}
        </label>

        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {viewMode === 'overview' && (
            <OverviewView
              key="overview"
              totals={totals}
              data={data}
              showComparison={showComparison}
              year={year}
            />
          )}
          {viewMode === 'service' && (
            <ServiceView
              key="service"
              data={data}
              selectedService={selectedServiceData}
              showComparison={showComparison}
            />
          )}
          {viewMode === 'timeline' && (
            <TimelineView
              key="timeline"
              data={data}
              year={year}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Info className="w-4 h-4" />
          <span>Data collected from community services throughout {year}</span>
        </div>
        <div className="flex gap-4">
          <button className="text-teal-600 hover:text-teal-700">
            Download as CSV
          </button>
          <button className="text-teal-600 hover:text-teal-700">
            Download as Excel
          </button>
        </div>
      </div>
    </div>
  );
}

function OverviewView({
  totals,
  data,
  showComparison,
  year,
}: {
  totals: {
    people_served: number;
    sessions: number;
    avgSatisfaction: number;
    avgChange: number;
  };
  data: ServiceMetric[];
  showComparison: boolean;
  year: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="People Served"
          value={totals.people_served}
          change={showComparison ? 12 : undefined}
          icon={<Users className="w-5 h-5" />}
          color="teal"
        />
        <MetricCard
          label="Total Sessions"
          value={totals.sessions}
          change={showComparison ? 8 : undefined}
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          label="Avg Satisfaction"
          value={totals.avgSatisfaction}
          unit="/5"
          decimals={1}
          change={showComparison ? 5 : undefined}
          icon={<BarChart3 className="w-5 h-5" />}
          color="amber"
        />
        <MetricCard
          label="Year-over-Year"
          value={totals.avgChange}
          unit="%"
          decimals={1}
          isPercentage
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* Service Breakdown */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Breakdown</h3>
      <div className="space-y-3">
        {data.map((service) => (
          <ServiceBar
            key={service.id}
            service={service}
            maxValue={Math.max(...data.map((s) => s.metrics.people_served))}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ServiceView({
  data,
  selectedService,
  showComparison,
}: {
  data: ServiceMetric[];
  selectedService: ServiceMetric | null;
  showComparison: boolean;
}) {
  const displayData = selectedService ? [selectedService] : data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayData.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{service.name}</h4>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {service.category}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">People Served</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">
                    {service.metrics.people_served.toLocaleString()}
                  </span>
                  {showComparison && (
                    <ChangeIndicator value={service.metrics.year_over_year_change} />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sessions</span>
                <span className="font-bold text-gray-900">
                  {service.metrics.sessions.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Satisfaction</span>
                <span className="font-bold text-gray-900">
                  {service.metrics.satisfaction.toFixed(1)}/5
                </span>
              </div>

              {/* Mini sparkline */}
              <div className="h-12 flex items-end gap-0.5">
                {service.monthlyData.map((value, i) => {
                  const max = Math.max(...service.monthlyData);
                  const height = (value / max) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-teal-200 hover:bg-teal-400 transition-colors rounded-t"
                      style={{ height: `${height}%` }}
                      title={`Month ${i + 1}: ${value}`}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function TimelineView({ data, year }: { data: ServiceMetric[]; year: number }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Aggregate monthly data across all services
  const aggregatedMonthly = months.map((_, i) => {
    return data.reduce((sum, service) => sum + (service.monthlyData[i] || 0), 0);
  });

  const maxValue = Math.max(...aggregatedMonthly);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-64 flex items-end gap-2">
        {aggregatedMonthly.map((value, i) => {
          const height = (value / maxValue) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t hover:from-teal-700 hover:to-teal-500 transition-colors cursor-pointer group relative"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {value.toLocaleString()} people
                </div>
              </motion.div>
              <span className="text-xs text-gray-500 mt-2">{months[i]}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Key Observations</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Peak service delivery in {months[aggregatedMonthly.indexOf(maxValue)]}</li>
          <li>Consistent growth throughout {year}</li>
          <li>Total reach: {aggregatedMonthly.reduce((a, b) => a + b, 0).toLocaleString()} service interactions</li>
        </ul>
      </div>
    </motion.div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  decimals = 0,
  change,
  isPercentage,
  icon,
  color,
}: {
  label: string;
  value: number;
  unit?: string;
  decimals?: number;
  change?: number;
  isPercentage?: boolean;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', icon: 'text-teal-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600' },
    green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' },
  };

  const colors = colorClasses[color] || colorClasses.teal;

  return (
    <div className={`p-4 rounded-xl ${colors.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={colors.icon}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${colors.text}`}>
          {isPercentage && value > 0 && '+'}
          {decimals > 0 ? value.toFixed(decimals) : value.toLocaleString()}
        </span>
        {unit && <span className="text-lg text-gray-500">{unit}</span>}
      </div>
      {change !== undefined && <ChangeIndicator value={change} />}
    </div>
  );
}

function ChangeIndicator({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isPositive && '+'}
      {value}%
    </span>
  );
}

function ServiceBar({
  service,
  maxValue,
}: {
  service: ServiceMetric;
  maxValue: number;
}) {
  const percentage = (service.metrics.people_served / maxValue) * 100;

  return (
    <div className="group cursor-pointer">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600 transition-colors">
          {service.name}
        </span>
        <span className="text-sm text-gray-500">
          {service.metrics.people_served.toLocaleString()}
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full group-hover:from-teal-600 group-hover:to-emerald-600 transition-colors"
        />
      </div>
    </div>
  );
}

export default InteractiveDashboard;
