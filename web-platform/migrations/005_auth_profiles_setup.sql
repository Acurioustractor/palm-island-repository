-- ============================================================================
-- Authentication & Profiles Setup
-- Run this in Supabase SQL Editor to enable full auth functionality
-- ============================================================================

-- ============================================================================
-- 1. Ensure profiles table has required auth columns
-- ============================================================================

-- Add user_id column if it doesn't exist (links to Supabase auth.users)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
    ALTER TABLE profiles ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
  END IF;

  -- Add role column for access control
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'viewer'
      CHECK (role IN ('admin', 'staff', 'storyteller', 'viewer'));
  END IF;

  -- Add organization_id for multi-org support
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'organization_id') THEN
    ALTER TABLE profiles ADD COLUMN organization_id UUID REFERENCES organizations(id);
  END IF;

  -- Add avatar_url for profile photos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;

  -- Add email for convenience (synced from auth.users)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;

  -- Add last_sign_in tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'last_sign_in_at') THEN
    ALTER TABLE profiles ADD COLUMN last_sign_in_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================================================
-- 2. Row Level Security (RLS) Policies for profiles
-- ============================================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-runs)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Service role bypass" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles in their organization
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admins can update all profiles in their organization
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Public profiles (for storytellers page, etc.)
CREATE POLICY "Public profiles are viewable" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories s
      WHERE s.storyteller_id = profiles.id
      AND s.is_public = true
      AND s.status = 'published'
    )
  );

-- ============================================================================
-- 3. Function to create profile on user signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'viewer',
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. Function to update last_sign_in_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_user_sign_in()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_sign_in_at = NOW()
  WHERE user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger would go on auth.users but requires special permissions
-- Alternatively, update from the application on sign-in

-- ============================================================================
-- 5. Helper function to check user role
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE user_id = user_uuid LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- 6. Create first admin user (run this AFTER creating account via signup)
-- ============================================================================

-- To make yourself an admin, run this after signing up:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON COLUMN profiles.user_id IS 'Links to Supabase auth.users table';
COMMENT ON COLUMN profiles.role IS 'User role: admin, staff, storyteller, or viewer';
COMMENT ON COLUMN profiles.organization_id IS 'Organization this user belongs to';
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates profile automatically when user signs up';
COMMENT ON FUNCTION public.get_user_role(UUID) IS 'Helper to get user role by user_id';
COMMENT ON FUNCTION public.is_admin(UUID) IS 'Check if user is an admin';

-- ============================================================================
-- Success message
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Auth & Profiles Setup Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Settings';
  RAISE NOTICE '2. Set Site URL to your production URL';
  RAISE NOTICE '3. Add localhost:3000 to Redirect URLs';
  RAISE NOTICE '4. Enable Email provider in Providers tab';
  RAISE NOTICE '5. Sign up via your app';
  RAISE NOTICE '6. Make yourself admin: UPDATE profiles SET role = ''admin'' WHERE email = ''your@email.com'';';
  RAISE NOTICE '';
END $$;
