# Photo Studio Immersive Story - Content Guide

## Quick Start Overview

Your immersive story page is made up of **sections** that you stack vertically. As users scroll, they'll experience:
- Full-screen hero with video/image
- Text narratives
- Photos and videos
- Community quotes
- Timeline of events
- Image galleries
- Parallax effects

## 📁 Step 1: Organize Your Content

### Create a Content Folder Structure

```
/public/stories/photo-studio/
├── hero-video.mp4              (or hero-image.jpg)
├── photos/
│   ├── 01-community-meeting.jpg
│   ├── 02-equipment-arrives.jpg
│   ├── 03-first-session.jpg
│   ├── 04-elder-portrait.jpg
│   ├── 05-youth-training.jpg
│   └── 06-exhibition.jpg
├── videos/
│   ├── studio-tour.mp4
│   ├── elder-interview.mp4
│   └── training-session.mp4
└── gallery/
    ├── portrait-1.jpg
    ├── portrait-2.jpg
    ├── portrait-3.jpg
    ├── portrait-4.jpg
    ├── portrait-5.jpg
    └── portrait-6.jpg
```

**Action:** Upload all your photos and videos to these folders in the `public` directory.

---

## 📝 Step 2: Prepare Your Story Content

### Content Checklist

Before you start building, gather this information:

#### Hero Section
- [ ] Main title (short, powerful)
- [ ] Subtitle (one sentence)
- [ ] Hero video OR hero image

#### Opening Narrative
- [ ] Opening paragraph (why this matters)
- [ ] 2-3 paragraphs of context

#### Quotes (2-4 quotes from community)
- [ ] Quote text
- [ ] Person's name
- [ ] Their role/title

#### Timeline Events (4-8 major milestones)
- [ ] Date
- [ ] Title
- [ ] Description
- [ ] Is it complete?

#### Gallery Images (6-12 photos)
- [ ] Image files
- [ ] Captions for each

#### Videos (1-3 key videos)
- [ ] Video files
- [ ] Titles
- [ ] Captions

---

## 🏗️ Step 3: Build Your Page (Section by Section)

### Template Structure

Here's the page structure with placeholders for YOUR content:

```typescript
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

export default function PhotoStudioStory() {
  return (
    <StoryContainer>
      {/* 1. HERO */}
      {/* 2. OPENING TEXT */}
      {/* 3. FIRST QUOTE */}
      {/* 4. PARALLAX BREAK */}
      {/* 5. SIDE BY SIDE #1 */}
      {/* 6. VIDEO */}
      {/* 7. TIMELINE */}
      {/* 8. FULL BLEED IMAGE */}
      {/* 9. SIDE BY SIDE #2 */}
      {/* 10. SECOND QUOTE */}
      {/* 11. GALLERY */}
      {/* 12. CLOSING TEXT */}
      {/* 13. FINAL PARALLAX */}
    </StoryContainer>
  );
}
```

---

## 📋 Section Templates (Copy & Customize)

### 1. HERO SECTION

**When to use:** Always first! Full-screen opening with impact.

**Your checklist:**
- [ ] Decide: Video or Image?
- [ ] Upload hero media to `/public/stories/photo-studio/`
- [ ] Write powerful title (3-7 words)
- [ ] Write subtitle (one sentence)

**Template:**
```typescript
<HeroSection
  title="YOUR TITLE HERE"
  subtitle="Your subtitle here"

  // Option A: Use a video background
  backgroundVideo="/stories/photo-studio/hero-video.mp4"

  // Option B: Use an image background
  // backgroundImage="/stories/photo-studio/hero-image.jpg"

  height="screen"              // Options: "screen", "tall", "medium"
  overlay="dark"               // Options: "dark", "light", "gradient", "none"
  textPosition="center"        // Options: "center", "bottom", "top"
/>
```

**Example:**
```typescript
<HeroSection
  title="Our Stories, Our Camera"
  subtitle="How Palm Island took control of visual storytelling"
  backgroundVideo="/stories/photo-studio/hero-drone.mp4"
  height="screen"
  overlay="gradient"
  textPosition="center"
/>
```

---

### 2. OPENING TEXT SECTION

**When to use:** Right after hero. Sets the stage, explains why this matters.

**Your checklist:**
- [ ] Write opening hook (why should people care?)
- [ ] Provide context (what was the problem?)
- [ ] Set up the story (what changed?)

