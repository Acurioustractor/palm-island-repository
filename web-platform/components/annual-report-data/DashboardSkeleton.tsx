'use client';

export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Progress bar skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 bg-gray-200 rounded-full h-3" />
          <div className="w-16 h-4 bg-gray-200 rounded" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-7 w-24 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-0 -mb-px">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="px-5 py-3">
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-48 bg-gray-200 rounded-lg" />
          <div className="h-9 w-32 bg-gray-200 rounded-lg" />
          <div className="h-9 w-28 bg-gray-200 rounded-lg ml-auto" />
        </div>

        {/* Table rows */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b-2 border-gray-200 px-3 py-3 flex gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded flex-1" />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-b border-gray-100 px-3 py-3 flex gap-4">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
