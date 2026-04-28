/**
 * PICC Design System — voting + curation page.
 *
 * Browses every graphic element from lib/design-system/elements-registry.ts,
 * lets the team vote (🔥👍😐👎) and promote (concept → approved → priority →
 * retire). Promoted elements become the palette for new pages via the
 * getPromotedElements() helper.
 */
import DesignSystemClient from './DesignSystemClient'

export const metadata = {
  title: 'Design System — PICC Admin',
  description: 'Browse every graphic element, vote on what works, promote the best to the priority palette.',
}

export const dynamic = 'force-dynamic'

export default function DesignSystemPage() {
  return <DesignSystemClient />
}
