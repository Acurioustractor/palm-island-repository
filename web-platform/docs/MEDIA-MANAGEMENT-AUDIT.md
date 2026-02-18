# PICC Platform Media Management Audit

**Comprehensive mapping of images, videos, and media across all public pages**

---

## Media Management Strategy

### Smart Tagging System
Each media file in Supabase has:
- **`page_context`** - Which page (home, about, timeline, etc.)
- **`page_section`** - Specific section (hero, services, testimonials)
- **`tags`** - Descriptive tags (community, health, youth, leadership, etc.)
- **`display_order`** - Priority for display (lower = shown first)
- **`is_featured`** - Featured/hero media
- **`context_metadata`** - Flexible JSON (quotes, years, names)

### Admin Controls
- **Cycle through photos** - Admin can select different photos for each context
- **Smart suggestions** - System suggests photos based on tags
- **Preview before publish** - See how media looks in context
- **Bulk tagging** - Tag multiple media at once

---

## Page-by-Page Media Requirements

### 1. **Home Page** (`page_context: 'home'`)

#### Hero Section (`page_section: 'hero'`)
- **Type:** Background image or video
- **Tags:** `aerial`, `community`, `palm-island`, `landscape`
- **Quantity:** 1 featured
- **Dimensions:** 1920x1080 (video) or 2560x1440 (image)
- **Description:** Aerial view of Palm Island or community gathering

#### Impact Numbers Section (`page_section: 'impact-stats'`)
- **Type:** Background texture or subtle pattern
- **Tags:** `texture`, `minimal`
- **Quantity:** 1 optional background

#### 15 Years of Impact (`page_section: 'features'`)
- **Type:** Icons or small photos for 3 feature cards
- **Tags:** `annual-reports`, `services`, `community-control`
- **Quantity:** 3 images
- **Dimensions:** 400x400 each
- **Description:** Visual representation of key features

#### Featured Stories (`page_section: 'featured-stories'`)
- **Type:** Story thumbnails
- **Tags:** Pulled from associated stories
- **Quantity:** 3-6 stories
- **Dimensions:** 600x400 each

---

### 2. **About Page** (`page_context: 'about'`)

#### Hero Section (`page_section: 'hero'`)
- **Type:** Full-screen background image
- **Tags:** `palm-island`, `aerial`, `community`, `sunrise`, `landscape`
- **Quantity:** 1 featured
- **Dimensions:** 2560x1440
- **Description:** Dramatic aerial or community photo

#### Vision Section (`page_section: 'vision'`)
- **Type:** PICC building or Rachel Atkinson photo
- **Tags:** `picc-building`, `leadership`, `rachel-atkinson`
- **Quantity:** 1 image
- **Dimensions:** 800x600

#### Historical Timeline (`page_section: 'timeline'`)
- **Type:** 6 historical photos
- **Tags:** `history`, `manbarra`, `colonial-era`, `1957-strike`, `picc-2007`, `2021-handover`
- **Quantity:** 6 images (one per era)
- **Dimensions:** 600x400 each
- **context_metadata:** `{ "year": "1957", "era": "Resistance & Resilience" }`

#### Video: CEO Story (`page_section: 'ceo-video'`)
- **Type:** Video embed
- **Tags:** `rachel-atkinson`, `ceo`, `interview`, `picc-story`
- **Quantity:** 1 video
- **Duration:** 3-5 minutes
- **Description:** Rachel telling PICC's transformation story

#### Leadership Photos (`page_section: 'leadership'`)
- **Type:** Professional headshots
- **Tags:** `rachel-atkinson`, `luella-bligh`, `allan-palm-island`, `rhonda-phillips`, `harriet-hulthen`, `raymond-palmer`, `matthew-lindsay`
- **Quantity:** 7 headshots
- **Dimensions:** 400x400 each (square)
- **context_metadata:** `{ "name": "Rachel Atkinson", "position": "CEO", "quote": "..." }`

#### Services Section (`page_section: 'services'`)
- **Type:** Service/facility photos
- **Tags:** `bwgcolman-healing`, `family-centre`, `digital-centre`, `bakery`, `health-clinic`
- **Quantity:** 8 photos (2 health, 3 family, 2 economic)
- **Dimensions:** 800x600 each

