'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen, Users, MapPin, Clock, Tag, TrendingUp,
  BarChart3, Settings, Search, Menu, X, Home,
  Globe, Heart, Sparkles, ChevronRight, ChevronDown, Lightbulb, Mic
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  children?: NavItem[];
  badge?: string | number;
}

export function WikiNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['explore']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const mainNavigation: { [key: string]: NavItem[] } = {
    explore: [
      { label: 'All Stories', href: '/wiki/stories', icon: BookOpen },
      { label: 'By Category', href: '/wiki/categories', icon: Tag },
      { label: 'By People', href: '/wiki/people', icon: Users },
      { label: 'By Place', href: '/wiki/places', icon: MapPin },
      { label: 'Timeline', href: '/wiki/timeline', icon: Clock },
      { label: 'Topics', href: '/wiki/topics', icon: Globe },
    ],
    contribute: [
      { label: 'Share Your Voice', href: '/share-voice', icon: Mic },
      { label: 'Edit Profile', href: '/profile/edit', icon: Users },
      { label: 'Upload Media', href: '/media/upload', icon: Sparkles },
    ],
    knowledge: [
      { label: 'History & Heritage', href: '/wiki/history', icon: Clock },
      { label: 'Culture & Language', href: '/wiki/culture', icon: Globe },
      { label: 'Services & Programs', href: '/wiki/services', icon: Heart },
      { label: 'Achievements', href: '/wiki/achievements', icon: Sparkles },
    ],
    innovation: [
      { label: 'Overview', href: '/wiki/innovation', icon: Lightbulb },
      { label: 'Elders Trip', href: '/wiki/innovation/elders-trip', icon: Users },
      { label: 'Photo Studio', href: '/wiki/innovation/photo-studio', icon: Sparkles },
      { label: 'Local Server', href: '/wiki/innovation/local-server', icon: BarChart3 },
      { label: 'Storm Recovery', href: '/wiki/innovation/storm-recovery', icon: Heart },
    ],
    insights: [
      { label: 'Dashboard', href: '/analytics', icon: BarChart3 },
      { label: 'Patterns & Trends', href: '/insights/patterns', icon: TrendingUp },
      { label: 'Impact Analysis', href: '/insights/impact', icon: Heart },
    ],
  };

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

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
          w-72
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-teal-600">
          <Link href="/" className="block">
            <h1 className="text-xl font-bold text-white mb-1">Palm Island Wiki</h1>
            <p className="text-sm text-blue-100">Community Knowledge Base</p>
          </Link>
        </div>

        {/* Quick Search */}
        <div className="p-4 border-b border-gray-200">
          <Link
            href="/search"
            className="flex items-center gap-2 w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-all group"
          >
            <Search className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
            <span className="text-sm text-gray-600 group-hover:text-blue-600">
              Search wiki...
            </span>
          </Link>
        </div>

        {/* Main Navigation Sections */}
        <div className="p-4 space-y-4">
          {/* Home Link */}
          <Link
            href="/"
            className={`
              flex items-center gap-3 px-4 py-2 rounded-lg transition-all
              ${isActive('/') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
            `}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>

          {/* Explore Section */}
          <div>
            <button
              onClick={() => toggleSection('explore')}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Explore
              </span>
              {expandedSections.has('explore') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('explore') && (
              <div className="ml-4 mt-2 space-y-1">
                {mainNavigation.explore.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                      ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Contribute Section */}
          <div>
            <button
              onClick={() => toggleSection('contribute')}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              <span className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-600" />
                Contribute
              </span>
              {expandedSections.has('contribute') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('contribute') && (
              <div className="ml-4 mt-2 space-y-1">
                {mainNavigation.contribute.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                      ${
                        isActive(item.href)
                          ? 'bg-pink-50 text-pink-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Knowledge Section */}
          <div>
            <button
              onClick={() => toggleSection('knowledge')}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              <span className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Knowledge
              </span>
              {expandedSections.has('knowledge') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('knowledge') && (
              <div className="ml-4 mt-2 space-y-1">
                {mainNavigation.knowledge.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                      ${
                        isActive(item.href)
                          ? 'bg-green-50 text-green-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Innovation Section */}
          <div>
            <button
              onClick={() => toggleSection('innovation')}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                Innovation
              </span>
              {expandedSections.has('innovation') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('innovation') && (
              <div className="ml-4 mt-2 space-y-1">
                {mainNavigation.innovation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                      ${
                        isActive(item.href)
                          ? 'bg-amber-50 text-amber-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Insights Section */}
          <div>
            <button
              onClick={() => toggleSection('insights')}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Insights
              </span>
              {expandedSections.has('insights') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('insights') && (
              <div className="ml-4 mt-2 space-y-1">
                {mainNavigation.insights.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                      ${
                        isActive(item.href)
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 text-center">
            <p className="font-medium mb-1">Manbarra & Bwgcolman Country</p>
            <p className="italic">Community-controlled knowledge</p>
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

export default WikiNavigation;
