'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface MetricsBarProps {
  metrics: Array<{ label: string; value: string | number }>
  backgroundColor?: string
}

export function MetricsBar({ metrics, backgroundColor = 'bg-gray-900' }: MetricsBarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  if (metrics.length === 0) return null

  return (
    <section ref={ref} className={`${backgroundColor} py-16`}>
      <div className="max-w-6xl mx-auto px-8">
        <div className={`grid gap-8 ${
          metrics.length <= 3 ? 'grid-cols-1 md:grid-cols-3' :
          metrics.length <= 4 ? 'grid-cols-2 md:grid-cols-4' :
          'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
        }`}>
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                {metric.value}
              </div>
              <div className="text-sm text-white/60 font-medium uppercase tracking-wider">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
