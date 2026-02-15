'use client'

import { useState } from 'react'
import { FileDown, Loader2, Printer } from 'lucide-react'

interface PrintReportFABProps {
  themeSlug: string
  themeTitle: string
}

export function PrintReportFAB({ themeSlug, themeTitle }: PrintReportFABProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePrint() {
    setLoading(true)
    setError(null)

    try {
      // Use browser print as the primary PDF generation method
      window.print()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Print failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 print:hidden">
      {error && (
        <div className="absolute bottom-full right-0 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 whitespace-nowrap">
          {error}
        </div>
      )}
      <button
        onClick={handlePrint}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full shadow-2xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={`Print ${themeTitle} as PDF`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Printer className="w-5 h-5" />
        )}
        <span className="font-medium text-sm">
          {loading ? 'Preparing...' : 'Print as Report'}
        </span>
      </button>
    </div>
  )
}
