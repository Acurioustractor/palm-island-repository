# 👥 Storyteller Management Guide

## Overview

This guide walks you through managing storytellers in your Palm Island wiki, ensuring everything is properly connected to Supabase.

---

## 🔍 Step 1: Check What's Currently in Your Database

First, let's verify your Supabase connection and see what data you have:

```bash
cd web-platform
node scripts/verify-database.js
```

**What you'll see:**
- ✓ Connection status
- 📖 Number of stories
- 👥 Number of storytellers
- 🏢 Organizations
- 📊 Recent stories and storytellers

**Expected output if storm stories are imported:**
- Stories: 26 (from storm import)
- Storytellers: Multiple profiles from those stories
- Organizations: PICC (Palm Island Community Company)

---

## 📊 Step 2: View Your Data in Supabase Dashboard

### Access Supabase:
1. Go to: https://supabase.com/dashboard
2. Sign in
3. Select project: `yvnuayzslukamizrlhwb`

### Check Storytellers Table:
1. Click **"Table Editor"** in left sidebar
2. Click **"profiles"** table
3. You'll see all storytellers with these fields:
   - `id` - UUID (auto-generated)
   - `full_name` - Full name
   - `preferred_name` - What they like to be called
   - `email` - Email address
   - `bio` - Biography
   - `profile_image_url` - Photo URL
   - `storyteller_type` - Type: 'elder', 'youth', 'service_provider', 'community'
   - `is_elder` - True/false
   - `location` - Where they're from
   - `organization_id` - Links to PICC

### Check Stories Table:
1. Click **"stories"** table
2. Check `storyteller_id` column - this links each story to a storyteller
3. Verify stories have valid `storyteller_id` values

---

## ✅ How the Connection Works

### Database Schema:

```
┌─────────────────┐         ┌──────────────────┐
│   profiles      │         │     stories      │
├─────────────────┤         ├──────────────────┤
│ id (UUID)       │◄────────│ storyteller_id   │
│ full_name       │         │ title            │
│ preferred_name  │         │ content          │
│ email           │         │ story_date       │
│ bio             │         │ location         │
│ is_elder        │         │ organization_id  │
│ storyteller_type│         └──────────────────┘
│ organization_id │
└─────────────────┘
         │
         │ Foreign Key
         ▼
┌─────────────────┐
│ organizations   │
├─────────────────┤
│ id (UUID)       │
│ organization_name│
│ description     │
└─────────────────┘
```

**Key Relationships:**
- Each **story** has ONE storyteller (via `storyteller_id`)
- Each **storyteller** can have MANY stories
- Each storyteller belongs to an organization (usually PICC)

---

## 🎯 Method 1: Add Storytellers via Elder Stories Import (Recommended!)

### Step 1: Prepare Your Story Data

Create or edit: `web-platform/scripts/elder-stories-data.json`

```json
[
  {
    "title": "Traditional Healing Knowledge",
    "storyteller_name": "Aunty Rose Johnson",
    "storyteller_email": "rose@picc.com.au",
    "storyteller_bio": "Elder and traditional healer from Palm Island with 60+ years of knowledge",
    "content": "Full story text here...",
    "summary": "Aunty Rose shares traditional healing practices",
    "story_date": "2024-01-15",
    "story_category": "elder_care",
    "emotional_theme": "healing",
    "cultural_sensitivity_level": "high",
    "elder_approval_given": true,
    "access_level": "community",
    "location": "Palm Island",
    "traditional_knowledge": true,
    "language_used": "English and Traditional Language",
    "tags": ["healing", "traditional knowledge", "elder wisdom"]
  }
]
```

### Step 2: Run the Import Script

```bash
cd web-platform
node scripts/import-elder-stories.js scripts/elder-stories-data.json
```

**What the script does automatically:**

1. **Checks if storyteller exists** (by email)
2. **If NOT found:**
   - Creates new profile in `profiles` table
   - Sets `storyteller_type` = 'elder'
   - Sets `is_elder` = true
   - Links to PICC organization
   - Uses provided bio or creates default one

