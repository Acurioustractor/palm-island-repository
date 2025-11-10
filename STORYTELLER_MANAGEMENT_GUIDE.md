# Storyteller Management System

A complete system for managing storyteller profiles, uploading photos, and linking interview transcripts.

## What You Can Do

### 1. View All Storytellers
- Go to: `http://localhost:3000/picc/storytellers`
- See cards with photos, bios, stats
- Search by name
- Filter by type (Elder, Community Member, Youth, etc.)
- Stats dashboard showing:
  - Total storytellers
  - Number of Elders
  - Total stories contributed
  - Total interviews recorded

### 2. Add New Storyteller
- Click "Add Storyteller" button
- Fill in:
  - **Basic Info**: Full name, preferred name, bio
  - **Profile Photo**: Upload image (JPG, PNG, WebP - max 5MB)
  - **Type**: Community member, Elder, Youth, Service Provider, Cultural Advisor
  - **Special Roles**: Check boxes for Elder, Cultural Advisor
  - **Location**: Palm Island (default), Traditional Country, Language Group
  - **Contact**: Email, Phone (optional)

- Photos are uploaded to Supabase `profile-images` storage bucket
- Public URLs are stored in `profiles.profile_image_url`

### 3. Manage Interviews & Transcripts
- Click "Interviews" button on any storyteller card
- Add interview transcripts:
  - Interview title (e.g., "Youth Services Interview - Roy Prior")
  - Interview date
  - Duration (minutes)
  - **Raw Transcript** (paste full verbatim text)
  - Interview notes (context, themes, follow-ups)

- View all interviews for a storyteller
- See transcript previews
- Click "View Full Transcript" to see complete text
- Delete interviews if needed

### 4. Action Buttons on Each Card
- **Edit**: Update storyteller profile
- **Interviews**: Manage interview transcripts
- **Photo**: Upload/change profile photo

## Database Setup

Before using this system, run these SQL files in Supabase SQL Editor:

### Step 1: Add Profile Image Fields
```bash
# In Supabase SQL Editor, run:
web-platform/lib/empathy-ledger/add-profile-images.sql
```

This adds:
- `profile_image_url` - URL to profile photo
- `social_links` - JSON field for social media
- `interviews_completed` - Count of interviews

### Step 2: Create Interviews Table
```bash
# In Supabase SQL Editor, run:
web-platform/lib/empathy-ledger/interviews-schema.sql
```

This creates the `interviews` table with fields:
- `interview_title` - Title/description
- `interview_date` - When the interview happened
- `interview_duration_minutes` - Length of interview
- `raw_transcript` - Unedited verbatim transcript
- `edited_transcript` - Cleaned up version
- `interview_notes` - Context and themes
- `status` - Processing status (raw, transcribed, edited, approved)
- Links to storyteller via `storyteller_id`

### Step 3: Verify Storage Bucket Exists
The `profile-images` bucket should already exist from previous setup. If not:
```sql
-- Create profile-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public uploads
CREATE POLICY "Anyone can upload profile images"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-images');
```

## File Structure

```
/picc/storytellers/
├── page.tsx                           # Main listing page
├── new/
│   └── page.tsx                       # Add new storyteller
└── [id]/
    └── interviews/
        └── page.tsx                   # Manage interviews
```

## Workflow Example

### Adding a New Storyteller with Interview:

1. **Add Storyteller**
   - Go to `/picc/storytellers`
   - Click "Add Storyteller"
   - Fill in: "Uncle Frank Foster"
   - Upload profile photo
   - Select type: "Elder"
   - Check "Elder" and "Cultural Advisor" boxes
   - Add bio: "Cultural advisor and Elder sharing traditional knowledge"
   - Save

2. **Add Interview Transcript**
   - From storyteller card, click "Interviews"
   - Click "Add Interview"
   - Title: "Cultural Centre Stories - Uncle Frank"
   - Date: Select interview date
   - Duration: 45 minutes
   - Paste raw transcript from audio recording
   - Notes: "Discussed traditional practices, cultural centre programs"
   - Save

