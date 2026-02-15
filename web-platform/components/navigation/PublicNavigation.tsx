'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Mic, Search, ChevronDown } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { PICCLogo } from '@/components/ui/PICCLogo';

export function PublicNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [knowledgeDropdownOpen, setKnowledgeDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const navLinks = [
    { label: 'Stories', href: '/stories' },
    { label: 'Innovation', href: '/innovation' },
    { label: 'Services', href: '/services' },
    { label: 'About PICC', href: '/about' },
    {
      label: 'Knowledge',
      href: '/annual-reports',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Live Annual Report 2024-25', href: '/annual-report/live', featured: true },
        { label: '20-Year Vision', href: '/20-years', featured: true },
        { label: 'Innovation Projects', href: '/innovation', featured: true },
        { label: 'Thematic Reports', href: '/thematic-reports', featured: true },
        { label: 'Service Map', href: '/services' },
        { label: 'Annual Reports Timeline', href: '/annual-reports' },
        { label: 'Knowledge Base', href: '/wiki/stories' },
        { label: 'Community Stories', href: '/stories' },
      ]
    },
    { label: 'Our Impact', href: '/impact' },
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
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Brand */}
          <PICCLogo variant="horizontal" size="sm" href="/" showSubtitle theme="light" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              link.hasDropdown ? (
                <div key={link.href} className="relative">
                  <button
                    onClick={() => setKnowledgeDropdownOpen(!knowledgeDropdownOpen)}
                    onMouseEnter={() => setKnowledgeDropdownOpen(true)}
                    onMouseLeave={() => setKnowledgeDropdownOpen(false)}
                    className={`
                      animated-underline px-4 py-2 text-sm font-medium transition-colors duration-300 ease-elegant inline-flex items-center gap-1
                      ${isActive(link.href)
                        ? 'text-gray-900'
                        : 'text-gray-500 hover:text-gray-900'
                      }
                    `}
                  >
                    {link.label}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ease-elegant ${knowledgeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {knowledgeDropdownOpen && (
                    <div
                      className="absolute left-0 mt-2 w-60 bg-white/95 backdrop-blur-lg border border-gray-100 rounded-2xl shadow-xl py-2 animate-fade-in"
                      onMouseEnter={() => setKnowledgeDropdownOpen(true)}
                      onMouseLeave={() => setKnowledgeDropdownOpen(false)}
                    >
                      {link.dropdownItems?.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            block px-5 py-2.5 text-sm transition-colors duration-200
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
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    animated-underline px-4 py-2 text-sm font-medium transition-colors duration-300 ease-elegant
                    ${isActive(link.href)
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                    }
                  `}
                >
                  {link.label}
                </Link>
              )
            ))}

            {/* Ask Palm AI Button */}
            <Link
              href="/chat"
              className="animated-underline ml-2 inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors duration-300 ease-elegant"
            >
              <Search className="h-4 w-4" />
              <span>Ask</span>
            </Link>

            {/* Share Your Voice CTA Button */}
            <Link
              href="/share-voice"
              className="ml-3 inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 hover:scale-[0.97] active:scale-95 transition-all duration-300 ease-elegant focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2"
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
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100/80 transition-all duration-200"
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

      {/* Mobile Menu — Full-screen overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 z-40 bg-white/98 backdrop-blur-lg animate-fade-in">
          <div className="px-6 pt-8 pb-6 space-y-1 max-w-lg mx-auto">
            {navLinks.map((link, index) => (
              link.hasDropdown ? (
                <div
                  key={link.href}
                  className="space-y-1"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="px-2 py-3 text-lg font-semibold text-gray-900 tracking-tight animate-fade-in-up"
                    style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
                  >
                    {link.label}
                  </div>
                  {link.dropdownItems?.map((item, itemIndex) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block pl-4 pr-3 py-2.5 text-base text-gray-500 hover:text-gray-900 transition-colors duration-200 animate-fade-in-up"
                      style={{ animationDelay: `${(index * 60) + (itemIndex * 40) + 40}ms`, animationFillMode: 'both' }}
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
                    block px-2 py-3 text-lg font-medium transition-colors duration-200 animate-fade-in-up
                    ${isActive(link.href)
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                    }
                  `}
                  style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
                >
                  {link.label}
                </Link>
              )
            ))}

            {/* Mobile Ask */}
            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-2 py-3 text-lg text-gray-500 hover:text-gray-900 font-medium transition-colors duration-200 animate-fade-in-up"
              style={{ animationDelay: '320ms', animationFillMode: 'both' }}
            >
              <Search className="h-5 w-5" />
              <span>Ask</span>
            </Link>

            {/* Mobile Share Your Voice CTA */}
            <div className="pt-6 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              <Link
                href="/share-voice"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white text-base font-semibold rounded-2xl hover:bg-gray-800 transition-all duration-300 ease-elegant"
              >
                <Mic className="h-5 w-5" />
                <span>Share Your Voice</span>
              </Link>
            </div>

            {/* Mobile User Menu */}
            <div className="pt-6 border-t border-gray-100 mt-6 animate-fade-in-up" style={{ animationDelay: '460ms', animationFillMode: 'both' }}>
              <UserMenu />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default PublicNavigation;
