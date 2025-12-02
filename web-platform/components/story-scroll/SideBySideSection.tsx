'use client';

import { ReactNode } from 'react';
import { ScrollReveal } from './ScrollReveal';
import Image from 'next/image';

interface SideBySideSectionProps {
  title?: string;
  content: ReactNode;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  mediaPosition?: 'left' | 'right';
  backgroundColor?: string;
  mediaAlt?: string;
}

export function SideBySideSection({
  title,
  content,
  mediaUrl,
  mediaType = 'image',
  mediaPosition = 'right',
  backgroundColor = 'bg-white',
  mediaAlt = 'Story media',
}: SideBySideSectionProps) {
  const MediaContent = () => (
    <div className="w-full h-full min-h-[400px] relative">
      {mediaType === 'image' ? (
        <div className="relative w-full h-full">
          <Image
            src={mediaUrl}
            alt={mediaAlt}
            fill
            className="object-cover rounded-lg shadow-2xl"
          />
        </div>
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-lg shadow-2xl"
        >
          <source src={mediaUrl} type="video/mp4" />
        </video>
      )}
    </div>
  );

  const TextContent = () => (
    <div className="flex flex-col justify-center h-full">
      {title && (
        <ScrollReveal direction="up">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h2>
        </ScrollReveal>
      )}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="prose prose-lg max-w-none text-gray-700">
          {content}
        </div>
      </ScrollReveal>
    </div>
  );

  return (
    <section className={`${backgroundColor} py-20`}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {mediaPosition === 'left' ? (
            <>
              <ScrollReveal direction="left">
                <MediaContent />
              </ScrollReveal>
              <TextContent />
            </>
          ) : (
            <>
              <TextContent />
              <ScrollReveal direction="right">
                <MediaContent />
              </ScrollReveal>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