3. **Creates story** in `stories` table
   - Links to storyteller via `storyteller_id`
   - Links to organization via `organization_id`
   - Sets all story metadata

4. **Outputs results:**
   - Shows which storytellers were created
   - Shows which stories were imported
   - Reports any errors

### Step 3: Verify in Supabase

After import, check:

1. **Profiles table** - New storyteller appears
2. **Stories table** - New story with correct `storyteller_id`
3. **Run verification script** - Counts should increase

```bash
node scripts/verify-database.js
```

---

## 🔧 Method 2: Add Storytellers Manually via Supabase Dashboard

### When to use this:
- Adding a storyteller before they have stories
- Updating existing storyteller information
- Bulk editing storyteller data

### Steps:

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project
   - Click **Table Editor** → **profiles**

2. **Click "Insert Row"**

3. **Fill in the fields:**

   **Required:**
   - `full_name`: "Aunty Rose Johnson"
   - `email`: "rose@picc.com.au" (must be unique)
   - `location`: "Palm Island"

   **Recommended:**
   - `preferred_name`: "Aunty Rose"
   - `bio`: "Elder and traditional healer..."
   - `storyteller_type`: Select "elder" from dropdown
   - `is_elder`: Check the box (true)
   - `organization_id`: Select PICC from dropdown

   **Optional:**
   - `profile_image_url`: URL to photo
   - `traditional_country`: "Manbarra Country"
   - `language_group`: Language/clan group
   - `phone`: Contact number
   - `date_of_birth`: Birth date

4. **Click "Save"**

5. **Copy the storyteller's ID:**
   - After saving, click the row
   - Copy the `id` (UUID) value
   - You'll need this when creating stories for them

---

## 🔗 Linking Stories to Storytellers

### Via Import Script (Automatic):
The script automatically links stories to storytellers by email.

### Via Supabase Dashboard (Manual):

1. **Get the storyteller's ID:**
   - Go to **profiles** table
   - Find the storyteller
   - Copy their `id` (UUID)

2. **Create or update a story:**
   - Go to **stories** table
   - Click "Insert Row" (or edit existing)
   - Paste the storyteller's ID into `storyteller_id` field
   - Fill in other story fields
   - Click "Save"

### Via SQL:

```sql
-- Find storyteller ID by email
SELECT id, full_name FROM profiles WHERE email = 'rose@picc.com.au';

-- Create story linked to that storyteller
INSERT INTO stories (
  title,
  content,
  storyteller_id,
  organization_id
) VALUES (
  'Story Title',
  'Story content here...',
  (SELECT id FROM profiles WHERE email = 'rose@picc.com.au'),
  (SELECT id FROM organizations WHERE organization_name = 'Palm Island Community Company')
);
```

---

## 🧪 Testing the Connection

### Test 1: View Storyteller Profile Page

```bash
# Start dev server
cd web-platform
npm run dev
```

Visit: http://localhost:3000/wiki/people

**What you should see:**
- Cards for each storyteller
- Name, location, bio
- Story count for each person
- Photos if you've added `profile_image_url`

### Test 2: View Story with Storyteller Info

Visit: http://localhost:3000/stories

Click any story. In the Story Information box (right side), you should see:
- Storyteller name and photo
- "Shared by [name]" with clickable link
- Link goes to storyteller's profile page

### Test 3: Click Storyteller Name

Clicking a storyteller name should take you to:
`http://localhost:3000/wiki/people/[storyteller-id]`

This page shows:
- Storyteller profile
- All their stories
- Bio and details

---

## 🔍 Troubleshooting

### Problem: "Storyteller not showing in wiki/people page"

**Check:**
1. Does the profile exist in Supabase `profiles` table?
2. Run verification script to see count
3. Check browser console (F12) for errors

**Fix:**
```sql
-- In Supabase SQL Editor
SELECT * FROM profiles;
```

### Problem: "Story shows 'Unknown' storyteller"

**This means `storyteller_id` is null or invalid**

**Fix:**
1. Go to Supabase → **stories** table
2. Find the story
3. Check `storyteller_id` column
4. If empty or invalid, update it:

