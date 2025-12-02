'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

/**
 * Auth Confirmation Page
 *
 * This page handles client-side auth confirmation for cases where
 * the auth token comes in the URL hash fragment (implicit flow).
 */
export default function AuthConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const handleAuthConfirmation = async () => {
      try {
        // Check if there's a session (auto-set from hash params)
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          setStatus('error')
          setMessage(error.message)
          return
        }

        if (session) {
          setStatus('success')
          setMessage('Your email has been verified successfully!')

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/picc/dashboard')
          }, 2000)
        } else {
          // No session - might need to handle hash params manually
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')

          if (accessToken && refreshToken) {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (setSessionError) {
              setStatus('error')
              setMessage(setSessionError.message)
            } else {
              setStatus('success')
              setMessage('Your email has been verified successfully!')
              setTimeout(() => {
                router.push('/picc/dashboard')
              }, 2000)
            }
          } else {
            setStatus('error')
            setMessage('No authentication data found. Please try signing in again.')
          }
        }
      } catch (err) {
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
        console.error('Auth confirmation error:', err)
      }
    }

    handleAuthConfirmation()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Verifying your email...
              </h1>
              <p className="text-gray-600">Please wait while we confirm your account.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Email Verified!
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
