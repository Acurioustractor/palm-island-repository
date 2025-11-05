# Empathy Ledger Complete Setup Guide
## Palm Island Community Company Implementation

---

## 🎯 **THE VISION**

The **Empathy Ledger** is your central hub where:
1. **PICC Organization** manages all community activities
2. **16 Services** (Health, Youth, Family, etc.) operate
3. **Projects** track specific initiatives (Storm Recovery, Digital Services, etc.)
4. **Storytellers** (community members) share their experiences
5. **Stories** are uploaded with **photos, videos, and audio**
6. **Everything connects** to show the complete picture

---

## 📐 **CURRENT ARCHITECTURE**

```
EMPATHY LEDGER
    ↓
ORGANIZATIONS (PICC)
    ├── Organization Services (16 services)
    │   ├── Bwgcolman Healing Service
    │   ├── Youth Services
    │   ├── Family Wellbeing Centre
    │   ├── Elder Support Services
    │   ├── Cultural Centre
    │   ├── Rangers Program
    │   ├── Digital Service Centre
    │   ├── Economic Development
    │   ├── Housing Services
    │   ├── Community Justice
    │   ├── Women's Services
    │   ├── Men's Programs
    │   ├── Food Security
    │   ├── Sports & Recreation
    │   ├── Transport Services
    │   └── Early Learning Centre
    │
    ├── Organization Members (storytellers linked to services)
    │   ├── Roy Prior (Youth Services Coordinator)
    │   ├── Uncle Alan (Elder, Cultural Advisor)
    │   ├── Uncle Frank (Cultural Advisor)
    │   ├── Ruby Sibley (Women's Services)
    │   ├── Ferdys (Family Wellbeing Staff)
    │   └── Goonyun Anderson (Cultural Centre)
    │
    ├── Projects (specific initiatives)
    │   ├── Storm Recovery 2024
    │   ├── Youth Digital Futures
    │   ├── Storytelling Sovereignty
    │   └── Cultural Heritage Living Centre
    │
    └── Stories (31 currently, growing)
        ├── Linked to: Organization + Service + Project + Storyteller
        ├── Content: Title, summary, full story
        ├── Categories: Health, Youth, Culture, Family, etc.
        ├── Emotional Themes: Hope, Pride, Connection, Resilience
        └── Media: Photos, Videos, Audio (via Supabase Storage)
            ↓
        Story Media
            ├── story-images bucket
            ├── story-videos bucket
            ├── story-audio bucket
            └── profile-photos bucket
```

---

## 🚀 **STEP-BY-STEP DEPLOYMENT**

### **Phase 1: Verify Current Database**

1. **Go to Supabase Dashboard**
   - URL: `https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb`
   - Navigate to: **SQL Editor**

2. **Run the Status Check**
   - Open: `web-platform/CHECK_DATABASE_STATUS.sql`
   - Copy entire contents
   - Paste into Supabase SQL Editor
   - Click **Run**

3. **Review Results**
   You should see something like:
   ```
   ✅ profiles table exists (35 rows)
   ✅ stories table exists (31 rows)
   ✅ organizations table exists (1 row)
   ✅ organization_services table exists (16 rows)
   ✅ organization_members table exists (6 rows)
   ⚠ projects table NOT YET CREATED
   ✅ story_media table exists (0 rows)
   ```

---

### **Phase 2: Deploy Missing Tables**

**If organizations/services tables are MISSING:**

1. **Run Organizations Migration**
   - File: `web-platform/lib/empathy-ledger/migrations/03_organizations_and_annual_reports.sql`
   - Copy entire file
   - Paste into Supabase SQL Editor
   - Click **Run**

2. **Setup PICC Organization**
   - File: `web-platform/picc_complete_setup.sql`
   - This creates:
     - PICC organization record
     - 16 services
     - Links storytellers to PICC

3. **Add Projects Table**
   - Copy from: `DEPLOY_EMPATHY_LEDGER_COMPLETE.md` (Step 6)
   - Creates projects table
   - Adds `project_id`, `organization_id`, `service_id` to stories

