export default function SkeletonStoryDetail() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Hero skeleton */}
      <div className="relative h-[70vh] bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 animate-pulse">
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="h-4 w-32 bg-white/30 rounded" />
              <div className="h-8 w-24 bg-white/30 rounded-full" />
              <div className="h-12 bg-white/40 rounded w-3/4" />
              <div className="h-12 bg-white/40 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <article className="container mx-auto px-4 pb-16 -mt-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 animate-pulse">
            {/* Breadcrumb */}
            <div className="flex gap-2 mb-8">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-4 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>

            {/* Quote */}
            <div className="mb-8 space-y-2 border-l-4 border-gray-300 pl-6">
              <div className="h-6 bg-gray-200 rounded w-full" />
              <div className="h-6 bg-gray-200 rounded w-5/6" />
            </div>

            {/* Content */}
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-5 bg-gray-200 rounded"
                  style={{ width: `${Math.random() * 20 + 80}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
