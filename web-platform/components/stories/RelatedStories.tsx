import Link from 'next/link';
import type { Story } from '@/lib/stories/types';

interface RelatedStoriesProps {
  stories: Story[];
  title?: string;
  layout?: 'sidebar' | 'grid';
  className?: string;
}

export default function RelatedStories({
  stories,
  title = 'Related Stories',
  layout = 'sidebar',
  className = '',
}: RelatedStoriesProps) {
  if (!stories || stories.length === 0) {
    return null;
  }

  if (layout === 'grid') {
    return (
      <div className={`${className}`}>
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} variant="grid" />
          ))}
        </div>
      </div>
    );
  }

  // Sidebar layout
  return (
    <div className={`${className}`}>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="space-y-4">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} variant="sidebar" />
        ))}
      </div>
    </div>
  );
}

interface StoryCardProps {
  story: Story;
  variant: 'sidebar' | 'grid';
}

function StoryCard({ story, variant }: StoryCardProps) {
  const featuredImage = story.story_media?.[0]?.url || story.featured_image_url;

  if (variant === 'grid') {
    return (
      <Link
        href={`/stories/${story.id}`}
        className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
      >
        {featuredImage && (
          <div className="aspect-video overflow-hidden bg-gray-200">
            <img
              src={featuredImage}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4">
          {story.story_type && (
            <span className="inline-block px-2 py-1 bg-picc-teal/10 text-picc-teal text-xs font-medium rounded mb-2">
              {story.story_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-picc-teal transition-colors mb-2">
            {story.title}
          </h3>
          {story.excerpt && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{story.excerpt}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {story.storyteller?.is_elder && (
              <span className="text-purple-600 font-medium">Elder</span>
            )}
            <span>{story.storyteller?.preferred_name || story.storyteller?.full_name}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Sidebar variant - compact horizontal layout
  return (
    <Link
      href={`/stories/${story.id}`}
      className="group flex gap-3 hover:bg-gray-50 rounded-lg p-3 -mx-3 transition-colors"
    >
      {featuredImage && (
        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
          <img
            src={featuredImage}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {story.storyteller?.is_elder && (
          <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded mb-1">
            Elder
          </span>
        )}
        <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-picc-teal transition-colors mb-1">
          {story.title}
        </h4>
        <p className="text-xs text-gray-500 line-clamp-1">
          {story.storyteller?.preferred_name || story.storyteller?.full_name}
        </p>
        {story.contains_traditional_knowledge && (
          <div className="mt-1">
            <span className="text-xs text-purple-600">🛡️ Traditional Knowledge</span>
          </div>
        )}
      </div>
    </Link>
  );
}