4. **Link Existing Stories**
   - Run Step 7 from `DEPLOY_EMPATHY_LEDGER_COMPLETE.md`
   - Links all 31 stories to PICC
   - Maps stories to appropriate services

5. **Setup Storage Buckets**
   - File: `web-platform/setup_image_storage.sql`
   - Creates:
     - `story-images`
     - `story-videos`
     - `story-audio`
     - `profile-photos`
     - `organization-assets`

---

### **Phase 3: Update Frontend**

**Now update the code to USE these connections:**

#### **A. Stories Gallery** (`app/stories/page.tsx`)

Add organization and service info to each story card:

```typescript
// Fetch stories WITH organization and service data
const { data, error } = await supabase
  .from('stories')
  .select(`
    *,
    storyteller:storyteller_id (full_name, preferred_name),
    organization:organization_id (name, short_name, logo_url),
    service:service_id (service_name, service_color, icon_name),
    project:project_id (name)
  `)
  .eq('is_public', true)
  .order('created_at', { ascending: false });
```

Display in cards:
```tsx
<div className="flex items-center gap-2 mb-2">
  {story.organization && (
    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
      {story.organization.short_name || story.organization.name}
    </span>
  )}
  {story.service && (
    <span className="text-xs px-2 py-1 rounded"
          style={{ backgroundColor: story.service.service_color + '20' }}>
      {story.service.service_name}
    </span>
  )}
  {story.project && (
    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
      📋 {story.project.name}
    </span>
  )}
</div>
```

#### **B. Story Detail Page** (`app/stories/[id]/page.tsx`)

Show full context:
```tsx
// In the hero section
<div className="mb-6">
  <div className="text-sm text-gray-600 mb-2">
    Part of: <strong>{story.organization.name}</strong>
  </div>
  {story.service && (
    <div className="text-sm text-gray-600 mb-2">
      Service: <strong>{story.service.service_name}</strong>
    </div>
  )}
  {story.project && (
    <div className="text-sm text-gray-600">
      Project: <strong>{story.project.name}</strong>
    </div>
  )}
</div>
```

#### **C. Add Media Display**

```tsx
// Fetch media for the story
const { data: media } = await supabase
  .from('story_media')
  .select('*')
  .eq('story_id', storyId)
  .order('display_order');

// Display images
{media?.filter(m => m.media_type === 'photo').map(photo => (
  <img
    key={photo.id}
    src={`${supabaseUrl}/storage/v1/object/public/${photo.supabase_bucket}/${photo.file_path}`}
    alt={photo.alt_text}
    className="rounded-lg shadow-lg"
  />
))}

// Display videos
{media?.filter(m => m.media_type === 'video').map(video => (
  <video
    key={video.id}
    controls
    className="rounded-lg shadow-lg w-full"
    src={`${supabaseUrl}/storage/v1/object/public/${photo.supabase_bucket}/${video.file_path}`}
  />
))}
```

---

### **Phase 4: Enable Photo/Video Upload**

#### **A. Create Upload Component**

File: `components/StoryMediaUpload.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X } from 'lucide-react';

export default function StoryMediaUpload({ storyId }: { storyId: string }) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const uploadMedia = async (file: File) => {
    const supabase = createClient();

    // Determine bucket based on file type
    const bucket = file.type.startsWith('image/') ? 'story-images'
      : file.type.startsWith('video/') ? 'story-videos'
      : 'story-audio';

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${storyId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create story_media record
    const { error: dbError } = await supabase
      .from('story_media')
      .insert({
        story_id: storyId,
        media_type: file.type.startsWith('image/') ? 'photo' :
                   file.type.startsWith('video/') ? 'video' : 'audio',
        file_path: fileName,
        supabase_bucket: bucket,
        file_name: file.name,
        file_size: file.size
      });

    if (dbError) throw dbError;

    return uploadData;
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      await Promise.all(files.map(file => uploadMedia(file)));
      alert('Media uploaded successfully!');
      setFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <input
        type="file"
        multiple
        accept="image/*,video/*,audio/*"
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
        className="mb-4"
      />

      {files.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Selected files:</h4>
          <ul className="text-sm text-gray-600">
            {files.map((f, i) => (
              <li key={i}>{f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Media'}
      </button>
    </div>
  );
}
```

