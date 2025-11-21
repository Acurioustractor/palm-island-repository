'use client';

import { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxSectionProps {
  backgroundImage: string;
  children?: ReactNode;
  speed?: number; // 0.5 = slow, 1 = normal, 2 = fast
  height?: string;
  overlay?: boolean;
  overlayColor?: string;
}

export function ParallaxSection({
  backgroundImage,
  children,
  speed = 0.5,
  height = 'h-[70vh]',
  overlay = true,
  overlayColor = 'bg-black/40',
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 50}%`]);

  return (
    <div ref={ref} className={`relative ${height} overflow-hidden`}>
      {/* Parallax Background */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      </motion.div>

      {/* Overlay */}
      {overlay && <div className={`absolute inset-0 ${overlayColor}`} />}

      {/* Content */}
      {children && (
        <div className="relative z-10 h-full flex items-center justify-center px-8">
          {children}
        </div>
      )}
    </div>
  );
}
