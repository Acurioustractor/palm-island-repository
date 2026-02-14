import Link from 'next/link';
import { createServerComponentClient } from '@/lib/supabase/server';
import { FileText, Calendar, Tag, ArrowRight, BookOpen, Heart, Users, TrendingUp } from 'lucide-react';

// Category configuration
const categoryConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  health: { label: 'Health & Wellbeing', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-100' },
  report: { label: 'Annual Report', icon: FileText, color: 'text-picc-red', bgColor: 'bg-warm-100' },
  research: { label: 'Research', icon: BookOpen, color: 'text-picc-ochre', bgColor: 'bg-warm-100' },
  community: { label: 'Community', icon: Users, color: 'text-sage-600', bgColor: 'bg-sage-100' },
  policy: { label: 'Policy', icon: TrendingUp, color: 'text-picc-red', bgColor: 'bg-warm-100' },
};

export const metadata = {
  title: 'Publications & Reports | Palm Island Community',
  description: 'Interactive reports, research, and documentation from the Palm Island Community Company.',
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

export default async function PublicationsPage() {
  const supabase = await createServerComponentClient();

  // Fetch all published publications
  const { data: publications, error } = await (supabase as any)
    .from('publications')
    .select('*')
    .eq('status', 'published')
    .order('published_date', { ascending: false }) as { data: Publication[] | null; error: any };

  // Get featured publication
  const featured = publications?.find((p: Publication) => p.is_featured);
  const regularPubs = publications?.filter((p: Publication) => !p.is_featured) || [];

  // Get unique categories for filtering
  const categories = Array.from(new Set(publications?.map((p: Publication) => p.category) || []));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Editorial Hero */}
      <section className="editorial-section bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
              Publications &amp; Reports
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.02em] leading-[1.1] mt-4 mb-6">
              Community Knowledge &amp; Research
            </h1>
            <p className="text-lg text-white/60 leading-relaxed">
              Explore comprehensive reports, research documents, and community publications
              from the Palm Island Community Company. Each publication provides insights into
              our programs, health outcomes, and journey toward self-determination.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-gray-500 flex-shrink-0">Filter:</span>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium">
              All Publications
            </button>
            {categories.map(cat => {
              const config = categoryConfig[cat] || categoryConfig.report;
              const Icon = config.icon;
              return (
                <button
                  key={cat}
                  className={`px-4 py-2 ${config.bgColor} ${config.color} rounded-full text-sm font-medium inline-flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0`}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Publication */}
      {featured && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
              Featured Publication
            </h2>
            <Link href={`/publications/${featured.slug}`} className="group block">
              <div className="bg-gradient-to-br from-warm-50 to-warm-100 rounded-3xl overflow-hidden border-2 border-transparent hover:border-picc-ochre-300 transition-all">
                <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      {(() => {
                        const config = categoryConfig[featured.category] || categoryConfig.report;
                        const Icon = config.icon;
                        return (
                          <span className={`inline-flex items-center gap-2 px-3 py-1 ${config.bgColor} ${config.color} rounded-full text-sm font-medium`}>
                            <Icon className="w-4 h-4" />
                            {config.label}
                          </span>
                        );
                      })()}
                      <span className="text-sm text-gray-500">
                        {featured.published_date && new Date(featured.published_date).toLocaleDateString('en-AU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-picc-ochre transition-colors">
                      {featured.title}
                    </h3>
                    {featured.subtitle && (
                      <p className="text-xl text-picc-ochre font-medium mb-4">
                        {featured.subtitle}
                      </p>
                    )}
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {featured.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-semibold group-hover:bg-picc-ochre transition-colors">
                        Read Full Report
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      {featured.pdf_url && (
                        <span className="text-sm text-gray-500">
                          PDF available
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-full aspect-[4/3] bg-gradient-to-br from-warm-100 to-warm-200 rounded-2xl flex items-center justify-center overflow-hidden">
                      {(featured.thumbnail_url || featured.featured_image_url) ? (
                        <img
                          src={featured.thumbnail_url || featured.featured_image_url}
                          alt={featured.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-24 h-24 text-picc-ochre-300" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* All Publications Grid */}
      <section className="editorial-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              All Publications
            </h2>
            <span className="text-sm text-gray-500">
              {publications?.length || 0} publications
            </span>
          </div>

          {publications && publications.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publications.map((pub) => (
                <PublicationCard key={pub.id} publication={pub} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Publications Yet</h3>
              <p className="text-gray-600">
                Publications will appear here once they are added.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="editorial-section bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
            Get Involved
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.02em] leading-[1.1] mt-4 mb-6">
            Want to contribute?
          </h2>
          <p className="text-lg text-white/60 mb-8 leading-relaxed">
            Help us document community knowledge and share important research.
            Contact PICC to discuss publication opportunities.
          </p>
          <Link
            href="/share-voice"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all"
          >
            Share Your Voice
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

// Publication Card Component
function PublicationCard({ publication }: { publication: any }) {
  const config = categoryConfig[publication.category] || categoryConfig.report;
  const Icon = config.icon;

  return (
    <Link href={`/publications/${publication.slug}`} className="group block">
      <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-xl transition-all h-full flex flex-col">
        {/* Thumbnail Area */}
        <div className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center relative overflow-hidden">
          {(publication.thumbnail_url || publication.featured_image_url) ? (
            <img
              src={publication.thumbnail_url || publication.featured_image_url}
              alt={publication.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileText className="w-16 h-16 text-gray-200" />
          )}
          <div className={`absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 ${config.bgColor} ${config.color} rounded-full text-sm font-medium`}>
            <Icon className="w-4 h-4" />
            {config.label}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Calendar className="w-4 h-4" />
            {publication.published_date && new Date(publication.published_date).toLocaleDateString('en-AU', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
            {publication.author && (
              <>
                <span>•</span>
                <span>{publication.author}</span>
              </>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-picc-ochre transition-colors line-clamp-2">
            {publication.title}
          </h3>

          {publication.subtitle && (
            <p className="text-picc-ochre font-medium mb-2 line-clamp-1">
              {publication.subtitle}
            </p>
          )}

          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
            {publication.description}
          </p>

          {/* Tags */}
          {publication.tags && publication.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {publication.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
              {publication.tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{publication.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Read More */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 group-hover:text-picc-ochre transition-colors inline-flex items-center gap-2">
              Read Publication
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            {publication.view_count > 0 && (
              <span className="text-xs text-gray-400">
                {publication.view_count} views
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
