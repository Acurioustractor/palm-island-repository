'use client';

import { useReducer, useEffect, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/annual-report-data/DashboardHeader';
import DashboardSidebar from '@/components/annual-report-data/DashboardSidebar';
import ServicesPanel from '@/components/annual-report-data/ServicesPanel';
import FinancialsPanel from '@/components/annual-report-data/FinancialsPanel';
import HighlightsPanel from '@/components/annual-report-data/HighlightsPanel';
import PreviewPanel from '@/components/annual-report-data/PreviewPanel';
import StoriesPanel from '@/components/annual-report-data/StoriesPanel';
import BoardLeadershipPanel from '@/components/annual-report-data/BoardLeadershipPanel';
import PhotosMediaPanel from '@/components/annual-report-data/PhotosMediaPanel';
import ProjectsPanel from '@/components/annual-report-data/ProjectsPanel';
import CountdownPanel from '@/components/annual-report-data/CountdownPanel';
import OverviewPanel from '@/components/annual-report-data/OverviewPanel';
import HistoricalTrendsPanel from '@/components/annual-report-data/HistoricalTrendsPanel';
import DashboardSkeleton from '@/components/annual-report-data/DashboardSkeleton';
import PagePlannerPanel from '@/components/annual-report-data/PagePlannerPanel';
import EditionsPanel from '@/components/annual-report-data/EditionsPanel';
import QuickAddFAB from '@/components/annual-report-data/QuickAddFAB';
import { useToast, ToastProvider } from '@/components/ui/Toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useUndoStack } from '@/hooks/useUndoStack';
import type { QuickAddType } from '@/components/annual-report-data/QuickAddModal';

// Full 20-year range, grouped for the dropdown
const FISCAL_YEARS = [
  // Current
  { value: 2026, label: '2025-26', group: 'Current' },
  { value: 2025, label: '2024-25', group: 'Current' },
  // Maturation
  { value: 2024, label: '2023-24', group: 'Maturation (2019-2024)' },
  { value: 2023, label: '2022-23', group: 'Maturation (2019-2024)' },
  { value: 2022, label: '2021-22', group: 'Maturation (2019-2024)' },
  { value: 2021, label: '2020-21', group: 'Maturation (2019-2024)' },
  { value: 2020, label: '2019-20', group: 'Maturation (2019-2024)' },
  { value: 2019, label: '2018-19', group: 'Maturation (2019-2024)' },
  // Growth
  { value: 2018, label: '2017-18', group: 'Growth (2013-2018)' },
  { value: 2017, label: '2016-17', group: 'Growth (2013-2018)' },
  { value: 2016, label: '2015-16', group: 'Growth (2013-2018)' },
  { value: 2015, label: '2014-15', group: 'Growth (2013-2018)' },
  { value: 2014, label: '2013-14', group: 'Growth (2013-2018)' },
  { value: 2013, label: '2012-13', group: 'Growth (2013-2018)' },
  // Early Years
  { value: 2012, label: '2011-12', group: 'Early Years (2006-2012)' },
  { value: 2011, label: '2010-11', group: 'Early Years (2006-2012)' },
  { value: 2010, label: '2009-10', group: 'Early Years (2006-2012)' },
  { value: 2009, label: '2008-09', group: 'Early Years (2006-2012)' },
  { value: 2008, label: '2007-08', group: 'Early Years (2006-2012)' },
  { value: 2007, label: '2006-07', group: 'Early Years (2006-2012)' },
];

type TabId = 'services' | 'financials' | 'highlights' | 'preview' | 'stories' | 'board' | 'photos' | 'projects' | 'countdown' | 'overview' | 'trends' | 'pageplan' | 'editions';

const ALL_TABS: TabId[] = ['overview', 'services', 'financials', 'highlights', 'stories', 'board', 'photos', 'projects', 'pageplan', 'editions', 'trends', 'countdown', 'preview'];

interface Highlight {
  id?: string;
  report_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  impact_achieved: string | null;
  highlight_type: string | null;
  is_featured: boolean;
  display_order: number;
}

interface LeadershipMessage {
  id: string;
  full_name: string;
  position: string;
  leadership_type: string;
  message_title: string | null;
  message_content: string | null;
  message_excerpt: string | null;
  featured_quote: string | null;
}

interface DashboardState {
  fiscalYear: number;
  activeTab: TabId;
  services: any[];
  previousServices: any[];
  financials: any;
  highlights: Highlight[];
  leadership: LeadershipMessage[];
  reportId: string | null;
  loading: boolean;
  servicesWithData: number;
  totalServices: number;
  stories: any[];
  boardMembers: any[];
  boardLeadership: any[];
  reportMedia: any[];
  mediaSectionCounts: Record<string, number>;
  mediaGaps: string[];
  projects: any[];
  projectsFeaturedCount: number;
  projectsByType: Record<string, number>;
  lastFetchedAt: Date | null;
}

type Action =
  | { type: 'SET_FISCAL_YEAR'; fiscalYear: number }
  | { type: 'SET_TAB'; tab: TabId }
  | { type: 'SET_LOADING'; loading: boolean }
  | {
      type: 'SET_DATA';
      services: any[];
      previousServices: any[];
      financials: any;
      highlights: Highlight[];
      leadership: LeadershipMessage[];
      reportId: string | null;
      servicesWithData: number;
      totalServices: number;
    }
  | { type: 'SET_HIGHLIGHTS'; highlights: Highlight[] }
  | { type: 'SET_LEADERSHIP'; leadership: LeadershipMessage[] }
  | { type: 'INCREMENT_SERVICES_WITH_DATA' }
  | { type: 'SET_FINANCIALS_DONE' }
  | { type: 'SET_STORIES'; stories: any[] }
  | { type: 'SET_BOARD_DATA'; boardMembers: any[]; boardLeadership: any[] }
  | { type: 'SET_MEDIA_DATA'; media: any[]; sectionCounts: Record<string, number>; gaps: string[] }
  | { type: 'SET_PROJECTS_DATA'; projects: any[]; featuredCount: number; byType: Record<string, number> };

function getTabFromUrl(): TabId | null {
  if (typeof window === 'undefined') return null;
  // Support ?tab= query param (used by sidebar links)
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab') as TabId;
  if (tabParam && ALL_TABS.includes(tabParam)) {
    return tabParam;
  }
  // Fall back to hash
  const hash = window.location.hash.slice(1) as TabId;
  if (ALL_TABS.includes(hash)) {
    return hash;
  }
  return null;
}

function reducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case 'SET_FISCAL_YEAR':
      return { ...state, fiscalYear: action.fiscalYear, loading: true };
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_DATA':
      return {
        ...state,
        services: action.services,
        previousServices: action.previousServices,
        financials: action.financials,
        highlights: action.highlights,
        leadership: action.leadership,
        reportId: action.reportId,
        servicesWithData: action.servicesWithData,
        totalServices: action.totalServices,
        loading: false,
        lastFetchedAt: new Date(),
      };
    case 'SET_HIGHLIGHTS':
      return { ...state, highlights: action.highlights };
    case 'SET_LEADERSHIP':
      return { ...state, leadership: action.leadership };
    case 'INCREMENT_SERVICES_WITH_DATA':
      return { ...state, servicesWithData: state.servicesWithData + 1 };
    case 'SET_FINANCIALS_DONE':
      return {
        ...state,
        financials: state.financials || {},
      };
    case 'SET_STORIES':
      return { ...state, stories: action.stories };
    case 'SET_BOARD_DATA':
      return { ...state, boardMembers: action.boardMembers, boardLeadership: action.boardLeadership };
    case 'SET_MEDIA_DATA':
      return { ...state, reportMedia: action.media, mediaSectionCounts: action.sectionCounts, mediaGaps: action.gaps };
    case 'SET_PROJECTS_DATA':
      return { ...state, projects: action.projects, projectsFeaturedCount: action.featuredCount, projectsByType: action.byType };
    default:
      return state;
  }
}

