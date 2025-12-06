# Media Systems Integration Plan
## Linking PICC Media Library with Public Website Pages

---

## 🎯 **The Complete Picture**

You have **TWO powerful systems** that need to work together:

### **System 1: PICC Media Library** (`/app/picc/media/`)
✅ **~1000 photos already uploaded**
- **Main hub:** `/picc/media/` - Media Library dashboard
- **Gallery:** `/picc/media/gallery/` - Browse all ~1000 photos
- **Collections:** `/picc/media/collections/` - Manual photo albums
- **Smart Folders:** `/picc/media/smart-folders/` - Auto-updating dynamic collections
- **Upload:** `/picc/media/upload/` - Single photo upload
- **Bulk Upload:** `/picc/media/upload-bulk/` - Multiple photos at once

**Database Tables:**
- `media_files` - Main table with ALL media
- `photo_collections` - Manual collections
- `collection_items` - Photos in collections
- `smart_folders` - Dynamic auto-updating folders
- `media_collections` - Thematic collections
- `external_videos` - YouTube/Vimeo links

### **System 2: Public Website Integration** (NEW)
✅ **Helper functions ready** in `/lib/media/utils.ts`
- Used by: Home, About, Impact, Community, Stories, Share Voice pages
- Functions: `getHeroImage()`, `getPageMedia()`, `getLeadershipPhotos()`, etc.

**NEW columns added to `media_files` table:**
- `page_context` - Which page (home, about, impact, community, etc.)
- `page_section` - Specific section (hero, timeline, services, etc.)
- `display_order` - Sort order (0 = first)
- `context_metadata` - Flexible JSON for quotes, names, etc.

---

## 🔗 **Integration Strategy: Make Them Work Together**

### **Phase 1: Database Integration** ✅ READY
The migration `07_media_page_context.sql` adds new columns to the EXISTING `media_files` table.

**Verify migration has run:**
```bash
# Check if columns exist
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name='media_files' AND column_name IN ('page_context', 'page_section', 'display_order');"
```

**If not run yet:**
```bash
psql $DATABASE_URL -f lib/empathy-ledger/migrations/07_media_page_context.sql
```

---

### **Phase 2: Update PICC Gallery to Include New Fields**

**Update `/app/picc/media/gallery/page.tsx`:**

Add these fields to the edit modal:

```typescript
// In the MediaFile interface, add:
interface MediaFile {
  // ... existing fields
  page_context?: string;
  page_section?: string;
  display_order?: number;
  context_metadata?: any;
}
```

```typescript
// In the edit modal/form, add:
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Page Context (Public Website)
  </label>
  <select
    value={editData.page_context || ''}
    onChange={(e) => setEditData({ ...editData, page_context: e.target.value })}
    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
  >
    <option value="">None</option>
    <option value="home">Home Page</option>
    <option value="about">About Page</option>
    <option value="impact">Impact Page</option>
    <option value="community">Community Page</option>
    <option value="stories">Stories Page</option>
    <option value="share-voice">Share Voice Page</option>
    <option value="annual-reports">Annual Reports</option>
  </select>
</div>

<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Page Section
  </label>
  <select
    value={editData.page_section || ''}
    onChange={(e) => setEditData({ ...editData, page_section: e.target.value })}
    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
  >
    <option value="">None</option>
    <option value="hero">Hero Background</option>
    <option value="timeline">Historical Timeline</option>
    <option value="leadership">Leadership Photos</option>
    <option value="services">Service Photos</option>
    <option value="testimonials">Testimonials</option>
    <option value="features">Feature Cards</option>
    <option value="innovation">Innovation Showcase</option>
  </select>
</div>

<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Display Order (0 = first)
  </label>
  <input
    type="number"
    value={editData.display_order || 0}
    onChange={(e) => setEditData({ ...editData, display_order: parseInt(e.target.value) })}
    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
  />
</div>
```

---

### **Phase 3: Create Unified Media Manager**

