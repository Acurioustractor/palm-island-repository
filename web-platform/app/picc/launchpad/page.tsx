/**
 * PICC 20-Year Launchpad — Strategic Review Page
 *
 * A visual, scannable presentation of the CEO-reviewed Launchpad plan.
 * Built for Rachel and Narelle to review, edit, and sign off on before
 * the full plan document goes into execution.
 *
 * Internal page at /picc/launchpad — not public-facing.
 */

import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Heart,
  Users,
  Mic,
  BookOpen,
  Landmark,
  Compass,
  Calendar,
  ChevronRight,
} from 'lucide-react'

export const metadata = {
  title: '20-Year Launchpad | PICC',
  description: 'The strategic plan for PICC\'s 20-year celebration, rebrand, and Empathy Ledger launch.',
}

export const dynamic = 'force-static'

export default function LaunchpadPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* ─── HEADER ─── */}
        <div className="mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            Strategic Plan · For Review
          </p>
          <h1 className="font-serif text-4xl md:text-6xl text-stone-800 italic mb-4 leading-tight">
            The 20-Year Launchpad
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl leading-relaxed">
            PICC has earned a celebration. But a celebration looks backward.
            This plan proposes something different: use the 20-year moment as
            a <em>deadline and amplifier</em> for the next chapter, not a ribbon
            on the last one.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-picc-ochre/10 text-picc-ochre font-medium">
              Mode: SELECTIVE EXPANSION
            </span>
            <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 font-medium">
              Approach A — The Launchpad (selected)
            </span>
            <span className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 font-medium">
              For Rachel + Narelle review
            </span>
          </div>
        </div>

        {/* ─── THE CORE IDEA ─── */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            The core idea
          </h2>
          <div className="rounded-2xl bg-[#0B4F6C] text-white p-8 md:p-10">
            <p className="font-serif italic text-2xl md:text-3xl leading-relaxed mb-6">
              "Before PICC, there was Hull River.<br />
              Before Hull River, there was Country.<br />
              PICC's next 20 years start here."
            </p>
            <div className="text-sm text-white/80 border-l-2 border-picc-ochre pl-4">
              The community ceremony sits at the centre. Rebrand and platform
              launch wrap around it. Bwgcolman Way is the concrete proof point.
              Funder and sector attention live in the same week but a different
              room. The Empathy Ledger is invisible plumbing — never the hero.
            </div>
          </div>
        </section>

        {/* ─── WHY THIS MATTERS — IPSOS FINDING ─── */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            Why this restructure matters
          </h2>
          <div className="rounded-2xl border-l-4 border-picc-ochre bg-white p-8 shadow-sm">
            <p className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wide mb-3">
              Independent finding · Ipsos 2019 evaluation
            </p>
            <p className="font-serif italic text-xl md:text-2xl text-stone-800 leading-relaxed mb-4">
              &ldquo;The mixed governance model helped stabilise funding and coordination, but
              also created distrust and confusion about whether PICC was truly community-led.&rdquo;
            </p>
            <p className="text-sm text-stone-600 leading-relaxed">
              The 2021 restructure directly answered that finding. Services, workforce and
              assets transferred from the 2007 hybrid public company into a member-controlled
              entity on <strong>30 September 2021</strong>. The next 20 years build on the
              legitimacy PICC has now earned. The Launchpad uses the 20-year moment to make
              that legitimacy visible — externally to funders, internally to community.
            </p>
          </div>
        </section>

        {/* ─── THREE APPROACHES CONSIDERED ─── */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            Three approaches were considered
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <ApproachCard
              letter="A"
              name="The Launchpad"
              selected
              summary="20-year moment as deadline + amplifier for infrastructure. Community ceremony at centre, rebrand + platform launch wrapped around it."
              pros={['Compounds beyond the event', 'Forward-facing', 'Elders lead']}
              cons={['Coordination-heavy', 'Requires Rachel bandwidth']}
              score="9/10"
            />
            <ApproachCard
              letter="B"
              name="The Event"
              summary="Community celebration, Elder-led ceremony, story sharing. Infrastructure continues in background but doesn't define the moment."
              pros={['Safe', 'Simple', 'Won\'t fail']}
              cons={['Misses strategic inflection', 'Drift after the event']}
              score="5/10"
            />
            <ApproachCard
              letter="C"
              name="The Movement"
              summary="Launch a national First Nations data sovereignty movement. PICC as first mover. Federal policy positioning."
              pros={['10x ambitious', 'Sector-changing']}
              cons={['Needs capacity PICC doesn\'t have yet', 'High risk']}
              score="10 or 3/10"
            />
          </div>
          <p className="text-sm text-stone-500 mt-4 italic">
            A was selected. B leaves strategic leverage on the table. C depends
            on partners that don't yet exist — revisit at the 25-year mark.
          </p>
        </section>

        {/* ─── WHAT ALREADY EXISTS ─── */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            What we're leveraging (not rebuilding)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Mic} value="839" label="quotable moments" />
            <StatCard icon={Users} value="76" label="named storytellers" />
            <StatCard icon={BookOpen} value="123" label="transcripts" />
            <StatCard icon={Target} value="28" label="services" />
            <StatCard icon={Landmark} value="6" label="projects" />
            <StatCard icon={Calendar} value="17 yrs" label="archived reports" />
            <StatCard icon={Heart} value="Hull River" label="anchor story" />
            <StatCard icon={Sparkles} value="Bwgcolman Way" label="world-first" />
          </div>
          <p className="text-sm text-stone-500 mt-4">
            Plus: picc.studio site, Ask Palm AI, Elders Trips and Storytelling
            project, cultural approval workflows, Annual Report 2.0 with
            audience targeting.
          </p>
        </section>

        {/* ─── MANDATORY CORE ─── */}
        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre">
              The mandatory core (M1–M8)
            </h2>
            <span className="text-xs text-stone-400">
              must ship for the plan to land
            </span>
          </div>
          <div className="space-y-3">
            <ItemCard
              tag="M1"
              title="A specific date"
              body="Without a date, nothing has a deadline and everything drifts. The celebration needs a week, ideally a day."
              action="Rachel decides in the meeting"
              status="pending"
            />
            <ItemCard
              tag="M2"
              title="The 'next 20 years' vision document"
              body="The single biggest gap in the current plan. Without this, The Launchpad has nothing to launch. Rachel writes it. Ben helps structure."
              action="Rough draft before the meeting"
              status="critical"
            />
            <ItemCard
              tag="M3"
              title="The Bwgcolman Way case study"
              body="1,500-word policy-grade case study of a world-first Indigenous-led delegated authority for child safety. The anchor of the 20-year story."
              action="Ben drafts, Rachel + Elders sign off"
              status="pending"
            />
            <ItemCard
              tag="M4"
              title="'Ben + Nic behind the curtain' principle"
              body="Every public-facing asset in community voice. Every stage moment PICC, not consultants. The Ledger is invisible plumbing."
              action="Rachel sign-off"
              status="pending"
            />
            <ItemCard
              tag="M5"
              title="Elder approval cycle running at scale"
              body="669 voices pending approval. Without a weekly review cycle, the content cliff kills the launch. Start this week, not after the meeting."
              action="Start immediately — don't wait for Rachel"
              status="critical"
            />
            <ItemCard
              tag="M6"
              title="New website + rebrand live before the celebration"
              body="New picc.studio, new brand, Hull River entry point, year-by-year timeline, voices embedded. Ready for outsiders by launch week."
              action="8-month build"
              status="pending"
            />
            <ItemCard
              tag="M7"
              title="One-day community ceremony on Palm, Elder-led"
              body="Not Ben's event. Not the agency's. Community's event, on Palm, with Elders leading every segment."
              action="Rachel + community design the format"
              status="pending"
            />
            <ItemCard
              tag="M8"
              title="Separate funder/sector briefing, same week"
              body="Half-day closed-doors session. Rachel chairs. Bwgcolman Way case study. Next-20 vision announcement. Peer CEO panel."
              action="30-50 invited guests, invitations 4-6 months ahead"
              status="pending"
            />
          </div>
        </section>

        {/* ─── ACCEPTED EXPANSIONS ─── */}
        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre">
              Accepted expansions (E1–E5)
            </h2>
            <span className="text-xs text-stone-400">
              opted in during review
            </span>
          </div>
          <div className="space-y-3">
            <ItemCard
              tag="E1"
              title="20 Voices for 20 Years — capture sprint"
              body="60 voices captured and approved before the celebration. One Elder, one staff, one young person per year 2005–2025. Each with photo, video, and written quote tied to a specific year."
              action="Starts this month. Must-capture list from Rachel + Narelle"
              status="accepted"
              highlight="Time-sensitive — some Elders may not be capturable in 12 months"
            />
            <ItemCard
              tag="E2"
              title="Physical archive — book + installation"
              body="80-page hardcover (100 copies) as the gift Rachel hands every Elder and partner. Simple year-by-year photo wall installation at The Centre. Permanent."
              action="Budget ~$30–45k. Design briefs Month 1."
              status="accepted"
            />
            <ItemCard
              tag="E3"
              title="Full funder/sector briefing session"
              body="Half-day event in celebration week. 30-50 invited guests: Philanthropy Australia, NIAA, federal ministers' offices, 3-5 peer First Nations CEOs, 2-3 major philanthropic funders."
              action="Rachel chairs. Invitations out 4-6 months ahead."
              status="accepted"
            />
            <ItemCard
              tag="E4"
              title="Year-by-year 2005→2025 timeline page"
              body="Interactive page on the new website. Every year with voices, photos, annual report excerpts, milestones. Primary entry point to picc.studio."
              action="Home for the 20 voices. Mandatory given E1."
              status="accepted"
            />
            <ItemCard
              tag="E5"
              title="Hull River long-form anchor piece"
              body="2,000-3,000 word written version + 20-minute audio documentary using Elder voices from the on-Country trips. The true frame: Palm Island's story, with PICC as its next chapter."
              action="Full Elder cultural sign-off required. Elder-led scoping first."
              status="accepted"
              highlight="Cultural sensitivity: Hull River is sacred ground"
            />
          </div>
        </section>

        {/* ─── DEFERRED ─── */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            Deferred and rejected
          </h2>
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="space-y-4 text-sm">
              <DeferredItem
                title="'20 Stories' youth interviewer commissions"
                reason="Skipped. Ben and Nic conduct interviews directly. Risk flagged: leaves zero youth involvement in production."
              />
              <DeferredItem
                title="National First Nations data sovereignty movement (Approach C)"
                reason="Too dependent on capacity and partners that don't exist yet. Revisit for 25-year mark."
              />
              <DeferredItem
                title="Multi-tenant Empathy Ledger platform expansion"
                reason="Out of scope. Not for this launch."
              />
              <DeferredItem
                title="Empathy Ledger as the public hero (Approach D)"
                reason="Rejected. The tech is invisible plumbing. Community voice is the hero."
              />
              <DeferredItem
                title="Full rebrand vs refresh"
                reason="Decision pending. Flag for Rachel — prefer refresh unless she pushes for full rebrand."
              />
            </div>
          </div>
        </section>

        {/* ─── CRITICAL GAPS ─── */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            Critical gaps — must close to ship
          </h2>
          <div className="space-y-3">
            <GapCard
              n="1"
              title="No weekly Elder approval cycle running yet"
              impact="Content cliff hits Month 6 if this doesn't start now. 669 voices pending."
              action="Start this week. Narelle + 3-5 Elders. 10 voices per session."
            />
            <GapCard
              n="2"
              title="No PICC internal day-to-day owner named"
              impact="Ben and Nic cannot own this without violating M4. Whole plan collapses without an internal lead."
              action="Rachel appoints in the meeting. Non-negotiable."
            />
            <GapCard
              n="3"
              title="No date committed"
              impact="Without a date, the whole plan is a dream. Every deadline slips."
              action="Email must force the date decision."
            />
            <GapCard
              n="4"
              title="Aged Care not integrated into the next-20 vision"
              impact="PICC's most urgent unresolved priority. Missing it makes the celebration feel hollow."
              action="Must feature in next-20 doc: 'Aged care on Palm by 2028.'"
            />
          </div>
        </section>

        {/* ─── ROLLOUT TIMELINE ─── */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            Rollout — working backwards from T-0
          </h2>
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
            <TimelineRow month="Now" milestone="Date decision + next-20 vision doc drafted" owner="Rachel meeting" />
            <TimelineRow month="Month 1" milestone="Elder approval cycle starts · Bwgcolman Way case study draft · 20 voices priority list" owner="Ben + Narelle" />
            <TimelineRow month="Month 2" milestone="Book + installation design briefs · Rebrand/refresh decision" owner="Ben + Rachel" />
            <TimelineRow month="Month 3" milestone="First 20 voices captured · Funder briefing invitations go out" owner="Ben + Narelle + community" />
            <TimelineRow month="Month 4" milestone="Hull River long-form draft + Elder review" owner="Elders + Ben" />
            <TimelineRow month="Month 5" milestone="Site build on staging · Book manuscript locked" owner="Ben + Nic" />
            <TimelineRow month="Month 6" milestone="40 of 60 voices approved" owner="Narelle + Elders" />
            <TimelineRow month="Month 7" milestone="Installation fabrication · Site community review" owner="Ben + community" />
            <TimelineRow month="Month 8" milestone="All 60 voices captured · Site go-live rehearsal" owner="All" />
            <TimelineRow month="Month 9" milestone="CELEBRATION WEEK — ceremony, briefing, launch" owner="Rachel + community" highlight />
            <TimelineRow month="Month 9 +1" milestone="Debrief circle with community — did they feel seen?" owner="Narelle" />
            <TimelineRow month="Month 9 +3" milestone="Funding commitments tracked from briefing" owner="Rachel" />
          </div>
        </section>

        {/* ─── WHAT WE NEED FROM RACHEL ─── */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            What we need from Rachel in the meeting
          </h2>
          <div className="rounded-2xl border-2 border-picc-ochre bg-picc-ochre/5 p-8">
            <p className="text-sm text-stone-600 mb-6 italic">
              All nine of these sit with Rachel. The email's job is to get her
              in the room. The meeting's job is to close these decisions.
            </p>
            <ol className="space-y-3">
              <Decision n="1" text="A specific date (or month) for the celebration" />
              <Decision n="2" text="Her commitment to write the next-20 years vision document" />
              <Decision n="3" text="Sign-off on the 'Ben + Nic behind the curtain' principle" />
              <Decision n="4" text="Full rebrand vs refresh" />
              <Decision n="5" text="Internal PICC day-to-day owner for execution" />
              <Decision n="6" text="Prioritisation of the 20 voices must-capture list" />
              <Decision n="7" text="Budget authorisation for the physical artefact (~$30–45k)" />
              <Decision n="8" text="Her willingness to chair the funder/sector briefing" />
              <Decision n="9" text="How Aged Care integrates into the next-20 vision" />
            </ol>
          </div>
        </section>

        {/* ─── THREE EMOTIONAL ARCS ─── */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            The emotional arc — who feels what
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <ArcCard
              audience="Community member"
              arrival="I am welcome here"
              centre="I am seen here"
              departure="This is ours, forever"
            />
            <ArcCard
              audience="Funder / Minister"
              arrival="I don't know much about Palm"
              centre="The Bwgcolman Way is world-first"
              departure="I want to be part of the next 20"
            />
            <ArcCard
              audience="Young Palm Islander"
              arrival="This is about old stuff"
              centre="I am in the timeline too"
              departure="My story belongs in the next one"
            />
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <section className="mt-20 pt-8 border-t border-stone-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-stone-500">
            <div>
              <p className="font-semibold text-stone-700 mb-1">
                Full plan document
              </p>
              <p>
                See <code className="px-1.5 py-0.5 bg-stone-100 rounded text-xs">
                  PICC-20-Year-Launchpad-Plan.md
                </code> at the repo root.
              </p>
            </div>
            <div className="text-right">
              <p>Generated 9 April 2026</p>
              <p className="italic">For Rachel + Narelle review</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────

function ApproachCard({
  letter,
  name,
  summary,
  pros,
  cons,
  score,
  selected = false,
}: {
  letter: string
  name: string
  summary: string
  pros: string[]
  cons: string[]
  score: string
  selected?: boolean
}) {
  return (
    <div
      className={`rounded-2xl p-6 transition-colors ${
        selected
          ? 'border-2 border-picc-ochre bg-white shadow-sm'
          : 'border border-stone-200 bg-white/60'
      }`}
    >
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-2xl text-picc-ochre">{letter}</span>
          <h3 className="font-semibold text-stone-800">{name}</h3>
        </div>
        {selected && (
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        )}
      </div>
      <p className="text-xs text-stone-600 leading-relaxed mb-4">{summary}</p>
      <div className="text-xs space-y-1.5">
        {pros.map((p) => (
          <div key={p} className="flex items-start gap-2 text-green-700">
            <span>+</span>
            <span>{p}</span>
          </div>
        ))}
        {cons.map((c) => (
          <div key={c} className="flex items-start gap-2 text-stone-500">
            <span>−</span>
            <span>{c}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-400">
        Completeness: <span className="font-semibold text-stone-700">{score}</span>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: any
  value: string
  label: string
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <Icon className="w-4 h-4 text-picc-ochre mb-3" />
      <p className="font-serif text-2xl text-stone-800">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{label}</p>
    </div>
  )
}

function ItemCard({
  tag,
  title,
  body,
  action,
  status,
  highlight,
}: {
  tag: string
  title: string
  body: string
  action: string
  status: 'pending' | 'critical' | 'accepted'
  highlight?: string
}) {
  const statusStyles = {
    pending: 'border-stone-200 bg-white',
    critical: 'border-amber-300 bg-amber-50/40',
    accepted: 'border-green-300 bg-green-50/30',
  }
  const tagStyles = {
    pending: 'bg-stone-100 text-stone-600',
    critical: 'bg-amber-100 text-amber-700',
    accepted: 'bg-green-100 text-green-700',
  }

  return (
    <div
      className={`rounded-2xl border p-6 transition-colors ${statusStyles[status]}`}
    >
      <div className="flex items-baseline gap-3 mb-2">
        <span
          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${tagStyles[status]}`}
        >
          {tag}
        </span>
        <h3 className="font-semibold text-stone-800 text-base">{title}</h3>
      </div>
      <p className="text-sm text-stone-600 leading-relaxed mb-3 ml-11">
        {body}
      </p>
      {highlight && (
        <div className="ml-11 mb-3 text-xs text-amber-700 flex items-start gap-1.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <span>{highlight}</span>
        </div>
      )}
      <div className="ml-11 text-xs text-picc-ochre font-medium flex items-center gap-1.5">
        <ChevronRight className="w-3 h-3" />
        <span>{action}</span>
      </div>
    </div>
  )
}

function DeferredItem({ title, reason }: { title: string; reason: string }) {
  return (
    <div className="flex items-start gap-3">
      <XCircle className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-stone-800 font-medium">{title}</p>
        <p className="text-stone-500 text-xs mt-0.5">{reason}</p>
      </div>
    </div>
  )
}

function GapCard({
  n,
  title,
  impact,
  action,
}: {
  n: string
  title: string
  impact: string
  action: string
}) {
  return (
    <div className="rounded-2xl border-2 border-red-300 bg-red-50/40 p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm">
          {n}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-stone-800 mb-1">{title}</h3>
          <p className="text-sm text-stone-600 mb-2">{impact}</p>
          <p className="text-xs text-red-700 font-medium flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>{action}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function TimelineRow({
  month,
  milestone,
  owner,
  highlight = false,
}: {
  month: string
  milestone: string
  owner: string
  highlight?: boolean
}) {
  return (
    <div
      className={`flex items-start gap-4 p-4 border-b border-stone-100 last:border-b-0 ${
        highlight ? 'bg-picc-ochre/5' : ''
      }`}
    >
      <div
        className={`w-20 flex-shrink-0 text-xs font-mono font-semibold ${
          highlight ? 'text-picc-ochre' : 'text-stone-400'
        }`}
      >
        {month}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm ${
            highlight ? 'font-semibold text-stone-800' : 'text-stone-700'
          }`}
        >
          {milestone}
        </p>
        <p className="text-xs text-stone-400 mt-0.5">{owner}</p>
      </div>
    </div>
  )
}

function Decision({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="font-mono font-bold text-picc-ochre flex-shrink-0 w-6">
        {n}.
      </span>
      <span className="text-stone-700">{text}</span>
    </li>
  )
}

function ArcCard({
  audience,
  arrival,
  centre,
  departure,
}: {
  audience: string
  arrival: string
  centre: string
  departure: string
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <p className="text-xs font-semibold tracking-wide uppercase text-picc-ochre mb-4">
        {audience}
      </p>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-stone-400 mb-0.5">Arrival</p>
          <p className="text-stone-700 italic">"{arrival}"</p>
        </div>
        <div>
          <p className="text-xs text-stone-400 mb-0.5">Centre</p>
          <p className="text-stone-700 italic">"{centre}"</p>
        </div>
        <div>
          <p className="text-xs text-stone-400 mb-0.5">Departure</p>
          <p className="text-stone-700 italic">"{departure}"</p>
        </div>
      </div>
    </div>
  )
}
