-- Migration: Seed 5 Innovation Project Immersive Stories
-- Each project gets an immersive story with Why → What → How narrative arc
-- Stories are rendered by /immersive-stories/[slug]/page.tsx
--
-- Real project IDs from production database:
-- photo-studio:       383fd3ff-4c4f-47c7-bd11-7ae80ace19d9
-- the-station:        699bb794-927a-4d9e-8850-7ad8767f23d5
-- elders-trips:       26fda424-5b2a-43c8-aadb-159d1cb97ff9
-- on-country-server:  4774804a-f3ed-43ca-a0dd-824e40bf2c72
-- annual-report:      496c1bda-190c-4765-aa7a-e0c964c332e9

-- ============================================================
-- 1. Ensure all 5 projects are tagged as innovation
-- ============================================================

UPDATE projects SET project_type = 'innovation'
WHERE slug IN ('photo-studio', 'the-station', 'elders-trips', 'on-country-server', 'annual-report');

-- Update elders-trips status to completed
UPDATE projects SET status = 'completed' WHERE slug = 'elders-trips';

-- ============================================================
-- 2. Create immersive stories (upsert by slug)
-- ============================================================

-- The Station story (missing)
INSERT INTO immersive_stories (project_id, title, subtitle, slug, hero_media_url, hero_media_type, is_published, published_at)
VALUES (
  '699bb794-927a-4d9e-8850-7ad8767f23d5',
  'Building Pathways',
  'A circular-economy hub creating futures for Palm Island youth in Townsville',
  'the-station-story',
  '/images/palm-island-aerial.jpg',
  'image',
  true,
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  is_published = true,
  published_at = COALESCE(immersive_stories.published_at, NOW());

-- On-Country Server story (missing)
INSERT INTO immersive_stories (project_id, title, subtitle, slug, hero_media_url, hero_media_type, is_published, published_at)
VALUES (
  '4774804a-f3ed-43ca-a0dd-824e40bf2c72',
  'Data on Country',
  'Digital sovereignty through an on-island server owned and controlled by community',
  'on-country-server-story',
  '/images/palm-island-aerial.jpg',
  'image',
  true,
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  is_published = true,
  published_at = COALESCE(immersive_stories.published_at, NOW());

-- Annual Report System story (missing)
INSERT INTO immersive_stories (project_id, title, subtitle, slug, hero_media_url, hero_media_type, is_published, published_at)
VALUES (
  '496c1bda-190c-4765-aa7a-e0c964c332e9',
  'Our Voice, Amplified',
  'How AI and community knowledge combine to tell Palm Island''s story',
  'annual-report-system-story',
  '/images/palm-island-aerial.jpg',
  'image',
  true,
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  is_published = true,
  published_at = COALESCE(immersive_stories.published_at, NOW());

-- Publish existing stories
UPDATE immersive_stories SET is_published = true, published_at = COALESCE(published_at, NOW())
WHERE slug IN ('photo-studio-story', 'elders-trips-story');

-- Update Photo Studio story title/subtitle
UPDATE immersive_stories SET
  title = 'Our Stories, Our Lens',
  subtitle = 'How Palm Island built a professional photography studio on Country'
WHERE slug = 'photo-studio-story';

-- Update Elders Trip story title/subtitle
UPDATE immersive_stories SET
  title = 'Return to Hull River',
  subtitle = 'Elders reconnect with ancestral homeland on a journey of cultural healing'
WHERE slug = 'elders-trips-story';


-- ============================================================
-- 3. Story sections - using a function to get story IDs dynamically
-- ============================================================

-- Delete existing sections for a clean re-seed (cascades to timeline_events and gallery_images)
DELETE FROM story_sections WHERE story_id IN (
  SELECT id FROM immersive_stories WHERE slug IN (
    'photo-studio-story', 'the-station-story', 'elders-trips-story',
    'on-country-server-story', 'annual-report-system-story'
  )
);

-- ============================================================
-- PHOTO STUDIO sections
-- ============================================================

INSERT INTO story_sections (story_id, section_order, section_type, title, content, media_url, media_type, media_position, media_alt, quote_author, quote_role)
SELECT s.id, v.section_order, v.section_type, v.title, v.content, v.media_url, v.media_type, v.media_position, v.media_alt, v.quote_author, v.quote_role
FROM immersive_stories s
CROSS JOIN (VALUES
  (1, 'text', 'The Why',
   'For too long, our stories have been told through someone else''s camera, filtered through someone else''s perspective. Families on Palm Island were paying $1,000 or more to travel off-island for professional photos — if they could afford it at all. Most families had no professional portraits. Historical photos of our community sat in archives controlled by others.

The Palm Island Photo Studio changes that forever. This isn''t just about photography — it''s about sovereignty over our visual identity. It''s about controlling our narrative, preserving our culture, and showing the world who we really are, on our own terms.',
   NULL, NULL, NULL, NULL, NULL, NULL),

  (2, 'quote', NULL,
   'Every photo tells two stories: what you see, and who''s behind the camera. Now both stories are ours.',
   NULL, NULL, NULL, NULL, 'Community Elder', 'Palm Island Photo Studio Patron'),

  (3, 'sidebyside', 'The What',
   'The Palm Island Photo Studio is a professional photography facility operated entirely by community members. It includes a fully equipped portrait studio with professional lighting and backdrops, a digital photo kiosk for instant prints, a historical archive digitisation program, and a youth photography training pathway.

Over 200 families had professional portraits taken in the first three months. Young people are learning skills that translate to careers — three youth have already secured photography internships off-island.',
   '/images/palm-island-aerial.jpg', 'image', 'right', 'Photo Studio interior', NULL, NULL),

  (4, 'timeline', 'Our Journey', NULL, NULL, NULL, NULL, NULL, NULL, NULL),

  (5, 'gallery', 'Through Our Lens', NULL, NULL, NULL, NULL, NULL, NULL, NULL),

  (6, 'sidebyside', 'The How',
   'The Photo Studio reflects PICC''s core philosophy: community ownership, cultural protocols, and pathways for young people. Equipment is operated by trained community members. Cultural knowledge holders guide what can be photographed and how. Youth trainees learn both technical skills and cultural responsibility.

This project connects directly to PICC''s 20-year vision: a community that controls its own narrative, preserves its heritage, and creates economic opportunity — all from Country.',
   '/images/palm-island-aerial.jpg', 'image', 'left', 'Youth training program', NULL, NULL),

  (7, 'parallax', 'Our Land. Our Stories. Our Camera.',
   'Visual sovereignty for Palm Island',
   '/images/palm-island-sunset.jpg', NULL, NULL, NULL, NULL, NULL)
) AS v(section_order, section_type, title, content, media_url, media_type, media_position, media_alt, quote_author, quote_role)
WHERE s.slug = 'photo-studio-story';

-- Photo Studio timeline events
INSERT INTO story_timeline_events (section_id, event_order, event_date, event_title, event_description, is_complete)
SELECT ss.id, v.event_order, v.event_date, v.event_title, v.event_description, v.is_complete
FROM story_sections ss
JOIN immersive_stories s ON s.id = ss.story_id
CROSS JOIN (VALUES
  (1, 'January 2023', 'Community Consultation', 'Elders and community members gathered to discuss the vision for an on-Country photography studio.', true),
  (2, 'March 2023', 'Funding Secured', 'Secured the resources needed to bring the studio to life from local and federal funding bodies.', true),
  (3, 'June 2023', 'Equipment Arrives', 'Professional cameras, lighting equipment, and editing workstations arrived on Palm Island.', true),
  (4, 'September 2023', 'First Portrait Sessions', 'The studio opened its doors. Over 50 families had professional photos taken in the first month.', true),
  (5, 'December 2023', 'Youth Training Program', 'Young community members completed their first photography training module.', true),
  (6, 'March 2024', 'First Exhibition', 'Community photographs exhibited at the mainland gallery.', true),
  (7, 'August 2025', 'Photo Kiosk V1', 'Self-service photo kiosk installed for instant community prints.', false)
) AS v(event_order, event_date, event_title, event_description, is_complete)
WHERE s.slug = 'photo-studio-story' AND ss.section_type = 'timeline';


-- ============================================================
-- THE STATION sections
-- ============================================================

INSERT INTO story_sections (story_id, section_order, section_type, title, content, media_url, media_type, media_position, media_alt, quote_author, quote_role)
SELECT s.id, v.section_order, v.section_type, v.title, v.content, v.media_url, v.media_type, v.media_position, v.media_alt, v.quote_author, v.quote_role
FROM immersive_stories s
CROSS JOIN (VALUES
  (1, 'text', 'The Why',
   'Palm Island faces a youth justice crisis. Young people leave the island with limited pathways — few jobs, fewer training opportunities, and a system that often fails them. Meanwhile, in Townsville, a neglected site with decades of history sits waiting for a new purpose.

The Station is PICC''s answer: transform a disused facility into a thriving hub where Palm Island youth can learn trades, build enterprises, and create real pathways — all within a culturally safe environment that bridges island and mainland life.',
   NULL, NULL, NULL, NULL, NULL, NULL),

  (2, 'quote', NULL,
   'Our young people don''t need more programs. They need real work, real skills, and a place that feels like home even when they''re off-island.',
   NULL, NULL, NULL, NULL, 'PICC Leadership', 'Palm Island Community Company'),

  (3, 'sidebyside', 'The What',
   'The Station is a circular-economy manufacturing and hospitality training hub on a 30-year lease in Townsville. The facility will include recycled bed base manufacturing from mattress waste, washing machine refurbishment and resale, a commercial kitchen for hospitality training, and youth diversionary programs as an alternative to detention.

This creates a bridge between Palm Island and Townsville — youth can train, work, and build careers while staying connected to community.',
   '/images/palm-island-aerial.jpg', 'image', 'right', 'The Station site', NULL, NULL),

  (4, 'timeline', 'The Roadmap', NULL, NULL, NULL, NULL, NULL, NULL, NULL),

  (5, 'sidebyside', 'The How',
   'The Station embodies PICC''s philosophy of community stewardship. It operates under a 30-year lease that ensures long-term community ownership. Manufacturing creates real products for real markets — not make-work. Youth programs are designed as diversionary alternatives to the justice system.

Everything connects back to Palm Island: trained workers return home with certificates, enterprises generate income that flows back to community, and young people see a future they can build with their own hands.',
   '/images/palm-island-aerial.jpg', 'image', 'left', 'Youth training at The Station', NULL, NULL),

  (6, 'parallax', 'Building Futures',
   'Circular economy, community enterprise, youth pathways',
   '/images/palm-island-sunset.jpg', NULL, NULL, NULL, NULL, NULL)
) AS v(section_order, section_type, title, content, media_url, media_type, media_position, media_alt, quote_author, quote_role)
WHERE s.slug = 'the-station-story';

-- The Station timeline events
INSERT INTO story_timeline_events (section_id, event_order, event_date, event_title, event_description, is_complete)
SELECT ss.id, v.event_order, v.event_date, v.event_title, v.event_description, v.is_complete
FROM story_sections ss
JOIN immersive_stories s ON s.id = ss.story_id
CROSS JOIN (VALUES
  (1, '2024', 'Site Assessment', 'Comprehensive assessment of the Townsville facility, identifying infrastructure needs and potential.', true),
  (2, '2024', 'Lease Secured', '30-year lease agreement finalised with Townsville City Council.', true),
  (3, '2025', 'Site Cleanup', 'Major cleanup and remediation of the facility grounds.', true),
  (4, '2025', 'Kitchen Reactivation', 'Commercial kitchen refurbished and certified for hospitality training.', false),
  (5, '2026', 'Manufacturing Launch', 'Bed base manufacturing line begins operations with first youth trainees.', false),
  (6, 'March 2027', 'Investment Ready', 'Facility fully operational and generating revenue across all streams.', false)
) AS v(event_order, event_date, event_title, event_description, is_complete)
WHERE s.slug = 'the-station-story' AND ss.section_type = 'timeline';


-- ============================================================
-- ELDERS TRIP TO HULL RIVER sections
-- ============================================================

INSERT INTO story_sections (story_id, section_order, section_type, title, content, media_url, media_type, media_position, media_alt, media_caption, quote_author, quote_role)
SELECT s.id, v.section_order, v.section_type, v.title, v.content, v.media_url, v.media_type, v.media_position, v.media_alt, v.media_caption, v.quote_author, v.quote_role
FROM immersive_stories s
CROSS JOIN (VALUES
  (1, 'text', 'The Why',
   'In 1918, a Category 5 cyclone destroyed the Hull River Settlement on Djiru country near present-day Mission Beach. Survivors — people from dozens of language groups — were transferred to Palm Island. For over a century, the connection between Palm Island and Hull River lived only in memory and oral history.

This journey was about reconnection. Elders who had heard stories from their grandparents would stand on the land for the first time. Intergenerational knowledge, nearly lost, would be recorded and preserved. The Elders Trip to Hull River was not just a visit — it was a homecoming.',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL),

  (2, 'quote', NULL,
   'My grandmother told me stories about this place. She never got to come back. I''m here for her today.',
   NULL, NULL, NULL, NULL, NULL, 'Elder on the Journey', 'Hull River Cultural Visit'),

  (3, 'sidebyside', 'The What',
   'In 2024, a group of Palm Island Elders made the journey from the island to Lucinda, then to Ingham, and finally to the Hull River site. Every step was documented: 4K video captured the landscape and the Elders'' reflections, GPS mapping traced the route, and cultural protocols guided what was shared and what remained private.

The journey produced hours of footage, dozens of oral histories, and a renewed connection between Palm Island and its origins. It now forms a cornerstone of PICC''s cultural archive.',
   '/images/palm-island-aerial.jpg', 'image', 'right', 'Elders at Hull River', NULL, NULL, NULL),

  (4, 'timeline', 'The Journey', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

  (5, 'video', 'Watch the Journey', NULL,
   '/videos/elders-trip-placeholder.mp4', 'video', NULL, NULL,
   'Elders reflect on the significance of returning to Hull River', NULL, NULL),

  (6, 'sidebyside', 'The How',
   'The Hull River journey was Elder-led from start to finish. Cultural knowledge holders decided the route, the protocols, and what could be shared publicly. 4K documentation ensures the journey is preserved for future generations while GPS mapping creates a digital cultural trail.

This project connects to PICC''s broader vision: preserving heritage through modern tools, always with community control at the centre. The footage and oral histories are stored on the On-Country Server, ensuring they remain in community hands.',
   '/images/palm-island-aerial.jpg', 'image', 'left', 'Cultural documentation', NULL, NULL, NULL),

  (7, 'parallax', 'Remembering. Reconnecting. Returning.',
   'Explore the full Elders Trip experience',
   '/images/palm-island-sunset.jpg', NULL, NULL, NULL, NULL, NULL, NULL)
) AS v(section_order, section_type, title, content, media_url, media_type, media_position, media_alt, media_caption, quote_author, quote_role)
WHERE s.slug = 'elders-trips-story';

-- Elders Trip timeline events
INSERT INTO story_timeline_events (section_id, event_order, event_date, event_title, event_description, is_complete)
SELECT ss.id, v.event_order, v.event_date, v.event_title, v.event_description, v.is_complete
FROM story_sections ss
JOIN immersive_stories s ON s.id = ss.story_id
CROSS JOIN (VALUES
  (1, 'Early 2024', 'Planning & Protocols', 'Elder Advisory committee established cultural protocols for the journey and documentation.', true),
  (2, 'Mid 2024', 'Departure from Palm Island', 'Elders departed Palm Island by ferry, beginning the journey to the mainland.', true),
  (3, 'Mid 2024', 'Lucinda & Ingham', 'Stopovers at key towns along the historic route, gathering oral histories.', true),
  (4, 'Mid 2024', 'Arrival at Hull River', 'Elders stood on the Hull River site for the first time, sharing stories passed down through generations.', true),
  (5, 'Late 2024', 'Documentation Complete', 'Hours of 4K footage, GPS data, and oral histories catalogued and archived.', true),
  (6, 'Late 2024', 'Community Screening', 'Edited documentary screened for Palm Island community with Elder approval.', true)
) AS v(event_order, event_date, event_title, event_description, is_complete)
WHERE s.slug = 'elders-trips-story' AND ss.section_type = 'timeline';


-- ============================================================
-- ON-COUNTRY SERVER sections
-- ============================================================

INSERT INTO story_sections (story_id, section_order, section_type, title, content, media_url, media_type, media_position, media_alt, quote_author, quote_role)
SELECT s.id, v.section_order, v.section_type, v.title, v.content, v.media_url, v.media_type, v.media_position, v.media_alt, v.quote_author, v.quote_role
FROM immersive_stories s
CROSS JOIN (VALUES
  (1, 'text', 'The Why',
   'Community data about Palm Island — photos, health records, cultural archives, stories — is stored on servers in Sydney, in the US, in the cloud. Our data lives everywhere except here, on our island, in our hands.

Digital sovereignty means the same thing as every other kind of sovereignty PICC fights for: community control. The On-Country Server puts a physical machine on Palm Island soil, ensuring that the most sensitive community data can only be accessed by someone who is physically present on the island.',
   NULL, NULL, NULL, NULL, NULL, NULL),

  (2, 'quote', NULL,
   'Our stories, our photos, our history — they should live here, on this island, where they belong. Not on some server on the other side of the world.',
   NULL, NULL, NULL, NULL, 'PICC Digital Team', 'On-Country Server Project'),

  (3, 'sidebyside', 'The What',
   'The On-Country Server is a physical server installed on Palm Island that hosts the community''s most important digital assets: the photo archive from the Photo Studio, historical documents and images, cultural recordings from the Elders Trip, and community data that requires cultural protocols for access.

The server integrates with the Photo Kiosk, allowing community members to access and print their photos without any data leaving the island. It is the digital backbone of PICC''s cultural preservation strategy.',
   '/images/palm-island-aerial.jpg', 'image', 'right', 'On-Country Server concept', NULL, NULL),

  (4, 'timeline', 'Implementation Phases', NULL, NULL, NULL, NULL, NULL, NULL, NULL),

  (5, 'sidebyside', 'The How',
   'Digital sovereignty requires physical presence. The On-Country Server can only be accessed from the island — this is a feature, not a limitation. It ensures that cultural material stays under community control.

Youth from the Digital Service Centre are being trained in server maintenance, creating a new technical skill pathway. The project connects to every other PICC innovation: the Photo Studio feeds images to it, the Elders Trip footage is archived on it, and the Annual Report System draws from it.',
   '/images/palm-island-aerial.jpg', 'image', 'left', 'Youth tech training', NULL, NULL),

  (6, 'parallax', 'Our Data. Our Island. Our Control.',
   'Digital sovereignty for Palm Island',
   '/images/palm-island-sunset.jpg', NULL, NULL, NULL, NULL, NULL)
) AS v(section_order, section_type, title, content, media_url, media_type, media_position, media_alt, quote_author, quote_role)
WHERE s.slug = 'on-country-server-story';

-- On-Country Server timeline events
INSERT INTO story_timeline_events (section_id, event_order, event_date, event_title, event_description, is_complete)
SELECT ss.id, v.event_order, v.event_date, v.event_title, v.event_description, v.is_complete
FROM story_sections ss
JOIN immersive_stories s ON s.id = ss.story_id
CROSS JOIN (VALUES
  (1, '2025', 'Phase 1: Installation', 'Physical server hardware installed on Palm Island with solar backup power.', false),
  (2, '2025', 'Phase 1: Photo Archive', 'Photo Studio archive migrated to on-island storage with kiosk integration.', false),
  (3, '2026', 'Phase 2: Cultural Archive', 'Elders Trip footage, oral histories, and historical documents loaded onto the server.', false),
  (4, '2026', 'Phase 2: Access Protocols', 'Cultural protocols encoded into access controls — sensitivity levels enforced digitally.', false),
  (5, '2027', 'Phase 3: Full Ownership', 'Community members fully trained in maintenance. Server operates independently.', false)
) AS v(event_order, event_date, event_title, event_description, is_complete)
WHERE s.slug = 'on-country-server-story' AND ss.section_type = 'timeline';


-- ============================================================
-- ANNUAL REPORT SYSTEM sections
-- ============================================================

INSERT INTO story_sections (story_id, section_order, section_type, title, content, media_url, media_type, media_position, media_alt, quote_author, quote_role)
SELECT s.id, v.section_order, v.section_type, v.title, v.content, v.media_url, v.media_type, v.media_position, v.media_alt, v.quote_author, v.quote_role
FROM immersive_stories s
CROSS JOIN (VALUES
  (1, 'text', 'The Why',
   'Traditional annual reports miss the community voice. They cost tens of thousands to produce externally, take months to compile, and often reduce a year of community work to dry statistics. By the time the report is published, the stories are old and the data is stale.

PICC needed a system that could capture the richness of community work as it happens — Elder quotes, service metrics, project milestones, community feedback — and assemble it into a professional report that speaks in the community''s own voice.',
   NULL, NULL, NULL, NULL, NULL, NULL),

  (2, 'quote', NULL,
   'The numbers tell part of the story. The community tells the rest. This system brings both together.',
   NULL, NULL, NULL, NULL, 'PICC Communications', 'Annual Report System'),

  (3, 'sidebyside', 'The What',
   'The Annual Report System is an AI-powered pipeline that transforms community knowledge into professional PDF reports. It connects to PICC''s Supabase knowledge base, pulls real-time data — service metrics, Elder quotes, project updates, community stories — and assembles it into branded, print-ready documents.

The system uses WeasyPrint for PDF generation, with templates that match PICC''s brand guidelines. Reports can be generated for the full organisation or for individual service programs, and they update continuously as new data enters the system.',
   '/images/palm-island-aerial.jpg', 'image', 'right', 'Annual Report System dashboard', NULL, NULL),

  (4, 'timeline', 'Development Journey', NULL, NULL, NULL, NULL, NULL, NULL, NULL),

  (5, 'sidebyside', 'The How',
   'The system follows a four-step pipeline: validate data readiness, assemble content from the knowledge base, generate the PDF via WeasyPrint, and validate the output quality. Each step can run independently, and the entire pipeline can be triggered with a single command.

Community data collection happens year-round through the web platform — staff enter service metrics, Elders share quotes, projects log milestones. The report system simply gathers what''s already there and gives it shape. No external consultants, no months of compilation, no lost community voice.',
   '/images/palm-island-aerial.jpg', 'image', 'left', 'Report generation pipeline', NULL, NULL),

  (6, 'parallax', 'Always On. Always Our Voice.',
   'Continuous reporting, community-controlled',
   '/images/palm-island-sunset.jpg', NULL, NULL, NULL, NULL, NULL)
) AS v(section_order, section_type, title, content, media_url, media_type, media_position, media_alt, quote_author, quote_role)
WHERE s.slug = 'annual-report-system-story';

-- Annual Report System timeline events
INSERT INTO story_timeline_events (section_id, event_order, event_date, event_title, event_description, is_complete)
SELECT ss.id, v.event_order, v.event_date, v.event_title, v.event_description, v.is_complete
FROM story_sections ss
JOIN immersive_stories s ON s.id = ss.story_id
CROSS JOIN (VALUES
  (1, 'Late 2024', 'Knowledge Base Built', 'Supabase database schema designed and populated with PICC organisational data.', true),
  (2, 'Early 2025', 'PDF Pipeline Created', 'WeasyPrint-based generation pipeline built: validate, assemble, generate, validate.', true),
  (3, 'Mid 2025', 'Brand Templates', 'HTML/CSS templates designed to match PICC brand guidelines for print-ready output.', true),
  (4, 'Late 2025', 'Live Dashboard', 'Real-time annual report dashboard launched, showing report data as it is collected.', true),
  (5, '2026', 'AI Integration', 'AI-powered content assembly and narrative generation from community knowledge base.', false),
  (6, '2026', 'Community Self-Service', 'Staff can generate reports on demand without technical assistance.', false)
) AS v(event_order, event_date, event_title, event_description, is_complete)
WHERE s.slug = 'annual-report-system-story' AND ss.section_type = 'timeline';
