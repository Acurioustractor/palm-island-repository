import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ExternalLink, FileText, Clock, ArrowLeft, Newspaper,
  BookOpen, Camera, Map, Scale, AlertTriangle, Tag,
} from 'lucide-react';
import { getArtifactById, getRelatedArtifacts } from '@/lib/history/get-artifacts';
import { getChapterBySlug } from '@/lib/history/chapters';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';
import ElderReviewPanel from '@/components/wiki/ElderReviewPanel';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const ARTIFACT_TYPE_INFO: Record<string, { label: string; icon: typeof FileText }> = {
  newspaper: { label: 'Newspaper Article', icon: Newspaper },
  book_excerpt: { label: 'Book Excerpt', icon: BookOpen },
  photograph: { label: 'Photograph', icon: Camera },
  map: { label: 'Map', icon: Map },
  government_record: { label: 'Government Record', icon: FileText },
  court_record: { label: 'Court Record', icon: Scale },
  oral_history: { label: 'Oral History', icon: BookOpen },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const artifact = await getArtifactById(id);
  if (!artifact) return { title: 'Not Found' };

  return {
    title: `${artifact.title} — Palm Island History Wiki`,
    description: artifact.content_summary || `Historical artifact: ${artifact.title}`,
  };
}

export default async function ArtifactDetailPage({ params }: PageProps) {
  const { id } = await params;
  const artifact = await getArtifactById(id);
  if (!artifact) notFound();

  const related = await getRelatedArtifacts(id, artifact.chapter_ref);
  const chapter = artifact.chapter_ref ? getChapterBySlug(artifact.chapter_ref) : null;
  const typeInfo = ARTIFACT_TYPE_INFO[artifact.artifact_type] || { label: artifact.artifact_type, icon: FileText };
  const TypeIcon = typeInfo.icon;

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'History', href: '/wiki/history' },
    ...(chapter
      ? [{ label: chapter.title, href: `/wiki/history/${chapter.slug}` }]
      : []),
    { label: artifact.title, href: `/wiki/artifact/${artifact.id}` },
  ];

  const isSensitive = artifact.cultural_sensitivity_level === 'high' ||
    artifact.cultural_sensitivity_level === 'medium';

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      {artifact.image_url ? (
        <div className="relative h-[40vh] min-h-[300px] max-h-[500px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${artifact.image_url})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-gray-50" />
          <div className="relative z-10 h-full flex flex-col justify-end max-w-4xl mx-auto px-4 pb-8">
            <Breadcrumbs items={breadcrumbs} className="mb-4 [&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-white/50 [&_li:last-child_span]:text-white" />
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm">
                <TypeIcon className="h-3.5 w-3.5" />
                {typeInfo.label}
              </span>
              {artifact.date_original && (
                <span className="text-sm text-white/80 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(artifact.date_original)}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{artifact.title}</h1>
            {artifact.source_name && (
              <p className="text-white/70">
                Source: <span className="font-medium text-white/90">{artifact.source_name}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <Breadcrumbs items={breadcrumbs} className="mb-6" />
          {chapter && (
            <Link
              href={`/wiki/history/${chapter.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-picc-ochre mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {chapter.title}
            </Link>
          )}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm">
                <TypeIcon className="h-3.5 w-3.5" />
                {typeInfo.label}
              </span>
              {artifact.date_original && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(artifact.date_original)}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{artifact.title}</h1>
            {artifact.source_name && (
              <p className="text-gray-500">
                Source: <span className="font-medium">{artifact.source_name}</span>
              </p>
            )}
          </header>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link (only when hero is shown, breadcrumbs are in hero) */}
      {artifact.image_url && chapter && (
        <Link
          href={`/wiki/history/${chapter.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-picc-ochre mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {chapter.title}
        </Link>
      )}

      {/* Cultural Sensitivity Notice */}
      {isSensitive && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            This artifact contains culturally sensitive content. It is shared with respect
            to preserve historical truth and honour those affected.
          </p>
        </div>
      )}

      {/* Content Summary */}
      {artifact.content_summary && (
        <section className="mb-8">
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Summary</h2>
            <p className="text-gray-800 leading-relaxed">{artifact.content_summary}</p>
          </div>
        </section>
      )}

      {/* Full Text Content */}
      {artifact.content_text && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Full Text</h2>
          <div className="prose prose-stone max-w-none bg-white border border-gray-200 rounded-lg p-6">
            {artifact.content_text.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {/* Source & Provenance */}
      <section className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Source & Attribution</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {artifact.source_name && (
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Source</dt>
              <dd className="text-gray-900 mt-1">{artifact.source_name}</dd>
            </div>
          )}
          {artifact.date_original && (
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Original Date</dt>
              <dd className="text-gray-900 mt-1">{formatDate(artifact.date_original)}</dd>
            </div>
          )}
          {artifact.artifact_type && (
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</dt>
              <dd className="text-gray-900 mt-1">{typeInfo.label}</dd>
            </div>
          )}
          {chapter && (
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Chapter</dt>
              <dd className="mt-1">
                <Link href={`/wiki/history/${chapter.slug}`} className="text-picc-ochre hover:text-picc-ochre/80 transition-colors">
                  {chapter.title}
                </Link>
              </dd>
            </div>
          )}
        </dl>
        {artifact.provenance_notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Provenance & Rights</dt>
            <dd className="text-sm text-gray-700">{artifact.provenance_notes}</dd>
          </div>
        )}
        {artifact.source_url && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <a
              href={artifact.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-picc-ochre hover:text-picc-ochre/80 font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View Original Source
            </a>
          </div>
        )}
      </section>

      {/* Tags */}
      {artifact.tags && artifact.tags.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Tag className="h-4 w-4" />
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {artifact.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Related Artifacts */}
      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Artifacts</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((rel) => {
              const relType = ARTIFACT_TYPE_INFO[rel.artifact_type] || { label: rel.artifact_type, icon: FileText };
              const RelIcon = relType.icon;
              return (
                <Link
                  key={rel.id}
                  href={`/wiki/artifact/${rel.id}`}
                  className="group flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-4 hover:border-picc-ochre/50 hover:shadow-sm transition-all"
                >
                  <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <RelIcon className="h-4 w-4 text-stone-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-picc-ochre transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {rel.date_original ? formatDate(rel.date_original) : rel.source_name}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Elder Review Panel */}
      <ElderReviewPanel
        artifactId={artifact.id}
        chapterRef={artifact.chapter_ref || undefined}
        contentTitle={artifact.title}
      />
      </div>
    </div>
  );
}
