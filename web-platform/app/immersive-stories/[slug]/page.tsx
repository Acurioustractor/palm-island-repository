import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/client';
import {
  StoryContainer,
  HeroSection,
  TextSection,
  QuoteSection,
  SideBySideSection,
  VideoSection,
  FullBleedImage,
  ImageGallery,
  TimelineSection,
  ParallaxSection,
} from '@/components/story-scroll';
import { ArrowLeft } from 'lucide-react';

interface StoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: StoryPageProps) {
  const supabase = createServerSupabase();

  const { data: story } = await supabase
    .from('immersive_stories')
    .select('title, subtitle')
    .eq('slug', params.slug)
    .single();

  return {
    title: story?.title || 'Story',
    description: story?.subtitle || 'An immersive storytelling experience',
  };
}

export default async function DynamicStoryPage({ params }: StoryPageProps) {
  const supabase = createServerSupabase();

  // Load story
  const { data: story, error } = await supabase
    .from('immersive_stories')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !story) {
    notFound();
  }

  // Load sections
  const { data: sections } = await supabase
    .from('story_sections')
    .select('*')
    .eq('story_id', story.id)
    .order('section_order');

  // Load all timeline events and gallery images
  const sectionsWithData = await Promise.all(
    (sections || []).map(async (section: any) => {
      let additionalData = {};

      // Load timeline events
      if (section.section_type === 'timeline') {
        const { data: events } = await supabase
          .from('story_timeline_events')
          .select('*')
          .eq('section_id', section.id)
          .order('event_order');

        additionalData = { events: events || [] };
      }

      // Load gallery images
      if (section.section_type === 'gallery') {
        const { data: images } = await supabase
          .from('story_gallery_images')
          .select('*')
          .eq('section_id', section.id)
          .order('image_order');

        additionalData = { images: images || [] };
      }

      return {
        ...section,
        ...additionalData,
      };
    })
  );

  // Get project slug for back button
  const { data: project } = await supabase
    .from('projects')
    .select('slug')
    .eq('id', story.project_id)
    .single();

  return (
    <StoryContainer>
      {/* Back button */}
      {project && (
        <div className="fixed top-8 left-8 z-50">
          <Link
            href={`/picc/projects/${project.slug}`}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all text-gray-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Project</span>
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection
        title={story.title}
        subtitle={story.subtitle || ''}
        backgroundImage={story.hero_media_type === 'image' ? story.hero_media_url : undefined}
        backgroundVideo={story.hero_media_type === 'video' ? story.hero_media_url : undefined}
        height="screen"
        overlay="gradient"
        textPosition="center"
      />

      {/* Dynamic Sections */}
      {sectionsWithData.map((section: any, index: number) => {
        switch (section.section_type) {
          case 'text':
            return (
              <TextSection
                key={section.id}
                title={section.title || undefined}
                content={
                  <div className="whitespace-pre-line">
                    {section.content}
                  </div>
                }
                backgroundColor="bg-white"
                maxWidth="medium"
              />
            );

          case 'quote':
            return (
              <QuoteSection
                key={section.id}
                quote={section.content || ''}
                author={section.quote_author || undefined}
                role={section.quote_role || undefined}
                size="large"
              />
            );

          case 'sidebyside':
            return (
              <SideBySideSection
                key={section.id}
                title={section.title || undefined}
                mediaUrl={section.media_url || ''}
                mediaType={section.media_type || 'image'}
                mediaPosition={section.media_position || 'right'}
                backgroundColor={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                content={
                  <div className="whitespace-pre-line">
                    {section.content}
                  </div>
                }
              />
            );

          case 'video':
            return (
              <VideoSection
                key={section.id}
                videoUrl={section.media_url || ''}
                title={section.title || undefined}
                caption={section.media_caption || undefined}
                aspectRatio="16/9"
                controls={true}
                backgroundColor="bg-gray-900"
              />
            );

          case 'fullbleed':
            return (
              <FullBleedImage
                key={section.id}
                imageUrl={section.media_url || ''}
                alt={section.media_alt || section.title || 'Story image'}
                caption={section.media_caption || undefined}
                height="tall"
                parallax={true}
              />
            );

          case 'gallery':
            const galleryImages = section.images?.map((img: any) => ({
              url: img.image_url,
              alt: img.image_alt,
              caption: img.image_caption,
            })) || [];

            return (
              <ImageGallery
                key={section.id}
                title={section.title || undefined}
                images={galleryImages}
                columns={3}
                backgroundColor="bg-gray-50"
              />
            );

          case 'timeline':
            const timelineEvents = section.events?.map((event: any) => ({
              date: event.event_date,
              title: event.event_title,
              description: event.event_description,
              isComplete: event.is_complete,
            })) || [];

            return (
              <TimelineSection
                key={section.id}
                title={section.title || undefined}
                events={timelineEvents}
                backgroundColor="bg-white"
              />
            );

          case 'parallax':
            return (
              <ParallaxSection
                key={section.id}
                backgroundImage={section.media_url || ''}
                speed={0.5}
                height="h-[60vh]"
              >
                <div className="text-center">
                  {section.title && (
                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
                      {section.title}
                    </h2>
                  )}
                  {section.content && (
                    <p className="text-2xl text-white/90">
                      {section.content}
                    </p>
                  )}
                </div>
              </ParallaxSection>
            );

          default:
            return null;
        }
      })}

      {/* Footer */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <p className="text-gray-400 mb-4">
            Story created with the Palm Island Community Knowledge Infrastructure
          </p>
          <p className="text-gray-500 text-sm">
            All content shared with permission and cultural protocols observed.
          </p>
        </div>
      </div>
    </StoryContainer>
  );
}
