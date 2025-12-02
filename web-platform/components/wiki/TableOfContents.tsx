'use client';

import React, { useState, useEffect } from 'react';
import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content?: string;
  sticky?: boolean;
  className?: string;
}

export function TableOfContents({ content, sticky = true, className = '' }: TableOfContentsProps) {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from content or DOM
    const headingElements = document.querySelectorAll('h2, h3, h4');
    const tocItems: TOCItem[] = [];

    headingElements.forEach((heading) => {
      const id = heading.id || heading.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
      const level = parseInt(heading.tagName[1]);
      const text = heading.textContent || '';

      if (!heading.id && id) {
        heading.id = id;
      }

      tocItems.push({ id, text, level });
    });

    setItems(tocItems);

    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headingElements.forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      headingElements.forEach((heading) => {
        observer.unobserve(heading);
      });
    };
  }, [content]);

  if (items.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav
      className={`
        bg-white rounded-lg border border-gray-200 p-4
        ${sticky ? 'sticky top-20' : ''}
        ${className}
      `}
      aria-label="Table of contents"
    >
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
        <List className="h-5 w-5 text-gray-700" />
        <h2 className="font-semibold text-gray-900">Contents</h2>
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const indent = (item.level - 2) * 12; // h2 = 0, h3 = 12px, h4 = 24px

          return (
            <li key={item.id} style={{ paddingLeft: `${indent}px` }}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`
                  text-left w-full text-sm transition-colors hover:text-amber-700
                  ${isActive ? 'text-amber-700 font-medium' : 'text-gray-600'}
                `}
              >
                {item.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default TableOfContents;
