# Public Pages Hero & Media Query Audit

**Generated:** 2026-02-19  
**Scope:** All public pages in `app/(public)/` examining hero/media sources

---

## Summary

### Hero Image Sources
- **Supabase Queries**: 9 pages ✓
- **Hardcoded URLs**: 1 page
- **VideoHero Component**: 2 pages
- **No Hero**: 1 page (Impact - client component)

### Gallery/Media Queries
- **Supabase Tags**: 6 pages ✓
- **No Gallery**: 5 pages

---

## Page-by-Page Audit

### 1. Homepage (`/`)
**Path:** `app/(public)/page.tsx`  
**Type:** Server component  
**Hero:** None ✗ (renders HomePageClient which is client-rendered)  
**Media Queries:**
- Service photos via tags: `service:{slug}` ✓
- Photo count: Yes, queries `media_files` with tags
- Video: No

**Implementation Details:**
- Fetches services from `organization_services` table
- Counts photos per service using `contains('tags', [tag])` query
- Total photo count via `eq('file_type', 'image')`
- No hero image on this page

---

### 2. About (`/about`)
**Path:** `app/(public)/about/page.tsx`  
**Type:** Server component  
**Hero:** ✓ Supabase query
```typescript
heroImage = await getHeroImage("about");
```
- Function: `getHeroImage()` from `lib/media/utils.ts`
- Query pattern: Fetches `media_files` where:
  - `page_context = 'about'`
  - `page_section = 'hero'`
  - `file_type = 'image'`
  - `is_featured = true`

**Media Queries:** Yes ✓
1. **Vision Image**: `getPageMedia({ pageContext: "about", pageSection: "vision", limit: 1 })`
2. **Timeline Photos**: `getTimelinePhotos()` (max 10)
3. **Leadership Photos**: `getLeadershipPhotos()` (max 10)
4. **Board Portraits**: `getMediaByTags(['board-member', 'portrait'])`
5. **Service Photos**: `getServicePhotos()` (max 7)
6. **Elder Stories**: Queries `stories` table with `pageContext='about'`, `pageSection='elder-stories'`
7. **Curated Quotes**: `getCuratedQuotes({ limit: 4 })`

**Gallery Implementation:**
- Elder Stories section: `pageContext='about'`, `pageSection='elder-stories'` (4 stories)
- Community Voices: 4 curated quotes with photos from `extracted_quotes` or `curated_quotes`
- All images queried from Supabase; no hardcoded URLs

---

### 3. Elders (`/elders`)
**Path:** `app/(public)/elders/page.tsx`  
**Type:** Server component  
**Hero:** ✓ Supabase query (cascading)
```typescript
// Primary: tags=['page:elders', 'hero']
const heroRow = await supabase
  .from('media_files')
  .select('...')
  .contains('tags', ['page:elders', 'hero'])
  .limit(1);

// Secondary fallback: tags=['page:elders']
if (!heroMedia) {
  const heroRow = await supabase
    .from('media_files')
    .contains('tags', ['page:elders'])
    .limit(1);
}

// Tertiary fallback: Use first Elders Trip photo
if (!heroMedia && tripImages.length > 0) {
  heroMedia = { type: 'image', url: tripImages[0].public_url };
}
```

**Media Queries:** Yes ✓
1. **Hero Media**: Tags `['page:elders', 'hero']` OR `['page:elders']` OR first Elders Trip photo
2. **Elders Trip Images**: 
   - Primary: Project ID `elders-trips` (up to 200 images)
   - Fallback: Tags `['project:elders-trips']` (up to 200)
3. **Elders Trip Video**: 
   - Primary: Tags `['external-video', 'project:elders-trips', 'platform:descript']`
   - Fallback: Tags `['external-video', 'project:elders-trips']`
   - Tertiary: Tags `['external-video']` (any)
4. **Elder Profiles**: Queries `profiles` table with `is_elder=true`, `show_in_directory=true`
5. **Elder Quotes**: Queries `extracted_quotes` table for validated/suggested quotes
6. **Elder Stories**: Queries `stories` table filtered by elder storytellers

**Gallery Implementation:**
- Elders Trip image gallery: Up to 200 images tagged with project ID or `project:elders-trips`
- Hero image: Dedupped from trip gallery if image type

