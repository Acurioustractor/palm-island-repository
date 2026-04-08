'use client'

import { useState } from 'react'
import { Loader2, Zap, CheckCircle, AlertCircle } from 'lucide-react'

type Report = {
  id: string
  title: string
  report_year: number
  fiscal_year: string | null
  status: string
}

interface AutoLinkButtonProps {
  reports: Report[]
}

export function AutoLinkButton({ reports }: AutoLinkButtonProps) {
  const [selectedReport, setSelectedReport] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleAutoLink = async () => {
    if (!selectedReport) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/auto-link-stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: selectedReport }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult({ success: true, message: data.message || `Successfully linked ${data.storiesLinked} stories!` })
      } else {
        setResult({ success: false, message: data.error || 'Failed to auto-link stories' })
      }
    } catch (error) {
      setResult({ success: false, message: 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  if (reports.length === 0) {
    return (
      <div className="text-sm text-blue-600">
        No reports available. Create a report first.
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={selectedReport}
        onChange={(e) => {
          setSelectedReport(e.target.value)
          setResult(null)
        }}
        className="text-sm px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[200px]"
      >
        <option value="">Select a report...</option>
        {reports.map((report) => (
          <option key={report.id} value={report.id}>
            {report.title || `FY ${report.fiscal_year || report.report_year}`}
          </option>
        ))}
      </select>
      
      <button
        onClick={handleAutoLink}
        disabled={!selectedReport || loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Linking...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Auto-Link
          </>
        )}
      </button>

      {result && (
        <div className={`flex items-center gap-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.success ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {result.message}
        </div>
      )}
    </div>
  )
}
