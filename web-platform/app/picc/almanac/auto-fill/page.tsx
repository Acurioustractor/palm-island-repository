/**
 * /picc/almanac/auto-fill — the "make it easy" page.
 *
 * One button: "Auto-fill all spreads with the best photos."
 * Shows what will happen, then queues everything in one click.
 * User types "process pencil queue" in chat and it's done.
 */
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import AutoFillClient from './AutoFillClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Auto-fill spreads · PICC Almanac',
  description:
    'One click — fills every Pencil image-fill placeholder with the best print-ready EL photo for it.',
}

export default function AutoFillPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <p
          className="font-bold uppercase mb-3"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          PICC · ALMANAC · AUTO-FILL
        </p>
        <h1
          className="font-fraunces font-bold mb-3"
          style={{ color: C.ocean, fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.05 }}
        >
          Make every spread real, in one click.
        </h1>
        <p
          className="font-fraunces mb-6"
          style={{ color: C.driftwood, fontSize: 20, lineHeight: 1.4, maxWidth: 720 }}
        >
          We pick the best print-ready EL photo for every image placeholder in
          the Saltwater Almanac, queue them all, and you say{' '}
          <em>"process pencil queue"</em> in chat to apply.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/picc/almanac/photo-library"
            className="px-3 py-1.5 rounded-md hover:bg-stone-50"
            style={{ color: C.ocean, border: `1px solid ${C.border}` }}
          >
            Photo library
          </Link>
          <Link
            href="/picc/almanac/pencil-bridge"
            className="px-3 py-1.5 rounded-md hover:bg-stone-50"
            style={{ color: C.ocean, border: `1px solid ${C.border}` }}
          >
            Pencil bridge
          </Link>
          <Link
            href="/picc/annual-report"
            className="px-3 py-1.5 rounded-md hover:bg-stone-50"
            style={{ color: C.muted, border: `1px solid ${C.border}` }}
          >
            ← Annual Report Hub
          </Link>
        </div>
      </header>

      <AutoFillClient />
    </div>
  )
}
