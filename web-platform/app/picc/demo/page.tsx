/**
 * Demo run-of-show — operator's cheat sheet for the leadership presentation.
 *
 * One scrollable page with the act-by-act flow, click paths, talking
 * points, presenter-mode toggles, the EL connection check, and a QR
 * panel for /sign-the-vision so leaders can sign from their phones.
 *
 * Internal at /picc/demo. Open this on a second screen / phone while
 * the projected screen runs the actual demo URLs in presenter mode.
 */
import { headers } from 'next/headers'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  Tv2,
  Clock,
  Mic,
  CheckCircle2,
} from 'lucide-react'
import QRPanel from '@/components/picc/QRPanel'

export const metadata = {
  title: 'Demo run-of-show — leadership presentation | PICC',
}

export const dynamic = 'force-dynamic'

interface Act {
  no: string
  duration: string
  title: string
  url: string
  presenter: boolean // can be opened in presenter mode
  notes: string
  callouts?: string[]
}

const ACTS: Act[] = [
  {
    no: '1',
    duration: '5 min',
    title: 'Who we are now',
    url: '/',
    presenter: false,
    notes:
      'Open the home page live on screen. Counter shows storytellers / services / voices in real time. Pivot to /picc/launchpad to show the 13 admin surfaces.',
    callouts: ['Open / on the projector', 'Then click through to /picc/launchpad'],
  },
  {
    no: '2',
    duration: '8 min',
    title: '20 years, told as evidence',
    url: '/20-years',
    presenter: false,
    notes:
      'Year-by-year scroll. Stop at three inflection moments: 2008 (auspice begins), 2021 (community ownership), 2024 (Bwgcolman Way delegated authority). Optional: detour through /picc/finances for the revenue curve.',
    callouts: ['Anchor: 1 staff → 197', 'Anchor: $1.6M → $23.4M', 'Use the timeline expansion if it works'],
  },
  {
    no: '3',
    duration: '7 min',
    title: 'Bwgcolman Way as proof',
    url: '/bwgcolman',
    presenter: false,
    notes:
      'Legal frame (Part 2A), the numbers (439 children, 16 entities), Palm as one site in a movement. End on /picc/sector-map showing the three-layer ecosystem.',
    callouts: [
      'Flag $107.8M scope question as a *next step*, not a hole',
      'Sector map: only place leaders see PICC\'s broader position',
    ],
  },
  {
    no: '4',
    duration: '10 min',
    title: 'Services as living stories',
    url: '/services',
    presenter: false,
    notes:
      'Live service map · 26 active services from EL v2 · Innovation badges on next-20 programmes. Click any service for cover photo + voices. Then /innovation for the projects in flight.',
    callouts: ['Click an Innovation-badged card to deep-link', 'Every service photo is consent-cleared'],
  },
  {
    no: '5',
    duration: '8 min',
    title: 'Elders + Voices as cultural authority',
    url: '/voices',
    presenter: false,
    notes:
      'Voices wall · 20 Voices for 20 Years sprint tracker visible top of fold · pulse + themes. Click a person → "appears alongside" panel from EL v2 faces-in-frame.',
    callouts: ['Sprint tracker shows progress to 20', 'Pulse: voice-of-the-week with RSS'],
  },
  {
    no: '6',
    duration: '7 min',
    title: 'Next 20 — community canvas',
    url: '/picc/next-20',
    presenter: true,
    notes:
      'Project /picc/next-20?presenter=1. Three columns: Community Visions (live-polling) · Forward Commitments · Urgent Asks. The signing canvas IS the demo finale — leaders co-author here, live.',
    callouts: [
      'Open in PRESENTER MODE — chrome hidden',
      'Vision column polls every 8s · pulses on new approval',
      'See "Live signature loop" below',
    ],
  },
]

interface PageProps {
  searchParams: Promise<{ session?: string }>
}

