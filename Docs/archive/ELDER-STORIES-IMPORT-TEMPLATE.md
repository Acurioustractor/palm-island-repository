# 🌟 Elder Stories Import Template

## For Adding Your 8 Elder Stories

---

## Option 1: Simple Spreadsheet (Easiest!)

Create a Google Sheet or Excel file with these columns:

| Title | Storyteller Name | Story Content | Story Date | Cultural Sensitivity | Elder Approved |
|-------|------------------|---------------|------------|---------------------|----------------|
| Aunty's Journey | Aunty Rose | The full story text here... | 2024-01-15 | high | yes |
| Uncle's Wisdom | Uncle Joe | Another story here... | 2023-12-10 | high | yes |

**Then save as CSV:** `elder-stories.csv`

---

## Option 2: JSON File (For Bulk Import)

Create: `elder-stories-import.json`

```json
[
  {
    "title": "Traditional Healing Practices",
    "storyteller_name": "Aunty Rose Johnson",
    "storyteller_email": "rose@example.com",
    "content": "The full story content goes here. This is where the elder shares their knowledge, experiences, and wisdom. Can be multiple paragraphs.\n\nSecond paragraph here...",
    "summary": "A brief 1-2 sentence summary of what this story is about",
    "story_date": "2023-06-15",
    "story_category": "elder_care",
    "emotional_theme": "healing",
    "cultural_sensitivity_level": "high",
    "elder_approval_given": true,
    "access_level": "community",
    "location": "Palm Island",
    "traditional_knowledge": true,
    "language_used": "English and Traditional Language",
    "tags": ["healing", "traditional knowledge", "medicine", "elder wisdom"]
  },
  {
    "title": "Growing Up on Palm Island",
    "storyteller_name": "Uncle Joe Thaiday",
    "storyteller_email": "joe@example.com",
    "content": "Story content here...",
    "summary": "Uncle Joe's memories of childhood on Palm Island",
    "story_date": "2023-08-20",
    "story_category": "elder_care",
    "emotional_theme": "connection_belonging",
    "cultural_sensitivity_level": "medium",
    "elder_approval_given": true,
    "access_level": "public",
    "location": "Palm Island",
    "traditional_knowledge": false,
    "tags": ["childhood", "memories", "community history"]
  }
]
```

---

## Option 3: SQL Insert (Direct Database)

Create: `import-elder-stories.sql`

```sql
-- First, ensure storytellers exist
INSERT INTO profiles (
  full_name,
  preferred_name,
  email,
  storyteller_type,
  is_elder,
  location,
  organization_id
) VALUES
  ('Aunty Rose Johnson', 'Aunty Rose', 'rose@picc.com.au', 'elder', true, 'Palm Island', '3c2011b9-f80d-4289-b300-0cd383cff479'),
  ('Uncle Joe Thaiday', 'Uncle Joe', 'joe@picc.com.au', 'elder', true, 'Palm Island', '3c2011b9-f80d-4289-b300-0cd383cff479')
ON CONFLICT (email) DO NOTHING;

-- Then insert stories
INSERT INTO stories (
  title,
  content,
  summary,
  story_category,
  emotional_theme,
  cultural_sensitivity_level,
  elder_approval_given,
  access_level,
  story_date,
  location,
  is_public,
  organization_id,
  storyteller_id
) VALUES (
  'Traditional Healing Practices',
  'The full story content goes here...',
  'A brief summary',
  'elder_care',
  'healing',
  'high',
  true,
  'community',
  '2023-06-15',
  'Palm Island',
  true,
  '3c2011b9-f80d-4289-b300-0cd383cff479',
  (SELECT id FROM profiles WHERE email = 'rose@picc.com.au')
);
```

---

## Fields Explained

### Required Fields:
- **title**: Story title (short, descriptive)
- **content**: The full story text
- **storyteller_name**: Elder's name
- **story_category**: Use `elder_care` for elder stories

