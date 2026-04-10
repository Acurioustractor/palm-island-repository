/**
 * PICC Risks and Pressure Points — Internal reference
 *
 * Names the structural risks PICC navigates at its current scale and scope.
 * Sourced from the 2019 Ipsos evaluation and the 2026 sector-context research
 * (workshop vault doc #8). NOT a list of failures — a working register so
 * the board, executive, and workshop conversations can see the same picture.
 *
 * Internal route at /picc/risks. Force-static, no DB calls.
 */

import {
  AlertTriangle,
  TrendingDown,
  FileText,
  HeartHandshake,
  Users,
  Network,
  ArrowRight,
  Shield,
} from 'lucide-react'

export const metadata = {
  title: 'Risks & Pressure Points — PICC Admin',
  description: 'Internal register of the structural pressures PICC navigates at its current scale — sourced from the Ipsos 2019 evaluation and the 2026 sector-context research.',
}

export const dynamic = 'force-static'

interface Risk {
  id: string
  category: 'funding' | 'governance' | 'people' | 'scope' | 'trust' | 'cultural'
  title: string
  what: string
  showsUp: string
  mitigation: string
  owner: string
  source: string
}

const RISKS: Risk[] = [
  {
    id: 'funding-fragmentation',
    category: 'funding',
    title: 'Funding fragmentation',
    what: 'PICC delivers 30 active services funded by many different government and philanthropic funders, each with their own contract cycle, reporting framework, compliance requirements, and renewal cliff.',
    showsUp:
      'In 2018-19 the Ipsos evaluation found PICC was running 17 contracts from 11 funders. The pattern is unchanged today — small services with hard funding cliffs (Blue Card Liaison ends 30 June 2026), large services with multi-year funding (Bwgcolman Way at $107.8M over 4 years), and constant renewal negotiation in between.',
    mitigation:
      'Multi-year contracts where possible. Social enterprises (Digital Service Centre, Retail, Logistics) deliberately built to reduce reliance on a single funder. The 20-year celebration funder briefing is a chance to consolidate relationships across multiple funders in one room.',
    owner: 'CEO + Finance + Service leads',
    source: 'Ipsos 2019 evaluation · sector-context research',
  },
  {
    id: 'compliance-burden',
    category: 'funding',
    title: 'Compliance burden',
    what: 'Each contract carries compliance, audit, accreditation, and reporting overhead. Quality frameworks include HSQF, RACGP, ACNC, NDIS, My Aged Care, ORIC. Each is justified individually but the cumulative cost is significant.',
    showsUp:
      'PICC publishes annual reports, audited financials, governance documents and a public evaluation — unusually well documented for a remote place-based organisation. That documentation costs real time. The annual report alone is a multi-month effort.',
    mitigation:
      'In-house annual report production (since 2024). Always-on Empathy Ledger reporting reduces duplication across funders. Audience-targeted PDF generator at /picc/reports/builder. The Empathy Ledger architecture means data flows once, reports flow many times.',
    owner: 'COO + Quality + Finance',
    source: 'Ipsos 2019 evaluation · governance achievements 2024',
  },
  {
    id: 'trust-reputation',
    category: 'trust',
    title: 'Trust and reputation',
    what: 'A community-controlled organisation lives or dies by its legitimacy with the community it serves. Community trust is earned slowly and lost quickly. Any perception of distance from community — or closeness to government — undermines the model.',
    showsUp:
      'The 2019 Ipsos evaluation directly named this: the mixed-governance model "created distrust and confusion about whether PICC was truly community-led." That finding was the explicit justification for the 2021 restructure. Trust has been rebuilt — but it remains the most fragile asset PICC holds.',
    mitigation:
      'Member-controlled board structure (since September 2021). Annual general meetings where members elect directors. Public accountability through annual reports and public evaluations. The 20-year celebration is a deliberate trust-building moment — community ceremony at the centre, Elders leading.',
    owner: 'Board + CEO + community members',
    source: 'Ipsos 2019 evaluation · sector-context research',
  },
  {
    id: 'succession-planning',
    category: 'people',
    title: 'Succession planning',
    what: 'PICC has had one CEO since 2007 — Rachel Atkinson. The continuity has been a strength. It also concentrates institutional knowledge in one person and creates a key-person risk that any organisation at this scale must plan for.',
    showsUp:
      'The 2019 Ipsos evaluation explicitly recommended stronger succession planning. Beyond the CEO, the same applies at every senior service-lead level — many roles depend on one or two people who hold the relationships and the operational memory.',
    mitigation:
      'The 20-year celebration creates a natural moment to identify the next generation of leaders. The Narelle interview framework Part E14 names "internal PICC second-in-command" as a non-negotiable for the Launchpad plan execution. Voice capture sprint surfaces leaders who could step up.',
    owner: 'Board + CEO',
    source: 'Ipsos 2019 evaluation · Launchpad plan',
  },
  {
    id: 'scope-creep',
    category: 'scope',
    title: 'Scope and governance depth',
    what: 'PICC is broader than most community-controlled organisations in Australia — health, child and family safety, justice, disability, aged care, youth, social enterprise, all in one Palm-based entity. That breadth is the strength. It is also the hardest thing to govern.',
    showsUp:
      'Each domain has its own funder relationships, regulatory framework, peer body, professional norms, and risk profile. Asking a single 5–7 person board to provide depth oversight across all of them is a structural challenge. The 2019 evaluation flagged this. The 2021 restructure addressed governance form but not the underlying complexity.',
    mitigation:
      'Skills-based board appointments (up to 2 of 5–7 directors are board-appointed for skills the elected directors don\'t cover). Reserved Manbarra Traditional Owner seat ensures cultural anchor. Operational structure with service-specific leads reporting up. The Empathy Ledger gives the board cross-service visibility without requiring deep operational knowledge.',
    owner: 'Board + Executive',
    source: 'Ipsos 2019 evaluation · sector-context research',
  },
  {
    id: 'lateral-violence',
    category: 'cultural',
    title: 'Colonial trauma and lateral violence',
    what: 'Palm Island\'s history of forced removal from more than 70 Nations, the Hull River cyclone, the 2004 death in custody, and ongoing intergenerational trauma all live inside the community PICC serves and inside its workforce. The 2019 evaluation named this directly as a recurring pressure point.',
    showsUp:
      'Workplace conflict, family disputes that cross into work, distrust between groups, the emotional weight of trauma work, vicarious trauma in frontline staff. None of these are unique to PICC — they are the conditions any community-controlled organisation in a remote post-colonial context navigates.',
    mitigation:
      'Cultural safety frameworks. Social and Emotional Wellbeing service for staff and community. Elder approval cycles for sensitive content. The Bwgcolman Way philosophy — community making decisions about community — is itself a structural answer. Strong HR systems are part of the Ipsos recommendation list.',
    owner: 'CEO + HR + Cultural leads',
    source: 'Ipsos 2019 evaluation · sector-context research',
  },
  {
    id: 'coordination-load',
    category: 'governance',
    title: 'Coordination load',
    what: 'The Launchpad plan itself names this as the #1 risk to the 20-year celebration. 10 workstreams running in parallel, multiple owners, hard deadlines, and the celebration date as a non-negotiable.',
    showsUp:
      'Anything that depends on PICC\'s already-stretched executive bandwidth slips. The voices capture sprint, Bwgcolman Way case study, Hull River long-form piece, rebrand, ceremony, funder briefing, and platform launch all converge on the same 9–10 month window.',
    mitigation:
      'Internal second-in-command for day-to-day execution (Launchpad decision #9, asked of Rachel in the workshop). Ben + Nic behind the curtain principle reduces day-to-day demand on executive. Weekly 24/25 data check-in cadence. Phase-by-phase completion rather than stacking.',
    owner: 'Rachel + Ben + internal 2IC',
    source: 'PICC-20-Year-Launchpad-Plan.md (Total coordination load)',
  },
  {
    id: 'data-sovereignty',
    category: 'governance',
    title: 'Data sovereignty and outcome measurement',
    what: 'PICC produces a lot of data — 2,508 media files, 290 extracted quotes, 162 elder quotes, 53 published stories, 34 interviews with 2,036 segments, 8 report highlights for 24/25. The Ipsos evaluation recommended a community dashboard built around Indigenous data-sovereignty principles. That is partially built; it is not fully institutionalised.',
    showsUp:
      'Outcome measurement is described in the research as "still a work in progress." The data exists. The systems to consistently turn it into board-level decision support, funder reports, and community accountability are still being built.',
    mitigation:
      'The Empathy Ledger architecture is the long-term answer — sovereign data, community consent, queryable evidence layer. The 24/25 data capture sprint (Narelle interview Part C) puts service-level numbers into one consistent place. The /picc/finances dashboard is a step toward board-level visibility.',
    owner: 'CEO + Data + Empathy Ledger team',
    source: 'Ipsos 2019 evaluation · sector-context research',
  },
]

