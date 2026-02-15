'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAdmin } from '@/lib/admin/AdminContext'
import QuickAddModal, { type QuickAddType } from '@/components/annual-report-data/QuickAddModal'
import {
  Pencil, Image, Upload, Tag, ChevronUp, ChevronDown,
  BarChart3, Briefcase, Camera, Wrench,
  Plus, ExternalLink, Loader2, CheckCircle2, Circle,
  BookOpen, Users, Layout, Database, MessageSquare,
  FileText, FolderOpen, Settings
} from 'lucide-react'

type TabId = 'report' | 'services' | 'media' | 'tools'

interface ReportSection {
  key: string
  label: string
  count: number | null
  href: string
}

interface ServiceItem {
  id: string
  name: string
  slug: string
  service_category: string | null
  description: string | null
  is_active: boolean
}

function getCurrentFY(): string {
  const now = new Date()
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  const endYear = startYear + 1
  return `${startYear}-${String(endYear).slice(-2)}`
}

function getFiscalYearNumber(): number {
  const now = new Date()
  return now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear()
}

export default function AdminFloatingToolbar() {
  const { isAdmin, isEditMode, setEditMode, loading } = useAdmin()
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('report')

  // Data state
  const [reportData, setReportData] = useState<{
    sections: ReportSection[]
    reportId: string | null
    loaded: boolean
  }>({ sections: [], reportId: null, loaded: false })
  const [services, setServices] = useState<ServiceItem[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  // QuickAddModal state
  const [quickAddType, setQuickAddType] = useState<QuickAddType | null>(null)

  // Report panel state
  const [showReportPanel, setShowReportPanel] = useState(false)

  const currentFY = getCurrentFY()

  const loadData = useCallback(async () => {
    if (reportData.loaded) return
    setDataLoading(true)
    try {
      const [sectionsRes, servicesRes] = await Promise.all([
        fetch('/api/annual-report-data/progress').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/services').then(r => r.ok ? r.json() : null).catch(() => null),
      ])

      if (sectionsRes) {
        setReportData({
          sections: sectionsRes.sections || [],
          reportId: sectionsRes.report_id || null,
          loaded: true,
        })
      } else {
        // Fallback: build sections with no counts
        setReportData({
          sections: [
            { key: 'services', label: 'Services', count: null, href: '/picc/annual-report-data#services' },
            { key: 'financials', label: 'Financials', count: null, href: '/picc/annual-report-data#financials' },
            { key: 'highlights', label: 'Highlights', count: null, href: '/picc/annual-report-data#highlights' },
            { key: 'stories', label: 'Stories', count: null, href: '/picc/annual-report-data#stories' },
            { key: 'board', label: 'Board', count: null, href: '/picc/annual-report-data#board' },
            { key: 'photos', label: 'Photos', count: null, href: '/picc/annual-report-data#photos' },
            { key: 'projects', label: 'Projects', count: null, href: '/picc/annual-report-data#projects' },
          ],
          reportId: null,
          loaded: true,
        })
      }

      if (servicesRes?.services) {
        setServices(servicesRes.services)
      }
    } catch (err) {
      console.error('Toolbar data load error:', err)
      setReportData(prev => ({ ...prev, loaded: true }))
    } finally {
      setDataLoading(false)
    }
  }, [reportData.loaded])

  useEffect(() => {
    if (expanded && !reportData.loaded) {
      loadData()
    }
  }, [expanded, reportData.loaded, loadData])

  if (loading || !isAdmin) return null

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'report', label: 'Report', icon: BarChart3 },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'media', label: 'Media', icon: Camera },
    { id: 'tools', label: 'Tools', icon: Wrench },
  ]

  const completedSections = reportData.sections.filter(s => s.count !== null && s.count > 0).length
  const totalSections = reportData.sections.length
  const progressPct = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0

  const handleQuickAddSaved = () => {
    // Reset loaded to trigger refetch
    setReportData(prev => ({ ...prev, loaded: false }))
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">
        {expanded && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[360px] max-h-[70vh] flex flex-col animate-in slide-in-from-bottom-2 duration-200 overflow-hidden">
            {/* Tab Bar */}
            <div className="flex border-b border-gray-100 px-1 pt-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium rounded-t-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gray-50 text-picc-red border-b-2 border-picc-red'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {dataLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {/* REPORT TAB */}
                  {activeTab === 'report' && (
                    <div className="space-y-3">
                      {/* FY + Progress */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Fiscal Year</span>
                          <div className="text-lg font-bold text-gray-900">{currentFY}</div>
                        </div>
                        <div className="relative w-12 h-12">
                          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#dc2626"
                              strokeWidth="3"
                              strokeDasharray={`${progressPct}, 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                            {progressPct}%
                          </span>
                        </div>
                      </div>

                      {/* Section Checklist */}
                      <div className="space-y-1">
                        {reportData.sections.map((section) => (
                          <Link
                            key={section.key}
                            href={section.href}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex items-center gap-2">
                              {section.count !== null && section.count > 0 ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-300" />
                              )}
                              <span className="text-sm text-gray-700 group-hover:text-gray-900">{section.label}</span>
                            </div>
                            {section.count !== null && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                                {section.count}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>

                      {/* Quick Add Buttons */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <button
                          onClick={() => setQuickAddType('highlight')}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-picc-ochre-50 text-picc-ochre-700 rounded-lg hover:bg-picc-ochre-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Highlight
                        </button>
                        <button
                          onClick={() => setQuickAddType('service_data')}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-picc-red-50 text-picc-red-700 rounded-lg hover:bg-picc-red-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Service Data
                        </button>
                        <button
                          onClick={() => setQuickAddType('board_member')}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-sage-50 text-sage-700 rounded-lg hover:bg-sage-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Board Member
                        </button>
                      </div>

                      {/* Full Dashboard Link */}
                      <Link
                        href="/picc/annual-report-data"
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-picc-red text-white text-sm font-medium rounded-lg hover:bg-picc-red-600 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Full Dashboard
                      </Link>
                    </div>
                  )}

                  {/* SERVICES TAB */}
                  {activeTab === 'services' && (
                    <div className="space-y-2">
                      {services.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No services found</p>
                      ) : (
                        <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                          {services.filter(s => s.is_active).map((service) => (
                            <Link
                              key={service.id}
                              href={`/services/${service.slug}`}
                              className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-800 group-hover:text-gray-900 truncate">
                                  {service.name}
                                </div>
                                {service.service_category && (
                                  <span className="text-xs text-gray-400">{service.service_category}</span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      <Link
                        href="/picc/media/gallery?serviceFilter=all"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-picc-red hover:bg-picc-red-50 rounded-lg transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Service Photos
                      </Link>
                      <Link
                        href="/picc/annual-report-data#services"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-picc-ochre hover:bg-picc-ochre-50 rounded-lg transition-colors"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Service Metrics
                      </Link>
                    </div>
                  )}

                  {/* MEDIA TAB */}
                  {activeTab === 'media' && (
                    <div className="space-y-1">
                      <Link
                        href="/picc/media/gallery"
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Image className="w-4 h-4" />
                        Media Gallery
                      </Link>
                      <Link
                        href="/picc/media/gallery?filter=untagged"
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Tag className="w-4 h-4" />
                        Untagged Photos
                      </Link>
                      <Link
                        href="/picc/media/upload"
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Media
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <Link
                        href="/picc/media/gallery?serviceFilter=all"
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Briefcase className="w-4 h-4" />
                        Service Photos
                      </Link>
                      <Link
                        href="/picc/media/gallery?annualReport=true"
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Report Photos
                      </Link>
                      <Link
                        href="/picc/media/collections"
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Collections
                      </Link>
                    </div>
                  )}

                  {/* TOOLS TAB */}
                  {activeTab === 'tools' && (
                    <div className="space-y-3">
                      {/* Edit Mode Toggle */}
                      <div className="flex items-center justify-between px-2.5 py-2 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Edit Mode</span>
                        <button
                          onClick={() => setEditMode(!isEditMode)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${
                            isEditMode ? 'bg-picc-red' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              isEditMode ? 'translate-x-5' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Quick Nav */}
                      <div className="space-y-1">
                        <Link href="/picc/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                          <Layout className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link href="/picc/stories" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                          <BookOpen className="w-4 h-4" />
                          Stories
                        </Link>
                        <Link href="/picc/storytellers" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                          <Users className="w-4 h-4" />
                          Storytellers
                        </Link>
                        <Link href="/picc/knowledge" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                          <Database className="w-4 h-4" />
                          Knowledge Base
                        </Link>
                        <Link href="/picc/annual-report-data" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                          <BarChart3 className="w-4 h-4" />
                          Annual Report Data
                        </Link>
                        <Link href="/picc/community-voice" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          Community Voice
                        </Link>
                        <Link href="/picc/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Main Pill Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border transition-all ${
            isEditMode
              ? 'bg-picc-red text-white border-picc-red-600 hover:bg-picc-red-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Pencil className="w-4 h-4" />
          <span className="text-sm font-medium">Admin</span>
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* QuickAdd Modal */}
      {quickAddType && (
        <QuickAddModal
          type={quickAddType}
          reportId={reportData.reportId}
          fiscalYear={getFiscalYearNumber()}
          onClose={() => setQuickAddType(null)}
          onSaved={handleQuickAddSaved}
        />
      )}
    </>
  )
}
