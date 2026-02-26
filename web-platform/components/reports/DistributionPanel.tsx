'use client'

import React, { useState } from 'react'

interface DistributionPanelProps {
  fiscalYear: string
  audience: string
  reportUrl?: string
}

export default function DistributionPanel({
  fiscalYear,
  audience,
  reportUrl,
}: DistributionPanelProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [result, setResult] = useState<{
    recipients_count?: number
    ghl_status?: string
  } | null>(null)

  const handleDistribute = async () => {
    setStatus('sending')
    try {
      const res = await fetch('/api/reports/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscal_year: fiscalYear,
          audience,
          report_url: reportUrl,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setStatus('sent')
        setResult(data)
      } else {
        setStatus('error')
        setResult({ ghl_status: data.error || 'Distribution failed' })
      }
    } catch {
      setStatus('error')
      setResult({ ghl_status: 'Network error' })
    }
  }

  return (
    <div className="bg-white rounded-lg border p-4 mt-4">
      <h3 className="font-semibold text-gray-900 mb-2">Distribute Report</h3>
      <p className="text-sm text-gray-600 mb-3">
        Send the {fiscalYear} {audience} report to contacts via GoHighLevel.
      </p>

      {status === 'idle' && (
        <button
          onClick={handleDistribute}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Send to {audience} contacts
        </button>
      )}

      {status === 'sending' && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          Distributing...
        </div>
      )}

      {status === 'sent' && result && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          <div className="font-medium text-green-800">Distribution recorded</div>
          {result.recipients_count != null && (
            <div className="text-green-700 mt-1">
              Sent to {result.recipients_count} recipients
            </div>
          )}
          {result.ghl_status && (
            <div className="text-green-600 mt-1">{result.ghl_status}</div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <div className="font-medium text-red-800">Distribution issue</div>
          <div className="text-red-600 mt-1">{result?.ghl_status || 'Unknown error'}</div>
          <button
            onClick={() => setStatus('idle')}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
