'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Clock, Search, Menu, X, Home,
  Globe, Sparkles, ChevronRight, ChevronDown, Lightbulb,
  MapPin, Heart, TrendingUp, Users, BarChart3, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

function SidebarSearch() {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<Array<{ id: string; title: string; type: string; url: string }>>([]);
  const [searching, setSearching] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = (value: string) => {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!value.trim()) { setResults([]); return; }

    timeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/wiki/search?q=${encodeURIComponent(value)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results?.slice(0, 5) || []);
        }
      } catch { /* ignore */ }
      setSearching(false);
    }, 300);
  };

  return (
    <div className="p-4 border-b border-gray-200 relative">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus-within:border-picc-ochre focus-within:ring-1 focus-within:ring-picc-ochre/30 transition-all">
        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search wiki..."
          className="bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none w-full"
        />
      </div>
      {results.length > 0 && (
        <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {results.map((r) => (
            <a
              key={r.id}
              href={r.url}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              <span className="text-xs text-picc-ochre font-medium uppercase">{r.type}</span>
              <span className="text-gray-900 truncate">{r.title}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function WikiNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['history']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const historyNav: NavItem[] = [
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
  ];

  const innovationNav: NavItem[] = [
    { label: 'Overview', href: '/wiki/innovation', icon: Lightbulb },
    { label: 'Elders Trip', href: '/wiki/innovation/elders-trip', icon: Users },
    { label: 'Photo Studio', href: '/wiki/innovation/photo-studio', icon: Sparkles },
    { label: 'Local Server', href: '/wiki/innovation/local-server', icon: BarChart3 },
    { label: 'Storm Recovery', href: '/wiki/innovation/storm-recovery', icon: Heart },
  ];

  const exploreNav: NavItem[] = [
    { label: 'Knowledge Graph', href: '/wiki/graph', icon: Globe },
    { label: 'Search', href: '/search', icon: Search },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const renderSection = (
    key: string,
    label: string,
    icon: React.ReactNode,
    items: NavItem[],
    activeColor: string,
    activeBg: string,
  ) => (
    <div>
      <button
        onClick={() => toggleSection(key)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
      >
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        {expandedSections.has(key) ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {expandedSections.has(key) && (
        <div className="ml-4 mt-2 space-y-1 max-h-80 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                ${isActive(item.href) ? `${activeBg} ${activeColor} font-medium` : 'text-gray-700 hover:bg-gray-50'}
              `}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="xl:hidden fixed top-4 left-4 z-50 bg-picc-red text-white p-3 rounded-lg shadow-lg hover:bg-picc-red/90 transition-all"
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Navigation Sidebar */}
      <nav
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-40
          transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
          ${collapsed ? 'w-16' : 'w-72'}
        `}
      >
        {collapsed ? (
          /* Collapsed state — just icons */
          <div className="flex flex-col items-center py-4 gap-2">
            <button
              onClick={() => setCollapsed(false)}
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-5 w-5 text-gray-600" />
            </button>
            <Link href="/wiki" className="p-3 hover:bg-gray-100 rounded-lg">
              <Home className="h-5 w-5 text-gray-600" />
            </Link>
            <Link href="/wiki/history" className="p-3 hover:bg-gray-100 rounded-lg">
              <Clock className="h-5 w-5 text-picc-ochre" />
            </Link>
            <Link href="/wiki/innovation" className="p-3 hover:bg-gray-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-picc-ochre" />
            </Link>
            <Link href="/wiki/graph" className="p-3 hover:bg-gray-100 rounded-lg">
              <Globe className="h-5 w-5 text-sage-600" />
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-picc-red to-picc-ochre flex items-center justify-between">
              <Link href="/wiki" className="block">
                <h1 className="text-xl font-bold text-white mb-1">Palm Island Wiki</h1>
                <p className="text-sm text-warm-100">History & Heritage</p>
              </Link>
              <button
                onClick={() => setCollapsed(true)}
                className="hidden xl:flex p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Quick Search */}
            <SidebarSearch />

            {/* Main Navigation */}
            <div className="p-4 space-y-4">
              {/* Wiki Home */}
              <Link
                href="/wiki"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                  pathname === '/wiki' ? 'bg-warm-50 text-picc-red font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Wiki Home</span>
              </Link>

              {/* History Section — expanded by default */}
              {renderSection(
                'history',
                'History',
                <Clock className="h-5 w-5 text-picc-ochre" />,
                historyNav,
                'text-picc-ochre',
                'bg-picc-ochre-50',
              )}

              {/* Innovation Section */}
              {renderSection(
                'innovation',
                'Innovation',
                <Lightbulb className="h-5 w-5 text-picc-ochre" />,
                innovationNav,
                'text-picc-ochre',
                'bg-picc-ochre-50',
              )}

              {/* Explore Section */}
              {renderSection(
                'explore',
                'Explore',
                <Globe className="h-5 w-5 text-sage-600" />,
                exploreNav,
                'text-sage-700',
                'bg-sage-50',
              )}
            </div>

            {/* Footer */}
            <div className="mt-auto p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600 text-center">
                <p className="font-medium mb-1">Manbarra & Bwgcolman Country</p>
                <p className="italic">Community-controlled knowledge</p>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

export default WikiNavigation;
