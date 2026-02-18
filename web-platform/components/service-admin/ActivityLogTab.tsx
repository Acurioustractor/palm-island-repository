'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Loader2, Calendar, BarChart3 } from 'lucide-react'

type ActivityLog = {
  id: string
  service_id: string
  period_start: string
  period_end: string
  period_type: string
  clients_served: number | null
  sessions_delivered: number | null
  events_held: number | null
  staff_active: number | null
  notes: string | null
  entered_by: string | null
  created_at: string
}

type Props = {
  service: { id: string; name: string }
}

function getLast12Months(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-AU', { year: 'numeric', month: 'long' })
    months.push({ value, label })
  }
  return months
}

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-AU', { year: 'numeric', month: 'short' })
}

export default function ActivityLogTab({ service }: Props) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const monthOptions = getLast12Months()
  const [month, setMonth] = useState(monthOptions[0].value)
  const [clientsServed, setClientsServed] = useState('')
  const [sessionsDelivered, setSessionsDelivered] = useState('')
  const [eventsHeld, setEventsHeld] = useState('')
  const [staffActive, setStaffActive] = useState('')
  const [notes, setNotes] = useState('')

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/services/${service.id}/activity`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || data || [])
      }
    } catch {
      // silently fail
    }
    setLoading(false)
  }, [service.id])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const clearForm = () => {
    setMonth(monthOptions[0].value)
    setClientsServed('')
    setSessionsDelivered('')
    setEventsHeld('')
    setStaffActive('')
    setNotes('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/services/${service.id}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period_start: `${month}-01`,
          clients_served: clientsServed ? parseInt(clientsServed, 10) : null,
          sessions_delivered: sessionsDelivered ? parseInt(sessionsDelivered, 10) : null,
          events_held: eventsHeld ? parseInt(eventsHeld, 10) : null,
          staff_active: staffActive ? parseInt(staffActive, 10) : null,
          notes: notes.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save activity log')
      }
      clearForm()
      await loadLogs()
    } catch (err: any) {
      setError(err?.message || 'Failed to save')
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Add Activity Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Log Monthly Activity
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Month</label>
            <select
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              {monthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Clients Served</label>
              <input
                type="number"
                min="0"
                value={clientsServed}
                onChange={e => setClientsServed(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sessions Delivered</label>
              <input
                type="number"
                min="0"
                value={sessionsDelivered}
                onChange={e => setSessionsDelivered(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Events Held</label>
              <input
                type="number"
                min="0"
                value={eventsHeld}
                onChange={e => setEventsHeld(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Staff Active</label>
              <input
                type="number"
                min="0"
                value={staffActive}
                onChange={e => setStaffActive(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Key highlights, challenges, or context for this month..."
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-picc-red rounded-lg hover:bg-picc-red/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Entry
          </button>
        </form>
      </div>

      {/* Activity Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Activity History <span className="text-gray-400 font-normal">({logs.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No activity logged yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Clients</th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                  <th className="text-left py-2 pl-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-gray-900">
                      {formatMonth(log.period_start)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-700 tabular-nums">
                      {log.clients_served ?? '--'}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-700 tabular-nums">
                      {log.sessions_delivered ?? '--'}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-700 tabular-nums">
                      {log.events_held ?? '--'}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-700 tabular-nums">
                      {log.staff_active ?? '--'}
                    </td>
                    <td className="py-2.5 pl-4 text-gray-600 max-w-xs truncate">
                      {log.notes || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
