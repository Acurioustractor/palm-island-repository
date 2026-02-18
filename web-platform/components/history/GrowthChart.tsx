'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

interface GrowthChartProps {
  years: Array<{
    fiscalYear: string
    staffCount: number | null
    annualBudget: number | null
    serviceCount: number | null
  }>
}

function formatBudget(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

export default function GrowthChart({ years }: GrowthChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const data = years
    .filter((y) => y.staffCount || y.annualBudget)
    .map((y) => ({
      year: y.fiscalYear,
      staff: y.staffCount || 0,
      budget: y.annualBudget || 0,
      services: y.serviceCount || 0,
    }))

  if (!data.length) return null

  return (
    <div ref={ref} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        17 Years of Growth
      </h3>
      <p className="text-gray-500 mb-6">Staff and budget trend over time</p>

      <div
        className="transition-opacity duration-1000"
        style={{ opacity: isInView ? 1 : 0 }}
      >
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="staffGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C8922A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C8922A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B1A1A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B1A1A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="staff"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              width={40}
            />
            <YAxis
              yAxisId="budget"
              orientation="right"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              tickFormatter={formatBudget}
              width={60}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'budget') return [formatBudget(value), 'Budget']
                return [value, name.charAt(0).toUpperCase() + name.slice(1)]
              }}
            />
            <Area
              yAxisId="staff"
              type="monotone"
              dataKey="staff"
              stroke="#C8922A"
              strokeWidth={2.5}
              fill="url(#staffGradient)"
              dot={{ r: 3, fill: '#C8922A' }}
              activeDot={{ r: 5 }}
            />
            <Area
              yAxisId="budget"
              type="monotone"
              dataKey="budget"
              stroke="#8B1A1A"
              strokeWidth={2.5}
              fill="url(#budgetGradient)"
              dot={{ r: 3, fill: '#8B1A1A' }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex justify-center gap-8 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-picc-ochre" />
            <span className="text-gray-600">Staff</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-picc-red" />
            <span className="text-gray-600">Budget</span>
          </div>
        </div>
      </div>
    </div>
  )
}
