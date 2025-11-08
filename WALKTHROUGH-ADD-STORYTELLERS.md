# 🚶 Step-by-Step Walkthrough: Adding Storytellers & Verifying Supabase Connection

## Let's Do This Together!

I'll walk you through checking your database, understanding what's there, and adding your 8 elder stories with storytellers.

---

## 🔍 STEP 1: Verify Your Database Connection (2 minutes)

### What we're doing:
Checking that everything is connected to Supabase and seeing what data you have.

### Commands to run:

```bash
# Navigate to the web platform folder
cd web-platform

# Run the verification script
node scripts/verify-database.js
```

### What you should see:

```
==========================================================
🔍 PALM ISLAND DATABASE VERIFICATION
==========================================================

✓ Environment variables found
  URL: https://yvnuayzslukamizrlhwb.supabase.co
  Key: eyJhbGciOiJIUzI1NiIsI...

==========================================================
📡 TESTING CONNECTION
==========================================================

✓ Successfully connected to Supabase!

==========================================================
📊 DATABASE STATISTICS
==========================================================

📖 Stories: 26
👥 Storytellers: [some number]
🏢 Organizations: 1
🛠️  Services: [some number]

==========================================================
📚 RECENT STORIES
==========================================================

1. [Story Title]
   By: [Storyteller Name] | Category: flood_recovery | [Date]
...
```

### ✅ Success Indicators:
- ✓ "Successfully connected to Supabase!" message
- ✓ Stories count = 26 (if storm stories imported)
- ✓ List of storytellers shows names
- ✓ List of recent stories appears

### ❌ If you see errors:

**Error: "Missing Supabase credentials"**
→ You need to create `.env.local` file
→ See QUICK-START-GUIDE.md Step 1

**Error: "Connection failed"**
→ Check your internet connection
→ Verify Supabase project is active

---

## 📊 STEP 2: Check Supabase Dashboard (3 minutes)

### What we're doing:
Visually confirming your data in the Supabase interface.

### Actions:

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Sign in
   - Click on your project: `yvnuayzslukamizrlhwb`

2. **Check Profiles (Storytellers) Table:**
   - Click **"Table Editor"** in left sidebar
   - Click **"profiles"** table
   - You should see rows of storytellers

3. **What to look for in profiles table:**
   - Column `full_name` - Names of storytellers
   - Column `email` - Email addresses
   - Column `is_elder` - True/false checkmarks
   - Column `storyteller_type` - Types like 'elder', 'community'
   - Column `organization_id` - Should have UUID values

4. **Check Stories Table:**
   - Click **"stories"** table
   - You should see 26+ rows (your storm stories)

5. **What to look for in stories table:**
   - Column `title` - Story titles
   - Column `storyteller_id` - UUID linking to profiles
   - Column `organization_id` - UUID linking to PICC
   - Column `content` - Story text

6. **Check Organizations Table:**
   - Click **"organizations"** table
   - You should see "Palm Island Community Company"
   - Copy its `id` - you'll need this later

---

## 📝 STEP 3: Prepare Your 8 Elder Stories (10 minutes)

### What we're doing:
Creating a JSON file with your 8 elder stories and storyteller information.

### Actions:

1. **Copy the example file:**

```bash
cd web-platform/scripts
cp elder-stories-data-example.json my-8-elder-stories.json
```

2. **Open the file in VS Code:**

```bash
# If you're in VS Code already, just open:
web-platform/scripts/my-8-elder-stories.json
```

3. **Edit the file with your 8 stories:**

Here's the template for EACH story:

```json
{
  "title": "Your Story Title Here",
  "storyteller_name": "Aunty Rose Johnson",
  "storyteller_email": "rose@picc.com.au",
  "storyteller_bio": "Elder from Palm Island with deep traditional knowledge",
  "content": "The full story text goes here. Can be multiple paragraphs.\n\nSecond paragraph...\n\nThird paragraph...",
  "summary": "A brief 1-2 sentence summary of the story",
  "story_date": "2024-01-15",
  "story_category": "elder_care",
  "emotional_theme": "healing",
  "cultural_sensitivity_level": "high",
  "elder_approval_given": true,
  "access_level": "community",
  "location": "Palm Island",
  "traditional_knowledge": true,
  "language_used": "English",
  "tags": ["elder wisdom", "traditional knowledge"]
}
```

4. **Important field notes:**

**Storyteller fields (creates/updates the storyteller):**
- `storyteller_name` - REQUIRED - Full name
- `storyteller_email` - REQUIRED - Unique email (used to match existing or create new)
- `storyteller_bio` - Optional but recommended

