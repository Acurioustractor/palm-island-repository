'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Users, FileText, Mail, Image,
  BarChart3, Settings, Menu, X, Home, Clock, Search,
  Mic, TrendingUp, Lightbulb, ChevronRight, ChevronDown,
  Plus, Edit, Archive, Eye, Upload, Download, Folder,
  Target, Award, MessageSquare, Bell, Shield, Database, Heart, Building2
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  description?: string;
}

export function PICCNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['main', 'stories', 'analytics'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const navigation: { [key: string]: { title: string; icon: any; items: NavItem[] } } = {
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
        { label: 'Photo Gallery', href: '/picc/media/gallery', icon: Image, description: 'Browse photos' },
        { label: 'Collections', href: '/picc/media/collections', icon: Folder, description: 'Photo collections' },
        { label: 'Smart Folders', href: '/picc/media/smart-folders', icon: Target, description: 'Auto-organized photos' },
        { label: 'Images', href: '/picc/media/images', icon: Image, description: 'Story images' },
        { label: 'Videos', href: '/picc/media/videos', icon: FileText, description: 'Video content' },
        { label: 'Audio', href: '/picc/media/audio', icon: Mic, description: 'Voice recordings' },
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

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const sectionColors: { [key: string]: string } = {
    main: 'blue',
    stories: 'purple',
    community: 'teal',
    media: 'pink',
    analytics: 'green',
    content: 'amber',
    projects: 'orange',
    imports: 'cyan',
    knowledge: 'indigo',
    settings: 'gray',
  };

  const getColorClasses = (section: string, isActiveItem: boolean = false) => {
    const color = sectionColors[section] || 'blue';

    if (isActiveItem) {
      return {
        bg: `bg-${color}-50`,
        text: `text-${color}-700`,
        icon: `text-${color}-600`,
      };
    }

    return {
      icon: `text-${color}-600`,
      hover: 'text-gray-700 hover:bg-gray-50',
    };
  };

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
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-80
        `}
      >
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

            return (
              <div key={sectionKey}>
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                >
                  <span className="flex items-center gap-2">
                    <SectionIcon className={`h-4 w-4 ${getColorClasses(sectionKey).icon}`} />
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
                          className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all group
                            ${
                              itemIsActive
                                ? `bg-${sectionColors[sectionKey]}-50 text-${sectionColors[sectionKey]}-700 font-medium`
                                : 'text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          <ItemIcon className={`h-4 w-4 flex-shrink-0 ${itemIsActive ? `text-${sectionColors[sectionKey]}-600` : 'text-gray-400'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="truncate">{item.label}</span>
                              {item.badge && (
                                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${itemIsActive ? `bg-${sectionColors[sectionKey]}-100 text-${sectionColors[sectionKey]}-700` : 'bg-gray-100 text-gray-600'}`}>
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

        {/* Footer */}
        <div className="sticky bottom-0 mt-auto p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 text-center mb-2">
            <p className="font-medium">PICC Management Platform</p>
            <p className="italic">Community-controlled</p>
          </div>
          <div className="text-xs text-center text-gray-500">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            System Online
          </div>
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
