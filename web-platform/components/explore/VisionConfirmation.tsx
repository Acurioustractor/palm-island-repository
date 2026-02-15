'use client'

import { CheckCircle, AlertCircle, Heart } from 'lucide-react'
import type { VisionData } from './ToolResultRenderer'

interface VisionConfirmationProps {
  data: VisionData
  darkMode?: boolean
}

const categoryLabels: Record<string, string> = {
  services: 'Services & Programs',
  culture: 'Culture & Identity',
  youth: 'Youth & Education',
  economic: 'Economic Development',
  environment: 'Environment & Country',
  governance: 'Governance & Leadership',
  other: 'Community Life',
}

export function VisionConfirmation({ data, darkMode = false }: VisionConfirmationProps) {
  if (!data.success) {
    return (
      <div className={`my-2 rounded-2xl p-6 flex gap-3 ${
        darkMode
          ? 'bg-red-500/10 border border-red-500/20'
          : 'bg-red-50 border border-red-100'
      }`}>
        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Couldn&apos;t save your vision</p>
          <p className={`text-sm mt-1 ${darkMode ? 'text-red-400/70' : 'text-red-600'}`}>{data.error || 'Something went wrong. Please try again.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`my-2 rounded-2xl p-6 ${
      darkMode
        ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20'
        : 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100'
    }`}>
      <div className="flex gap-3">
        <CheckCircle className={`w-6 h-6 flex-shrink-0 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
        <div>
          <p className={`text-base font-semibold ${darkMode ? 'text-emerald-300' : 'text-emerald-900'}`}>Vision recorded!</p>
          <p className={`text-sm mt-1 ${darkMode ? 'text-emerald-400/70' : 'text-emerald-700'}`}>
            {data.message}
          </p>
          {data.category && (
            <span className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-medium ${
              darkMode ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/60 text-emerald-700'
            }`}>
              {categoryLabels[data.category] || data.category}
            </span>
          )}
        </div>
      </div>

      {data.totalVisions && data.totalVisions > 1 && (
        <div className={`mt-4 pt-4 flex items-center gap-2 ${
          darkMode ? 'border-t border-emerald-500/10' : 'border-t border-emerald-100'
        }`}>
          <Heart className={`w-4 h-4 ${darkMode ? 'text-emerald-500/50' : 'text-emerald-400'}`} />
          <span className={`text-sm ${darkMode ? 'text-emerald-400/60' : 'text-emerald-600'}`}>
            You&apos;re part of <strong>{data.totalVisions}</strong> community voices shaping PICC&apos;s future
          </span>
        </div>
      )}
    </div>
  )
}
