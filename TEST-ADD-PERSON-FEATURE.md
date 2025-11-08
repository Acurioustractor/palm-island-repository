# 🧪 Test: Add Person Feature

## What I Built For You

I've created a **simple frontend form** to add people (storytellers) to your database! This makes it easy to quickly add community members without using Supabase Dashboard or import scripts.

---

## ✨ Features

### Two Ways to Add People:

**1. Quick Add (Just Essentials):**
- Full Name (required)
- Storyteller Type
- Elder status checkbox
- Location

**2. Detailed Add (All Information):**
- All quick add fields PLUS:
- Preferred name
- Email & phone
- Traditional country & language group
- Community role
- Biography
- Expertise areas (comma separated)
- Languages spoken (comma separated)

### Smart Features:
- ✅ Form validation (required fields)
- ✅ Clear error messages
- ✅ Success confirmation
- ✅ Auto-redirect to person's profile after saving
- ✅ Collapsible advanced section
- ✅ Connects directly to Supabase
- ✅ Helpful tips included

---

## 🚀 How to Test

### Step 1: Set Up Environment File (One-Time Setup)

You need a `.env.local` file for the app to connect to Supabase.

```bash
cd web-platform

# Copy the example file
cp .env.local.example .env.local
```

The file should contain:
```env
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk5MTU5OTksImV4cCI6MjAzNTQ5MTk5OX0.JGqYN9QyXfzWqZPJrFPGLxNz_lTXN2ydKI71hQGQ0e0
```

### Step 2: Start the Development Server

```bash
cd web-platform
npm run dev
```

Wait for:
```
✓ Ready on http://localhost:3000
```

### Step 3: Navigate to People Page

Open in your browser:
```
http://localhost:3000/wiki/people
```

**What you should see:**
- "Community Storytellers" heading
- **NEW: "Add Person" button** in the top right (amber/orange color)
- List of existing storytellers (if any)
- Search and filter controls

### Step 4: Click "Add Person" Button

This takes you to:
```
http://localhost:3000/wiki/people/add
```

**What you should see:**
- "Add New Person" heading
- Form with essential fields
- "Additional Information" section (collapsed)
- "Add Person" and "Cancel" buttons at bottom
- Tips section at bottom

---

## 📝 Test Cases

### Test 1: Quick Add (Minimum Fields)

**Goal:** Add a person with just the essentials

**Steps:**
1. Go to http://localhost:3000/wiki/people/add
2. Fill in:
   - Full Name: `Test Person 1`
   - Leave everything else as default
3. Click "Add Person"

**Expected Result:**
- ✅ Shows "Person Added Successfully!" message
- ✅ Redirects to person's profile page
- ✅ Person appears in Supabase `profiles` table
- ✅ Person appears in http://localhost:3000/wiki/people

**Verify in Supabase:**
1. Go to: https://supabase.com/dashboard
2. Select project
3. Table Editor → `profiles`
4. Find "Test Person 1"
5. Check fields:
   - `full_name` = "Test Person 1"
   - `location` = "Palm Island"
   - `storyteller_type` = "community_member"
   - `is_elder` = false

---

### Test 2: Add an Elder with Details

**Goal:** Add a community elder with full information

**Steps:**
1. Go to http://localhost:3000/wiki/people/add
2. Fill in essentials:
   - Full Name: `Aunty Mary Williams`
   - Preferred Name: `Aunty Mary`
   - Storyteller Type: Select "Elder"
   - Check "This person is an Elder" ✓
   - Location: `Palm Island`

3. Click "Additional Information" to expand

4. Fill in advanced:
   - Email: `mary@picc.com.au`
   - Phone: `0411 222 333`
   - Traditional Country: `Manbarra Country`
   - Language Group: `Bwgcolman`
   - Community Role: `Cultural Advisor`
   - Biography: `Aunty Mary is a respected elder with deep knowledge of traditional healing practices. She has been sharing her wisdom with younger generations for over 30 years.`
   - Expertise Areas: `Traditional Healing, Bush Medicine, Storytelling`
   - Languages Spoken: `English, Traditional Language`

5. Click "Add Person"

**Expected Result:**
- ✅ Form submits successfully
- ✅ Success message appears
- ✅ Redirects to profile page
- ✅ All fields saved in database

**Verify in Supabase:**
- `full_name` = "Aunty Mary Williams"
- `preferred_name` = "Aunty Mary"
- `storyteller_type` = "elder"
- `is_elder` = true
- `email` = "mary@picc.com.au"
- `bio` = (full text)
- `expertise_areas` = Array: ["Traditional Healing", "Bush Medicine", "Storytelling"]
- `languages_spoken` = Array: ["English", "Traditional Language"]

---

### Test 3: Validation (Missing Required Field)

**Goal:** Ensure form validates required fields

**Steps:**
1. Go to http://localhost:3000/wiki/people/add
2. Leave "Full Name" empty
3. Click "Add Person"

