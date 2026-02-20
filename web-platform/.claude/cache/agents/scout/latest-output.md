# Media `is_featured` Usage Audit
Generated: 2026-02-20

## Summary

I've audited all media fetching code across the platform to identify how `is_featured` is being used when querying the `media_files` table. Overall, the platform **mostly** prioritizes featured media correctly, but there are **2 critical gaps** in the annual report PDF data layer.

## Key Findings

### ✓ PROPERLY USES `is_featured`

**1. Core Media Utilities (`lib/media/utils.ts`)**

All primary media fetching utilities correctly handle `is_featured`:

- **Line 82-83**: `getFeaturedPageMedia()` filters by `is_featured = true`
- **Line 196**: `getMediaByTags()` orders by `is_featured DESC` first, then `created_at DESC`
- **Line 39-41**: `getPageMedia()` supports optional `featuredOnly` filter

**2. Service Pages**

Service detail pages (`app/(public)/services/[slug]/page.tsx`) properly prioritize featured media:

- **Line 92**: Gallery images ordered by `is_featured DESC, created_at DESC`
- **Line 121**: Service videos ordered by `is_featured DESC`
- **Line 130**: External videos ordered by `is_featured DESC`

**3. Services Index (`app/(public)/services/page.tsx`)**

- **Line 77**: Cover photos ordered by `is_featured DESC, created_at DESC`

**4. Homepage (`app/(public)/page.tsx`)**

- **Line 90**: Service hero images ordered by `is_featured DESC`
- **Line 197**: Gallery photos ordered by `is_featured DESC`
- **Line 210**: Fallback featured photos filtered by `is_featured = true`

**5. About Page (`app/(public)/about/page.tsx`)**

- Uses `getHeroVideo('about')` which internally filters by `is_featured = true` (via `getFeaturedPageMedia`)

**6. Elders Page (`app/(public)/elders/page.tsx`)**

- **Lines 158, 181, 270, 292, 312**: All media queries order by `is_featured DESC`

**7. 20 Years Page (`app/(public)/20-years/page.tsx`)**

- **Lines 14, 25**: Both media queries order by `is_featured DESC`

**8. Live Annual Report Data (`lib/annual-report/fetch-live-report-data.ts`)**

- **Line 146**: Map image ordered by `is_featured DESC, display_order ASC`
- **Line 234**: Story images ordered by `is_featured DESC, created_at DESC`

### ✗ MISSING `is_featured` PRIORITIZATION

**1. Annual Report PDF Data Layer (`lib/annual-report/fetch-report-data.ts`)**

**CRITICAL ISSUE - Lines 260-273**: Cover photo and gallery photos for PDF generation do NOT prioritize `is_featured`:

```typescript
// Line 260-265: Cover photo — NO is_featured ordering
supabase
  .from('media_files')
  .select('storage_url, caption')
  .contains('tags', ['annual-report-cover'])
  .limit(1)
  .maybeSingle(),

// Line 268-273: Gallery photos — ordered by created_at only
supabase
  .from('media_files')
  .select('storage_url, caption')
  .contains('tags', ['annual-report'])
  .order('created_at', { ascending: false })  // ⚠️ Should order by is_featured first
  .limit(6),
```

**Impact**: When generating PDF annual reports, the system picks the most recent photos instead of curated featured photos. This means carefully selected featured images may be ignored in favor of whatever was uploaded last.

**Recommended Fix**:
```typescript
// Cover photo
supabase
  .from('media_files')
  .select('storage_url, caption')
  .contains('tags', ['annual-report-cover'])
  .order('is_featured', { ascending: false })
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle(),

// Gallery photos
supabase
  .from('media_files')
  .select('storage_url, caption')
  .contains('tags', ['annual-report'])
  .order('is_featured', { ascending: false })  // Add this
  .order('created_at', { ascending: false })
  .limit(6),
```

**2. Recent Media Utility (`lib/media/utils.ts`)**

**Line 217-222**: `getRecentMedia()` only orders by `created_at` — this is expected behavior for a "recent" function, so this is NOT a bug.

**3. Search Media Utility (`lib/media/utils.ts`)**

**Line 249-255**: `searchMedia()` only orders by `created_at` — also expected for search results (recency matters more than curation), so NOT a bug.

## File-by-File Breakdown

