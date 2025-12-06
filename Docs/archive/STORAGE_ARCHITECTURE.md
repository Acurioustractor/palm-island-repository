# 📦 Supabase Storage Architecture Guide

## 🎯 Complete System Overview

### **The Big Picture: How Photos Flow Through Your System**

```
User Uploads Photo
       ↓
[React Component: StoryImageUpload]
       ↓
1. File selected/dropped
       ↓
2. Upload to Supabase Storage Bucket
   📁 story-images/picc/youth-services/1234567890-story-id.jpg
       ↓
3. Get Public URL
   🔗 https://[project].supabase.co/storage/v1/object/public/story-images/picc/...
       ↓
4. Save metadata to Database
   📊 story_images table (with URL, dimensions, caption, etc.)
       ↓
5. Link to story
   🔗 stories table → story_images table
       ↓
6. Display in Gallery
   🖼️ PhotoGallery component reads from story_images
```

---

## 📂 Storage Structure

### **Two Main Buckets:**

#### 1️⃣ **story-images** (for story photos)
```
story-images/
├── picc/                          ← Organization slug
│   ├── youth-services/            ← Service slug
│   │   ├── 1699123456789-uuid.jpg ← Timestamp + story ID
│   │   ├── 1699123457890-uuid.jpg
│   │   └── 1699123458901-uuid.png
│   ├── cultural-centre/
│   │   └── 1699123459012-uuid.jpg
│   ├── healing-service/
│   ├── family-wellbeing/
│   └── elder-support/
└── other-org/
    └── their-service/
```

#### 2️⃣ **profile-images** (for profile photos)
```
profile-images/
├── picc/
│   ├── roy-prior-profile.jpg
│   ├── uncle-alan-profile.jpg
│   └── ruby-sibley-profile.jpg
└── other-org/
```

---

## 🗄️ Database Tables Explained

### **1. stories table** (existing)
Your main story content

```sql
stories
├── id                  (UUID) - Primary key
├── title               (TEXT) - Story title
├── content             (TEXT) - Story content
├── storyteller_id      (UUID) - Links to profiles
├── organization_id     (UUID) - Links to organizations
├── service_id          (UUID) - Links to organization_services
├── story_image_url     (TEXT) - PRIMARY/FEATURED image URL
└── ...other fields
```

### **2. story_images table** (new - the key table!)
Stores ALL photos for a story with metadata

```sql
story_images
├── id                          (UUID) - Primary key
├── story_id                    (UUID) → stories.id
├── storage_path                (TEXT) - Path in bucket: "picc/youth/file.jpg"
├── public_url                  (TEXT) - Full public URL to display
├── thumbnail_url               (TEXT) - Optional thumbnail
│
├── alt_text                    (TEXT) - For accessibility
├── caption                     (TEXT) - Photo description
├── photographer_name           (TEXT) - Who took it
├── photographer_id             (UUID) → profiles.id
├── photo_location              (TEXT) - Where taken: "Palm Island Beach"
├── photo_date                  (DATE) - When taken
│
├── is_primary                  (BOOL) - Is this the main story image?
├── display_order               (INT) - Order in gallery (0, 1, 2...)
│
├── width                       (INT) - Image dimensions
├── height                      (INT)
├── file_size                   (INT) - In bytes
├── mime_type                   (TEXT) - "image/jpeg"
│
├── cultural_sensitivity_flag   (BOOL) - Sensitive content?
├── requires_elder_approval     (BOOL) - Needs elder review?
├── elder_approved              (BOOL) - Has been approved?
│
├── uploaded_at                 (TIMESTAMP) - When uploaded
├── uploaded_by                 (UUID) → profiles.id
└── metadata                    (JSONB) - Extra data
```

---

## 🔄 Complete Upload Flow (Step by Step)

### **User Action: Upload Photo**

```tsx
// 1. User drags/drops photo in StoryImageUpload component
<StoryImageUpload 
  storyId="abc-123"
  organizationSlug="picc"
  serviceSlug="youth-services"
/>
```

### **What Happens Behind the Scenes:**

#### **Step 1: File Processing**
```javascript
// Component gets the file
const file = event.dataTransfer.files[0]
// file.name: "youth-event-2024.jpg"
// file.size: 2458672 bytes
// file.type: "image/jpeg"
```

