# Content Management Guide
## Adding Stories, Projects, and Updates to Palm Island Community Repository

---

## Part 1: Adding Stories

### Method 1: Share Your Voice (Recommended for New Stories)

**Best for:** New community stories, voice recordings, video submissions

1. **Access the form:**
   - Public: http://localhost:3000/share-voice
   - From PICC: Click "Add New Story" in sidebar

2. **Choose format:**
   - **Write:** Type your story
   - **Record Voice:** Record audio (requires microphone permission)
   - **Record Video:** Upload video file

3. **Fill in details:**
   - Title
   - Story content
   - Category (Community Event, Personal Story, etc.)
   - Optional: Add your name (or stay anonymous → Community Voice)
   - Check cultural protocols consent

4. **Submit:**
   - Story goes to `status='submitted'`
   - Appears in PICC Dashboard under "Pending Review"
   - Staff can approve from `/picc/admin/storytellers`

### Method 2: Direct Database Insert (For Bulk/Historical Stories)

**Best for:** Migrating existing stories, bulk uploads, historical content

```sql
-- Insert a story directly
INSERT INTO stories (
  storyteller_id,
  title,
  content,
  category,
  story_type,
  status,
  access_level,
  is_public,
  created_at
) VALUES (
  '9adbdb0b-20bb-466d-abe6-7de1a36addb7', -- Community Voice ID
  'Story Title Here',
  'Full story content goes here...',
  'community',
  'community_story',
  'published',
  'public',
  TRUE,
  NOW()
);
```

### Method 3: CSV Import Script (Coming in Phase 2)

**Best for:** Large batches of stories from spreadsheets

---

## Part 2: Managing Innovation Projects

### Quick Start: Add Your First Project

#### Step 1: Run the Database Migration

```bash
# In Supabase SQL Editor
# Copy and paste from: lib/empathy-ledger/projects-schema.sql
```

#### Step 2: Create a Project

```sql
INSERT INTO projects (
  name,
  slug,
  tagline,
  description,
  status,
  project_type,
  start_date,
  is_public,
  featured,
  created_at
) VALUES
(
  'Palm Island Photo Studio',
  'photo-studio',
  'On-Country professional photography and visual storytelling',
  'A professional photography studio on Palm Island enabling community members to document their stories, culture, and achievements without leaving Country. Provides professional equipment, training, and support for visual storytelling.',
  'in_progress',
  'innovation',
  '2024-01-01',
  TRUE,
  TRUE,
  NOW()
),
(
  'The Station',
  'the-station',
  'Community hub and cultural space',
  'A multi-purpose community facility serving as a gathering space, cultural center, and service delivery point. The Station brings services to the community in a welcoming, culturally safe environment.',
  'planning',
  'infrastructure',
  '2024-06-01',
  TRUE,
  TRUE,
  NOW()
),
(
  'Elders Cultural Trips',
  'elders-trips',
  'Connecting elders to Country and preserving knowledge',
  'Regular trips taking elders back to traditional sites and Country. Combines cultural preservation, intergenerational knowledge transfer, and elder wellbeing. Stories and knowledge captured during trips.',
  'in_progress',
  'cultural',
  '2023-01-01',
  TRUE,
  TRUE,
  NOW()
),
(
  'On-Country Server',
  'on-country-server',
  'Data sovereignty through local infrastructure',
  'Local server infrastructure hosted on Palm Island, ensuring data sovereignty and reducing dependence on external cloud services. Stores stories, media, and community data locally.',
  'in_progress',
  'innovation',
  '2024-03-01',
  TRUE,
  TRUE,
  NOW()
),
(
  'Annual Report System',
  'annual-report',
  'Automated annual reporting from community stories',
  'System to generate annual impact reports directly from community stories and data, eliminating need for external consultants. Saves $40k-115k annually while maintaining community control.',
  'planning',
  'innovation',
  '2024-09-01',
  TRUE,
  FALSE,
  NOW()
);
```

#### Step 3: Add Project Updates (Blog-style)

```sql
-- Get the project ID first
SELECT id, name FROM projects WHERE slug = 'photo-studio';

-- Add an update
INSERT INTO project_updates (
  project_id,
  author_id,
  title,
  content,
  excerpt,
  update_type,
  is_published,
  published_at
) VALUES (
  '<project-id-here>',
  '<your-profile-id>',
  'Photo Studio Equipment Arrives!',
  'We''re excited to announce that our professional photography equipment has arrived on Palm Island. The studio now features:\n\n- Professional DSLR cameras\n- Studio lighting setup\n- Green screen for creative projects\n- Editing workstation\n\nCommunity members can now book sessions to capture professional photos for:\n- Family portraits\n- Cultural events\n- Business headshots\n- Story documentation\n\nBookings open next week!',
  'Professional photography equipment has arrived, studio bookings opening soon',
  'milestone',
  TRUE,
  NOW()
);
```

