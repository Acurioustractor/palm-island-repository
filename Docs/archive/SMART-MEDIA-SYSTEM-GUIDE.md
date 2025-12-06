# Smart Media Management System - Implementation Guide

**Complete system for managing images and videos across the PICC platform**

---

## System Overview

The Smart Media Management System connects your Supabase media database to the frontend, allowing you to:

1. **Tag media** with page contexts, sections, and descriptive tags
2. **Assign media** to specific pages and sections dynamically
3. **Cycle through photos** - change which photos appear where without code changes
4. **Smart suggestions** - system suggests relevant photos based on tags
5. **Admin control** - manage everything from a visual interface

---

## Files Created

### 1. **Database Migration**
`/lib/empathy-ledger/migrations/07_media_page_context.sql`
- Extends `media_files` table with page context columns
- Adds helper functions and views
- Creates indexes for performance

### 2. **TypeScript Types**
`/lib/media/types.ts`
- All media-related types
- `MediaFile`, `PageContext`, `PageMediaQuery`, etc.

### 3. **Utility Functions**
`/lib/media/utils.ts`
- `getPageMedia()` - Get media for any page/section
- `getFeaturedPageMedia()` - Get featured/hero media
- `getHeroImage()` - Quick hero image fetch
- `getLeadershipPhotos()`, `getTimelinePhotos()`, etc.
- Search, filter, and management functions

### 4. **Admin Interface**
`/app/admin/media/page.tsx`
- Visual media manager for admins
- Filter by page, section, type
- Quick edit and assignment
- Toggle featured/public status

### 5. **Documentation**
- `MEDIA-MANAGEMENT-AUDIT.md` - Complete mapping of all media needs (67-75 images, 2 videos)
- `SMART-MEDIA-SYSTEM-GUIDE.md` - This file

---

## Setup Instructions

### Step 1: Run the Database Migration

```bash
# Connect to your Supabase database
# Then run the migration
psql $SUPABASE_DB_URL -f lib/empathy-ledger/migrations/07_media_page_context.sql
```

Or via Supabase dashboard:
1. Go to SQL Editor
2. Copy contents of `07_media_page_context.sql`
3. Run the query

### Step 2: Verify Migration

```bash
npx tsx scripts/check-media-schema.ts
```

You should see new columns:
- `page_context`
- `page_section`
- `display_order`
- `context_metadata`

### Step 3: Access Admin Interface

Navigate to: **http://localhost:3005/admin/media**

You'll see the Media Manager interface with:
- All media files from Supabase
- Filters by page, section, type
- Edit modal for each media item

---

## How to Use the Admin Interface

### Assigning Media to Pages

1. **Open Media Manager**
   - Go to `/admin/media`
   - You'll see all media files in a grid

2. **Click on a photo**
   - Edit modal opens
   - See preview and details

3. **Set Page Context**
   - Choose which page (home, about, impact, etc.)
   - Choose which section (hero, timeline, services, etc.)
   - Add descriptive tags
   - Set display order (lower = shown first)
   - Check "Featured" for hero images

4. **Save Changes**
   - Click "Save Changes"
   - Photo is now assigned to that page/section

### Example: Setting Hero Image for About Page

1. Find aerial photo of Palm Island
2. Click to open edit modal
3. Set:
   - **Page Context:** `about`
   - **Page Section:** `hero`
   - **Tags:** `palm-island, aerial, landscape, hero`
   - **Display Order:** `0`
   - **Featured:** ✅ Check
4. Save

Now when the About page loads, it will automatically fetch this photo!

---

## Using Media in Pages

### Example 1: Get Hero Image

```tsx
import { getHeroImage } from '@/lib/media/utils';

export default async function AboutPage() {
  const heroImage = await getHeroImage('about');

  return (
    <div className="hero" style={{
      backgroundImage: `url(${heroImage || '/placeholder.jpg'})`
    }}>
      <h1>About PICC</h1>
    </div>
  );
}
```

### Example 2: Get Leadership Photos

```tsx
import { getLeadershipPhotos } from '@/lib/media/utils';

export default async function AboutPage() {
  const leadershipPhotos = await getLeadershipPhotos();

  return (
    <div className="leadership-grid">
      {leadershipPhotos.map((photo) => (
        <div key={photo.id} className="leader-card">
          <img
            src={photo.public_url}
            alt={photo.alt_text}
          />
          <h3>{photo.title}</h3>
          {/* Access metadata like name, position, quote */}
          {photo.context_metadata && (
            <p>{photo.context_metadata.quote}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Get Media for Any Page/Section

```tsx
import { getPageMedia } from '@/lib/media/utils';

export default async function ServicesSection() {
  const servicePhotos = await getPageMedia({
    pageContext: 'about',
    pageSection: 'services',
    fileType: 'image',
    limit: 10
  });

  return (
    <div className="services-grid">
      {servicePhotos.map((photo) => (
        <img key={photo.id} src={photo.public_url} alt={photo.alt_text} />
      ))}
    </div>
  );
}
```

### Example 4: Get Media by Tags

```tsx
import { getMediaByTags } from '@/lib/media/utils';

