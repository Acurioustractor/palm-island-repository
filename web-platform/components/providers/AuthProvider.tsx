'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, createUntypedClient } from '@/lib/supabase/client'
import type { User, Session, AuthError } from '@supabase/supabase-js'

// Types for our auth context
interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'staff' | 'storyteller' | 'viewer'
  organization_id: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Fetch user profile from profiles table
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // Use untyped client to avoid type issues and potential RLS problems
      const untypedSupabase = createUntypedClient()
      const { data, error } = await untypedSupabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, organization_id')
        .eq('user_id', userId)
        .maybeSingle() // Use maybeSingle to handle no rows gracefully

      if (error) {
        // Log but don't crash - profile might not exist yet
        console.warn('Profile fetch warning:', error.message)
        // Return a default profile structure so the app still works
        return {
          id: userId,
          full_name: null,
          avatar_url: null,
          role: 'viewer' as const,
          organization_id: null
        }
      }

      if (!data) {
        // No profile exists yet - return default
        return {
          id: userId,
          full_name: null,
          avatar_url: null,
          role: 'viewer' as const,
          organization_id: null
        }
      }

      return data as UserProfile
    } catch (err) {
      console.warn('Error in fetchProfile:', err)
      // Return default profile so app doesn't break
      return {
        id: userId,
        full_name: null,
        avatar_url: null,
        role: 'viewer' as const,
        organization_id: null
      }
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()

        if (initialSession?.user) {
          setSession(initialSession)
          setUser(initialSession.user)
          const userProfile = await fetchProfile(initialSession.user.id)
          setProfile(userProfile)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          const userProfile = await fetchProfile(currentSession.user.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }

        // Handle specific events
        if (event === 'SIGNED_OUT') {
          setProfile(null)
          router.push('/')
        } else if (event === 'PASSWORD_RECOVERY') {
          router.push('/reset-password')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile, router])

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (!error && data.user) {
      const userProfile = await fetchProfile(data.user.id)
      setProfile(userProfile)
      router.push('/picc/dashboard')
      router.refresh()
    }

    setLoading(false)
    return { error }
  }, [supabase, fetchProfile, router])

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    })

    // Create profile after signup (will be linked when email confirmed)
    // Using untyped client since profiles table may not have user_id in generated types
    if (!error && data.user) {
      const untypedSupabase = createUntypedClient()
      await untypedSupabase.from('profiles').upsert({
        user_id: data.user.id,
        full_name: fullName,
        role: 'viewer',
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
    }

    setLoading(false)
    return { error }
  }, [supabase])

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
    setLoading(false)
    router.push('/')
    router.refresh()
  }, [supabase, router])

  // Send password reset email
  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      }
    )
    return { error }
  }, [supabase])

  // Update password (when user has recovery token)
  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (!error) {
      router.push('/picc/dashboard')
    }

    return { error }
  }, [supabase, router])

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id)
      setProfile(userProfile)
    }
  }, [user, fetchProfile])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Simple hook for checking auth status
export function useIsAuthenticated() {
  const { isAuthenticated, loading } = useAuth()
  return { isAuthenticated, loading }
}

// Hook for requiring authentication
export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, loading, redirectTo, router])

  return { isAuthenticated, loading }
}