**Template:**
```typescript
<TextSection
  title="Optional Section Title"
  content={
    <>
      <p className="text-xl text-gray-700 leading-relaxed mb-6">
        Your opening paragraph goes here. Make it powerful.
        This is your hook - why does this story matter?
      </p>
      <p className="text-lg text-gray-600 leading-relaxed mb-6">
        Second paragraph provides more context...
      </p>
      <p className="text-lg text-gray-600 leading-relaxed">
        Third paragraph sets up what comes next...
      </p>
    </>
  }
  backgroundColor="bg-white"
  maxWidth="medium"              // Options: "narrow", "medium", "wide"
/>
```

**Example:**
```typescript
<TextSection
  title="Why a Photo Studio Matters"
  content={
    <>
      <p className="text-xl text-gray-700 leading-relaxed mb-6">
        For generations, our community has been photographed by outsiders.
        News crews arrive, take photos, and leave. We rarely see ourselves
        represented accurately.
      </p>
      <p className="text-lg text-gray-600 leading-relaxed">
        The Palm Island Photo Studio changes that. Professional equipment,
        trained community photographers, and full control over our image.
      </p>
    </>
  }
/>
```

---

### 3. QUOTE SECTION

**When to use:** After establishing context. Use powerful community voices.

**Your checklist:**
- [ ] Choose impactful quote from elder or community member
- [ ] Get their full name
- [ ] Note their role/title

**Template:**
```typescript
<QuoteSection
  quote="The exact quote goes here in their words"
  author="Person's Full Name"
  role="Their role or title"
  size="large"                   // Options: "large", "medium", "small"
  backgroundColor="bg-gradient-to-br from-blue-50 to-purple-50"
/>
```

**Example:**
```typescript
<QuoteSection
  quote="My grandmother never had a professional photo. Now my grandchildren have hundreds, all taken with respect."
  author="Mary Johnson"
  role="Elder & Community Storyteller"
  size="large"
/>
```

---

### 4. PARALLAX SECTION

**When to use:** Visual break between sections. Shows a powerful image with text overlay.

**Your checklist:**
- [ ] Choose stunning landscape or wide shot
- [ ] Write short impactful text (2-5 words usually)

**Template:**
```typescript
<ParallaxSection
  backgroundImage="/stories/photo-studio/landscape.jpg"
  speed={0.5}                    // Lower = slower parallax (0.3-1.0)
  height="h-[60vh]"              // Options: "h-[50vh]", "h-[60vh]", "h-[70vh]", "h-screen"
>
  <div className="text-center">
    <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
      Your Text Here
    </h2>
    <p className="text-2xl text-white/90">
      Optional subtitle
    </p>
  </div>
</ParallaxSection>
```

**Example:**
```typescript
<ParallaxSection
  backgroundImage="/stories/photo-studio/palm-island-sunset.jpg"
  speed={0.5}
  height="h-[60vh]"
>
  <div className="text-center">
    <h2 className="text-5xl md:text-6xl font-bold text-white">
      Our Land, Our Lens
    </h2>
  </div>
</ParallaxSection>
```

---

### 5. SIDE BY SIDE SECTION

**When to use:** When you have a photo/video AND text that go together.

**Your checklist:**
- [ ] Choose photo or video
- [ ] Write 2-4 paragraphs
- [ ] Decide: media left or right?

**Template:**
```typescript
<SideBySideSection
  title="Section Title"
  mediaUrl="/stories/photo-studio/your-image.jpg"
  mediaType="image"              // Options: "image", "video"
  mediaPosition="right"          // Options: "left", "right"
  backgroundColor="bg-gray-50"   // Options: "bg-white", "bg-gray-50"
  content={
    <>
      <p className="mb-4">
        First paragraph...
      </p>
      <p className="mb-4">
        Second paragraph...
      </p>
      <p>
        Third paragraph...
      </p>
    </>
  }
/>
```

**Example:**
```typescript
<SideBySideSection
  title="Professional Equipment Arrives"
  mediaUrl="/stories/photo-studio/equipment-delivery.jpg"
  mediaType="image"
  mediaPosition="right"
  content={
    <>
      <p className="mb-4">
        In June 2023, two pallets of professional photography equipment
        arrived by barge. The community gathered to watch cameras, lights,
        and backdrops being unloaded.
      </p>
      <p>
        Over $120,000 worth of gear, all owned by the community, operated
        by trained locals.
      </p>
    </>
  }
/>
```

---

### 6. VIDEO SECTION

**When to use:** When you have a key video that needs focus (interview, tour, etc.)

**Your checklist:**
- [ ] Choose your best video
- [ ] Write title
- [ ] Write caption

