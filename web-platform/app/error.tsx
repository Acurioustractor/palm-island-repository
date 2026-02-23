'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEF3C7] px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <img
            src="/logo/picc-logo-full.png"
            alt="PICC Logo"
            className="h-16 mx-auto mb-4"
          />
        </div>
        <h1 className="text-2xl font-bold text-[#2D2319] mb-2">
          Something went wrong
        </h1>
        <p className="text-[#2D2319]/70 mb-6">
          We&apos;re sorry — an unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-3 bg-[#0B4F6C] text-white rounded-lg hover:bg-[#0B4F6C]/90 transition-colors font-medium"
        >
          Try again
        </button>
        <div className="mt-4">
          <a
            href="/"
            className="text-[#0EA5E9] hover:underline text-sm"
          >
            Return to home page
          </a>
        </div>
      </div>
    </div>
  );
}
