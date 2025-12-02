'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to new storyteller management page
export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/picc/storytellers');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Storyteller Management...</p>
      </div>
    </div>
  );
}
