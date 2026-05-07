'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PICCNavigation from '@/components/navigation/PICCNavigation';
import { SidebarProvider, useSidebar } from '@/components/navigation/SidebarProvider';

function PICCContent({ children, presenter }: { children: React.ReactNode; presenter: boolean }) {
  const { collapsed } = useSidebar();

  // Presenter mode (?presenter=1): hide chrome, full-bleed canvas. Used for
  // the leadership presentation demo so admin URLs project clean on a screen.
  if (presenter) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <div className={`${collapsed ? 'lg:ml-16' : 'lg:ml-72'} min-h-screen bg-white transition-all duration-300 ease-elegant`}>
      <div className="p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}

function PICCLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const presenter = searchParams.get('presenter') === '1';

  return (
    <SidebarProvider>
      {!presenter && <PICCNavigation />}
      <PICCContent presenter={presenter}>{children}</PICCContent>
      {presenter && <PresenterExitChip />}
    </SidebarProvider>
  );
}

// Tiny floating chip top-right so the presenter can leave the mode without
// having to remember the URL trick.
function PresenterExitChip() {
  return (
    <a
      href="?"
      className="fixed top-3 right-3 z-50 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] bg-white/90 backdrop-blur border border-stone-200 text-stone-600 hover:text-stone-900 shadow-sm"
      title="Exit presenter mode"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden />
      Presenter
    </a>
  );
}

export default function PICCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PICCLayoutInner>{children}</PICCLayoutInner>
    </Suspense>
  );
}
