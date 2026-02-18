'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2, Plus, TrendingUp } from 'lucide-react'
import type { ServiceData } from './ServiceAdminDetail'

type MetricRow = {
  id?: string
  organization_service_id: string
  fiscal_year: number
  clients_served: number | null
  sessions_delivered: number | null
  events_held: number | null
  staff_count: number | null
  key_achievement: string | null
}

type Props = {
  service: ServiceData
}

const FISCAL_YEARS = [2020, 2021, 2022, 2023, 2024, 2025]

function fyLabel(fy: number) {
  return `${fy - 1}-${String(fy).slice(2)}`
}

export default function DataMetricsTab({ service }: Props) {
  const [metrics, setMetrics] = useState<MetricRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // fiscal_year being saved
  const [saved, setSaved] = useState<string | null>(null)

  // Editable state keyed by fiscal_year
  const [edits, setEdits] = useState<Record<number, Partial<MetricRow>>>({})

  // Add year modal
  const [showAddYear, setShowAddYear] = useState(false)
  const [newYear, setNewYear] = useState(2025)

  const loadMetrics = useCallback(async () => {
    setLoading(true)
    try {
      // Load all years' metrics for this service
      const allMetrics: MetricRow[] = []
      for (const fy of FISCAL_YEARS) {
        const res = await fetch(`/api/annual-report-data/metrics?fy=${fy}`)
        if (res.ok) {
          const data = await res.json()
          const svcData = (data.services || []).find((s: any) => s.organization_service_id === service.id)
          if (svcData?.metrics) {
            allMetrics.push(svcData.metrics)
          }
        }
      }
      setMetrics(allMetrics)
      // Populate edits
      const editMap: Record<number, Partial<MetricRow>> = {}
      for (const m of allMetrics) {
        editMap[m.fiscal_year] = { ...m }
      }
      setEdits(editMap)
    } catch {}
    setLoading(false)
  }, [service.id])

  useEffect(() => { loadMetrics() }, [loadMetrics])

  const saveRow = async (fy: number) => {
    const edit = edits[fy]
    if (!edit) return
    const key = String(fy)
    setSaving(key)
    setSaved(null)
    try {
      const res = await fetch('/api/annual-report-data/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_service_id: service.id,
          fiscal_year: fy,
          clients_served: edit.clients_served ?? null,
          sessions_delivered: edit.sessions_delivered ?? null,
          events_held: edit.events_held ?? null,
          staff_count: edit.staff_count ?? null,
          key_achievement: edit.key_achievement ?? null,
        }),
      })
      if (res.ok) {
        setSaved(key)
        setTimeout(() => setSaved(null), 2000)
      }
    } catch {}
    setSaving(null)
  }

  const updateEdit = (fy: number, field: string, value: string) => {
    setEdits(prev => ({
      ...prev,
      [fy]: {
        ...prev[fy],
        [field]: field === 'key_achievement' ? value : (value === '' ? null : parseInt(value)),
      },
    }))
  }

  const addYear = () => {
    if (edits[newYear]) {
      setShowAddYear(false)
      return
    }
    setEdits(prev => ({
      ...prev,
      [newYear]: {
        organization_service_id: service.id,
        fiscal_year: newYear,
        clients_served: null,
        sessions_delivered: null,
        events_held: null,
        staff_count: null,
        key_achievement: null,
      },
    }))
    setShowAddYear(false)
  }

  const sortedYears = Object.keys(edits).map(Number).sort((a, b) => b - a)
  const inputClass = "w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none text-center"

  return (
    <div className="space-y-6">
      {/* Metrics Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Multi-Year Metrics
          </h2>
          <button
            onClick={() => setShowAddYear(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-picc-red rounded-full hover:bg-picc-red/90 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Year
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : sortedYears.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No metrics data yet. Add a year to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Fiscal Year</th>
                  <th className="text-center font-medium px-4 py-3">Clients</th>
                  <th className="text-center font-medium px-4 py-3">Sessions</th>
                  <th className="text-center font-medium px-4 py-3">Events</th>
                  <th className="text-center font-medium px-4 py-3">Staff</th>
                  <th className="text-left font-medium px-4 py-3">Key Achievement</th>
                  <th className="text-center font-medium px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {sortedYears.map(fy => {
                  const edit = edits[fy] || {}
                  const key = String(fy)
                  return (
                    <tr key={fy} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        FY {fyLabel(fy)}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={edit.clients_served ?? ''}
                          onChange={e => updateEdit(fy, 'clients_served', e.target.value)}
                          onBlur={() => saveRow(fy)}
                          className={inputClass}
                          placeholder="—"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={edit.sessions_delivered ?? ''}
                          onChange={e => updateEdit(fy, 'sessions_delivered', e.target.value)}
                          onBlur={() => saveRow(fy)}
                          className={inputClass}
                          placeholder="—"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={edit.events_held ?? ''}
                          onChange={e => updateEdit(fy, 'events_held', e.target.value)}
                          onBlur={() => saveRow(fy)}
                          className={inputClass}
                          placeholder="—"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={edit.staff_count ?? ''}
                          onChange={e => updateEdit(fy, 'staff_count', e.target.value)}
                          onBlur={() => saveRow(fy)}
                          className={inputClass}
                          placeholder="—"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={edit.key_achievement ?? ''}
                          onChange={e => updateEdit(fy, 'key_achievement', e.target.value)}
                          onBlur={() => saveRow(fy)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
                          placeholder="Key achievement..."
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {saving === key && <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto" />}
                        {saved === key && <Check className="w-4 h-4 text-green-500 mx-auto" />}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trend Chart (simple visual) */}
      {sortedYears.length >= 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Client Trend
          </h2>
          <SimpleBarChart
            data={sortedYears
              .slice()
              .reverse()
              .map(fy => ({
                label: fyLabel(fy),
                value: (edits[fy]?.clients_served as number) || 0,
              }))}
          />
        </div>
      )}

      {/* Add Year Modal */}
      {showAddYear && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Add Fiscal Year</h3>
            <select
              value={newYear}
              onChange={e => setNewYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 bg-white"
            >
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(y => (
                <option key={y} value={y}>FY {fyLabel(y)}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddYear(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addYear}
                className="px-4 py-2 text-sm text-white bg-picc-red rounded-lg hover:bg-picc-red/90"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SimpleBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-gray-700">{d.value || ''}</span>
          <div
            className="w-full bg-picc-red/80 rounded-t-md transition-all"
            style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}
          />
          <span className="text-[10px] text-gray-500">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