#### **B. Add to Story Submission**

In `app/stories/submit/page.tsx`, add after story is created:

```tsx
{submitted && storyId && (
  <StoryMediaUpload storyId={storyId} />
)}
```

---

## 🎯 **FINAL RESULT**

### **What Users Will See:**

#### **Homepage** (`http://localhost:3002`)
- Big "Community Stories" button
- Shows story count: "31 stories of resilience"
- Links to stories gallery

#### **Stories Gallery** (`/stories`)
- Grid of story cards
- Each card shows:
  - ✓ Title and summary
  - ✓ Storyteller name
  - ✓ **PICC badge**
  - ✓ **Service tag** (e.g., "Youth Services" in blue)
  - ✓ **Project tag** (e.g., "📋 Storm Recovery 2024")
  - ✓ Emotional theme (Hope, Pride, Connection, Resilience)
  - ✓ **Thumbnail image** (when uploaded)
- Filter by: Category, Service, Project, Emotional Theme
- Search stories

#### **Individual Story** (`/stories/[id]`)
- **Full hero section** with:
  - Organization: "Palm Island Community Company"
  - Service: "Youth Services" (color-coded)
  - Project: "Digital Futures Initiative"
  - Storyteller: Roy Prior (Youth Services Coordinator)
  - Date and location
- **Full story content** with rich typography
- **Photo gallery** (when uploaded)
- **Video player** (when uploaded)
- **Audio clips** (when uploaded)
- **Storyteller bio** with their role in PICC
- **Share buttons**

#### **Story Submission** (`/stories/submit`)
- Form with:
  - Title, summary, full story
  - Category selection
  - Emotional theme selection
  - **Photo upload** (multiple files)
  - **Video upload**
  - **Audio recording/upload**
- Auto-links to PICC organization
- Auto-assigns to appropriate service
- Option to link to existing project

---

## 📊 **THE EMPATHY LEDGER DIFFERENCE**

### **Before** (Generic Story Platform):
```
Story
  └── Author
  └── Date
  └── Content
```

### **After** (Empathy Ledger):
```
Story
  ├── Organization (PICC)
  ├── Service (Youth Services)
  ├── Project (Storm Recovery 2024)
  ├── Storyteller (Roy Prior - Youth Coordinator)
  ├── Emotional Theme (Hope & Aspiration)
  ├── Impact Category (Youth Development)
  ├── Cultural Protocols (Elder approval status)
  ├── Media (Photos, Videos, Audio)
  └── Connected Stories (Related impact patterns)
```

This creates a **CONNECTED WEB OF IMPACT** where:
- Every story contributes to PICC's impact measurement
- Services can see their stories and outcomes
- Projects track their community narratives
- Annual reports auto-generate from this data
- Patterns emerge showing what works

---

## ✅ **VERIFICATION CHECKLIST**

Run through this checklist to ensure everything is working:

- [ ] Run `CHECK_DATABASE_STATUS.sql` - All tables exist
- [ ] PICC organization exists with 16 services
- [ ] All 31 stories linked to PICC
- [ ] Stories mapped to appropriate services
- [ ] Storage buckets created
- [ ] Frontend shows PICC context on stories
- [ ] Frontend shows service tags
- [ ] Frontend shows project links
- [ ] Photo upload works
- [ ] Video upload works
- [ ] Photos display on story pages
- [ ] Videos play on story pages

---

## 🎬 **NEXT: BUILD THE ORG DASHBOARD**

Create: `app/organization/[orgId]/page.tsx`

Show:
- PICC overview
- 16 services with story counts
- Projects list
- Storytellers directory
- Impact metrics dashboard
- Annual report preview

This becomes the **command center** for PICC staff!

---

## 📞 **SUPPORT**

If you get stuck:
1. Check `DEPLOY_EMPATHY_LEDGER_COMPLETE.md` for detailed SQL
2. Run `CHECK_DATABASE_STATUS.sql` to diagnose issues
3. All files are in: `web-platform/`
4. Supabase dashboard: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb
