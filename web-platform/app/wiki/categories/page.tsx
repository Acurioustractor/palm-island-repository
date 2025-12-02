'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Tag, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  story_count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('story_count', { ascending: false });

      if (!error && data) {
        setCategories(data);
      }

      setLoading(false);
    }

    fetchCategories();
  }, []);

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki', icon: BookOpen },
    { label: 'Categories', href: '/wiki/categories' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Tag className="h-10 w-10 text-blue-600" />
          Story Categories
        </h1>
        <p className="text-xl text-gray-600">
          Explore stories organized by topic and theme
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/wiki/categories/${category.slug}`}
            className="group bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 p-6 transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon || '📚'}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {category.story_count}
                </div>
                <div className="text-xs text-gray-600">stories</div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {category.name}
            </h3>

            {category.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {category.description}
              </p>
            )}

            <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
              <span>Explore</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* No categories placeholder */}
      {categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No categories yet
          </h3>
          <p className="text-gray-600">
            Categories will appear here as stories are added
          </p>
        </div>
      )}
    </div>
  );
}
