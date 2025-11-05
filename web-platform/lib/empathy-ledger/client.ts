/**
 * Empathy Ledger Supabase Client
 * Configured for Palm Island Community Repository
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for browser/client-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Admin client for server-side operations (use with caution!)
export const getAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Helper to get current user's profile
export const getCurrentProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  return profile;
};

// Helper to check if user has specific permissions
export const checkPermission = async (
  permissionType: string,
  profileId?: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { data: permissions } = await supabase
    .from('cultural_permissions')
    .select('*')
    .eq('profile_id', profileId || user.id)
    .eq('permission_type', permissionType)
    .eq('is_active', true);
  
  return permissions && permissions.length > 0;
};

export default supabase;
