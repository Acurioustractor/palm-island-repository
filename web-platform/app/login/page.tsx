'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Heart, CheckCircle, Loader } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { signInWithMagicLink, signIn } from '@/lib/supabase/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [usePassword, setUsePassword] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signInWithMagicLink({ email });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMagicLinkSent(true);
      setLoading(false);
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-ocean-deep mb-4">Check Your Email!</h2>
            <p className="text-lg text-earth-medium mb-6">
              We've sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-earth-medium mb-8">
              Click the link in the email to sign in. No password needed!
            </p>

            <div className="bg-blue-50 border-2 border-ocean-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-ocean-deep">
                <strong>📧 Didn't receive the email?</strong><br />
                Check your spam folder or wait a minute and try again.
              </p>
            </div>

            <button
              onClick={() => {
                setMagicLinkSent(false);
                setEmail('');
              }}
              className="text-coral-warm hover:text-ocean-deep font-medium"
            >
              ← Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center text-coral-warm hover:text-ocean-deep font-medium mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Cultural Design */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-purple-100">
              Sign in to share your story with the Palm Island community
            </p>
          </div>

          <div className="p-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Magic Link Form (Default - NO PASSWORD!) */}
            {!usePassword ? (
              <form onSubmit={handleMagicLink} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-earth-dark mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    We'll send you a magic link - no password needed!
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Sending Magic Link...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Send Me a Magic Link
                    </>
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setUsePassword(true)}
                  className="w-full bg-white border-2 border-gray-300 text-earth-dark font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Sign in with Password Instead
                </button>
              </form>
            ) : (
              /* Password Login Form */
              <form onSubmit={handlePasswordLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-earth-dark mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-earth-dark mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing In...' : 'Sign In with Password'}
                </button>

                <button
                  type="button"
                  onClick={() => setUsePassword(false)}
                  className="w-full text-coral-warm hover:text-ocean-deep font-medium"
                >
                  ← Use Magic Link Instead (Easier!)
                </button>
              </form>
            )}

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-earth-medium">
                Don't have an account?{' '}
                <Link href="/signup" className="text-coral-warm hover:text-ocean-deep font-bold">
                  Sign Up Here
                </Link>
              </p>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-ocean-deep">
                <strong>🎯 First time here?</strong><br />
                Magic links are the easiest way to sign in - no password to remember!
                Just enter your email and click the link we send you.
              </p>
            </div>
          </div>
        </div>

        {/* Community Message */}
        <div className="mt-6 text-center text-earth-medium">
          <p className="text-sm italic">
            Manbarra & Bwgcolman Country • Palm Island Community
          </p>
        </div>
      </div>
    </div>
  );
}
