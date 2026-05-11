/**
 * /atlas/kiosk — always-on TV / office screen mode.
 *
 * Auto-enters fullscreen on first interaction (browsers block immediate
 * requestFullscreen without a user gesture). Idle for 90s → resets to
 * the ambient attract loop. Visitor taps anything to interact; tapping
 * "Done" or going idle returns to attract.
 *
 * The attract loop is a single component: a cycle of beautiful frames
 * pulled from the Atlas — featured faces, themes, year highlights,
 * community visions — auto-advancing every ~10 s with a slow
 * cross-fade.
 *
 * Stage 6 deliverable per the Atlas plan. Stage 7 will fold in the 20-
 * year anniversary mode (2027 timeline overlay).
 */

import { loadConstellation } from '@/lib/constellation/queries'
import KioskShell from './KioskShell'

export const metadata = {
  title: 'PICC Atlas · Kiosk',
  description:
    'Always-on Palm Island Living Atlas — for TVs and office screens.',
  // No-index — this surface is for physical-room screens, not search.
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function KioskPage() {
  const data = await loadConstellation()
  return <KioskShell data={data} />
}