export default async function CommunityGallery() {
  const communityPhotos = await getMediaByTags(
    ['community', 'celebration', 'culture'],
    12,
    'image'
  );

  return (
    <div className="gallery">
      {communityPhotos.map((photo) => (
        <img key={photo.id} src={photo.public_url} alt={photo.alt_text} />
      ))}
    </div>
  );
}
```

---

## Smart Tagging Strategy

### Page Context Tags
- `home` - Homepage
- `about` - About page
- `impact` - Impact page
- `community` - Community page
- `stories` - Stories page
- `annual-reports` - Timeline page

### Section Tags
- `hero` - Hero/background images
- `timeline` - Historical photos
- `leadership` - Board/CEO photos
- `services` - Service facility photos
- `testimonials` - Community member photos

### Descriptive Tags
- **People:** `rachel-atkinson`, `board-members`, `elders`, `youth`
- **Places:** `palm-island`, `picc-building`, `health-clinic`, `digital-centre`
- **Themes:** `community`, `culture`, `health`, `education`, `employment`
- **Type:** `aerial`, `landscape`, `portrait`, `group`, `facility`

### Example Tag Combinations

**Hero image for About page:**
```
Tags: ['palm-island', 'aerial', 'landscape', 'hero', 'community']
Page Context: 'about'
Page Section: 'hero'
Featured: true
```

**Rachel Atkinson headshot:**
```
Tags: ['rachel-atkinson', 'ceo', 'leadership', 'portrait']
Page Context: 'about'
Page Section: 'leadership'
Display Order: 0
Context Metadata: {
  "name": "Rachel Atkinson",
  "position": "CEO",
  "quote": "Everything we do is for, with, and because of the people..."
}
```

**Digital Service Centre photo:**
```
Tags: ['digital-centre', 'services', 'employment', 'technology']
Page Context: 'about'
Page Section: 'services'
Display Order: 5
```

---

## Cycling Through Photos

### How to Change Photos Without Code

1. **Current Setup:**
   - About page hero: Photo A (aerial view)

2. **Want to Change:**
   - Admin goes to Media Manager
   - Finds Photo A, clicks it
   - Unchecks "Featured"
   - Saves

3. **Select New Photo:**
   - Finds Photo B (community gathering)
   - Sets Page Context: `about`
   - Sets Page Section: `hero`
   - Checks "Featured"
   - Saves

4. **Result:**
   - About page now shows Photo B as hero
   - No code changes needed!

### Multiple Photos in a Section

For galleries or carousels:

1. Assign multiple photos to same page/section
2. Use `display_order` to control order
3. Photos will appear in order

```tsx
const servicePhotos = await getPageMedia({
  pageContext: 'about',
  pageSection: 'services',
  limit: 8
});

// Returns photos ordered by display_order
// Photo with display_order: 0 first
// Photo with display_order: 1 second
// etc.
```

---

## Context Metadata Examples

### For Timeline Photos
```json
{
  "year": "1957",
  "era": "Resistance & Resilience",
  "event": "Magnificent Seven Strike",
  "historical_note": "Five-day strike against oppressive conditions"
}
```

### For Leadership Photos
```json
{
  "name": "Luella Bligh",
  "position": "Chair",
  "quote": "A future where Palm Island's governance reflects the wisdom of its people",
  "role": "Guardian of Transformation"
}
```

### For Testimonial Photos
```json
{
  "name": "Community Member",
  "role": "Youth Program Participant",
  "quote": "If I can do it, you can. Country provides and we witness it every day.",
  "program": "Digital Service Centre"
}
```

### For Service Photos
```json
{
  "service_name": "Bwgcolman Healing Service",
  "location": "Primary Health Centre",
  "stats": {
    "clients": "2,283",
    "episodes": "17,488"
  }
}
```

---

## Admin Workflows

### Workflow 1: Uploading New Media

1. **Upload to Supabase Storage**
   - Upload via Supabase dashboard or API
   - File goes to appropriate bucket (story-images, profile-images, etc.)

2. **Create Media Record**
   - Either manually via SQL or through upload API
   - Record created in `media_files` table

3. **Tag and Assign**
   - Open Media Manager
   - Find new media
   - Set page context, section, tags
   - Save

4. **Publish**
   - Check "Featured" if hero image
   - Set "Public" if ready to show
   - Photo now appears on site!

### Workflow 2: Reorganizing Page Media

**Scenario:** Want to change which photos appear in About page services section

1. Open Media Manager
2. Filter by:
   - Page: `about`
   - Section: `services`
3. See all current service photos
4. Edit each one:
   - Change display order
   - Update tags
   - Toggle featured status
5. Add new photos if needed
6. Remove old photos (unassign from section)

### Workflow 3: Creating a Gallery

**Scenario:** Create a community events gallery

1. Find 12-15 photos tagged with `community`, `events`, `celebration`
2. Assign all to:
   - Page Context: `community`
   - Page Section: `gallery`
3. Set display order (0-14)
4. On frontend:
```tsx
const galleryPhotos = await getPageMedia({
  pageContext: 'community',
  pageSection: 'gallery',
  limit: 15
});

