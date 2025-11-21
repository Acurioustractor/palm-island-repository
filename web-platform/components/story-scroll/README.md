# Story Scrolling Components

Immersive storytelling components inspired by ABC Australia's award-winning multimedia journalism. Built with React, Next.js, and Framer Motion.

## Overview

These components enable you to create interactive, scroll-driven stories with:
- Parallax effects
- Scroll-triggered animations
- Full-screen hero sections
- Video and image integration
- Timeline visualizations
- Responsive design

## Components

### `<StoryContainer>`
Wrapper for all story pages. Provides consistent styling and overflow handling.

```tsx
<StoryContainer>
  {/* Your story sections */}
</StoryContainer>
```

### `<HeroSection>`
Full-screen hero with background image/video and parallax scroll effects.

```tsx
<HeroSection
  title="Palm Island Photo Studio"
  subtitle="Capturing our stories, on our terms"
  backgroundImage="/images/photo-studio-hero.jpg"
  height="screen"
  overlay="dark"
  textPosition="center"
/>
```

**Props:**
- `title` (string): Main headline
- `subtitle` (string, optional): Subheading
- `backgroundImage` (string, optional): Image URL
- `backgroundVideo` (string, optional): Video URL
- `height` ('screen' | 'tall' | 'medium'): Section height
- `overlay` ('dark' | 'light' | 'gradient' | 'none'): Overlay style
- `textPosition` ('center' | 'bottom' | 'top'): Text alignment

### `<ScrollReveal>`
Fade-in animation as content scrolls into view.

```tsx
<ScrollReveal direction="up" delay={0.2}>
  <p>This text will fade in from below</p>
</ScrollReveal>
```

**Props:**
- `direction` ('up' | 'down' | 'left' | 'right' | 'none'): Animation direction
- `delay` (number): Delay in seconds
- `duration` (number): Animation duration
- `once` (boolean): Animate only once (default: true)

### `<ParallaxSection>`
Section with parallax background image effect.

```tsx
<ParallaxSection
  backgroundImage="/images/studio-interior.jpg"
  speed={0.5}
  height="h-[70vh]"
>
  <h2 className="text-5xl font-bold text-white">
    Professional equipment, on Country
  </h2>
</ParallaxSection>
```

**Props:**
- `backgroundImage` (string): Background image URL
- `speed` (number): Parallax speed (0.5 = slow, 2 = fast)
- `height` (string): Section height class
- `overlay` (boolean): Show overlay (default: true)
- `overlayColor` (string): Overlay color class

### `<SideBySideSection>`
Media on one side, text on the other.

```tsx
<SideBySideSection
  title="Community-Led Photography"
  mediaUrl="/images/photo-session.jpg"
  mediaType="image"
  mediaPosition="right"
  content={
    <>
      <p>Professional photography equipment...</p>
      <p>Community members lead every session...</p>
    </>
  }
/>
```

**Props:**
- `title` (string, optional): Section title
- `content` (ReactNode): Text content
- `mediaUrl` (string): Image or video URL
- `mediaType` ('image' | 'video'): Media type
- `mediaPosition` ('left' | 'right'): Media placement
- `backgroundColor` (string): Background color class

### `<QuoteSection>`
Large pull quote section.

```tsx
<QuoteSection
  quote="This studio belongs to us. We tell our own stories now."
  author="Elder Mary Johnson"
  role="Community Storyteller"
  size="large"
/>
```

**Props:**
- `quote` (string): Quote text
- `author` (string, optional): Person quoted
- `role` (string, optional): Their role/title
- `size` ('large' | 'medium' | 'small'): Text size
- `backgroundColor` (string): Background color class

### `<FullBleedImage>`
Full-width image with parallax effect.

```tsx
<FullBleedImage
  imageUrl="/images/landscape.jpg"
  alt="Palm Island landscape"
  caption="Traditional lands at sunset"
  height="tall"
  parallax={true}
/>
```

**Props:**
- `imageUrl` (string): Image URL
- `alt` (string): Alt text
- `caption` (string, optional): Image caption
- `height` ('short' | 'medium' | 'tall'): Image height
- `parallax` (boolean): Enable parallax (default: true)