**Template:**
```typescript
<VideoSection
  videoUrl="/stories/photo-studio/your-video.mp4"
  title="Video Title"
  caption="What viewers are about to watch"
  aspectRatio="16/9"             // Options: "16/9", "4/3", "1/1", "21/9"
  controls={true}                // Show video controls
  autoplay={false}               // Don't autoplay (recommended)
  backgroundColor="bg-gray-900"
/>
```

**Example:**
```typescript
<VideoSection
  videoUrl="/stories/photo-studio/elder-interview.mp4"
  title="Elder Mary Shares Her Story"
  caption="Mary Johnson reflects on seeing three generations photographed together for the first time"
  aspectRatio="16/9"
  controls={true}
/>
```

---

### 7. TIMELINE SECTION

**When to use:** Show journey/milestones chronologically.

**Your checklist:**
- [ ] List 4-8 major events
- [ ] Get dates
- [ ] Write descriptions (1-2 sentences each)

**Template:**
```typescript
const timelineEvents = [
  {
    date: 'Month Year',
    title: 'Event Title',
    description: 'What happened and why it matters',
    isComplete: true,            // true = checkmark, false = calendar icon
  },
  // Add more events...
];

<TimelineSection
  title="Our Journey"
  events={timelineEvents}
  backgroundColor="bg-gray-50"
/>
```

**Example:**
```typescript
const timelineEvents = [
  {
    date: 'January 2023',
    title: 'Community Consultation',
    description: 'Elders and community members meet to discuss the vision for an on-Country photography studio.',
    isComplete: true,
  },
  {
    date: 'June 2023',
    title: 'Equipment Arrives',
    description: 'Professional cameras and lighting delivered. Training begins immediately.',
    isComplete: true,
  },
  {
    date: 'September 2023',
    title: 'First Sessions',
    description: 'Over 50 families photographed in the first month.',
    isComplete: true,
  },
];

<TimelineSection
  title="From Vision to Reality"
  events={timelineEvents}
/>
```

---

### 8. FULL BLEED IMAGE

**When to use:** One powerful photo that needs full width impact.

**Your checklist:**
- [ ] Choose your most impactful photo
- [ ] Write caption (optional)

**Template:**
```typescript
<FullBleedImage
  imageUrl="/stories/photo-studio/your-image.jpg"
  alt="Describe the image"
  caption="Optional caption appears at bottom"
  height="tall"                  // Options: "short", "medium", "tall"
  parallax={true}                // Enable parallax effect
/>
```

**Example:**
```typescript
<FullBleedImage
  imageUrl="/stories/photo-studio/first-portrait-session.jpg"
  alt="Elder Mary with her grandchildren during first portrait session"
  caption="Three generations photographed together for the first time - Mary Johnson (72), her daughter Sarah (45), and grandchildren"
  height="tall"
  parallax={true}
/>
```

---

### 9. IMAGE GALLERY

**When to use:** Show multiple photos together (portraits, events, etc.)

**Your checklist:**
- [ ] Select 6-12 best photos
- [ ] Write captions for each
- [ ] Organize in logical order

**Template:**
```typescript
const galleryImages = [
  {
    url: '/stories/photo-studio/photo1.jpg',
    alt: 'Describe photo',
    caption: 'Optional caption on hover',
  },
  {
    url: '/stories/photo-studio/photo2.jpg',
    alt: 'Describe photo',
    caption: 'Optional caption',
  },
  // Add more images...
];

<ImageGallery
  title="Gallery Title"
  images={galleryImages}
  columns={3}                    // Options: 2, 3, 4
  backgroundColor="bg-gray-50"
/>
```

**Example:**
```typescript
const galleryImages = [
  {
    url: '/stories/photo-studio/gallery/portrait-1.jpg',
    alt: 'Family portrait',
    caption: 'The Williams family - first professional portrait',
  },
  {
    url: '/stories/photo-studio/gallery/portrait-2.jpg',
    alt: 'Youth photographer',
    caption: 'Training session - learning composition',
  },
  {
    url: '/stories/photo-studio/gallery/portrait-3.jpg',
    alt: 'Elder portrait',
    caption: 'Elder Thomas - dignity and respect',
  },
];

<ImageGallery
  title="Community Portraits"
  images={galleryImages}
  columns={3}
/>
```

---

## 🎯 Recommended Page Flow

Here's a proven structure that works well:

