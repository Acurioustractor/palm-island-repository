'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Mic, Search, ChevronDown } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { PICCLogo } from '@/components/ui/PICCLogo';

export function PublicNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const openDropdown = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };

  const closeDropdown = () => {
    // Small delay so the mouse can travel from button to dropdown
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 150);
  };

  const navLinks = [
    { label: 'Stories', href: '/stories' },
    { label: 'Services', href: '/services' },
    { label: 'Elders', href: '/elders' },
    { label: 'Explore', href: '/explore' },
    { label: 'Impact', href: '/impact' },
    { label: 'About', href: '/about' },
    {
      label: 'More',
      href: '/annual-report/live',
      hasDropdown: true,
      dropdownItems: [
        { label: 'The Sovereignty of Care 2027', href: '/20-years/strategy', featured: true },
        { label: 'Empathy Ledger', href: '/empathy-ledger', featured: true },
        { label: 'Annual Report 2024-25', href: '/annual-report/live', featured: true },
        { label: '20-Year Vision', href: '/20-years' },
        { label: 'Innovation', href: '/innovation' },
        { label: 'Thematic Reports', href: '/thematic-reports' },
        { label: 'Ask AI', href: '/chat' },
      ]
    },
  ];

  return (
    <nav
      className={`
        sticky top-0 z-50 transition-all duration-500 ease-elegant
        ${scrolled
          ? 'frosted-glass shadow-sm'
          : 'bg-white/90 backdrop-blur-md'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo/Brand */}
          <PICCLogo variant="horizontal" size="sm" href="/" showSubtitle theme="light" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              link.hasDropdown ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={openDropdown}
                  onMouseLeave={closeDropdown}
                >
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`
                      px-3 py-2 text-[13px] font-medium transition-colors duration-200 inline-flex items-center gap-1 rounded-lg
                      ${isActive(link.href)
                        ? 'text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    {link.label}
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown — no gap, attached to button */}
                  {dropdownOpen && (
                    <div className="absolute left-0 top-full pt-1">
                      <div className="w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5">
                        {link.dropdownItems?.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setDropdownOpen(false)}
                            className={`
                              block px-4 py-2 text-sm transition-colors duration-150
                              ${item.featured
                                ? 'text-gray-900 font-medium hover:bg-warm-50'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                              }
                            `}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-3 py-2 text-[13px] font-medium transition-colors duration-200 rounded-lg
                    ${isActive(link.href)
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  {link.label}
                </Link>
              )
            ))}

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 mx-1.5" />

            {/* Ask */}
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200 rounded-lg"
            >
              <Search className="h-3.5 w-3.5" />
              Ask
            </Link>

            {/* Share Your Voice CTA */}
            <Link
              href="/share-voice"
              className="ml-2 inline-flex items-center gap-1.5 px-5 py-2 bg-gray-900 text-white text-[13px] font-semibold rounded-full hover:bg-gray-800 active:scale-95 transition-all duration-200"
            >
              <Mic className="h-3.5 w-3.5" />
              Share Your Voice
            </Link>

            {/* User Menu */}
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-white animate-fade-in overflow-auto">
          <div className="px-5 pt-4 pb-8 space-y-0.5">
            {navLinks.map((link) => (
              link.hasDropdown ? (
                <div key={link.href} className="py-1">
                  <div className="px-3 py-2.5 text-base font-semibold text-gray-900">
                    {link.label}
                  </div>
                  <div className="space-y-0.5 pl-3">
                    {link.dropdownItems?.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3 py-2 text-[15px] rounded-lg transition-colors ${
                          item.featured
                            ? 'text-gray-900 font-medium hover:bg-warm-50'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 text-base font-medium rounded-lg transition-colors ${
                    isActive(link.href) ? 'text-gray-900 bg-gray-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}

            {/* Mobile Ask */}
            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-base text-gray-500 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Search className="h-4.5 w-4.5" />
              Ask Palm Island
            </Link>

            {/* Mobile CTA */}
            <div className="pt-4">
              <Link
                href="/share-voice"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white text-base font-semibold rounded-full hover:bg-gray-800 transition-colors"
              >
                <Mic className="h-5 w-5" />
                Share Your Voice
              </Link>
            </div>

            {/* Mobile User Menu */}
            <div className="pt-4 border-t border-gray-100 mt-4">
              <UserMenu />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default PublicNavigation;