#### **Step 2: Upload to Storage**
```javascript
// Generate unique path
const fileName = `picc/youth-services/1699123456789-abc-123.jpg`
                  ↑     ↑              ↑            ↑
               org   service      timestamp    story ID

// Upload to Supabase Storage
await supabase.storage
  .from('story-images')
  .upload(fileName, file)

// Result: File now lives at:
// https://[project].supabase.co/storage/v1/object/public/story-images/picc/youth-services/1699123456789-abc-123.jpg
```

#### **Step 3: Get Dimensions**
```javascript
// Read image to get width/height
const img = new Image()
img.src = URL.createObjectURL(file)
img.onload = () => {
  // dimensions = { width: 1920, height: 1080 }
}
```

#### **Step 4: Save to Database**
```javascript
// Insert record into story_images table
await supabase.from('story_images').insert({
  story_id: 'abc-123',
  storage_path: 'picc/youth-services/1699123456789-abc-123.jpg',
  public_url: 'https://[project].supabase.co/storage/v1/object/public/...',
  width: 1920,
  height: 1080,
  file_size: 2458672,
  mime_type: 'image/jpeg',
  is_primary: false,  // Not the main image yet
  display_order: 0
})
```

#### **Step 5: Link to Story**
```javascript
// The story_id foreign key automatically links it
// Now when you query the story, you can get all images:

const { data } = await supabase
  .from('stories')
  .select('*, images:story_images(*)')
  .eq('id', 'abc-123')

// Returns:
// {
//   id: 'abc-123',
//   title: 'Youth Leadership',
//   images: [
//     { url: '...', caption: '...', ... },
//     { url: '...', caption: '...', ... }
//   ]
// }
```

---

## 🖼️ How Photos Are Retrieved

### **Query 1: Get All Images for a Story**
```sql
-- Using the helper function
SELECT * FROM get_story_images('story-id-here');

-- Or manually:
SELECT 
  id,
  public_url,
  caption,
  photographer_name,
  is_primary,
  display_order
FROM story_images
WHERE story_id = 'story-id-here'
ORDER BY is_primary DESC, display_order ASC;
```

### **Query 2: Get Stories with Image Counts**
```sql
SELECT 
  s.id,
  s.title,
  COUNT(si.id) as image_count,
  ARRAY_AGG(si.public_url) as all_urls
FROM stories s
LEFT JOIN story_images si ON s.id = si.story_id
WHERE s.organization_id = 'picc-org-id'
GROUP BY s.id;
```

### **Query 3: Get Annual Report with All Photos**
```sql
SELECT 
  ar.title as report_title,
  s.title as story_title,
  si.public_url,
  si.caption,
  p.full_name as storyteller
FROM annual_reports ar
JOIN annual_report_stories ars ON ar.id = ars.report_id
JOIN stories s ON ars.story_id = s.id
JOIN story_images si ON s.id = si.story_id
JOIN profiles p ON s.storyteller_id = p.id
WHERE ar.report_year = 2024
ORDER BY ars.display_order, si.display_order;
```

---

## 🎨 Frontend Display Flow

### **1. Photo Gallery Component Receives Data**
```tsx
// Component receives array of images
const images: GalleryImage[] = [
  {
    id: 'img-1',
    url: 'https://[project].supabase.co/storage/v1/object/public/story-images/picc/youth-services/file.jpg',
    caption: 'Youth leadership program 2024',
    photographer: 'Uncle Alan Palm Island',
    storyTitle: 'Building Youth Leadership',
    storytellerName: 'Roy Prior'
  },
  // ...more images
]

<PhotoGallery images={images} columns={3} />
```

### **2. Gallery Displays Images**
```tsx
// For each image:
<img src={image.url} alt={image.caption} />

// On click: Opens lightbox
<Lightbox image={currentImage} />
```

---

## 🔒 Security & Permissions

### **Storage Policies (already set up)**

