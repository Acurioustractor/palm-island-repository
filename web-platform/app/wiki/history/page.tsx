import Link from 'next/link';
import { Clock, BookOpen, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import { getArtifactCounts } from '@/lib/history/get-artifacts';
import { HISTORY_CHAPTERS } from '@/lib/history/chapters';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'History & Heritage — Palm Island Wiki',
  description: 'Comprehensive history of Palm Island — Manbarra & Bwgcolman Country. 9 chapters covering thousands of years of history.',
};

export default async function HistoryChapterIndex() {
  let artifactCounts: Record<string, number> = {};
  try {
    artifactCounts = await getArtifactCounts();
  } catch {
    // Gracefully degrade
  }

  const totalArtifacts = Object.values(artifactCounts).reduce((sum, n) => sum + n, 0);

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'History & Heritage', href: '/wiki/history' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
          <Clock className="h-10 w-10 text-picc-ochre" />
          History & Heritage
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Manbarra & Bwgcolman Country — Our Journey, Our Stories
        </p>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {HISTORY_CHAPTERS.length} chapters
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            {totalArtifacts} verified artifacts
          </span>
        </div>
      </div>

      {/* Cultural Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Cultural Notice</p>
          <p className="text-sm text-amber-700 mt-1">
            Some chapters contain content about historical trauma including forced removals,
            deaths in custody, and the separation of children from families. These stories are
            shared with respect and to ensure this history is never forgotten.
          </p>
        </div>
      </div>

      {/* Chapter Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {HISTORY_CHAPTERS.map((chapter) => {
          const count = artifactCounts[chapter.slug] || 0;
          return (
            <Link
              key={chapter.slug}
              href={`/wiki/history/${chapter.slug}`}
              className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-picc-ochre/50 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-picc-ochre">
                  {chapter.dateRange}
                </span>
                {chapter.sensitivity === 'high' && (
                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                    Sensitive
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-picc-ochre transition-colors mb-1">
                {chapter.title}
              </h2>
              <p className="text-sm text-gray-500 mb-3">{chapter.subtitle}</p>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {chapter.summary}
              </p>
              <div className="flex items-center justify-between">
                {count > 0 ? (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {count} artifact{count !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span />
                )}
                <span className="text-picc-ochre text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Link to cinematic history page */}
      <div className="mt-12 bg-gradient-to-r from-stone-900 to-stone-800 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Experience the Full Story</h2>
        <p className="text-stone-300 mb-4">
          Prefer an immersive, cinematic reading experience? View our editorial history page
          with full-screen images, scroll animations, and the complete narrative.
        </p>
        <Link
          href="/history"
          className="inline-flex items-center gap-2 px-6 py-3 bg-picc-ochre text-white font-semibold rounded-xl hover:bg-picc-ochre/90 transition-colors"
        >
          <BookOpen className="h-5 w-5" />
          View Cinematic History
        </Link>
      </div>
    </div>
  );
}
