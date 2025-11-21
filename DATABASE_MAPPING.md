# Supabase Database Tables → Pages Mapping

## 📊 Database Status: Empty or Nearly Empty

**You're seeing 0s everywhere because the database tables are empty!** Here's what you need to do:

---

## 🗄️ All Database Tables (8 Total)

### 1. **profiles** (STORYTELLERS)
**Stores:** Community storytellers, elders, cultural advisors, service providers

**Key Fields:**
- `id` - UUID primary key
- `full_name` - Person's full name (REQUIRED)
- `preferred_name` - What they like to be called
- `storyteller_type` - community_member, elder, youth, service_provider, cultural_advisor
- `is_elder` - Boolean flag
- `is_cultural_advisor` - Boolean flag
- `email`, `phone`, `location`
- `bio`, `expertise_areas`, `languages_spoken`
- `stories_contributed` - Auto-incremented count
- `show_in_directory` - Must be TRUE to appear in lists
- `profile_visibility` - public, community, or private

**Used By These Pages:**
- ✅ `/admin/storytellers` - Lists all profiles, shows stats
- ✅ `/admin/storytellers/new` - Creates new profiles
- ✅ `/stories/new` - Dropdown to select storyteller
- ✅ `/wiki/people` - Lists storytellers
- ✅ `/wiki/people/[id]` - Individual profile view
- ✅ `/analytics` - Storyteller leaderboard

**Current Status:** ⚠️ PROBABLY EMPTY - This is why you see 0 storytellers

**How to Add Data:**
1. Go to: http://localhost:3000/admin/storytellers
2. Click "Quick Add" or "Complete Profile"
3. Fill in the form
4. Save

---

### 2. **stories** (STORIES/NARRATIVES)
**Stores:** Community stories, elder wisdom, service successes

**Key Fields:**
- `id` - UUID primary key
- `storyteller_id` - Links to profiles table (REQUIRED)
- `title` - Story title (REQUIRED)
- `content` - Full story text (REQUIRED)
- `summary` - Short preview
- `story_type` - community_story, elder_wisdom, service_success, etc.
- `category` - culture, health, youth, family, education, etc.
- `related_service` - Which PICC service this relates to
- `status` - draft, submitted, under_review, approved, published, archived
- `access_level` - public, community, restricted
- `is_featured` - Boolean (featured stories highlighted)
- `views`, `shares`, `likes` - Engagement metrics
- `story_date` - When the story happened
- `location` - Where it happened
- `metadata` - JSON field (we use this for innovation_link)

**Used By These Pages:**
- ✅ `/stories` - Lists all published public stories
- ✅ `/stories/new` - Creates new stories
- ✅ `/stories/[id]` - Individual story view
- ✅ `/wiki/innovation/storm-recovery` - Queries stories by category
- ✅ `/wiki/history` - Shows historical stories
- ✅ `/wiki/culture` - Shows cultural stories
- ✅ `/analytics` - Story counts and breakdown
- ✅ `/insights/patterns` - Pattern analysis

**Current Status:** ⚠️ PROBABLY EMPTY - This is why you see 0 stories

**How to Add Data:**
1. First add a storyteller (see profiles above)
2. Go to: http://localhost:3000/stories/new
3. Select storyteller from dropdown
4. Fill in title and content
5. Set status to "published"
6. Set access_level to "public"
7. Save

---

### 3. **story_media** (PHOTOS/VIDEOS)
**Stores:** Photos, videos, audio files attached to stories

**Key Fields:**
- `id` - UUID primary key
- `story_id` - Links to stories table (REQUIRED)
- `media_type` - photo, video, audio, document
- `file_path` - Path in Supabase storage
- `supabase_bucket` - Which bucket (story-images, story-videos)
- `caption` - Description/caption
- `display_order` - Order to show media

**Used By These Pages:**
- ✅ `/stories` - Shows media indicators (photo count, video count)
- ✅ `/stories/[id]` - Displays photos/videos in story view
- ✅ `/stories/new` - Upload interface for media

