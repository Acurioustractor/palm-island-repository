'use client';

import Link from 'next/link';
import {
  Clock, FileText, ExternalLink, AlertTriangle, ArrowLeft, ArrowRight,
  Newspaper, BookOpen, Camera, Map, Scale, ChevronDown, ChevronUp,
} from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';
import ElderReviewPanel from '@/components/wiki/ElderReviewPanel';
import type { HistoricalArtifact } from '@/lib/history/get-artifacts';
import type { HistoryChapter } from '@/lib/history/chapters';
import { useState } from 'react';

const ARTIFACT_TYPE_LABELS: Record<string, { label: string; icon: typeof Newspaper }> = {
  newspaper: { label: 'Newspaper', icon: Newspaper },
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
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatYear(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).getFullYear().toString();
  } catch {
    return dateStr;
  }
}

interface ChapterPageProps {
  chapter: HistoryChapter;
  artifacts: HistoricalArtifact[];
  prevChapter: HistoryChapter | null;
  nextChapter: HistoryChapter | null;
}

export default function ChapterPage({
  chapter,
  artifacts,
  prevChapter,
  nextChapter,
}: ChapterPageProps) {
  const [showAllArtifacts, setShowAllArtifacts] = useState(false);

  // Group artifacts by type
  const artifactsByType: Record<string, HistoricalArtifact[]> = {};
  for (const a of artifacts) {
    const type = a.artifact_type || 'other';
    if (!artifactsByType[type]) artifactsByType[type] = [];
    artifactsByType[type].push(a);
  }

  // Timeline: artifacts sorted by date
  const datedArtifacts = artifacts
    .filter((a) => a.date_original)
    .sort((a, b) => new Date(a.date_original!).getTime() - new Date(b.date_original!).getTime());

  const displayArtifacts = showAllArtifacts ? artifacts : artifacts.slice(0, 12);

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'History', href: '/wiki/history' },
    { label: chapter.title, href: `/wiki/history/${chapter.slug}` },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Chapter Header */}
      <header className="mb-8">
        <span className="text-sm font-semibold uppercase tracking-wider text-picc-ochre">
          {chapter.dateRange}
        </span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-2">{chapter.title}</h1>
        <p className="text-xl text-gray-500">{chapter.subtitle}</p>
      </header>

      {/* Cultural Sensitivity Banner */}
      {chapter.sensitivity === 'high' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Cultural Sensitivity Notice</p>
            <p className="text-sm text-amber-700 mt-1">
              This chapter contains content about historical trauma. These stories are shared with
              respect and to ensure this history is never forgotten. Aboriginal and Torres Strait
              Islander readers are advised that this content may cause distress.
            </p>
          </div>
        </div>
      )}

      {/* Chapter Narrative */}
      <section className="prose prose-lg max-w-none mb-12">
        <p className="text-lg text-gray-700 leading-relaxed">{chapter.summary}</p>
      </section>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 pb-4 border-b border-gray-200">
        <span className="flex items-center gap-1.5">
          <FileText className="h-4 w-4" />
          {artifacts.length} verified artifact{artifacts.length !== 1 ? 's' : ''}
        </span>
        {datedArtifacts.length > 0 && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {formatYear(datedArtifacts[0].date_original)}
            {datedArtifacts.length > 1 && ` – ${formatYear(datedArtifacts[datedArtifacts.length - 1].date_original)}`}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          {Object.keys(artifactsByType).length} source type{Object.keys(artifactsByType).length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Timeline of Key Dates */}
      {datedArtifacts.length > 0 && (
        <section className="mb-12">
          <h2 id="timeline" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-picc-ochre" />
            Timeline
          </h2>
          <div className="relative border-l-2 border-picc-ochre/30 ml-4 space-y-6">
            {datedArtifacts.slice(0, 10).map((artifact) => (
              <div key={artifact.id} className="relative pl-8">
                <div className="absolute left-[-9px] top-1.5 w-4 h-4 rounded-full bg-picc-ochre border-2 border-white" />
                <div className="text-sm font-semibold text-picc-ochre">
                  {formatDate(artifact.date_original)}
                </div>
                <Link
                  href={`/wiki/artifact/${artifact.id}`}
                  className="text-gray-900 font-medium hover:text-picc-ochre transition-colors"
                >
                  {artifact.title}
                </Link>
                {artifact.content_summary && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{artifact.content_summary}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Artifacts by Type */}
      {Object.keys(artifactsByType).length > 0 && (
        <section className="mb-12">
          <h2 id="sources" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-picc-ochre" />
            Sources & Artifacts
          </h2>

          {/* Type filter pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(artifactsByType).map(([type, items]) => {
              const typeInfo = ARTIFACT_TYPE_LABELS[type] || { label: type, icon: FileText };
              const Icon = typeInfo.icon;
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-700 rounded-full text-sm"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {typeInfo.label} ({items.length})
                </span>
              );
            })}
          </div>

          {/* Artifact Cards */}
          <div className="grid gap-3 md:grid-cols-2">
            {displayArtifacts.map((artifact) => {
              const typeInfo = ARTIFACT_TYPE_LABELS[artifact.artifact_type] || { label: artifact.artifact_type, icon: FileText };
              const Icon = typeInfo.icon;
              return (
                <Link
                  key={artifact.id}
                  href={`/wiki/artifact/${artifact.id}`}
                  className="group bg-white rounded-lg border border-gray-200 p-4 hover:border-picc-ochre/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    {artifact.image_url ? (
                      <img
                        src={artifact.image_url}
                        alt={artifact.title}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-stone-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-stone-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-picc-ochre transition-colors line-clamp-2">
                        {artifact.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {artifact.date_original && <span>{formatDate(artifact.date_original)}</span>}
                        {artifact.source_name && (
                          <>
                            {artifact.date_original && <span className="opacity-50">|</span>}
                            <span>{artifact.source_name}</span>
                          </>
                        )}
                      </div>
                      {artifact.content_summary && (
                        <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{artifact.content_summary}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {artifacts.length > 12 && !showAllArtifacts && (
            <button
              onClick={() => setShowAllArtifacts(true)}
              className="mt-4 flex items-center gap-1.5 text-sm text-picc-ochre font-medium hover:text-picc-ochre/80 transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
              Show all {artifacts.length} artifacts
            </button>
          )}
          {showAllArtifacts && artifacts.length > 12 && (
            <button
              onClick={() => setShowAllArtifacts(false)}
              className="mt-4 flex items-center gap-1.5 text-sm text-picc-ochre font-medium hover:text-picc-ochre/80 transition-colors"
            >
              <ChevronUp className="h-4 w-4" />
              Show fewer
            </button>
          )}
        </section>
      )}

      {/* Empty State */}
      {artifacts.length === 0 && (
        <div className="text-center py-12 bg-stone-50 rounded-xl border border-stone-200">
          <FileText className="h-12 w-12 text-stone-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No artifacts yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Artifacts for this chapter are being collected and verified. Check back soon or
            contribute your knowledge using the review panel.
          </p>
        </div>
      )}

      {/* Chapter Navigation */}
      <nav className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
        {prevChapter ? (
          <Link
            href={`/wiki/history/${prevChapter.slug}`}
            className="flex items-center gap-2 text-gray-700 hover:text-picc-ochre transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <div className="text-right">
              <span className="text-xs text-gray-500 block">Previous</span>
              <span className="font-medium">{prevChapter.title}</span>
            </div>
          </Link>
        ) : (
          <div />
        )}
        <Link
          href="/wiki/history"
          className="text-sm text-gray-500 hover:text-picc-ochre transition-colors"
        >
          All Chapters
        </Link>
        {nextChapter ? (
          <Link
            href={`/wiki/history/${nextChapter.slug}`}
            className="flex items-center gap-2 text-gray-700 hover:text-picc-ochre transition-colors group"
          >
            <div>
              <span className="text-xs text-gray-500 block">Next</span>
              <span className="font-medium">{nextChapter.title}</span>
            </div>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <div />
        )}
      </nav>

      {/* Elder Review Panel */}
      <ElderReviewPanel
        chapterRef={chapter.slug}
        contentTitle={chapter.title}
      />
    </div>
  );
}