**Story fields:**
- `title` - REQUIRED
- `content` - REQUIRED - The full story text
- `story_date` - When the story took place
- `story_category` - Choose from: elder_care, health, education, culture, flood_recovery
- `emotional_theme` - Choose from: healing, resilience, connection_belonging, pride_accomplishment, hope_aspiration
- `cultural_sensitivity_level` - Choose from: low, medium, high, restricted
- `access_level` - Choose from: public, community, restricted
- `elder_approval_given` - true or false
- `location` - Usually "Palm Island"

5. **Create an array with all 8 stories:**

```json
[
  {
    // First story here
  },
  {
    // Second story here
  },
  {
    // Third story here
  },
  // ... continue for all 8 stories
]
```

---

## 🚀 STEP 4: Import Your Stories (2 minutes)

### What we're doing:
Running the import script to add storytellers and stories to Supabase.

### Command:

```bash
cd web-platform
node scripts/import-elder-stories.js scripts/my-8-elder-stories.json
```

### What happens:

The script will:

1. **Check each storyteller:**
   ```
   👥 PROCESSING STORYTELLERS

   ✓ Found existing storyteller: Joe Smith

   📝 Creating storyteller: Rose Johnson
   ✓ Created storyteller: Rose Johnson
   ```

2. **Import each story:**
   ```
   📚 IMPORTING STORIES

   📖 Importing: Traditional Healing Practices
      ✓ Imported successfully (ID: abc-123-xyz)

   📖 Importing: Growing Up on Palm Island
      ✓ Imported successfully (ID: def-456-uvw)
   ```

3. **Show summary:**
   ```
   ✅ IMPORT COMPLETE

   ✓ Successfully imported: 8 stories

   Next steps:
     1. View your stories: http://localhost:3000/stories
     2. View storytellers: http://localhost:3000/wiki/people
     3. Run analytics: http://localhost:3000/analytics
   ```

### ✅ Success means:
- All 8 stories show "✓ Imported successfully"
- No "❌ Failed" messages
- Summary shows "8 stories" imported

### ❌ If you see errors:

**"File not found"**
→ Check the file path is correct
→ Make sure you're in `web-platform/` directory

**"Failed to create storyteller"**
→ Might be duplicate email
→ Check Supabase if storyteller already exists

**"Failed to import story"**
→ Check the error message
→ Usually missing required field

---

## ✅ STEP 5: Verify the Import (3 minutes)

### 5A: Run Verification Script

```bash
node scripts/verify-database.js
```

**Check:**
- Stories count should now be: 26 (storm) + 8 (elders) = 34
- Storytellers count should include your new elders
- Recent stories should show your newly added stories

### 5B: Check Supabase Dashboard

1. Go back to Supabase Dashboard
2. Refresh the **profiles** table - new storytellers should appear
3. Refresh the **stories** table - new stories should appear
4. Check one story - verify `storyteller_id` is filled in

### 5C: View in the Wiki

```bash
# Make sure dev server is running
npm run dev
```

**Check these pages:**

1. **People Page** - http://localhost:3000/wiki/people
   - Should show all your storytellers
   - Elder stories should show their elders
   - Each card shows story count

2. **Stories Page** - http://localhost:3000/stories
   - Should show 34 stories total
   - Click any new story
   - Right sidebar should show Story Information box
   - Should show storyteller name and details

3. **Analytics Page** - http://localhost:3000/analytics
   - Total stories: 34
   - Category breakdown includes elder_care
   - Recent activity shows new stories

---

## 🔗 STEP 6: Verify the Connections (2 minutes)

### What we're checking:
Making sure stories are properly linked to storytellers in Supabase.

### Run this SQL in Supabase:

1. Go to Supabase Dashboard
2. Click **"SQL Editor"** in left sidebar
3. Click **"New query"**
4. Paste this SQL:

```sql
-- Check all stories have storytellers
SELECT
  s.title,
  s.story_date,
  p.full_name as storyteller,
  p.preferred_name,
  p.is_elder,
  o.organization_name
FROM stories s
LEFT JOIN profiles p ON s.storyteller_id = p.id
LEFT JOIN organizations o ON s.organization_id = o.id
ORDER BY s.created_at DESC
LIMIT 10;
```

5. Click **"Run"**

### What you should see:

```
title                           | storyteller         | is_elder | organization_name
--------------------------------|--------------------|-----------|-----------------------
Traditional Healing Practices   | Aunty Rose Johnson  | true     | Palm Island Community Company
Growing Up on Palm Island       | Uncle Joe Thaiday   | true     | Palm Island Community Company
Storm Recovery Story            | Community Member    | false    | Palm Island Community Company
...
```

### ✅ Good signs:
- Every story has a `storyteller` name (not NULL)
- Elder stories show `is_elder = true`
- All show `organization_name = Palm Island Community Company`

