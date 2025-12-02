'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  ArrowLeft,
  Plus,
  Search,
  ExternalLink,
  CheckCircle,
  XCircle,
  RefreshCw,
  Globe,
  Book,
  Newspaper,
  FileQuestion,
  Mic,
  Video,
  Image,
  File
} from 'lucide-react'

interface ResearchSource {
  id: string
  source_type: string
  title: string
  description?: string
  author?: string
  publisher?: string
  publication_date?: string
  url?: string
  is_verified: boolean
  is_primary_source: boolean
  reliability_score?: number
  created_at: string
}

const SOURCE_TYPE_ICONS: Record<string, any> = {
  pdf_document: File,
  web_page: Globe,
  news_article: Newspaper,
  government_report: FileText,
  academic_paper: Book,
  interview: Mic,
  oral_history: Mic,
  photograph: Image,
  video: Video,
  audio: Mic,
  other: FileQuestion
}

const SOURCE_TYPES = [
  { value: 'pdf_document', label: 'PDF Document' },
  { value: 'web_page', label: 'Web Page' },
  { value: 'news_article', label: 'News Article' },
  { value: 'government_report', label: 'Government Report' },
  { value: 'academic_paper', label: 'Academic Paper' },
  { value: 'interview', label: 'Interview' },
  { value: 'oral_history', label: 'Oral History' },
  { value: 'photograph', label: 'Photograph' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'internal_document', label: 'Internal Document' },
  { value: 'other', label: 'Other' }
]

export default function ResearchSourcesPage() {
  const [sources, setSources] = useState<ResearchSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterVerified, setFilterVerified] = useState<string>('')

  const [newSource, setNewSource] = useState({
    source_type: 'pdf_document',
    title: '',
    description: '',
    author: '',
    publisher: '',
    publication_date: '',
    url: '',
    citation_text: '',
    reliability_score: 70,
    is_primary_source: false
  })

  useEffect(() => {
    fetchSources()
  }, [filterType, filterVerified])

  const fetchSources = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType) params.set('source_type', filterType)
      if (filterVerified) params.set('is_verified', filterVerified)

      const response = await fetch(`/api/knowledge/sources?${params}`)
      const data = await response.json()
      setSources(data.sources || [])
    } catch (error) {
      console.error('Error fetching sources:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/knowledge/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSource)
      })

      if (response.ok) {
        setShowAddForm(false)
        setNewSource({
          source_type: 'pdf_document',
          title: '',
          description: '',
          author: '',
          publisher: '',
          publication_date: '',
          url: '',
          citation_text: '',
          reliability_score: 70,
          is_primary_source: false
        })
        fetchSources()
      }
    } catch (error) {
      console.error('Error adding source:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getSourceIcon = (type: string) => {
    const Icon = SOURCE_TYPE_ICONS[type] || FileQuestion
    return <Icon className="h-5 w-5" />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/picc/knowledge"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Base
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-8 w-8 text-purple-600" />
              Research Sources
            </h1>
            <p className="mt-2 text-gray-600">
              Manage research documents, citations, and source materials
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Add Source
          </button>
        </div>
      </div>

      {/* Add Source Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Add Research Source</h2>
            </div>

            <form onSubmit={handleAddSource} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Type
                  </label>
                  <select
                    value={newSource.source_type}
                    onChange={(e) => setNewSource(prev => ({ ...prev, source_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {SOURCE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newSource.title}
                    onChange={(e) => setNewSource(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., PICC Annual Report 2023-24"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={newSource.author}
                    onChange={(e) => setNewSource(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="e.g., PICC Board"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={newSource.publisher}
                    onChange={(e) => setNewSource(prev => ({ ...prev, publisher: e.target.value }))}
                    placeholder="e.g., Palm Island Community Company"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={newSource.publication_date}
                    onChange={(e) => setNewSource(prev => ({ ...prev, publication_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reliability Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newSource.reliability_score}
                    onChange={(e) => setNewSource(prev => ({ ...prev, reliability_score: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={newSource.url}
                    onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newSource.description}
                    onChange={(e) => setNewSource(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this source..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Citation Text
                  </label>
                  <textarea
                    rows={2}
                    value={newSource.citation_text}
                    onChange={(e) => setNewSource(prev => ({ ...prev, citation_text: e.target.value }))}
                    placeholder="Full citation in preferred format..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newSource.is_primary_source}
                      onChange={(e) => setNewSource(prev => ({ ...prev, is_primary_source: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Primary source (original document, firsthand account)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Add Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Types</option>
            {SOURCE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Sources</option>
            <option value="true">Verified Only</option>
          </select>

          <button
            onClick={fetchSources}
            className="p-1.5 text-gray-500 hover:text-gray-700"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sources List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Loading sources...</p>
          </div>
        ) : sources.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No sources found</h3>
            <p className="mt-2 text-gray-500">
              Start adding research sources to build your knowledge base
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
              Add First Source
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sources.map((source) => (
              <div key={source.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    source.is_verified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {getSourceIcon(source.source_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{source.title}</h3>
                      {source.is_primary_source && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          Primary
                        </span>
                      )}
                      {source.is_verified ? (
                        <span title="Verified"><CheckCircle className="h-4 w-4 text-green-500" /></span>
                      ) : (
                        <span title="Not verified"><XCircle className="h-4 w-4 text-gray-300" /></span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span className="capitalize">{source.source_type.replace('_', ' ')}</span>
                      {source.author && <span>by {source.author}</span>}
                      {source.publication_date && (
                        <span>{new Date(source.publication_date).toLocaleDateString()}</span>
                      )}
                      {source.reliability_score && (
                        <span className="flex items-center gap-1">
                          Reliability: {source.reliability_score}%
                        </span>
                      )}
                    </div>

                    {source.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{source.description}</p>
                    )}
                  </div>

                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Open source"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
