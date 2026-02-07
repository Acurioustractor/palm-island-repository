'use client';

import { DollarSign, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';

export interface FinancialData {
  total_income: number | null;
  labour_costs: number | null;
  administration_expenses: number | null;
  property_energy_expenses: number | null;
  motor_vehicle_expenses: number | null;
  travel_training_expenses: number | null;
  client_related_costs: number | null;
  current_assets: number | null;
  non_current_assets: number | null;
  current_liabilities: number | null;
  non_current_liabilities: number | null;
  audited: boolean;
  auditor_name: string | null;
}

interface FinancialSummaryProps {
  current: FinancialData | null;
  previous: FinancialData | null;
  fiscalYear: string;
}

function fmt(value: number | null | undefined): string {
  if (value == null) return '$0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function fmtFull(value: number | null | undefined): string {
  if (value == null) return '$0';
  return `$${Math.round(value).toLocaleString()}`;
}

function val(v: number | null | undefined): number {
  return v ?? 0;
}

function totalExpenditure(d: FinancialData | null): number {
  if (!d) return 0;
  return val(d.labour_costs) + val(d.administration_expenses) + val(d.property_energy_expenses)
    + val(d.motor_vehicle_expenses) + val(d.travel_training_expenses) + val(d.client_related_costs);
}

function totalAssets(d: FinancialData | null): number {
  if (!d) return 0;
  return val(d.current_assets) + val(d.non_current_assets);
}

function totalLiabilities(d: FinancialData | null): number {
  if (!d) return 0;
  return val(d.current_liabilities) + val(d.non_current_liabilities);
}

const EXPENDITURE_COLORS = [
  { label: 'Labour Costs', key: 'labour_costs' as const, color: '#4a7fb5' },
  { label: 'Administration', key: 'administration_expenses' as const, color: '#9b8ec4' },
  { label: 'Property & Energy', key: 'property_energy_expenses' as const, color: '#6dc4a0' },
  { label: 'Motor Vehicle', key: 'motor_vehicle_expenses' as const, color: '#f59e0b' },
  { label: 'Travel & Training', key: 'travel_training_expenses' as const, color: '#7fb5b5' },
  { label: 'Client Related', key: 'client_related_costs' as const, color: '#ef6461' },
];

function DonutChart({ data }: { data: FinancialData }) {
  const total = totalExpenditure({ ...data } as FinancialData);
  if (total === 0) return null;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = EXPENDITURE_COLORS.map(({ key, color }) => {
    const value = val(data[key]);
    const pct = value / total;
    const dashLength = pct * circumference;
    const segment = { color, dashLength, dashOffset: offset, pct };
    offset += dashLength;
    return segment;
  });

  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={seg.color}
          strokeWidth="32"
          strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
          strokeDashoffset={-seg.dashOffset}
          transform="rotate(-90 100 100)"
        />
      ))}
      <text x="100" y="95" textAnchor="middle" className="fill-gray-900 text-sm font-bold">
        {fmt(total)}
      </text>
      <text x="100" y="115" textAnchor="middle" className="fill-gray-500 text-[10px]">
        Total Expenditure
      </text>
    </svg>
  );
}

