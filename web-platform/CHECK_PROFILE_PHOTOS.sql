-- Check if profiles have photo URLs or profile_image_url column
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND (
    column_name LIKE '%photo%'
    OR column_name LIKE '%image%'
    OR column_name LIKE '%avatar%'
    OR column_name LIKE '%picture%'
  );

-- Also check what columns profiles table actually has
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check a few sample profiles to see what data they have
SELECT
  id,
  full_name,
  preferred_name,
  community_role,
  bio
FROM profiles
LIMIT 5;
