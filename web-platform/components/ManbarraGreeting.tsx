'use client';

import { useEffect, useState } from 'react';

interface ManbarraGreetingProps {
  phrase?: 'welcome' | 'thankyou' | 'respect' | 'story' | 'community';
  showTranslation?: boolean;
  className?: string;
}

const phrases = {
  welcome: {
    manbarra: 'Ngayu minya',
    english: 'Welcome',
    context: 'Traditional greeting'
  },
  thankyou: {
    manbarra: 'Yuwi',
    english: 'Thank you',
    context: 'Expression of gratitude'
  },
  respect: {
    manbarra: 'Wunggaji',
    english: 'Respect',
    context: 'Deep respect for Elders and Country'
  },
  story: {
    manbarra: 'Bulmba',
    english: 'Story',
    context: 'Traditional storytelling'
  },
  community: {
    manbarra: 'Yunbenun',
    english: 'Community / Our people',
    context: 'The collective strength of community'
  }
};

export default function ManbarraGreeting({
  phrase = 'welcome',
  showTranslation = true,
  className = ''
}: ManbarraGreetingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const selectedPhrase = phrases[phrase];

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div
      className={`manbarra-greeting transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${className}`}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Manbarra phrase with decorative elements */}
        <div className="relative inline-block">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-palm-400 opacity-50" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-palm-400 opacity-50" />

          <span className="text-palm-800 font-bold italic tracking-wide">
            {selectedPhrase.manbarra}
          </span>
        </div>

        {/* English translation */}
        {showTranslation && (
          <span className="text-sm text-gray-600 font-medium">
            {selectedPhrase.english}
          </span>
        )}
      </div>

      {/* Hover tooltip with context */}
      <div className="group relative inline-block">
        <div className="mt-2 text-xs text-palm-600 cursor-help flex items-center gap-1 justify-center">
          <span>ⓘ</span>
          <span className="underline decoration-dotted">Manbarra Language</span>
        </div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
            {selectedPhrase.context}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
