# Story Builder Setup Guide

## Supabase Setup Required

The visual story builder needs a few things set up in Supabase before it can work.

### 1. Run Database Migrations

Execute these SQL files in Supabase SQL Editor (in order):

```bash
# 1. Projects schema (if not already done)
web-platform/lib/empathy-ledger/projects-schema.sql

# 2. Story builder schema
web-platform/lib/empathy-ledger/story-builder-schema.sql
```

### 2. Create Storage Bucket

In Supabase Dashboard → Storage:

1. Click "New bucket"
2. Name: `story-media`
3. **Public bucket**: ✅ YES (check this box)
4. File size limit: 50MB
5. Allowed MIME types: Leave empty (allow all)
6. Click "Create bucket"

### 3. Set Storage Policies

After creating the bucket, add these policies:

**Allow authenticated users to upload:**
```sql
CREATE POLICY "Authenticated users can upload story media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'story-media');
```

**Allow anyone to view published media:**
```sql
CREATE POLICY "Anyone can view story media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'story-media');
```

**Allow authenticated users to delete their uploads:**
```sql
CREATE POLICY "Authenticated users can delete story media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'story-media');
```

### 4. Verify Setup

Test the setup:

1. Navigate to a project: `/picc/projects/photo-studio`
2. Click "Build Immersive Story" in Quick Actions
3. Try uploading a test image in Hero Media
4. If upload works → Storage is configured correctly! ✅

### 5. Usage Flow

**Building a Story:**
1. Go to project page
2. Click "Build Immersive Story"
3. Enter title and subtitle
4. Upload hero image or video
5. Add sections (text, quotes, gallery, timeline, etc.)
6. Click each section to edit it
7. Upload images/videos directly in the editor
8. Drag sections to reorder
9. Click "Save Story"
10. Click "Preview" to see the live story

**Viewing a Story:**
- Saved stories appear at: `/stories/[project-slug]-story`
- Example: `/stories/photo-studio-story`
- Click "View Immersive Story" card on project page

## Features

### Media Upload
- Drag & drop or click to upload
- Supports images (JPG, PNG, GIF) and videos (MP4, MOV)
- 50MB file size limit
- Auto-preview
- Stored in Supabase Storage

### Section Types

1. **Text Section**
   - Title (optional)
   - Multi-paragraph content
   - Perfect for narrative

2. **Quote Section**
   - Quote text
   - Author name
   - Role/title
   - Large, impactful display

3. **Side by Side**
   - Image or video
   - Text content
   - Choose media position (left/right)

4. **Video Section**
   - Upload video
   - Optional title and caption
   - Video controls

5. **Full Bleed Image**
   - Full-width impactful image
   - Alt text for accessibility
   - Optional caption
   - Parallax effect

6. **Gallery**
   - Multiple images
   - Captions for each
   - Responsive grid (3 columns)

7. **Timeline**
   - Add multiple events
   - Date, title, description
   - Mark complete/incomplete
   - Visual timeline display

8. **Parallax**
   - Background image
   - Text overlay
   - Optional subtitle
   - Scroll effect

### Section Management
- ✅ Add unlimited sections
- ✅ Edit any section
- ✅ Reorder with up/down buttons
- ✅ Delete sections
- ✅ Preview in real-time

### Save & Publish
- ✅ Auto-save to database
- ✅ Load existing stories
- ✅ Edit and update
- ✅ Preview before publishing

## Database Schema

**Main Tables:**
- `immersive_stories` - Story metadata
- `story_sections` - Individual sections
- `story_timeline_events` - Timeline event data
- `story_gallery_images` - Gallery image collections

**All data auto-saved** - No manual SQL needed!

## Troubleshooting

### Upload Fails
- Check storage bucket exists and is public
- Verify storage policies are set
- Check file size < 50MB
- Ensure user is authenticated

### Story Doesn't Appear
- Click "Save Story" before previewing
- Check story slug matches URL pattern
- Verify database migration ran successfully

### Sections Not Showing
- Make sure section has content
- Check media URLs are accessible
- Verify section order is correct

## Next Steps

After setup:
1. Build your first story
2. Test all section types
3. Upload real photos/videos
4. Preview and refine
5. Share the story URL!

## Support

The visual builder is now fully functional! If you encounter issues:
1. Check this setup guide
2. Verify database migrations
3. Test storage bucket access
4. Check browser console for errors
