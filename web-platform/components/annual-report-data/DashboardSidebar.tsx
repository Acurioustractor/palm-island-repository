'use client';

import { useState } from 'react';
import {
  LayoutDashboard, Activity, BarChart3, DollarSign, Users,
  Star, BookOpen, Image, Rocket, Timer, FileCheck,
  TrendingUp, ChevronLeft, ChevronRight, FileText, BookCopy,
} from 'lucide-react';

type TabId =
  | 'overview' | 'services' | 'financials' | 'highlights'
  | 'stories' | 'board' | 'photos' | 'projects'
  | 'countdown' | 'preview' | 'trends' | 'pageplan' | 'editions';

interface SidebarTab {
  id: TabId;
  label: string;
  badge?: string;
}

interface SidebarSection {
  title: string;
  items: TabId[];
}

const SECTIONS: SidebarSection[] = [
  { title: 'Overview', items: ['overview', 'preview'] },
  { title: 'Data Entry', items: ['services', 'financials', 'board'] },
  { title: 'Content', items: ['highlights', 'stories', 'photos', 'projects'] },
  { title: 'Report Planning', items: ['pageplan', 'editions'] },
  { title: 'Historical', items: ['trends', 'countdown'] },
];

const ICONS: Record<TabId, React.ComponentType<{ className?: string }>> = {
  overview: LayoutDashboard,
  preview: FileCheck,
  services: Activity,
  financials: DollarSign,
  board: Users,
  highlights: Star,
  stories: BookOpen,
  photos: Image,
  projects: Rocket,
  trends: TrendingUp,
  countdown: Timer,
  pageplan: FileText,
  editions: BookCopy,
};

interface DashboardSidebarProps {
  tabs: SidebarTab[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  overallProgress: number;
}

export default function DashboardSidebar({
  tabs,
  activeTab,
  onTabChange,
  overallProgress,
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const tabMap = Object.fromEntries(tabs.map(t => [t.id, t]));

  // Progress ring for sidebar header
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  return (
    <aside
      className={`flex-shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-elegant ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header with gradient and progress ring */}
      <div className="p-4 bg-gradient-to-br from-picc-red to-picc-ochre text-white">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r={radius} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
              <circle
                cx="20" cy="20" r={radius}
                fill="none" stroke="white" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
              {overallProgress}%
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">Report Progress</div>
              <div className="text-xs text-white/70">Annual Report Data</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 overflow-y-auto py-2">
        {SECTIONS.map(section => {
          const visibleItems = section.items.filter(id => tabMap[id]);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="mb-1">
              {!collapsed && (
                <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {section.title}
                </div>
              )}
              {visibleItems.map(id => {
                const tab = tabMap[id];
                const Icon = ICONS[id] || LayoutDashboard;
                const isActive = id === activeTab;

                return (
                  <button
                    key={id}
                    onClick={() => onTabChange(id)}
                    title={collapsed ? tab.label : undefined}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 ease-elegant relative ${
                      isActive
                        ? 'text-picc-ochre bg-warm-50 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-picc-ochre rounded-r-full" />
                    )}
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-picc-ochre' : 'text-gray-400'}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{tab.label}</span>
                        {tab.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              isActive
                                ? 'bg-warm-100 text-picc-ochre'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 border-t border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
