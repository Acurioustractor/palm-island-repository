import Link from 'next/link';
import { Clock, BookOpen, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import { getArtifactCounts } from '@/lib/history/get-artifacts';
import { HISTORY_CHAPTERS } from '@/lib/history/chapters';
import { getChapterHeroImage, getHistoryIndexHero } from '@/lib/wiki/get-photos';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';
import { HeroSection } from '@/components/story-scroll/HeroSection';

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
  const heroImage = getHistoryIndexHero();

  return (
    <div>
      {/* Hero */}
      <HeroSection
        title="History & Heritage"
        subtitle={`${HISTORY_CHAPTERS.length} chapters · ${totalArtifacts} verified artifacts · Manbarra & Bwgcolman Country`}
        backgroundImage={heroImage}
        height="medium"
        overlay="gradient"
        textPosition="center"
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Wiki', href: '/wiki' },
            { label: 'History & Heritage', href: '/wiki/history' },
          ]}
          className="mb-6"
        />

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {HISTORY_CHAPTERS.map((chapter, index) => {
            const count = artifactCounts[chapter.slug] || 0;
            const heroImg = getChapterHeroImage(chapter.slug);

            return (
                <Link
                  key={chapter.slug}
                  href={`/wiki/history/${chapter.slug}`}
                  className="group relative block h-72 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                    style={{ backgroundImage: `url(${heroImg})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-picc-ochre">
                        {chapter.dateRange}
                      </span>
                      {chapter.sensitivity === 'high' && (
                        <span className="text-xs px-2 py-0.5 bg-amber-500/80 text-white rounded-full flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Sensitive
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white group-hover:text-picc-ochre transition-colors mb-1">
                      {chapter.title}
                    </h2>
                    <p className="text-sm text-white/70 line-clamp-2 mb-3">{chapter.subtitle}</p>
                    <div className="flex items-center justify-between">
                      {count > 0 ? (
                        <span className="text-xs text-white/60 flex items-center gap-1">
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
                  </div>
                </Link>
            );
          })}
        </div>

        {/* Cinematic History Link */}
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
    </div>
  );
}