3. **Link to Stories**
   - Interview is now stored and linked to Uncle Frank's profile
   - Can be referenced when creating new stories
   - Transcript searchable for quotes and content

## Best Practices

### For Profile Photos:
- Use clear, high-quality photos
- Recommended: 800x800px or larger
- File size under 2MB for fast loading
- JPG or PNG format

### For Interview Transcripts:
- **Raw Transcript**: Paste verbatim text from transcription service
  - Include timestamps if available
  - Keep speaker labels (Interviewer:, Uncle Frank:)
  - Don't edit or clean up yet

- **Interview Notes**: Add context
  - Main themes discussed
  - Follow-up questions needed
  - Connections to other stories
  - Cultural protocols to remember

- **Status Workflow**:
  1. `raw` - Just added, needs review
  2. `transcribed` - Checked for accuracy
  3. `edited` - Cleaned up, ready to use
  4. `approved` - Elder-approved for publication

### For Storyteller Bios:
- Keep it concise (2-3 sentences)
- Mention community role
- Highlight expertise or connection to stories
- Examples:
  - "Elder and cultural advisor at Palm Island Cultural Centre. Shares traditional knowledge about Bwgcolman country and language."
  - "Youth Services Coordinator working with young people on Palm Island. Facilitates sports programs and mentorship."

## Integration with Existing Systems

### Stories Table
Stories already have `storyteller_id` field linking to profiles:
```sql
SELECT
  s.title,
  p.full_name as storyteller,
  s.content
FROM stories s
JOIN profiles p ON s.storyteller_id = p.id
WHERE p.id = 'storyteller-uuid';
```

### Interview → Story Pipeline
1. Conduct interview
2. Add transcript to system
3. Review and edit transcript
4. Extract story segments
5. Create new story entries linked to storyteller
6. Reference original interview for attribution

## Future Enhancements (not built yet)

- **Audio/Video Upload**: Store raw recordings
- **AI Transcription**: Auto-generate transcripts from audio
- **Story Extraction**: AI-powered story identification from interviews
- **Cultural Tagging**: Automatically tag cultural themes
- **Elder Approval Workflow**: Digital approval process for cultural content

## Troubleshooting

### "Column profile_image_url does not exist"
Run: `web-platform/lib/empathy-ledger/add-profile-images.sql`

### "Table interviews does not exist"
Run: `web-platform/lib/empathy-ledger/interviews-schema.sql`

### "Storage policy violation" when uploading photos
Check that `profile-images` bucket exists and has public INSERT policy

### Interview count not updating
The system automatically increments `interviews_completed` when you add an interview. If it's wrong, update manually:
```sql
UPDATE profiles
SET interviews_completed = (
  SELECT COUNT(*) FROM interviews WHERE storyteller_id = profiles.id
)
WHERE id = 'storyteller-uuid';
```

## Example Data

### Sample Storyteller Profile:
```json
{
  "full_name": "Uncle Frank Foster",
  "preferred_name": "Uncle Frank",
  "bio": "Elder and cultural advisor at Palm Island Cultural Centre",
  "storyteller_type": "elder",
  "is_elder": true,
  "is_cultural_advisor": true,
  "location": "Palm Island",
  "traditional_country": "Bwgcolman",
  "language_group": "Manbarra",
  "profile_image_url": "https://[bucket-url]/profile-images/uuid-123.jpg"
}
```

### Sample Interview:
```json
{
  "interview_title": "Cultural Centre Programs - Uncle Frank Foster",
  "interview_date": "2024-11-08",
  "interview_duration_minutes": 45,
  "raw_transcript": "[Full verbatim transcript here...]",
  "interview_notes": "Discussed traditional practices, language preservation, and youth engagement programs",
  "status": "transcribed",
  "storyteller_id": "uncle-frank-uuid"
}
```

---

**Ready to use!** Start by running the database migrations, then go to `/picc/storytellers` to begin adding storyteller profiles.