#### Video: Services Tour (`page_section: 'services-video'`)
- **Type:** Video documentary
- **Tags:** `services`, `day-in-life`, `picc-tour`
- **Quantity:** 1 video
- **Duration:** 5-8 minutes

#### Community Testimonials (`page_section: 'testimonials'`)
- **Type:** Community member photos
- **Tags:** `youth`, `digital-centre`, `elder`, `community-member`
- **Quantity:** 4 photos
- **Dimensions:** 200x200 (circular crop)
- **context_metadata:** `{ "name": "Community Member", "role": "Youth Program", "quote": "..." }`

**Total for About Page:** 29 images + 2 videos

---

### 3. **Impact Page** (`page_context: 'impact'`)

#### Hero Section (`page_section: 'hero'`)
- **Type:** Background image showing impact (employment, services, etc.)
- **Tags:** `impact`, `community`, `services`, `employment`
- **Quantity:** 1 featured

#### Impact Stats Section (`page_section: 'impact-stats'`)
- **Type:** Optional icon/photo for each stat
- **Tags:** `employment`, `health`, `economic`, `child-protection`
- **Quantity:** 6 small icons/photos
- **Dimensions:** 200x200 each

#### Innovation Showcase (`page_section: 'innovation'`)
- **Type:** Photos of innovative programs
- **Tags:** `digital-centre`, `bwgcolman-way`, `social-enterprise`
- **Quantity:** 3-4 photos
- **Dimensions:** 800x600 each

#### Transparent Reporting (`page_section: 'reporting'`)
- **Type:** Screenshot or visual of annual report timeline
- **Tags:** `annual-reports`, `timeline`, `transparency`
- **Quantity:** 1 image
- **Dimensions:** 1200x800

**Total for Impact Page:** 11-12 images

---

### 4. **Annual Reports Page** (`page_context: 'annual-reports'`)

#### Timeline Cards (`page_section: 'timeline'`)
- **Type:** Hero images from each annual report
- **Tags:** Year-specific tags (e.g., `2023-24`, `2022-23`)
- **Quantity:** 15 images (one per year)
- **Dimensions:** 400x600 portrait
- **context_metadata:** `{ "year": "2023-24", "era": "Community Sovereignty" }`

#### Year Expanded View (`page_section: 'year-detail'`)
- **Type:** Multiple images from specific annual report
- **Tags:** Year-specific + content tags
- **Quantity:** Variable (extracted from PDFs)
- **Dimensions:** Variable

**Total for Annual Reports:** 15+ images extracted from PDFs

---

### 5. **Stories Page** (`page_context: 'stories'`)

#### Hero Section (`page_section: 'hero'`)
- **Type:** Background image
- **Tags:** `community`, `stories`, `culture`
- **Quantity:** 1 featured

#### Story Cards (`page_section: 'story-grid'`)
- **Type:** Story thumbnails
- **Tags:** Pulled from associated stories
- **Quantity:** Dynamic (all stories)
- **Dimensions:** 600x400 each
- **Source:** Linked via `story_id` in media_files table

**Total for Stories:** 1 hero + story thumbnails

---

### 6. **Share Voice Page** (`page_context: 'share-voice'`)

#### Hero Section (`page_section: 'hero'`)
- **Type:** Background image showing community storytelling
- **Tags:** `storytelling`, `community`, `sharing`
- **Quantity:** 1 featured

#### Cultural Protocol Section (`page_section: 'cultural-info'`)
- **Type:** Optional icon or small illustration
- **Tags:** `elders`, `cultural-protocol`
- **Quantity:** 0-1 optional

**Total for Share Voice:** 1-2 images

---

### 7. **Community Page** (`page_context: 'community'`)

#### Hero Section (`page_section: 'hero'`)
- **Type:** Community gathering photo
- **Tags:** `community`, `gathering`, `celebration`
- **Quantity:** 1 featured

#### Community Programs (`page_section: 'programs'`)
- **Type:** Photos of community programs in action
- **Tags:** `youth`, `health`, `culture`, `education`
- **Quantity:** 4-6 photos
- **Dimensions:** 800x600 each

**Total for Community:** 5-7 images

---

### 8. **Search Page** (`page_context: 'search'`)
- **Type:** No dedicated media (pulls from search results)
- **Tags:** N/A

---

### 9. **Chat/Assistant Pages** (`page_context: 'chat'` or `'assistant'`)

