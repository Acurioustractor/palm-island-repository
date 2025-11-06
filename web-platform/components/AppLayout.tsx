'use client';

import React from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-earth-bg">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
