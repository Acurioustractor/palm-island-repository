'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Facebook, Instagram, Linkedin } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4">
              Palm Island Community Company
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              PICC is a community-controlled organization providing essential services
              and support to the people of Palm Island (Manbarra & Bwgcolman Country).
            </p>
            <p className="text-sm text-gray-400">
              Community-controlled storytelling, impact measurement, and data sovereignty.
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
                <Link href="/storytellers" className="text-sm hover:text-white transition-colors">
                  Storytellers
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  About PICC
                </Link>
              </li>
              <li>
                <Link href="/impact" className="text-sm hover:text-white transition-colors">
                  Our Impact
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
                  Share Your Voice
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm hover:text-white transition-colors">
                  Community Hub
                </Link>
              </li>
              <li>
                <Link href="/subscribe" className="text-sm hover:text-white transition-colors">
                  Subscribe to Updates
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Palm Island Community Company. All rights reserved.
          </p>

          {/* Social Links (placeholder - add real links when available) */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="mailto:info@picc.com.au" className="text-gray-500 hover:text-white transition-colors" aria-label="Email">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
