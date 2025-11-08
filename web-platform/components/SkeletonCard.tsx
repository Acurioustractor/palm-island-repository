export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />

      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded" />
          <div className="h-6 w-24 bg-gray-200 rounded" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-300 rounded w-3/4" />
          <div className="h-6 bg-gray-300 rounded w-1/2" />
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
