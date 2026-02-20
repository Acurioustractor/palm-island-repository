import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase/server';
import {
  ArrowLeft, Download, Share2, Calendar, User, Tag,
  FileText, Heart, BookOpen, Users, TrendingUp, Clock, Eye
} from 'lucide-react';

// Category configuration
const categoryConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  health: { label: 'Health & Wellbeing', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-100' },
  report: { label: 'Annual Report', icon: FileText, color: 'text-picc-red', bgColor: 'bg-warm-100' },
  research: { label: 'Research', icon: BookOpen, color: 'text-picc-ochre', bgColor: 'bg-warm-100' },
  community: { label: 'Community', icon: Users, color: 'text-sage-600', bgColor: 'bg-sage-100' },
  policy: { label: 'Policy', icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-100' },
};

interface Publication {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: string;
  tags?: string[];
  featured_image_url?: string;
  thumbnail_url?: string;
  pdf_url?: string;
  content?: any;
  author?: string;
  published_date?: string;
  fiscal_year?: string;
  status?: string;
  is_featured?: boolean;
  view_count?: number;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createServerComponentClient();
  const { data: publication } = await (supabase as any)
    .from('publications')
    .select('title, description')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single() as { data: { title: string; description?: string } | null };

  if (!publication) {
    return { title: 'Publication Not Found' };
  }

  return {
    title: `${publication.title} | Palm Island Publications`,
    description: publication.description,
  };
}

export default async function PublicationPage({ params }: { params: { slug: string } }) {
  const supabase = await createServerComponentClient();

  // Fetch the publication
  const { data: publication, error } = await (supabase as any)
    .from('publications')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single() as { data: Publication | null; error: any };

  if (!publication || error) {
    notFound();
  }

  // Update view count (fire and forget)
  const newViewCount = (publication.view_count ?? 0) + 1;
  (supabase as any)
    .from('publications')
    .update({ view_count: newViewCount })
    .eq('id', publication.id)
    .then(() => {});

  const config = categoryConfig[publication.category] || categoryConfig.report;
  const CategoryIcon = config.icon;

  // Parse content sections
  const sections = publication.content || [];

  // Build table of contents from sections
  const toc = sections
    .filter((s: any) => s.type === 'section' || s.type === 'timeline')
    .map((s: any, idx: number) => ({ id: `section-${idx}`, title: s.title }));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Back Button */}
          <Link
            href="/publications"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Publications</span>
          </Link>

          <div className="max-w-4xl">
            {/* Category & Date */}
            <div className="flex items-center gap-4 mb-6">
              <span className={`inline-flex items-center gap-2 px-4 py-2 ${config.bgColor} ${config.color} rounded-full text-sm font-medium`}>
                <CategoryIcon className="w-4 h-4" />
                {config.label}
              </span>
              {publication.published_date && (
                <span className="inline-flex items-center gap-2 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(publication.published_date).toLocaleDateString('en-AU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {publication.title}
            </h1>

            {/* Subtitle */}
            {publication.subtitle && (
              <p className="text-2xl text-picc-ochre-300 font-medium mb-6">
                {publication.subtitle}
              </p>
            )}

            {/* Description */}
            <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-3xl">
              {publication.description}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              {publication.author && (
                <span className="inline-flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {publication.author}
                </span>
              )}
              {(publication.view_count ?? 0) > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {publication.view_count ?? 0} views
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4" />
                ~{Math.ceil(JSON.stringify(publication.content).length / 1500)} min read
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              {publication.pdf_url && (
                <a
                  href={publication.pdf_url}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </a>
              )}
              <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-all">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_300px] gap-12">
          {/* Content Area */}
          <main className="min-w-0">
            {sections.map((section: any, idx: number) => (
              <PublicationSection key={idx} section={section} index={idx} />
            ))}

            {/* Tags */}
            {publication.tags && publication.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {publication.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      <Tag className="w-4 h-4" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Source Link */}
            <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
              <p className="text-sm text-gray-500">
                <strong>Source:</strong> This publication is based on community knowledge,
                official records, and organizational documentation from the Palm Island
                Community Company.
              </p>
              <Link
                href="/publications"
                className="inline-flex items-center gap-2 mt-4 text-picc-ochre font-medium hover:text-picc-ochre"
              >
                View more publications
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </main>

          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  In This Publication
                </h3>
                <nav className="space-y-2">
                  {toc.map((item: any) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-sm text-gray-600 hover:text-gray-900 hover:pl-2 transition-all py-1"
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-3">
                {publication.pdf_url && (
                  <a
                    href={publication.pdf_url}
                    className="flex items-center gap-3 p-4 bg-warm-50 rounded-xl text-picc-ochre hover:bg-warm-100 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-medium">Download PDF</span>
                  </a>
                )}
                <button className="w-full flex items-center gap-3 p-4 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Share Publication</span>
                </button>
              </div>

              {/* Related Links */}
              <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Related
                </h3>
                <div className="space-y-3">
                  <Link href="/annual-report/live" className="block text-sm text-gray-600 hover:text-picc-ochre">
                    Annual Reports
                  </Link>
                  <Link href="/stories" className="block text-sm text-gray-600 hover:text-picc-ochre">
                    Community Stories
                  </Link>
                  <Link href="/wiki/stories" className="block text-sm text-gray-600 hover:text-picc-ochre">
                    Knowledge Base
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Section Renderer Component
function PublicationSection({ section, index }: { section: any; index: number }) {
  switch (section.type) {
    case 'hero':
      // Hero is rendered in the page header, skip here
      return null;

    case 'stats':
      return (
        <div className="mb-12 py-8" id={`section-${index}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {section.stats?.map((stat: any, idx: number) => (
              <div key={idx} className="bg-gradient-to-br from-warm-50 to-warm-100 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-picc-ochre mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'section':
      return (
        <div className="mb-12" id={`section-${index}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
          <div className="prose prose-lg max-w-none">
            {section.content?.split('\n\n').map((para: string, idx: number) => {
              // Check for bullet points
              if (para.startsWith('•') || para.startsWith('-')) {
                const items = para.split('\n').filter(Boolean);
                return (
                  <ul key={idx} className="space-y-2 my-4">
                    {items.map((item: string, i: number) => (
                      <li key={i} className="text-gray-700">
                        {item.replace(/^[•\-]\s*/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              // Check for bold headers
              if (para.startsWith('**')) {
                const match = para.match(/^\*\*(.+?)\*\*\n?([\s\S]*)/);
                if (match) {
                  return (
                    <div key={idx} className="my-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{match[1]}</h3>
                      {match[2] && <p className="text-gray-700">{match[2]}</p>}
                    </div>
                  );
                }
              }
              return (
                <p key={idx} className="text-gray-700 leading-relaxed mb-4">
                  {para}
                </p>
              );
            })}
          </div>
        </div>
      );

    case 'timeline':
      return (
        <div className="mb-12" id={`section-${index}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
          <div className="relative pl-8 border-l-2 border-warm-200 space-y-8">
            {section.events?.map((event: any, idx: number) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[41px] w-5 h-5 rounded-full bg-picc-ochre border-4 border-white" />
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-bold text-picc-ochre mb-1">{event.year}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-gray-600 text-sm">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'quote':
      return (
        <div className="mb-12 bg-gradient-to-br from-warm-50 to-warm-100 rounded-2xl p-8">
          <blockquote className="text-xl md:text-2xl font-medium text-gray-900 italic mb-4">
            &ldquo;{section.quote}&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-picc-ochre flex items-center justify-center text-white font-bold">
              {section.author?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{section.author}</div>
              {section.context && (
                <div className="text-sm text-gray-500">{section.context}</div>
              )}
            </div>
          </div>
        </div>
      );

    case 'image':
      return (
        <div className="mb-12">
          <img
            src={section.url}
            alt={section.alt || section.caption || ''}
            className="w-full rounded-2xl"
          />
          {section.caption && (
            <p className="text-sm text-gray-500 text-center mt-3">{section.caption}</p>
          )}
        </div>
      );

    default:
      return null;
  }
}