1. **Hero** - Grab attention
2. **Opening Text** - Set context
3. **Quote #1** - Community voice validates importance
4. **Parallax Break** - Visual impact
5. **Side by Side** - Tell part of the story with image
6. **Video** - Key interview or tour
7. **Timeline** - Show the journey
8. **Full Bleed Image** - Emotional impact
9. **Side by Side** - More story with different angle
10. **Quote #2** - Different community voice
11. **Gallery** - Show multiple examples
12. **Closing Text** - Future vision
13. **Final Parallax** - Powerful closing image

---

## ✅ Step 4: Put It All Together

### Your Action Plan

1. **Upload media:**
   ```bash
   # Create folders
   mkdir -p public/stories/photo-studio/photos
   mkdir -p public/stories/photo-studio/videos
   mkdir -p public/stories/photo-studio/gallery

   # Upload your files there
   ```

2. **Open the page file:**
   ```
   web-platform/app/stories/photo-studio-journey/page.tsx
   ```

3. **Replace placeholder content:**
   - Swap `/images/placeholder-*.jpg` with `/stories/photo-studio/your-file.jpg`
   - Replace example text with your real story
   - Update quotes with actual community voices
   - Fill in real timeline events
   - Add your gallery photos

4. **Test locally:**
   ```bash
   npm run dev
   # Visit: http://localhost:3000/stories/photo-studio-journey
   ```

5. **Iterate:**
   - View the page
   - Adjust text, swap photos
   - Reorder sections if needed
   - Fine-tune timing and effects

---

## 💡 Pro Tips

### Writing Tips
- **Keep paragraphs short** - 2-4 sentences max
- **Use active voice** - "We built" not "A studio was built"
- **Show, don't tell** - Use specific details and numbers
- **Lead with impact** - Start strong, don't bury the lede

### Photo Tips
- **High resolution** - At least 1920px wide for full-bleed images
- **Landscape orientation** - Works best for parallax sections
- **Portrait orientation** - Good for side-by-side sections
- **Consistent style** - Try to match color grading if possible

### Video Tips
- **Short clips** - 30-90 seconds ideal
- **Captions/subtitles** - Consider adding for accessibility
- **Compress videos** - Use H.264, keep file sizes reasonable
- **Test playback** - Ensure videos work on mobile

### Content Strategy
- **Community voices first** - Let people speak for themselves
- **Balance emotion and facts** - Numbers + human stories
- **Show progression** - Beginning → middle → end → future
- **End with hope** - Vision for what's next

---

## 🆘 Quick Reference

### All Available Components
```typescript
import {
  HeroSection,       // Full-screen opening
  TextSection,       // Paragraphs of text
  QuoteSection,      // Large pull quotes
  ParallaxSection,   // Parallax image with text
  SideBySideSection, // Image/video + text side by side
  VideoSection,      // Embedded video
  FullBleedImage,    // Full-width image
  TimelineSection,   // Timeline of events
  ImageGallery,      // Grid of images
  ScrollReveal,      // Wrap anything for fade-in
  StoryContainer,    // Page wrapper (always needed)
} from '@/components/story-scroll';
```

### File Paths
- **Public files:** `/public/stories/photo-studio/...`
- **Reference in code:** `/stories/photo-studio/...` (no public prefix)
- **Story page:** `web-platform/app/stories/photo-studio-journey/page.tsx`

### Common Patterns

**Two paragraphs:**
```typescript
<>
  <p className="mb-4">First paragraph...</p>
  <p>Second paragraph...</p>
</>
```

**Three images in gallery:**
```typescript
const images = [
  { url: '/stories/photo-studio/1.jpg', alt: 'Description', caption: 'Caption' },
  { url: '/stories/photo-studio/2.jpg', alt: 'Description', caption: 'Caption' },
  { url: '/stories/photo-studio/3.jpg', alt: 'Description', caption: 'Caption' },
];
```

**Timeline with 3 events:**
```typescript
const events = [
  { date: 'Jan 2023', title: 'Started', description: 'What happened', isComplete: true },
  { date: 'Jun 2023', title: 'Middle', description: 'What happened', isComplete: true },
  { date: 'Dec 2023', title: 'Latest', description: 'What happened', isComplete: true },
];
```

---

## 🎬 Ready to Build!

You now have everything you need. The process is:

1. ✅ Organize your photos/videos in folders
2. ✅ Fill out the content checklist
3. ✅ Copy section templates and customize
4. ✅ Stack sections in logical order
5. ✅ Replace placeholders with real content
6. ✅ Test and iterate

**Next:** I can help you with any specific section, or we can work through the page together step by step!

Let me know what you'd like to do first:
- Upload and organize media?
- Draft the content (text, quotes, timeline)?
- Start building section by section?
- Something else?