**New page: `/app/admin/media-manager/page.tsx`**

This will be the MASTER interface that shows:
1. All media from `media_files` table
2. Filter by page_context AND existing tags
3. Assign to both Collections AND Pages
4. Bulk operations to tag multiple photos at once

**Key features:**
- **Left sidebar:** Page context filter (Home, About, Impact, etc.)
- **Top filters:** Existing tags, file type, date range
- **Grid view:** All photos with visual indicators showing:
  - Which collections they're in
  - Which page context they're assigned to
  - Featured status
- **Quick actions:**
  - Assign to page/section
  - Add to collection
  - Bulk tag
  - Bulk assign to page

---

### **Phase 4: Link Collections to Pages**

**Smart Collections for Each Page:**

Create smart folders that automatically show media for each page:
```sql
-- Create "Home Page Media" smart folder
INSERT INTO smart_folders (name, slug, description, query_rules, is_system)
VALUES (
  'Home Page Media',
  'home-page-media',
  'All media assigned to the home page',
  '{"filters": [{"field": "page_context", "operator": "=", "value": "home"}]}',
  true
);

-- Create "About Page Media" smart folder
INSERT INTO smart_folders (name, slug, description, query_rules, is_system)
VALUES (
  'About Page Media',
  'about-page-media',
  'All media assigned to the about page',
  '{"filters": [{"field": "page_context", "operator": "=", "value": "about"}]}',
  true
);

-- Repeat for impact, community, etc.
```

---

### **Phase 5: Bulk Tagging Workflow**

**Create a special interface for bulk assigning media to pages:**

`/app/admin/bulk-page-assignment/page.tsx`

**Workflow:**
1. **Select a page** (e.g., "About Page")
2. **Show all unassigned media** with relevant tags
3. **Smart suggestions:**
   - Photos tagged "leadership" → suggest for About > Leadership
   - Photos tagged "community" → suggest for Home > Hero or Community > Hero
   - Photos tagged "service" → suggest for About > Services
4. **Bulk select** and assign with one click
5. **Preview** how they'll look on the actual page

---

## 📋 **Step-by-Step Implementation Plan**

### **Step 1: Verify Database Migration** (5 min)
```bash
# Check if migration has run
psql $DATABASE_URL -c "\d media_files" | grep page_context

# If not found, run migration
psql $DATABASE_URL -f lib/empathy-ledger/migrations/07_media_page_context.sql
```

### **Step 2: Update Gallery Interface** (30 min)
Add `page_context`, `page_section`, `display_order` fields to the existing gallery edit modal.

### **Step 3: Create Smart Folders for Pages** (10 min)
Run the SQL above to create smart folders for each page context.

### **Step 4: Bulk Tag Initial Media** (2-4 hours)
Use the PICC gallery to start tagging photos:
- **Home page hero:** Find best aerial/community photos → tag as `home/hero`
- **About leadership:** Find Rachel + board member photos → tag as `about/leadership`
- **About services:** Find facility photos → tag as `about/services`
- Etc.

### **Step 5: Test Integration** (30 min)
Visit each public page and verify photos appear:
- `/` - Home page shows hero and feature images
- `/about` - About page shows leadership, services, testimonials
- `/impact` - Impact page shows innovation photos
- `/community` - Community page shows program photos

### **Step 6: Create Unified Admin Dashboard** (2-3 hours)
Build the master media manager at `/admin/media-manager/`

---

## 🎯 **Quick Win: Assign 10 Photos Right Now**

Let's get started immediately with the most impactful photos:

### **SQL to manually assign photos:**

