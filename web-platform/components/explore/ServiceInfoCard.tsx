'use client'

import { Activity, Users, Calendar, Award, TrendingUp } from 'lucide-react'
import type { ServiceData } from './ToolResultRenderer'

interface ServiceInfoCardProps {
  data: ServiceData
  darkMode?: boolean
}

export function ServiceInfoCard({ data, darkMode = false }: ServiceInfoCardProps) {
  const { service, metrics, achievements } = data

  return (
    <div className={`my-2 rounded-2xl overflow-hidden ${
      darkMode
        ? 'bg-white/[0.04] border border-white/[0.06]'
        : 'bg-white border border-gray-100'
    }`}>
      {/* Header */}
      <div className={`px-6 py-5 ${
        darkMode
          ? 'bg-gradient-to-r from-picc-ochre/10 to-picc-red/5'
          : 'bg-gradient-to-r from-warm-50 to-warm-100'
      }`}>
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white/90' : 'text-gray-900'}`}>{service.name}</h3>
        {service.description && (
          <p className={`mt-1 text-sm line-clamp-2 ${darkMode ? 'text-white/50' : 'text-gray-600'}`}>{service.description}</p>
        )}
        {service.category && (
          <span className={`mt-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            darkMode ? 'bg-white/[0.06] text-white/60' : 'bg-white/70 text-gray-600'
          }`}>
            {service.category}
          </span>
        )}
      </div>

      {/* Metrics Bar */}
      {metrics && (
        <div className={`px-6 py-4 ${darkMode ? 'border-b border-white/[0.04]' : 'border-b border-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className={`w-4 h-4 ${darkMode ? 'text-picc-ochre-400' : 'text-warm-600'}`} />
            <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
              {metrics.fiscal_year} Metrics
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {metrics.clients_served != null && (
              <MetricItem icon={Users} label="Clients Served" value={metrics.clients_served.toLocaleString()} darkMode={darkMode} />
            )}
            {metrics.sessions_delivered != null && (
              <MetricItem icon={Activity} label="Sessions" value={metrics.sessions_delivered.toLocaleString()} darkMode={darkMode} />
            )}
            {metrics.events_held != null && (
              <MetricItem icon={Calendar} label="Events" value={metrics.events_held.toLocaleString()} darkMode={darkMode} />
            )}
            {metrics.staff_count != null && (
              <MetricItem icon={Users} label="Staff" value={metrics.staff_count.toLocaleString()} darkMode={darkMode} />
            )}
          </div>
          {metrics.headline_stat_value && (
            <div className={`mt-4 p-3 rounded-xl ${darkMode ? 'bg-picc-ochre/10' : 'bg-warm-50'}`}>
              <span className={`text-2xl font-bold ${darkMode ? 'text-picc-ochre-300' : 'text-warm-700'}`}>{metrics.headline_stat_value}</span>
              {metrics.headline_stat_label && (
                <span className={`ml-2 text-sm ${darkMode ? 'text-white/50' : 'text-gray-600'}`}>{metrics.headline_stat_label}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className={`w-4 h-4 ${darkMode ? 'text-picc-ochre-400' : 'text-warm-600'}`} />
            <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Key Achievements</span>
          </div>
          <ul className="space-y-2">
            {achievements.slice(0, 4).map((a, i) => (
              <li key={i} className={`flex gap-2 text-sm ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
                <span className={`mt-0.5 ${darkMode ? 'text-picc-ochre-400' : 'text-warm-500'}`}>&#x2022;</span>
                <span>{a.achievement_text}</span>
                <span className={`ml-auto text-xs whitespace-nowrap ${darkMode ? 'text-white/25' : 'text-gray-400'}`}>{a.fiscal_year}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function MetricItem({ icon: Icon, label, value, darkMode }: { icon: typeof Users; label: string; value: string; darkMode?: boolean }) {
  return (
    <div className="text-center">
      <Icon className={`w-4 h-4 mx-auto mb-1 ${darkMode ? 'text-white/20' : 'text-gray-400'}`} />
      <div className={`text-lg font-bold ${darkMode ? 'text-white/90' : 'text-gray-900'}`}>{value}</div>
      <div className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{label}</div>
    </div>
  )
}
