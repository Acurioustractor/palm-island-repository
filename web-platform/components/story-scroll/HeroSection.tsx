'use client';

import { ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  height?: 'screen' | 'tall' | 'medium';
  overlay?: 'dark' | 'light' | 'gradient' | 'none';
  textPosition?: 'center' | 'bottom' | 'top';
  children?: ReactNode;
}

export function HeroSection({
  title,
  subtitle,
  backgroundImage,
  backgroundVideo,
  height = 'screen',
  overlay = 'dark',
  textPosition = 'center',
  children,
}: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  const heightClasses = {
    screen: 'h-screen',
    tall: 'h-[80vh]',
    medium: 'h-[60vh]',
  };

  const overlayClasses = {
    dark: 'bg-black/50',
    light: 'bg-white/30',
    gradient: 'bg-gradient-to-b from-black/60 via-black/30 to-transparent',
    none: '',
  };

  const positionClasses = {
    center: 'items-center justify-center',
    bottom: 'items-end justify-center pb-16',
    top: 'items-start justify-center pt-32',
  };

  return (
    <div ref={ref} className={`relative ${heightClasses[height]} overflow-hidden`}>
      {/* Background Media */}
      <motion.div
        style={{ scale }}
        className="absolute inset-0 w-full h-full"
      >
        {backgroundVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : backgroundImage ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600" />
        )}
      </motion.div>

      {/* Overlay */}
      {overlay !== 'none' && (
        <div className={`absolute inset-0 ${overlayClasses[overlay]}`} />
      )}

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className={`relative z-10 h-full flex flex-col ${positionClasses[textPosition]} px-8 text-center`}
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 max-w-5xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl text-white/90 max-w-3xl"
          >
            {subtitle}
          </motion.p>
        )}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            {children}
          </motion.div>
        )}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}
