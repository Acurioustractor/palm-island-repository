/**
 * Reliable Supabase Client for Scripts
 *
 * This module provides a pre-configured Supabase client for use in scripts.
 * It handles environment variable loading and validation automatically.
 *
 * Usage:
 *   import { supabase } from './lib/supabase';
 *   const { data, error } = await supabase.from('media_files').select('*');
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
const envPath = resolve(__dirname, '../../.env.local');
const result = config({ path: envPath });

if (result.error) {
  console.error('⚠️  Warning: Could not load .env.local file');
  console.error('   Trying environment variables...');
}

// Validate required environment variables
const requiredVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const missing: string[] = [];
for (const [key, value] of Object.entries(requiredVars)) {
  if (!value) {
    missing.push(key);
  }
}

if (missing.length > 0) {
  console.error('❌ ERROR: Missing required environment variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  console.error('\n💡 Make sure .env.local exists with Supabase credentials');
  process.exit(1);
}

// Create Supabase client
// Use service role key if available for admin operations, otherwise use anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey,
  {
    auth: {
      persistSession: false, // Scripts don't need session persistence
      autoRefreshToken: false,
    },
  }
);

// Export individual env vars for convenience
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  isServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Helper to verify connection
export async function verifyConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1).single();

    if (error) {
      // If it's just a "no rows" error, connection is fine
      if (error.code === 'PGRST116') {
        return true;
      }
      console.error('❌ Connection test failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection verified');
    return true;
  } catch (err) {
    console.error('❌ Connection test error:', err);
    return false;
  }
}

// Helper for common queries
export const queries = {
  // Get all media files
  async getAllMedia(limit = 100) {
    return supabase
      .from('media_files')
      .select('*')
      .is('deleted_at', null)
      .limit(limit);
  },

  // Get media by page context
  async getMediaByPage(pageContext: string) {
    return supabase
      .from('media_files')
      .select('*')
      .eq('page_context', pageContext)
      .is('deleted_at', null)
      .order('display_order', { ascending: true });
  },

  // Get media count
  async getMediaCount() {
    const { count } = await supabase
      .from('media_files')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);
    return count || 0;
  },

  // Update media page assignment
  async assignToPage(
    mediaId: string,
    pageContext: string,
    pageSection: string,
    displayOrder: number = 0
  ) {
    return supabase
      .from('media_files')
      .update({
        page_context: pageContext,
        page_section: pageSection,
        display_order: displayOrder,
      })
      .eq('id', mediaId);
  },

  // Bulk update media
  async bulkUpdate(mediaIds: string[], updates: Record<string, any>) {
    return supabase
      .from('media_files')
      .update(updates)
      .in('id', mediaIds);
  },

  // Get collections
  async getCollections() {
    return supabase
      .from('photo_collections')
      .select('*')
      .order('created_at', { ascending: false });
  },

  // Get smart folders
  async getSmartFolders() {
    return supabase
      .from('smart_folders')
      .select('*')
      .order('name');
  },
};

// Export for logging
if (require.main === module) {
  console.log('📊 Supabase Script Helper');
  console.log('========================');
  console.log(`URL: ${env.supabaseUrl}`);
  console.log(`Auth: ${env.isServiceRole ? 'Service Role' : 'Anon Key'}`);
  console.log(`Env file: ${envPath}`);
  console.log('');

  verifyConnection().then(success => {
    if (success) {
      console.log('✅ Connection verified successfully');
      queries.getMediaCount().then(count => {
        console.log(`📸 Media files in database: ${count}`);
      });
    } else {
      console.log('❌ Connection failed');
      process.exit(1);
    }
  });
}
