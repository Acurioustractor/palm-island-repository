import { createClient } from './client';

export interface SignInWithMagicLinkParams {
  email: string;
  redirectTo?: string;
}

export interface SignUpParams {
  email: string;
  password?: string;
  userData?: {
    full_name?: string;
    phone_number?: string;
  };
}

/**
 * Send a magic link to user's email (NO PASSWORD REQUIRED!)
 * Perfect for low-literacy users and mobile-first experience
 */
export async function signInWithMagicLink({ email, redirectTo }: SignInWithMagicLinkParams) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      shouldCreateUser: true, // Auto-create user if they don't exist
    },
  });

  return { data, error };
}

/**
 * Sign up with email and optional password
 * Creates profile automatically in profiles table
 */
export async function signUp({ email, password, userData }: SignUpParams) {
  const supabase = createClient();

  // If no password provided, use magic link flow
  if (!password) {
    return signInWithMagicLink({ email });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData, // Stored in auth.users.raw_user_meta_data
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  // Create profile in profiles table
  if (data.user && !error) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: userData?.full_name || '',
        preferred_name: userData?.full_name || '',
        storyteller_type: 'community_member',
        metadata: {
          phone_number: userData?.phone_number,
        },
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }
  }

  return { data, error };
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

/**
 * Sign out current user
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current user session
 */
export async function getSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

/**
 * Get current user
 */
export async function getUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const { data } = await getSession();
  return !!data.session;
}

/**
 * Get user profile from profiles table
 */
export async function getUserProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: null };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { data, error };
}
