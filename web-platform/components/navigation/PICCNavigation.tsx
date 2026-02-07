'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Users, FileText, Mail, Image, Film,
  BarChart3, Settings, Menu, X, Home, Clock, Search,
  Mic, TrendingUp, Lightbulb, ChevronRight, ChevronDown,
  Plus, Edit, Archive, Eye, Upload, Download, Folder,
  Target, Award, MessageSquare, Bell, Shield, Database, Heart, Building2,
  ChevronsLeft, ChevronsRight, Wrench, Bot
} from 'lucide-react';
import { useSidebar } from './SidebarProvider';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  description?: string;
}

interface NavSection {
  title: string;
  icon: React.ComponentType<any>;
  items: NavItem[];
}

// Staff view: 8 essential links in flat sections
const staffNavigation: { [key: string]: NavSection } = {
  essentials: {
    title: 'Essentials',
    icon: LayoutDashboard,
    items: [
      { label: 'Dashboard', href: '/picc/dashboard', icon: LayoutDashboard, description: 'Overview & stats' },
      { label: 'Annual Reports', href: '/picc/annual-reports', icon: FileText, description: 'Report dashboard' },
      { label: 'Report Data', href: '/picc/annual-report-data', icon: Database, description: 'Data & metrics' },
      { label: 'CMO Agent', href: '/picc/agents/cmo', icon: Bot, description: 'Marketing intelligence' },
    ],
  },
  stories: {
    title: 'Stories',
    icon: BookOpen,
    items: [
      { label: 'Story Library', href: '/picc/stories', icon: BookOpen, description: 'All stories with bulk actions' },
      { label: 'Create New', href: '/picc/create', icon: Plus, description: 'Add new story' },
    ],
  },
  media: {
    title: 'Media',
    icon: Image,
    items: [
      { label: 'Gallery', href: '/picc/media/gallery', icon: Image, description: 'Browse media' },
      { label: 'Upload', href: '/picc/media/upload', icon: Upload, description: 'Upload new media' },
    ],
  },
  community: {
    title: 'Community',
    icon: Users,
    items: [
      { label: 'Storytellers', href: '/picc/storytellers', icon: Users, description: 'All storytellers' },
    ],
  },
  projects: {
    title: 'Projects',
    icon: Folder,
    items: [
      { label: 'All Projects', href: '/picc/projects', icon: Folder, description: 'View all projects' },
    ],
  },
};

