'use client'

import { useState } from 'react'
import {
  FileText,
  Presentation,
  Plane,
  BarChart3,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExternalSharingPanelProps = {
  elderId: string
  elderName: string
  quoteCount: number
  storyCount: number
}

type PackageType = 'grant' | 'cultural' | 'travel' | 'community_report'

interface PackageCard {
  type: PackageType
  title: string
  description: string
  icon: React.ElementType
}

// ---------------------------------------------------------------------------
// Package definitions
// ---------------------------------------------------------------------------

const PACKAGES: PackageCard[] = [
  {
    type: 'grant',
    title: 'Grant Package',
    description: 'Compile stories and impact data for funding applications',
    icon: FileText,
  },
  {
    type: 'cultural',
    title: 'Cultural Sharing',
    description: 'Create a presentation for community events and cultural days',
    icon: Presentation,
  },
  {
    type: 'travel',
    title: 'Travel Proposal',
    description: 'Generate a travel funding proposal with elder stories and milestones',
    icon: Plane,
  },
  {
    type: 'community_report',
    title: 'Community Report',
    description: 'Include in annual report or community update',
    icon: BarChart3,
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ExternalSharingPanel({
  elderId,
  elderName,
  quoteCount,
  storyCount,
}: ExternalSharingPanelProps) {
  const toast = useToast()
  const [generating, setGenerating] = useState<PackageType | null>(null)

  async function handleGenerate(packageType: PackageType) {
    setGenerating(packageType)
    toast.info('Generating...', 'Package is being generated...')

    try {
      const res = await fetch('/api/elders/export-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elderId, packageType }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? `Request failed (${res.status})`)
      }

      // Download the PDF blob
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition')
      const filenameMatch = disposition?.match(/filename="?([^"]+)"?/)
      const filename = filenameMatch?.[1] ?? `elder-${packageType}.pdf`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      toast.success(
        'Package Downloaded',
        `${filename} has been saved.`
      )
    } catch (err) {
      toast.error(
        'Generation Failed',
        err instanceof Error ? err.message : 'Unknown error'
      )
    } finally {
      setGenerating(null)
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-stone-900">
        <ExternalLink className="h-5 w-5 text-picc-ochre" />
        Share Elder Stories
      </h3>
      <p className="mt-1 text-sm text-stone-500">
        Generate shareable content packages from {elderName}&apos;s profile
        ({storyCount} {storyCount === 1 ? 'story' : 'stories'}, {quoteCount}{' '}
        {quoteCount === 1 ? 'quote' : 'quotes'})
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {PACKAGES.map((pkg) => {
          const Icon = pkg.icon
          const isLoading = generating === pkg.type

          return (
            <div
              key={pkg.type}
              className="flex flex-col justify-between rounded-xl border border-stone-200 bg-warm-50 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-picc-ochre/10">
                    <Icon className="h-4 w-4 text-picc-ochre" />
                  </div>
                  <h4 className="text-sm font-semibold text-stone-800">{pkg.title}</h4>
                </div>
                <p className="mt-2 text-xs text-stone-500">{pkg.description}</p>
              </div>

              <button
                onClick={() => handleGenerate(pkg.type)}
                disabled={generating !== null}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-picc-ochre px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-picc-ochre/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Powered by badge */}
      <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-stone-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
        Powered by Empathy Ledger
      </div>
    </section>
  )
}