---

### 4. Explore (`/explore`)
**Path:** `app/(public)/explore/page.tsx`  
**Type:** Server component with dynamic client map  
**Hero:** None (map page, no hero)  
**Media Queries:** Yes ✓

**Service Hero Photos:**
```typescript
const heroTags = serviceSlugs.map((slug) => `service:${slug}`);
const { data: heroPhotos } = await supabase
  .from('media_files')
  .select('public_url, alt_text, title, tags')
  .contains('tags', ['hero'])
  .overlaps('tags', heroTags)
  .limit(100);
```
- Finds one hero photo per service
- Tags: `['hero']` AND (`['service:{slug}']`)

**Gallery Implementation:**
- None on this page (map display, hero photos only)

---

### 5. Impact (`/impact`)
**Path:** `app/(public)/impact/page.tsx`  
**Type:** Server component wrapper for client component  
**Hero:** None ✗
**Media Queries:** None ✗

**Implementation:**
- Fetches live stats via `getLiveStats()`
- Passes stats to `ImpactPageClient` component
- All content is statistics-based, no media files queried

---

### 6. Services Index (`/services`)
**Path:** `app/(public)/services/page.tsx`  
**Type:** Server component  
**Hero:** None (page hero: static gradient background with text)  
**Media Queries:** Yes ✓

**Cover Photos Per Service:**
```typescript
for (const s of services) {
  const serviceTag = `service:${s.slug}`;
  
  // Cover photo: service:{slug} AND hero
  const { data: heroPhotos } = await supabase
    .from('media_files')
    .select('public_url, alt_text, title')
    .contains('tags', [serviceTag, 'hero'])
    .eq('file_type', 'image')
    .limit(1);
  
  // Photo count
  const { count: photoCount } = await supabase
    .from('media_files')
    .contains('tags', [serviceTag])
    .eq('file_type', 'image')
    .count('exact');
  
  // Video count
  const { count: videoCount } = await supabase
    .from('media_files')
    .contains('tags', [serviceTag])
    .eq('file_type', 'video')
    .count('exact');
}
```

**Gallery Implementation:**
- No gallery section on page itself
- Each service card shows cover photo + photo/video badges
- Tags: `service:{slug}` for photos, `service:{slug}` for video count

---

### 7. 20 Years (`/20-years`)
**Path:** `app/(public)/20-years/page.tsx`  
**Type:** Client component  
**Hero:** None (client fetches via API)  
**Media Queries:** Yes (via API)

**Data Fetching:**
```typescript
useEffect(() => {
  fetch('/api/public/history')
    .then(res => res.json())
    .then(d => setData(d));
}, []);
```

**Returns HistoryData:**
- `years[]` with `images[]` per year
- `eras[]` with `images[]` per era (first image used for ParallaxSection background)
- All images populated from API response

**Gallery Implementation:**
- Era divider images (ParallaxSection with backgroundImage)
- Era image galleries (ImageGallery component)
- Data structure has URL strings, not database queries

---

### 8. Road to 20 Years (`/road-to-20-years`)
**Path:** `app/(public)/road-to-20-years/page.tsx`  
**Type:** Server component  
**Hero:** ✓ Hardcoded video URLs
```typescript
<VideoHero
  videoSrc="/video/road-to-20-years.mp4"
  videoSrcMobile="/video/road-to-20-years-mobile.mp4"
  poster="/video/road-to-20-years-poster.jpg"
  overlay="cinematic"
  height="tall"
  parallax
/>
```

**Media Queries:** None ✗ (no image galleries on page)  
**Hardcoded URLs:**
- `/video/road-to-20-years.mp4`
- `/video/road-to-20-years-mobile.mp4`
- `/video/road-to-20-years-poster.jpg`

---

### 9. Annual Report Live (`/annual-report/live`)
**Path:** `app/(public)/annual-report/live/page.tsx`  
**Type:** Server component  
**Hero:** ✓ Supabase query
```typescript
heroImage = await getHeroImage('annual-report');
```

**Media Queries:** Yes ✓
1. **Hero Image**: `getHeroImage('annual-report')`
2. **Community Gallery**: 
   - Tags: `['annual-report', 'fy:{fiscalYear}']`
   - Fallback: Tags `['community', 'event', 'culture', 'youth', 'health']`
   - Limit: 18 images (random sampled)
