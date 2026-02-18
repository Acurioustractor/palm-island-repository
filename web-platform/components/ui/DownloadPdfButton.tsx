'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface DownloadPdfButtonProps {
  type: 'stories' | 'services' | 'history'
  label?: string
  className?: string
}

export default function DownloadPdfButton({
  type,
  label,
  className,
}: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false)

  const labels: Record<string, string> = {
    stories: 'Download Stories Collection',
    services: 'Download Services Guide',
    history: 'Download Our History',
  }

  const filenames: Record<string, string> = {
    stories: 'PICC-Our-Stories.pdf',
    services: 'PICC-Our-Services.pdf',
    history: 'PICC-Our-History.pdf',
  }

  const handleDownload = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/pdf/generate?type=${type}`)
      if (!res.ok) throw new Error('PDF generation failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filenames[type]
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={
        className ||
        'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50'
      }
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {label || labels[type]}
    </button>
  )
}