// Advanced view: full 10-section nav (current)
const advancedNavigation: { [key: string]: NavSection } = {
  main: {
    title: 'Main',
    icon: LayoutDashboard,
    items: [
      { label: 'Dashboard', href: '/picc/dashboard', icon: LayoutDashboard, description: 'Overview & stats' },
      { label: 'Search', href: '/search', icon: Search, description: 'Search all content' },
    ],
  },
  stories: {
    title: 'Story Management',
    icon: BookOpen,
    items: [
      { label: 'Story Library', href: '/picc/stories', icon: BookOpen, description: 'All stories with bulk actions' },
      { label: 'Create New', href: '/picc/create', icon: Plus, description: 'Add new story' },
      { label: 'Pending Review', href: '/picc/submissions', icon: Clock, description: 'Review submissions', badge: '0' },
      { label: 'Published', href: '/picc/published', icon: Eye, description: 'View published stories' },
      { label: 'Drafts', href: '/picc/drafts', icon: Edit, description: 'Manage drafts' },
      { label: 'Archived', href: '/picc/archived', icon: Archive, description: 'Archived stories' },
    ],
  },
  community: {
    title: 'Community',
    icon: Users,
    items: [
      { label: 'Storytellers', href: '/picc/storytellers', icon: Users, description: 'All storytellers' },
      { label: 'Community Voice', href: '/picc/community-voice', icon: Mic, description: 'Anonymous stories' },
      { label: 'Upload Photos', href: '/picc/admin/upload-photos', icon: Upload, description: 'Profile photos' },
      { label: 'Permissions', href: '/picc/permissions', icon: Shield, description: 'Cultural protocols' },
    ],
  },
  media: {
    title: 'Media Library',
    icon: Image,
    items: [
      { label: 'All Media', href: '/picc/media', icon: Folder, description: 'Browse all media' },
      { label: 'Gallery', href: '/picc/media/gallery', icon: Image, description: 'Browse media' },
      { label: 'Video Links', href: '/picc/media/external-videos', icon: Film, description: 'YouTube/Vimeo/Descript links' },
      { label: 'Collections', href: '/picc/media/collections', icon: Folder, description: 'Photo collections' },
      { label: 'Smart Folders', href: '/picc/media/smart-folders', icon: Target, description: 'Auto-organized photos' },
      { label: 'Images', href: '/picc/media/images', icon: Image, description: 'Story images' },
      { label: 'Upload', href: '/picc/media/upload', icon: Upload, description: 'Upload new media' },
      { label: 'Bulk Upload', href: '/picc/media/upload-bulk', icon: Upload, description: 'Bulk import photos' },
    ],
  },
  analytics: {
    title: 'Analytics & Insights',
    icon: BarChart3,
    items: [
      { label: 'Overview', href: '/picc/analytics', icon: BarChart3, description: 'Key metrics' },
      { label: 'Story Analytics', href: '/picc/insights/patterns', icon: TrendingUp, description: 'Story insights' },
      { label: 'Impact Dashboard', href: '/picc/insights/impact', icon: Target, description: 'Impact analysis' },
      { label: 'Timeline View', href: '/picc/insights/timeline', icon: Clock, description: 'Timeline analysis' },
      { label: 'Export Reports', href: '/picc/reports', icon: Download, description: 'Download reports' },
    ],
  },
  content: {
    title: 'Content Studio',
    icon: Lightbulb,
    items: [
      { label: 'Export Studio', href: '/picc/content-studio', icon: Download, description: 'Social media exports' },
      { label: 'Newsletter Builder', href: '/picc/newsletter', icon: Mail, description: 'Create newsletters' },
      { label: 'Quote Cards', href: '/picc/quote-cards', icon: Image, description: 'Generate quote images' },
      { label: 'Report Generator', href: '/picc/report-generator', icon: FileText, description: 'Funder reports' },
    ],
  },
  projects: {
    title: 'Innovation Projects',
    icon: Lightbulb,
    items: [
      { label: 'All Projects', href: '/picc/projects', icon: Folder, description: 'View all projects' },
      { label: 'Photo Studio', href: '/picc/projects/photo-studio', icon: Image, description: 'On-Country photography' },
      { label: 'The Station', href: '/picc/projects/the-station', icon: Building2, description: 'Community hub' },
      { label: 'Elders Trips', href: '/picc/projects/elders-trips', icon: Users, description: 'Cultural connection' },
      { label: 'On-Country Server', href: '/picc/projects/on-country-server', icon: Database, description: 'Data sovereignty' },
      { label: 'Annual Reports', href: '/picc/projects/annual-report', icon: FileText, description: 'Automated reporting' },
      { label: 'Add New Project', href: '/picc/projects/new', icon: Plus, description: 'Create project' },
    ],
  },
  imports: {
    title: 'Import & Data',
    icon: Download,
    items: [
      { label: 'Import Stories', href: '/import', icon: Download, description: 'Bulk import stories' },
      { label: 'Import Transcripts', href: '/stories/import-transcript', icon: FileText, description: 'Import interview transcripts' },
      { label: 'Storytellers', href: '/storytellers/add', icon: Users, description: 'Add storytellers' },
      { label: 'Bulk Photo Upload', href: '/picc/media/upload-bulk', icon: Upload, description: 'Bulk photo import' },
    ],
  },
  knowledge: {
    title: 'Knowledge Base',
    icon: Database,
    items: [
      { label: 'Wiki Home', href: '/wiki/stories', icon: BookOpen, description: 'Browse wiki' },
      { label: 'History', href: '/wiki/history', icon: Clock, description: 'History & heritage' },
      { label: 'Culture', href: '/wiki/culture', icon: Users, description: 'Culture & language' },
      { label: 'Innovation', href: '/wiki/innovation', icon: Lightbulb, description: 'Innovation projects' },
      { label: 'Services', href: '/wiki/services', icon: Heart, description: 'PICC services' },
    ],
  },
  agents: {
    title: 'AI Agents',
    icon: Bot,
    items: [
      { label: 'CMO Agent', href: '/picc/agents/cmo', icon: Bot, description: 'Marketing intelligence' },
    ],
  },
  settings: {
    title: 'Settings',
    icon: Settings,
    items: [
      { label: 'General', href: '/picc/settings', icon: Settings, description: 'General settings' },
      { label: 'Team', href: '/picc/team', icon: Users, description: 'Manage team' },
      { label: 'Notifications', href: '/picc/notifications', icon: Bell, description: 'Notifications' },
      { label: 'Database', href: '/picc/database', icon: Database, description: 'Database tools' },
    ],
  },
};