#### Step 4: Add Project Media

```sql
-- Upload photos to Supabase Storage first, then record them

INSERT INTO project_media (
  project_id,
  media_type,
  file_name,
  file_path,
  supabase_bucket,
  title,
  description,
  caption,
  is_featured
) VALUES (
  '<project-id-here>',
  'photo',
  'studio-setup.jpg',
  'project-media/photo-studio/studio-setup.jpg',
  'project-media',
  'Photo Studio Setup',
  'The new photography studio setup with professional lighting',
  'Studio ready for community bookings',
  TRUE
);
```

---

## Part 3: Uploading Media

### Photos

1. **Via Supabase Dashboard:**
   - Go to Storage → Create bucket `project-media`
   - Upload files manually
   - Copy public URL

2. **Via Code (coming soon):**
   - `/picc/media/upload` page
   - Drag and drop interface

3. **Organize by project:**
   ```
   project-media/
     photo-studio/
       equipment/
       events/
       portraits/
     the-station/
       construction/
       community-events/
     elders-trips/
       2024-march/
       2024-june/
   ```

### Videos

- Same process as photos
- Store in `project-media` bucket
- Recommended: Compress before upload
- Alternative: Link to YouTube/Vimeo for large files

---

## Part 4: Best Practices

### Content Strategy

**Stories:**
- Aim for 5-10 new stories per month
- Mix of story types (personal, community events, achievements)
- Use Community Voice for anonymous submissions
- Always include cultural protocols

**Projects:**
- Update each project monthly minimum
- Add photos/videos with each update
- Document milestones as they happen
- Share challenges and successes equally

### SEO & Discovery

- Use descriptive titles
- Add relevant tags
- Include location/date information
- Write compelling excerpts

### Media Guidelines

**Photos:**
- Minimum 1200px width
- JPG format, compressed
- Always add alt text
- Get consent for faces

**Videos:**
- Max 100MB per file (or use YouTube)
- MP4 format
- Add captions/subtitles
- Include transcripts for accessibility

---

## Part 5: Quick Reference

### Common Database Queries

**Count stories by status:**
```sql
SELECT status, COUNT(*)
FROM stories
GROUP BY status;
```

**Find Community Voice stories:**
```sql
SELECT id, title, created_at
FROM stories
WHERE storyteller_id = '9adbdb0b-20bb-466d-abe6-7de1a36addb7'
ORDER BY created_at DESC
LIMIT 10;
```

**Get project with latest update:**
```sql
SELECT
  p.name,
  p.status,
  u.title as latest_update,
  u.published_at
FROM projects p
LEFT JOIN project_updates u ON u.project_id = p.id
WHERE p.slug = 'photo-studio'
AND u.is_published = TRUE
ORDER BY u.published_at DESC
LIMIT 1;
```

**List all active projects:**
```sql
SELECT
  name,
  status,
  start_date,
  (SELECT COUNT(*) FROM project_updates WHERE project_id = projects.id) as update_count
FROM projects
WHERE status IN ('planning', 'in_progress')
ORDER BY featured DESC, name;
```

---

## Part 6: Workflow Examples

### Example 1: Document a Community Event

1. Take photos at event
2. Upload to `project-media/events/`
3. Create story via Share Your Voice
4. Link photos in story
5. If related to project, add project update
6. Publish to public site

### Example 2: Monthly Project Update

1. Draft update in notes
2. Take progress photos
3. Upload photos to Storage
4. Insert project_update with SQL
5. Link photos with project_media
6. Set `is_published = TRUE`
7. Share on social media

### Example 3: Launch New Innovation

1. Create project in database
2. Write comprehensive description
3. Upload hero image and logo
4. Create launch announcement update
5. Set `featured = TRUE`
6. Promote on home page

---

## Part 7: Troubleshooting

**Stories showing 0 on pages:**
- Check `is_public = TRUE`
- Check `status = 'published'`
- Check `access_level = 'public'`

**Photos not displaying:**
- Verify bucket permissions (public read)
- Check file_path is correct
- Confirm file uploaded successfully

**Project not appearing:**
- Verify `is_public = TRUE`
- Check slug is unique
- Confirm no typos in foreign keys

---

## Next Steps

1. Run the projects schema migration
2. Add your first 3-5 projects
3. Create at least one update per project
4. Upload 3-5 photos per project
5. Test everything on `/picc/projects` (coming next)

---

## Need Help?

- Check `/picc/database` for table statistics
- Run `npm run review-db` to audit content
- Use Supabase Dashboard → Table Editor for visual editing
