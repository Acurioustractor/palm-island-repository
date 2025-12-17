-- Seed immersive story content for Elders Trips (slug: elders-trips-story).
DO $$
DECLARE
  v_story_id UUID;
  v_project_id UUID;
  v_hero_image TEXT;
  v_video_url TEXT;
  v_image_1 TEXT;
  v_image_2 TEXT;
  v_image_3 TEXT;
  v_quote_1 TEXT;
  v_quote_2 TEXT;
  v_quote_3 TEXT;
  v_quote_author_1 TEXT;
  v_quote_author_2 TEXT;
  v_quote_author_3 TEXT;
  v_gallery_section UUID;
  v_timeline_section UUID;
BEGIN
  SELECT id INTO v_project_id
  FROM projects
  WHERE slug = 'elders-trips'
  LIMIT 1;

  SELECT public_url INTO v_hero_image
  FROM media_files
  WHERE is_public = TRUE
    AND deleted_at IS NULL
    AND file_type = 'image'
    AND tags @> ARRAY['page:elders', 'hero']
  ORDER BY is_featured DESC NULLS LAST, created_at DESC
  LIMIT 1;

  IF v_hero_image IS NULL THEN
    SELECT public_url INTO v_hero_image
    FROM media_files
    WHERE is_public = TRUE
      AND deleted_at IS NULL
      AND file_type = 'image'
      AND tags @> ARRAY['project:elders-trips']
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF v_hero_image IS NULL THEN
    SELECT public_url INTO v_hero_image
    FROM media_files
    WHERE is_public = TRUE
      AND deleted_at IS NULL
      AND file_type = 'image'
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  SELECT public_url INTO v_video_url
  FROM media_files
  WHERE is_public = TRUE
    AND deleted_at IS NULL
    AND file_type = 'video'
    AND tags @> ARRAY['external-video', 'project:elders-trips']
  ORDER BY is_featured DESC NULLS LAST, created_at DESC
  LIMIT 1;

  SELECT public_url INTO v_image_1
  FROM media_files
  WHERE is_public = TRUE
    AND deleted_at IS NULL
    AND file_type = 'image'
    AND tags @> ARRAY['project:elders-trips']
  ORDER BY created_at DESC
  LIMIT 1 OFFSET 0;

  SELECT public_url INTO v_image_2
  FROM media_files
  WHERE is_public = TRUE
    AND deleted_at IS NULL
    AND file_type = 'image'
    AND tags @> ARRAY['project:elders-trips']
  ORDER BY created_at DESC
  LIMIT 1 OFFSET 1;

  SELECT public_url INTO v_image_3
  FROM media_files
  WHERE is_public = TRUE
    AND deleted_at IS NULL
    AND file_type = 'image'
    AND tags @> ARRAY['project:elders-trips']
  ORDER BY created_at DESC
  LIMIT 1 OFFSET 2;

  v_image_1 := COALESCE(v_image_1, v_hero_image);
  v_image_2 := COALESCE(v_image_2, v_hero_image, v_image_1);
  v_image_3 := COALESCE(v_image_3, v_hero_image, v_image_2);

  SELECT quote_text, attribution
  INTO v_quote_1, v_quote_author_1
  FROM extracted_quotes
  WHERE (is_validated = TRUE OR suggested_for_report = TRUE)
    AND profile_id IN (
      SELECT id
      FROM profiles
      WHERE is_elder = TRUE
    )
  ORDER BY is_validated DESC, created_at DESC
  LIMIT 1 OFFSET 0;

  SELECT quote_text, attribution
  INTO v_quote_2, v_quote_author_2
  FROM extracted_quotes
  WHERE (is_validated = TRUE OR suggested_for_report = TRUE)
    AND profile_id IN (
      SELECT id
      FROM profiles
      WHERE is_elder = TRUE
    )
  ORDER BY is_validated DESC, created_at DESC
  LIMIT 1 OFFSET 1;

  SELECT quote_text, attribution
  INTO v_quote_3, v_quote_author_3
  FROM extracted_quotes
  WHERE (is_validated = TRUE OR suggested_for_report = TRUE)
    AND profile_id IN (
      SELECT id
      FROM profiles
      WHERE is_elder = TRUE
    )
  ORDER BY is_validated DESC, created_at DESC
  LIMIT 1 OFFSET 2;

  v_quote_1 := COALESCE(v_quote_1, 'We travel together so our stories stay strong for the next generation.');
  v_quote_2 := COALESCE(v_quote_2, 'Walking country brings our families close and reminds us who we are.');
  v_quote_3 := COALESCE(v_quote_3, 'We carry respect for those who came before and for the young people coming behind us.');

  WITH upsert AS (
    INSERT INTO immersive_stories (
      project_id,
      title,
      subtitle,
      slug,
      hero_media_url,
      hero_media_type,
      is_published,
      published_at
    )
    VALUES (
      v_project_id,
      'Elders Trip',
      'Returning to Country together',
      'elders-trips-story',
      v_hero_image,
      'image',
      TRUE,
      NOW()
    )
    ON CONFLICT (slug)
    DO UPDATE SET
      project_id = EXCLUDED.project_id,
      title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      hero_media_url = EXCLUDED.hero_media_url,
      hero_media_type = EXCLUDED.hero_media_type,
      is_published = TRUE,
      published_at = NOW()
    RETURNING id
  )
  SELECT id INTO v_story_id FROM upsert;

  DELETE FROM story_sections WHERE story_id = v_story_id;

  INSERT INTO story_sections (story_id, section_order, section_type, title, content, background_color)
  VALUES (
    v_story_id,
    1,
    'text',
    'Overview',
    'In 2024 the Palm Island Elders Advisory Group made a shared journey from Palm Island to Lucinda, Ingham, and Hull River in the Mission Beach region.\n\nThey travelled with purpose, returning to country where their families had once been held during the mission era. The trip brought Elders together to listen, remember, and speak with care about what must be carried forward for the next generation.',
    'bg-white'
  );

  INSERT INTO story_sections (story_id, section_order, section_type, content, quote_author)
  VALUES (
    v_story_id,
    2,
    'quote',
    v_quote_1,
    NULLIF(v_quote_author_1, '')
  );

  INSERT INTO story_sections (
    story_id,
    section_order,
    section_type,
    title,
    content,
    media_url,
    media_type,
    media_position,
    background_color
  )
  VALUES (
    v_story_id,
    3,
    'sidebyside',
    'Leaving Palm Island',
    'The journey began on Palm Island, with Elders gathering names, places, and memories to carry with them. The barge crossing to Lucinda marked the start of a trip built on care for Country and for one another.',
    v_image_1,
    'image',
    'right',
    'bg-gray-50'
  );

  INSERT INTO story_sections (story_id, section_order, section_type, media_url, media_alt, media_caption)
  VALUES (
    v_story_id,
    4,
    'fullbleed',
    v_image_2,
    'Elders Trip photo',
    'Looking back to Country as the journey continues.'
  );

  INSERT INTO story_sections (story_id, section_order, section_type, content, quote_author)
  VALUES (
    v_story_id,
    5,
    'quote',
    v_quote_2,
    NULLIF(v_quote_author_2, '')
  );

  IF v_video_url IS NOT NULL THEN
    INSERT INTO story_sections (story_id, section_order, section_type, title, media_url, media_type, media_caption)
    VALUES (
      v_story_id,
      6,
      'video',
      'Elders Trip video',
      v_video_url,
      'video',
      'A return journey captured in voice, place, and shared memory.'
    );
  ELSE
    INSERT INTO story_sections (story_id, section_order, section_type, title, content, background_color)
    VALUES (
      v_story_id,
      6,
      'text',
      'Captured in story',
      'The Elders shared this journey in many ways. Their words and images continue to build a living record of the trip.',
      'bg-white'
    );
  END IF;

  INSERT INTO story_sections (story_id, section_order, section_type, title, content, background_color)
  VALUES (
    v_story_id,
    7,
    'text',
    'Walking Hull River',
    'At Hull River the group stood on country that holds deep memory. Some places were hard to speak about, but being there together made space for truth, healing, and respect.\n\nElders spoke about how culture stays strong when stories are carried forward with care.',
    'bg-white'
  );

  INSERT INTO story_sections (story_id, section_order, section_type, title, background_color)
  VALUES (
    v_story_id,
    8,
    'timeline',
    'The journey',
    'bg-white'
  )
  RETURNING id INTO v_timeline_section;

  INSERT INTO story_timeline_events (section_id, event_order, event_date, event_title, event_description)
  VALUES
    (v_timeline_section, 1, 'Start', 'Palm Island', 'Elders gathered on Country and began the journey together.'),
    (v_timeline_section, 2, 'Crossing', 'Lucinda (barge)', 'Travel by barge across to Lucinda.'),
    (v_timeline_section, 3, 'On the road', 'Ingham', 'Travelling through to the Mission Beach region.'),
    (v_timeline_section, 4, 'On Country', 'Hull River', 'Walking the places of family memory and mission history.'),
    (v_timeline_section, 5, 'Return', 'Lucinda', 'Returning together before the trip home.');

  INSERT INTO story_sections (story_id, section_order, section_type, title, background_color)
  VALUES (
    v_story_id,
    9,
    'gallery',
    'Photos from the journey',
    'bg-gray-50'
  )
  RETURNING id INTO v_gallery_section;

  INSERT INTO story_gallery_images (section_id, image_order, image_url, image_alt, image_caption)
  SELECT
    v_gallery_section,
    row_number() OVER () AS image_order,
    media_files.public_url,
    COALESCE(media_files.title, 'Elders Trip photo'),
    media_files.description
  FROM media_files
  WHERE media_files.is_public = TRUE
    AND media_files.deleted_at IS NULL
    AND media_files.file_type = 'image'
    AND media_files.tags @> ARRAY['project:elders-trips']
  ORDER BY media_files.created_at DESC
  LIMIT 9;

  INSERT INTO story_sections (story_id, section_order, section_type, content, quote_author)
  VALUES (
    v_story_id,
    10,
    'quote',
    v_quote_3,
    NULLIF(v_quote_author_3, '')
  );
END $$;
