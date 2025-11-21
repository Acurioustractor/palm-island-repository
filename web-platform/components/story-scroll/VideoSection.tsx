'use client';

import { ScrollReveal } from './ScrollReveal';

interface VideoSectionProps {
  videoUrl: string;
  title?: string;
  caption?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | '21/9';
  autoplay?: boolean;
  controls?: boolean;
  backgroundColor?: string;
}

export function VideoSection({
  videoUrl,
  title,
  caption,
  aspectRatio = '16/9',
  autoplay = false,
  controls = true,
  backgroundColor = 'bg-gray-900',
}: VideoSectionProps) {
  const aspectClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '21/9': 'aspect-[21/9]',
  };

  return (
    <section className={`${backgroundColor} py-20`}>
      <div className="max-w-6xl mx-auto px-8">
        {title && (
          <ScrollReveal direction="up">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
              {title}
            </h2>
          </ScrollReveal>
        )}

        <ScrollReveal direction="up" delay={0.2}>
          <div className={`w-full ${aspectClasses[aspectRatio]} rounded-xl overflow-hidden shadow-2xl`}>
            <video
              className="w-full h-full object-cover"
              controls={controls}
              autoPlay={autoplay}
              muted={autoplay}
              playsInline
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </ScrollReveal>

        {caption && (
          <ScrollReveal direction="up" delay={0.4}>
            <p className="text-gray-400 text-center mt-6 text-lg max-w-3xl mx-auto">
              {caption}
            </p>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