### Optional but Recommended:
- **summary**: Brief 1-2 sentence summary
- **story_date**: When the story took place or was shared
- **emotional_theme**: Choose from:
  - `healing`
  - `resilience`
  - `connection_belonging`
  - `pride_accomplishment`
  - `hope_aspiration`
- **cultural_sensitivity_level**: Choose from:
  - `low` - General content
  - `medium` - Some cultural elements
  - `high` - Significant cultural content
  - `restricted` - Sacred/restricted knowledge
- **access_level**: Choose from:
  - `public` - Anyone can see
  - `community` - Community members only
  - `restricted` - Elders/cultural advisors only
- **elder_approval_given**: `true` or `false`
- **location**: Usually "Palm Island"
- **tags**: Keywords for searching (array)

---

## Quick Data Entry Form

**For each of your 8 elder stories, fill this out:**

### Story 1:
```
Title: ___________________________________________
Storyteller: ______________________________________
Date: ____________________________________________
Summary: _________________________________________
___________________________________________________

Content:
___________________________________________________
___________________________________________________
___________________________________________________
(continue on separate sheet if needed)

Cultural Sensitivity: □ Low  □ Medium  □ High  □ Restricted
Access Level: □ Public  □ Community  □ Restricted
Elder Approved: □ Yes  □ No
```

---

## Import Methods

### Method 1: Via Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Table Editor**
4. Click **stories** table
5. Click **Insert Row**
6. Fill in fields manually
7. Repeat for each story

### Method 2: Via SQL Editor
1. Create SQL file using template above
2. Go to Supabase Dashboard → SQL Editor
3. Paste your SQL
4. Click Run

### Method 3: Via Import Script (I can create this!)
1. Fill out JSON file
2. I'll create a Node.js script to import
3. Run: `node import-elder-stories.js`

---

## Storyteller Information Needed

For each elder, we need:

```
Full Name: ________________________________________
Preferred Name: ___________________________________
Email (optional): _________________________________
Phone (optional): _________________________________
Bio (short paragraph): ____________________________
___________________________________________________
Profile Photo: [file path or will add later]
Traditional Country: ______________________________
Language Group: ___________________________________
```

---

## Example Elder Story Entry

```json
{
  "title": "Fishing with Grandfather on Traditional Lands",
  "storyteller_name": "Uncle Bob Watson",
  "storyteller_email": "bob@picc.com.au",
  "content": "I remember as a young boy, my grandfather would take me out fishing on our traditional lands. He taught me not just how to fish, but how to read the water, respect the country, and understand the seasons.\n\nHe would say, 'The country will provide if you listen and respect it.' Those words have stayed with me all these years.\n\nWe would catch barramundi, and he would show me the proper way to prepare and share the catch with family and community. Nothing was wasted. Everything had purpose and meaning.\n\nThose days fishing taught me more than just survival skills - they taught me who I am, where I come from, and my responsibility to country and community.",
  "summary": "Uncle Bob shares cherished memories of learning traditional fishing practices and cultural values from his grandfather",
  "story_date": "1965-01-01",
  "story_category": "elder_care",
  "emotional_theme": "connection_belonging",
  "cultural_sensitivity_level": "medium",
  "elder_approval_given": true,
  "access_level": "public",
  "location": "Palm Island Traditional Lands",
  "traditional_knowledge": true,
  "tags": ["traditional fishing", "grandfather", "cultural learning", "traditional lands", "intergenerational knowledge"]
}
```

---

## Next Steps

1. **Choose your format**: Spreadsheet, JSON, or SQL
2. **Gather the stories**: Collect all 8 stories in your chosen format
3. **Collect storyteller info**: Make sure we have profiles for each elder
4. **Let me know when ready**: I can create an import script if needed

---

## Questions to Answer for Each Story

- ✅ What is the story about?
- ✅ Who is the storyteller (which elder)?
- ✅ When did this story take place?
- ✅ Is there cultural/traditional knowledge in it?
- ✅ What access level should it have?
- ✅ Has an elder approved sharing it?
- ✅ Any photos or media to include?

---

**I'm ready to help import these stories once you have them ready!** 🌟

Would you like me to create an automated import script for you?
