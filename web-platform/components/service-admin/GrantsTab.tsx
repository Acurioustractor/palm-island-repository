'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Award, ChevronDown, ChevronRight, ClipboardCopy, DollarSign,
  Loader2, Plus, Trash2, X
} from 'lucide-react'
import type { ServiceData } from './ServiceAdminDetail'

type Grant = {
  id: string
  service_id: string
  funder_id: string | null
  grant_name: string
  amount: number | null
  status: string
  application_date: string | null
  award_date: string | null
  reporting_due: string | null
  acquittal_due: string | null
  fiscal_year: string | null
  notes: string | null
  requirements: Record<string, unknown>
  outcomes_reported: Record<string, unknown>
  created_at: string
  partners?: { id: string; name: string; partner_type: string | null; logo_url: string | null } | null
}

type Props = {
  service: ServiceData
}

const STATUS_OPTIONS = [
  { value: 'prospect', label: 'Prospect', color: 'bg-gray-100 text-gray-600' },
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  { value: 'awarded', label: 'Awarded', color: 'bg-green-100 text-green-700' },
  { value: 'acquitted', label: 'Acquitted', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-600' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-500' },
]

export default function GrantsTab({ service }: Props) {
  const [grants, setGrants] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [exportCopied, setExportCopied] = useState(false)

  const loadGrants = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/services/${service.id}/grants`)
      if (res.ok) {
        const data = await res.json()
        setGrants(data.grants || [])
      }
    } catch {}
    setLoading(false)
  }, [service.id])

  useEffect(() => { loadGrants() }, [loadGrants])

  const handleStatusChange = async (grant: Grant, newStatus: string) => {
    setUpdatingStatus(grant.id)
    try {
      const res = await fetch(`/api/services/${service.id}/grants/${grant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setGrants(prev => prev.map(g => g.id === grant.id ? { ...g, status: newStatus } : g))
      }
    } catch {}
    setUpdatingStatus(null)
  }

  const handleDelete = async (grantId: string) => {
    if (!confirm('Delete this grant record?')) return
    setDeleting(grantId)
    try {
      const res = await fetch(`/api/services/${service.id}/grants/${grantId}`, { method: 'DELETE' })
      if (res.ok) {
        setGrants(prev => prev.filter(g => g.id !== grantId))
      }
    } catch {}
    setDeleting(null)
  }

  const handleExport = async () => {
    const lines = [
      `SERVICE: ${service.name}`,
      service.description ? `\nDESCRIPTION:\n${service.description}` : '',
      service.service_category ? `\nCATEGORY: ${service.service_category}` : '',
      '\n---',
    ]

    // Get current FY metrics
    try {
      const res = await fetch('/api/annual-report-data/metrics?fy=2025')
      if (res.ok) {
        const data = await res.json()
        const svcData = (data.services || []).find((s: any) => s.organization_service_id === service.id)
        if (svcData?.metrics) {
          const m = svcData.metrics
          lines.push('\nMETRICS (FY 2024-25):')
          if (m.clients_served) lines.push(`  Clients Served: ${m.clients_served}`)
          if (m.sessions_delivered) lines.push(`  Sessions Delivered: ${m.sessions_delivered}`)
          if (m.events_held) lines.push(`  Events Held: ${m.events_held}`)
          if (m.staff_count) lines.push(`  Staff: ${m.staff_count}`)
          if (m.key_achievement) lines.push(`  Key Achievement: ${m.key_achievement}`)
        }
      }
    } catch {}

    if (grants.length > 0) {
      lines.push('\nGRANT HISTORY:')
      for (const g of grants) {
        lines.push(`  - ${g.grant_name} (${g.status})${g.amount ? ` $${Number(g.amount).toLocaleString()}` : ''}${g.partners?.name ? ` — ${g.partners.name}` : ''}`)
      }
    }

    const text = lines.filter(Boolean).join('\n')
    await navigator.clipboard.writeText(text)
    setExportCopied(true)
    setTimeout(() => setExportCopied(false), 3000)
  }

  const getStatusStyle = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Grant Tracker */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Grant Tracker <span className="text-gray-400 font-normal">({grants.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            >
              {exportCopied ? (
                <>Copied!</>
              ) : (
                <><ClipboardCopy className="w-3 h-3" /> Export Data</>
              )}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-picc-red rounded-full hover:bg-picc-red/90 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Grant
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : grants.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Award className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No grants tracked yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {grants.map(grant => {
              const isExpanded = expandedId === grant.id
              return (
                <div key={grant.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  {/* Header row */}
                  <div
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : grant.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-gray-900 text-sm truncate">{grant.grant_name}</span>
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${getStatusStyle(grant.status)}`}>
                          {grant.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {grant.partners?.name && <span>{grant.partners.name}</span>}
                        {grant.fiscal_year && <span>FY {grant.fiscal_year}</span>}
                        {grant.amount && (
                          <span className="font-medium text-gray-700">
                            ${Number(grant.amount).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status selector */}
                    <select
                      value={grant.status}
                      onChange={e => { e.stopPropagation(); handleStatusChange(grant, e.target.value) }}
                      onClick={e => e.stopPropagation()}
                      disabled={updatingStatus === grant.id}
                      className="text-xs px-2 py-1 border border-gray-200 rounded-lg bg-white disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>

                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(grant.id) }}
                      disabled={deleting === grant.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deleting === grant.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50/50">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                        <DateField label="Applied" value={grant.application_date} />
                        <DateField label="Awarded" value={grant.award_date} />
                        <DateField label="Reporting Due" value={grant.reporting_due} />
                        <DateField label="Acquittal Due" value={grant.acquittal_due} />
                      </div>
                      {grant.notes && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 mb-1">Notes</div>
                          <p className="text-sm text-gray-700">{grant.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Grant Modal */}
      {showAddModal && (
        <AddGrantModal
          serviceId={service.id}
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            loadGrants()
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

function DateField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-gray-500 mb-0.5">{label}</div>
      <div className="text-gray-700 font-medium">{value || '—'}</div>
    </div>
  )
}

function AddGrantModal({
  serviceId,
  onClose,
  onAdded,
}: {
  serviceId: string
  onClose: () => void
  onAdded: () => void
}) {
  const [grantName, setGrantName] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('prospect')
  const [fiscalYear, setFiscalYear] = useState('2024-25')
  const [applicationDate, setApplicationDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!grantName.trim()) { setError('Grant name required'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/services/${serviceId}/grants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_name: grantName.trim(),
          amount: amount ? parseFloat(amount) : null,
          status,
          fiscal_year: fiscalYear || null,
          application_date: applicationDate || null,
          notes: notes || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to add grant')
      }
      onAdded()
    } catch (e: any) {
      setError(e?.message || 'Failed')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Add Grant</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Grant Name</label>
            <input
              value={grantName}
              onChange={e => setGrantName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g. Indigenous Advancement Strategy"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fiscal Year</label>
              <input
                value={fiscalYear}
                onChange={e => setFiscalYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="2024-25"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Application Date</label>
            <input
              type="date"
              value={applicationDate}
              onChange={e => setApplicationDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Requirements, context, etc."
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm text-white bg-picc-red rounded-lg hover:bg-picc-red/90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Grant
          </button>
        </div>
      </div>
    </div>
  )
}
