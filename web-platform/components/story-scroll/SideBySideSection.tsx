'use client';

import { ReactNode } from 'react';
import { ScrollReveal } from './ScrollReveal';
import { getEmbedUrl, guessVideoMimeType, isDirectVideoFile } from './videoEmbed';

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
  const videoMimeType = mediaType === 'video' ? guessVideoMimeType(mediaUrl) : undefined

  const MediaContent = () => (
    <div className="w-full h-full min-h-[400px] relative">
      {mediaType === 'image' ? (
        mediaUrl ? (
          <img
            src={mediaUrl}
            alt={mediaAlt}
            className="w-full h-full object-cover rounded-lg shadow-2xl"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
            Image unavailable
          </div>
        )
      ) : (
        mediaUrl ? (
          isDirectVideoFile(mediaUrl) ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-lg shadow-2xl"
            >
              <source src={mediaUrl} {...(videoMimeType ? { type: videoMimeType } : {})} />
            </video>
          ) : (
            <iframe
              src={getEmbedUrl(mediaUrl, { autoplay: false })}
              title={title || 'Embedded video'}
              className="w-full h-full min-h-[400px] rounded-lg shadow-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )
        ) : (
          <div className="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
            Video unavailable
          </div>
        )
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