```sql
-- Anyone can VIEW images (public bucket)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-images');

-- Only authenticated users can UPLOAD
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'story-images');

-- Users can UPDATE/DELETE their own uploads
CREATE POLICY "Users manage own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'story-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### **Database Row Level Security**

```sql
-- Public can see images for published stories
CREATE POLICY "Public view published story images"
ON story_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM stories
    WHERE stories.id = story_images.story_id
    AND stories.is_public = TRUE
    AND stories.status = 'published'
  )
);
```

---

## 📊 Real Example: Full Journey

### **Scenario: Roy uploads youth program photo**

1. **Upload Action**
   ```typescript
   // Roy clicks upload in admin panel
   <StoryImageUpload 
     storyId="youth-leadership-story-uuid"
     organizationSlug="picc"
     serviceSlug="youth-services"
   />
   ```

2. **File Goes to Storage**
   ```
   Bucket: story-images
   Path: picc/youth-services/1699123456789-youth-leadership-story-uuid.jpg
   URL: https://xyzproject.supabase.co/storage/v1/object/public/story-images/picc/youth-services/1699123456789-youth-leadership-story-uuid.jpg
   ```

3. **Database Record Created**
   ```sql
   INSERT INTO story_images (
     story_id: 'youth-leadership-story-uuid',
     storage_path: 'picc/youth-services/1699123456789-youth-leadership-story-uuid.jpg',
     public_url: 'https://xyzproject.supabase.co/storage/...',
     caption: 'Youth leadership workshop at Palm Island',
     photographer_name: 'Uncle Alan Palm Island',
     photo_location: 'PICC Youth Centre',
     photo_date: '2024-08-15',
     width: 1920,
     height: 1080,
     file_size: 2458672,
     mime_type: 'image/jpeg',
     is_primary: false,
     display_order: 0
   )
   ```

4. **Added to Annual Report**
   ```sql
   -- Report pulls story which includes images
   SELECT * FROM annual_reports
   WHERE report_year = 2024
   -- Includes all story_images linked to stories in report
   ```

5. **Displayed in Gallery**
   ```tsx
   <PhotoGallery images={[
     {
       url: 'https://xyzproject.supabase.co/storage/...',
       caption: 'Youth leadership workshop at Palm Island',
       photographer: 'Uncle Alan Palm Island',
       location: 'PICC Youth Centre',
       storyTitle: 'Building Youth Leadership on Palm Island',
       storytellerName: 'Roy Prior'
     }
   ]} />
   ```

---

## 🔧 Useful Database Queries

### **Check Storage Usage**
```sql
-- See all uploaded files
SELECT 
  name,
  bucket_id,
  owner,
  created_at,
  updated_at,
  last_accessed_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'story-images'
ORDER BY created_at DESC
LIMIT 10;
```

### **Find Orphaned Images**
```sql
-- Images not linked to any story
SELECT * FROM story_images si
WHERE NOT EXISTS (
  SELECT 1 FROM stories s WHERE s.id = si.story_id
);
```

### **Get Storage Stats**
```sql
-- Total images per organization
SELECT 
  o.name,
  COUNT(si.id) as total_images,
  SUM(si.file_size) as total_bytes,
  ROUND(SUM(si.file_size) / 1024.0 / 1024.0, 2) as total_mb
FROM organizations o
JOIN stories s ON o.id = s.organization_id
JOIN story_images si ON s.id = si.story_id
GROUP BY o.id, o.name
ORDER BY total_images DESC;
```

### **Set Primary Image**
```sql
-- Make a specific image the main story image
SELECT set_primary_story_image(
  'story-uuid-here',
  'image-uuid-here'
);

-- This function:
-- 1. Sets all images for story to is_primary = false
-- 2. Sets specified image to is_primary = true
-- 3. Updates stories.story_image_url with the new primary URL
```

---

## 💡 Best Practices

### **✅ DO:**
- Store full resolution images (Supabase handles delivery)
- Add descriptive captions and alt text
- Set photographer credits
- Use `is_primary` to designate main story image
- Use `display_order` for gallery sequence
- Mark culturally sensitive images with flags

### **❌ DON'T:**
- Upload images larger than 10MB (set in bucket)
- Store image data in database (use URLs)
- Forget to set alt text (accessibility!)
- Skip cultural sensitivity flags

---

## 🎯 Quick Reference

| Thing | Where It Lives |
|-------|----------------|
| **Actual image files** | Supabase Storage buckets (`story-images`, `profile-images`) |
| **Image metadata** | Database table `story_images` |
| **Story content** | Database table `stories` |
| **Upload component** | `components/StoryImageUpload.tsx` |
| **Display component** | `components/PhotoGallery.tsx` |
| **Storage path pattern** | `{org}/{service}/{timestamp}-{storyId}.{ext}` |
| **Public URL pattern** | `https://{project}.supabase.co/storage/v1/object/public/story-images/{path}` |

---

**Questions? Check the database with:**
```sql
-- See your setup
SELECT * FROM storage.buckets;
SELECT * FROM story_images LIMIT 5;
SELECT * FROM stories WHERE organization_id = 'picc-id';
```

🎉 **You're all set!**
