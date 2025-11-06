'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Home, Users, Search } from 'lucide-react';

export default function SidebarSimple() {
  return (
    <aside className="sidebar-nav">
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
        <Link href="/dashboard" className="sidebar-nav-item">
          <Home className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link href="/stories" className="sidebar-nav-item">
          <BookOpen className="w-5 h-5" />
          <span className="font-medium">Stories</span>
        </Link>
        <Link href="/storytellers" className="sidebar-nav-item">
          <Users className="w-5 h-5" />
          <span className="font-medium">People</span>
        </Link>
        <Link href="/search" className="sidebar-nav-item">
          <Search className="w-5 h-5" />
          <span className="font-medium">Search</span>
        </Link>
      </nav>
    </aside>
  );
}
