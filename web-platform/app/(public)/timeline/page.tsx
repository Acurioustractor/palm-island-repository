'use client';

import TimelineExplorer from '@/components/timeline/TimelineExplorer';
import { BespokeIcon } from '@/components/ui/BespokeIcon';

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream">
      {/* Hero */}
      <div className="bg-gradient-to-r from-picc-earth to-picc-earth-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="flex items-center gap-3 mb-3">
            <BespokeIcon name="timeline" size={40} />
            <h1 className="text-4xl font-bold font-serif">Our Timeline</h1>
          </div>
          <p className="text-lg text-white/80 max-w-2xl">
            Explore the stories, milestones, and moments that have shaped Palm Island
            Community Company over the years.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12">
        <TimelineExplorer />
      </div>
    </div>
  );
}
