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
  LogOut
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
  { label: 'Search', href: '/search', icon: Search },
  { label: 'divider', href: '', icon: Home, divider: true },
  { label: 'Admin', href: '/admin', icon: Settings },
  { label: 'Upload', href: '/stories/submit', icon: Upload },
  { label: 'Analytics', href: '/reports/annual/2024', icon: BarChart3 },
  { label: 'Documents', href: '/admin/upload-documents', icon: FileText },
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
        className="fixed top-4 left-4 z-50 md:hidden bg-ocean-deep text-white p-3 rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
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
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-coral-warm rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Palm Island</h2>
              <p className="text-white/60 text-xs">Story Server</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {navigationItems.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-4 mx-6 border-t border-white/10"
                />
              );
            }

            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  sidebar-nav-item
                  ${active ? 'active' : ''}
                `}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-coral-warm text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-coral-warm/20 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">A</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Admin User</p>
              <p className="text-white/60 text-xs">admin@palmisland.org</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