export default function AnnualReportDataPage() {
  return (
    <ToastProvider>
      <AnnualReportDataDashboard />
    </ToastProvider>
  );
}

function AnnualReportDataDashboard() {
  const toast = useToast();
  const undoStack = useUndoStack();
  const [state, dispatch] = useReducer(reducer, {
    fiscalYear: 2025,
    activeTab: 'services' as TabId,
    services: [],
    previousServices: [],
    financials: null,
    highlights: [],
    leadership: [],
    reportId: null,
    loading: true,
    servicesWithData: 0,
    totalServices: 0,
    stories: [],
    boardMembers: [],
    boardLeadership: [],
    reportMedia: [],
    mediaSectionCounts: {},
    mediaGaps: [],
    projects: [],
    projectsFeaturedCount: 0,
    projectsByType: {},
    lastFetchedAt: null,
  });

  // Freshness label
  const [freshnessLabel, setFreshnessLabel] = useState<string>('');

  useEffect(() => {
    const update = () => {
      if (!state.lastFetchedAt) {
        setFreshnessLabel('');
        return;
      }
      const seconds = Math.round((Date.now() - state.lastFetchedAt.getTime()) / 1000);
      if (seconds < 60) setFreshnessLabel('Just now');
      else if (seconds < 3600) setFreshnessLabel(`${Math.floor(seconds / 60)}m ago`);
      else setFreshnessLabel(`${Math.floor(seconds / 3600)}h ago`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [state.lastFetchedAt]);

  const fyLabel =
    FISCAL_YEARS.find(f => f.value === state.fiscalYear)?.label ||
    `${state.fiscalYear - 1}-${String(state.fiscalYear).slice(2)}`;

  // On mount, sync tab from URL (?tab= or #hash) to avoid hydration mismatch
  useEffect(() => {
    const tab = getTabFromUrl();
    if (tab && tab !== state.activeTab) {
      dispatch({ type: 'SET_TAB', tab });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync active tab to URL hash
  useEffect(() => {
    window.location.hash = state.activeTab;
  }, [state.activeTab]);

  // Listen for browser back/forward on hash
  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.slice(1) as TabId;
      if (ALL_TABS.includes(hash)) {
        dispatch({ type: 'SET_TAB', tab: hash });
      }
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Fetch all data on mount and when fiscal year changes
  useEffect(() => {
    async function fetchData() {
      dispatch({ type: 'SET_LOADING', loading: true });
      try {
        const [metricsRes, prevMetricsRes, financialsRes, highlightsRes] =
          await Promise.all([
            fetch(`/api/annual-report-data/metrics?fy=${state.fiscalYear}`),
            fetch(`/api/annual-report-data/metrics?fy=${state.fiscalYear - 1}`),
            fetch(`/api/annual-report-data/financials?fy=${state.fiscalYear}`),
            fetch(`/api/annual-report-data/highlights?fy=${fyLabel}`),
          ]);

        const [metrics, prevMetrics, financials, highlightsData] = await Promise.all([
          metricsRes.json(),
          prevMetricsRes.json(),
          financialsRes.json(),
          highlightsRes.json(),
        ]);

        dispatch({
          type: 'SET_DATA',
          services: metrics.services || [],
          previousServices: prevMetrics.services || [],
          financials: financials.financials || null,
          highlights: highlightsData.highlights || [],
          leadership: highlightsData.leadership_messages || [],
          reportId: highlightsData.report_id || null,
          servicesWithData: metrics.services_with_data || 0,
          totalServices: metrics.total_services || 0,
        });

        // Fetch new tab data in parallel (non-blocking for initial load)
        const reportId = highlightsData.report_id;
        fetchNewTabData(reportId, fyLabel, state.fiscalYear);
      } catch (error) {
        console.error('Error fetching data:', error);
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    }
    fetchData();
  }, [state.fiscalYear, fyLabel]);

  async function fetchNewTabData(reportId: string | null, fyLabel: string, fiscalYear: number) {
    const fetches: Promise<void>[] = [];

    if (reportId) {
      fetches.push(
        fetch(`/api/annual-report-data/stories?report_id=${reportId}`)
          .then(r => r.json())
          .then(data => dispatch({ type: 'SET_STORIES', stories: data.stories || [] }))
          .catch(() => dispatch({ type: 'SET_STORIES', stories: [] }))
      );
    } else {
      dispatch({ type: 'SET_STORIES', stories: [] });
    }

    fetches.push(
      fetch('/api/annual-report-data/board')
        .then(r => r.json())
        .then(data => dispatch({
          type: 'SET_BOARD_DATA',
          boardMembers: data.board_members || [],
          boardLeadership: data.leadership || [],
        }))
        .catch(() => dispatch({ type: 'SET_BOARD_DATA', boardMembers: [], boardLeadership: [] }))
    );

    fetches.push(
      fetch(`/api/annual-report-data/media?fy_tag=fy:${fyLabel}`)
        .then(r => r.json())
        .then(data => dispatch({
          type: 'SET_MEDIA_DATA',
          media: data.media || [],
          sectionCounts: data.section_counts || {},
          gaps: data.gaps || [],
        }))
        .catch(() => dispatch({ type: 'SET_MEDIA_DATA', media: [], sectionCounts: {}, gaps: [] }))
    );

    fetches.push(
      fetch(`/api/annual-report-data/projects?fy=${fiscalYear}`)
        .then(r => r.json())
        .then(data => dispatch({
          type: 'SET_PROJECTS_DATA',
          projects: data.projects || [],
          featuredCount: data.featured_count || 0,
          byType: data.by_type || {},
        }))
        .catch(() => dispatch({ type: 'SET_PROJECTS_DATA', projects: [], featuredCount: 0, byType: {} }))
    );

    await Promise.allSettled(fetches);
  }

  // -- Save handlers with toast --

  const handleServiceSave = useCallback(
    async (data: any) => {
      try {
        const res = await fetch('/api/annual-report-data/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error);
        }

        const svc = state.services.find(
          (s: any) => s.organization_service_id === data.organization_service_id
        );
        if (svc && !svc.metrics) {
          dispatch({ type: 'INCREMENT_SERVICES_WITH_DATA' });
        }
      } catch (error) {
        console.error('Save error:', error);
        toast.error('Save failed', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    },
    [state.services, toast]
  );

  const handleFinancialsSave = useCallback(
    async (data: any) => {
      try {
        const res = await fetch('/api/annual-report-data/financials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error);
        }
        dispatch({ type: 'SET_FINANCIALS_DONE' });
        toast.success('Financials saved');
      } catch (error) {
        console.error('Save error:', error);
        toast.error('Save failed', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    },
    [toast]
  );

  const handleHighlightSave = useCallback(
    async (highlight: Highlight) => {
      try {
        const res = await fetch('/api/annual-report-data/highlights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'highlight', ...highlight }),
        });
        if (!res.ok) throw new Error('Save failed');
        const data = await res.json();

        dispatch({
          type: 'SET_HIGHLIGHTS',
          highlights: highlight.id
            ? state.highlights.map(h => (h.id === highlight.id ? data.highlight : h))
            : [...state.highlights.filter(h => h.id), data.highlight],
        });
        toast.success('Highlight saved');
      } catch (error) {
        console.error('Save error:', error);
        toast.error('Save failed');
      }
    },
    [state.highlights, toast]
  );

  const handleHighlightDelete = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/annual-report-data/highlights?id=${id}`, {
          method: 'DELETE',
        });
        dispatch({
          type: 'SET_HIGHLIGHTS',
          highlights: state.highlights.filter(h => h.id !== id),
        });
        toast.success('Highlight deleted');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Delete failed');
      }
    },
    [state.highlights, toast]
  );

  const handleLeadershipSave = useCallback(
    async (leader: LeadershipMessage) => {
      try {
        await fetch('/api/annual-report-data/highlights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'leadership_message',
            id: leader.id,
            message_title: leader.message_title,
            message_content: leader.message_content,
            message_excerpt: leader.message_excerpt,
            featured_quote: leader.featured_quote,
          }),
        });
        toast.success('Leadership message saved');
      } catch (error) {
        console.error('Save error:', error);
        toast.error('Save failed');
      }
    },
    [toast]
  );

  // -- Undo support for service metrics --

  const handleCellSaved = useCallback(
    (info: { serviceId: string; field: string; previousValue: any; newValue: any }) => {
      undoStack.push({
        id: info.serviceId,
        field: info.field,
        previousValue: info.previousValue,
        newValue: info.newValue,
      });
      toast.success('Changes saved', undefined, {
        label: 'Undo',
        onClick: () => {
          const entry = undoStack.pop();
          if (entry) {
            handleServiceSave({
              organization_service_id: entry.id,
              fiscal_year: state.fiscalYear,
              [entry.field]: entry.previousValue,
            }).catch(() => {});
          }
        },
      });
    },
    [undoStack, toast, handleServiceSave, state.fiscalYear]
  );

  // -- Derived state --

  const financialsDone = state.financials !== null;
  const highlightsCount = state.highlights.length;

  // Overall progress calculation
  const overallProgress = useMemo(() => {
    const servicePercent = state.totalServices > 0 ? state.servicesWithData / state.totalServices : 0;
    return Math.round(
      servicePercent * 35 +
      (financialsDone ? 1 : 0) * 15 +
      (highlightsCount > 0 ? 1 : 0) * 10 +
      (state.stories.length > 0 ? 1 : 0) * 15 +
      (state.boardMembers.length > 0 ? 1 : 0) * 10 +
      (state.reportMedia.length > 0 ? 1 : 0) * 10 +
      (state.projectsFeaturedCount > 0 ? 1 : 0) * 5
    );
  }, [state.servicesWithData, state.totalServices, financialsDone, highlightsCount, state.stories.length, state.boardMembers.length, state.reportMedia.length, state.projectsFeaturedCount]);

  const completeSections = useMemo(() => {
    let count = 0;
    if (state.servicesWithData === state.totalServices && state.totalServices > 0) count++;
    if (financialsDone) count++;
    if (highlightsCount > 0) count++;
    if (state.stories.length > 0) count++;
    if (state.boardMembers.length > 0) count++;
    if (state.reportMedia.length > 0) count++;
    if (state.projectsFeaturedCount > 0) count++;
    return count;
  }, [state.servicesWithData, state.totalServices, financialsDone, highlightsCount, state.stories.length, state.boardMembers.length, state.reportMedia.length, state.projectsFeaturedCount]);

  const handleNavigateTab = useCallback((tab: string) => {
    dispatch({ type: 'SET_TAB', tab: tab as TabId });
  }, []);

  // Handle QuickAdd save — refresh the relevant data section
  const handleQuickAddSaved = useCallback((type: QuickAddType) => {
    toast.success('Item added successfully');
    // Re-fetch data for the section that was modified
    const reportId = state.reportId;
    fetchNewTabData(reportId, fyLabel, state.fiscalYear);
  }, [state.reportId, fyLabel, state.fiscalYear, toast]);

  const tabs = [
    { id: 'overview' as TabId, label: 'Overview' },
    { id: 'services' as TabId, label: 'Services', badge: `${state.servicesWithData}/${state.totalServices}` },
    { id: 'financials' as TabId, label: 'Financials', badge: financialsDone ? 'Done' : '--' },
    { id: 'highlights' as TabId, label: 'Highlights', badge: `${highlightsCount}` },
    { id: 'stories' as TabId, label: 'Stories', badge: `${state.stories.length}` },
    { id: 'board' as TabId, label: 'Board & Leadership', badge: `${state.boardMembers.length}` },
    { id: 'photos' as TabId, label: 'Photos & Media', badge: `${state.reportMedia.length}` },
    { id: 'projects' as TabId, label: 'Projects', badge: `${state.projects.length}` },
    { id: 'pageplan' as TabId, label: 'Page Plan' },
    { id: 'editions' as TabId, label: 'Editions' },
    { id: 'trends' as TabId, label: 'Trends' },
    { id: 'countdown' as TabId, label: '20-Year Countdown' },
    { id: 'preview' as TabId, label: 'Readiness' },
  ];

  // Keyboard shortcuts
  const tabShortcuts = ALL_TABS.map((tab, i) => ({
    key: i >= 10 ? '' : i === 9 ? '0' : (i + 1).toString(),
    alt: true,
    handler: () => dispatch({ type: 'SET_TAB', tab }),
    description: `Go to ${tabs.find(t => t.id === tab)?.label || tab}`,
  })).filter(s => s.key !== '');

  const { showHelp, setShowHelp } = useKeyboardShortcuts([
    ...tabShortcuts,
    {
      key: 's',
      ctrl: true,
      handler: () => {
        toast.info('Use the save button in the active panel');
      },
      description: 'Save (panel-specific)',
    },
    {
      key: 'z',
      ctrl: true,
      handler: () => {
        const entry = undoStack.pop();
        if (entry) {
          handleServiceSave({
            organization_service_id: entry.id,
            fiscal_year: state.fiscalYear,
            [entry.field]: entry.previousValue,
          }).then(() => {
            toast.success('Change undone');
          }).catch(() => {});
        } else {
          toast.info('Nothing to undo');
        }
      },
      description: 'Undo last change',
    },
  ]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar navigation */}
      <DashboardSidebar
        tabs={tabs}
        activeTab={state.activeTab}
        onTabChange={tab => dispatch({ type: 'SET_TAB', tab })}
        overallProgress={overallProgress}
      />

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <DashboardHeader
            fiscalYear={state.fiscalYear}
            fiscalYears={FISCAL_YEARS}
            onFiscalYearChange={fy => dispatch({ type: 'SET_FISCAL_YEAR', fiscalYear: fy })}
            overallProgress={overallProgress}
            completeSections={completeSections}
            totalSections={7}
            freshnessLabel={freshnessLabel}
            activeTabLabel={tabs.find(t => t.id === state.activeTab)?.label || ''}
            reportId={state.reportId}
          />

          {/* Data Pipeline Quick Links */}
          <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 mb-6">
            <Link
              href="/picc/scraper"
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Curated Quotes</p>
                <p className="text-xs text-gray-500 mt-0.5">Extract & validate quotes</p>
              </div>
              <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">&rarr;</span>
            </Link>
            <Link
              href="/picc/knowledge/annual-reports"
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Report Timeline</p>
                <p className="text-xs text-gray-500 mt-0.5">Past reports & PDFs</p>
              </div>
              <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">&rarr;</span>
            </Link>
            <Link
              href="/annual-report/live"
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">View Public Report</p>
                <p className="text-xs text-gray-500 mt-0.5">Preview live page</p>
              </div>
              <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">&rarr;</span>
            </Link>
          </div>

          {state.loading ? (
            <DashboardSkeleton />
          ) : (
            <div className="animate-in fade-in duration-200">
              {state.activeTab === 'overview' && (
                <OverviewPanel
                  reportId={state.reportId}
                  fyLabel={fyLabel}
                  onNavigateTab={tab => dispatch({ type: 'SET_TAB', tab: tab as TabId })}
                />
              )}

              {state.activeTab === 'services' && (
                <ServicesPanel
                  services={state.services}
                  previousServices={state.previousServices}
                  fiscalYear={state.fiscalYear}
                  onSave={handleServiceSave}
                  onCellSaved={handleCellSaved}
                />
              )}

              {state.activeTab === 'financials' && (
                <FinancialsPanel
                  initialData={state.financials}
                  fiscalYear={state.fiscalYear}
                  onSave={handleFinancialsSave}
                />
              )}

              {state.activeTab === 'highlights' && (
                <HighlightsPanel
                  highlights={state.highlights}
                  leadership={state.leadership}
                  reportId={state.reportId}
                  onHighlightsChange={highlights =>
                    dispatch({ type: 'SET_HIGHLIGHTS', highlights })
                  }
                  onLeadershipChange={leadership =>
                    dispatch({ type: 'SET_LEADERSHIP', leadership })
                  }
                  onSaveHighlight={handleHighlightSave}
                  onDeleteHighlight={handleHighlightDelete}
                  onSaveLeadership={handleLeadershipSave}
                />
              )}

              {state.activeTab === 'stories' && (
                <StoriesPanel
                  stories={state.stories}
                  reportId={state.reportId}
                  onStoriesChange={stories =>
                    dispatch({ type: 'SET_STORIES', stories })
                  }
                />
              )}

              {state.activeTab === 'board' && (
                <BoardLeadershipPanel
                  boardMembers={state.boardMembers}
                  leadershipMembers={state.boardLeadership}
                  onBoardChange={members =>
                    dispatch({ type: 'SET_BOARD_DATA', boardMembers: members, boardLeadership: state.boardLeadership })
                  }
                  onLeadershipChange={members =>
                    dispatch({ type: 'SET_BOARD_DATA', boardMembers: state.boardMembers, boardLeadership: members })
                  }
                />
              )}

              {state.activeTab === 'photos' && (
                <PhotosMediaPanel
                  media={state.reportMedia}
                  sectionCounts={state.mediaSectionCounts}
                  gaps={state.mediaGaps}
                  fyLabel={fyLabel}
                  reportId={state.reportId}
                  onMediaChange={media =>
                    dispatch({
                      type: 'SET_MEDIA_DATA',
                      media,
                      sectionCounts: state.mediaSectionCounts,
                      gaps: state.mediaGaps,
                    })
                  }
                />
              )}

              {state.activeTab === 'projects' && (
                <ProjectsPanel
                  projects={state.projects}
                  featuredCount={state.projectsFeaturedCount}
                  byType={state.projectsByType}
                  onProjectsChange={projects => {
                    const featured = projects.filter((p: any) => p.featured).length;
                    dispatch({
                      type: 'SET_PROJECTS_DATA',
                      projects,
                      featuredCount: featured,
                      byType: state.projectsByType,
                    });
                  }}
                />
              )}

              {state.activeTab === 'pageplan' && (
                <PagePlannerPanel
                  reportId={state.reportId}
                  stories={state.stories}
                />
              )}

              {state.activeTab === 'editions' && (
                <EditionsPanel
                  reportId={state.reportId}
                  onNavigateToPagePlan={() => dispatch({ type: 'SET_TAB', tab: 'pageplan' })}
                />
              )}

              {state.activeTab === 'trends' && (
                <HistoricalTrendsPanel />
              )}

              {state.activeTab === 'countdown' && (
                <CountdownPanel />
              )}

              {state.activeTab === 'preview' && (
                <PreviewPanel
                  servicesWithData={state.servicesWithData}
                  totalServices={state.totalServices}
                  financialsDone={financialsDone}
                  highlightsCount={highlightsCount}
                  leadershipCount={state.leadership.length}
                  storiesCount={state.stories.length}
                  boardMembersCount={state.boardMembers.length}
                  photosCount={state.reportMedia.length}
                  photoGaps={state.mediaGaps}
                  projectsFeaturedCount={state.projectsFeaturedCount}
                  onNavigateTab={handleNavigateTab}
                  reportId={state.reportId}
                  readinessPercent={overallProgress}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Add FAB */}
      <QuickAddFAB
        reportId={state.reportId}
        fiscalYear={state.fiscalYear}
        onSaved={handleQuickAddSaved}
      />

      {/* Keyboard shortcuts help overlay */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2">
              {ALL_TABS.slice(0, 10).map((tab, i) => (
                <div key={tab} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{tabs.find(t => t.id === tab)?.label || tab}</span>
                  <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono">
                    Alt+{i === 9 ? '0' : i + 1}
                  </kbd>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Undo last change</span>
                  <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono">Ctrl+Z</kbd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Show this help</span>
                  <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono">?</kbd>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
