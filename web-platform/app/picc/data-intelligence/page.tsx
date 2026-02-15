'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import * as Tabs from '@radix-ui/react-tabs';
import { Network, TrendingUp, DollarSign, Building2, Lightbulb } from 'lucide-react';
import { useDataIntelligenceStore } from '@/lib/data-intelligence/store';

// Lazy-load tab content (no SSR for D3/Leaflet)
const NetworkTab = dynamic(() => import('@/components/data-intelligence/tabs/NetworkTab'), { ssr: false });
const TrendsTab = dynamic(() => import('@/components/data-intelligence/tabs/TrendsTab'), { ssr: false });
const FinancialTab = dynamic(() => import('@/components/data-intelligence/tabs/FinancialTab'), { ssr: false });
const ServicesTab = dynamic(() => import('@/components/data-intelligence/tabs/ServicesTab'), { ssr: false });
const InsightsTab = dynamic(() => import('@/components/data-intelligence/tabs/InsightsTab'), { ssr: false });

const TAB_CONFIG = [
  { id: 'network', label: 'Network', icon: Network },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'financial', label: 'Financial', icon: DollarSign },
  { id: 'services', label: 'Services', icon: Building2 },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
] as const;

export default function DataIntelligencePage() {
  const { activeTab, setActiveTab } = useDataIntelligenceStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Intelligence Hub</h1>
              <p className="text-gray-600 mt-1">
                Cross-domain analytics and organizational network visualization
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Supabase data
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <Tabs.List className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-gray-200 w-fit">
            {TAB_CONFIG.map(tab => {
              const Icon = tab.icon;
              return (
                <Tabs.Trigger
                  key={tab.id}
                  value={tab.id}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all
                    data-[state=active]:bg-gray-900 data-[state=active]:text-white
                    data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>

          <Tabs.Content value="network">
            <NetworkTab />
          </Tabs.Content>

          <Tabs.Content value="trends">
            <TrendsTab />
          </Tabs.Content>

          <Tabs.Content value="financial">
            <FinancialTab />
          </Tabs.Content>

          <Tabs.Content value="services">
            <ServicesTab />
          </Tabs.Content>

          <Tabs.Content value="insights">
            <InsightsTab />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
