'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

interface FullBleedImageProps {
  imageUrl: string;
  alt: string;
  caption?: string;
  height?: 'short' | 'medium' | 'tall';
  parallax?: boolean;
}

export function FullBleedImage({
  imageUrl,
  alt,
  caption,
  height = 'medium',
  parallax = true,
}: FullBleedImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], parallax ? ['0%', '20%'] : ['0%', '0%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);

  const heightClasses = {
    short: 'h-[50vh]',
    medium: 'h-[70vh]',
    tall: 'h-screen',
  };

  return (
    <div ref={ref} className={`relative ${heightClasses[height]} overflow-hidden`}>
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
      </motion.div>

      {caption && (
        <motion.div
          style={{ opacity }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8"
        >
          <div className="max-w-7xl mx-auto">
            <p className="text-white text-lg md:text-xl font-medium">{caption}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
