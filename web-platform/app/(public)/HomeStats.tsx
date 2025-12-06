'use client';

import { useEffect, useState } from 'react';

interface ContentStats {
  images: number;
  knowledgeEntries: number;
  stories: number;
  annualReports: number;
}

export default function HomeStats() {
  const [stats, setStats] = useState<ContentStats>({
    images: 264,
    knowledgeEntries: 86,
    stories: 31,
    annualReports: 15
  });

  useEffect(() => {
    // Fetch latest stats from API
    fetch('/api/content/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats({
            images: data.images,
            knowledgeEntries: data.knowledgeEntries,
            stories: data.stories,
            annualReports: data.annualReports
          });
        }
      })
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

  return (
    <>
      {/* Impact Numbers in 15 Years Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center bg-white border border-gray-100 rounded-2xl p-6">
          <div className="text-4xl font-bold text-gray-900">{stats.images}</div>
          <div className="text-sm text-gray-500 mt-2 uppercase tracking-wide">Images Catalogued</div>
        </div>
        <div className="text-center bg-white border border-gray-100 rounded-2xl p-6">
          <div className="text-4xl font-bold text-gray-900">{stats.knowledgeEntries}</div>
          <div className="text-sm text-gray-500 mt-2 uppercase tracking-wide">Knowledge Entries</div>
        </div>
        <div className="text-center bg-white border border-gray-100 rounded-2xl p-6">
          <div className="text-4xl font-bold text-gray-900">{stats.stories}+</div>
          <div className="text-sm text-gray-500 mt-2 uppercase tracking-wide">Community Stories</div>
        </div>
        <div className="text-center bg-white border border-gray-100 rounded-2xl p-6">
          <div className="text-4xl font-bold text-gray-900">{stats.annualReports}</div>
          <div className="text-sm text-gray-500 mt-2 uppercase tracking-wide">Years Documented</div>
        </div>
      </div>
    </>
  );
}
