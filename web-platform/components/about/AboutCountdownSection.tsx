'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Props {
  currentYear: number
  yearsRemaining: number
  progressPct: number
  staffTotal: number
  servicesActive: number
  incomeDisplay: string
}

export default function AboutCountdownSection({
  currentYear,
  yearsRemaining,
  progressPct,
  staffTotal,
  servicesActive,
  incomeDisplay,
}: Props) {
  return (
    <section className="editorial-section bg-gradient-to-br from-picc-earth-700 via-picc-earth to-picc-red text-white">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-sm font-semibold tracking-widest uppercase text-picc-ochre-300 mb-4">
          Road to 20 Years
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.02em] mb-6">
          Our Journey to 2029
        </h2>
        <p className="text-lg text-white/80 max-w-2xl mb-8">
          From 1 employee in 2007 to {staffTotal} today &mdash; {currentYear} years down, {yearsRemaining} to go.
        </p>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>2009</span>
            <span>Year {currentYear} of 20</span>
            <span>2029</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-picc-red to-picc-ochre rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
          <p className="text-sm text-white/50 mt-2">{progressPct}% complete</p>
        </div>

        {/* Then vs Now */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div>
            <p className="text-sm text-white/50 mb-1">Staff</p>
            <p className="text-xs text-white/40 mb-1">1 &rarr;</p>
            <p className="text-3xl md:text-4xl font-extrabold tracking-tight">{staffTotal}</p>
          </div>
          <div>
            <p className="text-sm text-white/50 mb-1">Services</p>
            <p className="text-xs text-white/40 mb-1">0 &rarr;</p>
            <p className="text-3xl md:text-4xl font-extrabold tracking-tight">{servicesActive}</p>
          </div>
          <div>
            <p className="text-sm text-white/50 mb-1">Income</p>
            <p className="text-xs text-white/40 mb-1">$0 &rarr;</p>
            <p className="text-3xl md:text-4xl font-extrabold tracking-tight">{incomeDisplay}</p>
          </div>
        </div>

        <Link
          href="/20-years"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-picc-earth rounded-full font-semibold text-lg hover:scale-[0.97] active:scale-95 transition-all duration-300 ease-elegant"
        >
          Explore Full Timeline
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  )
}
