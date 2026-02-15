'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SidebarContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
  navMode: 'staff' | 'advanced';
  toggleNavMode: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggleCollapsed: () => {},
  navMode: 'staff',
  toggleNavMode: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [navMode, setNavMode] = useState<'staff' | 'advanced'>('staff');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedCollapsed = localStorage.getItem('picc-sidebar-collapsed');
    if (savedCollapsed === 'true') setCollapsed(true);
    const savedMode = localStorage.getItem('picc-nav-mode');
    if (savedMode === 'advanced') setNavMode('advanced');
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('picc-sidebar-collapsed', String(next));
      return next;
    });
  }, []);

  const toggleNavMode = useCallback(() => {
    setNavMode((prev) => {
      const next = prev === 'staff' ? 'advanced' : 'staff';
      localStorage.setItem('picc-nav-mode', next);
      return next;
    });
  }, []);

  // Before mount, use defaults to avoid hydration mismatch
  const value: SidebarContextType = {
    collapsed: mounted ? collapsed : false,
    toggleCollapsed,
    navMode: mounted ? navMode : 'staff',
    toggleNavMode,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}