**Current Status:** ⚠️ EMPTY - No media uploaded yet

**How to Add Data:**
1. When creating a story at `/stories/new`
2. Click "Upload Photos" or "Upload Videos"
3. Select files
4. Add captions
5. Save story (media auto-uploads)

---

### 4. **impact_indicators** (IMPACT METRICS)
**Stores:** Measurable impact data from stories

**Key Fields:**
- `id` - UUID primary key
- `story_id` - Links to stories table
- `profile_id` - Links to profiles table
- `indicator_type` - health_outcome, cultural_strengthening, service_access, etc.
- `indicator_name` - Name of the metric
- `value_numeric` - Numeric value
- `value_text` - Text description
- `measurement_date` - When measured

**Used By These Pages:**
- ⚠️ NOT YET IMPLEMENTED in UI (backend ready)
- Future: Impact reports, analytics dashboards

**Current Status:** EMPTY

---

### 5. **service_story_links** (SERVICE CONNECTIONS)
**Stores:** Links between stories and PICC services

**Key Fields:**
- `id` - UUID primary key
- `story_id` - Links to stories table
- `service_name` - Name of PICC service
- `service_outcome` - What the service achieved
- `demonstrates_effectiveness` - Boolean

**Used By These Pages:**
- ✅ `/analytics` - Service breakdown section
- ✅ `/wiki/services` - Shows service-related stories

**Current Status:** ⚠️ PROBABLY EMPTY

**How to Add Data:**
- Currently populated via triggers/functions
- Or manually insert via Supabase dashboard

---

### 6. **engagement_activities** (USER TRACKING)
**Stores:** User interactions with stories

**Key Fields:**
- `id` - UUID primary key
- `profile_id` - Who did the action
- `activity_type` - story_viewed, story_shared, comment_added, etc.
- `target_id` - What they interacted with
- `created_at` - When

**Used By These Pages:**
- ⚠️ NOT YET IMPLEMENTED in UI
- Future: User analytics, engagement reports

**Current Status:** EMPTY

---

### 7. **cultural_permissions** (PERMISSIONS TRACKING)
**Stores:** Cultural permissions and consents

**Key Fields:**
- `id` - UUID primary key
- `profile_id` - Links to profiles table
- `permission_type` - face_recognition, traditional_knowledge_sharing, etc.
- `permission_granted` - Boolean
- `allowed_contexts` - Array of contexts

**Used By These Pages:**
- ⚠️ NOT YET IMPLEMENTED in UI
- Backend: Permissions stored in profiles table for now

**Current Status:** EMPTY

---

### 8. **story_patterns** (ML PATTERNS)
**Stores:** AI-identified patterns across multiple stories

**Key Fields:**
- `id` - UUID primary key
- `pattern_name` - Name of pattern
- `pattern_type` - service_effectiveness, cultural_practice_success, etc.
- `story_ids` - Array of story UUIDs in this pattern
- `pattern_strength` - How strong (0-1)

**Used By These Pages:**
- ⚠️ NOT YET IMPLEMENTED in UI
- Future: `/insights/patterns` - ML-driven insights

**Current Status:** EMPTY

---

## 🔍 Page → Table Mapping

### Pages That NEED Data (showing 0s)

| Page | Tables Used | What Shows 0 | How to Fix |
|------|-------------|-------------|-----------|
| `/admin/storytellers` | `profiles` | Total: 0, Elders: 0, etc. | Add storytellers via "Quick Add" |
| `/stories` | `stories`, `profiles`, `story_media` | Total Stories: 0 | Create stories at `/stories/new` |
| `/analytics` | `stories`, `profiles`, `service_story_links` | All metrics: 0 | Add stories and storytellers |
| `/wiki/people` | `profiles` | Empty grid | Add storytellers |
| `/wiki/innovation/storm-recovery` | `stories` (filtered) | 0 storm stories | Create stories with storm category |
| `/insights/patterns` | `stories` | No patterns found | Need multiple stories first |
| `/insights/timeline` | Static (no DB) | Shows milestones | ✅ Works without data |