// Render as grid
```

---

## Integration with Existing Pages

### Update About Page

Replace TODO comments with smart media fetching:

```tsx
// OLD: Placeholder comment
{/* TODO: Add hero background image */}

// NEW: Smart media fetch
import { getHeroImage } from '@/lib/media/utils';

const heroImage = await getHeroImage('about');

<section style={{ backgroundImage: `url(${heroImage})` }}>
```

### Update Leadership Section

```tsx
// OLD: Placeholder
{/* TODO: Add Rachel Atkinson headshot */}

// NEW: Smart fetch
import { getLeadershipPhotos } from '@/lib/media/utils';

const leadershipPhotos = await getLeadershipPhotos();

{leadershipPhotos.map((photo) => (
  <div key={photo.id}>
    <img src={photo.public_url} alt={photo.alt_text} />
    <h3>{photo.context_metadata?.name}</h3>
    <p>{photo.context_metadata?.position}</p>
    <blockquote>{photo.context_metadata?.quote}</blockquote>
  </div>
))}
```

---

## Advanced Features

### 1. Client-Side Media Loading

For dynamic updates without page reload:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getPageMedia } from '@/lib/media/utils';

export default function DynamicGallery() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    async function loadPhotos() {
      const data = await getPageMedia({
        pageContext: 'community',
        pageSection: 'gallery'
      });
      setPhotos(data);
    }
    loadPhotos();
  }, []);

  return <div>{/* render photos */}</div>;
}
```

### 2. Search Functionality

```tsx
import { searchMedia } from '@/lib/media/utils';

const results = await searchMedia('palm island aerial', 10);
```

### 3. Stats and Analytics

```tsx
import { getPageMediaStats } from '@/lib/media/utils';

const stats = await getPageMediaStats('about');
// Returns: { page_context, page_section, file_type, media_count }
```

---

## Next Steps

### Phase 1: Setup (Complete ✅)
- ✅ Database migration
- ✅ Type definitions
- ✅ Utility functions
- ✅ Admin interface

### Phase 2: Populate Database
1. Upload existing media to Supabase storage
2. Create records in `media_files` table
3. Use admin interface to tag and assign
4. Priority: 67-75 images identified in audit

### Phase 3: Update Pages
1. Replace TODO placeholders with smart fetching
2. Test on each page
3. Verify correct images show
4. Adjust tags/assignments as needed

### Phase 4: Refine
1. Add more descriptive tags
2. Create galleries
3. Add videos (CEO story, Services tour)
4. Optimize loading performance

---

## Troubleshooting

### Media Not Showing Up

1. **Check page_context and page_section**
   ```sql
   SELECT * FROM media_files WHERE page_context = 'about' AND page_section = 'hero';
   ```

2. **Check is_public flag**
   ```sql
   UPDATE media_files SET is_public = true WHERE id = 'media-id';
   ```

3. **Check deleted_at**
   ```sql
   SELECT * FROM media_files WHERE deleted_at IS NULL;
   ```

### Wrong Photo Showing

1. **Check display_order**
   - Lower number = shown first
   - Update via admin interface

2. **Check is_featured flag**
   - Only one should be featured per hero section
   ```sql
   SELECT * FROM media_files
   WHERE page_context = 'about'
   AND page_section = 'hero'
   AND is_featured = true;
   ```

### Performance Issues

1. **Ensure indexes exist**
   ```sql
   CREATE INDEX IF NOT EXISTS media_files_page_context_idx ON media_files(page_context);
   ```

2. **Limit queries**
   - Always use `limit` parameter
   - Don't fetch more than needed

3. **Cache results**
   - Next.js caches server components by default
   - Add `revalidate` for dynamic updates

---

## API Reference

### getPageMedia(query: PageMediaQuery)

Fetch media for a specific page/section.

**Parameters:**
```typescript
{
  pageContext: 'home' | 'about' | 'impact' | ...,
  pageSection?: string,
  fileType?: 'image' | 'video' | 'audio',
  tags?: string[],
  limit?: number,
  featuredOnly?: boolean
}
```

**Returns:** `MediaFile[]`

---

### getFeaturedPageMedia(pageContext, pageSection?, fileType?)

Get a single featured/hero media.

**Returns:** `FeaturedMedia | null`

---

### getHeroImage(pageContext: PageContext)

Quick helper to get hero image URL.

**Returns:** `string | null`

---

## Support

For questions or issues:
1. Check this guide
2. Review `MEDIA-MANAGEMENT-AUDIT.md`
3. Check Supabase logs
4. Review database schema in `07_media_page_context.sql`

---

## Summary

You now have a complete smart media management system that:

✅ **Connects Supabase to frontend** - Automatically fetches relevant media
✅ **Admin control** - Visual interface for managing all media
✅ **Smart tagging** - Organize media by page, section, tags
✅ **Easy updates** - Change photos without code changes
✅ **Flexible** - Works for images, videos, audio
✅ **Performant** - Indexed queries, cached results
✅ **Comprehensive** - Covers all 8 public pages

**Next:** Start uploading media and using the admin interface!
