-- ============================================================================
-- IMPORT TRANSCRIPTS AS STORIES
-- Palm Island Community Repository
-- ============================================================================
--
-- INSTRUCTIONS:
-- 1. First ensure the storyteller exists in the profiles table
-- 2. Replace [placeholder] values with real transcript content
-- 3. Copy the TRANSCRIPT block for each transcript to import
-- 4. Run against your Supabase database
--
-- NOTES:
-- - Transcripts are imported as 'draft' status for review before publishing
-- - Long transcripts can be split across multiple paragraphs in the content field
-- - Metadata captures recording details for reference
--
-- ============================================================================

DO $$
DECLARE
  picc_org_id UUID := '3c2011b9-f80d-4289-b300-0cd383cff479';
  picc_tenant_id UUID := '9c4e5de2-d80a-4e0b-8a89-1bbf09485532';
  storyteller_id UUID;
  service_id UUID;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Importing transcripts as stories...';
  RAISE NOTICE '========================================';

  -- ============================
  -- TRANSCRIPT 1: Example Entry
  -- ============================

  -- Find the storyteller
  SELECT id INTO storyteller_id
  FROM profiles
  WHERE full_name = 'Roy Prior'  -- CHANGE: Match to existing storyteller
    AND primary_organization_id = picc_org_id;

  IF storyteller_id IS NULL THEN
    RAISE WARNING 'Storyteller not found: Roy Prior';
  ELSE
    -- Optionally link to a service
    SELECT id INTO service_id
    FROM organization_services
    WHERE service_slug = 'youth_services'  -- CHANGE: or NULL for no service link
      AND organization_id = picc_org_id;

    INSERT INTO stories (
      tenant_id,
      organization_id,
      service_id,
      storyteller_id,
      author_id,
      title,
      content,
      summary,
      story_type,
      story_category,
      privacy_level,
      is_public,
      status,
      metadata
    ) VALUES (
      picc_tenant_id,
      picc_org_id,
      service_id,
      storyteller_id,
      storyteller_id,  -- Usually same as storyteller for transcripts
      'Example Interview: Youth Leadership on Palm Island',  -- CHANGE: Title
      -- CHANGE: Full transcript content below
      'This is the full transcript of the interview.

The transcript can include multiple paragraphs. Each paragraph represents a section of the conversation.

Interviewer: Can you tell us about the youth programs?

Storyteller: The youth programs have been really important for our community. We focus on building leadership skills while keeping young people connected to culture...

[Continue with full transcript text]

The conversation covered topics including traditional practices, mentorship, and community connection.',
      -- CHANGE: 2-3 sentence summary
      'Interview covering youth leadership development programs on Palm Island, focusing on cultural connection and mentorship.',
      'oral_history',     -- story_type: personal_story, impact_story, oral_history, traditional_knowledge, service_story
      'youth_development', -- story_category: health, youth_development, culture, family_support, environment, economic, elder_care
      'community',         -- privacy_level: public, community, restricted
      FALSE,               -- is_public (set TRUE after review)
      'draft',             -- status: draft (for review), published, archived
      jsonb_build_object(
        'source_type', 'transcript',
        'recording_date', '2024-11-20',    -- CHANGE: When recorded
        'duration_minutes', 45,             -- CHANGE: Length of recording
        'transcribed_by', 'Interviewer Name', -- CHANGE: Who transcribed
        'original_format', 'audio_recording', -- audio_recording, video_recording, written_notes
        'interview_location', 'Palm Island',  -- CHANGE: Where conducted
        'language', 'English',                -- Primary language
        'requires_cultural_review', FALSE     -- Set TRUE if contains sensitive content
      )
    );

    RAISE NOTICE 'Imported transcript: Example Interview: Youth Leadership';
  END IF;

  -- ============================
  -- TRANSCRIPT 2: Elder Story Template
  -- ============================
  -- Uncomment and customize for elder/cultural transcripts

  /*
  SELECT id INTO storyteller_id
  FROM profiles
  WHERE full_name = 'Uncle Alan'
    AND primary_organization_id = picc_org_id;

  IF storyteller_id IS NOT NULL THEN
    SELECT id INTO service_id
    FROM organization_services
    WHERE service_slug = 'cultural_centre'
      AND organization_id = picc_org_id;

    INSERT INTO stories (
      tenant_id, organization_id, service_id, storyteller_id, author_id,
      title, content, summary,
      story_type, story_category, privacy_level, is_public, status,
      metadata
    ) VALUES (
      picc_tenant_id, picc_org_id, service_id, storyteller_id, storyteller_id,
      '[Elder Interview Title]',
      '[Full transcript text - may contain traditional knowledge requiring review]',
      '[Summary of elder wisdom shared]',
      'traditional_knowledge',
      'culture',
      'restricted',  -- Use 'restricted' for elder/traditional content
      FALSE,
      'draft',
      jsonb_build_object(
        'source_type', 'transcript',
        'recording_date', '2024-01-01',
        'duration_minutes', 60,
        'transcribed_by', '[Name]',
        'original_format', 'audio_recording',
        'requires_cultural_review', TRUE,  -- IMPORTANT for elder content
        'elder_approval_status', 'pending'
      )
    );

    RAISE NOTICE 'Imported elder transcript: [Title]';
  END IF;
  */

  -- ============================
  -- TRANSCRIPT 3: Community Event Recording
  -- ============================
  -- Template for community meeting or event recordings

  /*
  SELECT id INTO storyteller_id
  FROM profiles
  WHERE full_name = '[Community Member Name]'
    AND primary_organization_id = picc_org_id;

  IF storyteller_id IS NOT NULL THEN
    INSERT INTO stories (
      tenant_id, organization_id, storyteller_id, author_id,
      title, content, summary,
      story_type, story_category, privacy_level, is_public, status,
      metadata
    ) VALUES (
      picc_tenant_id, picc_org_id, storyteller_id, storyteller_id,
      '[Event/Meeting Title]',
      '[Transcript of community event or meeting]',
      '[Brief summary of event and key points discussed]',
      'impact_story',
      'community_events',
      'community',
      FALSE,
      'draft',
      jsonb_build_object(
        'source_type', 'transcript',
        'recording_date', '2024-01-01',
        'event_type', 'community_meeting',  -- community_meeting, celebration, workshop
        'participant_count', 25,
        'duration_minutes', 90
      )
    );

    RAISE NOTICE 'Imported event transcript: [Title]';
  END IF;
  */

  RAISE NOTICE '';
  RAISE NOTICE 'Done! Transcripts imported as draft stories.';
  RAISE NOTICE 'Remember to review and publish after cultural approval.';
  RAISE NOTICE '========================================';

END $$;

-- ============================================================================
-- VERIFICATION: Check recently imported transcripts
-- ============================================================================

SELECT
  s.title,
  p.full_name as storyteller,
  s.story_type,
  s.story_category,
  s.privacy_level,
  s.status,
  s.metadata->>'source_type' as source,
  s.metadata->>'recording_date' as recorded,
  s.metadata->>'duration_minutes' as duration_mins,
  s.created_at
FROM stories s
JOIN profiles p ON s.storyteller_id = p.id
WHERE s.organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
  AND s.metadata->>'source_type' = 'transcript'
ORDER BY s.created_at DESC;

-- ============================================================================
-- PUBLISH A TRANSCRIPT (After Review)
-- ============================================================================
-- Once reviewed and approved, update the story to published status:

/*
UPDATE stories
SET
  status = 'published',
  is_public = TRUE,  -- or FALSE if community-only
  published_at = NOW()
WHERE title = '[Exact Title of Transcript]'
  AND organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479';
*/

-- ============================================================================
-- STORY CATEGORIES REFERENCE
-- ============================================================================
-- health, youth_development, culture, family_support, environment
-- economic, elder_care, womens_health, mens_health, community_events
-- education, housing, justice, sports_recreation, traditional_knowledge
