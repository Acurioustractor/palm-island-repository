# Media Integration Strategy - Home Page Example

This document shows the strategic placement of photos and videos throughout the site.

## Media Types & Purposes

### 1. Hero Section
**Media:** Background video (autoplay, muted) OR high-impact photo
**Purpose:** Immediate emotional connection, set tone
**Database:** `page_context='home', page_section='hero', file_type='video'` OR `'image'`
**Fallback:** If no video, use photo. If no photo, use gradient.

### 2. Stats Cards with Photos
**Media:** Circular cropped photos of staff/community behind each stat
**Purpose:** Humanize numbers - "197 staff" shows actual staff faces
**Database:** `page_context='home', page_section='stats', display_order=0-3`

### 3. Feature Cards with Photo Backgrounds
**Media:** Service/program-specific photos as card backgrounds
**Purpose:** Make services tangible, show real facilities/activities
**Database:** `page_context='home', page_section='features', display_order=0-2`

### 4. Community in Action Gallery
**Media:** Photo grid showing programs, events, daily life
**Purpose:** Visual proof of community engagement
**Database:** `page_context='home', page_section='gallery'`

### 5. Testimonial Section with Photos
**Media:** Portrait photos + optional video testimonials
**Purpose:** Face to voice, build trust
**Database:** `page_context='home', page_section='testimonials'`

### 6. Quote Sections with Photo Backgrounds
**Media:** Large background photo with overlay for text
**Purpose:** Emotional reinforcement of message
**Database:** `page_context='home', page_section='quotes'`

### 7. CTA Sections with Photo Backgrounds
**Media:** Relevant action photos as section backgrounds
**Purpose:** Visual call-to-action, show what's possible
**Database:** `page_context='home', page_section='cta'`

## Implementation Notes

- All media fetched server-side for SEO/performance
- Graceful fallbacks for missing media
- Responsive images with object-fit cover
- Videos: autoplay, muted, loop, playsinline
- Photos: optimized, lazy-loaded where appropriate
- Overlays: Dark enough for text readability (50-70% opacity)
