'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('password');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/picc/dashboard`,
          },
        });
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Check your email for a magic sign-in link.');
        }
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const redirect = searchParams.get('redirect');
      const safeRedirect = redirect && redirect.startsWith('/') ? redirect : '/picc/dashboard';
      window.location.href = safeRedirect;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="border-b border-gray-100 px-6 py-4">
        <Link href="/" className="animated-underline text-sm font-semibold text-gray-900 tracking-[-0.01em]">
          Palm Island Community Company
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
              Admin
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-[-0.02em] leading-[1.1] mt-2">
              Sign in
            </h1>
            <p className="text-gray-500 text-sm mt-2">Access the PICC admin dashboard</p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-full mb-8">
            <button
              type="button"
              onClick={() => { setMode('password'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                mode === 'password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => { setMode('magic'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                mode === 'magic' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Magic Link
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-2xl text-sm">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-300 ease-elegant"
                placeholder="you@example.com"
              />
            </div>

            {mode === 'password' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-300 ease-elegant"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3.5 px-4 rounded-full font-semibold hover:bg-gray-800 hover:scale-[0.98] active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-elegant"
            >
              {loading
                ? (mode === 'magic' ? 'Sending link...' : 'Signing in...')
                : (mode === 'magic' ? 'Send magic link' : 'Sign in')
              }
            </button>
          </form>

          {mode === 'magic' && (
            <p className="text-center text-xs text-gray-400 mt-4">
              We'll email you a one-click sign-in link. No password needed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