export default async function DemoRunOfShowPage({ searchParams }: PageProps) {
  const h = await headers()
  const host = h.get('host') ?? 'palmisland.org.au'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  const origin = `${proto}://${host}`
  const sp = await searchParams
  const session =
    (sp.session && sp.session.replace(/[^a-z0-9-]/gi, '').slice(0, 60)) ||
    `meeting-${new Date().toISOString().slice(0, 10)}`
  const signUrl = `${origin}/sign-the-vision?session=${encodeURIComponent(session)}&from=qr`

  const total = ACTS.reduce((acc, a) => {
    const m = parseInt(a.duration)
    return acc + (Number.isFinite(m) ? m : 0)
  }, 0)

  return (
    <div className="min-h-screen bg-[#FBF8EE]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: '#8B1A1A' }}>
            Operator · Run of show
          </p>
          <h1 className="font-serif text-4xl md:text-5xl italic mb-4 leading-tight" style={{ color: '#0B4F6C' }}>
            The leadership presentation, end to end.
          </h1>
          <p className="text-lg max-w-3xl leading-relaxed mb-4" style={{ color: '#6B6560' }}>
            Six acts · ~{total} min + Q&amp;A. Every act anchored to a live URL.
            Open this page on a phone or second screen; project the URLs in the
            "Open" column. Use presenter mode where indicated to hide admin chrome.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ backgroundColor: '#fff', border: '1px solid #E8E6E3' }}>
            <span className="font-bold uppercase tracking-[0.3em]" style={{ color: '#6B6560', fontSize: 10 }}>
              Tagging session
            </span>
            <span className="font-mono" style={{ color: '#0B4F6C' }}>{session}</span>
            <span style={{ color: '#A39E99', fontSize: 11 }}>
              · override with <code>?session=name</code>
            </span>
          </div>
        </div>

        {/* Live signature loop callout */}
        <div className="mb-10 rounded-xl border-2 p-5 md:p-6" style={{ borderColor: '#F5A623', backgroundColor: '#FFFBEB' }}>
          <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
            <Sparkles className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#8B1A1A' }} />
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-2xl mb-2" style={{ color: '#0B4F6C' }}>
                The live signature loop
              </h2>
              <p className="mb-3" style={{ color: '#6B6560' }}>
                Demo finale. Anyone in the room can sign — tablet, phone (scan the QR), or laptop.
                The next-20 canvas pulses when an Elder approves.
              </p>
              <ol className="space-y-1 text-sm" style={{ color: '#6B6560' }}>
                <li>
                  <strong style={{ color: '#0B4F6C' }}>Project:</strong> /picc/next-20?presenter=1 on the screen
                </li>
                <li>
                  <strong style={{ color: '#0B4F6C' }}>Audience signs:</strong> tablet with /sign-the-vision OR phone (QR right →)
                </li>
                <li>
                  <strong style={{ color: '#0B4F6C' }}>Operator approves:</strong> /picc/vision (separate tab)
                </li>
                <li>
                  <strong style={{ color: '#15803D' }}>Within ≤8s</strong> the new vision pulses live on the projected canvas.
                </li>
              </ol>
            </div>
            <div className="flex-shrink-0">
              <QRPanel url={signUrl} label="Audience scan-and-sign" size={180} />
            </div>
          </div>
        </div>

        {/* Acts */}
        <h2 className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: '#6B6560' }}>
          Acts
        </h2>
        <div className="space-y-4 mb-12">
          {ACTS.map((a) => (
            <div key={a.no} className="rounded-xl border bg-white p-5 md:p-6" style={{ borderColor: '#E8E6E3' }}>
              <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl font-bold" style={{ backgroundColor: '#0B4F6C', color: '#fff' }}>
                  {a.no}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                    <h3 className="font-serif text-2xl" style={{ color: '#0B4F6C' }}>
                      {a.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs" style={{ color: '#6B6560' }}>
                      <Clock className="w-3 h-3" />
                      {a.duration}
                    </span>
                  </div>
                  <p className="mb-3 text-sm" style={{ color: '#6B6560', lineHeight: 1.6 }}>
                    {a.notes}
                  </p>
                  {a.callouts && a.callouts.length > 0 && (
                    <ul className="space-y-1 mb-3">
                      {a.callouts.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-sm" style={{ color: '#6B6560' }}>
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#C8963E' }} />
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Link
                      href={a.url}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-widest hover:shadow-sm transition"
                      style={{ backgroundColor: '#0B4F6C', color: '#fff', letterSpacing: '0.15em' }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open {a.url}
                    </Link>
                    {a.presenter && (
                      <Link
                        href={`${a.url}?presenter=1`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-widest border transition hover:shadow-sm"
                        style={{ borderColor: '#0B4F6C', color: '#0B4F6C', letterSpacing: '0.15em' }}
                      >
                        <Tv2 className="w-3 h-3" />
                        Presenter mode
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pre-flight checklist */}
        <div className="rounded-xl border-2 p-6 md:p-8" style={{ borderColor: '#0B4F6C', backgroundColor: '#fff' }}>
          <h2 className="font-serif text-2xl italic mb-4" style={{ color: '#0B4F6C' }}>
            Pre-flight checklist
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: '#6B6560' }}>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#15803D' }} />
              Run <code className="px-1.5 py-0.5 rounded" style={{ backgroundColor: '#F7F6F4' }}>npm run check-el</code> on the laptop driving the demo. All four EL surfaces should be green.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#15803D' }} />
              Open <Link href="/picc/vision" target="_blank" className="underline" style={{ color: '#0B4F6C' }}>/picc/vision</Link> in a separate tab — the approval queue.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#15803D' }} />
              Open <Link href="/sign-the-vision" target="_blank" className="underline" style={{ color: '#0B4F6C' }}>/sign-the-vision</Link> on the audience tablet (and project beside the canvas).
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#15803D' }} />
              Confirm the QR panel resolves on the phone (scan, see the form, type a test).
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#15803D' }} />
              Open <Link href="/design-system" target="_blank" className="underline" style={{ color: '#0B4F6C' }}>/design-system</Link> in a backup tab — useful if a colour question comes up.
            </li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/picc/next-20?presenter=1"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest"
              style={{ backgroundColor: '#0B4F6C', color: '#fff', letterSpacing: '0.15em' }}
            >
              <Tv2 className="w-3 h-3" />
              Open canvas in presenter mode
            </Link>
            <Link
              href="/picc/launchpad"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest border"
              style={{ borderColor: '#6B6560', color: '#6B6560', letterSpacing: '0.15em' }}
            >
              Launchpad <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
