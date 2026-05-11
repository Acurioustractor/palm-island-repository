/**
 * GET /api/constellation
 *
 * Returns the merged data payload that drives /picc/constellation —
 * faces (EL v2 consented photos), themes (PICC extracted_quotes), and
 * year anchors (PICC annual_reports). Internal-admin surface only; not
 * mounted on the public site.
 *
 * Revalidates every 5 minutes — fresh enough for a workshop, infrequent
 * enough to avoid hammering EL v2 during repeated clicks.
 */
import { NextResponse } from 'next/server'
import { loadConstellation } from '@/lib/constellation/queries'

export const revalidate = 300

export async function GET() {
  try {
    const payload = await loadConstellation()
    return NextResponse.json(payload)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
