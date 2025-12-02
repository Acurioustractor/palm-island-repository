'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Search,
  Plus,
  FileText,
  Database,
  History,
  DollarSign,
  Users,
  Building,
  Clock,
  Filter,
  ChevronRight,
  RefreshCw,
  Download
} from 'lucide-react'

interface KnowledgeEntry {
  id: string
  slug: string
  title: string
  entry_type: string
  category?: string
  summary?: string
  created_at: string
  is_verified: boolean
  is_featured: boolean
}

interface SearchResults {
  entries?: KnowledgeEntry[]
  timeline?: any[]
  sources?: any[]
  financial?: any[]
  stories?: any[]
  profiles?: any[]
}

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)

  const entryTypes = [
    { type: 'all', label: 'All Types', icon: Database },
    { type: 'fact', label: 'Facts', icon: FileText },
    { type: 'history', label: 'History', icon: History },
    { type: 'person', label: 'People', icon: Users },
    { type: 'service', label: 'Services', icon: Building },
    { type: 'statistic', label: 'Statistics', icon: DollarSign },
  ]

  const handleSearch = async () => {
    if (searchQuery.length < 2) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/knowledge/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setSearchResults(data.results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleImportKnowledgeBase = async () => {
    if (!confirm('This will import the PICC knowledge base data. Continue?')) return

    setIsImporting(true)
    setImportResult(null)
    try {
      const response = await fetch('/api/knowledge/import', { method: 'POST' })
      const data = await response.json()
      setImportResult(data)
    } catch (error: any) {
      setImportResult({ success: false, error: error.message })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              Knowledge Base
            </h1>
            <p className="mt-2 text-gray-600">
              Search and manage PICC&apos;s comprehensive knowledge repository
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleImportKnowledgeBase}
              disabled={isImporting}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isImporting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isImporting ? 'Importing...' : 'Import PICC Data'}
            </button>
            <Link
              href="/picc/knowledge/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </Link>
          </div>
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className={`mb-6 p-4 rounded-lg ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className={`font-semibold ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
            {importResult.success ? 'Import Successful' : 'Import Failed'}
          </h3>
          {importResult.message && (
            <p className="mt-1 text-sm text-gray-700">{importResult.message}</p>
          )}
          {importResult.results && (
            <div className="mt-2 text-sm text-gray-600">
              <p>Entries: {importResult.results.entries_created}</p>
              <p>Financial Records: {importResult.results.financial_records_created}</p>
              <p>Timeline Events: {importResult.results.timeline_events_created}</p>
              {importResult.results.errors?.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-600">
                    {importResult.results.errors.length} errors
                  </summary>
                  <ul className="mt-1 list-disc list-inside">
                    {importResult.results.errors.slice(0, 5).map((err: string, i: number) => (
                      <li key={i} className="text-xs">{err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
          {importResult.error && (
            <p className="mt-1 text-sm text-red-600">{importResult.error}</p>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search knowledge base... (e.g., health services, hull river, financial)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || searchQuery.length < 2}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>

          {/* Knowledge Entries */}
          {searchResults.entries && searchResults.entries.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Knowledge Entries ({searchResults.entries.length})
              </h3>
              <div className="space-y-2">
                {searchResults.entries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/picc/knowledge/${entry.slug}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{entry.title}</h4>
                        <p className="text-sm text-gray-500">
                          {entry.entry_type} • {entry.category || 'Uncategorized'}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Events */}
          {searchResults.timeline && searchResults.timeline.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Timeline Events ({searchResults.timeline.length})
              </h3>
              <div className="space-y-2">
                {searchResults.timeline.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{event.event_date}</span>
                    </div>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Records */}
          {searchResults.financial && searchResults.financial.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Financial Records ({searchResults.financial.length})
              </h3>
              <div className="space-y-2">
                {searchResults.financial.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{record.category}</h4>
                        <p className="text-sm text-gray-500">
                          {record.fiscal_year} • {record.record_type}
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        ${(record.amount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stories */}
          {searchResults.stories && searchResults.stories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Stories ({searchResults.stories.length})
              </h3>
              <div className="space-y-2">
                {searchResults.stories.map((story) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900">{story.title}</h4>
                    {story.excerpt && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{story.excerpt}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {Object.values(searchResults).every(arr => !arr || arr.length === 0) && (
            <p className="text-gray-500 text-center py-8">No results found for &quot;{searchQuery}&quot;</p>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/picc/knowledge/new"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Knowledge Entry</h3>
              <p className="text-sm text-gray-500">Add new facts, history, or statistics</p>
            </div>
          </div>
        </Link>

        <Link
          href="/picc/knowledge/sources"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Research Sources</h3>
              <p className="text-sm text-gray-500">Manage documents and citations</p>
            </div>
          </div>
        </Link>

        <Link
          href="/picc/knowledge/timeline"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Timeline</h3>
              <p className="text-sm text-gray-500">Historical events and milestones</p>
            </div>
          </div>
        </Link>

        <Link
          href="/picc/knowledge/financial"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Financial Data</h3>
              <p className="text-sm text-gray-500">Revenue, expenses, and budgets</p>
            </div>
          </div>
        </Link>

        <Link
          href="/wiki/people"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Users className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">People</h3>
              <p className="text-sm text-gray-500">Community members and staff</p>
            </div>
          </div>
        </Link>

        <Link
          href="/wiki/services"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Building className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Services</h3>
              <p className="text-sm text-gray-500">PICC programs and services</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
