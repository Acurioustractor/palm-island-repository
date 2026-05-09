'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Users, FileText, Image,
  Menu, X, Search,
  Plus, Upload,
  ChevronRight, ChevronDown,
  ChevronsLeft, ChevronsRight, Wrench, Building2, Lightbulb, Palette, DollarSign,
  BarChart3, ClipboardCheck, Shield, ExternalLink, Target, Sparkles,
  Compass, Landmark, Network, AlertTriangle, Library, Quote, FolderKanban, TrendingUp
} from 'lucide-react';
import { useSidebar } from './SidebarProvider';
import { PICCLogo } from '@/components/ui/PICCLogo';

const EL_BASE = (process.env.NEXT_PUBLIC_EL_V2_URL?.replace(/\/$/, '') || 'https://picc.empathyledger.com');

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
}

interface NavSection {
  title: string;
  icon: React.ComponentType<any>;
  items: NavItem[];
}

// Staff view: streamlined for the new model
// Content (stories, media, voices) lives in Empathy Ledger
// PICC focuses on: strategy, services, reports, governance, innovation
const staffNavigation: { [key: string]: NavSection } = {
  essentials: {
    title: 'Overview',
    icon: LayoutDashboard,
    items: [
      { label: 'Dashboard', href: '/picc/dashboard', icon: LayoutDashboard, description: 'Live stats from EL + PICC' },
      { label: 'Launchpad', href: '/picc/launchpad', icon: Target, description: '20-year strategic plan' },
      { label: 'Next-20 Canvas', href: '/picc/next-20', icon: Compass, description: 'Visions + commitments + asks' },
      { label: 'Twenty years', href: '/picc/twenty-years', icon: Compass, description: 'Master narrative · charts · the showcase' },
      { label: 'Canvas', href: '/picc/canvas', icon: LayoutDashboard, description: 'Big picture · every signal · live' },
      { label: 'Stage walk', href: '/picc/walk', icon: Target, description: 'Presenter map · 13 stops' },
      { label: 'Search', href: '/picc/search', icon: Search, description: 'Search all content' },
    ],
  },
  reports: {
    title: 'Reports & Impact',
    icon: FileText,
    items: [
      { label: 'Annual Reports', href: '/picc/annual-reports', icon: FileText, description: 'Reports hub & workflow' },
      { label: 'Report Builder', href: '/picc/reports/builder', icon: FileText, description: 'On-demand audience reports' },
      { label: 'Report Readiness', href: '/picc/report-readiness', icon: ClipboardCheck, description: 'Annual report status' },
      { label: 'Impact', href: '/picc/impact', icon: BarChart3, description: 'Service impact metrics' },
      { label: 'Finances', href: '/picc/finances', icon: TrendingUp, description: '16-year curve + breakdown' },
      { label: 'Financials', href: '/picc/financials', icon: DollarSign, description: 'Financial overview & ratios' },
    ],
  },
  organisation: {
    title: 'Organisation',
    icon: Building2,
    items: [
      { label: 'Services', href: '/picc/services', icon: Building2, description: '26 active services · EL canonical' },
      { label: 'Projects', href: '/picc/projects', icon: FolderKanban, description: '10 projects · EL canonical' },
      { label: 'Governance', href: '/picc/governance', icon: Landmark, description: 'Board design + guardrails' },
      { label: 'Sector Map', href: '/picc/sector-map', icon: Network, description: '3-layer ecosystem view' },
      { label: 'Risks', href: '/picc/risks', icon: AlertTriangle, description: '8 structural pressures' },
      { label: 'Innovation', href: '/picc/innovation', icon: Lightbulb, description: 'Innovation projects' },
      { label: 'Elders Room', href: '/picc/elders-room', icon: Users, description: 'Elder-controlled space' },
      { label: 'Brand', href: '/picc/brand', icon: Palette, description: 'Brand assets & guidelines' },
    ],
  },
  ledger: {
    title: 'Empathy Ledger',
    icon: Sparkles,
    items: [
      { label: 'Library', href: '/picc/library', icon: Library, description: 'Publications + research + EL connections' },
      { label: 'Voices', href: '/picc/voices', icon: Quote, description: '58 storytellers · 870+ quotes' },
      { label: 'Knowledge Vault', href: '/picc/vault', icon: Sparkles, description: 'Second brain · vault browser' },
      { label: 'Open Empathy Ledger', href: EL_BASE, icon: ExternalLink, description: 'Stories, voices, transcripts' },
      { label: 'Photo Picker', href: '/20-years/strategy/photos', icon: Image, description: 'Browse PICC photos in EL' },
    ],
  },
};

