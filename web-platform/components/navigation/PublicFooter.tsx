'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Facebook } from 'lucide-react';
import { PICCLogo } from '@/components/ui/PICCLogo';

export function PublicFooter() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* About PICC */}
          <div className="lg:col-span-1">
            <PICCLogo variant="horizontal" size="sm" href="/" theme="dark" className="mb-4" />
            <p className="text-sm text-stone-400 leading-relaxed">
              Community-controlled organization serving Palm Island (Manbarra & Bwgcolman Country).
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-base font-semibold mb-5 tracking-tight">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/stories" className="animated-underline text-sm text-stone-400 hover:text-white transition-colors duration-300">
                  Stories
                </Link>
              </li>
              <li>
                <Link href="/about" className="animated-underline text-sm text-stone-400 hover:text-white transition-colors duration-300">
                  About
                </Link>
              </li>
              <li>
                <Link href="/impact" className="animated-underline text-sm text-stone-400 hover:text-white transition-colors duration-300">
                  Impact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white text-base font-semibold mb-5 tracking-tight">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/annual-reports" className="animated-underline text-sm text-stone-400 hover:text-white transition-colors duration-300">
                  Annual Reports
                </Link>
              </li>
              <li>
                <Link href="/chat" className="animated-underline text-sm text-stone-400 hover:text-white transition-colors duration-300">
                  Ask AI
                </Link>
              </li>
              <li>
                <Link href="/chat" className="animated-underline text-sm text-stone-400 hover:text-white transition-colors duration-300">
                  Ask AI
                </Link>
              </li>
              <li>
                <Link href="/road-to-20-years" className="animated-underline text-sm text-stone-400 hover:text-white transition-colors duration-300">
                  Road to 20 Years
                </Link>
              </li>
              <li>
                <Link href="/annual-report/live" className="animated-underline text-sm text-stone-400 hover:text-white transition-colors duration-300">
                  Live Annual Report
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="text-white text-base font-semibold mb-5 tracking-tight">
              Get Involved
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/share-voice" className="animated-underline text-sm text-stone-400 hover:text-white transition-colors duration-300">
                  Share Your Voice
                </Link>
              </li>
              <li>
                <Link href="/community" className="animated-underline text-sm text-stone-400 hover:text-white transition-colors duration-300">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/subscribe" className="animated-underline text-sm text-stone-400 hover:text-white transition-colors duration-300">
                  Subscribe
                </Link>
              </li>
              <li>
                <Link href="/about" className="animated-underline text-sm text-stone-400 hover:text-white transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white text-base font-semibold mb-5 tracking-tight">
              Connect
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@picc.com.au"
                  className="animated-underline text-sm text-stone-400 hover:text-white transition-colors duration-300 inline-flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </li>
            </ul>
            <div className="flex space-x-4 mt-5">
              <a
                href="https://www.facebook.com/PalmIslandCommunityCompany/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-500 hover:text-white transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-stone-800 text-center">
          <p className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} Palm Island Community Company. All rights reserved.
          </p>
          <p className="text-xs text-stone-600 mt-2 tracking-wide">
            Manbarra & Bwgcolman Country
          </p>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
