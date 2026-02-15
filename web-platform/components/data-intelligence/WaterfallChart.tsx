'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { formatCurrency } from '@/lib/data-intelligence/calculations';

interface WaterfallItem {
  name: string;
  value: number;
  type: 'income' | 'expense' | 'total';
}

interface WaterfallChartProps {
  items: WaterfallItem[];
  height?: number;
}

export default function WaterfallChart({ items, height = 350 }: WaterfallChartProps) {
  // Compute waterfall data with running totals
  let running = 0;
  const data = items.map(item => {
    if (item.type === 'total') {
      const val = running;
      return { name: item.name, start: 0, value: val, total: val, isTotal: true, isNegative: val < 0 };
    }
    const start = running;
    running += item.type === 'expense' ? -item.value : item.value;
    const delta = item.type === 'expense' ? -item.value : item.value;
    return {
      name: item.name,
      start: Math.min(start, running),
      value: Math.abs(delta),
      total: running,
      isTotal: false,
      isNegative: delta < 0,
    };
  });

  const colors = {
    income: '#10B981',
    expense: '#EF4444',
    total: '#3B82F6',
    negative: '#F59E0B',
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={(v) => formatCurrency(v)}
        />
        <Tooltip
          formatter={(value: number, _name: string, props: any) => {
            const item = props.payload;
            return [formatCurrency(item.total), item.isTotal ? 'Total' : item.isNegative ? 'Expense' : 'Income'];
          }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
        />
        <ReferenceLine y={0} stroke="#9CA3AF" />
        {/* Invisible spacer bar */}
        <Bar dataKey="start" stackId="stack" fill="transparent" />
        {/* Visible value bar */}
        <Bar dataKey="value" stackId="stack" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.isTotal ? (entry.isNegative ? colors.negative : colors.total) : entry.isNegative ? colors.expense : colors.income}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
