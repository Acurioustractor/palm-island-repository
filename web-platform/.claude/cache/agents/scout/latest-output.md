# Codebase Report: Photo and Image Audit
Generated: 2026-02-18

## Summary

No Unsplash or external stock photo URLs were found anywhere in the codebase. The platform is architecturally sound — all dynamic images load from Supabase storage via `public_url` fields. However, there are three categories of issues:

1. **BROKEN REFERENCES** — `/images/placeholder-*.jpg` and `/placeholders/*.jpg` paths are hardcoded but those directories do not exist in `public/`
2. **MISSING FILES** — The `getPlaceholderImage()` utility function defines fallback paths that don't exist on disk
3. **DEMO PAGE** — `/picc/reports/demo/page.tsx` has hardcoded `/images/demo/*.jpg` paths that don't exist
4. **EMPTY ALT TEXT** — Numerous admin/internal pages use `alt=""` on meaningful images (not decorative)

---

## Public Directory — What Actually Exists

### Real PICC Assets (legitimate)
- `public/logo/picc-logo-full.png` — official PICC logo (32KB) — used across the platform
- `public/video/hero-poster.jpg` (197KB) — poster frame for homepage hero video
- `public/video/road-to-20-years-poster.jpg` (141KB) — poster for road-to-20 video

### Video Files (all present)
- `public/video/hero-desktop-web.mp4` (10.1MB) — homepage hero, optimised
- `public/video/hero-desktop.mp4` (61MB) — full quality (not referenced in code)
- `public/video/hero-mobile.mp4` (6.4MB)
- `public/video/road-to-20-years.mp4` (7.3MB)
- `public/video/road-to-20-years-mobile.mp4` (1.2MB)

### Service Icons (all present, custom illustrated)
`public/service-icons/` — 17 PNG files (custom PICC service icons, 191–735KB each)

### Bespoke Icons (all present)
`public/icons/bespoke/` — 42 PNG files (custom illustrated topic icons)

### Cyclone Kirrily (temporary staging folder)
`public/cyclone-kirrily-temp/` — 22 images (Getty, AAP, SBS, QRA sourced — these are THIRD-PARTY IMAGES)
- `getty-sunken-yacht-1.jpg`, `getty-sunken-yacht-2.jpg`
- `getty-tree-damage-1/2/3.jpg`
- `getty-jogger-strand-sunrise.jpg`
- `aap-palm-island-shelter.jpg`
- `sbs-kirrily-aftermath-1/2.jpg`
- `canberra-times-shelter-call.jpg`, `nit-fnq-cyclone-prep.jpg`, `nit-kirrily-coast-crossing.jpg`
- QRA/satellite imagery files
These are labelled "temp" but are still sitting in public/. They are NOT referenced in any .tsx or .ts files — only in upload scripts. They appear to be pre-upload staging files.

### Historical Annual Report Images (extracted from PDFs)
- `public/annual-report-photos/` — hundreds of PNG/JPG frames extracted from legacy PDFs (2009–2024)
- `public/documents/annual-reports/images/` — images extracted per page from 15 years of annual reports
- `public/documents/annual-reports/*.pdf` — 15 PDF files (2009-10 through 2023-24)

### Directories That Do NOT Exist But Are Referenced in Code
- `public/images/` — MISSING (8 broken references in immersive-stories page)
- `public/placeholders/` — MISSING (5 paths defined in lib/media/utils.ts)
- `public/images/demo/` — MISSING (2 references in picc/reports/demo page)

---

## Broken Image References

### CRITICAL — Referenced but files don't exist

| File | Line | Path Referenced | Status |
|------|------|-----------------|--------|
| `app/immersive-stories/photo-studio-journey/page.tsx` | 63 | `/images/placeholder-1.jpg` | BROKEN — dir missing |
| `app/immersive-stories/photo-studio-journey/page.tsx` | 68 | `/images/placeholder-2.jpg` | BROKEN |
| `app/immersive-stories/photo-studio-journey/page.tsx` | 73 | `/images/placeholder-3.jpg` | BROKEN |
| `app/immersive-stories/photo-studio-journey/page.tsx` | 78 | `/images/placeholder-4.jpg` | BROKEN |
| `app/immersive-stories/photo-studio-journey/page.tsx` | 83 | `/images/placeholder-5.jpg` | BROKEN |
| `app/immersive-stories/photo-studio-journey/page.tsx` | 88 | `/images/placeholder-6.jpg` | BROKEN |
| `app/immersive-stories/photo-studio-journey/page.tsx` | 111 | `/images/hero-placeholder.jpg` | BROKEN |
| `app/immersive-stories/photo-studio-journey/page.tsx` | 157 | `/images/landscape-placeholder.jpg` | BROKEN |
| `app/immersive-stories/photo-studio-journey/page.tsx` | 176 | `/images/meeting-placeholder.jpg` | BROKEN |
| `app/immersive-stories/photo-studio-journey/page.tsx` | 211 | `/images/equipment-placeholder.jpg` | BROKEN |
| `app/immersive-stories/photo-studio-journey/page.tsx` | 221 | `/images/family-placeholder.jpg` | BROKEN |
| `app/immersive-stories/photo-studio-journey/page.tsx` | 302 | `/images/sunset-placeholder.jpg` | BROKEN |
| `app/picc/reports/demo/page.tsx` | 77 | `/images/demo/language-class.jpg` | BROKEN — dir missing |
| `app/picc/reports/demo/page.tsx` | 107 | `/images/demo/youth-leadership.jpg` | BROKEN |

### POTENTIAL ISSUE — Fallback utility with non-existent paths

