import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

/**
 * Creates a Supabase client for Server Components
 * Handles cookie-based session management for SSR
 */
export async function createServerComponentClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase client for API Routes and Server Actions
 * With full cookie read/write access
 */
export async function createRouteHandlerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

/**
 * Gets the current user from the server
 * Returns null if not authenticated
 */
export async function getServerUser() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Gets the current session from the server
 * Returns null if not authenticated
 */
export async function getServerSession() {
  const supabase = await createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Profile type for auth purposes
interface AuthProfile {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  role: 'admin' | 'staff' | 'storyteller' | 'viewer'
  organization_id: string | null
  last_sign_in_at: string | null
}

/**
 * Gets the current user's profile from the database
 * Returns null if not authenticated or profile doesn't exist
 */
export async function getServerProfile(): Promise<AuthProfile | null> {
  const user = await getServerUser()

  if (!user) return null

  const supabase = await createServerComponentClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return profile as AuthProfile | null
}

/**
 * Checks if the current user has a specific role
 */
export async function hasRole(role: 'admin' | 'staff' | 'storyteller' | 'viewer') {
  const profile = await getServerProfile()
  return profile?.role === role
}

/**
 * Checks if the current user is an admin
 */
export async function isAdmin() {
  return hasRole('admin')
}

/**
 * Server action to require authentication
 * Throws an error if user is not authenticated
 */
export async function requireAuth() {
  const user = await getServerUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

/**
 * Server action to require admin role
 * Throws an error if user is not an admin
 */
export async function requireAdmin() {
  const profile = await getServerProfile()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Admin access required')
  }

  return profile
}