3. **Map Image**: 
   - `page_context='annual-report'`, `page_section='map'`
4. **Board Gallery**: 
   - Tags: `['board', 'annual-report', 'fy:{fiscalYear}']`
   - Limit: 12 images (random sampled)

**Gallery Implementation:**
- Community Photo Gallery section (PhotoGallery component, 4-column layout)
- Board Photo Gallery (4-column layout)
- Story images fetched via `story_id` from `media_files`
- Leader photos: direct from `leadership` table (`photo_url` field)

---

### 10. Innovation (`/innovation`)
**Path:** `app/(public)/innovation/page.tsx`  
**Type:** Server component  
**Hero:** None (HeroSection with icon, no image)  
**Media Queries:** None ✗

**Implementation:**
- Hero has `Lightbulb` icon, no image background
- Project cards have gradient thumbnails with icons from `/icons/bespoke-white/{icon}.png`
- Hardcoded project data in component

---

## Missing/Incomplete Pages

### 11. Elders Trips (`/elders/` subdirectory)
**Status:** No separate page found
- Content integrated into `/elders` main page
- Trip image gallery: 200-image limit
- Trip video: from `media_files` with external-video tag

### 12. Annual Report Dynamic Pages
- `/annual-report/[year]/page.tsx` - Not analyzed (dynamic)
- `/annual-report/2024-25/page.tsx` - Not analyzed (specific year)
- `/annual-report/print/page.tsx` - Not analyzed (print mode)

---

## Query Pattern Summary

### Standard Hero Query Pattern
```typescript
async function getHeroImage(pageContext: PageContext): Promise<string | null> {
  const media = await getFeaturedPageMedia(pageContext, 'hero', 'image');
  return media?.public_url || null;
}
```
**Used by:** About, Annual Report Live

### Service Photo Tag Pattern
```typescript
const { data: heroPhotos } = await supabase
  .from('media_files')
  .contains('tags', [serviceTag, 'hero'])  // Both tags required
  .overlaps('tags', heroTags)             // OR logic for multiple services
  .eq('file_type', 'image')
```
**Used by:** Explore, Services Index

### Page/Section Pattern
```typescript
getPageMedia({
  pageContext: 'about',
  pageSection: 'vision',
  fileType: 'image',
  limit: 1
})
```
**Used by:** About (vision, timeline, leadership, board, service photos)

### Project ID Pattern
```typescript
const { data } = await supabase
  .from('media_files')
  .eq('project_id', eldersTripProject.id)
  .eq('file_type', 'image')
```
**Used by:** Elders (project:elders-trips)

---

## Hardcoded Image URLs

### Found
1. **Road to 20 Years hero videos:**
   - `/video/road-to-20-years.mp4`
   - `/video/road-to-20-years-mobile.mp4`
   - `/video/road-to-20-years-poster.jpg`

2. **Innovation page bespoke icons:**
   - `/icons/bespoke-white/{icon}.png` (dynamically generated paths)

3. **Service Cover Photos:**
   - On Services page: `coverPhotoMap.get(s.slug)?.public_url` (Supabase URL, not hardcoded)

### Not Found in Public Pages
- No other hardcoded image URLs detected in analyzed public pages

---

## Data Structure Issues

### Media_files Table Dependency
All pages expect these columns:
- `id`
- `public_url` (the actual image/video URL)
- `file_type` ('image' or 'video')
- `is_public` (boolean)
- `deleted_at` (soft delete)
- `tags` (JSON array)
- `page_context` (optional, for organization)
- `page_section` (optional)
- `is_featured` (boolean)
- `created_at`
- `display_order` (for sorting)
- `project_id` (optional, for project linking)
- `story_id` (optional, for story linking)

### Profiles Table
- `id`
- `full_name`
- `preferred_name`
- `profile_image_url`
- `is_elder`
- `show_in_directory`
- `profile_visibility`

### Leadership Table
- `id`
- `full_name`
- `position`
- `photo_url`
- `leadership_type` ('board' or 'executive')
- `is_active`

---

## Tag Naming Conventions

