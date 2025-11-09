'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Users, FileText, Mail,
  BarChart3, Settings, Menu, X, Home, Clock,
  Mic, TrendingUp, Lightbulb, ChevronRight, ChevronDown
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
}

export function PICCNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main']));

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
    main: [
      { label: 'Dashboard', href: '/picc/dashboard', icon: LayoutDashboard },
      { label: 'All Stories', href: '/admin/storytellers', icon: BookOpen },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
    content: [
      { label: 'Content Studio', href: '/picc/content-studio', icon: FileText },
      { label: 'Newsletter', href: '/picc/newsletter', icon: Mail },
      { label: 'Social Export', href: '/picc/social-export', icon: Lightbulb },
    ],
    community: [
      { label: 'Submissions', href: '/picc/submissions', icon: Clock },
      { label: 'Storytellers', href: '/storytellers', icon: Users },
      { label: 'Community Voice', href: '/picc/community-voice', icon: Mic },
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
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <Link href="/picc/dashboard" className="block">
            <h1 className="text-xl font-bold text-white mb-1">PICC Dashboard</h1>
            <p className="text-sm text-blue-100">Staff & Content Management</p>
          </Link>
        </div>

        {/* Quick Search */}
        <div className="p-4 border-b border-gray-200">
          <Link
            href="/"
            className="flex items-center gap-2 w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-all group"
          >
            <Home className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
            <span className="text-sm text-gray-600 group-hover:text-blue-600">
              Back to Public Site
            </span>
          </Link>
        </div>

        {/* Main Navigation Sections */}
        <div className="p-4 space-y-4">
          {/* Main Section */}
          <div>
            <button
              onClick={() => toggleSection('main')}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-blue-600" />
                Main
              </span>
              {expandedSections.has('main') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('main') && (
              <div className="ml-4 mt-2 space-y-1">
                {mainNavigation.main.map((item) => (
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

          {/* Content Section */}
          <div>
            <button
              onClick={() => toggleSection('content')}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Content Tools
              </span>
              {expandedSections.has('content') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('content') && (
              <div className="ml-4 mt-2 space-y-1">
                {mainNavigation.content.map((item) => (
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
                <div className="px-4 py-2 text-xs text-gray-500 italic">
                  Phase 2 features
                </div>
              </div>
            )}
          </div>

          {/* Community Section */}
          <div>
            <button
              onClick={() => toggleSection('community')}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" />
                Community
              </span>
              {expandedSections.has('community') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('community') && (
              <div className="ml-4 mt-2 space-y-1">
                {mainNavigation.community.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                      ${
                        isActive(item.href)
                          ? 'bg-teal-50 text-teal-700 font-medium'
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
            <p className="font-medium mb-1">PICC Staff Area</p>
            <p className="italic">Community-controlled platform</p>
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
