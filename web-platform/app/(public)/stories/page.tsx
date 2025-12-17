import { getRecentStories, getFeaturedStories, getElderStories, getStoriesByTag } from '@/lib/stories/utils';
import { StoryCard, StoryGrid } from '@/components/stories/StoryCard';
import { getPageMedia } from '@/lib/media/utils';
import Link from 'next/link';
import { Plus, Sparkles, Shield } from 'lucide-react';

export const revalidate = 300; // Revalidate every 5 minutes

export default async function StoriesPage({ searchParams }: { searchParams?: { tag?: string } }) {
  const tag = searchParams?.tag ? String(searchParams.tag).trim() : '';

  // Fetch different story collections
  const heroMediaPromise = getPageMedia({ pageContext: 'stories', pageSection: 'hero', fileType: 'image', limit: 1 });

  const [heroMedia, tagStories, featuredStories, recentStories, elderStories] = await Promise.all([
    heroMediaPromise,
    tag ? getStoriesByTag(tag, 30) : Promise.resolve([]),
    tag ? Promise.resolve([]) : getFeaturedStories(3),
    tag ? Promise.resolve([]) : getRecentStories(12),
    tag ? Promise.resolve([]) : getElderStories(6),
  ]);

  const heroImage = heroMedia && heroMedia.length > 0 ? heroMedia[0].public_url : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative bg-white border-b border-gray-100 py-20"
        style={heroImage ? {
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            {tag ? `Stories: ${tag}` : 'Community Stories'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-700 max-w-3xl mx-auto">
            {tag ? 'Stories grouped by tag for easier discovery and sharing.' : 'Every voice matters. Every story shapes our future.'}
          </p>
          <p className="text-lg text-gray-600 italic mb-10">
            Manbarra & Bwgcolman Country • Palm Island
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/share-voice"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all"
            >
              <Plus className="w-5 h-5" />
              Share Your Story
            </Link>
            {tag && (
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-900 hover:text-white transition-all"
              >
                Clear filter
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-900 hover:text-white transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-gray-900">{recentStories.length}+</div>
              <div className="text-sm text-gray-600 mt-1">Community Stories</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">{elderStories.length}+</div>
              <div className="text-sm text-gray-600 mt-1">Elder Wisdom</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600 mt-1">Community Controlled</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900">∞</div>
              <div className="text-sm text-gray-600 mt-1">Impact</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tag Results */}
        {tag && (
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Tagged stories
              </h2>
              <p className="text-lg text-gray-600">
                Showing {tagStories.length} story{tagStories.length === 1 ? '' : 'ies'} tagged <span className="font-semibold">{tag}</span>.
              </p>
            </div>
            {tagStories.length > 0 ? (
              <StoryGrid columns={3}>
                {tagStories.map((story) => (
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
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <p className="text-lg text-gray-600">No public stories found for this tag yet.</p>
                <p className="text-sm text-gray-500 mt-2">Add the tag to a story in the editor, then publish it.</p>
              </div>
            )}
          </section>
        )}

        {/* Featured Stories */}
        {!tag && featuredStories && featuredStories.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-8 h-8 text-picc-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Stories</h2>
            </div>
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
          </section>
        )}

        {/* Elder Stories */}
        {!tag && elderStories && elderStories.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Voices of Our Elders</h2>
                <p className="text-lg text-gray-600 mt-2">Wisdom, knowledge, and guidance from community elders</p>
              </div>
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
        {!tag && recentStories && recentStories.length > 0 && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Recent Stories</h2>
              <p className="text-lg text-gray-600">Latest voices from our community</p>
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
        {!tag && (!recentStories || recentStories.length === 0) && (!featuredStories || featuredStories.length === 0) && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-2xl text-gray-600 mb-4">No stories available yet.</p>
            <Link
              href="/share-voice"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all"
            >
              <Plus className="w-5 h-5" />
              Be the First to Share
            </Link>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Story Matters</h2>
          <p className="text-xl mb-8 text-gray-300">
            Whether it's a moment of pride, a lesson learned, or a vision for the future—
            your voice strengthens our community.
          </p>
          <Link
            href="/share-voice"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all"
          >
            <Plus className="w-5 h-5" />
            Share Your Story Now
          </Link>
        </div>
      </section>
    </div>
  );
}
