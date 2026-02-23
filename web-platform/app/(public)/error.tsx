'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Public page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-[#E8600A]/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-[#E8600A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#2D2319] mb-2">
          Something went wrong
        </h1>
        <p className="text-[#2D2319]/70 mb-6">
          We&apos;re sorry — this page encountered an unexpected error. Please try again or visit another page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 bg-[#0B4F6C] text-white rounded-lg hover:bg-[#0B4F6C]/90 transition-colors font-medium"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-[#0B4F6C] text-[#0B4F6C] rounded-lg hover:bg-[#0B4F6C]/5 transition-colors font-medium"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