### ❌ Bad signs:
- Any row shows `storyteller = NULL` → Story not linked to storyteller
- `organization_name = NULL` → Missing organization link

**If you see NULL values**, run this fix:

```sql
-- Fix stories without organization
UPDATE stories
SET organization_id = (SELECT id FROM organizations WHERE organization_name = 'Palm Island Community Company')
WHERE organization_id IS NULL;
```

---

## 🎯 STEP 7: Test Story-Storyteller Navigation (2 minutes)

### What we're testing:
Clicking through the app to ensure all links work.

### Test flow:

1. **Start at Stories Page:**
   ```
   http://localhost:3000/stories
   ```

2. **Click on one of your elder stories**
   - Should go to: `http://localhost:3000/stories/[story-id]`
   - Page loads with story content

3. **Look at right sidebar - Story Information box**
   - Should show storyteller name
   - Should show storyteller photo (or avatar with initials)
   - "Shared by [name]" appears

4. **Click the storyteller name link**
   - Should go to: `http://localhost:3000/wiki/people/[storyteller-id]`
   - Should show storyteller profile
   - Should show list of their stories

5. **Click "All Stories" in navigation**
   - Back to stories grid
   - All stories visible

6. **Go to People page:**
   ```
   http://localhost:3000/wiki/people
   ```
   - Shows all storytellers as cards
   - Shows story count for each
   - Shows location

7. **Filter by elders** (if search works)
   - Should show only elders
   - Your 8 elder storytellers appear

### ✅ Success means:
- All pages load without errors
- All links work (no 404 errors)
- Storyteller information displays correctly
- Story counts are accurate

---

## 📊 STEP 8: Run Final Integrity Check (1 minute)

### SQL to verify everything is connected:

```sql
-- Count stories per storyteller
SELECT
  p.full_name,
  p.is_elder,
  COUNT(s.id) as story_count
FROM profiles p
LEFT JOIN stories s ON s.storyteller_id = p.id
GROUP BY p.id, p.full_name, p.is_elder
ORDER BY story_count DESC;
```

### What you should see:

```
full_name           | is_elder | story_count
--------------------|----------|------------
Aunty Rose Johnson  | true     | 3
Uncle Joe Thaiday   | true     | 2
Community Member    | false    | 15
...
```

### ✅ Verification checklist:

- [ ] All elders show `is_elder = true`
- [ ] Story counts are correct for each person
- [ ] No storyteller has 0 stories (unless they're new and haven't shared yet)
- [ ] Total of all `story_count` = total number of stories

---

## 🎉 YOU'RE DONE!

If you've completed all 8 steps, you now have:

✅ Verified Supabase connection
✅ Confirmed storm stories are in database (26 stories)
✅ Added 8 elder stories
✅ Created/updated elder storyteller profiles
✅ Verified all stories are linked to storytellers
✅ Tested the wiki interface
✅ Checked data integrity

### Your database now contains:
- **34 total stories** (26 storm + 8 elders)
- **Multiple storytellers** (from storm stories + your elders)
- **1 organization** (PICC)
- **All properly connected via foreign keys**

---

## 🚀 What's Next?

Now that your storytellers and stories are set up, you can:

1. **Add profile photos** - Upload images to Supabase Storage and link them
2. **Enhance storyteller bios** - Add more detail, traditional country, languages
3. **Build analytics dashboard** - See contribution patterns, story categories
4. **Create storyteller spotlight** - Feature different elders
5. **Add more stories** - Continue using the import script

---

## 🆘 Troubleshooting

### "I don't see any storytellers in wiki/people"

1. Check Supabase profiles table - are there profiles?
2. Run verification script - what's the storyteller count?
3. Check browser console (F12) for errors
4. Make sure dev server is running

### "Stories show 'Unknown' storyteller"

1. Check Supabase stories table
2. Look at `storyteller_id` column - is it NULL or empty?
3. Run SQL to fix:
```sql
UPDATE stories
SET storyteller_id = (SELECT id FROM profiles WHERE email = 'correct-email@picc.com.au')
WHERE title = 'Your Story Title';
```

### "Import script fails"

1. Check JSON file syntax - use a JSON validator
2. Verify file path is correct
3. Check all required fields are present
4. Look at specific error message

---

## 📞 Quick Commands

```bash
# Check database
cd web-platform && node scripts/verify-database.js

# Import stories
cd web-platform && node scripts/import-elder-stories.js scripts/my-8-elder-stories.json

# Start dev server
cd web-platform && npm run dev

# View in browser
open http://localhost:3000/wiki/people
```

---

**Everything flows through Supabase - it's your single source of truth!** 🎯