// Advanced view: same model as staff but with admin tools surfaced
const advancedNavigation: { [key: string]: NavSection } = {
  main: {
    title: 'Overview',
    icon: LayoutDashboard,
    items: [
      { label: 'Dashboard', href: '/picc/dashboard', icon: LayoutDashboard, description: 'Live stats from EL + PICC' },
      { label: 'Launchpad', href: '/picc/launchpad', icon: Target, description: '20-year strategic plan' },
      { label: 'Next-20 Canvas', href: '/picc/next-20', icon: Compass, description: 'Visions + commitments + asks' },
      { label: 'Twenty years', href: '/picc/twenty-years', icon: Compass, description: 'Master narrative · charts · the showcase' },
      { label: 'Canvas', href: '/picc/canvas', icon: LayoutDashboard, description: 'Big picture · every signal · live' },
      { label: 'Stage walk', href: '/picc/walk', icon: Target, description: 'Presenter map · 13 stops' },
      { label: 'Search', href: '/picc/search', icon: Search, description: 'Search all content' },
    ],
  },
  reports: {
    title: 'Reports & Impact',
    icon: FileText,
    items: [
      { label: 'Annual Reports', href: '/picc/annual-reports', icon: FileText, description: 'Reports hub & workflow' },
      { label: 'Report Builder', href: '/picc/reports/builder', icon: FileText, description: 'On-demand audience reports' },
      { label: 'Report Readiness', href: '/picc/report-readiness', icon: ClipboardCheck, description: 'Annual report status' },
      { label: 'Impact', href: '/picc/impact', icon: BarChart3, description: 'Service impact metrics' },
      { label: 'Finances', href: '/picc/finances', icon: TrendingUp, description: '16-year curve + breakdown' },
      { label: 'Financials', href: '/picc/financials', icon: DollarSign, description: 'Financial overview & ratios' },
    ],
  },
  organisation: {
    title: 'Organisation',
    icon: Building2,
    items: [
      { label: 'Services', href: '/picc/services', icon: Building2, description: '26 active services · EL canonical' },
      { label: 'Projects', href: '/picc/projects', icon: FolderKanban, description: '10 projects · EL canonical' },
      { label: 'Governance', href: '/picc/governance', icon: Landmark, description: 'Board design + guardrails' },
      { label: 'Sector Map', href: '/picc/sector-map', icon: Network, description: '3-layer ecosystem view' },
      { label: 'Risks', href: '/picc/risks', icon: AlertTriangle, description: '8 structural pressures' },
      { label: 'Innovation', href: '/picc/innovation', icon: Lightbulb, description: 'Innovation projects' },
      { label: 'Elders Room', href: '/picc/elders-room', icon: Users, description: 'Elder-controlled space' },
      { label: 'Brand', href: '/picc/brand', icon: Palette, description: 'Brand assets & guidelines' },
    ],
  },
  ledger: {
    title: 'Empathy Ledger',
    icon: Sparkles,
    items: [
      { label: 'Library', href: '/picc/library', icon: Library, description: 'Publications + research + EL connections' },
      { label: 'Voices', href: '/picc/voices', icon: Quote, description: '58 storytellers · 870+ quotes' },
      { label: 'Knowledge Vault', href: '/picc/vault', icon: Sparkles, description: 'Second brain · vault browser' },
      { label: 'Open Empathy Ledger', href: EL_BASE, icon: ExternalLink, description: 'Stories, voices, transcripts' },
      { label: 'Photo Picker', href: '/20-years/strategy/photos', icon: Image, description: 'Browse PICC photos in EL' },
      { label: 'AI Chat', href: '/chat', icon: BookOpen, description: 'Ask about PICC' },
    ],
  },
  settings: {
    title: 'Settings',
    icon: Wrench,
    items: [
      { label: 'General', href: '/picc/settings', icon: Wrench, description: 'General settings' },
      { label: 'Team', href: '/picc/team', icon: Users, description: 'Manage team' },
      { label: 'Database', href: '/picc/database', icon: LayoutDashboard, description: 'Database tools' },
    ],
  },
};

