import Link from 'next/link';
import { createServerComponentClient } from '@/lib/supabase/server';
import { createServerSupabase } from '@/lib/supabase/client';
import { ArrowRight } from 'lucide-react';
import PublicationsFilterableGrid from './PublicationsFilterableGrid';

export const dynamic = 'force-dynamic'
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
  const { data: publications } = await (supabase as any)
    .from('publications')
    .select('*')
    .eq('status', 'published')
    .order('published_date', { ascending: false }) as { data: Publication[] | null; error: any };

  // Fetch verified research sources using the service-role client
  // (research_sources has RLS that may block the cookie-based client)
  const adminSupabase = createServerSupabase();
  const { data: researchSources } = await adminSupabase
    .from('research_sources')
    .select('id, title, description, source_type, author, publisher, is_verified, is_primary_source, extracted_data, url')
    .eq('is_verified', true)
    .order('is_primary_source', { ascending: false });

  // Convert research_sources to publication shape so the grid can render them
  const researchAsPublications: Publication[] = (researchSources || []).map((r: any) => ({
    id: r.id,
    slug: `research-${r.id}`,
    title: r.title,
    description: r.description || null,
    category: r.extracted_data?.subtype || r.source_type || 'research',
    author: r.author || r.publisher || null,
    status: 'published',
    is_featured: false,
    tags: ['research-source'],
    pdf_url: r.url || null,
  }));

  // Merge: owned publications first, then verified research sources
  const allPublications = [...(publications || []), ...researchAsPublications];

  // Get featured publication
  const featured = allPublications?.find((p: Publication) => p.is_featured) || null;

  // Get unique categories for filtering
  const categories = Array.from(new Set(allPublications?.map((p: Publication) => p.category) || []));

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

      {/* Filterable content (client component) */}
      <PublicationsFilterableGrid
        publications={allPublications}
        categories={categories}
        featured={featured}
      />

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
