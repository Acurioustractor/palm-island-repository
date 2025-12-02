'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  })
  const router = useRouter()
  const { success, error: showError } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      })
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, loading: true }))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setState((prev) => ({ ...prev, loading: false }))
        showError('Sign In Failed', error.message)
        return { error }
      }

      success('Welcome back!', 'You have successfully signed in.')
      router.push('/picc/dashboard')
      router.refresh()

      return { data }
    },
    [supabase.auth, router, success, showError]
  )

  const signUp = useCallback(
    async (email: string, password: string, metadata?: Record<string, any>) => {
      setState((prev) => ({ ...prev, loading: true }))

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) {
        setState((prev) => ({ ...prev, loading: false }))
        showError('Sign Up Failed', error.message)
        return { error }
      }

      success(
        'Account Created',
        'Please check your email to verify your account.'
      )

      return { data }
    },
    [supabase.auth, success, showError]
  )

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }))

    const { error } = await supabase.auth.signOut()

    if (error) {
      setState((prev) => ({ ...prev, loading: false }))
      showError('Sign Out Failed', error.message)
      return { error }
    }

    success('Signed Out', 'You have been successfully signed out.')
    router.push('/')
    router.refresh()

    return {}
  }, [supabase.auth, router, success, showError])

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        showError('Reset Failed', error.message)
        return { error }
      }

      success(
        'Password Reset Email Sent',
        'Please check your email for the reset link.'
      )

      return {}
    },
    [supabase.auth, success, showError]
  )

  const updatePassword = useCallback(
    async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        showError('Update Failed', error.message)
        return { error }
      }

      success('Password Updated', 'Your password has been updated successfully.')

      return {}
    },
    [supabase.auth, success, showError]
  )

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    isAuthenticated: !!state.user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }
}

// Simple hook for checking auth status without full functionality
export function useIsAuthenticated() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return isAuthenticated
}
