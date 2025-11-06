'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Users,
  Search,
  BarChart3,
  Upload,
  Settings,
  Menu,
  X,
  FileText,
  Globe,
  UserPlus,
  Folder,
  LogOut,
  Sparkles
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  divider?: boolean;
}

const navigationItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Stories', href: '/stories', icon: BookOpen },
  { label: 'People', href: '/storytellers', icon: Users },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'AI Research', href: '/research', icon: Sparkles, badge: 'New' },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'divider', href: '', icon: Home, divider: true },
  { label: 'Admin', href: '/admin', icon: Settings },
  { label: 'Upload', href: '/stories/submit', icon: Upload },
  { label: 'Analytics', href: '/reports/annual/2024', icon: BarChart3 },
  { label: 'Upload Docs', href: '/admin/upload-documents', icon: FileText },
  { label: 'Import', href: '/admin/import-repos', icon: Globe },
  { label: 'Add Person', href: '/admin/add-person', icon: UserPlus },
  { label: 'Manage', href: '/admin/manage-profiles', icon: Folder },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname?.startsWith(href) && href !== '';
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] md:hidden bg-white text-[rgb(var(--text-primary))] p-3 rounded-lg shadow-lg hover:bg-[rgb(var(--background-secondary))] transition-colors border border-[rgb(var(--border))]"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          sidebar-nav
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          transition-transform duration-300 ease-in-out
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[rgb(var(--border))]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] rounded-xl flex items-center justify-center shadow-md">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[rgb(var(--text-primary))] font-bold text-lg">Palm Island</h2>
              <p className="text-[rgb(var(--text-secondary))] text-xs">Story Server</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navigationItems.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-2 mx-4 border-t border-[rgb(var(--border))]"
                />
              );
            }

            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--primary))] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[rgb(var(--border))]">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-white transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">A</span>
            </div>
            <div className="flex-1">
              <p className="text-[rgb(var(--text-primary))] text-sm font-medium">Admin User</p>
              <p className="text-[rgb(var(--text-tertiary))] text-xs">admin@palmisland.org</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-white rounded-lg transition-all text-sm">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
