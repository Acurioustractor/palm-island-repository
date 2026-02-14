import { getRecentStories, getFeaturedStories, getElderStories } from '@/lib/stories/utils';
import { StoryCard, StoryGrid } from '@/components/stories/StoryCard';
import { getPageMedia } from '@/lib/media/utils';
import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';

export const revalidate = 300; // Revalidate every 5 minutes

export default async function StoriesPage() {
  // Fetch different story collections
  const [featuredStories, recentStories, elderStories, heroMedia] = await Promise.all([
    getFeaturedStories(3),
    getRecentStories(12),
    getElderStories(6),
    getPageMedia({ pageContext: 'stories', pageSection: 'hero', fileType: 'image', limit: 1 })
  ]);

  const heroImage = heroMedia && heroMedia.length > 0 ? heroMedia[0].public_url : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Hero */}
      <section
        className="relative py-24 md:py-32 lg:py-40"
        style={heroImage ? {
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {
          background: 'linear-gradient(135deg, #f8f6f4 0%, #ede8e3 50%, #f0ece8 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-gray-400 mb-5">
            Manbarra & Bwgcolman Country
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-[-0.02em] leading-[1.05] mb-6 max-w-3xl">
            Community Stories
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed mb-10">
            Every voice matters. Every story shapes our future.
          </p>
          <Link
            href="/share-voice"
            className="inline-flex items-center gap-3 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 hover:scale-[0.97] active:scale-95 transition-all duration-300 ease-elegant"
          >
            Share Your Story
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
        {/* Featured Stories — Magazine grid: first large, rest smaller */}
        {featuredStories && featuredStories.length > 0 && (
          <section className="mb-20">
            <div className="mb-10">
              <p className="text-sm font-medium tracking-[0.15em] uppercase text-picc-red mb-3">
                Featured
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Featured Stories
              </h2>
            </div>
            {featuredStories.length >= 3 ? (
              <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
                <div className="md:row-span-2">
                  <StoryCard
                    story={featuredStories[0]}
                    variant="featured"
                    showExcerpt={true}
                    showStorytellerInfo={true}
                    showQuote={true}
                    className="h-full"
                  />
                </div>
                <StoryCard
                  story={featuredStories[1]}
                  variant="featured"
                  showExcerpt={true}
                  showStorytellerInfo={true}
                  showQuote={true}
                />
                <StoryCard
                  story={featuredStories[2]}
                  variant="featured"
                  showExcerpt={true}
                  showStorytellerInfo={true}
                  showQuote={true}
                />
              </div>
            ) : (
              <StoryGrid columns={3}>
                {featuredStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    variant="featured"
                    showExcerpt={true}
                    showStorytellerInfo={true}
                    showQuote={true}
                  />
                ))}
              </StoryGrid>
            )}
          </section>
        )}

        {/* Elder Stories */}
        {elderStories && elderStories.length > 0 && (
          <section className="mb-20">
            <div className="mb-10">
              <div className="flex items-center gap-2.5 mb-3">
                <Shield className="w-4 h-4 text-picc-ochre" />
                <p className="text-sm font-medium tracking-[0.15em] uppercase text-picc-ochre">
                  Elder Wisdom
                </p>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                Voices of Our Elders
              </h2>
              <p className="text-base text-gray-500 leading-relaxed">
                Wisdom, knowledge, and guidance from community elders
              </p>
            </div>
            <StoryGrid columns={3}>
              {elderStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  variant="default"
                  showExcerpt={true}
                  showStorytellerInfo={true}
                  showQuote={true}
                />
              ))}
            </StoryGrid>
          </section>
        )}

        {/* Recent Stories */}
        {recentStories && recentStories.length > 0 && (
          <section>
            <div className="mb-10">
              <p className="text-sm font-medium tracking-[0.15em] uppercase text-gray-400 mb-3">
                Latest
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                Recent Stories
              </h2>
              <p className="text-base text-gray-500 leading-relaxed">
                Latest voices from our community
              </p>
            </div>
            <StoryGrid columns={3}>
              {recentStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  variant="default"
                  showExcerpt={true}
                  showStorytellerInfo={true}
                  showQuote={true}
                />
              ))}
            </StoryGrid>
          </section>
        )}

        {/* No Stories Message */}
        {(!recentStories || recentStories.length === 0) && (!featuredStories || featuredStories.length === 0) && (
          <div className="text-center py-24">
            <p className="text-xl text-gray-400 mb-6">No stories available yet.</p>
            <Link
              href="/share-voice"
              className="inline-flex items-center gap-3 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all duration-300 ease-elegant"
            >
              Be the First to Share
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className="bg-gray-950 text-white py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-[-0.02em] leading-tight mb-5">
            Your Story Matters
          </h2>
          <p className="text-base md:text-lg text-gray-400 mb-10 leading-relaxed">
            Whether it&apos;s a moment of pride, a lesson learned, or a vision for the future &mdash;
            your voice strengthens our community.
          </p>
          <Link
            href="/share-voice"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:scale-[0.97] active:scale-95 transition-all duration-300 ease-elegant"
          >
            Share Your Story
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
