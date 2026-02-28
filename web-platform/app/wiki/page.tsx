import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen, FileText, Clock, ArrowRight, Bot, Lightbulb,
  Globe, Users, Sparkles, Heart, BarChart3, AlertTriangle,
} from 'lucide-react';
import { HISTORY_CHAPTERS } from '@/lib/history/chapters';
import { getArtifactCounts, getFeaturedArtifacts } from '@/lib/history/get-artifacts';
import { getChapterHeroImage, getWikiHubHero } from '@/lib/wiki/get-photos';
import { WikiSearchBar } from '@/components/wiki/WikiSearchBar';

export const dynamic = 'force-dynamic';

const INNOVATION_PROJECTS = [
  {
    title: 'Elders Trip',
    description: 'Cultural reconnection journey for Elders',
    href: '/wiki/innovation/elders-trip',
    icon: Users,
  },
  {
    title: 'Photo Studio',
    description: 'Community portrait and cultural documentation',
    href: '/wiki/innovation/photo-studio',
    icon: Sparkles,
  },
  {
    title: 'Local Server',
    description: 'Community-owned digital infrastructure',
    href: '/wiki/innovation/local-server',
    icon: BarChart3,
  },
  {
    title: 'Storm Recovery',
    description: 'Community resilience and disaster response',
    href: '/wiki/innovation/storm-recovery',
    icon: Heart,
  },
];

export default async function WikiIndexPage() {
  let artifactCounts: Record<string, number> = {};
  try {
    artifactCounts = await getArtifactCounts();
  } catch {
    // Gracefully degrade
  }

  const totalArtifacts = Object.values(artifactCounts).reduce((sum, n) => sum + n, 0);
  const heroImage = getWikiHubHero();

  let featuredArtifacts: Awaited<ReturnType<typeof getFeaturedArtifacts>> = [];
  try {
    featuredArtifacts = await getFeaturedArtifacts(6);
  } catch {
    // Gracefully degrade
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-50" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-[-0.02em] leading-[0.95]">
            Palm Island History Wiki
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-8">
            {HISTORY_CHAPTERS.length} chapters &middot; {totalArtifacts} verified artifacts &middot; Manbarra &amp; Bwgcolman Country
          </p>
          <WikiSearchBar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Chapter Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">History Chapters</h2>
            <Link href="/wiki/history" className="text-picc-ochre hover:text-picc-ochre/80 font-medium flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HISTORY_CHAPTERS.map((chapter) => {
              const count = artifactCounts[chapter.slug] || 0;
              const heroImg = getChapterHeroImage(chapter.slug);

              return (
                <Link
                  key={chapter.slug}
                  href={`/wiki/history/${chapter.slug}`}
                  className="group relative h-64 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
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
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-picc-ochre transition-colors">
                      {chapter.title}
                    </h3>
                    <p className="text-sm text-white/70 line-clamp-2">{chapter.subtitle}</p>
                    {count > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-white/60">
                        <FileText className="h-3.5 w-3.5" />
                        {count} artifact{count !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Artifacts */}
        {featuredArtifacts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Clock className="h-8 w-8 text-picc-ochre" />
                Featured Artifacts
              </h2>
              <Link href="/wiki/history" className="text-picc-ochre hover:text-picc-ochre/80 font-medium flex items-center gap-1">
                Browse all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredArtifacts.map((artifact) => (
                <Link
                  key={artifact.id}
                  href={`/wiki/artifact/${artifact.id}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-picc-ochre/50 hover:shadow-lg transition-all"
                >
                  {artifact.image_url && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={artifact.image_url}
                        alt={artifact.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {artifact.date_original && (
                        <span className="text-xs font-semibold text-picc-ochre">
                          {new Date(artifact.date_original).getFullYear()}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 capitalize">{artifact.artifact_type?.replace('_', ' ')}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-picc-ochre transition-colors line-clamp-2">
                      {artifact.title}
                    </h3>
                    {artifact.content_summary && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-3">{artifact.content_summary}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Innovation Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-picc-ochre" />
              Innovation Projects
            </h2>
            <Link href="/wiki/innovation" className="text-picc-ochre hover:text-picc-ochre/80 font-medium flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INNOVATION_PROJECTS.map((project) => (
              <Link
                key={project.href}
                href={project.href}
                className="group flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-picc-ochre/50 hover:shadow-lg transition-all"
              >
                <div className="p-3 bg-picc-ochre-50 rounded-xl group-hover:scale-110 transition-transform">
                  <project.icon className="h-6 w-6 text-picc-ochre" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-picc-ochre transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Explore Actions */}
        <section className="grid md:grid-cols-2 gap-6">
          <Link
            href="/wiki/graph"
            className="group bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-8 text-white hover:shadow-2xl transition-all"
          >
            <Globe className="h-10 w-10 mb-4 text-picc-ochre" />
            <h3 className="text-2xl font-bold mb-2">Knowledge Graph</h3>
            <p className="text-stone-300">
              Explore connections between people, events, and places in an interactive visualization.
            </p>
          </Link>

          <Link
            href="/history"
            className="group bg-gradient-to-br from-picc-red to-picc-ochre rounded-2xl p-8 text-white hover:shadow-2xl transition-all"
          >
            <BookOpen className="h-10 w-10 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Cinematic History</h3>
            <p className="text-white/80">
              Experience the full Palm Island story with immersive scroll animations and full-screen imagery.
            </p>
          </Link>
        </section>

        {/* AI Chat CTA */}
        <section className="mt-16 mb-8">
          <div className="bg-gradient-to-r from-picc-ochre via-picc-ochre to-warm-500 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Bot className="h-12 w-12" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Ask Our AI Assistant</h2>
                <p className="text-white/90 mb-4">
                  Have questions about Palm Island&apos;s history, programs, or community stories?
                  Our AI assistant has access to all {totalArtifacts} artifacts and 17 years of knowledge.
                </p>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-picc-ochre font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Bot className="h-5 w-5" />
                  Start a Conversation
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
