-- Expand the Elders Trips immersive story with more sections, images, and quotes.
DO $$
DECLARE
  v_story_id UUID;
  v_project_id UUID;
  v_hero_image TEXT;
  v_video_url TEXT;
  v_image_1 TEXT;
  v_image_2 TEXT;
  v_image_3 TEXT;
  v_image_4 TEXT;
  v_image_5 TEXT;
  v_quote_1 TEXT;
  v_quote_2 TEXT;
  v_quote_3 TEXT;
  v_quote_4 TEXT;
  v_quote_5 TEXT;
  v_quote_author_1 TEXT;
  v_quote_author_2 TEXT;
  v_quote_author_3 TEXT;
  v_quote_author_4 TEXT;
  v_quote_author_5 TEXT;
  v_quote_photo_1 TEXT;
  v_quote_photo_2 TEXT;
  v_quote_photo_3 TEXT;
  v_quote_photo_4 TEXT;
  v_quote_photo_5 TEXT;
  v_gallery_section UUID;
  v_timeline_section UUID;
BEGIN
  SELECT id INTO v_project_id
  FROM projects
  WHERE slug = 'elders-trips'
  LIMIT 1;

  SELECT id INTO v_story_id
  FROM immersive_stories
  WHERE slug = 'elders-trips-story'
  LIMIT 1;

  IF v_story_id IS NULL THEN
    INSERT INTO immersive_stories (
      project_id,
      title,
      subtitle,
      slug,
      is_published,
      published_at
    )
    VALUES (
      v_project_id,
      'Elders Trip',
      'Returning to Country together',
      'elders-trips-story',
      TRUE,
      NOW()
    )
    RETURNING id INTO v_story_id;
  END IF;

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

  UPDATE immersive_stories
  SET hero_media_url = v_hero_image,
      hero_media_type = 'image',
      is_published = TRUE,
      published_at = NOW()
  WHERE id = v_story_id;

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

  SELECT public_url INTO v_image_4
  FROM media_files
  WHERE is_public = TRUE
    AND deleted_at IS NULL
    AND file_type = 'image'
    AND tags @> ARRAY['project:elders-trips']
  ORDER BY created_at DESC
  LIMIT 1 OFFSET 3;

  SELECT public_url INTO v_image_5
  FROM media_files
  WHERE is_public = TRUE
    AND deleted_at IS NULL
    AND file_type = 'image'
    AND tags @> ARRAY['project:elders-trips']
  ORDER BY created_at DESC
  LIMIT 1 OFFSET 4;

  v_image_1 := COALESCE(v_image_1, v_hero_image);
  v_image_2 := COALESCE(v_image_2, v_hero_image, v_image_1);
  v_image_3 := COALESCE(v_image_3, v_hero_image, v_image_2);
  v_image_4 := COALESCE(v_image_4, v_hero_image, v_image_3);
  v_image_5 := COALESCE(v_image_5, v_hero_image, v_image_4);

  SELECT q.quote_text,
         COALESCE(NULLIF(q.attribution, ''), p.preferred_name, p.full_name),
         p.profile_image_url
  INTO v_quote_1, v_quote_author_1, v_quote_photo_1
  FROM extracted_quotes q
  LEFT JOIN profiles p ON p.id = q.profile_id
  WHERE (q.is_validated = TRUE OR q.suggested_for_report = TRUE)
    AND p.is_elder = TRUE
  ORDER BY q.is_validated DESC, q.created_at DESC
  LIMIT 1 OFFSET 0;

  SELECT q.quote_text,
         COALESCE(NULLIF(q.attribution, ''), p.preferred_name, p.full_name),
         p.profile_image_url
  INTO v_quote_2, v_quote_author_2, v_quote_photo_2
  FROM extracted_quotes q
  LEFT JOIN profiles p ON p.id = q.profile_id
  WHERE (q.is_validated = TRUE OR q.suggested_for_report = TRUE)
    AND p.is_elder = TRUE
  ORDER BY q.is_validated DESC, q.created_at DESC
  LIMIT 1 OFFSET 1;

  SELECT q.quote_text,
         COALESCE(NULLIF(q.attribution, ''), p.preferred_name, p.full_name),
         p.profile_image_url
  INTO v_quote_3, v_quote_author_3, v_quote_photo_3
  FROM extracted_quotes q
  LEFT JOIN profiles p ON p.id = q.profile_id
  WHERE (q.is_validated = TRUE OR q.suggested_for_report = TRUE)
    AND p.is_elder = TRUE
  ORDER BY q.is_validated DESC, q.created_at DESC
  LIMIT 1 OFFSET 2;

  SELECT q.quote_text,
         COALESCE(NULLIF(q.attribution, ''), p.preferred_name, p.full_name),
         p.profile_image_url
  INTO v_quote_4, v_quote_author_4, v_quote_photo_4
  FROM extracted_quotes q
  LEFT JOIN profiles p ON p.id = q.profile_id
  WHERE (q.is_validated = TRUE OR q.suggested_for_report = TRUE)
    AND p.is_elder = TRUE
  ORDER BY q.is_validated DESC, q.created_at DESC
  LIMIT 1 OFFSET 3;

  SELECT q.quote_text,
         COALESCE(NULLIF(q.attribution, ''), p.preferred_name, p.full_name),
         p.profile_image_url
  INTO v_quote_5, v_quote_author_5, v_quote_photo_5
  FROM extracted_quotes q
  LEFT JOIN profiles p ON p.id = q.profile_id
  WHERE (q.is_validated = TRUE OR q.suggested_for_report = TRUE)
    AND p.is_elder = TRUE
  ORDER BY q.is_validated DESC, q.created_at DESC
  LIMIT 1 OFFSET 4;

  v_quote_1 := COALESCE(v_quote_1, 'We travel together so our stories stay strong for the next generation.');
  v_quote_2 := COALESCE(v_quote_2, 'Walking country brings our families close and reminds us who we are.');
  v_quote_3 := COALESCE(v_quote_3, 'We carry respect for those who came before and for the young people coming behind us.');
  v_quote_4 := COALESCE(v_quote_4, 'Being on Country together keeps the old people close and the stories alive.');
  v_quote_5 := COALESCE(v_quote_5, 'The trip was about memory and about hope for the children coming next.');

  DELETE FROM story_sections WHERE story_id = v_story_id;

  INSERT INTO story_sections (story_id, section_order, section_type, title, content, background_color)
  VALUES (
    v_story_id,
    1,
    'text',
    'Overview',
    'In 2024 the Palm Island Elders Advisory Group travelled from Palm Island to Lucinda, Ingham, and Hull River in the Mission Beach region.\n\nThey returned to country where their families had once been held during the mission era. The journey made room for remembrance, truth, and the steady work of carrying culture forward together.',
    'bg-white'
  );

  INSERT INTO story_sections (story_id, section_order, section_type, content, quote_author, media_url)
  VALUES (
    v_story_id,
    2,
    'quote',
    v_quote_1,
    NULLIF(v_quote_author_1, ''),
    v_quote_photo_1
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
    'The journey began at home. Elders gathered on Country, named who they were carrying with them, and stepped into the trip together.',
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

  INSERT INTO story_sections (story_id, section_order, section_type, content, quote_author, media_url)
  VALUES (
    v_story_id,
    5,
    'quote',
    v_quote_2,
    NULLIF(v_quote_author_2, ''),
    v_quote_photo_2
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
    6,
    'sidebyside',
    'Lucinda to Ingham',
    'After the barge crossing, the group travelled through Lucinda and Ingham, stopping to rest and to speak about the places ahead.',
    v_image_3,
    'image',
    'left',
    'bg-white'
  );

  INSERT INTO story_sections (story_id, section_order, section_type, title, content, background_color)
  VALUES (
    v_story_id,
    7,
    'text',
    'Walking Hull River',
    'At Hull River the Elders stood on Country that holds deep memory. Some places were hard to speak about, but being there together made space for truth, healing, and respect.',
    'bg-white'
  );

  IF v_video_url IS NOT NULL THEN
    INSERT INTO story_sections (story_id, section_order, section_type, title, media_url, media_type, media_caption)
    VALUES (
      v_story_id,
      8,
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
      8,
      'text',
      'Captured in story',
      'The Elders shared this journey in many ways. Their words and images continue to build a living record of the trip.',
      'bg-white'
    );
  END IF;

  INSERT INTO story_sections (story_id, section_order, section_type, content, quote_author, media_url)
  VALUES (
    v_story_id,
    9,
    'quote',
    v_quote_3,
    NULLIF(v_quote_author_3, ''),
    v_quote_photo_3
  );

  INSERT INTO story_sections (story_id, section_order, section_type, media_url, media_alt, media_caption)
  VALUES (
    v_story_id,
    10,
    'fullbleed',
    v_image_4,
    'Elders Trip photo',
    'Sharing stories and walking together.'
  );

  INSERT INTO story_sections (story_id, section_order, section_type, content, quote_author, media_url)
  VALUES (
    v_story_id,
    11,
    'quote',
    v_quote_4,
    NULLIF(v_quote_author_4, ''),
    v_quote_photo_4
  );

  INSERT INTO story_sections (story_id, section_order, section_type, title, background_color)
  VALUES (
    v_story_id,
    12,
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
    13,
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
  LIMIT 15;

  INSERT INTO story_sections (story_id, section_order, section_type, content, quote_author, media_url)
  VALUES (
    v_story_id,
    14,
    'quote',
    v_quote_5,
    NULLIF(v_quote_author_5, ''),
    v_quote_photo_5
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
    15,
    'sidebyside',
    'Returning with purpose',
    'The trip came to an end, but the work continues. Elders spoke about what needs to be carried forward for young people and for Country, keeping the story moving with care.',
    v_image_5,
    'image',
    'right',
    'bg-white'
  );
END $$;