```sql
-- Example: Set a photo as Home page hero
UPDATE media_files
SET
  page_context = 'home',
  page_section = 'hero',
  is_featured = true,
  display_order = 0
WHERE filename = 'your-best-palm-island-aerial-photo.jpg';

-- Example: Set Rachel Atkinson photo for About > Leadership
UPDATE media_files
SET
  page_context = 'about',
  page_section = 'leadership',
  display_order = 0,
  context_metadata = '{
    "name": "Rachel Atkinson",
    "position": "Chief Executive Officer",
    "quote": "Everything we do is for, with, and because of the people of this beautiful community"
  }'::jsonb
WHERE filename = 'rachel-atkinson-headshot.jpg';

-- Example: Assign multiple service photos
UPDATE media_files
SET
  page_context = 'about',
  page_section = 'services'
WHERE tags && ARRAY['health-clinic', 'bwgcolman-healing'];
```

---

## 💡 **Smart Tagging Strategy**

Use the existing PICC media system's tagging to auto-suggest page assignments:

| Existing Tag | Auto-Suggest |
|--------------|--------------|
| `leadership`, `rachel-atkinson`, `board` | → About > Leadership |
| `health`, `clinic`, `healing` | → About > Services |
| `aerial`, `landscape`, `palm-island` | → Home > Hero |
| `community`, `celebration`, `event` | → Community > Hero |
| `digital-centre`, `innovation` | → Impact > Innovation |
| `elder`, `storyteller` | → About > Testimonials |

**Implementation:**
Add a "Smart Suggest" button in the gallery that analyzes tags and suggests `page_context` + `page_section`.

---

## 🔄 **Data Flow Diagram**

```
┌─────────────────────────────────────────────────────┐
│         PICC Media Library (/picc/media/)          │
│  ~1000 photos with tags, collections, metadata     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   media_files table   │
        │                       │
        │  Existing fields:     │
        │  - tags[]             │
        │  - title              │
        │  - description        │
        │  - is_featured        │
        │                       │
        │  NEW fields:          │
        │  - page_context       │ ← Added by migration
        │  - page_section       │ ← Added by migration
        │  - display_order      │ ← Added by migration
        │  - context_metadata   │ ← Added by migration
        └──────────┬────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Helper Functions     │
        │  (/lib/media/utils)   │
        │                       │
        │  - getHeroImage()     │
        │  - getPageMedia()     │
        │  - getLeadershipPhotos() │
        └──────────┬────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Public Pages        │
        │                       │
        │  - Home               │
        │  - About              │
        │  - Impact             │
        │  - Community          │
        └───────────────────────┘
```

---

## 🎨 **UI/UX for Dual-System**

### **In PICC Gallery:**
Add visual indicators showing which media is assigned to public pages:

```
┌─────────────────────────────┐
│ [Photo Thumbnail]           │
│                             │
│ Tags: community, health     │
│ 📍 Assigned to:             │
│   • Home > Hero             │
│   • Collections: Annual 2024│
│                             │
│ [Edit] [Add to Collection]  │
└─────────────────────────────┘
```

### **In Admin Media Manager:**
Split view showing both systems:

```
┌─────────────┬─────────────────────────────────┐
│ Filters     │  Media Grid                     │
│             │                                  │
│ Page:       │  [Photo] [Photo] [Photo]        │
│ □ Home      │  Home >  About > Impact >       │
│ □ About     │  Hero    Leader  Innovation     │
│ ☑ Impact    │                                  │
│             │  [Photo] [Photo] [Photo]        │
│ Collections:│                                  │
│ □ 2024      │                                  │
│ □ Events    │                                  │
│             │                                  │
│ Tags:       │                                  │
│ Search...   │                                  │
└─────────────┴─────────────────────────────────┘
```

---

## 🚀 **Benefits of Integration**

### **For Content Managers:**
1. **Single source of truth** - All media in one `media_files` table
2. **Dual organization** - Use both Collections AND Page assignments
3. **Smart folders** - Auto-updating views by page context
4. **Bulk operations** - Tag hundreds of photos at once
5. **Visual feedback** - See where each photo is used

