'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      {/* Home Link */}
      <Link
        href="/"
        className="flex items-center gap-1 text-gray-600 hover:text-amber-700 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only">Home</span>
      </Link>

      {/* Breadcrumb Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;

        return (
          <React.Fragment key={item.href}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="flex items-center gap-1 text-gray-900 font-medium">
                {Icon && <Icon className="h-4 w-4" />}
                <span className="line-clamp-1">{item.label}</span>
              </span>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-1 text-gray-600 hover:text-amber-700 transition-colors"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="line-clamp-1">{item.label}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
