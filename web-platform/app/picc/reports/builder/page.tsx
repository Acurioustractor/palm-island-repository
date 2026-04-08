'use client'

import React, { useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'
import {
  FileText, Users, DollarSign, Heart, Shield,
  Download, Loader2, Check, Play, FileDown, ImageIcon,
} from 'lucide-react'
import { Player } from '@remotion/player'
import { ImpactSummary } from '@/lib/video/compositions/ImpactSummary'
import type { ImpactSummaryProps } from '@/lib/video/compositions/ImpactSummary'
import { VIDEO } from '@/lib/video/theme'
import { assetUrl } from '@/lib/media/asset-url'

const AUDIENCES = [
  {
    id: 'community',
    label: 'Community',
    description: 'Stories, innovation, youth, elders, 20-year vision. Celebratory and accessible.',
    icon: Users,
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    activeColor: 'bg-purple-100 border-purple-500 ring-2 ring-purple-200',
    iconColor: 'text-purple-600',
    sections: ['Stories', 'Innovation', 'Youth Voices', 'Community Voices', 'Journey Timeline'],
  },
  {
    id: 'funder',
    label: 'Funders',
    description: 'Financials, per-service metrics, compliance, outcomes, funding attribution.',
    icon: DollarSign,
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    activeColor: 'bg-green-100 border-green-500 ring-2 ring-green-200',
    iconColor: 'text-green-600',
    sections: ['Financials', 'Revenue by Funder', 'Compliance', 'Services', 'Directors Report'],
  },
  {
    id: 'supporter',
    label: 'Supporters',
    description: 'Community voices, innovation stories, photos, looking forward. Inspirational.',
    icon: Heart,
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    activeColor: 'bg-blue-100 border-blue-500 ring-2 ring-blue-200',
    iconColor: 'text-blue-600',
    sections: ['Community Voices', 'Innovation', 'Photos', 'Journey', 'Next Twenty'],
  },
  {
    id: 'board',
    label: 'Board / Governance',
    description: 'Governance, compliance, directors report, financials, risk. Comprehensive.',
    icon: Shield,
    color: 'bg-gray-50 border-gray-200 hover:border-gray-400',
    activeColor: 'bg-gray-100 border-gray-500 ring-2 ring-gray-200',
    iconColor: 'text-gray-600',
    sections: ['Governance', 'Compliance', 'Directors Report', 'Financials', 'All Sections'],
  },
  {
    id: 'government',
    label: 'Government',
    description: 'Compliance, governance, financials, service metrics, and cultural protocols.',
    icon: FileText,
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    activeColor: 'bg-amber-100 border-amber-500 ring-2 ring-amber-200',
    iconColor: 'text-amber-600',
    sections: ['Compliance', 'Governance', 'Financials', 'Revenue by Funder', 'Services'],
  },
] as const

const YEARS = ['2024-25', '2023-24'] as const

// Default props for video preview — will be replaced with live data in Option B
function getVideoProps(year: string, audience: string | null): ImpactSummaryProps {
  return {
    title: 'Impact Summary',
    subtitle: 'Making Palm Island a safer, stronger and more prosperous place to live.',
    year,
    orgName: 'Palm Island Community Company',
    logoUrl: '/logo/picc-logo-full.png',
    photos: [
      assetUrl('/hero-assets/stills/palm-sunset-pier.jpg'),
      assetUrl('/hero-assets/stills/waterfall-landscape.jpg'),
      assetUrl('/hero-assets/stills/kids-beach-palm.jpg'),
      assetUrl('/hero-assets/stills/memorial-gathering.jpg'),
      assetUrl('/hero-assets/stills/centre-youth-landscaping.jpg'),
      assetUrl('/hero-assets/stills/pier-turquoise.jpg'),
      assetUrl('/hero-assets/stills/daycare-playground.jpg'),
      assetUrl('/hero-assets/stills/mountain-valley.jpg'),
    ],
    stats: [
      { label: 'Community Members Served', value: '2,847' },
      { label: 'Programs Delivered', value: '8' },
      { label: 'Staff Employed', value: '197' },
      { label: 'Stories Captured', value: '340+' },
    ],
    quote: {
      text: 'This place has given my family hope again. The kids are going to school, and I feel supported.',
      author: 'Community Member',
    },
  }
}

type OutputMode = 'pdf' | 'video'

export default function ReportBuilderPage() {
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null)
  const toast = useToast()
  const [selectedYear, setSelectedYear] = useState<string>('2024-25')
  const [outputMode, setOutputMode] = useState<OutputMode>('pdf')
  const [generating, setGenerating] = useState(false)
  const [batchGenerating, setBatchGenerating] = useState(false)
  const [batchProgress, setBatchProgress] = useState<{audience: string; status: 'pending' | 'downloading' | 'done' | 'failed'}[]>([])

  const handleGenerateAll = async () => {
    setBatchGenerating(true)
    try {
      const res = await fetch('/api/pdf/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: selectedYear }),
      })
      if (!res.ok) throw new Error('Failed to fetch variants')
      const { variants } = await res.json() as {
        variants: { audience: string; url: string; filename: string }[]
      }

      const progress: {audience: string; status: 'pending' | 'downloading' | 'done' | 'failed'}[] = variants.map((v) => ({
        audience: v.audience,
        status: 'pending' as const,
      }))
      setBatchProgress([...progress])

      for (let i = 0; i < variants.length; i++) {
        progress[i] = { ...progress[i], status: 'downloading' }
        setBatchProgress([...progress])

        try {
          const pdfRes = await fetch(variants[i].url)
          if (!pdfRes.ok) throw new Error(`HTTP ${pdfRes.status}`)
          const blob = await pdfRes.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = variants[i].filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          progress[i] = { ...progress[i], status: 'done' }
        } catch {
          progress[i] = { ...progress[i], status: 'failed' }
        }
        setBatchProgress([...progress])
      }
    } catch (err) {
      console.error('Batch generation failed:', err)
      toast.error('Batch generation failed', 'Please try again.')
    } finally {
      setBatchGenerating(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const params = new URLSearchParams({
        type: 'annual-report',
        year: selectedYear,
      })
      if (selectedAudience) {
        params.set('audience', selectedAudience)
      }

      const response = await fetch(`/api/pdf/generate?${params}`)
      if (!response.ok) throw new Error('PDF generation failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PICC-Annual-Report-${selectedYear}${selectedAudience ? `-${selectedAudience}` : ''}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Report generation failed:', err)
      toast.error('Report generation failed', 'Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Report Builder</h1>
        </div>
        <p className="text-gray-500">
          Generate audience-targeted annual reports. Each audience gets the sections and emphasis that matter most to them.
        </p>
        <Link
          href="/picc/reports/photos"
          className="inline-flex items-center gap-2 mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium"
        >
          <ImageIcon className="h-4 w-4" />
          Manage Report Photos
        </Link>
      </div>

      {/* Year Selection */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Fiscal Year
        </h2>
        <div className="flex gap-3">
          {YEARS.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                selectedYear === year
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Audience Selection */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Select Audience
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AUDIENCES.map((aud) => {
            const Icon = aud.icon
            const isSelected = selectedAudience === aud.id
            return (
              <button
                key={aud.id}
                onClick={() => setSelectedAudience(isSelected ? null : aud.id)}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  isSelected ? aud.activeColor : aud.color
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${aud.iconColor}`} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{aud.label}</h3>
                    <p className="text-sm text-gray-500 mb-3">{aud.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aud.sections.map((section) => (
                        <span
                          key={section}
                          className="text-xs px-2 py-0.5 bg-white/80 text-gray-600 rounded-full border border-gray-200"
                        >
                          {section}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {!selectedAudience && (
          <p className="mt-3 text-sm text-gray-400 italic">
            No audience selected — will generate the full report with all sections.
          </p>
        )}
      </div>

      {/* Output Mode Toggle */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Output Format
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setOutputMode('pdf')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              outputMode === 'pdf'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            <FileDown className="h-4 w-4" />
            PDF Report
          </button>
          <button
            onClick={() => setOutputMode('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              outputMode === 'video'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            <Play className="h-4 w-4" />
            Video Preview
          </button>
        </div>
      </div>

      {/* Video Preview */}
      {outputMode === 'video' && (
        <div className="mb-8 p-6 bg-gray-950 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Play className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-white text-sm">Impact Summary Preview</h3>
            <span className="text-xs text-gray-500 ml-auto">Remotion Player · 1920×1080 · 30fps</span>
          </div>
          <div className="rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <Player
              component={ImpactSummary as unknown as React.FC<Record<string, unknown>>}
              inputProps={getVideoProps(selectedYear, selectedAudience)}
              durationInFrames={VIDEO.durationInFrames}
              compositionWidth={VIDEO.width}
              compositionHeight={VIDEO.height}
              fps={VIDEO.fps}
              style={{ width: '100%' }}
              controls
              autoPlay={false}
            />
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Preview only — video export requires Lambda rendering (Option B). Data shown is static; live Supabase data in next phase.
          </p>
        </div>
      )}

      {/* Generate Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Generate Report
            </>
          )}
        </button>

        <span className="text-sm text-gray-400">
          {selectedYear} {selectedAudience ? `• ${AUDIENCES.find((a) => a.id === selectedAudience)?.label} version` : '• Full report'}
        </span>
      </div>

      {/* Batch Generation */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Generate All Variants</h3>
        <p className="text-sm text-gray-500 mb-4">
          Download all audience-targeted versions of the {selectedYear} annual report at once.
        </p>
        <button
          onClick={handleGenerateAll}
          disabled={batchGenerating || generating}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {batchGenerating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating All...</>
          ) : (
            <><Download className="h-4 w-4" /> Generate All 6 Variants</>
          )}
        </button>

        {batchProgress.length > 0 && (
          <div className="mt-4 space-y-2">
            {batchProgress.map((p) => (
              <div key={p.audience} className="flex items-center gap-3 text-sm">
                {p.status === 'downloading' && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />}
                {p.status === 'done' && <Check className="h-3.5 w-3.5 text-green-500" />}
                {p.status === 'failed' && <span className="h-3.5 w-3.5 text-red-500 inline-flex items-center justify-center">&#x2717;</span>}
                {p.status === 'pending' && <span className="h-3.5 w-3.5 text-gray-300 inline-flex items-center justify-center">&#x25CB;</span>}
                <span className={p.status === 'done' ? 'text-green-700' : p.status === 'failed' ? 'text-red-600' : 'text-gray-600'}>
                  {p.audience.charAt(0).toUpperCase() + p.audience.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
