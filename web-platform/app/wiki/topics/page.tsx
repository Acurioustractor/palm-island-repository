'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Construction } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

export default function TopicsPage() {
  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Topics', href: '/wiki/topics' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="text-center py-16 bg-white rounded-xl border border-amber-200 shadow-sm">
        <Construction className="h-24 w-24 text-amber-600 mx-auto mb-6" />

        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Globe className="h-10 w-10 text-amber-600" />
          Topics
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Browse stories by topic and theme
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-2xl mx-auto mb-8">
          <p className="text-gray-700 mb-4">
            This page is under construction. Topics will allow you to explore stories
            organized by themes like:
          </p>
          <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
            <li>• Cultural practices and traditions</li>
            <li>• Community events and celebrations</li>
            <li>• Health and wellbeing initiatives</li>
            <li>• Education and learning</li>
            <li>• Environmental and land management</li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-gray-600">In the meantime, you can explore:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/wiki/categories"
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
            >
              Browse by Category
            </Link>
            <Link
              href="/wiki/people"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Browse by People
            </Link>
            <Link
              href="/stories"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              All Stories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
