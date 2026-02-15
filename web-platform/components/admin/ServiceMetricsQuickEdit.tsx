'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'

interface ServiceMetricsQuickEditProps {
  serviceId: string
  serviceName: string
  fiscalYear: string
  initialMetrics?: {
    clients_served?: number | null
    sessions_delivered?: number | null
    events_held?: number | null
    staff_count?: number | null
    key_achievement?: string | null
  }
  onSaved?: () => void
}

export default function ServiceMetricsQuickEdit({
  serviceId,
  serviceName,
  fiscalYear,
  initialMetrics,
  onSaved,
}: ServiceMetricsQuickEditProps) {
  const [clients, setClients] = useState(String(initialMetrics?.clients_served ?? ''))
  const [sessions, setSessions] = useState(String(initialMetrics?.sessions_delivered ?? ''))
  const [events, setEvents] = useState(String(initialMetrics?.events_held ?? ''))
  const [staff, setStaff] = useState(String(initialMetrics?.staff_count ?? ''))
  const [achievement, setAchievement] = useState(initialMetrics?.key_achievement ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (field?: string) => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/annual-report-data/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_service_id: serviceId,
          fiscal_year: fiscalYear,
          clients_served: clients ? parseInt(clients) : null,
          sessions_delivered: sessions ? parseInt(sessions) : null,
          events_held: events ? parseInt(events) : null,
          staff_count: staff ? parseInt(staff) : null,
          key_achievement: achievement || null,
        }),
      })
      if (res.ok) {
        setSaved(true)
        onSaved?.()
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error('Failed to save metrics:', err)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          FY {fiscalYear} Metrics
        </span>
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
        {saved && <Check className="w-3.5 h-3.5 text-green-500" />}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Clients Served</label>
          <input
            type="number"
            min="0"
            value={clients}
            onChange={e => setClients(e.target.value)}
            onBlur={() => handleSave('clients_served')}
            className={inputClass}
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Sessions</label>
          <input
            type="number"
            min="0"
            value={sessions}
            onChange={e => setSessions(e.target.value)}
            onBlur={() => handleSave('sessions_delivered')}
            className={inputClass}
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Events Held</label>
          <input
            type="number"
            min="0"
            value={events}
            onChange={e => setEvents(e.target.value)}
            onBlur={() => handleSave('events_held')}
            className={inputClass}
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Staff Count</label>
          <input
            type="number"
            min="0"
            value={staff}
            onChange={e => setStaff(e.target.value)}
            onBlur={() => handleSave('staff_count')}
            className={inputClass}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-0.5">Key Achievement</label>
        <input
          type="text"
          value={achievement}
          onChange={e => setAchievement(e.target.value)}
          onBlur={() => handleSave('key_achievement')}
          className={inputClass}
          placeholder="e.g., Record client numbers"
        />
      </div>
    </div>
  )
}
