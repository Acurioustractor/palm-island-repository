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
    history: [
      { label: 'All Chapters', href: '/wiki/history', icon: Clock },
      { label: 'Manbarra Country', href: '/wiki/history/manbarra', icon: MapPin },
      { label: 'The Reserve', href: '/wiki/history/reserve', icon: Clock },
      { label: 'Hull River', href: '/wiki/history/hull-river', icon: Clock },
      { label: 'Many Tribes', href: '/wiki/history/languages', icon: Globe },
      { label: 'Dormitories', href: '/wiki/history/dormitories', icon: Clock },
      { label: '1957 Strike', href: '/wiki/history/strike-1957', icon: Heart },
      { label: 'Mulrunji', href: '/wiki/history/mulrunji', icon: Clock },
      { label: 'Self-Determination', href: '/wiki/history/self-determination', icon: TrendingUp },
      { label: 'PICC Today', href: '/wiki/history/picc', icon: Sparkles },
    ],
    knowledge: [
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
        className="lg:hidden fixed top-4 left-4 z-50 bg-picc-red text-white p-3 rounded-lg shadow-lg hover:bg-picc-red transition-all"
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
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-picc-red to-picc-ochre">
          <Link href="/" className="block">
            <h1 className="text-xl font-bold text-white mb-1">Palm Island Wiki</h1>
            <p className="text-sm text-warm-100">Community Knowledge Base</p>
          </Link>
        </div>

        {/* Quick Search */}
        <div className="p-4 border-b border-gray-200">
          <Link
            href="/search"
            className="flex items-center gap-2 w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-all group"
          >
            <Search className="h-4 w-4 text-gray-400 group-hover:text-picc-red" />
            <span className="text-sm text-gray-600 group-hover:text-picc-red">
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
              ${isActive('/') ? 'bg-warm-50 text-picc-red font-medium' : 'text-gray-700 hover:bg-gray-50'}
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
                <BookOpen className="h-5 w-5 text-picc-red" />
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
                          ? 'bg-warm-50 text-picc-red font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-warm-100 text-picc-red text-xs px-2 py-0.5 rounded-full">
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
                <Heart className="h-5 w-5 text-picc-red" />
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
                          ? 'bg-warm-50 text-picc-red font-medium'
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

          {/* History Section */}
          <div>
            <button
              onClick={() => toggleSection('history')}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-picc-ochre" />
                History
              </span>
              {expandedSections.has('history') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('history') && (
              <div className="ml-4 mt-2 space-y-1 max-h-64 overflow-y-auto">
                {mainNavigation.history.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                      ${
                        isActive(item.href)
                          ? 'bg-picc-ochre-50 text-picc-ochre font-medium'
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
                <Globe className="h-5 w-5 text-sage-600" />
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
                          ? 'bg-sage-50 text-sage-700 font-medium'
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
                <Lightbulb className="h-5 w-5 text-picc-ochre" />
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
                          ? 'bg-picc-ochre-50 text-picc-ochre font-medium'
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
                <BarChart3 className="h-5 w-5 text-picc-ochre" />
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
                          ? 'bg-warm-100 text-picc-ochre font-medium'
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
          {/* Share Your Voice CTA Button */}
          <Link
            href="/share-voice"
            className="flex items-center justify-center gap-2 w-full mb-4 px-4 py-3 bg-gradient-to-r from-picc-red to-picc-red hover:from-picc-red hover:to-picc-red text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all group"
          >
            <Mic className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span>Share Your Voice</span>
          </Link>

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
