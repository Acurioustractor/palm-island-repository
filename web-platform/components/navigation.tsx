'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, BookOpen, Users, Server, FileText, Info,
  PlusCircle, BarChart3
} from 'lucide-react';

const navigationItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/stories', label: 'Stories', icon: BookOpen },
  { href: '/storytellers', label: 'Storytellers', icon: Users },
  { href: '/dashboard', label: 'Dashboard', icon: Server },
  { href: '/reports/annual', label: 'Annual Report', icon: FileText },
  { href: '/about', label: 'About', icon: Info },
  { href: '/stories/submit', label: 'Share Story', icon: PlusCircle, highlight: true },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="h-full bg-white shadow-lg border-r border-gray-200 flex flex-col sticky top-0">
      <div className="p-6 flex-1 overflow-y-auto">
        <Link href="/" className="block mb-8">
          <h2 className="text-xl font-bold text-blue-900">Palm Island</h2>
          <p className="text-sm text-gray-600">Community Repository</p>
        </Link>

        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : item.highlight
                        ? 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                        : 'text-gray-700 hover:bg-blue-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer info */}
      <div className="p-6 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          🌊 Our Stories<br />
          🔥 Our Sovereignty<br />
          📚 Our Future
        </p>
      </div>
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-blue-900">Palm Island</h2>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <ul className="flex gap-2 px-4 pb-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm
                    ${isActive
                      ? 'bg-blue-600 text-white'
                      : item.highlight
                        ? 'bg-purple-100 text-purple-900'
                        : 'text-gray-700 bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
