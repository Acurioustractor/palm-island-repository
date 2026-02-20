# Public Pages Hero & Media - Quick Reference

## Hero Image Status

| Page | Path | Has Hero? | Source | Implementation |
|------|------|-----------|--------|-----------------|
| **Home** | `/` | ❌ No | — | No hero section |
| **About** | `/about` | ✅ Yes | Supabase `getHeroImage("about")` | `page_context='about'`, `page_section='hero'`, `file_type='image'`, `is_featured=true` |
| **Elders** | `/elders` | ✅ Yes | Supabase (cascade) | Primary: `tags=['page:elders', 'hero']` → Secondary: `tags=['page:elders']` → Tertiary: First trip image |
| **Explore** | `/explore` | ❌ No | — | Map page, no hero |
| **Impact** | `/impact` | ❌ No | — | Client component, stats only |
| **Services** | `/services` | ❌ No | — | Static gradient background |
| **20 Years** | `/20-years` | ❌ No | — | Client-side API fetch |
| **Road to 20** | `/road-to-20-years` | ✅ Yes | **Hardcoded** | `/video/road-to-20-years.mp4`, `/video/road-to-20-years-mobile.mp4` |
| **Annual Report** | `/annual-report/live` | ✅ Yes | Supabase `getHeroImage('annual-report')` | `page_context='annual-report'`, `page_section='hero'` |
| **Innovation** | `/innovation` | ❌ No* | — | Icon-only hero, no image/video |

*Innovation has an icon in the hero but no background image or video.

---

## Gallery/Media Queries

| Page | Has Gallery? | Media Source | Query Pattern | Limit |
|------|--------------|--------------|---------------|-------|
| **Home** | ✅ Yes | Supabase tags | `service:{slug}` | Per service |
| **About** | ✅ Yes | Supabase queries | Multiple sections (vision, timeline, leadership, board, service) | 10 photos per section |
| **Elders** | ✅ Yes | Supabase + project ID | `project_id='elders-trips'` OR `tags=['project:elders-trips']` | 200 images |
| **Explore** | ✅ Yes | Supabase tags | `service:{slug}` + `hero` | Per service |
| **Impact** | ❌ No | — | — | — |
| **Services** | ✅ Yes | Supabase tags | `service:{slug}` + `hero` | 1 per service (cover photo) |
| **20 Years** | ✅ Yes | API response | `/api/public/history` | Via API |
| **Road to 20** | ❌ No | — | — | No gallery section |
| **Annual Report** | ✅ Yes | Supabase tags | `['annual-report', 'fy:{year}']` with fallback | 18 + 12 (random sample) |
| **Innovation** | ❌ No | — | — | Gradient cards only |

---

## Hardcoded Image/Video URLs Found

Only **1 page** has hardcoded URLs:

### Road to 20 Years (`/road-to-20-years`)
```
/video/road-to-20-years.mp4
/video/road-to-20-years-mobile.mp4
/video/road-to-20-years-poster.jpg
```

**Note:** Innovation page has hardcoded icon paths (`/icons/bespoke-white/{icon}.png`) but these are system assets, not content.

---

## Media File Tag Naming Patterns

### Tags Currently in Use
```
page:elders              # Page context (Elders page)
page_context='about'     # Column value (not tag-based)
service:{slug}          # Service reference (e.g., service:health-services)
project:{slug}          # Project reference (e.g., project:elders-trips)
hero                     # Hero section indicator
annual-report            # Report context tag
fy:{year}               # Fiscal year (e.g., fy:2024-25)
board                    # Board-related content
external-video           # External hosted video (e.g., Descript)
platform:descript        # Platform source indicator
```

### Inconsistency Detected
- **Elders page:** Mixes `page:elders` (tag) with `page_context='about'` (column) — confusing
- **About page:** Uses function parameter `pageContext: 'about'`
- **Services page:** Uses `service:{slug}` pattern consistently ✓
- **Annual Report:** Uses `fy:{year}` for fiscal year filtering ✓

---

## Database Tables & Columns Required

### media_files
```
id                  UUID
public_url         String (the actual asset URL)
file_type          enum: 'image' | 'video'
is_public          boolean
deleted_at         timestamp (soft delete)
tags               JSON array
page_context       String (optional: 'about', 'annual-report', 'impact', etc.)
page_section       String (optional: 'hero', 'vision', 'timeline', etc.)
is_featured        boolean
created_at         timestamp
display_order      integer (for sorting)
project_id         UUID (optional, links to projects table)
story_id           UUID (optional, links to stories table)
```

### profiles
```
id                  UUID
full_name          String
preferred_name     String
profile_image_url  String
is_elder           boolean
show_in_directory  boolean
profile_visibility enum: 'public' | 'private'
```

### leadership
```
id                  UUID
full_name          String
position           String
photo_url          String
leadership_type    enum: 'board' | 'executive'
is_active          boolean
```

---

## API Endpoints

### `/api/public/history`
**Used by:** 20 Years page  
**Returns:** 
```json
{
  "years": [
    {
      "fiscalYear": "2024-25",
      "images": [{ "url": "...", "alt": "..." }],
      ...
    }
  ],
  "eras": [
    {
      "name": "...",
      "images": [{ "url": "...", "alt": "..." }],
      ...
    }
  ]
}
```

---

## Performance Issues

### ⚠️ N+1 Query Problem: Services Page
**File:** `app/(public)/services/page.tsx` lines 58-94

Makes 3 queries per service (if 30 services = 90 queries):
1. Hero photo per service
2. Photo count per service  
3. Video count per service

**Solution:** Batch with `overlaps('tags', allServiceTags)` like Explore page

### ⚠️ Random Sampling: Annual Report Live
**File:** `app/(public)/annual-report/live/page.tsx` line 963-980

Uses `sample()` function for gallery images:
- Gallery rotates randomly on every page load
- Unpredictable user experience
- No featured/priority ordering

**Solution:** Add explicit `display_order`, respect `is_featured` flag, or use consistent `created_at` ordering

---

## What's Missing

### Pages with No Hero
- Homepage
- Explore (map page)
- Impact (client component)
- Services
- 20 Years (client-side API)
- Innovation

### Pages with No Gallery
- Road to 20 Years
- Innovation
- Services (has cover photos per card, not a gallery)

### Hardcoded Content
- Road to 20 Years videos (should be migrated to media_files)

---

## Recommended Next Steps

1. **Migrate** Road to 20 Years videos to `media_files` with tags `['page:road-to-20-years', 'hero', 'video']`
2. **Add** hero image to Impact page via `getHeroImage('impact')`
3. **Add** hero image to Innovation page via `getHeroImage('innovation')`
4. **Fix** Services page N+1 queries with batch tag overlap query
5. **Standardize** tag naming: use `page:{context}` format consistently
6. **Document** media requirements per page in schema migrations