export default function FinancialSummary({ current, previous, fiscalYear }: FinancialSummaryProps) {
  if (!current) return null;

  const income = val(current.total_income);
  const expend = totalExpenditure(current);
  const surplus = income - expend;
  const assets = totalAssets(current);
  const liabilities = totalLiabilities(current);
  const netAssets = assets - liabilities;

  const prevIncome = val(previous?.total_income);
  const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Headline Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Income" value={fmt(income)} change={incomeChange} />
        <SummaryCard label="Total Expenditure" value={fmt(expend)} />
        <SummaryCard
          label="Net Surplus"
          value={fmt(surplus)}
          positive={surplus >= 0}
        />
        <SummaryCard label="Net Assets" value={fmt(netAssets)} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Expenditure Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Expenditure Breakdown</h3>
          <DonutChart data={current} />
          <div className="mt-4 grid grid-cols-2 gap-2">
            {EXPENDITURE_COLORS.map(({ label, key, color }) => {
              const value = val(current[key]);
              const pct = expend > 0 ? Math.round(value / expend * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-gray-600">{label}</span>
                  <span className="ml-auto font-semibold text-gray-900">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Balance Sheet Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Balance Sheet</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">Item</th>
                <th className="text-right py-2 text-gray-500 font-medium">{fiscalYear}</th>
                {previous && (
                  <th className="text-right py-2 text-gray-500 font-medium">Prior Year</th>
                )}
              </tr>
            </thead>
            <tbody>
              <BalanceRow label="Current Assets" current={val(current.current_assets)} previous={previous ? val(previous.current_assets) : undefined} />
              <BalanceRow label="Non-Current Assets" current={val(current.non_current_assets)} previous={previous ? val(previous.non_current_assets) : undefined} />
              <BalanceRow label="Total Assets" current={assets} previous={previous ? totalAssets(previous) : undefined} bold />
              <BalanceRow label="Current Liabilities" current={val(current.current_liabilities)} previous={previous ? val(previous.current_liabilities) : undefined} />
              <BalanceRow label="Non-Current Liabilities" current={val(current.non_current_liabilities)} previous={previous ? val(previous.non_current_liabilities) : undefined} />
              <BalanceRow label="Total Liabilities" current={liabilities} previous={previous ? totalLiabilities(previous) : undefined} bold />
              <BalanceRow label="Net Assets" current={netAssets} previous={previous ? totalAssets(previous) - totalLiabilities(previous) : undefined} bold highlight />
            </tbody>
          </table>
        </div>
      </div>

      {/* Income vs Expenditure */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Income & Expenditure Statement</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">Category</th>
              <th className="text-right py-2 text-gray-500 font-medium">{fiscalYear}</th>
              {previous && (
                <th className="text-right py-2 text-gray-500 font-medium">Prior Year</th>
              )}
            </tr>
          </thead>
          <tbody>
            <BalanceRow label="Income" current={income} previous={previous ? val(previous.total_income) : undefined} bold />
            {EXPENDITURE_COLORS.map(({ label, key }) => (
              <BalanceRow
                key={key}
                label={label}
                current={val(current[key])}
                previous={previous ? val(previous[key]) : undefined}
              />
            ))}
            <BalanceRow label="Total Expenditure" current={expend} previous={previous ? totalExpenditure(previous) : undefined} bold />
            <BalanceRow
              label="Net Surplus (Deficit)"
              current={surplus}
              previous={previous ? val(previous.total_income) - totalExpenditure(previous) : undefined}
              bold
              highlight
            />
          </tbody>
        </table>
      </div>

      {/* Audited Badge */}
      {current.audited && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Independently Audited</p>
            {current.auditor_name && (
              <p className="text-sm text-green-700">Audited by {current.auditor_name}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, change, positive }: {
  label: string;
  value: string;
  change?: number;
  positive?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {change != null && change !== 0 && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{change > 0 ? '+' : ''}{change.toFixed(1)}% YoY</span>
        </div>
      )}
      {positive !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{positive ? 'Surplus' : 'Deficit'}</span>
        </div>
      )}
    </div>
  );
}

function BalanceRow({ label, current, previous, bold, highlight }: {
  label: string;
  current: number;
  previous?: number;
  bold?: boolean;
  highlight?: boolean;
}) {
  const cls = [
    'border-b border-gray-100',
    bold ? 'font-semibold' : '',
    highlight ? 'bg-green-50' : '',
  ].filter(Boolean).join(' ');

  return (
    <tr className={cls}>
      <td className={`py-2 ${bold ? 'text-gray-900' : 'text-gray-700'}`}>{label}</td>
      <td className="py-2 text-right text-gray-900">{fmtFull(current)}</td>
      {previous !== undefined && (
        <td className="py-2 text-right text-gray-500">{fmtFull(previous)}</td>
      )}
    </tr>
  );
}
