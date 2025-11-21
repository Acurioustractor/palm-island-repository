'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Mic } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';

export function PublicNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const navLinks = [
    { label: 'Stories', href: '/stories' },
    { label: 'About PICC', href: '/about' },
    { label: 'Get Involved', href: '/community' },
    { label: 'Our Impact', href: '/impact' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                Palm Island Community
              </span>
              <span className="text-xs text-gray-600 italic">
                Manbarra & Bwgcolman Country
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}

            {/* CTA Button */}
            <Link
              href="/share-voice"
              className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold rounded-md shadow-sm hover:shadow-md transition-all"
            >
              <Mic className="h-4 w-4" />
              <span>Share Your Voice</span>
            </Link>

            {/* User Menu */}
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block px-3 py-2 rounded-md text-base font-medium transition-all
                  ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile CTA */}
            <Link
              href="/share-voice"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 mt-4 px-3 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-md"
            >
              <Mic className="h-4 w-4" />
              <span>Share Your Voice</span>
            </Link>

            {/* Mobile User Menu */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <UserMenu />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default PublicNavigation;
