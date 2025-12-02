# Airtable to Supabase Migration Guide
## Palm Island Storytellers & Transcripts

---

## 📊 Overview

**Source**: https://github.com/Acurioustractor/Great-Palm-Island-PICC
**Total Storytellers**: 25
- **6 EXISTING** in database (will be updated with Airtable IDs)
- **19 NEW** storytellers to add

---

## 🎯 Complete Storyteller List

### Existing PICC Members (6) - WILL BE UPDATED
1. ✅ **Roy Prior** - Youth Services Coordinator
2. ✅ **Uncle Frank Daniel Landers** - Cultural Advisor & Elder
3. ✅ **Uncle Alan Palm Island** - Elder
4. ✅ **Ruby Sibley** - Women's Services
5. ⚠️ **Ferdys staff** - Placeholder name (needs real name)
6. ✅ **Goonyun Anderson** - Contributor

### New Storytellers (19) - WILL BE ADDED
7. **Jason** - Community member, 49 years on Palm Island
8. **Alfred Johnson** - Former resident, now in Brisbane
9. **Daniel Patrick Noble** - Visitor from Yarrabah
10. **Ivy** - Visitor, has grandchildren on island
11. **Carmelita & Colette** - Residents (dual profile)
12. **Richard Cassidy** - Community member
13. **Natalie Friday** - Community member
14. **Jenni Calcraft** - Community member
15. **Peggy Palm Island** - Community member
16. **Jess Smit** - Community member
17. **Allison Aley** - Community member
18. **Paige Tanner Hill** - Community member
19. **Iris** - Community member
20. **Irene Nleallajar** - Community member
21. **Henry Doyle** - Community member
22. **Men's Group** - Collective voice (group profile)
23. **Childcare workers** - Service providers (group profile)
24. **Ethel and Iris Ferdies** - Community members (dual profile)
25. **Elders Group** - Collective wisdom (group profile)

---

## 📋 Available Data Fields

### From Airtable JSON
```json
{
  "id": "recWvX38lmm9goNjC",           // Airtable record ID
  "name": "Jason",                     // Full name
  "bio": "Long biography...",          // Detailed biography
  "location": "Palm Island",           // Current location
  "project": "Goods.",                 // Project name
  "role": "",                          // Community role
  "organization": "",                  // Organization name
  "profileImage": "https://...",       // Profile photo URL (Airtable - expires in 2 hours)
  "dateRecorded": "2025-01-18...",    // Recording date

  // Story content
  "storyTitle": "",                    // Story title (often empty)
  "storyContent": "",                  // Story content (often empty)
  "themes": "...",                     // Themes from transcript
  "tags": ["Innovation", "Comfort"],   // Thematic tags

  // Rich metadata
  "metadata": {
    "Preferred Name": "Jason",
    "Consent Status": "Consent for Commercial Use",
    "Preferred Anonymity Level": "Full Name",
    "Personal Quote": "Try it...",
    "Transcript (from Media)": ["Full transcript..."],
    "Theme (from Quotes)": [...],
    "Website themes": [...]
  }
}
```

---

## 🚀 Step-by-Step Migration Process

### Step 1: Run the SQL Migration Script

```bash
# Execute the migration SQL
psql $DATABASE_URL -f migrate_airtable_storytellers.sql
```

This will:
- ✅ Add 19 NEW storytellers
- ✅ Update 6 EXISTING storytellers with Airtable IDs
- ✅ Store Airtable metadata in JSONB column
- ✅ Link all to PICC organization

### Step 2: Migrate Profile Images

⚠️ **IMPORTANT**: Airtable image URLs expire after 2 hours!

You need to:
1. Download images from Airtable
2. Upload to Supabase Storage (`profile-images` bucket)
3. Update `profile_image_url` in profiles

```sql
-- Example: Update profile image after uploading to Supabase
UPDATE profiles
SET profile_image_url = 'https://[your-project].supabase.co/storage/v1/object/public/profile-images/picc/jason.jpg'
WHERE metadata->>'airtable_id' = 'recWvX38lmm9goNjC';
```