#### Welcome Screen (`page_section: 'welcome'`)
- **Type:** Optional background or illustration
- **Tags:** `ai`, `assistant`, `technology`
- **Quantity:** 0-1 optional

**Total for Chat:** 0-1 images

---

## **Grand Total Media Requirements**

### Images Needed:
- **Home:** 7 images
- **About:** 27 images
- **Impact:** 11-12 images
- **Annual Reports:** 15+ images
- **Stories:** 1 hero + dynamic story images
- **Share Voice:** 1-2 images
- **Community:** 5-7 images
- **Chat:** 0-1 images

**Total Static Images:** ~67-75 images
**Total Videos:** 2 videos (CEO story, Services tour)

---

## Media Tagging System

### Primary Tags (By Content)
- **People:** `rachel-atkinson`, `board-members`, `community-members`, `elders`, `youth`
- **Places:** `palm-island`, `picc-building`, `health-clinic`, `family-centre`, `digital-centre`, `bakery`
- **Themes:** `community`, `culture`, `health`, `education`, `employment`, `sovereignty`
- **Historical:** `history`, `1957-strike`, `manbarra`, `colonial-era`, `2007`, `2021`
- **Media Type:** `aerial`, `landscape`, `portrait`, `group`, `facility`, `event`

### Context Tags (By Usage)
- **Purpose:** `hero`, `thumbnail`, `testimonial`, `timeline`, `service-photo`, `leadership`
- **Quality:** `professional`, `candid`, `historical`, `archival`
- **Content:** `faces`, `building`, `landscape`, `activity`, `ceremony`

---

## Admin Media Manager Features

### 1. **Media Selection Interface**
For each page context/section:
```
Page: About
Section: Hero Background

Current Image:
[Preview of current hero image]

Available Images (filtered by tags: palm-island, aerial, landscape):
[Grid of thumbnails with checkbox to select]

[ Select ] [ Preview ] [ Set as Featured ]
```

### 2. **Smart Suggestions**
- System analyzes tags and suggests relevant media
- "Photos tagged with 'aerial' and 'palm-island' work well here"
- "3 photos available for this section"

### 3. **Bulk Operations**
- Tag multiple photos at once
- Assign multiple photos to a gallery section
- Set display order by drag-and-drop

### 4. **Preview Mode**
- See how photo looks in actual page context
- Switch between photos to compare
- Mobile/desktop preview

### 5. **Upload & Tag Flow**
1. Upload media
2. AI suggests tags based on content
3. Admin confirms/edits tags
4. Assign to page contexts
5. Set display order
6. Publish

---

## Database Structure for Media Management

```sql
-- Example: Setting hero image for About page
UPDATE media_files
SET
  page_context = 'about',
  page_section = 'hero',
  is_featured = TRUE,
  display_order = 0,
  tags = ARRAY['palm-island', 'aerial', 'landscape', 'hero'],
  usage_context = 'page_hero',
  context_metadata = '{
    "page_title": "Palm Island Community Company",
    "aspect_ratio": "16:9"
  }'::jsonb
WHERE id = 'some-uuid';

-- Example: Setting leadership photo
UPDATE media_files
SET
  page_context = 'about',
  page_section = 'leadership',
  display_order = 0,
  tags = ARRAY['rachel-atkinson', 'ceo', 'leadership', 'portrait'],
  usage_context = 'leadership_photo',
  context_metadata = '{
    "name": "Rachel Atkinson",
    "position": "Chief Executive Officer",
    "quote": "Everything we do is for, with, and because of the people of this beautiful community"
  }'::jsonb
WHERE id = 'another-uuid';
```

---

## Next Steps

1. **✅ Schema Migration** - Extend media_files table with page contexts
2. **⏳ Build Admin UI** - Create media manager component
3. **⏳ Create Helper Functions** - Smart fetching utilities
4. **⏳ Update Pages** - Replace TODO placeholders with smart media fetching
5. **⏳ Upload Initial Media** - Populate database with existing media
6. **⏳ Test & Refine** - Iterate on admin experience

---

## File Locations

- **Schema:** `/lib/empathy-ledger/migrations/07_media_page_context.sql`
- **Admin UI:** `/app/admin/media/page.tsx` (to be created)
- **Utilities:** `/lib/media/utils.ts` (to be created)
- **Types:** `/lib/media/types.ts` (to be created)