**Expected Result:**
- ❌ Form does NOT submit
- ❌ Shows error message: "Full name is required"
- ❌ Red error box appears at top
- ✅ Form stays on page (doesn't redirect)

---

### Test 4: Add Multiple People Quickly

**Goal:** Test rapid adding of several people

**Steps:**
1. Add 5 people with just names:
   - `John Smith`
   - `Sarah Jones`
   - `David Brown`
   - `Emma Wilson`
   - `Michael Taylor`

2. For each:
   - Enter name
   - Click "Add Person"
   - Wait for redirect
   - Go back to /wiki/people
   - Click "Add Person" again

**Expected Result:**
- ✅ All 5 people added successfully
- ✅ All appear in people list
- ✅ All in Supabase profiles table
- ✅ Can add quickly without advanced fields

---

### Test 5: Data Types (Arrays)

**Goal:** Test comma-separated fields convert to arrays

**Steps:**
1. Add person with:
   - Full Name: `Test Arrays`
   - Expertise Areas: `Fishing, Hunting, Tracking, Swimming`
   - Languages Spoken: `English, Creole, Traditional`

2. Submit

3. Check in Supabase:
   - Click on the new row
   - Check `expertise_areas` column
   - Check `languages_spoken` column

**Expected Result:**
- ✅ `expertise_areas` = `["Fishing", "Hunting", "Tracking", "Swimming"]` (JSON array)
- ✅ `languages_spoken` = `["English", "Creole", "Traditional"]` (JSON array)
- ✅ No extra whitespace
- ✅ Commas removed

---

### Test 6: Navigation Flow

**Goal:** Test all navigation paths work

**Steps:**
1. Start at http://localhost:3000/wiki/people
2. Click "Add Person" → should go to /wiki/people/add
3. Click "Back" button → should return to /wiki/people
4. Click "Add Person" again
5. Click "Cancel" button → should return to /wiki/people
6. Click "Add Person" again
7. Fill in name: `Navigation Test`
8. Submit → should redirect to /wiki/people/[new-id]
9. Note the person's ID in URL
10. Go to /wiki/people → should see "Navigation Test" in list
11. Click on "Navigation Test" card → should go to their profile

**Expected Result:**
- ✅ All navigation buttons work
- ✅ Back/Cancel return to people list
- ✅ Success redirects to profile
- ✅ Profile link works from list

---

## 🔍 What to Check in Supabase

After adding people, verify in Supabase Dashboard:

### 1. Profiles Table
```
https://supabase.com/dashboard → Your Project → Table Editor → profiles
```

Check:
- New rows appear
- `full_name` field populated
- `storyteller_type` has correct value
- `is_elder` is true/false as expected
- Arrays are properly formatted (not strings)
- Timestamps in `created_at` and `updated_at`

### 2. Run SQL Query

In Supabase SQL Editor:

```sql
-- See all recently added people
SELECT
  full_name,
  preferred_name,
  storyteller_type,
  is_elder,
  location,
  email,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Problem: "Cannot find module 'dotenv'" error

**Solution:** Install dependencies
```bash
cd web-platform
npm install
```

### Problem: Form submits but person doesn't appear

**Check:**
1. Browser console (F12) for errors
2. Supabase Dashboard → profiles table
3. Network tab in DevTools → check API calls

**Fix:**
- Verify `.env.local` exists and has correct values
- Check Supabase project is active
- Try refreshing people page

### Problem: Error: "Failed to add person: [some error]"

**Common causes:**
- Duplicate email address
- Database connection issue
- Missing required field in database

**Fix:**
- Use unique email or leave blank
- Check internet connection
- Check Supabase project status

### Problem: Success message shows but redirect doesn't work

**Cause:** The person was added, but profile page doesn't exist yet

**Fix:**
- This is okay! The person is still in the database
- Click "Back" to see them in the list
- The individual profile page needs to be built separately

### Problem: Arrays not saving correctly

**Check:** Make sure you're using commas to separate items

**Good:** `Fishing, Hunting, Swimming`
**Bad:** `Fishing; Hunting; Swimming`

---

## 📊 Success Criteria

You'll know it's working when:

- ✅ Can navigate to /wiki/people/add
- ✅ Form loads without errors
- ✅ Can submit with just Full Name
- ✅ Success message appears
- ✅ New person appears in Supabase profiles table
- ✅ New person appears in /wiki/people list
- ✅ All fields save correctly
- ✅ Arrays convert properly
- ✅ Validation prevents empty submissions

---

## 🎯 Quick Test Checklist

Use this for a quick test:

- [ ] `.env.local` file created
- [ ] Dev server running (`npm run dev`)
- [ ] Can access http://localhost:3000/wiki/people
- [ ] "Add Person" button visible
- [ ] Form loads at /wiki/people/add
- [ ] Can add person with just name
- [ ] Success message appears
- [ ] Person in Supabase profiles table
- [ ] Person appears in people list
- [ ] Can add person with all details
- [ ] Arrays save correctly
- [ ] Validation works (empty name rejected)
- [ ] Navigation works (back, cancel buttons)

---

## 📁 Files Created/Modified

**New Files:**
- `web-platform/app/wiki/people/add/page.tsx` - Add person form page

**Modified Files:**
- `web-platform/app/wiki/people/page.tsx` - Added "Add Person" button

---

## 🔗 Supabase Connection

The form connects to Supabase like this:

```typescript
const supabase = createClient(); // Uses credentials from .env.local

const { data, error } = await supabase
  .from('profiles')          // Insert into profiles table
  .insert([profileData])     // Your form data
  .select()                  // Return the new record
  .single();                 // Get just one record back
```

All data goes directly into your Supabase `profiles` table!

---

## 🚀 Next Steps After Testing

Once the form works:

1. **Add more storyteller types** if needed
2. **Add file upload** for profile photos
3. **Build individual profile pages** to show full details
4. **Add edit functionality** to update existing people
5. **Add bulk import** from CSV file

---

## 💡 Usage Tips

**For Quick Entry:**
- Use quick add for basic info
- Add details later via edit

**For Complete Profiles:**
- Expand "Additional Information"
- Fill in cultural details
- Add expertise and languages

**For Elders:**
- Select "Elder" type
- Check "This person is an Elder"
- Add traditional knowledge details

**For Service Providers:**
- Select "Service Provider" type
- Add community role
- List expertise areas

---

**Ready to test! Follow the steps above and let me know what you find!** 🎉