### `<VideoSection>`
Embedded video with title and caption.

```tsx
<VideoSection
  videoUrl="/videos/studio-tour.mp4"
  title="Studio Tour"
  caption="Community members showcase the new facilities"
  aspectRatio="16/9"
  controls={true}
/>
```

**Props:**
- `videoUrl` (string): Video URL
- `title` (string, optional): Section title
- `caption` (string, optional): Video caption
- `aspectRatio` ('16/9' | '4/3' | '1/1' | '21/9'): Video aspect ratio
- `controls` (boolean): Show controls (default: true)
- `autoplay` (boolean): Autoplay video (default: false)

### `<TextSection>`
Longform text content with optional title.

```tsx
<TextSection
  title="The Journey"
  subtitle="How we built the studio"
  content={
    <>
      <p>In 2023, community members identified...</p>
      <p>Through collaboration with...</p>
    </>
  }
  maxWidth="medium"
  textAlign="left"
/>
```

**Props:**
- `title` (string, optional): Section title
- `subtitle` (string, optional): Section subtitle
- `content` (ReactNode): Main content
- `maxWidth` ('narrow' | 'medium' | 'wide'): Content width
- `textAlign` ('left' | 'center'): Text alignment

### `<TimelineSection>`
Visual timeline with events.

```tsx
<TimelineSection
  title="Our Journey"
  events={[
    {
      date: 'January 2023',
      title: 'Community Consultation',
      description: 'First meetings with elders...',
      isComplete: true
    },
    {
      date: 'March 2023',
      title: 'Equipment Arrives',
      description: 'Professional cameras and lighting...',
      isComplete: true
    }
  ]}
/>
```

**Props:**
- `title` (string, optional): Timeline title
- `events` (TimelineEvent[]): Array of events
  - `date` (string): Event date
  - `title` (string): Event title
  - `description` (string): Event description
  - `icon` (ReactNode, optional): Custom icon
  - `isComplete` (boolean): Event completed

### `<ImageGallery>`
Grid of images with captions.

```tsx
<ImageGallery
  title="Community Portraits"
  columns={3}
  images={[
    {
      url: '/images/portrait-1.jpg',
      alt: 'Community member portrait',
      caption: 'Elder Mary with her grandchildren'
    },
    // ... more images
  ]}
/>
```

**Props:**
- `title` (string, optional): Gallery title
- `images` (GalleryImage[]): Array of images
  - `url` (string): Image URL
  - `alt` (string): Alt text
  - `caption` (string, optional): Image caption
- `columns` (2 | 3 | 4): Number of columns

## Example Story Page

```tsx
import {
  StoryContainer,
  HeroSection,
  TextSection,
  SideBySideSection,
  QuoteSection,
  TimelineSection,
  ImageGallery
} from '@/components/story-scroll';

export default function PhotoStudioStory() {
  return (
    <StoryContainer>
      <HeroSection
        title="Palm Island Photo Studio"
        subtitle="Our stories, our lens, our voice"
        backgroundImage="/images/hero.jpg"
      />

      <TextSection
        title="A New Chapter"
        content={<p>Story content here...</p>}
      />

      <SideBySideSection
        title="Community Led"
        mediaUrl="/images/session.jpg"
        mediaType="image"
        content={<p>Details here...</p>}
      />

      <QuoteSection
        quote="This changes everything for our community"
        author="Elder Mary Johnson"
      />

      <TimelineSection
        title="The Journey"
        events={[...]}
      />

      <ImageGallery
        title="Our First Sessions"
        images={[...]}
      />
    </StoryContainer>
  );
}
```

## Technical Details

- **Framer Motion**: Powers all scroll animations
- **IntersectionObserver**: Efficient viewport detection
- **Next.js Image**: Optimized image loading
- **Responsive**: Mobile-first design
- **Performance**: Lazy loading and optimized animations

## Inspiration

These components are inspired by:
- ABC Australia's "Razed" (2024 Media Prize Winner)
- Modern scrollytelling journalism
- Parallax storytelling techniques
- Immersive multimedia experiences
