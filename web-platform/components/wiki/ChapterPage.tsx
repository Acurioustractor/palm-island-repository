'use client';

import Link from 'next/link';
import {
  Clock, FileText, AlertTriangle, ArrowLeft, ArrowRight,
  Newspaper, BookOpen, Camera, Map, Scale, ChevronDown, ChevronUp,
  Filter, List, Globe,
} from 'lucide-react';
import { HeroSection } from '@/components/story-scroll/HeroSection';
import { ImageGallery } from '@/components/story-scroll/ImageGallery';
import { TableOfContents } from '@/components/wiki/TableOfContents';
import ElderReviewPanel from '@/components/wiki/ElderReviewPanel';
import type { HistoricalArtifact } from '@/lib/history/get-artifacts';
import type { HistoryChapter } from '@/lib/history/chapters';
import { useState } from 'react';

const ARTIFACT_TYPE_LABELS: Record<string, { label: string; icon: typeof Newspaper; color: string }> = {
  newspaper: { label: 'Newspaper', icon: Newspaper, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  book_excerpt: { label: 'Book Excerpt', icon: BookOpen, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  photograph: { label: 'Photograph', icon: Camera, color: 'bg-gray-100 text-gray-700 border-gray-300' },
  map: { label: 'Map', icon: Map, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  government_record: { label: 'Government Record', icon: FileText, color: 'bg-red-50 text-red-700 border-red-200' },
  court_record: { label: 'Court Record', icon: Scale, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  oral_history: { label: 'Oral History', icon: BookOpen, color: 'bg-orange-50 text-orange-700 border-orange-200' },
};

const RELATED_CHAPTERS: Record<string, string[]> = {
  manbarra: ['reserve', 'hull-river'],
  reserve: ['manbarra', 'hull-river', 'dormitories'],
  'hull-river': ['manbarra', 'reserve', 'languages'],
  languages: ['hull-river', 'reserve', 'dormitories'],
  dormitories: ['reserve', 'languages', 'strike-1957'],
  'strike-1957': ['dormitories', 'self-determination'],
  mulrunji: ['strike-1957', 'self-determination'],
  'self-determination': ['mulrunji', 'picc', 'strike-1957'],
  picc: ['self-determination'],
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

function getDecade(dateStr: string): string {
  try {
    const year = new Date(dateStr).getFullYear();
    const decade = Math.floor(year / 10) * 10;
    return `${decade}s`;
  } catch {
    return 'Unknown';
  }
}

interface ChapterPhoto {
  path: string;
  year: string;
  description: string;
}

interface ChapterPageProps {
  chapter: HistoryChapter;
  artifacts: HistoricalArtifact[];
  prevChapter: HistoryChapter | null;
  nextChapter: HistoryChapter | null;
  heroImage: string;
  photos?: ChapterPhoto[];
  allChapters?: HistoryChapter[];
}

export default function ChapterPage({
  chapter,
  artifacts,
  prevChapter,
  nextChapter,
  heroImage,
  photos = [],
  allChapters = [],
}: ChapterPageProps) {
  const [showAllArtifacts, setShowAllArtifacts] = useState(false);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [showMobileToc, setShowMobileToc] = useState(false);
  const [expandedDecades, setExpandedDecades] = useState<Set<string>>(new Set());

  const artifactsByType: Record<string, HistoricalArtifact[]> = {};
  for (const a of artifacts) {
    const type = a.artifact_type || 'other';
    if (!artifactsByType[type]) artifactsByType[type] = [];
    artifactsByType[type].push(a);
  }

  const datedArtifacts = artifacts
    .filter((a) => a.date_original)
    .sort((a, b) => new Date(a.date_original!).getTime() - new Date(b.date_original!).getTime());

  // Group timeline artifacts by decade
  const artifactsByDecade: Record<string, HistoricalArtifact[]> = {};
  for (const a of datedArtifacts) {
    const decade = getDecade(a.date_original!);
    if (!artifactsByDecade[decade]) artifactsByDecade[decade] = [];
    artifactsByDecade[decade].push(a);
  }

  // Filter artifacts by type
  const filteredArtifacts = activeTypeFilter
    ? artifacts.filter((a) => (a.artifact_type || 'other') === activeTypeFilter)
    : artifacts;
  const displayArtifacts = showAllArtifacts ? filteredArtifacts : filteredArtifacts.slice(0, 12);

  const galleryImages = photos.slice(0, 9).map((p) => ({
    url: p.path,
    alt: p.description,
    caption: p.description,
  }));

  // Related chapters
  const relatedSlugs = RELATED_CHAPTERS[chapter.slug] || [];
  const relatedChapters = relatedSlugs
    .map((slug) => allChapters.find((c) => c.slug === slug))
    .filter((c): c is HistoryChapter => !!c);

  const toggleDecade = (decade: string) => {
    setExpandedDecades((prev) => {
      const next = new Set(prev);
      if (next.has(decade)) next.delete(decade);
      else next.add(decade);
      return next;
    });
  };

  return (
    <div>
      {/* Hero */}
      <HeroSection
        title={chapter.title}
        subtitle={`${chapter.dateRange} — ${chapter.subtitle}`}
        backgroundImage={heroImage}
        height="tall"
        overlay="gradient"
        textPosition="bottom"
      />

      {/* Cultural Sensitivity Banner */}
      {chapter.sensitivity === 'high' && (
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
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
        </div>
      )}

      {/* Mobile TOC Button — offset above Elder Review button */}
      <button
        onClick={() => setShowMobileToc(!showMobileToc)}
        className="lg:hidden fixed bottom-20 right-6 z-40 bg-stone-800 text-white p-3 rounded-full shadow-lg hover:bg-stone-700 transition-colors"
        aria-label="Table of contents"
      >
        <List className="h-5 w-5" />
      </button>

      {/* Mobile TOC Drawer */}
      {showMobileToc && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileToc(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Contents</h3>
              <button onClick={() => setShowMobileToc(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <TableOfContents sticky={false} />
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex gap-12">
          {/* Main content */}
          <div className="flex-1 max-w-3xl">
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
              <Link
                href={`/wiki/graph?chapter=${chapter.slug}`}
                className="ml-auto flex items-center gap-1.5 text-picc-ochre hover:text-picc-ochre/80 font-medium transition-colors"
              >
                <Globe className="h-4 w-4" />
                Knowledge Graph
              </Link>
            </div>

            {/* Chapter Narrative */}
            <section className="prose prose-lg max-w-none mb-12">
              <h2 id="overview">Overview</h2>
              <p className="text-lg text-gray-700 leading-relaxed">{chapter.summary}</p>
            </section>

            {/* Photo Gallery — positioned early for visual context */}
            {galleryImages.length > 0 && (
              <section className="mb-12">
                <ImageGallery
                  title="Photo Gallery"
                  images={galleryImages}
                  columns={3}
                  backgroundColor="bg-gray-50"
                />
              </section>
            )}

            {/* Timeline — grouped by decade, all artifacts shown */}
            {Object.keys(artifactsByDecade).length > 0 && (
              <section className="mb-12">
                <h2 id="timeline" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-picc-ochre" />
                  Timeline
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    {datedArtifacts.length} dated artifact{datedArtifacts.length !== 1 ? 's' : ''}
                  </span>
                </h2>
                <div className="space-y-4">
                  {Object.entries(artifactsByDecade).map(([decade, decadeArtifacts]) => {
                    const isExpanded = expandedDecades.has(decade);
                    const showAll = decadeArtifacts.length <= 5 || isExpanded;
                    const visibleArtifacts = showAll ? decadeArtifacts : decadeArtifacts.slice(0, 3);

                    return (
                      <div key={decade}>
                        <button
                          onClick={() => toggleDecade(decade)}
                          className="flex items-center gap-2 mb-3 group"
                        >
                          <span className="text-sm font-bold text-picc-ochre bg-picc-ochre/10 px-3 py-1 rounded-full">
                            {decade}
                          </span>
                          <span className="text-xs text-gray-500">
                            {decadeArtifacts.length} item{decadeArtifacts.length !== 1 ? 's' : ''}
                          </span>
                          {decadeArtifacts.length > 5 && (
                            <span className="text-xs text-picc-ochre group-hover:underline">
                              {isExpanded ? 'Show less' : 'Show all'}
                            </span>
                          )}
                        </button>
                        <div className="relative border-l-2 border-picc-ochre/30 ml-4 space-y-4 mb-6">
                          {visibleArtifacts.map((artifact) => {
                            const typeInfo = ARTIFACT_TYPE_LABELS[artifact.artifact_type] || { label: artifact.artifact_type, icon: FileText, color: 'bg-stone-100 text-stone-700 border-stone-200' };
                            const Icon = typeInfo.icon;
                            return (
                              <div key={artifact.id} className="relative pl-8">
                                <div className="absolute left-[-9px] top-1.5 w-4 h-4 rounded-full bg-picc-ochre border-2 border-white" />
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-picc-ochre">
                                    {formatDate(artifact.date_original)}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeInfo.color}`}>
                                    <Icon className="h-2.5 w-2.5" />
                                    <span className="hidden sm:inline">{typeInfo.label}</span>
                                  </span>
                                </div>
                                <Link
                                  href={`/wiki/artifact/${artifact.id}`}
                                  className="text-gray-900 font-medium hover:text-picc-ochre transition-colors"
                                >
                                  {artifact.title}
                                </Link>
                                {artifact.content_summary && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2 hidden sm:block">{artifact.content_summary}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Sources & Artifacts */}
            {Object.keys(artifactsByType).length > 0 && (
              <section className="mb-12">
                <h2 id="sources" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-picc-ochre" />
                  Sources & Artifacts
                </h2>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setActiveTypeFilter(null)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      activeTypeFilter === null
                        ? 'bg-picc-ochre text-white border-picc-ochre'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-picc-ochre/50'
                    }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    All ({artifacts.length})
                  </button>
                  {Object.entries(artifactsByType).map(([type, items]) => {
                    const typeInfo = ARTIFACT_TYPE_LABELS[type] || { label: type, icon: FileText, color: 'bg-stone-100 text-stone-700 border-stone-200' };
                    const Icon = typeInfo.icon;
                    const isActive = activeTypeFilter === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setActiveTypeFilter(isActive ? null : type)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          isActive
                            ? 'bg-picc-ochre text-white border-picc-ochre'
                            : 'bg-white text-stone-700 border-stone-300 hover:border-picc-ochre/50'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {typeInfo.label} ({items.length})
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {displayArtifacts.map((artifact) => {
                    const typeInfo = ARTIFACT_TYPE_LABELS[artifact.artifact_type] || { label: artifact.artifact_type, icon: FileText, color: 'bg-stone-100 text-stone-700 border-stone-200' };
                    const Icon = typeInfo.icon;
                    return (
                      <div key={artifact.id} className="relative group/card">
                        <Link
                          href={`/wiki/artifact/${artifact.id}`}
                          className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-picc-ochre/50 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start gap-3">
                            {artifact.image_url ? (
                              <img
                                src={artifact.image_url}
                                alt={artifact.title}
                                className="w-20 h-20 object-cover rounded flex-shrink-0"
                              />
                            ) : (
                              <div className={`w-12 h-12 rounded flex items-center justify-center flex-shrink-0 border ${typeInfo.color}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 group-hover/card:text-picc-ochre transition-colors line-clamp-2">
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
                                <p className="text-xs text-gray-600 mt-1.5 line-clamp-3">{artifact.content_summary}</p>
                              )}
                            </div>
                          </div>
                        </Link>
                        {/* Desktop hover preview — appears below card */}
                        {(artifact.image_url || artifact.content_summary) && (
                          <div className="hidden lg:block absolute left-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-30 opacity-0 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto transition-opacity duration-200">
                            {artifact.image_url && (
                              <img
                                src={artifact.image_url}
                                alt={artifact.title}
                                className="w-full h-48 object-cover rounded-t-xl"
                              />
                            )}
                            <div className="p-4">
                              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border mb-2 ${typeInfo.color}`}>
                                <Icon className="h-3 w-3" />
                                {typeInfo.label}
                              </div>
                              <h4 className="text-sm font-bold text-gray-900 mb-1">{artifact.title}</h4>
                              {artifact.date_original && (
                                <p className="text-xs text-picc-ochre font-medium mb-2">{formatDate(artifact.date_original)}</p>
                              )}
                              {artifact.content_summary && (
                                <p className="text-xs text-gray-600 leading-relaxed">{artifact.content_summary}</p>
                              )}
                              {artifact.source_name && (
                                <p className="text-[10px] text-gray-400 mt-2">Source: {artifact.source_name}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {filteredArtifacts.length > 12 && !showAllArtifacts && (
                  <button
                    onClick={() => setShowAllArtifacts(true)}
                    className="mt-4 flex items-center gap-1.5 text-sm text-picc-ochre font-medium hover:text-picc-ochre/80 transition-colors"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Show all {filteredArtifacts.length} artifacts
                  </button>
                )}
                {showAllArtifacts && filteredArtifacts.length > 12 && (
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
                  Artifacts for this chapter are being collected and verified. Check back soon.
                </p>
              </div>
            )}

            {/* Related Chapters */}
            {relatedChapters.length > 0 && (
              <section className="mb-12">
                <h2 id="related" className="text-2xl font-bold text-gray-900 mb-6">
                  Related Chapters
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedChapters.map((rc) => (
                    <Link
                      key={rc.slug}
                      href={`/wiki/history/${rc.slug}`}
                      className="group block bg-stone-50 rounded-lg border border-stone-200 p-4 hover:border-picc-ochre/50 hover:shadow-md transition-all"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-picc-ochre">
                        {rc.dateRange}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-picc-ochre transition-colors mt-1">
                        {rc.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{rc.subtitle}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar — sticky TOC (desktop only) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <TableOfContents sticky />
          </div>
        </div>

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
    </div>
  );
}