const CATEGORY_LABELS: Record<Risk['category'], string> = {
  funding: 'Funding & compliance',
  governance: 'Governance & coordination',
  people: 'People & succession',
  scope: 'Scope & complexity',
  trust: 'Trust & legitimacy',
  cultural: 'Cultural & wellbeing',
}

const CATEGORY_ICONS: Record<Risk['category'], React.ReactNode> = {
  funding: <TrendingDown className="w-5 h-5" />,
  governance: <Network className="w-5 h-5" />,
  people: <Users className="w-5 h-5" />,
  scope: <FileText className="w-5 h-5" />,
  trust: <HeartHandshake className="w-5 h-5" />,
  cultural: <Shield className="w-5 h-5" />,
}

export default function RisksPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* ── HEADER ── */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            Internal · Risk Register
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-800 italic mb-4 leading-tight">
            Risks &amp; pressure points
          </h1>
          <p className="text-lg text-stone-600 max-w-3xl leading-relaxed">
            The structural pressures PICC navigates at its current scale and scope. This is
            not a list of failures — it is a working register so the board, executive, and
            the Rachel workshop conversation can see the same picture and decide what to
            mitigate, accept, or watch.
          </p>
        </div>

        {/* ── FRAMING ── */}
        <section className="mb-12">
          <div className="rounded-2xl border-l-4 border-picc-ochre bg-white p-6">
            <p className="text-xs font-semibold tracking-wide uppercase text-picc-ochre mb-3">
              The framing
            </p>
            <p className="text-stone-700 leading-relaxed mb-3">
              These are the classic Aboriginal Community Controlled Organisation growth
              tensions. The 2019 Ipsos evaluation named most of them. The 2021 restructure
              addressed some. The 20-year celebration is an opportunity to address others
              by making them visible — to community, to funders, and to the board.
            </p>
            <p className="text-sm text-stone-600 leading-relaxed">
              <strong>Naming a risk is not admitting failure.</strong> It is the precondition
              for navigating one. PICC is unusually well documented for a remote place-based
              organisation precisely because it has been willing to say what is hard.
            </p>
          </div>
        </section>

        {/* ── SUMMARY ── */}
        <section className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            Risk register at a glance
          </p>
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-stone-700">Risk</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-700">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-700">Owner</th>
                </tr>
              </thead>
              <tbody>
                {RISKS.map((r, i) => (
                  <tr
                    key={r.id}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}
                  >
                    <td className="px-4 py-3">
                      <a href={`#${r.id}`} className="text-stone-800 hover:text-picc-ochre font-medium">
                        {r.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{CATEGORY_LABELS[r.category]}</td>
                    <td className="px-4 py-3 text-stone-500 text-xs">{r.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── DETAIL ── */}
        <section className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            Risk register · detail
          </p>
          <div className="space-y-6">
            {RISKS.map((r) => (
              <div
                key={r.id}
                id={r.id}
                className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8 scroll-mt-8"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-picc-ochre flex-shrink-0">
                    {CATEGORY_ICONS[r.category]}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-mono font-bold text-picc-ochre uppercase tracking-wide mb-1">
                      {CATEGORY_LABELS[r.category]}
                    </p>
                    <h3 className="text-xl font-bold text-stone-800">{r.title}</h3>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <RiskField label="What it is" body={r.what} />
                  <RiskField label="How it shows up at PICC" body={r.showsUp} />
                </div>

                <div className="rounded-xl bg-picc-ochre/5 border border-picc-ochre/20 p-5 mb-4">
                  <p className="text-xs font-semibold tracking-wide uppercase text-picc-ochre mb-2">
                    Mitigation
                  </p>
                  <p className="text-sm text-stone-700 leading-relaxed">{r.mitigation}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100 text-xs">
                  <span className="text-stone-500">
                    <strong className="text-stone-700">Owner:</strong> {r.owner}
                  </span>
                  <span className="text-stone-400">{r.source}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM ── */}
        <div className="rounded-2xl bg-stone-900 text-white p-8 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-picc-ochre flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase text-picc-ochre mb-2">
                For the Rachel workshop
              </p>
              <p className="text-white/90 leading-relaxed mb-3">
                Walk this register before the next-20 vision conversation. Not to scare —
                to ground the conversation. Every one of these has been named publicly by
                Ipsos or in the sector-context research. None is secret. The question for
                Rachel is which mitigation she wants to lead, which she wants to delegate,
                and which she wants to accept and watch.
              </p>
              <p className="text-sm text-white/60 leading-relaxed">
                The Launchpad plan&apos;s coordination risk is the one most directly tied to
                the 20-year celebration delivery — see the bottom of doc #4 for the workstream
                breakdown.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-8">
          <p className="text-xs text-stone-500 leading-relaxed">
            <strong className="text-stone-700">Sources:</strong> Ipsos 2019 independent
            evaluation of PICC · PICC-Sector-Context-Deep-Research.md (workshop vault doc #8) ·
            PICC-20-Year-Launchpad-Plan.md · PICC-Narelle-Interview-Framework.md
          </p>
          <p className="text-xs text-stone-400 mt-2">
            Last sync: 10 April 2026. This register evolves — update doc #8 first if anything
            here changes.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <a href="/picc/launchpad" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 inline-flex items-center gap-1.5">
            ← Launchpad plan
            <ArrowRight className="w-3 h-3" />
          </a>
          <a href="/picc/governance" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Governance
          </a>
          <a href="/picc/sector-map" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Sector map
          </a>
          <a href="/picc/finances" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Finances
          </a>
          <a href="/picc/next-20" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Next-20 canvas
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────

function RiskField({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
        {label}
      </p>
      <p className="text-sm text-stone-700 leading-relaxed">{body}</p>
    </div>
  )
}
