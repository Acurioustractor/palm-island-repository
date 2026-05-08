import AnimatedStat from '@/components/data/AnimatedStat'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

/**
 * Showcase route for <AnimatedStat>. Five anchor numbers at different sizes,
 * formats, and palette accents. Design-review only — not linked from nav.
 */
export const metadata = {
  title: 'AnimatedStat · Design System',
  description: 'Showcase route for the AnimatedStat component.',
}

export default function AnimatedStatShowcasePage() {
  return (
    <main
      className="min-h-screen px-6 py-16 md:px-12 md:py-24"
      style={{ backgroundColor: C.shell, color: C.earth }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-16">
        <header className="flex flex-col gap-4">
          <span
            className="font-sans font-bold uppercase text-[11px] tracking-[0.3em]"
            style={{ color: C.driftwood }}
          >
            Design System / Data
          </span>
          <h1
            className="font-fraunces font-bold leading-tight"
            style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
          >
            AnimatedStat
          </h1>
          <p
            className="font-sans max-w-2xl"
            style={{ fontSize: 16, lineHeight: 1.55, color: C.rock }}
          >
            Anchor numbers — staff, revenue, voices — animate from zero on
            scroll-into-view. Provenance is available on every figure.
            Reduced-motion users see the final value instantly.
          </p>
        </header>

        <section className="flex flex-col gap-12">
          <AnimatedStat
            value={197}
            label="Palm Islanders employed"
            colour="ocean"
            size="lg"
            provenance="FY 2024-25 payroll"
          />

          <AnimatedStat
            value={23_400_000}
            label="Revenue retained on island"
            format="compact-currency"
            colour="ochre"
            size="lg"
            provenance="Source: 2024-25 audited financials"
          />

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <AnimatedStat
              value={452}
              label="Voices in the archive"
              colour="mangrove"
              size="md"
              provenance="Empathy Ledger v2 archive, May 2026"
            />
            <AnimatedStat
              value={17}
              label="Years of community control"
              colour="turtleRed"
              size="md"
              suffix=" yrs"
              provenance="Auspiced under CATSI Act since 2008"
            />
          </div>

          <AnimatedStat
            value={26}
            label="Active services on island"
            colour="coral"
            size="sm"
            provenance="Empathy Ledger services registry, current"
          />
        </section>

        <footer
          className="font-sans text-[12px]"
          style={{ color: C.muted, lineHeight: 1.55 }}
        >
          Scroll the page to retrigger animation only on a fresh load — the
          component uses <code>once: true</code>. Numbers use Fraunces 700,
          tabular figures, with the brand caption cadence below.
        </footer>
      </div>
    </main>
  )
}