### Currently Used
- `page:elders` - Page context tag
- `page_context='about'` - Column value
- `service:{slug}` - Service reference (e.g., `service:health-services`)
- `project:{slug}` - Project reference (e.g., `project:elders-trips`)
- `hero` - Hero section indicator
- `annual-report` - Report context
- `fy:{year}` - Fiscal year (e.g., `fy:2024-25`)
- `board` - Board-related content
- `external-video` - External hosted video
- `platform:descript` - Platform source (e.g., Descript embeds)

### Inconsistency Found
- **Elders page:** Uses both `page:elders` (in tags) and `page_context='about'` (in column)
- **About page:** Uses `pageContext: 'about'` (function parameter)
- **Services:** Uses `service:{slug}` pattern consistently
- **Annual Report:** Uses `fy:{year}` for fiscal year filtering

---

## Recommendations

### 1. Standardize Tag Naming
- Use `page:{context}` format consistently (e.g., `page:about`, `page:services`)
- Or use `page_context` column instead of tags for organizational metadata

### 2. Add Missing Media Queries
- **Impact page:** Currently has no hero image or galleries. Add:
  - Hero image via `getHeroImage('impact')`
  - Optional gallery of community impact photos
- **Innovation page:** Add hero image and project images

### 3. Migrate Hardcoded URLs
- **Road to 20 Years videos:** Store in `media_files` with tags `['page:road-to-20-years', 'hero', 'video']`
- Benefits: Centralized asset management, easier updates, versioning

### 4. Implement Caching Strategy
- `/20-years` calls `/api/public/history` - ensure this endpoint caches era/year image data
- Consider `revalidate` strategy for long-term caches (historical data is static)

### 5. Fix Data Consistency
- **Annual Report Live:** Uses random sampling (`sample()` function) for gallery images
  - Consider: Featured flag, created_at ordering, or explicit `display_order`
  - Current approach: Rotates random selection on every page load (unpredictable UX)

### 6. Document Media Requirements Per Page
Create a table mapping each page to required media tags/structure:

| Page | Hero Tags | Hero Type | Gallery Tags | Gallery Limit |
|------|-----------|-----------|--------------|---------------|
| About | `page:about` `hero` | Image | `pageContext:about` + section | Varies |
| Services | `service:{slug}` `hero` | Image | `service:{slug}` | Per service |
| Annual Report | `page:annual-report` `hero` | Image | `annual-report` `fy:{year}` | 18 |
| Elders | `page:elders` `hero` | Image/Video | `project:elders-trips` | 200 |

---

## Query Performance Notes

### N+1 Problem Detected
**Services page** (line 58-94):
```typescript
for (const s of services) {
  // Makes separate queries for each service!
  const { data: heroPhotos } = await supabase
    .from('media_files')
    .select(...)
    .contains('tags', [serviceTag, 'hero'])
    .limit(1);
  
  // Plus 2 more queries per service
  const { count: photoCount } = await supabase...
  const { count: videoCount } = await supabase...
}
```

**Impact:** If 30 services, this makes 90+ queries (30 services × 3 queries each)

**Solution:** Batch query with `overlaps('tags', allServiceTags)` like Explore page does

---

## Summary Table

| Page | Path | Hero | Gallery | Hero Source | Issues |
|------|------|------|---------|-------------|--------|
| Home | `/` | ✗ | ✓ (service tags) | None | No hero image |
| About | `/about` | ✓ | ✓ (multiple) | Supabase | Clean |
| Elders | `/elders` | ✓ | ✓ (project) | Supabase (cascade) | Cascading fallbacks work well |
| Explore | `/explore` | ✗ | ✓ (service tags) | None | Map-only page |
| Impact | `/impact` | ✗ | ✗ | None | Client component, no media |
| Services | `/services` | ✗ | ✓ (service tags) | None | N+1 query problem |
| 20 Years | `/20-years` | ✗ | ✓ (via API) | API-driven | Client-side, data structure TBD |
| Road to 20 | `/road-to-20-years` | ✓ | ✗ | Hardcoded | Migration candidate |
| Annual Report | `/annual-report/live` | ✓ | ✓ (multiple) | Supabase | Random sampling (unpredictable) |
| Innovation | `/innovation` | ✗ (icon only) | ✗ | None | Gradient thumbnails only |

