'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, FileText, Loader2 } from 'lucide-react'
import OverviewTab from './OverviewTab'
import ContentMediaTab from './ContentMediaTab'
import DataMetricsTab from './DataMetricsTab'
import PeoplePartnersTab from './PeoplePartnersTab'
import GrantsTab from './GrantsTab'
import ConversationsTab from './ConversationsTab'
import ActivityLogTab from './ActivityLogTab'

export type ServiceData = {
  id: string
  name: string
  slug: string
  service_category: string | null
  description: string | null
  is_active: boolean | null
  metadata?: any
  created_at?: string
  updated_at?: string
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'content', label: 'Content & Media' },
  { key: 'data', label: 'Data & Metrics' },
  { key: 'activity', label: 'Activity Log' },
  { key: 'partners', label: 'People & Partners' },
  { key: 'grants', label: 'Grants' },
  { key: 'conversations', label: 'Conversations' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function ServiceAdminDetail({ service: initialService }: { service: ServiceData }) {
  const [service, setService] = useState<ServiceData>(initialService)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [pdfLoading, setPdfLoading] = useState(false)

  const handleGenerateReport = async () => {
    setPdfLoading(true)
    try {
      const res = await fetch(`/api/pdf/generate?type=focus-report&focus=service&id=${service.slug}`)
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PICC-${service.name.replace(/\s+/g, '-')}-Report.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Report generation failed:', err)
    } finally {
      setPdfLoading(false)
    }
  }

  const handleServiceUpdate = (updated: Partial<ServiceData>) => {
    setService(prev => ({ ...prev, ...updated }))
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/picc/services"
          className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          All Services
        </Link>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{service.name}</h1>
              {service.is_active === false && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                  Inactive
                </span>
              )}
            </div>
            {service.service_category && (
              <p className="text-sm text-gray-500 mt-1">{service.service_category}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateReport}
              disabled={pdfLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Generate Report
            </button>
            <Link
              href={`/services/${service.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Page
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-picc-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab service={service} onUpdate={handleServiceUpdate} />
      )}
      {activeTab === 'content' && (
        <ContentMediaTab service={service} />
      )}
      {activeTab === 'data' && (
        <DataMetricsTab service={service} />
      )}
      {activeTab === 'activity' && (
        <ActivityLogTab service={service} />
      )}
      {activeTab === 'partners' && (
        <PeoplePartnersTab service={service} />
      )}
      {activeTab === 'grants' && (
        <GrantsTab service={service} />
      )}
      {activeTab === 'conversations' && (
        <ConversationsTab service={service} />
      )}
    </div>
  )
}
