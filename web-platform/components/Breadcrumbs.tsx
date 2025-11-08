'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-6 ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {/* Home link always first */}
        <li>
          <Link
            href="/"
            prefetch={true}
            className="flex items-center text-palm-600 hover:text-palm-700 transition-colors group"
          >
            <Home className="w-4 h-4 mr-1 transition-transform group-hover:scale-110" />
            <span className="font-medium">Community</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  prefetch={true}
                  className="flex items-center text-palm-600 hover:text-palm-700 transition-colors group"
                >
                  {Icon && <Icon className="w-4 h-4 mr-1 transition-transform group-hover:scale-110" />}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ) : (
                <span
                  className="flex items-center text-gray-900 font-medium"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {Icon && <Icon className="w-4 h-4 mr-1" />}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