---

## 🚀 Quick Fix: Add Sample Data

### Option 1: Manual Entry (Recommended for Testing)

**Step 1: Add a Storyteller**
1. Go to: http://localhost:3000/admin/storytellers
2. Click "Quick Add"
3. Fill in:
   ```
   Full Name: Test Elder
   Preferred Name: Elder Test
   Email: test@example.com
   Storyteller Type: Elder
   ```
4. Click "Add Storyteller"

**Step 2: Add a Story**
1. Go to: http://localhost:3000/stories/new
2. Select storyteller: "Test Elder"
3. Fill in:
   ```
   Title: My First Community Story
   Content: This is a test story to populate the database and see how the system works.
   Story Type: Community Story
   Category: Culture & Language
   Status: Published
   Access Level: Public
   ```
4. Click "Publish Story"

**Step 3: Check the Pages**
- Go to http://localhost:3000/stories - Should show 1 story
- Go to http://localhost:3000/admin/storytellers - Should show 1 storyteller
- Go to http://localhost:3000/analytics - Should show counts

---

### Option 2: Database Insert (Advanced)

If you have Supabase dashboard access:

**Add a Storyteller:**
```sql
INSERT INTO profiles (full_name, preferred_name, storyteller_type, is_elder, location, show_in_directory, profile_visibility)
VALUES
('Mary Wilson', 'Mary', 'elder', true, 'Palm Island', true, 'public'),
('John Smith', 'Johnny', 'youth', false, 'Palm Island', true, 'public'),
('Sarah Jones', 'Sarah', 'service_provider', false, 'Palm Island', true, 'public');
```

**Add Stories (using storyteller IDs from above):**
```sql
INSERT INTO stories (
  storyteller_id,
  title,
  content,
  story_type,
  category,
  status,
  access_level,
  story_date
)
VALUES
(
  '<STORYTELLER_ID_HERE>',
  'Traditional Fishing Knowledge',
  'Our elders taught us how to read the tides and know when fish are running...',
  'elder_wisdom',
  'culture',
  'published',
  'public',
  '2024-11-01'
);
```

---

## 🔗 Field Compatibility Notes

### Important Schema Differences

The pages expect certain fields that might differ from existing data:

**Stories table:**
- Pages use `category` but some old data might use `story_category`
- Pages use `story_type` for categorization
- Pages use `status` (draft/published) - must be 'published' to show
- Pages use `access_level` (public/community) - must be 'public' to show on `/stories`
- Innovation links stored in `metadata.innovation_link` (JSON field)

**Profiles table:**
- Pages use `show_in_directory` (must be TRUE to appear in lists)
- Pages use `profile_visibility` (must be 'public' or 'community' to show)
- Pages expect `storyteller_type` (not just category)

---

## ✅ Verification Checklist

After adding data, verify:

- [ ] `/admin/storytellers` shows correct Total count
- [ ] `/stories` shows your published stories
- [ ] `/analytics` shows non-zero metrics
- [ ] `/wiki/people` shows storyteller grid
- [ ] Story cards show storyteller names (proper JOIN working)
- [ ] Filtering works (category, innovation links)

---

## 🆘 Still Seeing 0s?

**Check these common issues:**

1. **Status field:** Stories must have `status = 'published'` to show on `/stories`
2. **Access level:** Stories must have `access_level = 'public'` to show publicly
3. **Directory flag:** Profiles must have `show_in_directory = true`
4. **Visibility:** Profiles must have `profile_visibility IN ('public', 'community')`
5. **Database connection:** Check `.env.local` has correct Supabase credentials
6. **Browser cache:** Hard refresh with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## 📞 Need Help?

If you're still seeing zeros after adding data:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors (red messages)
4. Share the error messages - they'll tell us what's wrong!