**Automated Script** (Node.js example):
```javascript
// download_airtable_images.js
const fetch = require('node-fetch');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrateImages() {
  const storytellers = await fetch('https://raw.githubusercontent.com/Acurioustractor/Great-Palm-Island-PICC/main/data/storytellers.json')
    .then(r => r.json());

  for (const storyteller of storytellers) {
    if (!storyteller.profileImage) continue;

    // Download from Airtable
    const imageBlob = await fetch(storyteller.profileImage).then(r => r.blob());

    // Upload to Supabase
    const filename = `${storyteller.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(`picc/${filename}`, imageBlob);

    if (!error) {
      // Update profile
      const publicUrl = supabase.storage.from('profile-images').getPublicUrl(`picc/${filename}`).data.publicUrl;

      await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('metadata->>airtable_id', storyteller.id);
    }
  }
}
```

### Step 3: Create Stories from Transcripts

Each storyteller has **transcript data** that can become a story!

**Field Mapping:**
- `metadata.Transcript (from Media)` → `stories.content`
- `metadata.Personal Quote` → Feature in story
- `themes` → Story themes/tags
- `tags` → Story tags

**Example SQL to Create Story from Transcript**:
```sql
-- Create a story from Jason's transcript
INSERT INTO stories (
  tenant_id,
  organization_id,
  storyteller_id,
  title,
  content,
  summary,
  story_type,
  story_category,
  tags,
  privacy_level,
  is_public,
  status,
  published_at
)
SELECT
  '9c4e5de2-d80a-4e0b-8a89-1bbf09485532', -- PICC tenant ID
  '3c2011b9-f80d-4289-b300-0cd383cff479', -- PICC org ID
  p.id,                                    -- Storyteller profile ID
  'Life on Palm Island - Jason''s Story', -- Generate title
  p.metadata->>'Transcript (from Media)', -- Full transcript as content
  p.bio,                                   -- Use bio as summary
  'community_story',
  'community',
  string_to_array(p.metadata->>'tags', ',')::text[],
  'public',
  TRUE,
  'published',
  NOW()
