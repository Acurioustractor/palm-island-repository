-- Rebuild Elders Trips immersive story with journey timeline and extra parallax sections.
DO $$
DECLARE
  v_story_id UUID;
  v_project_id UUID;
  v_hero_image TEXT;
  v_video_url TEXT;
  v_images TEXT[];
  v_image_1 TEXT;
  v_image_2 TEXT;
  v_image_3 TEXT;
  v_image_4 TEXT;
  v_image_5 TEXT;
  v_image_6 TEXT;
  v_gallery_section UUID;
  v_timeline_section UUID;
  v_section_order INTEGER := 1;
  elder_rec RECORD;
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

  SELECT array_agg(public_url) INTO v_images
  FROM (
    SELECT public_url
    FROM media_files
    WHERE is_public = TRUE
      AND deleted_at IS NULL
      AND file_type = 'image'
      AND tags @> ARRAY['project:elders-trips']
    ORDER BY created_at DESC
    LIMIT 12
  ) ordered_images;

  v_image_1 := COALESCE(v_images[1], v_hero_image);
  v_image_2 := COALESCE(v_images[2], v_hero_image, v_image_1);
  v_image_3 := COALESCE(v_images[3], v_hero_image, v_image_2);
  v_image_4 := COALESCE(v_images[4], v_hero_image, v_image_3);
  v_image_5 := COALESCE(v_images[5], v_hero_image, v_image_4);
  v_image_6 := COALESCE(v_images[6], v_hero_image, v_image_5);

  DELETE FROM story_sections WHERE story_id = v_story_id;

  INSERT INTO story_sections (story_id, section_order, section_type, title, content, background_color)
  VALUES (
    v_story_id,
    v_section_order,
    'text',
    'Overview',
    'In 2024 the Palm Island Elders Advisory Group travelled from Palm Island to Lucinda, Ingham, and Hull River in the Mission Beach region.\n\nThey returned to country where their families had once been held during the mission era. The journey made room for remembrance, truth, and the steady work of carrying culture forward together.',
    'bg-white'
  );
  v_section_order := v_section_order + 1;

  INSERT INTO story_sections (story_id, section_order, section_type, title, content, media_url)
  VALUES (
    v_story_id,
    v_section_order,
    'parallax',
    'Walking together',
    'A journey of memory, care, and connection.',
    v_image_1
  );
  v_section_order := v_section_order + 1;

  INSERT INTO story_sections (story_id, section_order, section_type, title, background_color)
  VALUES (
    v_story_id,
    v_section_order,
    'timeline',
    'The journey',
    'bg-white'
  )
  RETURNING id INTO v_timeline_section;
  v_section_order := v_section_order + 1;

  INSERT INTO story_timeline_events (section_id, event_order, event_date, event_title, event_description)
  VALUES
    (v_timeline_section, 1, 'Start', 'Palm Island', 'Elders gathered on Country and began the journey together.'),
    (v_timeline_section, 2, 'Crossing', 'Lucinda (barge)', 'Travel by barge across to Lucinda.'),
    (v_timeline_section, 3, 'On the road', 'Ingham', 'Travelling through to the Mission Beach region.'),
    (v_timeline_section, 4, 'On Country', 'Hull River', 'Walking the places of family memory and mission history.'),
    (v_timeline_section, 5, 'Return', 'Lucinda', 'Returning together before the trip home.');

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
    v_section_order,
    'sidebyside',
    'Leaving Palm Island',
    'The journey began at home. Elders gathered on Country, named who they were carrying with them, and stepped into the trip together.',
    v_image_2,
    'image',
    'right',
    'bg-gray-50'
  );
  v_section_order := v_section_order + 1;

  FOR elder_rec IN
    SELECT
      e.id AS elder_id,
      e.full_name,
      e.preferred_name,
      e.profile_image_url,
      q.quote_text,
      q.attribution
    FROM (
      SELECT id, full_name, preferred_name, profile_image_url
      FROM profiles
      WHERE is_elder = TRUE
      ORDER BY full_name
    ) e
    LEFT JOIN LATERAL (
      SELECT DISTINCT ON (q.profile_id)
        q.quote_text,
        q.attribution,
        q.profile_id,
        q.is_validated,
        q.suggested_for_report,
        q.created_at
      FROM extracted_quotes q
      WHERE q.profile_id = e.id
        AND NULLIF(TRIM(q.quote_text), '') IS NOT NULL
      ORDER BY q.profile_id,
        q.is_validated DESC NULLS LAST,
        q.suggested_for_report DESC NULLS LAST,
        q.created_at DESC
    ) q ON TRUE
    ORDER BY COALESCE(e.preferred_name, e.full_name)
  LOOP
    INSERT INTO story_sections (story_id, section_order, section_type, content, quote_author, media_url)
    VALUES (
      v_story_id,
      v_section_order,
      'quote',
      COALESCE(
        elder_rec.quote_text,
        'Quote coming soon from ' || COALESCE(elder_rec.preferred_name, elder_rec.full_name)
      ),
      COALESCE(NULLIF(elder_rec.attribution, ''), elder_rec.preferred_name, elder_rec.full_name),
      elder_rec.profile_image_url
    );
    v_section_order := v_section_order + 1;
  END LOOP;

  INSERT INTO story_sections (story_id, section_order, section_type, title, content, media_url)
  VALUES (
    v_story_id,
    v_section_order,
    'parallax',
    'Stories on the road',
    'Sharing memory and looking after one another.',
    v_image_3
  );
  v_section_order := v_section_order + 1;

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
    v_section_order,
    'sidebyside',
    'Lucinda to Ingham',
    'After the barge crossing, the group travelled through Lucinda and Ingham, stopping to rest and to speak about the places ahead.',
    v_image_4,
    'image',
    'left',
    'bg-white'
  );
  v_section_order := v_section_order + 1;

  INSERT INTO story_sections (story_id, section_order, section_type, title, content, background_color)
  VALUES (
    v_story_id,
    v_section_order,
    'text',
    'Walking Hull River',
    'At Hull River the Elders stood on Country that holds deep memory. Some places were hard to speak about, but being there together made space for truth, healing, and respect.',
    'bg-white'
  );
  v_section_order := v_section_order + 1;

  IF v_video_url IS NOT NULL THEN
    INSERT INTO story_sections (story_id, section_order, section_type, title, media_url, media_type, media_caption)
    VALUES (
      v_story_id,
      v_section_order,
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
      v_section_order,
      'text',
      'Captured in story',
      'The Elders shared this journey in many ways. Their words and images continue to build a living record of the trip.',
      'bg-white'
    );
  END IF;
  v_section_order := v_section_order + 1;

  INSERT INTO story_sections (story_id, section_order, section_type, media_url, media_alt, media_caption)
  VALUES (
    v_story_id,
    v_section_order,
    'fullbleed',
    v_image_5,
    'Elders Trip photo',
    'Sharing stories and walking together.'
  );
  v_section_order := v_section_order + 1;

  INSERT INTO story_sections (story_id, section_order, section_type, title, content, media_url)
  VALUES (
    v_story_id,
    v_section_order,
    'parallax',
    'Holding memory',
    'Country remembers. We listen and carry it forward.',
    v_image_6
  );
  v_section_order := v_section_order + 1;

  INSERT INTO story_sections (story_id, section_order, section_type, title, background_color)
  VALUES (
    v_story_id,
    v_section_order,
    'gallery',
    'Photos from the journey',
    'bg-gray-50'
  )
  RETURNING id INTO v_gallery_section;
  v_section_order := v_section_order + 1;

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
  LIMIT 18;

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
    v_section_order,
    'sidebyside',
    'Returning with purpose',
    'The trip came to an end, but the work continues. Elders spoke about what needs to be carried forward for young people and for Country, keeping the story moving with care.',
    v_image_2,
    'image',
    'right',
    'bg-white'
  );
END $$;