`lib/media/utils.ts` lines 297–303 defines `getPlaceholderImage()` returning:
- `/placeholders/hero-placeholder.jpg`
- `/placeholders/person-placeholder.jpg`
- `/placeholders/service-placeholder.jpg`
- `/placeholders/history-placeholder.jpg`
- `/placeholders/default-placeholder.jpg`

None of these paths exist in `public/`. However `getPlaceholderImage()` is never actually called anywhere (only defined). This is dead code but could cause issues if called in future.

---

## Image Source Classification — Public-Facing Pages

All public-facing pages (`app/(public)/`) use dynamic images from Supabase. No hardcoded image paths on production pages.

### Homepage (`app/(public)/HomePageClient.tsx` + `page-new.tsx`)
- Hero video: `/video/hero-desktop-web.mp4` + `/video/hero-mobile.mp4` — REAL PICC VIDEO
- Hero poster: `/video/hero-poster.jpg` — REAL PICC photo
- All gallery/feature images: loaded via `getHeroImage()`, `getPageMedia()`, `getFeaturedPageMedia()` — dynamic from Supabase
- Pattern: graceful null handling when images not set

### About Page (`app/(public)/about/page.tsx`)
- Hero: `getHeroImage("about")` — dynamic from Supabase
- CEO/Chair photos: `rachelPhoto.public_url` — dynamic from Supabase
- Service photos, timeline photos, testimonial photos — all dynamic

### Annual Report 2024-25 (`app/(public)/annual-report/2024-25/`)
- Hero: `getHeroImage('annual-report')` — dynamic
- CEO photo: `media.ceoPhotoUrl` — dynamic
- Chair photo: `media.chairPhotoUrl` — dynamic
- Fallback: `/video/hero-desktop-web.mp4` if no Supabase video found

### 20 Years Page (`app/(public)/20-years/page.tsx`)
- Images fetched from `/api/public/history` — dynamic, pulls `public_url` from Supabase media table

### Road to 20 Years (`app/(public)/road-to-20-years/page.tsx`)
- Video: `/video/road-to-20-years.mp4` — REAL PICC VIDEO (exists)
- Poster: `/video/road-to-20-years-poster.jpg` — REAL (exists)

### Stories Pages
- All story images loaded dynamically via `getMediaUrl()`, storyteller `profile_image_url`, `featured_image_url`

### Services Page (`app/(public)/services/page.tsx`)
- Service covers from `cover_photo.public_url` — dynamic from Supabase

---

## No Unsplash / No Stock Photos

Confirmed: zero references to:
- `unsplash.com`
- `picsum.photos`
- `loremflickr.com`
- `via.placeholder.com`
- `placehold.it`
- Any other stock photo service

---

## Empty Alt Text (`alt=""`) — Admin/Internal Pages

These pages are internal-only but still have accessibility issues:

| File | Count | Context |
|------|-------|---------|
| `app/picc/storytellers/page.tsx` | 3 | Profile image thumbnails |
| `app/picc/stories/page.tsx` | 2 | Story featured image thumbnails |
| `app/picc/stories/[id]/edit/page.tsx` | 3 | Media picker thumbnails |
| `app/picc/media/smart-folders/page.tsx` | 2 | Media gallery thumbnails |
| `app/picc/annual-reports/[id]/images/page.tsx` | 1 | Image picker |
| `components/admin/MediaPickerDialog.tsx` | 1 | Media picker |
| `components/elders/EldersPageClient.tsx` | 3 | Profile/hero images |
| `components/elders/ImageLightbox.tsx` | 1 | Lightbox image |
| `components/report/PhotoGallery.tsx` | 1 | Gallery images |
| `components/service-admin/ContentMediaTab.tsx` | 2 | Story/cover thumbnails |
| `components/service-admin/PeoplePartnersTab.tsx` | 1 | Partner logo |
| `components/innovation-admin/InnovationAdminDetail.tsx` | 2 | Story thumbnails |

Note: `components/ui/BespokeIcon.tsx` uses `alt=""` intentionally — bespoke icons are decorative.

---

## Third-Party Images Requiring Attention

### `public/cyclone-kirrily-temp/` — Licensing Risk
22 images with Getty, AAP, SBS, NIT, Canberra Times prefixes in filenames. These appear to be sourced from news outlets and stock agencies. They are NOT currently referenced in any page code — only in upload scripts. However they are in `public/` meaning they are served if accessed directly.

Recommendation: Either confirm licensing or remove this directory. The "temp" label suggests they were never meant to persist.

---

## Next.js Image Config

`next.config.js` allows remote images only from `*.supabase.co` storage paths. No other external image domains are whitelisted, which is correct and safe.

---

## Supabase-Stored Images (Dynamic)

The platform loads real PICC photos via these patterns:
- `media.public_url` — Supabase storage URLs from `media_files` table
- `storyteller.profile_image_url` — from `storytellers` table
- `member.photo_url` — from board member records
- `cover_photo.public_url` — from service cover photos
- `project.hero_image_url` — from innovation projects

All these URLs resolve to `https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/...`

---

## Summary Table

| Category | Count | Status |
|----------|-------|--------|
| Unsplash / stock photo URLs | 0 | Clean |
| Broken /images/ references | 14 | NEEDS FIX (immersive-stories + demo page) |
| Missing /placeholders/ fallback files | 5 defined | Dead code, not called |
| Third-party images in public/ | 22 files | Licensing review needed (cyclone-kirrily-temp) |
| Empty alt text (admin pages) | ~20 instances | Accessibility issue |
| Real PICC videos in public/ | 5 files | All present and referenced |
| Legitimate static assets (logo, icons, service icons) | 60+ files | All present and correct |
| Dynamic Supabase images (public pages) | All | Properly loaded, null-safe |
