'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Mic, Bot, ChevronDown } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';

export function PublicNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [knowledgeDropdownOpen, setKnowledgeDropdownOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const navLinks = [
    { label: 'Stories', href: '/stories' },
    { label: 'About PICC', href: '/about' },
    {
      label: 'Knowledge',
      href: '/annual-reports',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Live Annual Report 2024-25', href: '/annual-report/live', featured: true },
        { label: 'Annual Reports Timeline', href: '/annual-reports' },
        { label: 'Knowledge Base', href: '/wiki/stories' },
        { label: 'Community Stories', href: '/stories' },
      ]
    },
    { label: 'Our Impact', href: '/impact' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
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
              link.hasDropdown ? (
                <div key={link.href} className="relative">
                  <button
                    onClick={() => setKnowledgeDropdownOpen(!knowledgeDropdownOpen)}
                    onMouseEnter={() => setKnowledgeDropdownOpen(true)}
                    onMouseLeave={() => setKnowledgeDropdownOpen(false)}
                    className={`
                      px-4 py-2 rounded-md text-sm font-medium transition-all inline-flex items-center gap-1
                      ${
                        isActive(link.href)
                          ? 'text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    {link.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {knowledgeDropdownOpen && (
                    <div
                      className="absolute left-0 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2"
                      onMouseEnter={() => setKnowledgeDropdownOpen(true)}
                      onMouseLeave={() => setKnowledgeDropdownOpen(false)}
                    >
                      {link.dropdownItems?.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${
                      isActive(link.href)
                        ? 'text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  {link.label}
                </Link>
              )
            ))}

            {/* Ask AI Button */}
            <Link
              href="/chat"
              className="ml-2 inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-md transition-all"
            >
              <Bot className="h-4 w-4" />
              <span>Ask AI</span>
            </Link>

            {/* Share Your Voice CTA Button */}
            <Link
              href="/share-voice"
              className="ml-2 inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-gray-900/20"
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
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-50 transition-all"
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
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              link.hasDropdown ? (
                <div key={link.href} className="space-y-1">
                  <div className="px-3 py-2 text-sm font-semibold text-gray-900">
                    {link.label}
                  </div>
                  {link.dropdownItems?.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block pl-6 pr-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-3 py-2 rounded-md text-base font-medium transition-all
                    ${
                      isActive(link.href)
                        ? 'text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  {link.label}
                </Link>
              )
            ))}

            {/* Mobile Ask AI */}
            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-md transition-all"
            >
              <Bot className="h-4 w-4" />
              <span>Ask AI</span>
            </Link>

            {/* Mobile Share Your Voice CTA */}
            <Link
              href="/share-voice"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 mt-4 px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all"
            >
              <Mic className="h-4 w-4" />
              <span>Share Your Voice</span>
            </Link>

            {/* Mobile User Menu */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <UserMenu />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default PublicNavigation;
