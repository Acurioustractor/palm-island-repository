'use client'

import { motion } from 'framer-motion'
import { Users, DollarSign, Briefcase, TrendingUp } from 'lucide-react'

interface YearCardProps {
  fiscalYear: string
  staffCount: number | null
  serviceCount: number | null
  annualBudget: number | null
  indigenousPercent: string | null
  achievements: Array<{ text: string; category: string }>
  gradient: string
  index: number
}

function formatBudget(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

export default function YearCard({
  fiscalYear,
  staffCount,
  serviceCount,
  annualBudget,
  indigenousPercent,
  achievements,
  gradient,
  index,
}: YearCardProps) {
  const stats = [
    staffCount != null && { icon: Users, label: 'Staff', value: String(staffCount) },
    serviceCount != null && { icon: Briefcase, label: 'Services', value: String(serviceCount) },
    annualBudget != null && { icon: DollarSign, label: 'Budget', value: formatBudget(annualBudget) },
    indigenousPercent && { icon: TrendingUp, label: 'Indigenous', value: indigenousPercent },
  ].filter(Boolean) as Array<{ icon: any; label: string; value: string }>

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${gradient} px-5 py-3`}>
        <h4 className="text-white font-bold text-lg">{fiscalYear}</h4>
      </div>

      <div className="p-5">
        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-2 text-sm"
                >
                  <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500">{s.label}:</span>
                  <span className="font-semibold text-gray-900">{s.value}</span>
                </div>
              )
            })}
          </div>
        )}

        {achievements.length > 0 && (
          <div className="space-y-2">
            {achievements.slice(0, 3).map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-gradient-to-r ${gradient}`} />
                <span className="text-gray-600 leading-snug">{a.text}</span>
              </div>
            ))}
          </div>
        )}

        {stats.length === 0 && achievements.length === 0 && (
          <p className="text-sm text-gray-400 italic">
            Data being extracted...
          </p>
        )}
      </div>
    </motion.div>
  )
}