FROM profiles p
WHERE p.metadata->>'airtable_id' = 'recWvX38lmm9goNjC'; -- Jason's Airtable ID
```

### Step 4: Bulk Create All Stories from Transcripts

```sql
-- Create stories for ALL storytellers with transcripts
INSERT INTO stories (
  tenant_id,
  organization_id,
  storyteller_id,
  title,
  content,
  summary,
  story_type,
  story_category,
  tags,
  privacy_level,
  is_public,
  status,
  published_at
)
SELECT
  '9c4e5de2-d80a-4e0b-8a89-1bbf09485532',
  '3c2011b9-f80d-4289-b300-0cd383cff479',
  p.id,
  p.full_name || '''s Story - ' || COALESCE(p.metadata->>'project', 'Palm Island Life'),
  COALESCE(
    p.metadata->>'Transcript (from Media)',
    p.bio
  ),
  p.bio,
  'community_story',
  'community',
  CASE
    WHEN p.metadata ? 'tags' THEN
      (SELECT array_agg(value::text) FROM jsonb_array_elements_text(p.metadata->'tags'))
    ELSE ARRAY[]::text[]
  END,
  'public',
  TRUE,
  'published',
  COALESCE(
    (p.metadata->>'dateRecorded')::timestamp,
    NOW()
  )
FROM profiles p
WHERE p.metadata ? 'airtable_id'
  AND p.metadata ? 'Transcript (from Media)'
  AND p.metadata->>'Transcript (from Media)' IS NOT NULL
  AND p.metadata->>'Transcript (from Media)' != '';
```

---

## 📊 Data Structure Summary

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  preferred_name TEXT,
  bio TEXT,
  location TEXT,
  community_role TEXT,
  storyteller_type TEXT,
  profile_image_url TEXT,     -- ← NEW: Add this column
  profile_visibility TEXT,
  primary_organization_id UUID,
  metadata JSONB              -- ← Stores full Airtable record
);
```

### Metadata JSONB Structure
```json
{
  "airtable_id": "recWvX38lmm9goNjC",
  "project": "Goods.",
  "consent_status": "Consent for Commercial Use",
  "anonymity_level": "Full Name",
  "personal_quote": "Try it...",
  "tags": "[\"Innovation\", \"Comfort\"]",
  "date_recorded": "2025-01-18",
  "type": "individual|group_profile",
  "current_location": "Brisbane",    // If different from Palm Island
  "home_location": "Yarrabah",       // Original home
  "note": "Any special notes"
}
```

---

## 🔍 Useful Queries

### Find all storytellers from Airtable
```sql
SELECT
  full_name,
  preferred_name,
  storyteller_type,
  metadata->>'airtable_id' as airtable_id,
  metadata->>'consent_status' as consent
FROM profiles
WHERE metadata ? 'airtable_id'
ORDER BY full_name;
```

### Find storytellers with transcripts
```sql
SELECT
  full_name,
  metadata ? 'Transcript (from Media)' as has_transcript,
  length(metadata->>'Transcript (from Media)') as transcript_length
FROM profiles
WHERE metadata ? 'airtable_id'
ORDER BY transcript_length DESC;
```

### Count stories created from transcripts
```sql
SELECT
  COUNT(*) as total_stories,
  COUNT(DISTINCT storyteller_id) as unique_storytellers
FROM stories
WHERE organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479';
```

### Find group profiles
```sql
SELECT full_name, storyteller_type
FROM profiles
WHERE metadata->>'type' = 'group_profile';
```

---

## ⚠️ Important Notes

### 1. **Profile Images**
- Airtable URLs expire after 2 hours
- Must download and re-upload to Supabase Storage
- Store in `profile-images/picc/` bucket

### 2. **Dual/Group Profiles**
Consider splitting these into individual profiles:
- "Carmelita & Colette" → 2 separate profiles
- "Ethel and Iris Ferdies" → 2 separate profiles
- Keep group profiles as-is: "Men's Group", "Elders Group", "Childcare workers"

### 3. **Transcripts**
- Full transcripts available in `metadata->>'Transcript (from Media)'`
- Can be used to create rich story content
- Often 1000+ words of authentic voice

### 4. **Consent**
- All have "Consent for Commercial Use"
- Anonymity levels stored in metadata
- Respect "Preferred Anonymity Level" field

### 5. **"Ferdys staff" Placeholder**
- This is still a placeholder name
- Need to identify actual staff member name
- Airtable ID: `rec1nRwGZLR07lLFr`

---

## 🎯 Next Steps

1. ✅ Run migration SQL script
2. 🔄 Download and migrate profile images
3. 📝 Create stories from transcripts
4. 🖼️ Add photos to stories from media URLs
5. 👥 Consider splitting dual profiles
6. ⚠️ Replace "Ferdys staff" with real name
7. 🎨 Build storyteller directory page
8. 📖 Create transcript viewer component

---

## 📁 File Locations

- Migration SQL: `migrate_airtable_storytellers.sql`
- Source Data: https://raw.githubusercontent.com/Acurioustractor/Great-Palm-Island-PICC/main/data/storytellers.json
- This Guide: `AIRTABLE_MIGRATION_GUIDE.md`

---

## 🆘 Troubleshooting

### Images not loading?
Airtable URLs expire! Download immediately and upload to Supabase.

### Transcript not showing?
Check: `metadata->>'Transcript (from Media)'`

### Story creation failing?
Ensure `storyteller_id` exists and matches profile UUID.

### Duplicate profiles?
Use Airtable ID to prevent duplicates:
```sql
WHERE metadata->>'airtable_id' = 'recXXXXXXXX'
```

---

**✨ Migration ready! Run the SQL script to add all 25 storytellers.**
