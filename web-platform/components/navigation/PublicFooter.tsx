'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Facebook, Instagram, Linkedin } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* About PICC */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              About PICC
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Community-controlled organization serving Palm Island (Manbarra & Bwgcolman Country).
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/stories" className="text-sm hover:text-white transition-colors">
                  Stories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/impact" className="text-sm hover:text-white transition-colors">
                  Impact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources (NEW) */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/annual-reports" className="text-sm hover:text-white transition-colors">
                  Annual Reports
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-sm hover:text-white transition-colors">
                  Ask AI
                </Link>
              </li>
              <li>
                <Link href="/wiki/stories" className="text-sm hover:text-white transition-colors">
                  Knowledge Base
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Get Involved
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/share-voice" className="text-sm hover:text-white transition-colors">
                  Share Voice
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm hover:text-white transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/subscribe" className="text-sm hover:text-white transition-colors">
                  Subscribe
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:info@picc.com.au"
                  className="text-sm hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </li>
            </ul>
            <div className="flex space-x-3 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Palm Island Community Company. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Manbarra & Bwgcolman Country
          </p>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
