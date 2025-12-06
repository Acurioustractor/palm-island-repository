'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AIStats {
  timestamp: string;
  cache: {
    entries: number;
    hits: number;
    misses: number;
    hitRate: string;
    memoryUsage: string;
  };
  rateLimit: {
    totalTracked: number;
    currentlyBlocked: number;
    byEndpoint: Record<string, { tracked: number; blocked: number }>;
  };
  endpoints: {
    available: Array<{
      path: string;
      method: string;
      description: string;
    }>;
  };
}

export default function AdminAIDashboard() {
  const [stats, setStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/ai-stats');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setStats(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const performAction = async (action: string, params?: Record<string, string>) => {
    try {
      const response = await fetch('/api/admin/ai-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setActionResult(data.message);
      fetchStats();

      // Clear message after 3 seconds
      setTimeout(() => setActionResult(null), 3000);
    } catch (e: any) {
      setActionResult(`Error: ${e.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="text-sm mb-2">
                <Link href="/admin" className="text-indigo-600 hover:underline">
                  Admin
                </Link>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-600">AI Dashboard</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900">AI Services Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {stats?.timestamp ? new Date(stats.timestamp).toLocaleString() : '-'}
              </p>
            </div>
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Action result toast */}
      {actionResult && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {actionResult}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Cache Entries */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Cache Entries</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.cache.entries || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{stats?.cache.memoryUsage || '0 B'} used</p>
          </div>

          {/* Cache Hit Rate */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Cache Hit Rate</h3>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.cache.hitRate || '0%'}</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats?.cache.hits || 0} hits / {stats?.cache.misses || 0} misses
            </p>
          </div>

          {/* Rate Limited Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Tracked Users</h3>
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.rateLimit.totalTracked || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Active rate limit entries</p>
          </div>

          {/* Currently Blocked */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Blocked</h3>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.rateLimit.currentlyBlocked || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Currently rate limited</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Endpoints */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Endpoints</h2>
            <div className="space-y-3">
              {stats?.endpoints.available.map((endpoint, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                        {endpoint.method}
                      </span>
                      <code className="text-sm text-gray-700">{endpoint.path}</code>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{endpoint.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rate Limits by Endpoint */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate Limits by Type</h2>
            <div className="space-y-3">
              {Object.entries(stats?.rateLimit.byEndpoint || {}).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{type}</p>
                    <p className="text-sm text-gray-500">{data.tracked} tracked</p>
                  </div>
                  {data.blocked > 0 && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                      {data.blocked} blocked
                    </span>
                  )}
                </div>
              ))}
              {Object.keys(stats?.rateLimit.byEndpoint || {}).length === 0 && (
                <p className="text-gray-500 text-center py-4">No rate limit data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => performAction('cleanup-cache')}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Cleanup Expired Cache
            </button>
            <button
              onClick={() => performAction('clear-cache')}
              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            >
              Clear All Cache
            </button>
            <button
              onClick={() => performAction('cleanup-rate-limits')}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              Cleanup Rate Limits
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/wiki/explore"
            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Knowledge Graph</p>
                <p className="text-sm text-gray-500">Explore connections</p>
              </div>
            </div>
          </Link>

          <Link
            href="/api/ai/expand-query"
            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Query Expansion</p>
                <p className="text-sm text-gray-500">Test API</p>
              </div>
            </div>
          </Link>

          <Link
            href="/api/ai/vision"
            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Vision API</p>
                <p className="text-sm text-gray-500">Test API</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
