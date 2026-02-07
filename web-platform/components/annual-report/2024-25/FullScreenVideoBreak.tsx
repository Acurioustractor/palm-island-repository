'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface FullScreenVideoBreakProps {
  videoUrl?: string;
  poster?: string;
  caption: string;
  subcaption?: string;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}&controls=0&showinfo=0&rel=0&modestbranding=1`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1&background=1`;
  }
  return null;
}

export function FullScreenVideoBreak({
  videoUrl,
  poster,
  caption,
  subcaption,
}: FullScreenVideoBreakProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [1.08, 1, 1, 1.08]);

  const hasVideo = videoUrl && videoUrl.trim().length > 0;
  const embedUrl = hasVideo && !isDirectVideo(videoUrl) ? getEmbedUrl(videoUrl) : null;
  const isDirectFile = hasVideo && isDirectVideo(videoUrl);

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="relative h-screen overflow-hidden"
    >
      <motion.div style={{ scale }} className="absolute inset-0">
        {isDirectFile ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={poster || undefined}
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} />
          </video>
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            title={caption}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        )}
      </motion.div>

      {/* Overlay — lighter when video present for visibility */}
      <div className={`absolute inset-0 ${hasVideo ? 'bg-black/30' : 'bg-black/10'}`} />

      {/* Caption */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center px-8"
        >
          <h3
            className="text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.05]"
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            {caption}
          </h3>
          {subcaption && (
            <p className="mt-4 text-sm md:text-base text-white/50 tracking-[0.2em] uppercase font-light">
              {subcaption}
            </p>
          )}
        </motion.div>
      </div>

      {/* Top/bottom fade edges */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
    </motion.div>
  );
}
