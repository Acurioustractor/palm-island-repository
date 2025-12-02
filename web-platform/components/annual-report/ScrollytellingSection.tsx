'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

export interface DataPoint {
  label: string;
  value: number;
  unit?: string;
  context: string;
  color: string;
}

interface ScrollytellingProps {
  title: string;
  dataPoints: DataPoint[];
  narrative: string[];
  finalMessage?: string;
  backgroundImage?: string;
}

export function ScrollytellingSection({
  title,
  dataPoints,
  narrative,
  finalMessage,
  backgroundImage,
}: ScrollytellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smooth out the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${(dataPoints.length + 1) * 100}vh` }}
    >
      {/* Background */}
      {backgroundImage && (
        <div
          className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Sticky visualization container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Title overlay at start */}
        <TitleOverlay progress={smoothProgress} title={title} />

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <DataReveal
            key={point.label}
            point={point}
            narrative={narrative[index]}
            progress={smoothProgress}
            index={index}
            total={dataPoints.length}
          />
        ))}

        {/* Final message */}
        {finalMessage && (
          <FinalMessage
            message={finalMessage}
            progress={smoothProgress}
            total={dataPoints.length}
          />
        )}

        {/* Progress indicator */}
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2"
          style={{ opacity: useTransform(smoothProgress, [0, 0.05], [0, 1]) }}
        >
          {dataPoints.map((_, i) => {
            const dotProgress = useTransform(
              smoothProgress,
              [i / (dataPoints.length + 1), (i + 1) / (dataPoints.length + 1)],
              [0.3, 1]
            );
            return (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-white"
                style={{ opacity: dotProgress }}
              />
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

function TitleOverlay({
  progress,
  title,
}: {
  progress: ReturnType<typeof useSpring>;
  title: string;
}) {
  const opacity = useTransform(progress, [0, 0.1], [1, 0]);
  const y = useTransform(progress, [0, 0.1], [0, -50]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ opacity, y }}
    >
      <div className="text-center px-4">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h2>
        <p className="text-xl text-gray-300">Scroll to explore</p>
        <motion.div
          className="mt-8"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg
            className="w-8 h-8 mx-auto text-white/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}

function DataReveal({
  point,
  narrative,
  progress,
  index,
  total,
}: {
  point: DataPoint;
  narrative: string;
  progress: ReturnType<typeof useSpring>;
  index: number;
  total: number;
}) {
  const start = (index + 0.5) / (total + 1);
  const end = (index + 1.5) / (total + 1);

  const opacity = useTransform(
    progress,
    [start - 0.1, start, end - 0.1, end],
    [0, 1, 1, 0]
  );
  const scale = useTransform(
    progress,
    [start - 0.1, start, end - 0.1, end],
    [0.8, 1, 1, 0.8]
  );
  const y = useTransform(
    progress,
    [start - 0.1, start, end - 0.1, end],
    [50, 0, 0, -50]
  );

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center p-8"
      style={{ opacity, scale, y }}
    >
      {/* Animated number */}
      <AnimatedNumber value={point.value} color={point.color} unit={point.unit} />

      {/* Label */}
      <h3 className="text-2xl md:text-4xl font-semibold text-white mt-4 mb-2 text-center">
        {point.label}
      </h3>

      {/* Narrative */}
      <p className="text-lg md:text-xl text-center max-w-2xl text-gray-300 mb-4">
        {narrative}
      </p>

      {/* Context */}
      <p className="text-md text-center max-w-xl text-gray-400">{point.context}</p>
    </motion.div>
  );
}

function AnimatedNumber({
  value,
  color,
  unit,
}: {
  value: number;
  color: string;
  unit?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const duration = 1500;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing function
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(value * eased));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    } else {
      setDisplayValue(0);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-7xl md:text-9xl font-bold" style={{ color }}>
      {displayValue.toLocaleString()}
      {unit && <span className="text-4xl md:text-6xl ml-2">{unit}</span>}
    </div>
  );
}

function FinalMessage({
  message,
  progress,
  total,
}: {
  message: string;
  progress: ReturnType<typeof useSpring>;
  total: number;
}) {
  const start = total / (total + 1);
  const opacity = useTransform(progress, [start, start + 0.1], [0, 1]);
  const scale = useTransform(progress, [start, start + 0.1], [0.9, 1]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center p-8"
      style={{ opacity, scale }}
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-2xl md:text-4xl font-medium text-white max-w-2xl mx-auto">
          {message}
        </p>
      </div>
    </motion.div>
  );
}

export default ScrollytellingSection;
