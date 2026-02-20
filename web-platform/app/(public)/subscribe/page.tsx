'use client';

import { useState, FormEvent } from 'react';
import { Mail, Check, Loader2 } from 'lucide-react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function SubscribePage() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const interests = formData.getAll('interest') as string[];

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, interests }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Hero */}
      <section className="relative editorial-section border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
            Stay Connected
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-[-0.02em] leading-[1.1] mt-4 mb-6">
            Subscribe to Updates
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
            Stay connected to Palm Island. Get community stories, milestones, and updates from the people doing the work — straight to your inbox.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re subscribed!</h2>
                <p className="text-gray-500">
                  Thank you for joining us. You&apos;ll receive updates about Palm Island community stories and impact.
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-300 ease-elegant"
                      required
                      disabled={status === 'loading'}
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-300 ease-elegant"
                      disabled={status === 'loading'}
                    />
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      I&apos;m interested in: (Optional)
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="interest" value="stories" className="rounded text-gray-900 focus:ring-gray-900" disabled={status === 'loading'} />
                        <span className="text-gray-700">Community Stories</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="interest" value="impact" className="rounded text-gray-900 focus:ring-gray-900" disabled={status === 'loading'} />
                        <span className="text-gray-700">PICC Impact &amp; Achievements</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="interest" value="innovation" className="rounded text-gray-900 focus:ring-gray-900" disabled={status === 'loading'} />
                        <span className="text-gray-700">Innovation &amp; Projects</span>
                      </label>
                    </div>
                  </div>

                  {status === 'error' && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 hover:bg-gray-800 hover:scale-[0.98] active:scale-95 text-white font-semibold rounded-full shadow-sm transition-all duration-300 ease-elegant disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        <span>Subscribe</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-gray-400 mt-4 text-center">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* What You'll Receive */}
      <section className="py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-4 text-center">
            What to expect
          </h2>
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-[-0.02em] mb-10 text-center">
            What You&apos;ll Receive
          </h3>
          <ul className="space-y-6">
            {[
              { title: 'Monthly Impact Updates', desc: 'See the latest achievements, milestones, and community outcomes' },
              { title: 'Featured Community Stories', desc: 'Powerful stories from Palm Islanders sharing their experiences and wisdom' },
              { title: 'Innovation Highlights', desc: 'Learn about new projects and pioneering approaches from PICC' },
              { title: 'Quarterly Impact Reports', desc: 'Detailed insights into PICC\'s work and community outcomes' },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                  <Check className="w-3.5 h-3.5 text-gray-900" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