const sectionColors: { [key: string]: string } = {
  main: 'blue',
  essentials: 'blue',
  stories: 'purple',
  community: 'teal',
  media: 'pink',
  analytics: 'green',
  content: 'amber',
  projects: 'orange',
  imports: 'cyan',
  knowledge: 'indigo',
  agents: 'purple',
  settings: 'gray',
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
    new Set(['main', 'essentials', 'stories', 'analytics'])
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
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 sticky top-0 z-10">
        <Link href="/picc/dashboard" className="block">
          <h1 className="text-xl font-bold text-white mb-1">PICC Management</h1>
          <p className="text-sm text-blue-100">Content & Community Platform</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <Link
          href="/"
          className="flex items-center gap-2 w-full px-4 py-2 mb-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all group text-sm"
        >
          <Home className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
          <span className="text-gray-700 group-hover:text-blue-600 font-medium">
            View Public Site
          </span>
        </Link>
        <Link
          href="/picc/create"
          className="flex items-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg transition-all text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Story</span>
        </Link>
      </div>

      {/* Main Navigation Sections */}
      <div className="p-4 space-y-2">
        {Object.entries(navigation).map(([sectionKey, section]) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSections.has(sectionKey);
          const color = sectionColors[sectionKey] || 'blue';

          return (
            <div key={sectionKey}>
              <button
                onClick={() => toggleSection(sectionKey)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
              >
                <span className="flex items-center gap-2">
                  <SectionIcon className={`h-4 w-4 text-${color}-600`} />
                  <span>{section.title}</span>
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {isExpanded && (
                <div className="mt-1 ml-2 space-y-0.5">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const itemIsActive = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all group
                          ${
                            itemIsActive
                              ? `bg-${color}-50 text-${color}-700 font-medium`
                              : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <ItemIcon className={`h-4 w-4 flex-shrink-0 ${itemIsActive ? `text-${color}-600` : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${itemIsActive ? `bg-${color}-100 text-${color}-700` : 'bg-gray-100 text-gray-600'}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <div className="text-xs text-gray-500 truncate">{item.description}</div>
                          )}
                        </div>
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
      <div className="sticky bottom-0 mt-auto border-t border-gray-200 bg-gray-50">
        <button
          onClick={toggleNavMode}
          className="flex items-center gap-2 w-full px-4 py-3 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
        >
          <Wrench className="h-3.5 w-3.5" />
          <span>{navMode === 'staff' ? 'Show all tools' : 'Simple view'}</span>
        </button>
        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-2 w-full px-4 py-3 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all border-t border-gray-200"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
          <span>Collapse sidebar</span>
        </button>
      </div>
    </>
  );

  const renderCollapsedRail = () => (
    <>
      {/* Collapsed Header — small icon */}
      <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 sticky top-0 z-10 flex justify-center">
        <Link href="/picc/dashboard" className="block">
          <LayoutDashboard className="h-5 w-5 text-white" />
        </Link>
      </div>

      {/* Section icons */}
      <div className="flex-1 py-3 space-y-1 flex flex-col items-center">
        {Object.entries(navigation).map(([sectionKey, section]) => {
          const SectionIcon = section.icon;
          const active = isSectionActive(section);
          const color = sectionColors[sectionKey] || 'blue';

          return (
            <Tooltip key={sectionKey} label={section.title}>
              <Link
                href={getSectionPrimaryHref(section)}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-lg transition-all
                  ${active ? `bg-${color}-50 text-${color}-600` : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}
                `}
              >
                <SectionIcon className="h-5 w-5" />
              </Link>
            </Tooltip>
          );
        })}
      </div>

      {/* Expand button at bottom */}
      <div className="sticky bottom-0 mt-auto border-t border-gray-200 bg-gray-50 flex justify-center py-3">
        <button
          onClick={toggleCollapsed}
          className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
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
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all"
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Navigation Sidebar */}
      <nav
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-40
          transition-all duration-300 ease-in-out flex flex-col
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-16' : 'w-80'}
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