### **For Public Website:**
1. **Dynamic content** - Change hero images without code
2. **Automatic fetching** - Pages pull correct photos automatically
3. **Fallback gracefully** - Works even with no photos assigned
4. **Performance** - Indexed queries, fast loading
5. **Flexible** - Easy to add new pages/sections

### **For Long-term Maintenance:**
1. **No duplication** - Media stored once, used everywhere
2. **Easy updates** - Change assignments in one place
3. **Version control** - Track which photos were used when
4. **Future-proof** - System scales as media library grows
5. **Data sovereignty** - All media controlled by community

---

## 📊 **Current Status**

### ✅ **Complete:**
- [x] `media_files` table exists with ~1000 photos
- [x] PICC Media Library (/picc/media/) fully functional
- [x] Public pages using helper functions
- [x] Migration file created (07_media_page_context.sql)
- [x] Photo collections and smart folders working

### 🚧 **Needs Integration:**
- [ ] Run migration to add new columns to media_files
- [ ] Update PICC Gallery to show/edit new fields
- [ ] Create smart folders for each page context
- [ ] Bulk tag initial media for public pages
- [ ] Create unified admin dashboard (optional but recommended)

---

## 🎯 **Next Actions (Priority Order)**

1. **VERIFY MIGRATION** - Check if new columns exist (5 min)
2. **UPDATE GALLERY** - Add page_context/page_section to edit form (30 min)
3. **BULK TAG HEROES** - Assign hero images for all pages (1 hour)
4. **CREATE SMART FOLDERS** - One for each page context (10 min)
5. **TEST INTEGRATION** - Visit all public pages, verify images show (30 min)
6. **BULK TAG SECTIONS** - Assign leadership, services, etc. (2-3 hours)
7. **BUILD UNIFIED DASHBOARD** - Master media manager (optional, 3-4 hours)

---

## 💾 **Database Schema Integration**

The beauty of this system: **NO new tables needed!**

All media stays in the `media_files` table, we just add 4 new columns:

```sql
-- Existing media_files table
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS page_context TEXT;
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS page_section TEXT;
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS context_metadata JSONB;

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS media_files_page_context_idx ON media_files(page_context);
CREATE INDEX IF NOT EXISTS media_files_page_section_idx ON media_files(page_section);
CREATE INDEX IF NOT EXISTS media_files_page_display_idx ON media_files(page_context, page_section, display_order);
```

This means:
- ✅ All existing photos still work in PICC gallery
- ✅ All existing collections still work
- ✅ All existing tags still work
- ✅ NEW: Photos can also be assigned to public pages
- ✅ NEW: Same photo can be in multiple places (collections + pages)

---

## 🎓 **Training Guide for Staff**

### **How to Assign Media to Public Pages:**

1. **Go to PICC Media Gallery** (`/picc/media/gallery`)
2. **Find the photo** you want to use
3. **Click to edit**
4. **Scroll to "Public Website" section** (new fields)
5. **Select Page Context** (e.g., "About")
6. **Select Page Section** (e.g., "Leadership")
7. **Set Display Order** (0 = first, 1 = second, etc.)
8. **Add Context Metadata** (optional JSON for quotes, names, etc.)
9. **Save**

The photo is now LIVE on the public website at that location!

---

## 🔮 **Future Enhancements**

### **Phase 2 Features:**
- **AI auto-tagging** - Automatically suggest page assignments based on image content
- **Visual page builder** - Drag-and-drop photos onto page mockups
- **A/B testing** - Test different hero images and track performance
- **Seasonal rotation** - Auto-change photos by season/event
- **Localization** - Different photos for different languages

### **Phase 3 Features:**
- **Video integration** - Assign videos to pages like photos
- **3D/360 photos** - Immersive community experiences
- **Story-media linking** - Automatically pull photos from related stories
- **Timeline view** - See media used on each page over time
- **Analytics** - Track which photos perform best

---

**Generated:** December 4, 2025
**Status:** Integration Plan Complete ✅
**Ready for:** Immediate implementation
