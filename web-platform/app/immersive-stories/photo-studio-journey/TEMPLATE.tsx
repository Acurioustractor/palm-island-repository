/**
 * PHOTO STUDIO STORY - TEMPLATE
 *
 * Copy this file, rename it to page.tsx, and fill in your content.
 * Delete sections you don't need, reorder as you like.
 *
 * STEPS:
 * 1. Upload your photos/videos to: public/stories/photo-studio/
 * 2. Fill in all [YOUR_*] placeholders below
 * 3. Replace example text with your story
 * 4. Update timeline events, gallery images, quotes
 * 5. Save and view at: http://localhost:3000/stories/photo-studio-journey
 */

import {
  StoryContainer,
  HeroSection,
  TextSection,
  SideBySideSection,
  QuoteSection,
  ParallaxSection,
  TimelineSection,
  VideoSection,
  FullBleedImage,
  ImageGallery,
} from '@/components/story-scroll';
import Link from 'next/link';
import { ArrowLeft, Camera } from 'lucide-react';

export const metadata = {
  title: '[YOUR_PAGE_TITLE] - Palm Island Photo Studio',
  description: '[YOUR_PAGE_DESCRIPTION]',
};

export default function PhotoStudioStoryPage() {
  // ============================================================
  // TIMELINE EVENTS - Fill in your real events
  // ============================================================
  const timelineEvents = [
    {
      date: '[Month Year]',
      title: '[Event Title]',
      description: '[What happened and why it matters - 1-2 sentences]',
      isComplete: true,
    },
    {
      date: '[Month Year]',
      title: '[Event Title]',
      description: '[What happened and why it matters]',
      isComplete: true,
    },
    {
      date: '[Month Year]',
      title: '[Event Title]',
      description: '[What happened and why it matters]',
      isComplete: true,
    },
    // Add more events...
  ];

  // ============================================================
  // GALLERY IMAGES - Fill in your real photos
  // ============================================================
  const galleryImages = [
    {
      url: '/stories/photo-studio/gallery/[your-photo-1].jpg',
      alt: '[Describe the photo]',
      caption: '[Caption that shows on hover]',
    },
    {
      url: '/stories/photo-studio/gallery/[your-photo-2].jpg',
      alt: '[Describe the photo]',
      caption: '[Caption that shows on hover]',
    },
    {
      url: '/stories/photo-studio/gallery/[your-photo-3].jpg',
      alt: '[Describe the photo]',
      caption: '[Caption that shows on hover]',
    },
    // Add more images...
  ];

  return (
    <StoryContainer>
      {/* ============================================================
          BACK BUTTON - Leave this as is
          ============================================================ */}
      <div className="fixed top-8 left-8 z-50">
        <Link
          href="/picc/projects/photo-studio"
          className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all text-gray-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project</span>
        </Link>
      </div>

      {/* ============================================================
          1. HERO SECTION
          ============================================================ */}
      <HeroSection
        title="[YOUR_MAIN_TITLE]"
        subtitle="[Your subtitle - one powerful sentence]"

        // Choose ONE:
        backgroundVideo="/stories/photo-studio/[your-hero-video].mp4"
        // OR
        // backgroundImage="/stories/photo-studio/[your-hero-image].jpg"

        height="screen"
        overlay="gradient"
        textPosition="center"
      />

      {/* ============================================================
          2. OPENING TEXT
          ============================================================ */}
      <TextSection
        title="[Section Title]"
        content={
          <>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              [Your opening paragraph - make it powerful. Why does this story matter?]
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              [Second paragraph - provide context]
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              [Third paragraph - set up what comes next]
            </p>
          </>
        }
        backgroundColor="bg-white"
        maxWidth="medium"
      />

      {/* ============================================================
          3. FIRST QUOTE
          ============================================================ */}
      <QuoteSection
        quote="[The exact quote from community member in their words]"
        author="[Full Name]"
        role="[Their role or title]"
        size="large"
      />

      {/* ============================================================
          4. PARALLAX BREAK
          ============================================================ */}
      <ParallaxSection
        backgroundImage="/stories/photo-studio/[your-landscape-photo].jpg"
        speed={0.5}
        height="h-[60vh]"
      >
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            [Your Text Here]
          </h2>
          <p className="text-2xl text-white/90">
            [Optional subtitle]
          </p>
        </div>
      </ParallaxSection>

      {/* ============================================================
          5. SIDE BY SIDE #1
          ============================================================ */}
      <SideBySideSection
        title="[Section Title]"
        mediaUrl="/stories/photo-studio/[your-image].jpg"
        mediaType="image"          // or "video"
        mediaPosition="right"      // or "left"
        backgroundColor="bg-gray-50"
        content={
          <>
            <p className="mb-4">
              [First paragraph of your story]
            </p>
            <p className="mb-4">
              [Second paragraph]
            </p>
            <p>
              [Third paragraph]
            </p>
          </>
        }
      />

      {/* ============================================================
          6. VIDEO SECTION
          ============================================================ */}
      <VideoSection
        videoUrl="/stories/photo-studio/[your-video].mp4"
        title="[Video Title]"
        caption="[What viewers are about to watch]"
        aspectRatio="16/9"
        controls={true}
        backgroundColor="bg-gray-900"
      />

      {/* ============================================================
          7. TIMELINE
          ============================================================ */}
      <TimelineSection
        title="[Timeline Title]"
        events={timelineEvents}
        backgroundColor="bg-white"
      />

      {/* ============================================================
          8. FULL BLEED IMAGE
          ============================================================ */}
      <FullBleedImage
        imageUrl="/stories/photo-studio/[your-powerful-image].jpg"
        alt="[Describe the image]"
        caption="[Caption that appears at bottom of image]"
        height="tall"
        parallax={true}
      />

      {/* ============================================================
          9. SIDE BY SIDE #2
          ============================================================ */}
      <SideBySideSection
        title="[Another Section Title]"
        mediaUrl="/stories/photo-studio/[another-image].jpg"
        mediaType="image"
        mediaPosition="left"       // Alternate side for variety
        backgroundColor="bg-white"
        content={
          <>
            <p className="mb-4">
              [Continue your story]
            </p>
            <p className="mb-4">
              [More details]
            </p>
            <p>
              [Impact or outcome]
            </p>
          </>
        }
      />

      {/* ============================================================
          10. SECOND QUOTE
          ============================================================ */}
      <QuoteSection
        quote="[Another powerful quote from different person]"
        author="[Full Name]"
        role="[Their role]"
        backgroundColor="bg-gradient-to-br from-purple-50 to-pink-50"
        size="medium"
      />

      {/* ============================================================
          11. IMAGE GALLERY
          ============================================================ */}
      <ImageGallery
        title="[Gallery Title]"
        images={galleryImages}
        columns={3}
        backgroundColor="bg-gray-50"
      />

      {/* ============================================================
          12. CLOSING TEXT
          ============================================================ */}
      <TextSection
        title="[Looking Forward / The Future / What's Next]"
        subtitle="[Optional subtitle]"
        content={
          <>
            <p className="text-lg mb-4">
              [What's happening next with the project]
            </p>
            <p className="text-lg mb-4">
              [Impact so far or goals for future]
            </p>
            <p className="text-lg font-semibold text-gray-900">
              [Powerful closing statement]
            </p>
          </>
        }
        backgroundColor="bg-white"
        maxWidth="medium"
      />

      {/* ============================================================
          13. FINAL PARALLAX
          ============================================================ */}
      <ParallaxSection
        backgroundImage="/stories/photo-studio/[closing-image].jpg"
        speed={0.3}
        height="h-screen"
      >
        <div className="text-center">
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
            [Powerful]
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-8">
            [Closing]
          </h3>
          <h3 className="text-4xl md:text-5xl font-bold text-white">
            [Words]
          </h3>

          <div className="mt-12">
            <Link
              href="/picc/projects/photo-studio"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-bold text-lg rounded-full shadow-2xl transition-all"
            >
              <span>Visit the Project Page</span>
              <Camera className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </ParallaxSection>

      {/* ============================================================
          FOOTER NOTE
          ============================================================ */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <p className="text-gray-400 mb-4">
            [Credit line - who funded, who created, etc.]
          </p>
          <p className="text-gray-500 text-sm">
            [Permissions note - e.g., "All photographs used with permission..."]
          </p>
        </div>
      </div>
    </StoryContainer>
  );
}

/* ============================================================
   OPTIONAL SECTIONS - Copy and paste as needed
   ============================================================

// SIMPLE TEXT PARAGRAPH (no title)
<TextSection
  content={
    <p className="text-lg text-gray-700">
      [Your paragraph here]
    </p>
  }
  backgroundColor="bg-white"
  maxWidth="medium"
/>

// SIDE BY SIDE WITH VIDEO
<SideBySideSection
  title="[Title]"
  mediaUrl="/stories/photo-studio/[video].mp4"
  mediaType="video"
  mediaPosition="right"
  content={<p>[Your text]</p>}
/>

// SHORT PARALLAX SECTION
<ParallaxSection
  backgroundImage="/stories/photo-studio/[image].jpg"
  speed={0.5}
  height="h-[50vh]"
/>

// SMALL QUOTE
<QuoteSection
  quote="[Shorter quote]"
  author="[Name]"
  size="small"
/>

============================================================ */
