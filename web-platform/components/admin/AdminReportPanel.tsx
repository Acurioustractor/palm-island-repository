'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Check, Plus, Trash2 } from 'lucide-react'

interface AdminReportPanelProps {
  open: boolean
  onClose: () => void
  reportId: string | null
  fiscalYear: string
}

interface Highlight {
  id: string
  title: string
  description: string | null
  highlight_type: string
}

export default function AdminReportPanel({ open, onClose, reportId, fiscalYear }: AdminReportPanelProps) {
  const [loading, setLoading] = useState(true)
  const [executiveSummary, setExecutiveSummary] = useState('')
  const [leadershipMessage, setLeadershipMessage] = useState('')
  const [totalClients, setTotalClients] = useState('')
  const [totalStaff, setTotalStaff] = useState('')
  const [totalRevenue, setTotalRevenue] = useState('')
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)

    const loadData = async () => {
      try {
        const [highlightsRes] = await Promise.all([
          fetch('/api/annual-report-data/highlights').then(r => r.ok ? r.json() : null).catch(() => null),
        ])

        if (highlightsRes?.highlights) {
          setHighlights(highlightsRes.highlights)
        }
      } catch (err) {
        console.error('Failed to load report data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [open, reportId])

  const saveField = async (field: string, value: string) => {
    setSaving(field)
    setSaved(null)
    try {
      // For executive summary and leadership message, we save to report metadata
      // For now, use the highlights endpoint for text content
      const res = await fetch('/api/annual-report-data/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'highlight',
          report_id: reportId,
          title: field === 'executive_summary' ? 'Executive Summary' : 'Leadership Message',
          description: value,
          highlight_type: field,
          is_featured: true,
          display_order: 0,
        }),
      })
      if (res.ok) {
        setSaved(field)
        setTimeout(() => setSaved(null), 2000)
      }
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(null)
    }
  }

  const deleteHighlight = async (id: string) => {
    try {
      const res = await fetch('/api/annual-report-data/highlights', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setHighlights(prev => prev.filter(h => h.id !== id))
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  if (!open) return null

  const fieldStatus = (field: string) => {
    if (saving === field) return <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
    if (saved === field) return <Check className="w-3.5 h-3.5 text-green-500" />
    return <span className="text-xs text-gray-400">Auto-saves on blur</span>
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Report Content</h2>
            <span className="text-sm text-gray-500">FY {fiscalYear}</span>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Executive Summary */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Executive Summary</label>
                  {fieldStatus('executive_summary')}
                </div>
                <textarea
                  value={executiveSummary}
                  onChange={e => setExecutiveSummary(e.target.value)}
                  onBlur={() => {
                    if (executiveSummary.trim()) saveField('executive_summary', executiveSummary)
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                  placeholder="A brief overview of the year's achievements..."
                />
              </div>

              {/* Leadership Message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Leadership Message</label>
                  {fieldStatus('leadership_message')}
                </div>
                <textarea
                  value={leadershipMessage}
                  onChange={e => setLeadershipMessage(e.target.value)}
                  onBlur={() => {
                    if (leadershipMessage.trim()) saveField('leadership_message', leadershipMessage)
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                  placeholder="CEO or Chairperson message..."
                />
              </div>

              {/* Highlights */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Highlights ({highlights.length})
                  </label>
                </div>
                <div className="space-y-2">
                  {highlights.map(h => (
                    <div key={h.id} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{h.title}</div>
                        {h.description && (
                          <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{h.description}</div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteHighlight(h.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Year at a Glance Stats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year at a Glance</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Total Clients</label>
                    <input
                      type="number"
                      min="0"
                      value={totalClients}
                      onChange={e => setTotalClients(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Total Staff</label>
                    <input
                      type="number"
                      min="0"
                      value={totalStaff}
                      onChange={e => setTotalStaff(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Revenue ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={totalRevenue}
                      onChange={e => setTotalRevenue(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
