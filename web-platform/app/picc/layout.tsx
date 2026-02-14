'use client';

import PICCNavigation from '@/components/navigation/PICCNavigation';
import { SidebarProvider, useSidebar } from '@/components/navigation/SidebarProvider';

function PICCContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className={`${collapsed ? 'lg:ml-16' : 'lg:ml-72'} min-h-screen bg-white transition-all duration-300 ease-elegant`}>
      <div className="p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}

export default function PICCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <PICCNavigation />
      <PICCContent>{children}</PICCContent>
    </SidebarProvider>
  );
}
