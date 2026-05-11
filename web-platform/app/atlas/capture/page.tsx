/**
 * /atlas/capture — community contribution form.
 *
 * Mobile-friendly, single-screen. Lands in /picc/inbox (community_feedback
 * with source='atlas-capture'). Never auto-publishes.
 *
 * Kinds:
 *   - text         · a thought, a reflection, a memory
 *   - voice        · placeholder — Stage 4.5 will add Web Audio recording
 *   - photo        · placeholder — Stage 4.5 will add Supabase upload
 *   - youth-art    · routes to youth-cosign-required tag
 *   - elder        · routes to elder-priority tag
 */

import CaptureForm from './CaptureForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Add a thought — Palm Island Living Atlas',
  description: 'Share a voice, a memory, a photo, or a piece of art with PICC. Your contribution goes to community review first.',
}

export default function CapturePage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-xl mx-auto px-4 py-6">
        <Link
          href="/living-atlas"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Living Atlas
        </Link>

        <header className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-1">
            Add to the Atlas
          </div>
          <h1 className="font-serif text-3xl text-charcoal mb-2">
            Share a thought
          </h1>
          <p className="text-stone-600 leading-relaxed">
            Tell PICC something. A memory, a vision, a service that meant
            something, a story you want held. <strong>Nothing publishes
            until community review.</strong> Elder voices are prioritised.
            Youth submissions are co-signed by a parent or Elder.
          </p>
        </header>

        <CaptureForm />

        <p className="mt-6 text-[11px] text-stone-500 italic">
          Submissions are stored in PICC&rsquo;s own database with{' '}
          <code className="bg-stone-100 px-1 rounded">status=&apos;pending&apos;</code>{' '}
          and surface in <Link href="/picc/inbox" className="underline">the staff inbox</Link>{' '}
          for review. Restricted content stays in the archive — counted in
          the Atlas Permissions panel, never publicly displayed.
        </p>
      </div>
    </div>
  )
}
