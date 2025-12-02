'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  ArrowLeft, DollarSign, TrendingUp, TrendingDown,
  PieChart, BarChart3, Calendar, Download
} from 'lucide-react';

interface FinancialSnapshot {
  id: string;
  snapshot_date: string;
  snapshot_period: string;
  service_name: string;
  metrics: {
    budget_allocated?: number;
    budget_spent?: number;
    funding_sources?: string[];
    cost_per_service?: number;
  };
}

export default function FinancialKnowledgePage() {
  const [snapshots, setSnapshots] = useState<FinancialSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const supabase = createClient();

      const { data } = await supabase
        .from('data_snapshots')
        .select('*')
        .order('snapshot_date', { ascending: false });

      setSnapshots(data || []);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary stats
  const totalBudget = snapshots.reduce((sum, s) =>
    sum + (s.metrics?.budget_allocated || 0), 0
  );
  const totalSpent = snapshots.reduce((sum, s) =>
    sum + (s.metrics?.budget_spent || 0), 0
  );
  const utilizationRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const filteredSnapshots = selectedPeriod === 'all'
    ? snapshots
    : snapshots.filter(s => s.snapshot_period === selectedPeriod);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link
        href="/picc/knowledge"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Knowledge Base
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
        </div>
        <p className="text-gray-600">
          Budget tracking, funding sources, and financial metrics for community services
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <PieChart className="w-5 h-5" />
            <span className="text-sm">Total Budget</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${totalBudget.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Total Spent</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${totalSpent.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            {utilizationRate >= 80 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-amber-600" />
            )}
            <span className="text-sm">Utilization</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {utilizationRate.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Data Points</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {snapshots.length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Periods</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="annual">Annual</option>
        </select>

        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      ) : filteredSnapshots.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No financial data yet</h3>
          <p className="text-gray-600 mb-4">
            Financial metrics will appear here as data snapshots are recorded
          </p>
          <Link
            href="/picc/content-hub/data/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Data Snapshot
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Service</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Period</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Budget</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Spent</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSnapshots.map((snapshot) => {
                const budget = snapshot.metrics?.budget_allocated || 0;
                const spent = snapshot.metrics?.budget_spent || 0;
                const util = budget > 0 ? (spent / budget) * 100 : 0;

                return (
                  <tr key={snapshot.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(snapshot.snapshot_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {snapshot.service_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                        {snapshot.snapshot_period}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      ${budget.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      ${spent.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 text-xs rounded ${
                        util >= 80 ? 'bg-green-100 text-green-700' :
                        util >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {util.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Financial data is aggregated from service data snapshots.
          To add financial metrics, include budget information when creating data snapshots
          in the Content Hub.
        </p>
      </div>
    </div>
  );
}
