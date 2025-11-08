'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Users, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      href: '/stories',
      label: 'Stories',
      icon: BookOpen,
    },
    {
      href: '/storytellers',
      label: 'People',
      icon: Users,
    },
    {
      href: '/about',
      label: 'About',
      icon: User,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-40 safe-area-bottom"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
                          (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`
                flex flex-col items-center justify-center gap-1
                transition-all duration-300 relative
                ${isActive
                  ? 'text-palm-600'
                  : 'text-gray-500 hover:text-palm-500'
                }
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-palm-600 rounded-b-full" />
              )}

              {/* Icon with scale animation */}
              <Icon
                className={`
                  w-6 h-6 transition-transform duration-300
                  ${isActive ? 'scale-110' : 'scale-100'}
                `}
                strokeWidth={isActive ? 2.5 : 2}
              />

              {/* Label */}
              <span
                className={`
                  text-xs font-medium
                  ${isActive ? 'font-bold' : 'font-normal'}
                `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