| File | Line | Query Type | Uses `is_featured`? | Notes |
|------|------|------------|---------------------|-------|
| `lib/media/utils.ts` | 22-64 | `getPageMedia()` | ✓ (optional filter) | Supports `featuredOnly` param |
| `lib/media/utils.ts` | 78-108 | `getFeaturedPageMedia()` | ✓ (filter + order) | Explicitly filters `is_featured = true` |
| `lib/media/utils.ts` | 114-117 | `getHeroImage()` | ✓ (via getFeaturedPageMedia) | Wrapper around getFeaturedPageMedia |
| `lib/media/utils.ts` | 122-124 | `getHeroVideo()` | ✓ (via getFeaturedPageMedia) | Wrapper around getFeaturedPageMedia |
| `lib/media/utils.ts` | 185-208 | `getMediaByTags()` | ✓ (order) | Orders by `is_featured DESC, created_at DESC` |
| `lib/media/utils.ts` | 217-230 | `getRecentMedia()` | ✗ (intentional) | Recency-focused, not curation-focused |
| `lib/media/utils.ts` | 249-263 | `searchMedia()` | ✗ (intentional) | Search results ordered by recency |
| `lib/annual-report/fetch-live-report-data.ts` | 136-150 | `fetchMapImage()` | ✓ (order) | Orders by `is_featured DESC, display_order ASC` |
| `lib/annual-report/fetch-live-report-data.ts` | 227-243 | `fetchStoryImages()` | ✓ (order) | Orders by `is_featured DESC, created_at DESC` |
| `lib/annual-report/fetch-report-data.ts` | 260-265 | Cover photo for PDF | ✗ **BUG** | Should order by `is_featured` first |
| `lib/annual-report/fetch-report-data.ts` | 268-273 | Gallery photos for PDF | ✗ **BUG** | Should order by `is_featured` first |
| `app/(public)/page.tsx` | 84-92 | Service hero images | ✓ (order) | Orders by `is_featured DESC` |
| `app/(public)/page.tsx` | 190-198 | Gallery photos | ✓ (order) | Orders by `is_featured DESC` |
| `app/(public)/page.tsx` | 206-216 | Fallback featured photos | ✓ (filter) | Explicitly filters `is_featured = true` |
| `app/(public)/services/page.tsx` | 71-79 | Service cover photos | ✓ (order) | Orders by `is_featured DESC, created_at DESC` |
| `app/(public)/services/[slug]/page.tsx` | 86-94 | Gallery images | ✓ (order) | Orders by `is_featured DESC, created_at DESC` |
| `app/(public)/services/[slug]/page.tsx` | 116-122 | Service videos | ✓ (order) | Orders by `is_featured DESC` |
| `app/(public)/services/[slug]/page.tsx` | 124-131 | External videos | ✓ (order) | Orders by `is_featured DESC` |
| `app/(public)/about/page.tsx` | 16 | Hero video | ✓ (via utility) | Uses `getHeroVideo()` |
| `app/(public)/about/page.tsx` | 17 | Board portraits | ✓ (via utility) | Uses `getMediaByTags()` |
| `app/(public)/elders/page.tsx` | 158 | Elder videos | ✓ (order) | Orders by `is_featured DESC` |
| `app/(public)/elders/page.tsx` | 181, 270, 292, 312 | Various media | ✓ (order) | All order by `is_featured DESC` |
| `app/(public)/20-years/page.tsx` | 14, 25 | Timeline media | ✓ (order) | Orders by `is_featured DESC` |

## Pattern Analysis

### Consistent Good Patterns

1. **Hero images**: Always use `getHeroImage()` or order by `is_featured DESC`
2. **Service media**: Consistently prioritize featured content
3. **Gallery displays**: Nearly all use `is_featured DESC, created_at DESC` ordering
4. **Utility functions**: Core media utils properly expose featured filtering

### Pattern Deviations

1. **PDF generation layer**: The only place that ignores `is_featured` when it shouldn't
2. **Intentional recency-first**: `getRecentMedia()` and `searchMedia()` intentionally don't use featured — this is correct behavior

## Recommendations

### Immediate Action Required

**Fix `lib/annual-report/fetch-report-data.ts`** (Lines 260-273):

1. Add `order('is_featured', { ascending: false })` to cover photo query
2. Add `order('is_featured', { ascending: false })` to gallery photos query (before `order('created_at')`)

### Future Improvements

1. **Add test coverage**: Verify that all hero/gallery/cover queries prioritize featured media
2. **Create a standard utility**: Consider `getGalleryPhotos(tags[], limit)` that always orders by `is_featured DESC` to prevent future oversights
3. **Document the pattern**: Add comments in code explaining why `is_featured` ordering matters for curated displays

## Code Locations Reference

### Media Utility Functions
- **Primary utils**: `/Users/benknight/Code/Palm Island Reposistory/web-platform/lib/media/utils.ts`
- **Annual report live data**: `/Users/benknight/Code/Palm Island Reposistory/web-platform/lib/annual-report/fetch-live-report-data.ts`
- **Annual report PDF data**: `/Users/benknight/Code/Palm Island Reposistory/web-platform/lib/annual-report/fetch-report-data.ts` ⚠️

### Public Pages
- **Homepage**: `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/page.tsx`
- **Services index**: `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/services/page.tsx`
- **Service detail**: `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/services/[slug]/page.tsx`
- **About**: `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/about/page.tsx`
- **Elders**: `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/elders/page.tsx`
- **20 Years**: `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/20-years/page.tsx`

### Scripts
- **Restore heroes**: `/Users/benknight/Code/Palm Island Reposistory/web-platform/scripts/restore-heroes.ts`
- **Fix CFC hero**: `/Users/benknight/Code/Palm Island Reposistory/web-platform/scripts/fix-cfc-hero.ts`
- **Audit heroes**: `/Users/benknight/Code/Palm Island Reposistory/web-platform/scripts/audit-all-heroes.ts`

## Conclusion

The platform has **excellent is_featured discipline** across public pages and the live annual report viewer. The only significant gap is in the **PDF generation layer** (`fetch-report-data.ts`), where cover and gallery photos are selected by recency instead of curation status. This should be fixed immediately to ensure PDFs showcase the best curated images rather than the most recently uploaded ones.
