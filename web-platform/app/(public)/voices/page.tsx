'use client';

import VoiceWall from '@/components/community/VoiceWall';
import { BespokeIcon } from '@/components/ui/BespokeIcon';

export default function VoicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream">
      {/* Hero */}
      <div className="bg-gradient-to-r from-picc-earth to-picc-earth-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex items-center gap-3 mb-3">
            <BespokeIcon name="quote" size={40} />
            <h1 className="text-4xl font-bold font-serif">Community Voices</h1>
          </div>
          <p className="text-lg text-white/80 max-w-2xl">
            Words of wisdom, reflection, and pride from Palm Island community members
            and Elders — the voices that guide our journey.
          </p>
        </div>
      </div>

      {/* Voice Wall */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
        <VoiceWall />
      </div>
    </div>
  );
}