```sql
UPDATE stories
SET storyteller_id = (SELECT id FROM profiles WHERE email = 'storyteller@email.com')
WHERE id = 'story-id-here';
```

### Problem: "Import script says storyteller already exists but I don't see them"

**The storyteller exists but might have different email**

**Check:**
```sql
SELECT * FROM profiles WHERE full_name LIKE '%Rose%';
```

### Problem: "Cannot add storyteller - email already exists"

**Each storyteller needs unique email**

**Options:**
1. Use different email: `rose.johnson@picc.com.au`
2. Use name-based email: `aunty.rose@picc.com.au`
3. Update existing profile instead

---

## 📝 Quick Reference: Storyteller Fields

### Required (Must have):
- `full_name` - Full legal name
- `email` - Unique email address
- `location` - Where they're from

### Recommended (Should have):
- `preferred_name` - What they like to be called
- `bio` - Short biography
- `storyteller_type` - elder, youth, service_provider, community
- `is_elder` - true/false
- `organization_id` - Link to PICC

### Optional (Nice to have):
- `profile_image_url` - Photo URL
- `traditional_country` - Traditional lands
- `language_group` - Language/clan
- `phone` - Contact
- `date_of_birth` - Birthday
- `expertise_areas` - Array of skills
- `community_roles` - Array of roles

---

## 🎯 Recommended Workflow for Your 8 Elder Stories

### Step-by-Step:

1. **Prepare the JSON file:**
   ```bash
   cd web-platform/scripts
   cp elder-stories-data-example.json my-8-elder-stories.json
   ```

2. **Edit the file with your 8 stories:**
   - Each story should have storyteller info
   - Include bio, email, etc.
   - The script will create storytellers automatically

3. **Run the import:**
   ```bash
   node scripts/import-elder-stories.js scripts/my-8-elder-stories.json
   ```

4. **Verify:**
   ```bash
   node scripts/verify-database.js
   ```

5. **View in browser:**
   ```bash
   npm run dev
   ```
   Visit: http://localhost:3000/wiki/people

6. **Check Supabase Dashboard:**
   - Verify all storytellers created
   - Verify all stories linked correctly

---

## ✅ Data Integrity Checks

Run these SQL queries in Supabase to verify everything is connected:

```sql
-- 1. Count stories without storytellers (should be 0)
SELECT COUNT(*) as orphaned_stories
FROM stories
WHERE storyteller_id IS NULL;

-- 2. Count storytellers with their story counts
SELECT
  p.full_name,
  p.preferred_name,
  p.is_elder,
  COUNT(s.id) as story_count
FROM profiles p
LEFT JOIN stories s ON s.storyteller_id = p.id
GROUP BY p.id, p.full_name, p.preferred_name, p.is_elder
ORDER BY story_count DESC;

-- 3. Check all stories have valid organization links
SELECT COUNT(*) as stories_with_org
FROM stories
WHERE organization_id IS NOT NULL;

-- 4. List all elders
SELECT full_name, preferred_name, email, location
FROM profiles
WHERE is_elder = true
ORDER BY full_name;
```

---

## 🚀 Next Steps

Once your storytellers are set up and linked:

1. **Add profile photos** - Upload images and add URLs to `profile_image_url`
2. **Enhance bios** - Add more detail to storyteller biographies
3. **Add cultural info** - Fill in `traditional_country`, `language_group`
4. **Build analytics** - Create dashboard showing storyteller contributions
5. **Create storyteller pages** - Enhanced individual profile pages

---

## 📞 Quick Commands Reference

```bash
# Check database
cd web-platform && node scripts/verify-database.js

# Import elder stories (creates storytellers automatically)
cd web-platform && node scripts/import-elder-stories.js scripts/your-file.json

# Start dev server to view
cd web-platform && npm run dev

# Open in browser
open http://localhost:3000/wiki/people
```

---

**Everything is connected through Supabase!** 🎉

The flow is: **Supabase Database** ← **Import Scripts** ← **Your JSON Data**
                     ↓
            **Next.js App** → **Wiki Pages** → **Your Browser**