function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {show && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
          {label}
        </div>
      )}
    </div>
  );
}

export function PICCNavigation() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, navMode, toggleNavMode } = useSidebar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['main', 'essentials', 'content', 'analytics'])
  );

  const navigation = navMode === 'staff' ? staffNavigation : advancedNavigation;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  // Get the primary href for a section (first item)
  const getSectionPrimaryHref = (section: NavSection) => section.items[0]?.href || '#';

  // Check if any item in section is active
  const isSectionActive = (section: NavSection) =>
    section.items.some((item) => isActive(item.href));

  const renderExpandedNav = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <PICCLogo variant="horizontal" size="sm" href="/picc/dashboard" theme="light" />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-2 w-full px-3 py-2 mb-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span>View Public Site</span>
          <span className="text-gray-400">&rarr;</span>
        </Link>
        <Link
          href="/picc/create"
          className="flex items-center gap-2 w-full px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Story</span>
        </Link>
      </div>

      {/* Main Navigation Sections */}
      <div className="p-3 space-y-1">
        {Object.entries(navigation).map(([sectionKey, section]) => {
          const isExpanded = expandedSections.has(sectionKey);

          return (
            <div key={sectionKey}>
              <button
                onClick={() => toggleSection(sectionKey)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
              >
                <span>{section.title}</span>
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>

              {isExpanded && (
                <div className="mt-0.5 space-y-0.5">
                  {section.items.map((item) => {
                    const itemIsActive = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors group
                          ${
                            itemIsActive
                              ? 'bg-gray-100 text-gray-900 font-medium border-l-2 border-gray-900 -ml-px pl-[11px]'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <div className="flex-1 min-w-0">
                          <span className="truncate block">{item.label}</span>
                          {item.description && (
                            <span className="text-xs text-gray-400 truncate block mt-0.5">{item.description}</span>
                          )}
                        </div>
                        <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 transition-opacity ${itemIsActive ? 'text-gray-400' : 'text-gray-300 opacity-0 group-hover:opacity-100'}`} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nav Mode Toggle + Collapse Toggle */}
      <div className="sticky bottom-0 mt-auto border-t border-gray-200 bg-white">
        <button
          onClick={toggleNavMode}
          className="flex items-center gap-2 w-full px-4 py-3 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Wrench className="h-3.5 w-3.5" />
          <span>{navMode === 'staff' ? 'Show all tools' : 'Simple view'}</span>
        </button>
        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-2 w-full px-4 py-3 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
          <span>Collapse sidebar</span>
        </button>
      </div>
    </>
  );

  const renderCollapsedRail = () => (
    <>
      {/* Collapsed Header */}
      <div className="p-3 border-b border-gray-200 bg-white sticky top-0 z-10 flex justify-center">
        <Link href="/picc/dashboard" className="block">
          <LayoutDashboard className="h-5 w-5 text-gray-400" />
        </Link>
      </div>

      {/* Section icons */}
      <div className="flex-1 py-3 space-y-1 flex flex-col items-center">
        {Object.entries(navigation).map(([sectionKey, section]) => {
          const SectionIcon = section.icon;
          const active = isSectionActive(section);

          return (
            <Tooltip key={sectionKey} label={section.title}>
              <Link
                href={getSectionPrimaryHref(section)}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-lg transition-colors
                  ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}
                `}
              >
                <SectionIcon className="h-5 w-5" />
              </Link>
            </Tooltip>
          );
        })}
      </div>

      {/* Expand button at bottom */}
      <div className="sticky bottom-0 mt-auto border-t border-gray-200 bg-white flex justify-center py-3">
        <button
          onClick={toggleCollapsed}
          className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <ChevronsRight className="h-5 w-5" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Navigation Sidebar */}
      <nav
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 overflow-y-auto z-40
          transition-all duration-300 ease-elegant flex flex-col
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-16' : 'w-72'}
        `}
      >
        {/* Mobile always shows expanded; desktop respects collapsed state */}
        <div className="hidden lg:flex flex-col h-full">
          {collapsed ? renderCollapsedRail() : renderExpandedNav()}
        </div>
        <div className="lg:hidden flex flex-col h-full">
          {renderExpandedNav()}
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

export default PICCNavigation;
