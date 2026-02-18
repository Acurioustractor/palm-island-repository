# /media-studio — Media Placement, Video Editing & Analysis

## Purpose
Help place photos and videos across the PICC frontend site, replace images inline, add video embeds to pages, and prepare video files for overlays and analysis.

## Capabilities

### 1. Photo Replacement
When the user points to a photo on the site that needs replacing:
- Identify which component/page renders that image
- Search the media gallery (`/api/media/list`) for replacement candidates
- Show options from the media library with tags/descriptions
- Update the component to use the new image URL
- Verify the replacement renders correctly

### 2. Video Placement
When the user wants to add a video to a specific page section:
- Check `/api/external-videos` for available videos with thumbnails
- Use the `VideoEmbed` component (`components/report/VideoEmbed.tsx`) for external videos
- Support YouTube, Vimeo, Descript, Facebook, TikTok embeds
- Place videos with proper responsive sizing and thumbnail previews
- Tag videos with the page/section context for tracking

### 3. Video Overlay Planning
When the user wants video overlays on specific areas:
- Document which areas need video overlays (hero sections, service cards, etc.)
- Plan the overlay implementation (click-to-play, autoplay-muted, background video)
- Support Descript videos as primary source
- Handle thumbnail → play transition gracefully

### 4. Video File Processing
When the user provides video files for editing:
- Analyze video content and suggest placement
- Extract key frames for thumbnails
- Recommend encoding/hosting approach (Descript share link, direct upload, etc.)
- Tag with appropriate metadata (service, project, people, etc.)

## Workflow

### Photo Replacement Flow
```
User: "Replace the hero image on the about page"
1. Read the about page component to find the current image
2. Search media library for candidates matching the page context
3. Present options to user
4. Make the replacement
5. Verify with tsc --noEmit
```

### Video Addition Flow
```
User: "Add the elders trip video to the elders page hero"
1. Find the video in external-videos API
2. Read the target page component
3. Import VideoEmbed and add it with proper props
4. Include thumbnail for preview
5. Tag video with page context
```

## Key Files
- Video embed component: `web-platform/components/report/VideoEmbed.tsx`
- External videos API: `web-platform/app/api/external-videos/route.ts`
- Media list API: `web-platform/app/api/media/list/route.ts`
- Media bulk API: `web-platform/app/api/media/bulk/route.ts`
- Gallery page: `web-platform/app/picc/media/gallery/page.tsx`

## Available Videos
Query: `curl http://localhost:3004/api/external-videos`
- All videos have thumbnails (Descript thumbnails auto-fetched from og:image)
- Videos are tagged with services, projects, and people
- Use `VideoEmbed` for all external video rendering

## Video Overlay Patterns

### Background Video (muted autoplay)
```tsx
<div className="relative overflow-hidden">
  <video
    src={videoUrl}
    autoPlay muted loop playsInline
    className="absolute inset-0 w-full h-full object-cover"
  />
  <div className="relative z-10">
    {/* Content on top */}
  </div>
</div>
```

### Click-to-Play Overlay
```tsx
import { VideoEmbed } from '@/components/report/VideoEmbed';

<VideoEmbed
  url={videoUrl}
  title={title}
  thumbnail={thumbnailUrl}
  aspectRatio="16:9"
/>
```

### Hero with Video Option
```tsx
{hasVideo ? (
  <VideoEmbed url={videoUrl} title={title} thumbnail={thumbnail} />
) : (
  <img src={imageUrl} alt={alt} className="w-full h-full object-cover" />
)}
```

## Brand Constraints
- Always reference `PICC-BRAND-STYLE-GUIDE.md` for layout/color decisions
- Videos should respect cultural protocols (elder approval, sensitivity levels)
- Prefer Descript for internally-produced video content
